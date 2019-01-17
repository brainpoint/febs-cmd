/**
* @param opt: {
                include: [],
              } 
* @return: 
*/
exports.preLoader = function (opt) {
  return {
    test: /\.js$/,
    loader: 'babel-loader',
    include: opt.include,
    exclude: /(node_modules|bower_components)/,
    query: {
      presets: ['es2015', 'stage-0', 'es2015-loose'],
      plugins: [
        'transform-runtime',
        'transform-es3-property-literals',
        'transform-es3-member-expression-literals',
        'transform-es2015-modules-simple-commonjs',
      ]
    }
  };
}

exports.postLoader = {
  test: /.js$/,
  exclude: /(node_modules|bower_components)/,
  enforce: 'post', // post-loader处理
  loader: 'es3ify-loader'
};