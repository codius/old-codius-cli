const logger = require('riverpig')('codius-cli:remove')
const { removeCron } = require('../../handlers/cron_handlers/remove.js')
const { cronRemoveOptions } = require('../options/options.js')
const os = require('os')

exports.command = 'remove [options]'
exports.desc = 'Remove an existing cron job.'
exports.builder = cronRemoveOptions
exports.handler = async function (argv) {
  if (os.type() === 'Windows_NT') {
    logger.error('Command is not supported on Windows machines')
    process.exit(1)
  }
  logger.debug(`Remove cron args: ${JSON.stringify(argv)}`)
  removeCron(argv)
}
