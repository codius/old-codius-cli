const debug = require('debug')('codius-cli:extend')
const { extendOptions } = require('../cmds/options/options.js')
const { extend } = require('../handlers/extend.js')

exports.command = 'extend <manifest> [options]'
exports.desc = 'Extends the contract by the specified duration'
exports.builder = extendOptions
exports.handler = async function (argv) {
  debug(`Extend manifest args: ${JSON.stringify(argv, null, 2)}`)
  await extend(argv)
}
