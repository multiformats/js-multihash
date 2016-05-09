  /* eslint-env mocha */
'use strict'

const bufeq = require('buffer-equal')
const multihash = require('../src')
const invert = require('invert-hash')
const expect = require('chai').expect

const names = {
  sha1: 0x11,
  'sha2-256': 0x12,
  'sha2-512': 0x13,
  sha3: 0x14,
  blake2b: 0x40,
  blake2s: 0x41
}

var codes = invert(names)

// maybe a silly test, but makes it so changing
// the table accidentally has to happen twice.
describe('multihash tests', (done) => {
  it('multihash table', (done) => {
    for (var n in names) {
      if (names.hasOwnProperty(n)) {
        expect(multihash.names[n]).to.equal(names[n])
        expect(multihash.codes[names[n]]).to.equal(n)
      }
    }
    done()
  })

  it('isAppCode', (done) => {
    expect(multihash.isAppCode(0)).to.equal(false)

    for (var n = 1; n < 0x10; n++) {
      expect(multihash.isAppCode(n)).to.equal(true)
    }
    for (var m = 0x10; m <= 0xff; m++) {
      expect(multihash.isAppCode(m)).to.equal(false)
    }
    done()
  })

  it('coerceCode', (done) => {
    for (var n in names) {
      if (names.hasOwnProperty(n)) {
        var c = names[n]
        expect(multihash.coerceCode(n)).to.equal(c)
        expect(multihash.coerceCode(c)).to.equal(c)
      }
    }
    done()
  })

  var testCases = [
    [
      ['0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33', 'sha1'],
      encodedBuffer(0x11, 20, '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33')
    ], [
      ['0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33', 0x11],
      encodedBuffer(0x11, 20, '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33')
    ], [
      ['0beec7b8', 'sha1'],
      encodedBuffer(0x11, 4, '0beec7b8')
    ], [
      ['2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae', 'sha2-256'],
      encodedBuffer(0x12, 32, '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae')
    ], [
      ['2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae', 0x12],
      encodedBuffer(0x12, 32, '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae')
    ], [
      ['2c26b46b', 'sha2-256'],
      encodedBuffer(0x12, 4, '2c26b46b')
    ], [
      ['2c26b46b', 'blake2b'],
      encodedBuffer(0x40, 4, '2c26b46b')
    ]
  ]

  it('encode', (done) => {
    for (var test in testCases) {
      if (testCases.hasOwnProperty(test)) {
        test = testCases[test]
        var hex = test[0][0]
        var args = [new Buffer(hex, 'hex')].concat(test[0].slice(1))
        var r = multihash.encode.apply(this, args)

        expect(bufeq(r, test[1])).to.be.ok
      }
    }
    done()
  })

  it('decode', (done) => {
    for (var test in testCases) {
      if (testCases.hasOwnProperty(test)) {
        test = testCases[test]

        var buf = test[1]
        var code = multihash.coerceCode(test[0][1])
        var name = codes[code]
        var d1 = new Buffer(test[0][0], 'hex')
        var length = d1.length

        var r = multihash.decode(buf)
        var d2 = r.digest

        expect(r.code).to.equal(code)
        expect(r.name).to.equal(name)
        expect(r.length).to.equal(length)
        expect(bufeq(d1, d2)).to.be.ok
      }
    }
    done()
  })

  var badTestCases = [
    encodedBuffer(0x00, 32, '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33'),
    encodedBuffer(0x11, 21, '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33'),
    encodedBuffer(0x11, 20, '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a'),
    encodedBuffer(0x11, 20, ''),
    encodedBuffer(0x31, 20, '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33'),
    encodedBuffer(0x12, 32, '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7')
  ]

  it('validate', (done) => {
    for (var test in badTestCases) {
      if (badTestCases.hasOwnProperty(test)) {
        test = badTestCases[test]
        // console.log(multihash.validate(test))
        expect(multihash.validate(test)).to.be.ok
      }
    }
    done()
  })
})

function encodedBuffer (code, size, hex) {
  return Buffer.concat([
    new Buffer([code, size]),
    new Buffer(hex, 'hex')]
  )
}
