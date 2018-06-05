/**
 * @fileOverview
 * @name hosts.js<handlers>
 * @author Travis Crist
 */

const debug = require('debug')('codius-cli:hostsHandler')
const db = require('../common/cli-db.js')

async function hosts ({ removeAllHosts, removeHost }) {
  if (removeAllHosts) {
    await db.deleteAllHosts()
    console.log('Removed all hosts from the local database')
    debug('Removed all hosts from the local database')
  } else if (removeHost) {
    const existingHosts = await db.getHosts()
    if (existingHosts.includes(removeHost)) {
      await db.removeHost(removeHost)
      console.log(`Removed host: ${removeHost} successfully`)
    } else {
      console.error(`Host does not exist in database, unable to remove.`)
    }
  } else {
    console.log('Error: no options passed into the hosts command, please use \'hosts --help\' to see available options')
  }
}

module.exports = {
  hosts
}
