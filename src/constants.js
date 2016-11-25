/* eslint quote-props: off */
/* eslint key-spacing: off */
'use strict'

exports.names = {
  'sha1':       0x11,
  'sha2-256':   0x12,
  'sha2-512':   0x13,
  'sha3-224':   0x17,
  'sha3-256':   0x16,
  'sha3-384':   0x15,
  'sha3-512':   0x14,
  'shake-128':  0x18,
  'shake-256':  0x19,
  'keccak-224': 0x1A,
  'keccak-256': 0x1B,
  'keccak-384': 0x1C,
  'keccak-512': 0x1D,
  'blake2b':    0x40,
  'blake2s':    0x41
}

exports.codes = {
  0x11: 'sha1',
  0x12: 'sha2-256',
  0x13: 'sha2-512',
  0x17: 'sha3-224',
  0x16: 'sha3-256',
  0x15: 'sha3-384',
  0x14: 'sha3-512',
  0x18: 'shake-128',
  0x19: 'shake-256',
  0x1A: 'keccak-224',
  0x1B: 'keccak-256',
  0x1C: 'keccak-384',
  0x1D: 'keccak-512',
  0x40: 'blake2b',
  0x41: 'blake2s'
}

exports.defaultLengths = {
  0x11: 20,
  0x12: 32,
  0x13: 64,
  0x17: 28,
  0x16: 32,
  0x15: 48,
  0x14: 64,
  0x18: 32,
  0x19: 64,
  0x1A: 28,
  0x1B: 32,
  0x1C: 48,
  0x1D: 64,
  0x40: 64,
  0x41: 32
}
