/**
 * @fileOverview Handler to upload codius contract to network
 * @name upload.js<handlers>
 * @author Travis Crist
 */

const debug = require('debug')('codius-cli:uploadHandler')
const fetch = require('ilp-fetch')
const fse = require('fs-extra')
const { unitsPerHost } = require('../common/price.js')
const moment = require('moment')
const BigNumber = require('bignumber.js')
const db = require('../common/cli-db.js')
const { discoverHosts, selectDistributedHosts } = require('../common/discovery.js')
const { hashManifest } = require('../common/crypto-utils.js')

function checkOptions ({ hostCount, addHostEnv }) {
  // If the host number is set but the add host env is not specified warn the user
  if (hostCount && !addHostEnv) {
    console.warn('WARNING - Hosts will NOT be added to the $HOSTS env var in the manifest.')
    console.warn('Add the option --add-host-env to save the selected hosts to $HOSTS')
    // TODO: Prompt user here using inquirer?
  }
}

async function addHostsToManifest ({ manifest, addHostEnv }, manifestJson, hosts) {
  if (addHostEnv) {
    debug('Adding hosts to $HOST env in manifest')
    const containers = manifestJson.manifest.containers
    for (const container of containers) {
      console.log(container.environment.HOSTS)
      if (container.environment.HOSTS) {
        console.error('Error: HOSTS env variable already exists in a container. Option --add-hosts-env cannot be used if the HOSTS env already exists in any container.')
        throw new Error('HOSTS env variable already exists in a container.')
      }
      container.environment = container.environment || {}
      container.environment.HOSTS = JSON.stringify(hosts)
    }
    // await fse.writeJson(manifest, manifestJson)
  }
}

async function uploadToHosts ({ maxMonthlyRate, units, duration }, manifestJson, hosts) {
  const maxPrice = await unitsPerHost(maxMonthlyRate, units, duration)
  debug(`Max price in units ${maxPrice}`)

  const failedPrices = []
  for (const host of hosts) {
    try {
      const optionsResp = await fetch(`${host}/pods?duration=${duration}`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'OPTIONS',
        body: JSON.stringify(manifestJson)
      })
      const priceQuote = new BigNumber((await optionsResp.json()).price)
      if (priceQuote.isGreaterThan(maxPrice)) {
        failedPrices.push({ host: host, quotedPrice: priceQuote, maxPrice })
      }
    } catch (err) {
      console.error(`Fetching price quote from host ${host} failed, please try again`)
      throw new Error(`Fetching price quote from host ${host} failed`)
    }
  }

  if (failedPrices.length > 0) {
    console.error('Quoted price from hosts exceeded specified max price from the following hosts')
    failedPrices.forEach(price => console.error(JSON.stringify(price)))
    console.error('Please update your max price to successfully upload your contract.')
    throw new Error('Quoted Price exceeded specified max price for contracts.')
  }

  const respObj = {
    success: [],
    failed: []
  }

  for (const host of hosts) {
    let resp
    try {
      resp = await fetch(`${host}/pods?duration=${duration}`, {
        headers: { 'Content-Type': 'application/json' },
        maxPrice: maxPrice,
        method: 'POST',
        body: JSON.stringify(manifestJson)
      })

      const respJson = await resp.json()
      if (resp.status === 200) {
        const successObj = {
          url: respJson.url,
          manifestHash: respJson.manifestHash,
          host: host,
          expiry: respJson.expiry,
          expirationDate: moment(respJson.expiry).format('MM-DD-YYYY h:mm:ss ZZ'),
          expires: moment().to(moment(respJson.expiry)),
          pricePaid: resp.price
        }
        respObj.success.push(successObj)
      } else {
        throw new Error('Request Failed')
      }
    } catch (err) {
      debug(`Pod Upload failed ${err}`)
      const failedObj = {
        error: err.message,
        host,
        status: resp.status,
        statusText: resp.statusText
      }
      respObj.failed.push(failedObj)
    }
  }

  if (respObj.success.length > 0) {
    console.log('Successfully Uploaded Pods to:')
    respObj.success.forEach(contract => console.log(contract))
  }

  if (respObj.failed.length > 0) {
    console.log('Failed To Upload Pods to:')
    respObj.failed.forEach(contract => console.log(contract))
  }
  return respObj
}

async function updateDatabaseWithHosts (manifestJson, respObj) {
  debug('Saving successful uploaded pods to CliDB')
  if (respObj.success.length > 0) {
    const manifestHash = hashManifest(manifestJson.manifest)
    const existingManifestData = await db.loadValue(manifestHash, {})
    let hostsObj = existingManifestData.hosts || {}
    respObj.success.forEach(obj => {
      hostsObj[obj.host] = {
        expiry: obj.expiry
      }
    })
    debug(`Saving to cli-db Hosts: ${JSON.stringify(hostsObj)}`)

    const manifestObj = {
      manifest: manifestJson,
      hosts: hostsObj
    }
    await db.saveManifestData(manifestHash, manifestObj)
  }
}

async function upload (options) {
  checkOptions(options)

  try {
    // TODO: Add manifest validation before starting upload
    await discoverHosts()
    const uploadHosts = await selectDistributedHosts(options)
    const manifestJson = await fse.readJson(options.manifest)
    await addHostsToManifest(options, manifestJson, uploadHosts)
    const respObj = await uploadToHosts(options, manifestJson, uploadHosts)
    await updateDatabaseWithHosts(manifestJson, respObj)

    process.exit(0)
  } catch (err) {
    debug(err)
    process.exit(1)
  }
}

module.exports = {
  upload
}
