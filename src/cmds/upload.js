const debug = require('debug')('codius-cli:upload')
const { uploadOptions } = require('../cmds/options/options.js')

exports.command = 'upload <manifest> [options]'
exports.desc = 'Uploads the contract after validating the manifest'
exports.builder = uploadOptions
exports.handler = function (argv) {
  debug(`upload manifest: ${argv.manifest}`)
}
