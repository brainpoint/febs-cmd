var styleLoader = require('./style-loader')
var config = require('../config')
var isProduction = process.env.NODE_ENV === 'production'

exports.loader = {
  loaders: styleLoader.cssLoaders({
    sourceMap: isProduction
      ? config.build.productionSourceMap
      : config.dev.cssSourceMap,
    extract: isProduction
  })
}


module.exports =
{
  test: /\.vue$/,
  loader: 'vue-loader',
  options: exports.loader
};