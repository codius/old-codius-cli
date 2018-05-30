#!/usr/bin/env node
const chalk = require('chalk')
const CodiusCli = require('../src')
const Config = require('../src/config')
const debug = require('debug')('codius-cli')
const logger = require('riverpig')('codius-cli')

const yargs = require('yargs')
   .commandDir('../src/cmds')
      .help()
      .command('*', '', {}, argv => {
        debug('unknown command.')
        process.exit(1)
      }).argv
