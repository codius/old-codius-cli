const base32 = require('thirty-two')

function encode (buffer) {
  return base32.encode(buffer)
    .toString('ascii')
    .toLowerCase()
    .replace(/=+$/, '')
}

function decode (b32) {
  return base32.decode(b32)
}

module.exports = {
  encode,
  decode
}
