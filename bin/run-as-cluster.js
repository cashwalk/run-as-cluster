#!/usr/bin/env node

const { Command } = require('commander');
const { runAsCluster } = require('..');

const program = new Command();

program
  .name('run-as-cluster')
  .argument('<script>', 'script to run')
  .action((script) => {
    runAsCluster(script);
  })
  .showHelpAfterError()
  .parse(process.argv);
