var invert = require('invert-hash')

var mh = module.exports = function () {
  if (arguments.length === 1) {
    return mh.decode.apply(this, arguments)
  } else if (arguments.length > 1) {
    return mh.encode.apply(this, arguments)
  }

  throw new Error('multihash must be called with the encode or decode parameters.')
}

// the multihash tables

mh.names = {
  'sha1': 0x11,
  'sha2-256': 0x12,
  'sha2-512': 0x13,
  'sha3': 0x14,
  'blake2b': 0x40,
  'blake2s': 0x41
}

mh.codes = invert(mh.names)

mh.defaultLengths = {
  0x11: 20,
  0x12: 32,
  0x13: 64,
  0x14: 64,
  0x40: 64,
  0x41: 32
}

// encode(hashfn, [length,] digest)
mh.encode = function MultihashEncode (digest, hashfn, length) {
  if (!digest || !hashfn) {
    throw new Error('multihash encode requires at least two args: hashfn, digest')
  }

  // ensure it's a hashfunction code.
  hashfn = mh.coerceCode(hashfn)

  if (!(Buffer.isBuffer(digest))) {
    throw new Error('digest should be a Buffer')
  }

  if (!length) {
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

// decode(mutlihash)
mh.decode = function MultihashDecode (multihash) {
  var err = mh.validate(multihash)
  if (err) {
    throw err
  }

  var output = {}
  output.code = multihash[0]
  output.name = mh.codes[output.code]
  output.length = multihash[1]
  output.digest = multihash.slice(2)
  return output
}

mh.validate = function validateMultihash (multihash) {
  if (!(Buffer.isBuffer(multihash))) {
    return new Error('multihash must be a Buffer')
  }

  if (multihash.length < 3) {
    return new Error('multihash too short. must be > 3 bytes.')
  }

  if (multihash.length > 129) {
    return new Error('multihash too long. must be < 129 bytes.')
  }

  if (!mh.isAppCode(multihash[0]) && !mh.codes[multihash[0]]) {
    return new Error('multihash unknown function code: 0x' + multihash[0].toString(16))
  }

  if (multihash.slice(2).length !== multihash[1]) {
    return new Error('multihash length inconsistent: 0x' + multihash.toString('hex'))
  }

  return false
}

mh.coerceCode = function coerceCode (hashfn) {
  var code = hashfn
  if (typeof hashfn === 'string') {
    if (!mh.names[hashfn]) {
      throw new Error('Unrecognized hash function named: ' + hashfn)
    }
    code = mh.names[hashfn]
  }

  if (typeof code !== 'number') {
    throw new Error('Hash function code should be a number. Got: ' + code)
  }

  if (!mh.codes[code] && !mh.isAppCode(code)) {
    throw new Error('Unrecognized function code: ' + code)
  }

  return code
}

mh.isAppCode = function isAppCode (code) {
  return code > 0 && code < 0x10
}
