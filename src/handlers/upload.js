/**
 * @fileOverview Handler to upload codius contract to network
 * @name upload.js<handlers>
 * @author Travis Crist
 */

const axios = require('axios')
const CliDB = require('../CliDB.js')
const sampleSize = require('lodash.samplesize')
const debug = require('debug')('codius-cli:uploadHandler')
const logger = require('riverpig')('codius-cli:uploadHandler')
const fetch = require('ilp-fetch')
const fs = require('fs')
const { unitsPerHost } = require('../common/price.js')

const HOSTS_PER_DISCOVERY = 5

function checkOptions ({ hostNumber, addHostEnv }) {
  // If the host number is set but the add host env is not specified warn the user
  if (hostNumber && !addHostEnv) {
    logger.warn('Hosts will NOT be added to the $HOSTS env var in the manifest.')
    logger.warn('Add the option add-host-env to save the selected hosts to $HOSTS')
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

async function selectDistributedHosts ({ hostNumber = 1 }) {
  // TODO: Use the ASN Map at https://iptoasn.com/ probably store locally to choose distributed hosts as an array to be used for upload. For now just return a random sample based on the count
  const uploadHosts = sampleSize(await this.db.getHosts(), hostNumber)
  return uploadHosts
}

async function uploadToHosts ({ manifest, maxMonthlyRate, units, duration }, hosts) {
  const manifestData = fs.readFileSync(manifest)

  // TODO: Implement ilp price to get the units needed for the fetch call
  // 10 XRP Per Month is the default
  const maxPrice = await unitsPerHost(maxMonthlyRate, units, duration)
  debug(`Max price in units ${maxPrice}`)
  let respSuccess = []
  let respFail = []
  for (const host of hosts) {
    const resp = await fetch(`${host}/pods?duration=${duration}`, {
      maxPrice: maxPrice,
      method: 'POST',
      body: manifestData
    })
    if (resp.status === 200) {
      respSuccess.push(resp)
    } else {
      respFail.push(resp)
    }

    debug('ilp-fetch response: ' + await resp.text() + " Pricce: " + resp.price + " CODE " + resp.status)
  }
  process.exit(0)
}

async function upload (options) {
  checkOptions(options)

  try {
    await discoverHosts()
    let uploadHosts
    if (!options.host) {
      uploadHosts = await selectDistributedHosts(options)
    } else {
      uploadHosts = options.host
    }
    debug(`Hosts for upload: ${uploadHosts}`)
    await uploadToHosts(options, uploadHosts)




  } catch (err) {
    debug(err)
  }
  // const uploadHosts = selectDistributedHosts(hosts)
  // TODO: Validate the Manifest here
  // TODO: If the --add-host-env flag is used add all the hosts to the
  // manifest under the $HOSTS variable as an array
  // TODO: Generate the hash of the manifest

}

module.exports = {
  upload
}
