/**
 * @fileOverview
 * @name extend.js
 * @author Travis Crist
 */

const debug = require('debug')('codius-cli:extendHandler')
const { uploadToHosts, updateDatabaseWithHosts } = require('../handlers/upload.js')
const { hashManifest } = require('../common/crypto-utils.js')
const fse = require('fs-extra')
const db = require('../common/cli-db.js')

function getUploadHosts (manifestObj) {
  let uploadHosts = []
  for (const host in manifestObj.hosts) {
    uploadHosts.push(host)
  }
  debug(`Found Hosts to upload: ${uploadHosts}`)
  return uploadHosts
}

async function extend (options) {
  try {
    const manifestJson = await fse.readJson(options.manifest)
    const manifestHash = hashManifest(manifestJson.manifest)
    const manifestObj = await db.getManifestData(manifestHash)

    const uploadHosts = getUploadHosts(manifestObj)
    // TODO: Add prompting to confirm upload to the hosts
    const respObj = await uploadToHosts(options, manifestJson, uploadHosts)
    await updateDatabaseWithHosts(manifestJson, respObj)

    process.exit(0)
  } catch (err) {
    debug(err)
    process.exit(1)
  }
}

module.exports = {
  extend
}
