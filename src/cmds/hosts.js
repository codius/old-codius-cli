/**
 * @fileOverview
 * @name hosts.js
 * @author Travis Crist
 */

const { hostOptions } = require('../cmds/options/options.js')
const { hosts } = require('../handlers/hosts.js')

exports.command = 'hosts [options]'
exports.desc = 'Managers the local hosts database'
exports.builder = hostOptions
exports.handler = async function (argv) {
  await hosts(argv)
}
