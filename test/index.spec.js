/* eslint-env mocha */
/* eslint max-nested-callbacks: off */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)
const expect = chai.expect
const bufeq = require('buffer-equal')
const bs58 = require('bs58')

const mh = require('../lib')
const constants = require('../lib/constants')
const validCases = require('./fixtures/valid')
const invalidCases = require('./fixtures/invalid')

function sample (code, size, hex) {
  return Buffer.concat([
    Buffer.from([code, size]),
    Buffer.from(hex, 'hex')
  ])
}

describe('multihash', () => {
  describe('toHexString', () => {
    it('valid', () => {
      validCases.forEach((test) => {
        const code = test.encoding.code
        const buf = mh.encode(Buffer.from(test.hex, 'hex'), code)
        expect(
          mh.toHexString(buf)
        ).to.be.eql(
          buf.toString('hex')
        )
      })
    })

    it('invalid', () => {
      expect(
        () => mh.toHexString('hello world')
      ).to.throw(
        /must be passed a buffer/
      )
    })
  })

  describe('fromHexString', () => {
    it('valid', () => {
      validCases.forEach((test) => {
        const code = test.encoding.code
        const buf = mh.encode(Buffer.from(test.hex, 'hex'), code)
        expect(
          mh.fromHexString(buf.toString('hex')).toString('hex')
        ).to.be.eql(
          buf.toString('hex')
        )
      })
    })
  })

  describe('toB58String', () => {
    it('valid', () => {
      validCases.forEach((test) => {
        const code = test.encoding.code
        const buf = mh.encode(Buffer.from(test.hex, 'hex'), code)
        expect(
          mh.toB58String(buf)
        ).to.be.eql(
          bs58.encode(buf)
        )
      })
    })

    it('invalid', () => {
      expect(
        () => mh.toB58String('hello world')
      ).to.throw(
        /must be passed a buffer/
      )
    })
  })

  describe('fromB58String', () => {
    it('valid', () => {
      const src = 'QmPfjpVaf593UQJ9a5ECvdh2x17XuJYG5Yanv5UFnH3jPE'
      const expected = Buffer.from('122013bf801597d74a660453412635edd8c34271e5998f801fac5d700c6ce8d8e461', 'hex')

      expect(
        mh.fromB58String(src)
      ).to.be.eql(
        expected
      )

      expect(
        mh.fromB58String(Buffer.from(src))
      ).to.be.eql(
        expected
      )
    })
  })

  describe('decode', () => {
    it('valid', () => {
      validCases.forEach((test) => {
        const code = test.encoding.code
        const buf = sample(code, test.size, test.hex)
        const name = test.encoding.name
        const d1 = Buffer.from(test.hex, 'hex')
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
          mh.encode(Buffer.from(test.hex, 'hex'), code),
          mh.encode(Buffer.from(test.hex, 'hex'), name)
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
        () => mh.encode(Buffer.from('hello'), 0x11, 2)
      ).to.throw(
        /length should be equal/
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

      const longBuffer = Buffer.alloc(150, 'a')
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
        'sha3-512': 0x14
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
        () => mh.coerceCode(Buffer.from('hello'))
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

  it('prefix', () => {
    const multihash = mh.encode(Buffer.from('hey'), 0x11, 3)
    const prefix = mh.prefix(multihash)
    expect(prefix.toString('hex')).to.eql('1103')
  })

  it('prefix throws on invalid multihash', () => {
    const multihash = Buffer.from('definitely not valid')

    expect(() => mh.prefix(multihash)).to.throw()
  })

  describe('constants', () => {
    it('exported', () => {
      expect(mh.names).to.equal(constants.names)
      expect(mh.codes).to.equal(constants.codes)
      expect(mh.defaultLengths).to.equal(constants.defaultLengths)
    })

    it('frozen', () => {
      expect(Object.isFrozen(mh.names)).to.be.true()
      expect(Object.isFrozen(mh.codes)).to.be.true()
      expect(Object.isFrozen(mh.defaultLengths)).to.be.true()
    })
  })
})
