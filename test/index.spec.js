/* eslint-env mocha */
/* eslint max-nested-callbacks: off */
'use strict'

const { expect } = require('aegir/utils/chai')
const multibase = require('multibase')
const mh = require('../src')
const constants = require('../src/constants')
const validCases = require('./fixtures/valid')
const invalidCases = require('./fixtures/invalid')
const uint8ArrayToString = require('uint8arrays/to-string')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayEquals = require('uint8arrays/equals')

/**
 * @typedef {import('../src/constants.js').HashName} HashName
 * @typedef {import('../src/constants.js').HashCode} HashCode
 */

/**
 * @param {string | number} code
 * @param {number} size
 * @param {string} hex
 */
function sample (code, size, hex) {
  /**
   * @param {number | string} i
   */
  const toHex = (i) => {
    if (typeof i === 'string') {
      return i
    }
    const h = i.toString(16)
    return h.length % 2 === 1 ? `0${h}` : h
  }
  return uint8ArrayFromString(`${toHex(code)}${toHex(size)}${hex}`, 'base16')
}

/**
 * @param {string} description
 * @param {(test: { encodeText: (text: string) => Uint8Array, encodeHex: (text: string) => Uint8Array }) => void} test
 */
const they = (description, test) => {
  it(description, () => test({
    encodeText: (text) => uint8ArrayFromString(text),
    encodeHex: (text) => uint8ArrayFromString(text, 'base16')
  }))
}

describe('multihash', () => {
  describe('toHexString', () => {
    they('valid', ({ encodeHex }) => {
      validCases.forEach((test) => {
        const code = /** @type { import("../src/constants").HashCode} */(test.encoding.code)
        const buf = mh.encode(encodeHex(test.hex), code)
        expect(
          mh.toHexString(buf)
        ).to.be.eql(
          uint8ArrayToString(buf, 'base16')
        )
      })
    })

    it('invalid', () => {
      expect(
        // @ts-ignore
        () => mh.toHexString('hello world')
      ).to.throw(
        /must be passed a Uint8Array/
      )
    })
  })

  describe('fromHexString', () => {
    they('valid', ({ encodeHex }) => {
      validCases.forEach((test) => {
        const code = test.encoding.code
        const buf = mh.encode(encodeHex(test.hex), code)
        expect(
          uint8ArrayToString(mh.fromHexString(uint8ArrayToString(buf, 'base16')), 'base16')
        ).to.be.eql(
          uint8ArrayToString(buf, 'base16')
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
          uint8ArrayToString(multibase.encode('base58btc', buf)).slice(1)
        )
      })
    })

    it('invalid', () => {
      expect(
        // @ts-expect-error
        () => mh.toB58String('hello world')
      ).to.throw(
        /must be passed a Uint8Array/
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
        const d1 = uint8ArrayFromString(test.hex, 'base16')
        const length = d1.length

        const r = mh.decode(buf)
        const d2 = r.digest

        expect(r.code).to.equal(code)
        expect(r.name).to.equal(name)
        expect(r.length).to.equal(length)
        expect(uint8ArrayEquals(d1, d2)).to.equal(true)
      })
    })

    it('invalid', () => {
      expect(
        // @ts-expect-error
        () => mh.decode('hello')
      ).to.throw(
        /multihash must be a Uint8Array/
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
            uint8ArrayToString(res, 'base16')
          ).to.be.eql(
            uint8ArrayToString(buf, 'base16')
          )
        })
      })
    })

    they('invalid', ({ encodeText }) => {
      expect(
        // @ts-expect-error
        () => mh.encode()
      ).to.throw(
        /requires at least two args/
      )

      expect(
        // @ts-expect-error
        () => mh.encode('hello', 0x11)
      ).to.throw(
        /digest should be a Uint8Array/
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
          () => mh.validate(sample(test.code, test.size, test.hex))
        ).to.throw()
      })

      const longBuffer = new Uint8Array(150).fill(0)
      expect(
        () => mh.validate(longBuffer)
      ).to.throw()
    })
  })

  describe('isValidCode', () => {
    it('valid', () => {
      expect(
        // @ts-expect-error - app code
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
        // @ts-expect-error
        mh.isValidCode(0x10)
      ).to.be.eql(
        false
      )

      expect(
        // @ts-expect-error
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

      for (let m = 0x10; m <= 0xff; m++) {
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
      /** @type {keyof typeof names} */
      let name
      // eslint-disable-next-line guard-for-in
      for (name in names) {
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
      }
    })

    they('invalid', ({ encodeText }) => {
      const invalidNames = [
        'sha256',
        'sha9',
        'Blake4b'
      ]

      invalidNames.forEach((name) => {
        expect(
          // @ts-ignore
          () => mh.coerceCode(name)
        ).to.throw(
          `Unrecognized hash function named: ${name}`
        )
      })

      expect(
        // @ts-expect-error
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
    expect(uint8ArrayToString(prefix, 'base16')).to.eql('1103')
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
