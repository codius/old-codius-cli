/**
 * @fileOverview
 * @name examples.js
 * @author Travis Crist
 */

const fse = require('fs-extra')
const nginxExample = require('../examples/nginx.js')
const codiusVarsExample = require('../examples/codiusvars.js')
const logger = require('riverpig')('codius-cli:examples')

async function createNginxExample (dir) {
  await fse.writeJson('codius.json', nginxExample.codius(), { spaces: 2 })
  await fse.writeJson('codiusvars.json', nginxExample.codiusVars(), { spaces: 2 })
}

async function createCodiusVarsExample (dir) {
  await fse.writeJson('codiusvars.json', codiusVarsExample.emptyCodiusVars(), { spaces: 2 })
}

async function createExample (example) {
  const workingDir = process.cwd()
  logger.debug(`Creating ${example} example codius.json and codiusvars files.`)
  if (example === 'nginx') {
    await createNginxExample(workingDir)
  } else if (example === 'codiusvars') {
    await createCodiusVarsExample(workingDir)
  }
}

module.exports = {
  createExample
}
