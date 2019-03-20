/**
 * @fileOverview
 * @name hosts-utils.js
 * @author Travis Crist
 */

const fetch = require('node-fetch')
const logger = require('riverpig')('codius-cli:host-utils')
const config = require('../config.js')
const BigNumber = require('bignumber.js')
const sampleSize = require('lodash.samplesize')
const { getCurrencyDetails, getPrice } = require('../common/price.js')
const { URL } = require('url')
const { fetchPromise } = require('../common/utils.js')
const moment = require('moment')
const BATCH_SIZE = 30

function cleanHostListUrls (hosts) {
  let hostList
  // Singular host options are a string so we have to make them into an array
  if (typeof hosts === 'string') {
    hostList = [hosts]
  } else {
    hostList = hosts
  }

  return hostList.map(host => {
    if (!host.startsWith('http://') && !host.startsWith('https://')) {
      host = `https://${host}`
    }
    try {
      const url = new URL(host)
      return url.origin
    } catch (err) {
      throw new Error(err)
    }
  })
}

async function fetchHostPrice (host, duration, manifestJson) {
  const fetchFunction = fetch(`${host}/pods?duration=${duration}`, {
    headers: {
      Accept: `application/codius-v${config.version.codius.min}+json`,
      'Content-Type': 'application/json',
      'Pay-Accept': 'interledger-stream'
    },
    method: 'POST',
    body: JSON.stringify(manifestJson),
    timeout: 10000 // 10s
  })
  return fetchPromise(fetchFunction, host)
}

async function checkHostsPrices (fetchHostPromises, maxPrice) {
  logger.debug(`Fetching host prices from ${fetchHostPromises.length} host(s)`)
  const responses = await Promise.all(fetchHostPromises)
  const currency = await getCurrencyDetails()
  const results = await responses.reduce(async (acc, curr) => {
    if (!curr.headers.get('interledger-stream-asset-code') || !curr.headers.get('interledger-stream-asset-scale')) {
      const errorMessage = {
        message: 'Quote is missing asset code and scale.',
        host: curr.host
      }
      acc.failed.push(errorMessage)
      return acc
    }
    const unscaledQuote = new BigNumber(curr.headers.get('interledger-stream-price')).dividedBy(Math.pow(10, curr.headers.get('interledger-stream-asset-scale')))
    const hostPrice = await getPrice(unscaledQuote, curr.headers.get('interledger-stream-asset-code'))
    if (!hostPrice.lte(maxPrice)) {
      const errorMessage = {
        message: 'Quoted price exceeded specified max price, please increase your max price.',
        host: curr.host,
        quotedPrice: `${hostPrice.toString()} ${currency}`,
        maxPrice: `${maxPrice.toString()} ${currency}`
      }
      acc.failed.push(errorMessage)
    } else {
      acc.success.push(curr)
    }
    return acc
  }, { success: [], failed: [] })
  return results
}

async function gatherMatchingValidHosts ({ duration, hostCount = 1 }, hostList, maxPrice, manifestJson) {
  let validHosts = []
  const maxAttempts = hostList.length
  let attemptCount = 0
  let invalidHosts = []

  while (validHosts.length < hostCount && attemptCount < maxAttempts) {
    logger.debug(`Valid Hosts Found: ${validHosts.length}, attemptCount: ${attemptCount} need: ${hostCount} host(s) maxAttempts: ${maxAttempts}`)
    const candidateHosts = sampleSize(hostList, hostCount < BATCH_SIZE ? hostCount : BATCH_SIZE).filter((host) => !invalidHosts.includes(host))
    logger.debug(`Candidate Hosts: ${candidateHosts}`)
    logger.debug(`InvalidHosts: ${invalidHosts}`)
    attemptCount += candidateHosts.length
    const fetchPromises = candidateHosts.map((host) => fetchHostPrice(host, duration, manifestJson))
    const priceCheckResults = await checkHostsPrices(fetchPromises, maxPrice)
    if (priceCheckResults.success.length > 0) {
      validHosts = [...new Set([...validHosts, ...priceCheckResults.success.map((obj) => obj.host)])]
    }

    if (priceCheckResults.failed.length > 0) {
      invalidHosts = [...new Set([...invalidHosts, ...priceCheckResults.failed.map((obj) => obj.host)])]
    }
  }
  if (validHosts.length < hostCount) {
    const error = {
      message: `Unable to find ${hostCount} hosts with provided max price. Found ${validHosts.length} matching host(s)`,
      invalidHosts: invalidHosts
    }
    throw new Error(JSON.stringify(error))
  }
  logger.debug(`Validated Price successfully against ${validHosts.length}`)
  const uploadHosts = validHosts.slice(0, hostCount)
  logger.debug(`Using ${uploadHosts.length} for upload`)
  return uploadHosts
}

async function checkPricesOnHosts (hosts, duration, maxPrice, manifestJson) {
  const fetchPromises = hosts.map((host) => fetchHostPrice(host, duration, manifestJson))
  const priceCheckResults = await checkHostsPrices(fetchPromises, maxPrice)
  if (priceCheckResults.failed.length !== 0) {
    throw new Error(JSON.stringify(priceCheckResults.failed, null, 2))
  }
  return hosts
}

async function getValidHosts (options, hostOpts) {
  let uploadHosts = []
  if (options.host || (hostOpts.codiusHostsExists && !options.hostCount)) {
    await checkPricesOnHosts(hostOpts.hostList, options.duration, hostOpts.maxPrice, hostOpts.manifestJson)
    uploadHosts = hostOpts.hostList
  } else {
    uploadHosts = await gatherMatchingValidHosts(options, hostOpts.hostList, hostOpts.maxPrice, hostOpts.manifestJson)
  }

  return uploadHosts
}

function getHostsStatus (codiusStateJson) {
  const hostList = codiusStateJson.hostList
  const hostDetails = codiusStateJson.status ? codiusStateJson.status.hostDetails : null
  return hostList.map(host => {
    if (hostDetails && hostDetails[host]) {
      const hostInfo = hostDetails[host]
      return {
        host,
        expirationDate: hostInfo.expirationDate,
        'expires/expired': moment().to(moment(hostInfo.expirationDate, 'MM-DD-YYYY HH:mm:ss Z')),
        totalPricePaid: `${hostInfo.price.totalPaid} ${hostInfo.price.units}`
      }
    } else {
      return {
        host,
        message: 'No Existing Host Details for this host.'
      }
    }
  })
}

function getHostList ({ host, manifestHash }) {
  let hostsArr = []
  if (!host) {
    const potentialHost = manifestHash.split('.')
    potentialHost.shift()
    if (potentialHost.length <= 0) {
      throw new Error(`The end of ${manifestHash} is not a valid url. Please use the format <manifesth-hash.hostName> to specify the specific pod to extend or the --host parameter.`)
    }
    console.log(potentialHost)
    hostsArr = [`https://${potentialHost.join('.')}`]
  } else {
    hostsArr = host
  }

  return cleanHostListUrls(hostsArr)
}

module.exports = {
  cleanHostListUrls,
  getValidHosts,
  checkPricesOnHosts,
  getHostsStatus,
  getHostList
}
