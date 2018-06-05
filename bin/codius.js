#!/usr/bin/env node

/* eslint-disable no-unused-expressions */
const yargs = require('yargs')
const debug = require('debug')('codius-cli')

yargs.commandDir('../src/cmds')
  .help()
  .command('*', '', {}, argv => {
    console.error('Unknown Command, use --help for command options.')
    process.exit(1)
  })
  .conflicts('host', 'host-count')
  .implies('max-monthly-price', 'units')
  .implies('units', 'max-monthly-price')
  .argv
