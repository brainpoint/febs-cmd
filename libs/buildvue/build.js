

require('./check-versions')()
var febs = require('febs');
var ora = require('ora')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var fs = require('fs');

process.env.NODE_ENV = 'production'

var srcCwd = process.cwd();
function restoreCwd() {
  process.chdir(srcCwd);  
}

process.chdir(path.join(__dirname, '..', '..'));

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

if (febs.string.isEmpty(ParamOutput) || febs.string.isEmpty(ParamInput)) {
  console.log(chalk.red(
    '  The parameter is error.\n' +
    '  Tip: --output=[output dir] --input=[input file] .\n'
  ))
  restoreCwd();
  process.exit(0);
}


ParamOutput = path.resolve(srcCwd, ParamOutput);
ParamInput = path.resolve(srcCwd, ParamInput);

console.log(chalk.cyan(
  '  Will use below parameter:\n' +
  '   output = ' + ParamOutput + '\n' +
  '   input  = ' + ParamInput + '\n'
));


var webpackConfig = require('./webpack.prod.conf')
webpackConfig = webpackConfig({'index': ParamInput}, ParamOutput);


var spinner = ora('building for production...')
spinner.start()

function buildSrc(cbStop, cbSuccess) {
  webpack(webpackConfig, function (err, stats) {
    if (err) {
      cbStop(err);
      restoreCwd();
      throw err
    }
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')
    restoreCwd();
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

