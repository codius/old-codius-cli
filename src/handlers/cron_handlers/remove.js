const logger = require('riverpig')('codius-cli:removeCronHandler')
const ora = require('ora')
const statusIndicator = ora({ text: '', color: 'blue', spinner: 'point' })
const crontab = require('crontab')
const inquirer = require('inquirer')
const { promisify } = require('util')
const fse = require('fs-extra')

async function removeCron (options) {
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

    if (!options.assumeYes) {
      const userResp = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueToRemoveCron',
          message: `Do you want to proceed with removing the cron job(s)?`,
          default: false
        }
      ])
      if (!userResp.continueToRemoveCron) {
        statusIndicator.start(`User declined to remove cron job(s)`)
        throw new Error('Cron job removal aborted by user')
      }
    }

    statusIndicator.start('Removing cron job(s)')
    cron.remove(jobs)
    cron.save()
    statusIndicator.succeed()
    process.exit(0)
  } catch (err) {
    statusIndicator.fail()
    logger.error(err.message)
    logger.debug(err)
    process.exit(1)
  }
}

module.exports = {
  removeCron
}
