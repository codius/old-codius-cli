/**
 * @fileOverview Options for the command line arguments to use.
 * @name options.js
 * @author Travis Crist
 */

const nonce = {
  nonce: {
    alias: 'n',
    type: 'boolean',
    default: false,
    description: 'Generate nonce for the manifest hash'
  }
}

const hashManifest = {
  'hash-manifest': {
    alias: 'hm',
    type: 'boolean',
    default: false,
    description: 'Generate manifest hash'
  }
}

const duration = {
  duration: {
    alias: 'd',
    type: 'number',
    default: 3600,
    description: 'Duration the contract should run (seconds)'
  }
}

const extendDuration = {
  duration: {
    alias: 'd',
    type: 'number',
    description: 'Duration the contract should be extended (seconds)',
    demandOption: true
  }
}

const maxPrice = {
  'max-price': {
    alias: 'mp',
    type: 'number',
    // TODO: set default max-price
    description: 'Max price for contract'
  }
}

const hosts = {
  hosts: {
    alias: 'h',
    type: 'number',
    default: 1,
    description: 'The number of hosts for the contract to run on'
  }
}

const noPrompt = {
  'no-prompt': {
    alias: 'np',
    type: 'boolean',
    default: false,
    description: 'Run the command without prompting the user'
  }
}

const validate = {
  validate: {
    alias: 'val',
    type: 'boolean',
    default: false,
    description: 'Validates the manifest configuration'
  }
}

const contractId = {
  'contract-id': {
    alias: 'cid',
    type: 'string', // TODO: Should this be a number or a string?
    description: 'The Id of the contract',
    demandOption: true
  }
}

const configOptions = {
  ...nonce,
  ...hashManifest,
  ...maxPrice,
  ...duration,
  ...hosts,
  ...validate
}

const extendOptions = {
  ...contractId,
  ...maxPrice, // Should this be in the extend options?
  ...extendDuration,
  ...hosts, // Should this be in the extend options?
  ...noPrompt
}

const uploadOptions = {
  ...nonce,
  ...hashManifest,
  ...maxPrice,
  ...duration,
  ...hosts,
  // TODO: Should we allow validation to be skipped?
  ...noPrompt
}

module.exports = {
  configOptions,
  uploadOptions,
  extendOptions
}
