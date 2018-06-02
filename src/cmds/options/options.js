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
    description: 'Generate manifest hash for private variables'
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

const maxMonthlyRate = {
  'max-monthly-rate': {
    alias: 'max',
    type: 'number',
    description: 'Max monthly price per contract per host, requires --units flag to be set.'
  }
}

const units = {
  'units': {
    alias: 'u',
    type: 'string',
    description: 'Units to use for the max monthly price, ex \'XRP\''
  }
}

const hostCount = {
  'host-count': {
    alias: 'c',
    type: 'number',
    description: 'The number of hosts for the contract to run on, default to 1 if not specified'
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

const addHostEnv = {
  'add-host-env': {
    alias: 'add',
    type: 'boolean',
    default: false,
    description: 'Adds a $HOST env for each conatiner in the manifest that contains other hosts running the same contract'
  }
}

const setHost = {
  host: {
    alias: 'h',
    type: 'string',
    description: 'Host to use for contract, multiple hosts may be used by repeating this option for each host. Cannot be used with host-count command'
  }
}

const removeAllHosts = {
  'remove-all-hosts': {
    alias: 'rall',
    type: 'boolean',
    default: false,
    description: 'Removes all hosts from the local database'
  }
}

const configOptions = {
  ...nonce,
  ...privateVarHash
}

const extendOptions = {
  ...extendDuration,
  ...maxMonthlyRate,
  ...units,
  ...noPrompt
}

const uploadOptions = {
  ...duration,
  ...maxMonthlyRate,
  ...units,
  ...hostCount,
  ...setHost,
  ...addHostEnv,
  ...noPrompt
}

const hostOptions = {
  ...removeAllHosts
}

module.exports = {
  configOptions,
  uploadOptions,
  extendOptions,
  hostOptions
}
