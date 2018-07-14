const logger = require('riverpig')('codius-cli:remove.js')

exports.command = 'remove [options]'
exports.desc = 'Remove an existing cron job.'
exports.builder = {}
exports.handler = async function (argv) {
  logger.debug(`Remove cron args: ${JSON.stringify(argv)}`)
}
