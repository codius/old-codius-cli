const debug = require('debug')('codius-cli:config')
const { generateNonce, hashPrivateVars } = require('codius-manifest')
const fse = require('fs-extra')

async function config ({ manifest, nonce, privateVarHash }) {
  let manifestJson = (await fse.readJson(manifest))

  if (nonce) {
    debug('generating nonce values...')
    generateNonces(manifestJson)
  }

  if (nonce || privateVarHash) {
    debug('generating private var hashes...')
    generatePrivateVarHashes(manifestJson)
  }
  debug('writing changes to manifest file...')
  debug(`New manifest: ${JSON.stringify(manifestJson)}`)
  fse.writeJson(manifest, manifestJson)
}

function generateNonces (manifestJson) {
  let privateVars = Object.keys(manifestJson.private.vars)
  privateVars.map((varName) => {
    manifestJson.private.vars[varName].nonce = generateNonce()
  })
  return manifestJson
}

function generatePrivateVarHashes (manifestJson) {
  const hashes = hashPrivateVars(manifestJson)
  const privateVars = Object.keys(hashes)

  privateVars.map((varName) => {
    let publicValue = manifestJson.manifest.vars[varName]
    if (!publicValue) {
      debug(`'manifest.vars.${varName}' is not defined`)
      debug(`Creating new entry for 'manifest.vars.${varName}'...`)
      const newEntry = {
        encoding: 'private:sha256',
        value: hashes[varName]
      }
      publicValue = newEntry
    } else if (publicValue.encoding !== 'private:sha256') {
      throw new Error(`Private Var Error: '${varName}' is already reserved for a public variable`)
    } else {
      publicValue.value = hashes[varName]
    }
  })
  return manifestJson
}

module.exports = {
  config
}
