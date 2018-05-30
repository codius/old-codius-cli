const debug = require('debug')('codius-cli:extend')
const { extendOptions } = require('../cmds/options/options.js')

exports.command = 'extend <manifest> [options]'
exports.desc = 'Extends the contract by the specified duration'
exports.builder = extendOptions
exports.handler = function (argv) {
  debug(`extend manifest: ${argv.manifest}`)
}
