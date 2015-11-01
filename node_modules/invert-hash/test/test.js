var invert = require("../invert.js")

require("tap").test("invert-hash", function(t) {

  function testInverse(obj) {
    var inv = invert(obj)
    console.log(obj, inv)
    for(var i in obj) {
      t.equals(''+inv[obj[i]], ''+i)
    }
    for(var i in inv) {
      t.equals(''+obj[inv[i]], ''+i)
    }
  }
  
  testInverse({
    'a': 1,
    'b': 2,
    'c': 3
  })
  
  t.end()
})