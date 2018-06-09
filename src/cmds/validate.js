const debug = require('debug')('codius-cli:validate')
const { validate } = require('../handlers/validate.js')

exports.command = 'validate <manifest>'
exports.desc = 'Validates the manifest file'
exports.builder = {}
exports.handler = async function (argv) {
  debug(`validate manifest: ${argv.manifest}`)
  await validate(argv)
}
