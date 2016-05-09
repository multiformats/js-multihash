'use strict'

exports.names = {
  sha1: 0x11,
  'sha2-256': 0x12,
  'sha2-512': 0x13,
  sha3: 0x14,
  blake2b: 0x40,
  blake2s: 0x41
}

exports.codes = {
  0x11: 'sha1',
  0x12: 'sha2-256',
  0x13: 'sha2-512',
  0x14: 'sha3',
  0x40: 'blake2b',
  0x41: 'blake2s'
}

exports.defaultLengths = {
  0x11: 20,
  0x12: 32,
  0x13: 64,
  0x14: 64,
  0x40: 64,
  0x41: 32
}
