'use strict'

const textDecoder = typeof TextDecoder !== 'undefined'
  ? new TextDecoder()
  : new (require('util').TextDecoder)()

/**
 * @param {Uint8Arary} bytes
 * @returns {string}
 */
const decodeText = (bytes) => textDecoder.decode(bytes)

module.exports = { decodeText }
