/**
 * @fileOverview Host Discovery
 * @name discovery.js
 * @author Travis Crist
 */

const db = require('../common/cli-db.js')
const axios = require('axios')
const debug = require('debug')('codius-cli:discovery')
const sampleSize = require('lodash.samplesize')

const HOSTS_PER_DISCOVERY = 5

async function findHosts () {
  const hostSample = sampleSize(await db.getHosts(), HOSTS_PER_DISCOVERY)
  for (const host of hostSample) {
    try {
      const res = await axios.get(host + '/peers')
      await db.addHosts(res.data.peers)
    } catch (err) {
      db.removeHost(host)
    }
  }
  const hostList = await db.getHosts()
  debug(`Host List: ${JSON.stringify(hostList)}`)
  return hostList
}

async function discoverHosts () {
  // try 4 times but bail if the # of hosts is not increasing
  let hostCount = 0
  for (let i = 0; i < 4; i++) {
    const hostList = await findHosts()
    if (hostCount === hostList.length) {
      return
    }
    hostCount = hostList.length
  }
}

async function selectDistributedHosts ({ host, hostCount = 1 }) {
  // TODO: Use the ASN Map at https://iptoasn.com/ probably store locally to choose distributed hosts as an array to be used for upload. For now just return a random sample based on the count
  let uploadHosts = []
  if (!host) {
    uploadHosts = sampleSize(await db.getHosts(), hostCount)
  } else {
    // Singular host options are a string so we have to make them into an array
    if (typeof host === 'string') {
      uploadHosts = [host]
    } else {
      uploadHosts = host
    }
  }
  debug(`Hosts for upload: ${uploadHosts}`)
  return uploadHosts
}

module.exports = {
  discoverHosts,
  selectDistributedHosts
}
