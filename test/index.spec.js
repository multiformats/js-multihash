/* eslint-env mocha */
/* eslint max-nested-callbacks: off */
'use strict'

const expect = require('chai').expect
const bufeq = require('buffer-equal')

const mh = require('../src')
const validCases = require('./fixtures/valid')
const invalidCases = require('./fixtures/invalid')

function sample (code, size, hex) {
  return Buffer.concat([
    new Buffer([code, size]),
    new Buffer(hex, 'hex')
  ])
}

describe('mh', () => {
  describe('decode', () => {
    it('valid', () => {
      validCases.forEach((test) => {
        const code = test.encoding.code
        const buf = sample(code, test.size, test.hex)
        const name = test.encoding.name
        const d1 = new Buffer(test.hex, 'hex')
        const length = d1.length

        const r = mh.decode(buf)
        const d2 = r.digest

        expect(r.code).to.equal(code)
        expect(r.name).to.equal(name)
        expect(r.length).to.equal(length)
        expect(bufeq(d1, d2)).to.equal(true)
      })
    })

    it('invalid', () => {
      expect(
        () => mh.decode('hello')
      ).to.throw(
        /multihash must be a Buffer/
      )
    })
  })

  describe('encode', () => {
    it('valid', () => {
      validCases.forEach((test) => {
        const code = test.encoding.code
        const name = test.encoding.name
        const buf = sample(code, test.size, test.hex)
        const results = [
          mh.encode(new Buffer(test.hex, 'hex'), code),
          mh.encode(new Buffer(test.hex, 'hex'), name)
        ]

        results.forEach((res) => {
          expect(
            res.toString('hex')
          ).to.be.eql(
            buf.toString('hex')
          )
        })
      })
    })

    it('invalid', () => {
      expect(
        () => mh.encode()
      ).to.throw(
        /requires at least two args/
      )

      expect(
        () => mh.encode('hello', 0x11)
      ).to.throw(
        /digest should be a Buffer/
      )

      expect(
        () => mh.encode(new Buffer('hello'), 0x11, 2)
      ).to.throw(
        /length should be equal/
      )

      const longBuffer = new Buffer(150)
      longBuffer.fill('a')
      expect(
        () => mh.encode(longBuffer, 0x11)
      ).to.throw(
        /not yet support/
      )
    })
  })

  describe('validate', () => {
    it('valid', () => {
      validCases.forEach((test) => {
        expect(
          () => mh.validate(sample(test.encoding.code, test.size, test.hex))
        ).to.not.throw()
      })
    })

    it('invalid', () => {
      invalidCases.forEach((test) => {
        expect(
          () => mh.validate(sample(test.code, test.size, test.hex))
        ).to.throw()
      })

      const longBuffer = new Buffer(150)
      longBuffer.fill('a')
      expect(
        () => mh.validate(longBuffer)
      ).to.throw()
    })
  })

  describe('isValidCode', () => {
    it('valid', () => {
      expect(
        mh.isValidCode(2)
      ).to.be.eql(
        true
      )

      expect(
        mh.isValidCode(0x13)
      ).to.be.eql(
        true
      )
    })

    it('invalid', () => {
      expect(
        mh.isValidCode(0x10)
      ).to.be.eql(
        false
      )

      expect(
        mh.isValidCode(0x90)
      ).to.be.eql(
        false
      )
    })
  })

  describe('isAppCode', () => {
    it('valid', () => {
      for (let n = 1; n < 0x10; n++) {
        expect(
          mh.isAppCode(n)
        ).to.equal(
          true
        )
      }
    })

    it('invalid', () => {
      expect(
        mh.isAppCode(0)
      ).to.equal(
        false
      )

      for (var m = 0x10; m <= 0xff; m++) {
        expect(
          mh.isAppCode(m)
        ).to.equal(
          false
        )
      }
    })
  })

  describe('coerceCode', () => {
    it('valid', () => {
      const names = {
        sha1: 0x11,
        'sha2-256': 0x12,
        'sha2-512': 0x13,
        'sha3-512': 0x14,
        blake2b: 0x40,
        blake2s: 0x41
      }

      Object.keys(names).forEach((name) => {
        expect(
          mh.coerceCode(name)
        ).to.be.eql(
          names[name]
        )

        expect(
          mh.coerceCode(names[name])
        ).to.be.eql(
          names[name]
        )
      })
    })

    it('invalid', () => {
      const invalidNames = [
        'sha256',
        'sha9',
        'Blake4b'
      ]

      invalidNames.forEach((name) => {
        expect(
          () => mh.coerceCode(name)
        ).to.throw(
          `Unrecognized hash function named: ${name}`
        )
      })

      expect(
        () => mh.coerceCode(new Buffer('hello'))
      ).to.throw(
        /should be a number/
      )

      expect(
        () => mh.coerceCode(0x99)
      ).to.throw(
        /Unrecognized function code/
      )
    })
  })
})
