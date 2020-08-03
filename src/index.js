// @ts-check
/* eslint-disable guard-for-in */
/**
 * Multihash implementation in JavaScript.
 *
 * @module multihash
 */
'use strict'

const multibase = require('multibase')
const varint = require('varint')
const { names } = require('./constants')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayConcat = require('uint8arrays/concat')

const codes = {}

for (const key in names) {
  codes[names[key]] = key
}
exports.names = names
exports.codes = Object.freeze(codes)

/**
 * Convert the given multihash to a hex encoded string.
 *
 * @param {Uint8Array} hash
 * @returns {string}
 */
exports.toHexString = function toHexString (hash) {
  if (!(hash instanceof Uint8Array)) {
    throw new Error('must be passed a Uint8Array')
  }

  return uint8ArrayToString(hash, 'base16')
}

/**
 * Convert the given hex encoded string to a multihash.
 *
 * @param {string} hash
 * @returns {Uint8Array}
 */
exports.fromHexString = function fromHexString (hash) {
  return uint8ArrayFromString(hash, 'base16')
}

/**
 * Convert the given multihash to a base58 encoded string.
 *
 * @param {Uint8Array} hash
 * @returns {string}
 */
exports.toB58String = function toB58String (hash) {
  if (!(hash instanceof Uint8Array)) {
    throw new Error('must be passed a Uint8Array')
  }

  return uint8ArrayToString(multibase.encode('base58btc', hash)).slice(1)
}

/**
 * Convert the given base58 encoded string to a multihash.
 *
 * @param {string|Uint8Array} hash
 * @returns {Uint8Array}
 */
exports.fromB58String = function fromB58String (hash) {
  const encoded = hash instanceof Uint8Array
    ? uint8ArrayToString(hash)
    : hash

  return multibase.decode('z' + encoded)
}

/**
 * Decode a hash from the given multihash.
 *
 * @param {Uint8Array} bytes
 * @returns {{code: number, name: string, length: number, digest: Uint8Array}} result
 */
exports.decode = function decode (bytes) {
  if (!(bytes instanceof Uint8Array)) {
    throw new Error('multihash must be a Uint8Array')
  }

  if (bytes.length < 2) {
    throw new Error('multihash too short. must be > 2 bytes.')
  }

  const code = varint.decode(bytes)
  if (!exports.isValidCode(code)) {
    throw new Error(`multihash unknown function code: 0x${code.toString(16)}`)
  }
  bytes = bytes.slice(varint.decode.bytes)

  const len = varint.decode(bytes)
  if (len < 0) {
    throw new Error(`multihash invalid length: ${len}`)
  }
  bytes = bytes.slice(varint.decode.bytes)

  if (bytes.length !== len) {
    throw new Error(`multihash length inconsistent: 0x${uint8ArrayToString(bytes, 'base16')}`)
  }

  return {
    code,
    name: codes[code],
    length: len,
    digest: bytes
  }
}

/**
 *  Encode a hash digest along with the specified function code.
 *
 * > **Note:** the length is derived from the length of the digest itself.
 *
 * @param {Uint8Array} digest
 * @param {string|number} code
 * @param {number} [length]
 * @returns {Uint8Array}
 */
exports.encode = function encode (digest, code, length) {
  if (!digest || code === undefined) {
    throw new Error('multihash encode requires at least two args: digest, code')
  }

  // ensure it's a hashfunction code.
  const hashfn = exports.coerceCode(code)

  if (!(digest instanceof Uint8Array)) {
    throw new Error('digest should be a Uint8Array')
  }

  if (length == null) {
    length = digest.length
  }

  if (length && digest.length !== length) {
    throw new Error('digest length should be equal to specified length.')
  }

  const hash = varint.encode(hashfn)
  const len = varint.encode(length)
  return uint8ArrayConcat([hash, len, digest], hash.length + len.length + digest.length)
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
    if (names[name] === undefined) {
      throw new Error(`Unrecognized hash function named: ${name}`)
    }
    code = names[name]
  }

  if (typeof code !== 'number') {
    throw new Error(`Hash function code should be a number. Got: ${code}`)
  }

  if (codes[code] === undefined && !exports.isAppCode(code)) {
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

  if (codes[code]) {
    return true
  }

  return false
}

/**
 * Check if the given buffer is a valid multihash. Throws an error if it is not valid.
 *
 * @param {Uint8Array} multihash
 * @returns {void}
 * @throws {Error}
 */
function validate (multihash) {
  exports.decode(multihash) // throws if bad.
}
exports.validate = validate

/**
 * Returns a prefix from a valid multihash. Throws an error if it is not valid.
 *
 * @param {Uint8Array} multihash
 * @returns {Uint8Array}
 * @throws {Error}
 */
exports.prefix = function prefix (multihash) {
  validate(multihash)

  return multihash.subarray(0, 2)
}
