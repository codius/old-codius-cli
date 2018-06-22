/**
 * @fileOverview
 * @name extend-hash.js<cmds>
 * @author Travis Crist
 */

const logger = require('riverpig')('codius-cli:extend-hash')
const { extendManifestOptions } = require('../cmds/options/options.js')
const { extendManifest } = require('../handlers/extend-hash.js')

exports.command = 'extend-hash <manifest-hash> [options]'
exports.desc = 'Extends the mainfest hash on the specified host with the provided options.'
exports.builder = extendManifestOptions
exports.handler = async function (argv) {
  logger.debug(`Extend hash args: ${JSON.stringify(argv)}`)
  await extendManifest(argv)
}
