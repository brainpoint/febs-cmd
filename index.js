#!/usr/bin/env node

var List = require('term-list');
var febs = require('febs');
var os = require('os');
var path = require('path');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var readline = require('readline');
var chalk = require('chalk')


// 参数解析.
var params = {};
var arguments = process.argv.splice(1);
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
      params[febs.string.replace(arguments[i].substr(0, cc), '-', '')] = p;
    }
  }
}

/**
* @desc: 执行cmd.
* @return: 
*/
function execCommand(cmdString, inputs, cbFinish) {
  // scripts.
  let cms = cmdString.split(' ');
  let cmps = cms[0];
  let inputps = cms.splice(1);
  if (cmdString.indexOf('&') >= 0) {
    cmps = cmdString;
    inputps = null;
  }

  if (!inputps) {
    exec(cmps, function(err){
      if (cbFinish) cbFinish(err);
      if (err) {
        console.log(err);
      } else {
      }
      if (cbFinish) cbFinish(err);
    });
  }
  else {
    inputps = inputps.concat(inputs||[]);
    
    var proc = spawn(cmps, inputps, {stdio: 'inherit'});
    proc.on('close', function (code) {
      if (code !== 0) {
        console.log(code);
      } else {
      }
      if (cbFinish) cbFinish(code);
    });
  }
}


//
// readline.
function getInput(inputs, cbFinish) {
  process.stdin.removeAllListeners('data');
  process.stdin.removeAllListeners('newListener');

  var  rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout,
    removeHistoryDuplicates: true
  });

  console.log("Enter the paramater:");

  var input = [];
  var ii = 0;
  function question(cb) {
    if (ii >= inputs.length) {
      rl.close();
      cb(input);
      return input;
    }

    rl.question(inputs[ii].name + (inputs[ii]['default']?'('+inputs[ii]['default']+')':''), function(answer){
      if (febs.string.isEmpty(answer)) {
        if (inputs[ii]['default']) {
          answer = inputs[ii]['default'];
        }
      }

      if (febs.string.isEmpty(answer)) {
        process.nextTick(function(){
          question(cb);
        });
        return;
      }
      else {
        input.push(inputs[ii].name+answer);

        if (++ii <= inputs.length) {
          process.nextTick(function(){
            question(cb);
          });
        }
      }
    });  
  }

  question(cbFinish);
}

//
// platform.
var isWin = os.platform().indexOf('win') === 0;
var isMac = os.platform().indexOf('darwin') === 0;
var isLinux = os.platform().indexOf('linux') === 0;

// cmds.
var cmds = [];
var dir = path.join(__dirname, './scripts', isWin?'win':(isMac?'mac':'linux'));

// dir.
var dirs = febs.file.dirExplorerDirsRecursive(dir, /.*/);
dirs.forEach(element => {
  var f = path.join(dir, element);
  cmds.push({name:'<'+element+'>', cmd:null, dir:f, _name:element});
});

// file.
var files = febs.file.dirExplorer(dir).files;
files.forEach(element => {
  var f = require(path.join(dir, element));
  cmds.push({name:f.name, cmd:f.cmd, inputs:f.inputs, inputHint:f.inputHint});
});

// 
// direct cmd.
if (params['cmd']) {
  for (let i = 0; i < cmds.length; i++) {
    let cmd;
    if (params['subcmd']) {
      if (cmds[i]._name == params['cmd']) {
        cmd = cmds[i];
      }
    }
    else {
      if (cmds[i].name == params['cmd']) {
        cmd = cmds[i];
      }
    }

    if (!cmd) { continue; }

    let rcmd;

    if (params['subcmd']) {
      // file.
      let files = febs.file.dirExplorerFilesRecursive(cmd.dir, /.*\.js/);
      let subcmds = [];
      files.forEach(element => {
        var f = require(path.join(cmd.dir, element));
        subcmds.push({name:f.name, cmd:f.cmd, inputs:f.inputs, inputHint:f.inputHint});
      });

      for (let j = 0; j < subcmds.length; j++) {
        if (subcmds[j].name == params['subcmd']) {
          rcmd = subcmds[j];
        }
      }
    }
    else {
      rcmd = cmd;
    }

    if (!rcmd) {
      continue;
    }


    // cmd.
    if (rcmd.inputs && rcmd.inputs.length > 0) {
      console.log(process.cwd());
      if (rcmd.inputHint)
        console.log(chalk.cyan(rcmd.inputHint));
      console.log('');
      delete params['cmd'];
      delete params['subcmd'];
      let inputss = [];
      for (const key in params) {
        inputss.push(`--${key}=${params[key]}`);
      }
      execCommand(rcmd.cmd, inputss, function(err){
        process.exit(0);
      });
    }
    else {
      // scripts.
      execCommand(rcmd.cmd, null, function(err){
        process.exit(0);
      });
    }

    return;
  }

  console.log('Can\'t find command');
  process.exit(0);
}


