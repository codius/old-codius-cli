const logger = require('riverpig')('codius-cli:create.js')
const { cronExtendOptions } = require('../../cmds/options/options.js')
const { createCron } = require('../../handlers/cron_handlers/create.js')

exports.command = 'create [options]'
exports.desc = 'Create a new cron job to extend a pod.'
exports.builder = cronExtendOptions
exports.handler = async function (argv) {
  logger.debug(`Create cron args: ${JSON.stringify(argv)}`)
  await createCron(argv)
}
