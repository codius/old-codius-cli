/**
 * @fileOverview Generates the manifest hash
 * @name hash.js<handlers>
 * @author Travis Crist
 */

const { hashManifest } = require('../common/crypto-utils.js')
const fs = require('fs')

function hash ({ manifest }) {
  const manifestFile = JSON.parse(fs.readFileSync(manifest))
  console.log(hashManifest(manifestFile))
}

module.exports = {
  hash
}
