/**
 * @fileOverview
 * @name hosts.js<handlers>
 * @author Travis Crist
 */

const debug = require('debug')('codius-cli:hostsHandler')
const CliDB = require('../CliDB.js')

async function hosts ({ removeAllHosts }) {
  if (removeAllHosts) {
    const db = new CliDB()
    await db.deleteAllHosts()
    console.log('Removed all hosts from the local database')
    debug('Removed all hosts from the local database')
  }
}

module.exports = {
  hosts
}
