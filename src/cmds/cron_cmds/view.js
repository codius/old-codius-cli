const logger = require('riverpig')('codius-cli:view')
const { viewCron } = require('../../handlers/cron_handlers/view.js')
const { cronViewOptions } = require('../options/options.js')
const os = require('os')

exports.command = 'view [options]'
exports.desc = 'View existing cron jobs.'
exports.builder = cronViewOptions
exports.handler = async function (argv) {
  if (os.type() === 'Windows_NT') {
    logger.error('Command is not supported on Windows machines')
    process.exit(1)
  }
  logger.debug(`View cron args: ${JSON.stringify(argv)}`)
  viewCron(argv)
}
