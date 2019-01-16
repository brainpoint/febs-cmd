



var htmlPlugs = [];
var newEntries = {
  // vendor: ['febs','febs-ui','febs-browser','vue']
  // polyfill: [
  //   'es5-shim',
  //   'es5-shim/es5-sham'
  // ]
};

if (process.env.NODE_ENV === 'production') { 
  // newEntries.vendor = [
  //   'js-sha1', 
  //   'store2', 
  //   'url',
  // ];
  // newEntries.vendor_handlebars = [
  //   'handlebars/dist/cjs/handlebars', 
  //   'handlebars/dist/cjs/handlebars.runtime', 
  // ];
}

// files.forEach(function(f){
//   var name = /.*(views\/.*?\/index)\.js$/.exec(f)[1];  // 得到views/xxxx/index这样的文件名.
//   var pageName = name.substring(5, name.lastIndexOf('/index'));
//   name = 'views/' + name.substring(6, name.lastIndexOf('/index'));
//   newEntries[name] = f;
  
//   htmlPlugs.push(createHtmlWebpack('index.html', pageName+'.html', ['manifest', 'vendor', 'vendor_handlebars', name]));
// });

module.exports = htmlPlugs;

module.exports.newEntries = newEntries;