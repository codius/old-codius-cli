#!/usr/bin/env node

/* eslint-disable no-unused-expressions */
const yargs = require('yargs')

yargs.commandDir('../src/cmds')
  .help()
  .command('*', '', {}, argv => {
    console.error('Unknown Command, use --help for command options.')
    process.exit(1)
  })
  .conflicts('host', 'host-count')
  .implies('max-monthly-rate', 'units')
  .implies('units', 'max-monthly-rate')
  .implies('codius-file', 'codius-vars-file')
  .implies('codius-vars-file', 'codius-file')
  .argv
