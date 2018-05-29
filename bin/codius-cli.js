#!/usr/bin/env node
const chalk = require('chalk')
const CodiusCli = require('../src')
const Config = require('../src/config')
const debug = require('debug')('codius-cli')
const logger = require('riverpig')('codius-cli')

const yargs = require('yargs')
  .option('manifest', {
    alias: 'm',
    // TODO: set default manifest path
    type: 'string',
    description: 'Manifest file'
  })
  .option('nonce', {
    alias: 'n',
    type: 'boolean',
    default: false,
    description: 'Generate nonce for manifest hash'
  })
  .option('duration', {
    alias: 'd',
    type: 'number',
    default: 3600,
    description: 'Duration the contract should run (seconds)'
  })
  .option('max-price', {
    alias: 'mp',
    type: 'number',
    // TODO: set default max-price
    description: 'Max price for contract'
  })
  .option('hash-manifest', {
    alias: 'hm',
    type: 'boolean',
    default: false,
    description: 'Generate manifest hash'
  })
  .option('contract', {
    alias: 'c',
    type: 'string',
    description: 'Contract id to extend'
  })
  .command('start', 'Start contract upload process', {}, argv => {
    logger.info('uploading contract...')
  })
  .command('*', '', {}, argv => {
    debug('unknown command.')
    process.exit(1)
  }).argv
