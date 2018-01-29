'use strict'

module.exports = {
  // Have not used webpack so just copied proposed setup from
  // https://babeljs.io/docs/setup/#installation
  webpack: {
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        }
      ]
    }
  }
}
