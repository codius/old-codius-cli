const debug = require('debug')('codius-cli:config')
const { configOptions } = require('../cmds/options/options.js')

exports.command = 'config <manifest> [options]'
exports.desc = 'Configures the manifest file'
exports.builder = configOptions
exports.handler = function (argv) {
  debug(`config manifest: ${argv.manifest}`)
}
