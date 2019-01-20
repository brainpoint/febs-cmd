

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
      let p = arguments[i].substr(cc+1);
      if (p && p.length > 0) {
        if (p[0] == '\'' && p[p.length-1] == '\''
        || p[0] == '"' && p[p.length-1] == '"')
          p = p.substring(1, p.length-1);
      }
      cmds[febs.string.replace(arguments[i].substr(0, cc), '-', '')] = p;
    }
  }
}

// 输出目录.
var ParamOutput = cmds['output'];
var ParamInput = cmds['input'];
var ParamName = cmds['name'];
var ParamExternals = cmds['externals'];
var ParamSingleFile = cmds['singleFile'];
var ParamEntryFile = cmds['entryFile'];

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

var destPath = path.join(__dirname, '..', '..', 'build', 'tmp', ParamName);
var destEntry = path.join(destPath, 'index.js');
var isDirectory = false;


if (febs.file.dirIsExist(ParamInput)) {
  isDirectory = true;

  if (febs.file.dirIsExist(destPath))
    febs.file.dirRemoveRecursive(destPath);

  febs.file.dirCopyExcludeAsync(ParamInput, destPath, /node_modules/)
  .then(()=>{

    destEntry = destPath;
    
    installPackage();
  })
  .catch(err=>{
    console.error(err);
    process.exit(0);
  });
}
else {
  if (febs.file.dirIsExist(destPath))
    febs.file.dirRemoveRecursive(destPath);
  
  if (!febs.file.fileIsExist(ParamInput)) {

    if (ParamInput.indexOf('.js') < 0) {
      if (!febs.file.fileIsExist(ParamInput+'.js')) {
        if (!febs.file.fileIsExist(ParamInput+'.ts')) {
          console.error('input file is not existed');
          process.exit(0);
        }
        else {
          ParamInput += '.ts';
          destEntry = path.join(destPath, 'index.ts');
        }
      }
      else {
        ParamInput += '.js';
        destEntry = path.join(destPath, 'index.js');
      }
    }
    else {
      console.error('input file is not existed');
      process.exit(0);
    }
  }
  
  febs.file.fileCopy(ParamInput, destEntry, function(err){
    if (err) {
      console.error(err);
      process.exit(0);
    }
    else {
      installPackage();
    }
  });
}

function installPackage() {
  // //
  // // package.
  // if (febs.file.dirIsExist(destPath) && febs.file.fileIsExist(path.join(destPath, 'package.json'))) {
  //   var childProcess = require('child_process');
  //   var child = childProcess.spawn('npm', ['i'], {cwd: destPath});
  //   child.stdout.on('data', function(data) {
  //     console.log(data.toString());
  //   });
  //   child.stderr.on('data', function(data) {
  //     console.log(data.toString());
  //   });
  //   child.on('exit', function(code) {
  //     if (code == 0) {
  //       dotask();
  //     }
  //   });
  // }
  // else {
    dotask();
  // }
}

function dotask() {
  //
  // new process.
  var childProcess = require('child_process');

  var params = [
    path.join(__dirname, './buildjs.js'), 
    '--output='+ ParamOutput, //path.join(__dirname, '..', '..', './dist'),
    '--input='+destEntry,
    '--name='+ParamName,
    '--externals='+ParamExternals,
    '--singleFile='+ParamSingleFile,
    '--entryFile='+ParamEntryFile,
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