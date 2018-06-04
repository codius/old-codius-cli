/**
 * @fileOverview Handles the pods command options
 * @name pods.js<handlers>
 * @author Travis Crist
 */

const db = require('../common/cli-db.js')
const moment = require('moment')

async function pods ({ list, getPodManifest }) {
  if (list) {
    const manifestHashes = await db.getManifestHashes()
    let formattedArray = []
    for (const hash of manifestHashes) {
      const manifestObj = await db.getManifestData(hash)
      for (const host in manifestObj.hosts) {
        manifestObj.hosts[host].expires = moment().to(moment(manifestObj.hosts[host].expiry))
      }
      const formattedObj = {
        manifestHash: hash,
        hosts: manifestObj.hosts
      }
      formattedArray.push(formattedObj)
    }
    console.log(JSON.stringify(formattedArray, null, 2))
  } else if (getPodManifest) {
    const manifestData = await db.getManifestData(getPodManifest)
    console.log(JSON.stringify(manifestData.manifest, null, 2))
  } else {
    console.log('Error: no options passed into the pods command, please use \'pods --help\' to see available options')
  }
}

module.exports = {
  pods
}
