/**
 * @fileOverview Base Configuration for the codius cli.
 * @name config.js<codius/src>
 * @author Travis Crist
 */

module.exports = {
  peers: [
    'https://codius.justmoon.com',
    'https://codius.andros-connector.com',
    'https://codius.risky.business',
    'https://codius.feraltc.com',
    'https://codius.tinypolarbear.com',
    'https://x1.codiushost.com'
  ],
  price: {
    amount: 10,
    units: 'XRP'
  },
  duration: 600,
  version: {
    codius: {
      min: 2
    }
  },
  lineBreak: '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'
}
