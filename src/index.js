'use strict'

const bs58 = require('bs58')

const cs = require('./constants')

exports.toHexString = function toHexString (m) {
  if (!Buffer.isBuffer(m)) {
    throw new Error('must be passed a buffer')
  }

  return m.toString('hex')
}

exports.fromHexString = function fromHexString (s) {
  return new Buffer(s, 'hex')
}

exports.toB58String = function toB58String (m) {
  if (!Buffer.isBuffer(m)) {
    throw new Error('must be passed a buffer')
  }

  return bs58.encode(m)
}

exports.fromB58String = function fromB58String (s) {
  let encoded = s
  if (Buffer.isBuffer(s)) {
    encoded = s.toString()
  }

  return new Buffer(bs58.decode(encoded))
}

// Decode a hash from the given Multihash.
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

// Encode a hash digest along with the specified function code.
// Note: the length is derived from the length of the digest itself.
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

// Converts a hashfn name into the matching code
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

// Checks wether a code is part of the app range
exports.isAppCode = function appCode (code) {
  return code > 0 && code < 0x10
}

// Checks whether a multihash code is valid.
exports.isValidCode = function validCode (code) {
  if (exports.isAppCode(code)) {
    return true
  }

  if (cs.codes[code]) {
    return true
  }

  return false
}

exports.validate = function validate (multihash) {
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
