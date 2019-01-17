var path = require('path')
var utils = require('./utils')
var styleLoader = require('./loader/style-loader')
var webpack = require('webpack')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
// var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
var HtmlWebpackProcessPlugin = require('./plugin/html-webpack-process-plugin')
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var entry = require('./config/entry');

var webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: styleLoader.styleLoaders({
      sourceMap: true,
      extract: true
    })
  },
  devtool: '#source-map',
  // output: {
  //   path: config.build.assetsRoot,
  //   filename: utils.assetsPath('[name].js'),
  //   chunkFilename: utils.assetsPath('[id].js')
  // },
  plugins: [
    // new webpack.IgnorePlugin(/node_modules/),
    // http://vuejs.github.io/vue-loader/sen/workflow/production.html
    // new webpack.DefinePlugin({
    //   'process.env': env,
    //   'require(\'febs\')': '',
    // }),
    // TODO: 
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false,
    //     drop_console: false,
    //   },
    //   output: {
    //     quote_keys: true,
    //     comments: false,
    //     beautify: false,
    //   },
    //   mangle: {
    //     screw_ie8: false
    //   },
    //   sourceMap: true,
    // }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('[name].css'),
      ignoreOrder: false,
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    // new OptimizeCSSPlugin({
    //   cssProcessorOptions: {
    //     safe: true
    //   }
    // }),
  ].concat(entry, 
    [
    // split vendor js into its own file
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor',
    //   minChunks: function (module, count) {
    //     // any required modules inside node_modules are extracted to vendor
    //     return (
    //       module.resource &&
    //       /\.js$/.test(module.resource) &&
    //       module.resource.indexOf(
    //         path.join(__dirname, '../node_modules')
    //       ) === 0
    //     )
    //   }
    // }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'manifest',
    //   chunks: ['vendor']
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: ['vendor'],
    //   minChunks: Infinity
    // }),
    // copy custom static assets
    // new CopyWebpackPlugin([
    //   {
    //     from: path.resolve(__dirname, '../'),
    //     to: config.build.assetsSubDirectory,
    //     ignore: ['.*']
    //   }
    // ]),
    // service worker caching
    // new SWPrecacheWebpackPlugin({
    //   cacheId: 'my-vue-app',
    //   filename: 'service-worker.js',
    //   staticFileGlobs: [distDir+'/**/*.{js,html,css}'],
    //   minify: true,
    //   stripPrefix: distDir+'/'
    // })
  ])
})

// if (config.build.productionGzip) {
//   var CompressionWebpackPlugin = require('compression-webpack-plugin')

//   webpackConfig.plugins.push(
//     new CompressionWebpackPlugin({
//       asset: '[path].gz[query]',
//       algorithm: 'gzip',
//       test: new RegExp(
//         '\\.(' +
//         ['js', 'css'].join('|') +
//         ')$'
//       ),
//       threshold: 10240,
//       minRatio: 0.8
//     })
//   )
// }

// if (config.build.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    analyzerHost: '127.0.0.1',
    analyzerPort: 8888,
    reportFilename: 'report.html',
    openAnalyzer: true, 
  }))
// }

webpackConfig.plugins.push(new HtmlWebpackProcessPlugin());

module.exports = function(entries, name, output) {
  webpackConfig.entry = entries;
  webpackConfig.output.library = name;
  webpackConfig.output.path = output;
  return webpackConfig;
}  
