/**
 * @fileOverview Generates the manifest hash
 * @name hash.js<handlers>
 * @author Travis Crist
 */

const { hashManifest } = require('../common/crypto-utils.js')
const fse = require('fs-extra')

async function hash ({ manifest }) {
  const manifestField = (await fse.readJson(manifest)).manifest
  console.log(hashManifest(manifestField))
}

module.exports = {
  hash
}
