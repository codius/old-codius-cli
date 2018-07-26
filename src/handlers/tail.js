/**
 * @fileOverview
 * @name tail.js<handlers>
 * @author Travis Crist
 */

const { getHostList } = require('../common/host-utils.js')
const ora = require('ora')
const statusIndicator = ora({ text: '', color: 'blue', spinner: 'point' })
const { getManifestHash } = require('../common/utils.js')
const { attachToLogs } = require('../common/pod-control.js')
const fse = require('fs-extra')
const nodeDir = require('node-dir')
const logger = require('riverpig')('codius-cli:tailHandler')

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

async function tail (options) {
  try {
    statusIndicator.start('Checking Options')
    let hostList
    let manifestHash
    if (options.manifestHash) {
      hostList = getHostList(options)
      manifestHash = getManifestHash(options)
      logger.debug(`host list: ${hostList}`)
      logger.debug(`manifest hash: ${manifestHash}`)
    } else {
      let codiusStateFilePath
      if (options.codiusStateFile !== 'default.codiusstate.json') {
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
      hostList = codiusStateJson.hostList
      manifestHash = codiusStateJson.manifestHash
    }
    statusIndicator.succeed('Options Validated Successfully')
    const logStream = await attachToLogs(hostList, manifestHash)
    logStream.on('data', data => {
      logger.info(data.toString())
    })
  } catch (err) {
    statusIndicator.fail()
    logger.error(err.message)
    logger.debug(err)
    process.exit(1)
  }
}

module.exports = {
  tail
}
