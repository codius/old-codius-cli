/**
 * @fileOverview Base Configuration for the codius cli.
 * @name config.js<codius/src>
 * @author Travis Crist
 */

module.exports = {
  peers: ['http://localhost:3000'], // TODO: Update to a proper list of peers to default to
  price: {
    month: {
      xrp: 10
    }
  },
  duration: 600
}
