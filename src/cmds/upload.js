const debug = require('debug')('codius-cli:upload')
const { uploadOptions } = require('../cmds/options/options.js')
const { upload } = require('../handlers/upload.js')

exports.command = 'upload <manifest> [options]'
exports.desc = 'Uploads the contract after validating the manifest'
exports.builder = uploadOptions
exports.handler = async function (argv) {
  debug(`upload manifest: ${argv.manifest}`)
  debug(`upload manifest args: ${JSON.stringify(argv)}`)
  await upload(argv)
}
