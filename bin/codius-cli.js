#!/usr/bin/env node
const chalk = require('chalk')
const Config = require('../src/config')
const debug = require('debug')('codius-cli')
const logger = require('riverpig')('codius-cli')

const yargs = require('yargs')
   .commandDir('../src/cmds')
      .help()
      .command('*', '', {}, argv => {
        debug('unknown command.')
        process.exit(1)
      })
      .conflicts('host', 'host-number')
      .implies('max-monthly-price', 'units')
      .implies('units', 'max-monthly-price')
      .argv
