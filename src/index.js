/**
 * Multihash implementation in JavaScript.
 *
 * @module multihash
 */
'use strict'

const bs58 = require('bs58')

const cs = require('./constants')

/**
 * Convert the given multihash to a hex encoded string.
 *
 * @param {Buffer} hash
 * @returns {string}
 */
exports.toHexString = function toHexString (hash) {
  if (!Buffer.isBuffer(hash)) {
    throw new Error('must be passed a buffer')
  }

  return hash.toString('hex')
}

/**
 * Convert the given hex encoded string to a multihash.
 *
 * @param {string} hash
 * @returns {Buffer}
 */
exports.fromHexString = function fromHexString (hash) {
  return new Buffer(hash, 'hex')
}

/**
 * Convert the given multihash to a base58 encoded string.
 *
 * @param {Buffer} hash
 * @returns {string}
 */
exports.toB58String = function toB58String (hash) {
  if (!Buffer.isBuffer(hash)) {
    throw new Error('must be passed a buffer')
  }

  return bs58.encode(hash)
}

/**
 * Convert the given base58 encoded string to a multihash.
 *
 * @param {string|Buffer} hash
 * @returns {Buffer}
 */
exports.fromB58String = function fromB58String (hash) {
  let encoded = hash
  if (Buffer.isBuffer(hash)) {
    encoded = hash.toString()
  }

  return new Buffer(bs58.decode(encoded))
}

/**
 * Decode a hash from the given multihash.
 *
 * @param {Buffer} buf
 * @returns {{code: number, name: string, length: number, digest: Buffer}} result
 */
exports.decode = function decode (buf) {
  exports.validate(buf)

  const code = buf[0]

  return {
    code: code,
    name: cs.codes[code],
    length: buf[1],
    digest: buf.slice(2)
  }
}

/**
 *  Encode a hash digest along with the specified function code.
 *
 * > **Note:** the length is derived from the length of the digest itself.
 *
 * @param {Buffer} digest
 * @param {string|number} code
 * @param {number} [length]
 * @returns {Buffer}
 */
exports.encode = function encode (digest, code, length) {
  if (!digest || !code) {
    throw new Error('multihash encode requires at least two args: digest, code')
  }

  // ensure it's a hashfunction code.
  const hashfn = exports.coerceCode(code)

  if (!(Buffer.isBuffer(digest))) {
    throw new Error('digest should be a Buffer')
  }

  if (length == null) {
    length = digest.length
  }

  if (length && digest.length !== length) {
    throw new Error('digest length should be equal to specified length.')
  }

  if (length > 127) {
    throw new Error('multihash does not yet support digest lengths greater than 127 bytes.')
  }

  return Buffer.concat([new Buffer([hashfn, length]), digest])
}

/**
 * Converts a hash function name into the matching code.
 * If passed a number it will return the number if it's a valid code.
 * @param {string|number} name
 * @returns {number}
 */
exports.coerceCode = function coerceCode (name) {
  let code = name

  if (typeof name === 'string') {
    if (!cs.names[name]) {
      throw new Error(`Unrecognized hash function named: ${name}`)
    }
    code = cs.names[name]
  }

  if (typeof code !== 'number') {
    throw new Error(`Hash function code should be a number. Got: ${code}`)
  }

  if (!cs.codes[code] && !exports.isAppCode(code)) {
    throw new Error(`Unrecognized function code: ${code}`)
  }

  return code
}

/**
 * Checks wether a code is part of the app range
 *
 * @param {number} code
 * @returns {boolean}
 */
exports.isAppCode = function appCode (code) {
  return code > 0 && code < 0x10
}

/**
 * Checks whether a multihash code is valid.
 *
 * @param {number} code
 * @returns {boolean}
 */
exports.isValidCode = function validCode (code) {
  if (exports.isAppCode(code)) {
    return true
  }

  if (cs.codes[code]) {
    return true
  }

  return false
}

/**
 * Check if the given buffer is a valid multihash. Throws an error if it is not valid.
 *
 * @param {Buffer} multihash
 * @returns {undefined}
 * @throws {Error}
 */
function validate (multihash) {
  if (!(Buffer.isBuffer(multihash))) {
    throw new Error('multihash must be a Buffer')
  }

  if (multihash.length < 3) {
    throw new Error('multihash too short. must be > 3 bytes.')
  }

  if (multihash.length > 129) {
    throw new Error('multihash too long. must be < 129 bytes.')
  }

  let code = multihash[0]

  if (!exports.isValidCode(code)) {
    throw new Error(`multihash unknown function code: 0x${code.toString(16)}`)
  }

  if (multihash.slice(2).length !== multihash[1]) {
    throw new Error(`multihash length inconsistent: 0x${multihash.toString('hex')}`)
  }
}
exports.validate = validate

/**
 * Returns a prefix from a valid multihash. Throws an error if it is not valid.
 *
 * @param {Buffer} multihash
 * @returns {undefined}
 * @throws {Error}
 */
exports.prefix = function prefix (multihash) {
  validate(multihash)

  return multihash.slice(0, 2)
}
