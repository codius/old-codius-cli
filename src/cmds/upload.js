/**
 * @fileOverview
 * @name upload.js<cmds>
 * @author Travis Crist
 */
const logger = require('riverpig')('codius-cli:upload')
const { uploadOptions } = require('../cmds/options/options.js')
const { upload } = require('../handlers/upload.js')

exports.command = 'upload [options]'
exports.desc = 'Generates the *.codiusstate manifest from codius.json & codiusvars.json then uploads the pod to a random # of host(s) or a specific set of host(s)'
exports.builder = uploadOptions
exports.handler = async function (argv) {
  logger.debug(`Upload manifest args: ${JSON.stringify(argv)}`)
  await upload(argv)
}
