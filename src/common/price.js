/**
 * @fileOverview Gets the units to run a host per month
 * @name price.js
 * @author Travis Crist
 */

const config = require('../config.js')
const Price = require('ilp-price')
const debug = require('debug')('codius-cli:price')
const BigNumber = require('bignumber.js')
const monthsPerSecond = 0.0000003802571

async function unitsPerHost (maxMonthlyRate = config.price.month.xrp, units = 'XRP', duration = config.duration) {
  const totalFee = new BigNumber(duration * monthsPerSecond * maxMonthlyRate)
  debug(`Total fee in XRP: ${totalFee}`)
  const price = new Price()
  const amountOfUnits = await price.fetch(units, totalFee) + 1 // add one since the codius server rounds up so we are not off by one unit.
  debug(`Total Amount in units: ${amountOfUnits}`)
  return amountOfUnits
}

module.exports = {
  unitsPerHost
}
