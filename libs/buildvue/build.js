

require('./check-versions')()
var febs = require('febs');
var ora = require('ora')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var fs = require('fs');

process.env.NODE_ENV = 'production'

var srcCwd = process.cwd();

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

if (febs.string.isEmpty(ParamOutput) || febs.string.isEmpty(ParamInput) || febs.string.isEmpty(ParamName)) {
  console.log(chalk.red(
    '  The parameter is error.\n' +
    '  Tip: --output=[output dir] --input=[input file] --name=[entry name] .\n'
  ))
  restoreCwd();
  process.exit(0);
}


ParamOutput = path.resolve(srcCwd, ParamOutput);
ParamInput = path.resolve(srcCwd, ParamInput);

var destPath = path.join(__dirname, '..', '..', 'build', 'tmp', 'aa');

if (febs.file.dirIsExist(ParamInput)) {
  if (febs.file.dirIsExist(destPath))
    febs.file.dirRemoveRecursive(destPath);

  febs.file.dirCopy(ParamInput, destPath, function(err){
    if (err) {
      console.error(err);
      process.exec(0);
    }
    else {
      dotask();
    }
  });
}
else {
  if (febs.file.dirIsExist(destPath))
    febs.file.dirRemoveRecursive(destPath);
  
  if (!febs.file.fileIsExist(ParamInput)) {

    if (ParamInput.indexOf('.js') < 0) {
      ParamInput += '.js';
      if (!febs.file.fileIsExist(ParamInput)) {
        console.error('input file is not existed');
        process.exec(0);
      }
    }
    else {
      console.error('input file is not existed');
      process.exec(0);
    }
  }
  
  febs.file.fileCopy(ParamInput, path.join(destPath, 'index.js'), function(err){
    if (err) {
      console.error(err);
      process.exec(0);
    }
    else {
      dotask();
    }
  });
}


function dotask() {
  //
  // new process.
  var childProcess = require('child_process');

  var params = [
    path.join(__dirname, './buildjs.js'), 
    '--output='+ ParamOutput, //path.join(__dirname, '..', '..', './dist'),
    '--input='+destPath,
    '--name='+ParamName,
  ];
  var child = childProcess.spawn('node', params, {cwd: path.join(__dirname, '..', '..')});

  child.stdout.on('data', function(data) {
    console.log(data.toString());
  });
  child.stderr.on('data', function(data) {
    console.log(data.toString());
  });
  child.on('exit', function(code) {
    console.log('Child exited with code', code);
  });
}