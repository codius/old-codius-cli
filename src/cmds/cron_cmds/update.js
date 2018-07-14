const logger = require('riverpig')('codius-cli:update.js')

exports.command = 'update [options]'
exports.desc = 'Update an existing cron job.'
exports.builder = {}
exports.handler = async function (argv) {
  logger.debug(`Update cron args: ${JSON.stringify(argv)}`)
}
