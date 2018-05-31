/**
 * @fileOverview Handler to upload codius contract to network
 * @name upload.js<handlers>
 * @author Travis Crist
 */

const axios = require('axios')
const CliDB = require('../CliDB.js')
const sampleSize = require('lodash.samplesize')
const debug = require('debug')('codius-cli:uploadHandler')

const HOSTS_PER_DISCOVERY = 5

async function discoverHosts () {
  this.db = new CliDB()
  await this.db.init()
  const hostSample = sampleSize(await this.db.getHosts(), HOSTS_PER_DISCOVERY)
  for (const host of hostSample) {
    const res = await axios.get(host + '/peers')
    debug(`Host: ${host}/peers Response: ${res.data.peers}`)
    await this.db.addHosts(res.data.peers)
  }
  debug(`Host List: ${JSON.stringify(await this.db.getHosts())}`)
}

function selectDistributedHosts (hosts = 1) {
  // TODO: Use the ASN Map at https://iptoasn.com/ probably store locally to choose distributed hosts as an array to be used for upload.
}

function upload ({ manifest, maxPrice, duration, hosts, noPrompt }) {
  discoverHosts()
  //const uploadHosts = selectDistributedHosts(hosts)
  // TODO: Validate the Manifest here
  // TODO: If the --add-host-env flag is used add all the hosts to the
  // manifest under the $HOSTS variable as an array
  // TODO: Generate the hash of the manifest

}

module.exports = {
  upload
}
