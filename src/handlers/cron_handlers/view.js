const logger = require('riverpig')('codius-cli:viewCronHandler')
const ora = require('ora')
const statusIndicator = ora({ text: '', color: 'blue', spinner: 'point' })
const crontab = require('crontab')
const { promisify } = require('util')
const fse = require('fs-extra')

async function viewCron (options) {
  try {
    statusIndicator.start(`Checking ${options.codiusStateFile} exists`)
    const codiusStateExists = await fse.pathExists(options.codiusStateFile)
    if (!codiusStateExists) {
      throw new Error(`Codius State File at ${options.codiusStateFile} does not exist, please check the provided file location`)
    }
    statusIndicator.succeed()

    statusIndicator.start('Getting Codius State Details')
    const codiusStateJson = await fse.readJson(options.codiusStateFile)
    const manifestHash = codiusStateJson.manifestHash
    statusIndicator.succeed()

    statusIndicator.start('Getting existing cron job(s)')
    const load = promisify(crontab.load)
    const cron = await load()
    const jobs = await cron.jobs({comment: manifestHash})
    if (jobs.length < 1) {
      throw new Error(`No cron jobs exist for the pod with manifest hash ${manifestHash}`)
    }
    statusIndicator.succeed()
    console.info('Existing cron job(s):')
    jobs.map((job) => { console.info(job.toString()) })
    process.exit(0)
  } catch (err) {
    statusIndicator.fail()
    logger.error(err.message)
    logger.debug(err)
    process.exit(1)
  }
}

module.exports = {
  viewCron
}
