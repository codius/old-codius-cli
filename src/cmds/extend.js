/**
 * @fileOverview
 * @name extend.js<cmds>
 * @author Travis Crist
 */

const logger = require('riverpig')('codius-cli:extend')
const { extendOptions } = require('../cmds/options/options.js')
const { extend } = require('../handlers/extend.js')

exports.command = 'extend [options]'
exports.desc = 'Extends the pod based on the *.codiusstate.json file located in the current directory. Options overwrites original options used for upload which are located in the *.codiusstate.json file. Upload must first be used to generate the *.codiusstate.json file.'
exports.builder = extendOptions
exports.handler = async function (argv) {
  logger.debug(`Extend args: ${JSON.stringify(argv)}`)
  await extend(argv)
}
