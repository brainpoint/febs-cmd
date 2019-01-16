var path = require('path')

exports.assetsPath = function (_path) {
  var assetsSubDirectory = ''
  return path.posix.join(assetsSubDirectory, _path)
}

exports.assetsRefPath = function (_path) {
  var assetsSubDirectory = '..'
  return path.posix.join(assetsSubDirectory, _path)
}
