const logger = require('riverpig')('codius-cli:create')
const { cronExtendOptions } = require('../../cmds/options/options.js')
const { createCron } = require('../../handlers/cron_handlers/create.js')

exports.command = 'create [options]'
exports.desc = 'Create a new cron job to extend a pod.'
exports.builder = cronExtendOptions
exports.handler = async function (argv) {
  if (!argv.bufferSec && !argv.skipExtend) {
    logger.error('Must specify a buffer or use the `--skip-extend` flag to skip the initial pod extend step.')
    process.exit(1)
  }
  logger.debug(`Create cron args: ${JSON.stringify(argv)}`)
  await createCron(argv)
}
