'use strict'

const fs = require('fs')
const path = require('path')
const http = require('ipfs-utils/src/http')
const url = 'https://raw.githubusercontent.com/multiformats/multicodec/master/table.csv'

const run = async () => {
  const rsp = await http.get(url)
  const lines = (await rsp.text()).split('\n')
  const processed = lines
    .slice(1, lines.length - 1)
    .map(l => {
      const [name, tag, code] = l.split(',')
      return [name.trim(), tag.trim(), code.trim()]
    })
    .filter(l => l[1] === 'multihash')
    .reduce((acc, l, index, arr) => {
      acc += `  '${l[0]}': ${l[2].replace('\'', '')}`

      if (index !== arr.length - 1) {
        acc += ',\n'
      }
      return acc
    }, '')

  const template = `/* eslint quote-props: off */
'use strict'

const names = Object.freeze({
${processed}
})

module.exports = { names }
`

  fs.writeFileSync(path.join(__dirname, 'src/constants.js'), template)
}

run()
