/**
 * Codius CLI Class
 */

class CodiusCli {
  constructor (manifest) {
    this.manifest = manifest
  }

  validate () {
    console.log(this.manifest)
    // TODO: Add manifest validation
    // TODO: Prompt user for missing items:
    // nonce, manifest hash, max price, duration, hosts default is 1
    // If nonce is updated force update of manifest hash
  }

  generateNonce () {
    // TODO: Generate the nonce for the manifest
    // Warn that if updated the manifest has will be updated
  }

  hashManifest (manifest, hash) {
    // TODO: Generate the has of the manifest
  }

  upload () {
    // TODO: Use to upload the contract using ilp-fetch
    // First calls validate and then prompts the user to confirm upload
    // takes --force which validates and then uploads without prompting the user
    // Uses gossip network to find hosts for the contract based on # of hosts
  }

  extend () {
    // TODO: Extends the contract
    // Calls validate, then upload takes a --force parameter otherwise prompts the user to confirm
  }

  config () {
    // TODO: configures the manifest
    // nonce, manifest hash, max price, duration, hosts (3 default needs at least 1)
    // config with no options prompts you
  }


}

module.exports = CodiusCli
