const debug = require('debug')('codius-cli:config')
const { configOptions } = require('../cmds/options/options.js')
const { config } = require('../handlers/config.js')

exports.command = 'config <manifest> [options]'
exports.desc = 'Configures the manifest file'
exports.builder = configOptions
exports.handler = async function (argv) {
  debug(`config manifest: ${argv.manifest}`)
  await config(argv)
}
