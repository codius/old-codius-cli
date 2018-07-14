#!/usr/bin/env node

/* eslint-disable no-unused-expressions */
const yargs = require('yargs')

yargs.commandDir('../src/cmds')
  .help()
  .command('*', '', {}, argv => {
    console.error('Unknown Command, use --help for command options.')
    process.exit(1)
  })
  .implies('max-monthly-rate', 'units')
  .implies('units', 'max-monthly-rate')
  .implies('codius-file', 'codius-vars-file')
  .implies('codius-vars-file', 'codius-file')
  .choices('hours', [1, 2, 3, 4, 6, 12])
  .choices('minutes', [10, 12, 20, 30])
  .conflicts('hours', 'minutes')
  .argv
