/**
 * @fileOverview Gets the units to run a host per month
 * @name price.js
 * @author Travis Crist
 */

const config = require('../config.js')
const Price = require('ilp-price')
const monthsPerSecond = 0.0000003802571



function unitsPerHost (maxMonthlyRate = config.price.month.xrp, units = 'XRP', duration = 3600) {
  // TODO Calculate the units based on the duration and the monthly rate

}

module.exports = {
  unitsPerHost
}
