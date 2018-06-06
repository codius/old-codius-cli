/**
 * @fileOverview
 * @name upload.js<cmds>
 * @author Travis Crist
 */

const debug = require('debug')('codius-cli:upload')
const { uploadOptions } = require('../cmds/options/options.js')
const { upload } = require('../handlers/upload.js')

exports.command = 'upload <manifest> [options]'
exports.desc = 'Uploads the contract after validating the manifest'
exports.builder = uploadOptions
exports.handler = async function (argv) {
  debug(`Upload manifest args: ${JSON.stringify(argv, null, 2)}`)
  await upload(argv)
}
