/**
 * @fileOverview Options for the command line arguments to use.
 * @name options.js
 * @author Travis Crist
 */

const config = require('../../config.js')

const duration = {
  duration: {
    alias: 'd',
    type: 'number',
    default: config.duration,
    description: 'Duration (in seconds) the pod will be run on all Codius hosts, defaults to 10 mins.'
  }
}

const extendDuration = {
  duration: {
    alias: 'd',
    type: 'number',
    description: 'Duration (in seconds) the pod will be extended on all Codius hosts.'
    // NOTE: The default is not specified since it is derived from the codius state file if the parameter is not passed in.
  }
}

const maxMonthlyRate = {
  'max-monthly-rate': {
    alias: 'm',
    type: 'number',
    description: 'Max rate per month the uploader is willing to pay a Codius host to run the pod, requires --units flag to be set. Defaults to 10.'
    // NOTE: The default is not set using yargs so that when this param is set yargs requires the units param.
  }
}

const units = {
  'units': {
    alias: 'u',
    type: 'string',
    description: 'The unit of currency to pay the Codius hosts with, e.g. \'XRP\', requires --max-monthly-rate flag to be set. Defaults to \'XRP\'.'
    // NOTE: The default is not set using yargs so that when this param is set yargs requires the max-monthly-rate param.
  }
}

const hostCount = {
  'host-count': {
    alias: 'c',
    type: 'number',
    description: 'The number of hosts to upload the pod to. They are discovered from known hosts and selected randomly. Defaults to 1.'
    // NOTE: The default is not specified so we can check for its exisitance to warn the usere about adding the add-hosts-env options.
  }
}

const debug = {
  'debug': {
    type: 'boolean',
    default: false,
    description: 'Run this pod in debug mode with logging'
  }
}

const addHostEnv = {
  'add-host-env': {
    alias: 'a',
    type: 'boolean',
    default: false,
    description: 'Adds a $HOST env in the manifest before upload which contains all the hosts the manifest will be uploaded to.'
  }
}

const setHost = {
  host: {
    type: 'string',
    description: 'The public URI of a host to upload the manifest to. Can be repeated any number of times for multiple hosts. Cannot be used with --host-count command.'
  }
}

const codiusFile = {
  'codius-file': {
    type: 'string',
    description: 'Filename or full path to codius file to be used. If not set the CLI looks in the current directory for the codius.json file.',
    default: 'codius.json'
  }
}

const codiusVarsFile = {
  'codius-vars-file': {
    type: 'string',
    description: 'Filename or full path to the codius variables file to be used. If not set the CLI looks in the current directory for the codiusvars.json file.',
    default: 'codiusvars.json'
  }
}

const codiusHostsFile = {
  'codius-hosts-file': {
    type: 'string',
    description: 'Filename or full path to the codius hosts file to be used. If not set the CLI looks in the current directory for the codiushosts.json file.',
    default: 'codiushosts.json'
  }
}

const codiusStateFileUpload = {
  'codius-state-file': {
    type: 'string',
    description: 'Filename or full path to the codius state file to be generated. If not set the CLI will make a default.codiusstate.json file.',
    default: 'default.codiusstate.json'
  }
}

const codiusStateFileExtend = {
  'codius-state-file': {
    type: 'string',
    description: 'Filename or full path to the codius state file to be used. If not set the CLI looks in the current directory for a file matching the pattern *.codiusstate.json file.',
    default: 'default.codiusstate.json'
  }
}

const overwriteCodiusStateFile = {
  'overwrite-codius-state': {
    alias: 'o',
    type: 'boolean',
    description: 'Overwrite the current *.codiusstate.json file if it exists.'
  }
}

const assumeYes = {
  'assume-yes': {
    alias: 'y',
    type: 'boolean',
    default: false,
    description: 'Say yes to all prompts.'
  }
}

const extendOptions = {
  ...extendDuration,
  ...maxMonthlyRate,
  ...units,
  ...codiusStateFileExtend,
  ...assumeYes
}

const uploadOptions = {
  ...duration,
  ...maxMonthlyRate,
  ...units,
  ...hostCount,
  ...setHost,
  ...addHostEnv,
  ...codiusFile,
  ...codiusVarsFile,
  ...codiusHostsFile,
  ...codiusStateFileUpload,
  ...overwriteCodiusStateFile,
  ...assumeYes,
  ...debug
}

const extendManifestOptions = {
  ...setHost,
  ...extendDuration,
  ...maxMonthlyRate,
  ...units,
  ...assumeYes
}

module.exports = {
  uploadOptions,
  extendOptions,
  extendManifestOptions
}
