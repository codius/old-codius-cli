/**
 * @fileOverview
 * @name tail.js
 * @author Travis Crist
 */

const logger = require('riverpig')('codius-cli:tail')
const { tailOptions } = require('../cmds/options/options.js')
const { tail } = require('../handlers/tail.js')

exports.command = 'tail [manifest-hash] [options]'
exports.desc = 'Tails the pods logs based on the *.codiusstate.json file located in the current directory. Upload must first be used to generate the *.codiusstate.json file with the --debug flag used. Also tails the host specified by the manifest hash and the host name.'
exports.builder = tailOptions
exports.handler = async function (argv) {
  logger.debug(`Tail args: ${JSON.stringify(argv)}`)
  await tail(argv)
}
