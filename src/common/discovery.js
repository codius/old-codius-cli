/**
 * @fileOverview Host Discovery
 * @name discovery.js
 * @author Travis Crist
 */

const axios = require('axios')
const logger = require('riverpig')('codius-cli:discovery')
const sampleSize = require('lodash.samplesize')
const config = require('../config.js')
const { checkStatus } = require('../common/utils.js')

const HOSTS_PER_DISCOVERY = 4
const DISCOVERY_ATTEMPTS = 15

async function fetchHostPeers (host) {
  try {
    const res = await axios.get(`${host}/peers`, {
      headers: { Accept: `application/codius-v${config.version.codius.min}+json` },
      timeout: 30000
    })
    if (checkStatus(res)) {
      return { host, peers: res.data.peers }
    } else {
      return {
        host,
        error: res.error.toString() || 'Unknown Error Occurred',
        text: await res.text() || '',
        status: res.status || ''
      }
    }
  } catch (err) {
    return { host, error: err.toString() }
  }
}

async function findHosts (hostSample) {
  logger.debug(`Sending Peer Requests to Hosts: ${JSON.stringify(hostSample)}`)
  const fetchHostPeerPromises = hostSample.map((host) => fetchHostPeers(host))
  const responses = await Promise.all(fetchHostPeerPromises)
  const results = await responses.reduce((acc, curr) => {
    if (curr.error) {
      acc.failed = [...acc.failed, curr.host]
    } else {
      acc.success = [...acc.success, ...curr.peers]
    }
    return acc
  }, { success: [], failed: [] })
  return results
}

async function discoverHosts (targetCount) {
  let hostCount = 0
  let hostList = config.peers
  let badHosts = []
  for (let i = 0; i < DISCOVERY_ATTEMPTS; i++) {
    const hostSample = sampleSize(hostList, HOSTS_PER_DISCOVERY).filter((host) => !badHosts.includes(host))
    const results = await findHosts(hostSample)
    logger.debug(`Host Discovery Attempt# ${i + 1}, Failed: ${JSON.stringify(results.failed)}`)
    hostList = [...new Set([...hostList, ...results.success])]
    badHosts = [...new Set([...badHosts, ...results.failed])]
    if (hostCount === hostList.length || (targetCount && hostList.length >= targetCount)) {
      logger.debug(`Host Discovery Complete, found ${hostList.length} hosts}`)
      return hostList
    }
    hostCount = hostList.length
  }
  logger.debug(`Host Discovery Complete, found ${hostList.length} hosts}`)
  return hostList
}

module.exports = {
  discoverHosts
}
