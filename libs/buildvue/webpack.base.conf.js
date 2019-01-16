var path = require('path')
var utils = require('./utils')
var vueLoader = require('./loader/vue-loader')
var jsLoader = require('./loader/js-loader')

var isProduction = process.env.NODE_ENV === 'production'

var entry = require('./config/entry');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

var newEntries = entry.newEntries;

var config = {
  entry: newEntries,
  output: {
    // path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: './',
    library: 'components',
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('components-vue')
    }
  },
  module: {
    rules: [
      vueLoader,
      jsLoader.preLoader({include:[/.*/]}),
      // jsLoader.postLoader,
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('imgs/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.hbs$/,
        loader: "handlebars-loader",
        query: {
          partialDirs: [
            resolve('src/partials')
          ],
          helperDirs: [
            resolve('helpers')
          ]
        }
      }
    ]
  },
  externals: {
    'vue': {
      root: 'vue',
      commonjs: 'vue',
      commonjs2: 'vue',
      amd: 'vue'
    },
    'febs': {
      root: 'febs',
      commonjs: 'febs',
      commonjs2: 'febs',
      amd: 'febs'
    },
    'febs-ui': {
      root: 'febs-ui',
      commonjs: 'febs-ui',
      commonjs2: 'febs-ui',
      amd: 'febs-ui'
    },
    'febs-browser': {
      root: 'febs-browser',
      commonjs: 'febs-browser',
      commonjs2: 'febs-browser',
      amd: 'febs-browser'
    },
    'lodash': {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_'
    }
  }
}

module.exports = config;
