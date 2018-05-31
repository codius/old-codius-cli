const { hash } = require('../handlers/hash.js')

exports.command = 'hash <manifest>'
exports.desc = 'Hashes the manifest file'
exports.builder = {}
exports.handler = function (argv) {
  return hash(argv)
}
