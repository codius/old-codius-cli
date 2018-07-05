/**
 * @fileOverview
 * @name manifest-upload.js
 * @author Travis Crist
 */

const logger = require('riverpig')('codius-cli:manifest-upload')
const fetch = require('ilp-fetch')
const config = require('../config.js')
const moment = require('moment')
const { getCurrencyDetails } = require('../common/price.js')
const jsome = require('jsome')
const { checkStatus, fetchPromise } = require('../common/utils.js')
const FETCH_TIMEOUT = 70000 // 1m10s

function getParsedResponses (responses, currency, status) {
  const parsedResponses = responses.reduce((acc, curr) => {
    const res = curr.response || curr
    if (checkStatus(curr)) {
      const successObj = {
        url: res.url,
        manifestHash: res.manifestHash,
        host: curr.host,
        expiry: res.expiry,
        expirationDate: moment(res.expiry).format('MM-DD-YYYY HH:mm:ss ZZ'),
        expires: moment().to(moment(res.expiry)),
        pricePaid: curr.price,
        units: currency
      }
      acc.success = [...acc.success, successObj]
    } else {
      const failedObj = {
        host: curr.host,
        error: curr.error,
        response: curr.text || undefined,
        statusCode: curr.status || undefined,
        statusText: curr.message || undefined
      }
      acc.failed = [...acc.failed, failedObj]
    }
    return acc
  }, { success: [], failed: [] })

  if (parsedResponses.success.length > 0) {
    parsedResponses.success.map((obj) => {
      status.succeed(`Upload to ${obj.host} Successful`)
      jsome(obj)
    })
  }

  if (parsedResponses.failed.length > 0) {
    parsedResponses.failed.map((obj) => {
      status.fail(`Upload to ${obj.host} Failed`)
      jsome(obj)
    })
  }

  console.info(config.lineBreak)
  if (parsedResponses.success.length > 0) {
    status.succeed(`${parsedResponses.success.length} Successful Uploads`)
  }

  if (parsedResponses.failed.length > 0) {
    status.fail(`${parsedResponses.failed.length} Failed Uploads`)
  }

  if (parsedResponses.success.length > 0) {
    status.stopAndPersist({ symbol: 'o', text: `Manifest Hash: ${parsedResponses.success[0].manifestHash}` })
  }

  return parsedResponses
}

async function fetchUploadManifest (host, duration, maxMonthlyRate, manifestJson) {
  const fetchFunction = fetch(`${host}/pods?duration=${duration}`, {
    headers: {
      Accept: `application/codius-v${config.version.codius.min}+json`,
      'Content-Type': 'application/json'
    },
    maxPrice: maxMonthlyRate.toString(),
    method: 'POST',
    body: JSON.stringify(manifestJson),
    timeout: FETCH_TIMEOUT
  })
  return fetchPromise(fetchFunction, host, FETCH_TIMEOUT)
}

async function extendManifestByHashOnHosts (host, duration, maxMonthlyRate, manifestHash) {
  const fetchFunction = fetch(`${host}/pods?manifestHash=${manifestHash}&duration=${duration}`, {
    headers: {
      Accept: `application/codius-v${config.version.codius.min}+json`
    },
    maxPrice: maxMonthlyRate.toString(),
    method: 'PUT',
    timeout: FETCH_TIMEOUT
  })
  return fetchPromise(fetchFunction, host, FETCH_TIMEOUT)
}

async function uploadManifestToHosts (status, hosts, duration, maxMonthlyRate, manifestJson) {
  const currency = await getCurrencyDetails()
  logger.debug(`Upload to Hosts: ${JSON.stringify(hosts)} Duration: ${duration}`)
  const uploadPromises = hosts.map((host) => {
    return fetchUploadManifest(host, duration, maxMonthlyRate, manifestJson)
  })
  const responses = await Promise.all(uploadPromises)
  return getParsedResponses(responses, currency, status)
}

async function extendManifestByHash (status, hosts, duration, maxMonthlyRate, manifestHash) {
  const currency = await getCurrencyDetails()
  logger.debug(`Extending manifest hash ${manifestHash} on Hosts: ${JSON.stringify(hosts)} Duration: ${duration}`)
  const extendPromises = hosts.map((host) => {
    return extendManifestByHashOnHosts(host, duration, maxMonthlyRate, manifestHash)
  })
  const responses = await Promise.all(extendPromises)
  return getParsedResponses(responses, currency, status)
}

module.exports = {
  uploadManifestToHosts,
  extendManifestByHash
}
