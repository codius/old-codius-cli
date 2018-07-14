const logger = require('riverpig')('codius-cli:view.js')

exports.command = 'view [options]'
exports.desc = 'View existing cron jobs.'
exports.builder = {}
exports.handler = async function (argv) {
  logger.debug(`View cron args: ${JSON.stringify(argv)}`)
}
