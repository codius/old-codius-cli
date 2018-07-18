const logger = require('riverpig')('codius-cli:view')
const { viewCron } = require('../../handlers/cron_handlers/view.js')
const { cronViewOptions } = require('../options/options.js')

exports.command = 'view [options]'
exports.desc = 'View existing cron jobs.'
exports.builder = cronViewOptions
exports.handler = async function (argv) {
  if (argv.all && argv.codiusStateFile) {
    logger.error('Arguments codius-state-file and all are mutually exclusive')
    process.exit(1)
  }
  logger.debug(`View cron args: ${JSON.stringify(argv)}`)
  viewCron(argv)
}
