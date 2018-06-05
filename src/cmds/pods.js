/**
 * @fileOverview Lists all uploaded manifests by the cli and allows looking up the full manifest json file
 * @name pods.js
 * @author Travis Crist
 */

const debug = require('debug')('codius-cli:pods')
const { podsOptions } = require('../cmds/options/options.js')
const { pods } = require('../handlers/pods.js')

exports.command = 'pods [options]'
exports.desc = 'Retrieves Uploaded Pod Manifests and expiry times from local database'
exports.builder = podsOptions
exports.handler = async function (argv) {
  debug(`Pods args: ${JSON.stringify(argv, null, 2)}`)
  await pods(argv)
}
