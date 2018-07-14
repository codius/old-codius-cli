exports.command = 'cron [create|update|view|remove] [options]'
exports.desc = 'Automatically extend pods using crontab.'
exports.builder = function (yargs) {
  return yargs.commandDir('cron_cmds')
}
