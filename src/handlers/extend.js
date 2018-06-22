/**
 * @fileOverview
 * @name extend.js
 * @author Travis Crist
 */

const { getCurrencyDetails, unitsPerHost } = require('../common/price.js')
const { checkPricesOnHosts } = require('../common/host-utils.js')
const { uploadManifestToHosts } = require('../common/manifest-upload.js')
const ora = require('ora')
const statusIndicator = ora({ text: '', color: 'blue', spinner: 'point' })
const codiusState = require('../common/codius-state.js')
const fse = require('fs-extra')
const nodeDir = require('node-dir')
const inquirer = require('inquirer')
const jsome = require('jsome')
const moment = require('moment')
const logger = require('riverpig')('codius-cli:uploadHandler')

async function getCodiusStateFilePath () {
  const files = await new Promise((resolve, reject) => {
    nodeDir.readFiles(process.cwd(), {
      match: /\.codiusstate\.json$/, recursive: false
    }, (err, content, next) => {
      if (err) throw err
      next()
    }, (err, files) => {
      if (err) reject(err)
      resolve(files)
    })
  })

  let codiusStateFilePath
  if (files.length === 1) {
    codiusStateFilePath = files[0]
    logger.debug(`Found ${codiusStateFilePath} file`)
  } else if (files.length > 1) {
    throw new Error(`Found multiple *.codiusstate.json files:\n${JSON.stringify(files)}\nonly one *.codiusstate.json file is supported.`)
  } else {
    throw new Error(`Unable to find any *codiusstate.json files, please check that one exists in your current working directory ${process.cwd()}. Run 'codius upload <commands>' to create a *.codiusstate.json file.`)
  }

  return codiusStateFilePath
}

function getOptions ({ maxMonthlyRate, duration, units }, codiusStateOptions) {
  return {
    maxMonthlyRate: maxMonthlyRate || codiusStateOptions.maxMonthlyRate,
    duration: duration || codiusStateOptions.duration,
    units: units || codiusStateOptions.units
  }
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

async function extend (options) {
  try {
    let codiusStateFilePath
    if (options.codiusStateFile) {
      statusIndicator.start(`Checking ${options.codiusStateFile} exists`)
      const codiusStateExists = await fse.pathExists(options.codiusStateFile)
      if (!codiusStateExists) {
        throw new Error(`Codius State File at ${options.codiusStateFile} does not exist, please check the provided file location`)
      }
      codiusStateFilePath = options.codiusStateFile
    } else {
      statusIndicator.start(`Checking for *.codiusstate.json file in current dir ${process.cwd()}`)
      codiusStateFilePath = await getCodiusStateFilePath()
    }
    const codiusStateJson = await fse.readJson(codiusStateFilePath)
    statusIndicator.succeed()

    statusIndicator.start('Getting Codius State Details')
    const manifestJson = codiusStateJson.generatedManifest
    const hostList = codiusStateJson.hostList
    const statusDetails = getHostsStatus(codiusStateJson)
    const stateOptions = getOptions(options, codiusStateJson.options)
    statusIndicator.succeed()

    if (!options.assumeYes) {
      console.info('Extending Manifest:')
      jsome(manifestJson)
      console.info('on the following host(s):')
      jsome(hostList)
      console.info('with the current status:')
      jsome(statusDetails)
      console.info('with options:')
      jsome(stateOptions)
      const userResp = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueToExtend',
          message: `Do you want to proceed with extending the pod?`,
          default: false
        }
      ])
      if (!userResp.continueToExtend) {
        statusIndicator.start('User declined to extend pod')
        throw new Error('Extend aborted by user')
      }
    }

    statusIndicator.start('Calculating Max Monthly Rate')
    const maxMonthlyRate = await unitsPerHost(stateOptions)
    const currencyDetails = await getCurrencyDetails()
    statusIndicator.start(`Checking Host Monthly Rate vs Max Monthly Rate ${maxMonthlyRate.toString()} ${currencyDetails}`)
    await checkPricesOnHosts(hostList, stateOptions.duration, maxMonthlyRate, manifestJson)
    statusIndicator.succeed()

    statusIndicator.start(`Uploading to ${hostList.length} host(s)`)
    const uploadHostsResponse = await uploadManifestToHosts(statusIndicator,
      hostList, stateOptions.duration, maxMonthlyRate, manifestJson)

    statusIndicator.start('Updating Codius State File')
    const saveStateOptions = {
      codiusStateFile: codiusStateFilePath,
      maxMonthlyRate: stateOptions.maxMonthlyRate,
      units: stateOptions.units,
      duration: stateOptions.duration
    }
    await codiusState.saveCodiusState(saveStateOptions, manifestJson, uploadHostsResponse, codiusStateJson)
    statusIndicator.succeed(`Codius State File: ${codiusStateFilePath} updated`)

    process.exit(0)
  } catch (err) {
    statusIndicator.fail()
    logger.error(err.message)
    logger.debug(err)
    process.exit(1)
  }
}

module.exports = {
  extend
}
