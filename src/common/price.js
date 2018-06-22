/**
 * @fileOverview Gets the units to run a host per month
 * @name price.js
 * @author Travis Crist
 */

const config = require('../config.js')
const Price = require('ilp-price')
const plugin = require('ilp-plugin')()
const ildcp = require('ilp-protocol-ildcp')
const logger = require('riverpig')('codius-cli:price')
const BigNumber = require('bignumber.js')
const monthsPerSecond = 0.0000003802571
const roundUpPriceConstant = 0.0008

async function getCurrencyDetails () {
  await plugin.connect()
  const res = await ildcp.fetch(plugin.sendData.bind(plugin))

  const prefixes = [ '', 'd', 'c', 'm', null, null, '\u00B5', null, null, 'n' ]
  const prefix = prefixes[res.assetScale]

  const currencyDetails = (prefix || '') + res.assetCode +
        ((prefix || !res.assetScale) ? '' : ('e-' + res.assetCode))

  return currencyDetails
}

async function unitsPerHost ({
  maxMonthlyRate = config.price.amount,
  units = config.price.units,
  duration = config.duration
}) {
  const totalFee = new BigNumber(duration * monthsPerSecond * maxMonthlyRate)
  logger.debug(`Total fee in XRP: ${totalFee}`)
  const price = new Price()
  let amountOfUnits
  try {
    let timer
    const timeoutPromise = new Promise((resolve, reject) => {
      timer = setTimeout(resolve, 2000)
    })
    const priceFetchPromise = price.fetch(units, totalFee)

    const priceResp = await Promise.race([timeoutPromise, priceFetchPromise])
    clearTimeout(timer)
    if (!priceResp) {
      throw new Error('unable to make to make ILP Connection, run Codius CLI in debug via command:\n\'DEBUG=* codius <commands>\'\nto verify you are connected.')
    }
    const quotedPrice = new BigNumber(priceResp)
    // Increase the price by 8/100ths of a percent since the server rounds up so we are not  off by a few drops
    const roundUpUnits = quotedPrice.multipliedBy(roundUpPriceConstant).integerValue(BigNumber.ROUND_CEIL)
    amountOfUnits = quotedPrice.plus(roundUpUnits)
    logger.debug(`Total Amount in units: ${amountOfUnits}`)
  } catch (err) {
    throw new Error(`ilp-price lookup failed: ${err.message}`)
  }
  return amountOfUnits
}

module.exports = {
  getCurrencyDetails,
  unitsPerHost
}
