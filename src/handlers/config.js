const debug = require('debug')('codius-cli:config')
const { generateNonce, hashPrivateVars } = require('codius-manifest')
const fse = require('fs-extra')

async function config ({ manifest, nonce, privateVarHash }) {
  let manifestJson = (await fse.readJson(manifest))
  try {
    if (nonce) {
      console.log('generating nonce values...')
      generateNonces(manifestJson)
    }

    if (privateVarHash) {
      console.log('generating private var hashes...')
      generatePrivateVarHashes(manifestJson)
    }
    console.log('writing changes to manifest file...')
    console.log(`New manifest: ${JSON.stringify(manifestJson, null, 2)}`)
    await fse.writeJson(manifest, manifestJson, { spaces: 2 })
    process.exit(0)
  } catch (err) {
    debug(err)
    process.exit(1)
  }
}

function generateNonces (manifestJson) {
  let privateVars = Object.keys(manifestJson.private.vars)
  privateVars.map((varName) => {
    manifestJson.private.vars[varName].nonce = generateNonce()
    console.log(`Private Var: ${varName}\nnonce: ${manifestJson.private.vars[varName].nonce}`)
  })
  return manifestJson
}

function generatePrivateVarHashes (manifestJson) {
  const hashes = hashPrivateVars(manifestJson)
  const privateVars = Object.keys(hashes)

  privateVars.map((varName) => {
    let publicValue = manifestJson.manifest.vars[varName]
    if (!publicValue) {
      console.log(`'manifest.vars.${varName}' is not defined`)
      console.log(`Creating new entry for 'manifest.vars.${varName}'...`)
      const newEntry = {
        encoding: 'private:sha256',
        value: hashes[varName]
      }
      manifestJson.manifest.vars[varName] = newEntry
    } else if (publicValue.encoding !== 'private:sha256') {
      const errorMessage = `Private Var Error: '${varName}' is already reserved for a public variable`
      console.error(errorMessage)
      throw new Error(errorMessage)
    } else {
      publicValue.value = hashes[varName]
    }
  })
  return manifestJson
}

module.exports = {
  config
}
