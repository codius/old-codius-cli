const logger = require('riverpig')('codius-cli:remove')
const { removeCron } = require('../../handlers/cron_handlers/remove.js')
const { cronRemoveOptions } = require('../options/options.js')

exports.command = 'remove [options]'
exports.desc = 'Remove an existing cron job.'
exports.builder = cronRemoveOptions
exports.handler = async function (argv) {
  logger.debug(`Remove cron args: ${JSON.stringify(argv)}`)
  removeCron(argv)
}
