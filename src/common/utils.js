/**
 * @fileOverview
 * @name utils.js
 * @author Travis Crist
 */

function checkStatus (response) {
  if (response && response.status) {
    const statusString = `${response.status}`
    if (statusString.startsWith('2')) {
      return true
    }
  }
  return false
}

module.exports = {
  checkStatus
}
