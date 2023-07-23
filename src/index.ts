import cluster from 'node:cluster';
import { existsSync } from 'node:fs';
import * as os from 'node:os';
import { resolve } from 'node:path';

export function runAsCluster(script: string) {
  if (cluster.isPrimary) {
    handlePrimaryAction(script);
  } else {
    handleWorkerAction(script);
  }
}

function handlePrimaryAction(script: string) {
  console.log(`Primary ${process.pid} is running`);

  if (!existsSync(script)) {
    console.error(`script ${script} does not exist`);
    process.exit(1);
  }

  const parallelism =
    typeof os.availableParallelism === 'function'
      ? os.availableParallelism()
      : os.cpus().length;

  for (let i = 0; i < parallelism; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} has been killed`);
    console.log('Starting another worker');
    cluster.fork();
  });
}

function handleWorkerAction(script: string) {
  console.log(`Worker ${process.pid} started`);

  const absPath = resolve(script);

  const index = process.argv.indexOf('--');

  process.argv = [
    process.execPath,
    absPath,
    ...(index >= 0 ? process.argv.slice(index + 1) : []),
  ];

  require(absPath);
}
