/**
 * @fileOverview Base Configuration for the codius cli.
 * @name config.js<codius/src>
 * @author Travis Crist
 */

module.exports = {
  peers: [
    'https://codius.justmoon.com',
    'https://codius.andros-connector.com'
  ],
  price: {
    month: {
      xrp: 10
    }
  },
  duration: 600,
  version: {
    codius: {
      min: 1
    }
  }
}
