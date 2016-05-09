js-multihash
============

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Coverage Status](https://coveralls.io/repos/github/jbenet/js-multihash/badge.svg?branch=master)](https://coveralls.io/github/jbenet/js-multihash?branch=master)
[![Travis CI](https://travis-ci.org/jbenet/js-multihash.svg?branch=master)](https://travis-ci.org/jbenet/js-multihash)
[![Circle CI](https://circleci.com/gh/jbenet/js-multihash.svg?style=svg)](https://circleci.com/gh/jbenet/js-multihash)
[![Dependency Status](https://david-dm.org/jbenet/multihashes.svg?style=flat-square)](https://david-dm.org/jbenet/js-multihash)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> [multihash](//github.com/jbenet/multihash) implementation.

## Installation

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
<script src="https://npmcdn.com/multihashes/dist/index.min.js"></script>
<!-- OR -->
<script src="https://npmcdn.com/multihashes/dist/index.js"></script>
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

## License

MIT
