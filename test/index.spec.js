/* eslint-env mocha */
/* eslint max-nested-callbacks: off */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)
const expect = chai.expect
const multibase = require('multibase')
const { Buffer } = require('buffer')
const mh = require('../src')
const constants = require('../src/constants')
const validCases = require('./fixtures/valid')
const invalidCases = require('./fixtures/invalid')
const textEncoder = typeof TextEncoder !== 'undefined'
  ? new TextEncoder()
  : new (require('util').TextEncoder)()

function sample (code, size, hex) {
  const toHex = (i) => {
    if (typeof i === 'string') {
      return i
    }
    const h = i.toString(16)
    return h.length % 2 === 1 ? `0${h}` : h
  }
  return Buffer.from(`${toHex(code)}${toHex(size)}${hex}`, 'hex')
}

const they = (description, test) => {
  it(`${description} (Buffer)`, () => test({
    encodeText: Buffer.from,
    encodeHex: (text) => Buffer.from(text, 'hex')
  }))

  it(`${description} (Uint8Array)`, () => test({
    encodeText: (text) => textEncoder.encode(text),
    encodeHex: (text) => {
      const { buffer, byteOffset, byteLength } = Buffer.from(text, 'hex')
      return new Uint8Array(buffer, byteOffset, byteLength)
    }
  }))
}

describe('multihash', () => {
  describe('toHexString', () => {
    they('valid', ({ encodeHex }) => {
      validCases.forEach((test) => {
        const code = test.encoding.code
        const buf = mh.encode(encodeHex(test.hex), code)
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
        /must be passed an Uint8Array/
      )
    })
  })

  describe('fromHexString', () => {
    they('valid', ({ encodeHex }) => {
      validCases.forEach((test) => {
        const code = test.encoding.code
        const buf = mh.encode(encodeHex(test.hex), code)
        expect(
          mh.fromHexString(buf.toString('hex')).toString('hex')
        ).to.be.eql(
          buf.toString('hex')
        )
      })
    })
  })

  describe('toB58String', () => {
    they('valid', ({ encodeHex }) => {
      validCases.forEach((test) => {
        const code = test.encoding.code
        const buf = mh.encode(encodeHex(test.hex), code)
        expect(
          mh.toB58String(buf)
        ).to.be.eql(
          multibase.encode('base58btc', buf).toString().slice(1)
        )
      })
    })

    it('invalid', () => {
      expect(
        () => mh.toB58String('hello world')
      ).to.throw(
        /must be passed an Uint8Array/
      )
    })
  })

  describe('fromB58String', () => {
    they('valid', ({ encodeHex, encodeText }) => {
      const src = 'QmPfjpVaf593UQJ9a5ECvdh2x17XuJYG5Yanv5UFnH3jPE'
      const expected = encodeHex('122013bf801597d74a660453412635edd8c34271e5998f801fac5d700c6ce8d8e461')

      expect(
        mh.fromB58String(src)
      ).to.be.eql(
        expected
      )

      expect(
        mh.fromB58String(encodeText(src))
      ).to.be.eql(
        expected
      )
    })
  })

  describe('decode', () => {
    it('valid', () => {
      validCases.forEach((test) => {
        const code = test.encoding.code
        const buf = sample(test.encoding.varint || code, test.size, test.hex)
        const name = test.encoding.name
        const d1 = Buffer.from(test.hex, 'hex')
        const length = d1.length

        const r = mh.decode(buf)
        const d2 = r.digest

        expect(r.code).to.equal(code)
        expect(r.name).to.equal(name)
        expect(r.length).to.equal(length)
        expect(d1.equals(d2)).to.equal(true)
      })
    })

    it('invalid', () => {
      expect(
        () => mh.decode('hello')
      ).to.throw(
        /multihash must be an Uint8Array/
      )
    })
  })

  describe('encode', () => {
    they('valid', ({ encodeHex }) => {
      validCases.forEach((test) => {
        const code = test.encoding.code
        const name = test.encoding.name
        const buf = sample(test.encoding.varint || code, test.size, test.hex)
        const results = [
          mh.encode(encodeHex(test.hex), code),
          mh.encode(encodeHex(test.hex), name)
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

    they('invalid', ({ encodeText }) => {
      expect(
        () => mh.encode()
      ).to.throw(
        /requires at least two args/
      )

      expect(
        () => mh.encode('hello', 0x11)
      ).to.throw(
        /digest should be an Uint8Array/
      )

      expect(
        () => mh.encode(encodeText('hello'), 0x11, 2)
      ).to.throw(
        /length should be equal/
      )
    })
  })

  describe('validate', () => {
    it('valid', () => {
      validCases.forEach((test) => {
        expect(
          () => mh.validate(sample(test.encoding.varint || test.encoding.code, test.size, test.hex))
        ).to.not.throw()
      })
    })

    it('invalid', () => {
      invalidCases.forEach((test) => {
        expect(
          () => mh.validate(sample(test.encoding.varint || test.code, test.size, test.hex))
        ).to.throw()
      })

      const longBuffer = Uint8Array.from(Buffer.alloc(150, 'a'))
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

    they('invalid', ({ encodeText }) => {
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
        () => mh.coerceCode(encodeText('hello'))
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

  they('prefix', ({ encodeText }) => {
    const multihash = mh.encode(encodeText('hey'), 0x11, 3)
    const prefix = mh.prefix(multihash)
    expect(prefix.toString('hex')).to.eql('1103')
  })

  they('prefix throws on invalid multihash', ({ encodeText }) => {
    const multihash = encodeText('definitely not valid')

    expect(() => mh.prefix(multihash)).to.throw()
  })

  describe('constants', () => {
    it('exported', () => {
      expect(mh.names).to.equal(constants.names)
    })

    it('frozen', () => {
      expect(Object.isFrozen(mh.names)).to.be.true()
      expect(Object.isFrozen(mh.codes)).to.be.true()
    })
  })
})
