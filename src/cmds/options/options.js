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

const privateVarHash = {
  'private-var-hash': {
    alias: 'pvh',
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
    description: 'Duration the contract should run (seconds)',
    demandOption: true
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
    description: 'Max price for contract',
    demandOption: true
  }
}

const hostNumber = {
  'host-number': {
    alias: 'n',
    type: 'number',
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

const addHostEnv = {
  'add-host-env': {
    alias: 'add',
    type: 'boolean',
    default: false,
    description: 'Adds the hosts used to the $HOSTS env in the manifest'
  }
}

const setHost = {
  host: {
    alias: 'h',
    type: 'string',
    description: 'Host to use for contract. Cannot be used with host-number command'
  }
}

const configOptions = {
  ...nonce,
  ...privateVarHash,
  ...validate
}

const extendOptions = {
  ...maxPrice,
  ...extendDuration,
  ...noPrompt
}

const uploadOptions = {
  ...maxPrice,
  ...duration,
  ...hostNumber,
  ...addHostEnv,
  ...setHost,
  ...noPrompt
}

module.exports = {
  configOptions,
  uploadOptions,
  extendOptions
}
