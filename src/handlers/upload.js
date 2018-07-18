/**
 * @fileOverview Handler to upload codius pod to network
 * @name upload.js<handlers>
 * @author Travis Crist
 */

const { hashManifest } = require('codius-manifest')
const { getCurrencyDetails, unitsPerHost } = require('../common/price.js')
const { getValidHosts, cleanHostListUrls } = require('../common/host-utils.js')
const { discoverHosts } = require('../common/discovery.js')
const { uploadManifestToHosts } = require('../common/manifest-upload.js')
const { attachToLogs } = require('../common/pod-control.js')
const ora = require('ora')
const { generateManifest } = require('codius-manifest')
const statusIndicator = ora({ text: '', color: 'blue', spinner: 'point' })
const codiusState = require('../common/codius-state.js')
const fse = require('fs-extra')
const inquirer = require('inquirer')
const config = require('../config.js')
const jsome = require('jsome')
const logger = require('riverpig')('codius-cli:uploadhandler')
const chalk = require('chalk')

function checkOptions ({ addHostEnv }) {
  // If the host number is set but the add host env is not specified warn the user
  if (!addHostEnv) {
    statusIndicator.warn('Hosts will NOT be added to the HOSTS env in the generated manifest.')
  }
}

async function addHostsToManifest (status, { addHostEnv }, manifestJson, hosts) {
  if (addHostEnv) {
    status.start('Adding hosts to HOSTS env in generated manifest')
    const containers = manifestJson.manifest.containers
    for (const container of containers) {
      if (container.environment && container.environment.HOSTS) {
        throw new Error('HOSTS env variable already exists in a container. Option --add-hosts-env cannot be used if the HOSTS env already exists in any container.')
      }
      container.environment = container.environment || {}
      container.environment.HOSTS = JSON.stringify(hosts)
    }
    status.succeed()
  }
}

function getUploadOptions ({ maxMonthlyRate = config.price.amount, duration, units = config.price.units }) {
  return {
    maxMonthlyRate: maxMonthlyRate,
    duration: duration,
    units: units
  }
}

async function upload (options) {
  checkOptions(options)

  try {
    await codiusState.validateOptions(statusIndicator, options)
    statusIndicator.start('Generating Codius Manifest')
    const generatedManifestObj = await generateManifest(options.codiusVarsFile, options.codiusFile)

    if (options.debug && !generatedManifestObj.manifest.debug) {
      console.error('In order to use debug mode, please set the debug property in the manifest to true.')
      throw new Error('Unable to use debug mode for non-debug contract.')
    }

    let hostList
    const codiusHostsExists = await fse.pathExists(options.codiusHostsFile)
    // Skip discover if --host option is used.
    if (!options.host) {
      if (codiusHostsExists) {
        logger.debug('Codius Hosts File exists, or was provided as a parameter, using it for host list.')
        hostList = (await fse.readJson(options.codiusHostsFile)).hosts
      } else {
        statusIndicator.start('Discovering Hosts')
        const discoverCount = options.hostCount > 50 ? options.hostCount : 50
        hostList = await discoverHosts(discoverCount)
        statusIndicator.succeed(`Discovered ${hostList.length} Hosts`)
      }
    } else {
      hostList = options.host
    }
    const cleanHostList = cleanHostListUrls(hostList)
    statusIndicator.start('Calculating Max Monthly Rate')
    const maxMonthlyRate = await unitsPerHost(options)
    const currencyDetails = await getCurrencyDetails()

    statusIndicator.start(`Checking Host(s) Monthly Rate vs Max Monthly Rate ${maxMonthlyRate.toString()} ${currencyDetails}`)
    const validHostOptions = {
      maxMonthlyRate,
      hostList: cleanHostList,
      manifestJson: generatedManifestObj,
      codiusHostsExists
    }
    const validHostList = await getValidHosts(options, validHostOptions)
    statusIndicator.succeed()
    addHostsToManifest(statusIndicator, options, generatedManifestObj, validHostList)
    const manifestHash = hashManifest(generatedManifestObj.manifest)

    if (!options.assumeYes) {
      console.info(config.lineBreak)
      console.info('Generated Manifest:')
      jsome(generatedManifestObj)
      console.info('Manifest Hash:')
      console.info(chalk.blue(`${manifestHash}`))
      console.info('will be uploaded to host(s):')
      jsome(validHostList)
      console.info('with options:')
      jsome(getUploadOptions(options))
      statusIndicator.warn(`All information in the ${chalk.red('manifest')} property will be made ${chalk.red('public')}!`)
      const userResp = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueToUpload',
          message: `Do you want to proceed with the pod upload?`,
          default: false
        }
      ])
      if (!userResp.continueToUpload) {
        statusIndicator.start('User declined to upload pod')
        throw new Error('Upload aborted by user')
      }
    }
    statusIndicator.start(`Uploading to ${validHostList.length} host(s)`)

    const uploadHostsResponse = await uploadManifestToHosts(statusIndicator,
      validHostList, options.duration, maxMonthlyRate, generatedManifestObj)

    if (uploadHostsResponse.success.length > 0) {
      statusIndicator.start('Updating Codius State File')
      await codiusState.saveCodiusState(options, generatedManifestObj, uploadHostsResponse)
      statusIndicator.succeed(`Codius State File: ${options.codiusStateFile} Updated`)
    }

    if (options.debug) {
      const logStream = await attachToLogs(validHostList, manifestHash)
      logStream.pipe(process.stdout)
    } else {
      process.exit(0)
    }
  } catch (err) {
    statusIndicator.fail()
    logger.error(err.message)
    logger.debug(err)
    process.exit(1)
  }
}

module.exports = {
  upload
}
