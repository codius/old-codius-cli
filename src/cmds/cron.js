const logger = require('riverpig')('codius-cli:create')
const os = require('os')

exports.command = 'cron [create|view|remove] [options]'
exports.desc = 'Automatically extend pods using crontab.'
exports.builder = function (yargs) {
  return yargs.commandDir('cron_cmds')
}
exports.handler = function (argv) {
  if (os.type() === 'Windows_NT') {
    logger.error('Command is not supported on Windows machines')
    process.exit(1)
  }
}
