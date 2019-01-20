

require('./check-versions')()
var febs = require('febs');
var ora = require('ora')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var fs = require('fs');

process.env.NODE_ENV = 'production'


// 参数解析.
var cmds = {};
var arguments = process.argv.splice(2);
for (var i = 0; i < arguments.length; i++) {
  arguments[i] = febs.string.trim(arguments[i]);
  if (arguments[i].indexOf('-') == 0) {
    let cc = arguments[i].indexOf('=');
    if (cc > 0) {
      cmds[febs.string.replace(arguments[i].substr(0, cc), '-', '')] = arguments[i].substr(cc+1);
    }
  }
}

// 输出目录.
var ParamOutput = cmds['output'];
var ParamInput = cmds['input'];
var ParamName = cmds['name'];
var ParamExternals = cmds['externals'];
var ParamSingleFile = cmds['singleFile'] == '1';
var ParamEntryFile = cmds['entryFile'];

if (febs.string.isEmpty(ParamOutput) || febs.string.isEmpty(ParamInput) || febs.string.isEmpty(ParamName)) {
  console.log(chalk.red(
    '  The parameter is error.\n' +
    '  Tip: --output=[output dir] --input=[input file] --name=[entry name] .\n'
  ))
  process.exit(0);
}

console.log(chalk.cyan(
  '  Will use below parameter:\n' +
  '   output = ' + ParamOutput + '\n' +
  '   input  = ' + ParamInput + '\n' +
  '   name   = ' + ParamName + '\n' + 
  '   externals = ' + ParamExternals + '\n'
));


// webpack.
var webpackConfig = require('./webpack.prod.conf')
let entries = {};


if (ParamSingleFile || febs.file.fileIsExist(ParamInput)) {

  let tt;
  if (febs.file.dirIsExist(ParamInput)) {
    tt = path.join(ParamInput, ParamEntryFile);
  }

  entries[ParamName] = tt;
}
else {
  let files = febs.file.dirExplorerFilesRecursive(ParamInput, /.*\.js$/);
  files.forEach(element => {
    entries[path.basename(element, '.js')] = path.join(ParamInput, element);
  });
} // if..else.

webpackConfig = webpackConfig(entries, ParamName, ParamOutput, ParamExternals);

var spinner = ora('building for production...')
spinner.start()

function buildSrc(cbStop, cbSuccess) {
  webpack(webpackConfig, function (err, stats) {
    if (err) {
      cbStop(err);
      throw err
    }
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if (febs.file.fileIsExist(ParamInput))
      febs.file.fileRemove(ParamInput);
    else
      febs.file.dirRemoveRecursive(ParamInput);

    cbSuccess();
  });
}

// start.
buildSrc(function() {
  spinner.stop();
}, function(){

  setTimeout(function() {
    function errorCB(err) {
      console.log(err);
      console.log(chalk.red('  Build error.\n'))
      process.exit(0);
    }
    spinner.stop();
    console.log(chalk.cyan('  Build complete.\n'))
    process.exit(0);
  }, 1000);
});

