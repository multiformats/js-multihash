invert-hash
===========
Computes the inverse of a hash, assuming that it is bijective.

# Example

```javascript

var invert = require("invert-hash")

console.log(invert({
  'a': 1,
  'b': 2,
  'c': 3
}))

//Prints out:
//
//  {
//    1: 'a',
//    2: 'b',
//    3: 'c'
//  }
//
```

# Install

    npm install invert-hash

### `require("invert-hash")(obj)`
Computes the inverse of a hash

* `obj` is a hash object

**Returns** An object whose keys are the values of `obj` and whose values are the `keys` of object.

# Credits
(c) 2013 Mikola Lysenko. MIT License
