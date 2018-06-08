#!/usr/bin/env node

var List = require('term-list');
var exec = require('child_process').exec;
var febs = require('febs');
var os = require('os');
var path = require('path');

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
  cmds.push({name:f.name, cmd:f.cmd});
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
              exec(cmds[i].cmd, function(err){
                if (err) {
                  list.stop();
                  console.log(err);
                } else {
                  list.select('exit');
                }
              });
            }
            // scripts dir
            else {
              let subcmds = [];
              let dir = cmds[i].dir;
              // file.
              let files = febs.file.dirExplorerFilesRecursive(dir, /.*\.js/);
              files.forEach(element => {
                var f = require(path.join(dir, element));
                subcmds.push({name:f.name, cmd:f.cmd});
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
                      for (var i = 0; i < subcmds.length; i++) {
                        if (item == subcmds[i].name) {
                          // scripts.
                          exec(subcmds[i].cmd, function(err){
                            if (err) {
                              sublist.stop();
                              list.start();
                              console.log(err);
                            } else {
                              sublist.stop();
                              list.start();
                            }
                          });
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