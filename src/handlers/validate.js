const debug = require('debug')('codius-cli:validate')
// TODO: replace import with public  `codius-manifest` package
const { validateManifest } = require('codius-manifest')
const fse = require('fs-extra')

async function validate ({ manifest }) {
  const manifestJson = (await fse.readJson(manifest))
  debug(`Validating manifest: ${JSON.stringify(manifestJson)}`)
  const errors = validateManifest(manifestJson)

  if (errors.length) {
    debug('Invalid manifest... \nerrors:')
    errors.map((error) => {
      debug(JSON.stringify(error))
    })
  } else {
    debug('Manifest is valid')
  }
}

module.exports = {
  validate
}
