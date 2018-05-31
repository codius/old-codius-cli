/**
 * @fileOverview Crypto utils for use in the codius cli.
 * @name crypto-utils.js
 * @author Travis Crist
 */

const { createHash } = require('crypto')
const { encode } = require('../common/base32.js')
const canonicalJson = require('canonical-json')

function hashManifest (manifest) {
  // TODO: is hex output what we want?
  const hashed = createHash('sha256')
    .update(canonicalJson(manifest), 'utf8')
    .digest()

  return encode(hashed)
}

module.exports = {
  hashManifest
}
