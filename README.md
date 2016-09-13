js-multihash
============

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-multiformats-blue.svg?style=flat-square)](http://github.com/multiformats/multiformats)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Coverage Status](https://coveralls.io/repos/github/multiformats/js-multihash/badge.svg?branch=master)](https://coveralls.io/github/multiformats/js-multihash?branch=master)
[![Travis CI](https://travis-ci.org/multiformats/js-multihash.svg?branch=master)](https://travis-ci.org/multiformats/js-multihash)
[![Circle CI](https://circleci.com/gh/multiformats/js-multihash.svg?style=svg)](https://circleci.com/gh/multiformats/js-multihash)
[![Dependency Status](https://david-dm.org/multiformats/js-multihash.svg?style=flat-square)](https://david-dm.org/multiformats/js-multihash)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> multihash implementation in node.js

This is the [multihash](//github.com/multiformats/multihash) implementation in Node.

## Table of Contents

- [Install](#install)
  - [In Node.js through npm](#in-nodejs-through-npm)
  - [Browser: Browserify, Webpack, other bundlers](#browser-browserify-webpack-other-bundlers)
  - [In the Browser through `<script>` tag](#in-the-browser-through-script-tag)
    - [Gotchas](#gotchas)
- [Usage](#usage)
- [API](#api)
  - [`decode(buf)`](#decodebuf)
  - [`encode(digest, hashfn[, length])`](#encodedigest-hashfn-length)
  - [`toHexString(multihash)`](#tohexstringmultihash)
  - [`fromHexString(string)`](#fromhexstringstring)
  - [`toB58String(multihash)`](#tob58stringmultihash)
  - [`fromB58String(string)`](#fromb58stringstring)
  - [`coerceCode(name)`](#coercecodename)
  - [`isAppCode(code)`](#isappcodecode)
  - [`isValidCode(code)`](#isvalidcodecode)
  - [`validate(multihash)`](#validatemultihash)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Install

### In Node.js through npm

```bash
$ npm install --save multihashes # node the name of the module is multihashes
```

### Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact an ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust asset management process.

```js
var multihashes = require('multihashes')
```


### In the Browser through `<script>` tag

Loading this module through a script tag will make the ```Multihashes``` obj available in the global namespace.

```
<script src="https://unpkg.com/multihashes/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/multihashes/dist/index.js"></script>
```

#### Gotchas

You will need to use Node.js `Buffer` API compatible, if you are running inside the browser, you can access it by `multihash.Buffer` or you can install Feross's [Buffer](https://github.com/feross/buffer).

## Usage

```js
> var multihash = require('multihashes')
> var buf = new Buffer('0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33', 'hex')

> var encoded = multihash.encode(buf, 'sha1')
> console.log(encoded)
<Buffer 11 14 0b ee c7 b5 ea 3f 0f db c9 5d 0d d4 7f 3c 5b c2 75 da 8a 33>

> multihash.decode(encoded)
{ code: 17,
  name: 'sha1',
  length: 20,
  digest: <Buffer 0b ee c7 b5 ea 3f 0f db c9 5d 0d d4 7f 3c 5b c2 75 da 8a 33> }
```

## API

### `decode(buf)`

- `buf: Buffer`

Decode a hash from the given multihash.

Returns an object of the form,

```js
{
  code: Number,
  name: String,
  length: Number,
  digest: Buffer
}
```

### `encode(digest, hashfn[, length])`

- `digest: Buffer`
- `hashfn: String|Number`
- `length: Number` (optional)

Encode a hash digest along with the specified function code.

> Note: the length is derived from the length of the digest itself.

Returns a buffer.

### `toHexString(multihash)`

- `multihash: Buffer`

Convert the given multihash to a hex encoded string.

Returns a string.

### `fromHexString(string)`

- `string: String`

Convert the given hex encoded string to a multihash (a `Buffer`).

Returns a buffer.

### `toB58String(multihash)`

- `multihash: Buffer`

Convert the given multihash to a base58 encoded string.

Returns a string.

### `fromB58String(string)`

- `string: String`

Convert the given base58 encoded string to a multihash (a `Buffer`).

Returns a buffer.

### `coerceCode(name)`

- `name: String|Number`

Converts a given hash function into the matching code. If passed a number it will return the number if it's a valid code.

Returns a number.

### `isAppCode(code)`

- `code: Number`

Checks wether a code is part of the app range.

Returns a boolean.

### `isValidCode(code)`

- `code: Number`

Checks whether a multihash code is valid.

Returns a boolean.

### `validate(multihash)`

- `multihash: Buffer`

Check if the given buffer is a valid multihash. Throws an error if it is not valid.

## Maintainers

Captain: [@diasdavid](https://github.com/diasdavid).

## Contribute

Contributions welcome. Please check out [the issues](https://github.com/multiformats/js-multihash/issues).

Check out our [contributing document](https://github.com/multiformats/multiformats/blob/master/contributing.md) for more information on how we work, and about contributing in general. Please be aware that all interactions related to multiformats are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT] © Protocol Labs Inc.
