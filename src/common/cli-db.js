/**
 * @fileOverview Database for storing uploaded manifests by manifest hash and known peers.
 * @name cli-db.js
 * @author Travis Crist
 */

const level = require('level')
const config = require('../config.js')
const debug = require('debug')('codius-cli:cli-db')
const os = require('os')
const path = require('path')

const HOSTS_KEY = 'codiusHosts'
const MANIFEST_HASHES_KEY = 'manifestHashes'

class CliDB {
  constructor () {
    let homeDir
    if (process.env.XDG_CONFIG_HOME) {
      homeDir = path.resolve(process.env.XDG_CONFIG_HOME, 'codius-cli')
    } else {
      homeDir = path.resolve(os.homedir(), '.codius-cli')
    }
    debug(`Initialize DB at: ${homeDir}`)
    try {
      this.db = level(homeDir, { valueEncoding: 'json' })
    } catch (err) {
      throw err
    }
  }

  async getHosts () {
    let hosts = await this.loadValue(HOSTS_KEY, config.peers)
    // If the length is 0 add the base config peers back.
    if (hosts.length === 0) {
      hosts = config.peers
    }
    return hosts
  }

  async addHosts (hostsArr) {
    const existingHosts = await this.getHosts()
    const allHosts = [...new Set([...existingHosts, ...hostsArr])]
    return this.saveValue(HOSTS_KEY, allHosts)
  }

  async removeHost (host) {
    const existingHosts = await this.getHosts()
    const updatedHosts = existingHosts.filter(currHost => currHost !== host)
    this.saveValue(HOSTS_KEY, updatedHosts)
  }

  async deleteAllHosts () {
    await this.db.del(HOSTS_KEY)
  }

  async getManifestHashes () {
    return this.loadValue(MANIFEST_HASHES_KEY, [])
  }

  async addManifestHash (hash) {
    const manifestHashes = await this.getManifestHashes()
    const updatedHashes = [...new Set([...manifestHashes, ...[hash]])]
    await this.saveValue(MANIFEST_HASHES_KEY, updatedHashes)
  }

  async saveManifestData (manifestHash, manifestObj) {
    await this.addManifestHash(manifestHash)
    await this.saveValue(manifestHash, manifestObj)
  }

  async getManifestData (manifestHash) {
    return this.loadValue(manifestHash, {})
  }

  async saveValue (key, value) {
    await this.db.put(key, value)
  }

  async loadValue (key, defaultValue = '') {
    let value
    try {
      value = await this.db.get(key)
    } catch (err) {
      if (err.notFound) {
        debug(`Value not found for key: ${key}`)
        value = defaultValue
      } else {
        throw err
      }
    }
    return value
  }
}

module.exports = new CliDB()
