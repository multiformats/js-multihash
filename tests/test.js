var bufeq = require('buffer-equal')
var multihash = require('../src')
var invert = require('invert-hash')
var test = require('tape')

var names = {
  'sha1': 0x11,
  'sha2-256': 0x12,
  'sha2-512': 0x13,
  'sha3': 0x14,
  'blake2b': 0x40,
  'blake2s': 0x41
}

var codes = invert(names)

// maybe a silly test, but makes it so changing
// the table accidentally has to happen twice.
test('multihash table', function (t) {
  for (var n in names) {
    t.is(multihash.names[n], names[n], n + ' name')
    t.is(multihash.codes[names[n]], n, n + ' code')
  }

  t.is(ObjectLength(multihash.names), 6)
  t.is(ObjectLength(multihash.codes), 6)
  t.end()
})

test('isAppCode', function (t) {
  t.is(multihash.isAppCode(0), false)
  for (var n = 1; n < 0x10; n++) {
    t.is(multihash.isAppCode(n), true)
  }
  for (var m = 0x10; m <= 0xff; m++) {
    t.is(multihash.isAppCode(m), false)
  }
  t.end()
})

test('coerceCode', function (t) {
  for (var n in names) {
    var c = names[n]
    t.is(multihash.coerceCode(n), c, n + ' coerced to ' + c)
    t.is(multihash.coerceCode(c), c, n + ' coerced to ' + c)
  }
  t.end()
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

test('encode', function (t) {
  for (var test in testCases) {
    test = testCases[test]
    var hex = test[0][0]
    var args = [new Buffer(hex, 'hex')].concat(test[0].slice(1))
    var r = multihash.encode.apply(this, args)

    var m = 'test encoding ' + test[0][1] + ' ' + hex
    t.ok(bufeq(r, test[1]), m)
  }
  t.end()
})

test('decode', function (t) {
  for (var test in testCases) {
    test = testCases[test]

    var buf = test[1]
    var code = multihash.coerceCode(test[0][1])
    var name = codes[code]
    var d1 = new Buffer(test[0][0], 'hex')
    var length = d1.length

    var r = multihash.decode(buf)
    var d2 = r.digest

    t.is(r.code, code, 'code is ' + code)
    t.is(r.name, name, 'name is ' + name)
    t.is(r.length, length, 'length must be ' + length)
    t.ok(bufeq(d1, d2), 'digest decoding ' + test[0][0])
  }
  t.end()
})

var badTestCases = [
  encodedBuffer(0x00, 32, '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33'),
  encodedBuffer(0x11, 21, '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33'),
  encodedBuffer(0x11, 20, '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a'),
  encodedBuffer(0x11, 20, ''),
  encodedBuffer(0x31, 20, '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33'),
  encodedBuffer(0x12, 32, '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7')
]

test('validate', function (t) {
  for (var test in badTestCases) {
    test = badTestCases[test]
    console.log(multihash.validate(test))
    t.ok(multihash.validate(test))
  }
  t.end()
})

function encodedBuffer (code, size, hex) {
  return Buffer.concat([
    new Buffer([code, size]),
    new Buffer(hex, 'hex')]
  )
}

function ObjectLength (obj) {
  var size = 0
  var key
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++
  }
  return size
}