var list = new List({ marker: '> ', markerLength: 2 });

cmds.forEach(element => {
  list.add(element.name, element.name);
});
list.add('exit', '[exit]');
list.start();
 
// do.
list.on('keypress', function(key, item){
  switch (key.name) {
    case 'return':
      if (item == 'exit') {
        list.stop();
      }
      else {
        for (var i = 0; i < cmds.length; i++) {
          if (item == cmds[i].name) {
            // scripts.
            if (cmds[i].cmd) {
              if (cmds[i].inputs && cmds[i].inputs.length > 0) {
                list.stop();
                process.nextTick(function(){

                  console.log(process.cwd());
                  if (cmds[i].inputHint)
                    console.log(chalk.cyan(cmds[i].inputHint));
                  console.log('');
                  
                  getInput(cmds[i].inputs, function(input) {
                    execCommand(cmds[i].cmd, input, function(err){
                      if (err) {
                        console.log(err);
                        return;
                      } else {
                        process.exit(0);
                      }
                    });
                  });
                });
              }
              else {
                execCommand(cmds[i].cmd, null, function(err){
                  if (err) {
                    list.stop();
                    console.log(err);
                    return;
                  } else {
                    list.select('exit');
                  }
                });
              }
              break;
            }
            // scripts dir
            else {
              let subcmds = [];
              let dir = cmds[i].dir;
              // file.
              let files = febs.file.dirExplorerFilesRecursive(dir, /.*\.js/);
              files.forEach(element => {
                var f = require(path.join(dir, element));
                subcmds.push({name:f.name, cmd:f.cmd, inputs:f.inputs, inputHint:f.inputHint});
              });

              let sublist = new List({ marker: '> ', markerLength: 2 });
              subcmds.forEach(element => {
                sublist.add(element.name, element.name);
              });
              sublist.add('back', '[back]');
              list.stop();
              sublist.start();

              // do.
              sublist.on('keypress', function(key, item){
                switch (key.name) {
                  case 'return':
                    if (item == 'back') {
                      sublist.stop();
                      list.start();
                    }
                    else {
                      for (var j = 0; j < subcmds.length; j++) {
                        if (item == subcmds[j].name) {

                          if (subcmds[j].inputs && subcmds[j].inputs.length > 0) {
                            sublist.stop();

                            console.log(process.cwd());
                            if (subcmds[j].inputHint)
                              console.log(chalk.cyan(subcmds[j].inputHint));
                            console.log('');
                            getInput(subcmds[j].inputs, function(input) {
                              execCommand(subcmds[j].cmd, input, function(err){
                                if (err) {
                                  console.log(err);
                                  return;
                                } else {
                                  list.start();
                                }
                              });
                            });
                          }
                          else {
                            // scripts.
                            execCommand(subcmds[j].cmd, null, function(err){
                              if (err) {
                                sublist.stop();
                                console.log(err);
                                return;
                              } else {
                                sublist.stop();
                                list.start();
                              }
                            });
                          }
                        }
                      }
                    }
                    break;
                  }
                });

            } // if..else.
          } // if.
        } // for.
      } // if..else.
      break;
  }
});

list.on('empty', function(){
  list.stop();
});