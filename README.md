js-multihash
============

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs) ![](https://img.shields.io/badge/coverage-%3F-yellow.svg?style=flat-square) [![Dependency Status](https://david-dm.org/jbenet/multihashes.svg?style=flat-square)](https://david-dm.org/jbenet/multihashes) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

[multihash](//github.com/jbenet/multihash) implementation.

## Installation

### In Node.js through npm

```bash
$ npm install --save multihashes # node the name of the module is multihashes
```

```javascript
var multihashes = require('multihashes')
```

### In the Browser through browserify

Same as in Node.js, you just have to [browserify](https://github.com/substack/js-browserify) the code before serving it. See the browserify repo for how to do that.

### In the Browser through `<script>` tag

Make the [multihashes.min.js](/dist/multihashes.min.js) available through your server and load it using a normal `<script>` tag, this will export the `multihashes` constructor on the `window` object, such that:

```JavaScript
var multihashes = window.multihashes
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
