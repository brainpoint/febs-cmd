#!/usr/bin/env node

var List = require('term-list');
var febs = require('febs');
var os = require('os');
var path = require('path');
var spawn = require('child_process').spawn;
var readline = require('readline');
var chalk = require('chalk')

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

    rl.question(inputs[ii], function(answer){
      if (febs.string.isEmpty(answer)) {
        process.nextTick(function(){
          question(cb);
        });
        return;
      }
      else {
        input.push(inputs[ii]+answer);

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
  cmds.push({name:'<'+element+'>', cmd:null, dir:f});
});

// file.
var files = febs.file.dirExplorer(dir).files;
files.forEach(element => {
  var f = require(path.join(dir, element));
  cmds.push({name:f.name, cmd:f.cmd, inputs:f.inputs, inputHint:f.inputHint});
});


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
                    let cms = cmds[i].cmd.split(' ');
                    input = cms.splice(1).concat(input);
  
                    var proc = spawn(cms[0], input, {stdio: 'inherit'});
                    proc.on('close', function (code) {
                      if (code !== 0) {
                        console.log(code);
                        return;
                      } else {
                        process.exit(0);
                      }
                    });
                  });
                });
              }
              else {
                let cms = cmds[i].cmd.split(' ');
                var proc = spawn(cms[0], cms.splice(1), {stdio: 'inherit'});
                proc.on('close', function (code) {
                  if (code !== 0) {
                    list.stop();
                    console.log(code);
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
                subcmds.push({name:f.name, cmd:f.cmd, inputs:f.inputs});
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

                              let cms = subcmds[j].cmd.split(' ');
                              input = cms.splice(1).concat(input);
                              var proc = spawn(cms[0], input, {stdio: 'inherit'});
                              proc.on('close', function (code) {
                                if (code !== 0) {
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
                            let cms = subcmds[j].cmd.split(' ');
                            var proc = spawn(cms[0], cms.splice(1), {stdio: 'inherit'});
                            proc.on('close', function (code) {
                              if (code !== 0) {
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