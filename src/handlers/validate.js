const debug = require('debug')('codius-cli:validate')
const { validateManifest } = require('codius-manifest')
const fse = require('fs-extra')

async function isManifestValid (manifestJson) {
  debug(`Validating manifest: ${JSON.stringify(manifestJson)}`)
  const errors = validateManifest(manifestJson)

  if (errors.length) {
    console.log('Invalid manifest... \nErrors:')
    errors.map((error) => {
      console.log(error)
    })
    console.log('\nPlease correct errors before uploading manifest to host(s)')
    return false
  } else {
    console.log('Validation Successful \u2714')
    return true
  }
}

async function validate ({ manifest }) {
  const manifestJson = (await fse.readJson(manifest))
  const isValid = isManifestValid(manifestJson)
  if (isValid) {
    process.exit(0)
  } else {
    process.exit(1)
  }
}

module.exports = {
  validate,
  isManifestValid
}
