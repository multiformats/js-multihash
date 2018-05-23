if(!process.env.IS_WEBPACK_BUILD){
    require('flow-remove-types/register')
    require = require("esm")(module/*, options*/)
}
module.exports = require("./multihash.js")