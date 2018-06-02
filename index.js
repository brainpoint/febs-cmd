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

var files = febs.file.dirExplorerFilesRecursive(dir, /.*\.js/);
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
            exec(cmds[i].cmd, function(err){
              if (err) {
                list.stop();
                console.log(err);
              } else {
                list.select('exit');
              }
            });
          }
        }
      }
      break;
  }
});

list.on('empty', function(){
  list.stop();
});