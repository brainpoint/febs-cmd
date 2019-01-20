'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2018-06-02 16:36
* Desc: 
*/

var path = require('path');

exports.name = 'minimum js code';

exports.cmd = `node ${path.join(__dirname, '..','..','libs','buildvue','build.js')}`;

exports.inputs = [
  {name:'--output=', "default": './dist'}, 
  {name:'--input='}, 
  {name:'--entryFile=', "default": 'index.js'}, 
  {singleFile:'--singleFile=', 'default':'1'}, 
  {name:'--name='}, 
  {externals:'--externals=', "default": ''}
];

exports.inputHint = '--output=[output dir] --input=[input file/directry] --entryFile=[input file name]\n\
 --name=[entry name]\n\
 --singleFile=[1/0]\n\
 --externals=[lib1,lib2]\n';
