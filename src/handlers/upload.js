/**
 * @fileOverview Handler to upload codius contract to network
 * @name upload.js<handlers>
 * @author Travis Crist
 */

const axios = require('axios')
const CliDB = require('../CliDB.js')
const sampleSize = require('lodash.samplesize')
const debug = require('debug')('codius-cli:uploadHandler')
const fetch = require('ilp-fetch')
const fse = require('fs-extra')
const { unitsPerHost } = require('../common/price.js')
const moment = require('moment')

const HOSTS_PER_DISCOVERY = 5

function checkOptions ({ hostCount, addHostEnv }) {
  // If the host number is set but the add host env is not specified warn the user
  if (hostCount && !addHostEnv) {
    console.warn('WARNING - Hosts will NOT be added to the $HOSTS env var in the manifest.')
    console.warn('Add the option add-host-env to save the selected hosts to $HOSTS')
    // TODO: Prompt user here using inquirer?
  }
}

async function discoverHosts () {
  this.db = new CliDB()
  await this.db.init()
  const hostSample = sampleSize(await this.db.getHosts(), HOSTS_PER_DISCOVERY)
  for (const host of hostSample) {
    const res = await axios.get(host + '/peers')
    await this.db.addHosts(res.data.peers)
  }
  debug(`Host List: ${JSON.stringify(await this.db.getHosts())}`)
}

async function selectDistributedHosts ({ host, hostCount = 1 }) {
  // TODO: Use the ASN Map at https://iptoasn.com/ probably store locally to choose distributed hosts as an array to be used for upload. For now just return a random sample based on the count
  let uploadHosts = []
  if (!host) {
    uploadHosts = sampleSize(await this.db.getHosts(), hostCount)
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

async function addHostsToManifest ({ manifest, addHostEnv }, manifestJson, hosts) {
  if (addHostEnv) {
    debug('Adding hosts to $HOST env in manifest')
    const containers = manifestJson.manifest.containers
    for (const container of containers) {
      container.environment = container.environment || {}
      container.environment.HOSTS = JSON.stringify(hosts)
    }
    // Write updated manifest with hosts to file
    await fse.writeJson(manifest, manifestJson)
  }
}

async function uploadToHosts ({ maxMonthlyRate, units, duration }, manifestJson, hosts) {
  const maxPrice = await unitsPerHost(maxMonthlyRate, units, duration)
  debug(`Max price in units ${maxPrice}`)

  const failedPrices = []
  for (const host of hosts) {
    const optionsResp = await fetch(`${host}/pods?duration=${duration}`, {
      headers: { 'Content-Type': 'application/json' },
      method: 'OPTIONS',
      body: JSON.stringify(manifestJson)
    })
    const priceQuote = (await optionsResp.json()).price
    if (priceQuote > maxPrice) {
      failedPrices.push({ host: host, quotedPrice: priceQuote, maxPrice })
    }
  }

  if (failedPrices.length > 0) {
    console.error('Quoted price from hosts exceeded specified max price from the following hosts')
    failedPrices.forEach(price => console.error(JSON.stringify(price)))
    console.error('Please update your max price to successfully upload your contract.')
    // throw (new Error('Quoted Price exceeded specified max price for contracts'))
  }

  const respObj = {
    success: [],
    failed: []
  }

  for (const host of hosts) {
    const resp = await fetch(`${host}/pods?duration=${duration}`, {
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
      const failedObj = {
        host: host,
        status: resp.status,
        statusText: resp.statusText
      }
      respObj.failed.push(failedObj)
    }
  }

  if (respObj.success.length > 0) {
    console.log('Successfully Uploaded Contracts to:')
    respObj.success.forEach(contract => console.log(contract))
  }

  if (respObj.failed.length > 0) {
    console.log('Failed To Upload Contracts to:')
    respObj.failed.forEach(contract => console.log(contract))
  }
  return respObj
}

async function updateDatabaseWithHosts (manifestJson, respObj) {
  debug('Saving successful uploaded contracts to CliDB')
  if (respObj.success.length > 0) {
    const manifestHash = respObj.success[0].manifestHash

    const existingManifestData = await this.db.loadValue(manifestHash, {})
    let hostsObj = existingManifestData.hosts || {}
    respObj.success.forEach(obj => {
      hostsObj[obj.host] = {
        expiry: obj.expiry
      }
    })
    debug(`Saving to CliDB Hosts: ${JSON.stringify(hostsObj)}`)

    const manifestObj = {
      manifest: manifestJson,
      hosts: hostsObj
    }
    this.db.saveValue(manifestHash, manifestObj)
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
    process.exit(0)
  }
}

module.exports = {
  upload
}
