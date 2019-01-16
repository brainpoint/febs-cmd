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

exports.inputs = ['--output=', '--input=', '--name='];

exports.inputHint = '--output=[output dir] --input=[input file] --name=[entry name]';

