/**
 * @fileOverview Database for storing uploaded manifests by manifest hash and known peers.
 * @name CliDB.js
 * @author Travis Crist
 */

const level = require('level')
const config = require('./config.js')
const debug = require('debug')('codius-cli:CliDB')
const os = require('os')
const path = require('path')

const HOSTS_KEY = 'codiusHosts'

module.exports = class Database {
  constructor () {
    let homeDir
    if (process.env.XDG_CONFIG_HOME) {
      homeDir = path.resolve(process.env.XDG_CONFIG_HOME, 'condius-cli')
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

  async init () {
    await this.addHosts(config.peers)
  }

  async getHosts () {
    return this.loadValue(HOSTS_KEY, [])
  }

  async addHosts (hostsArr) {
    const existingHosts = await this.getHosts()
    const allHosts = [...new Set([...existingHosts, ...hostsArr])]
    return this.saveValue(HOSTS_KEY, allHosts)
  }

  async deleteAllHosts () {
    await this.db.del(HOSTS_KEY)
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
