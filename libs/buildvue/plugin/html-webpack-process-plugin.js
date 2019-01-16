'use strict';
/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 
* Desc: 
*/

var path   = require('path');
var febs   = require('febs');
var fs     = require('fs');

function Plugin(options) {

}

Plugin.prototype.apply = function(compiler) {
  compiler.plugin('compilation', function(compilation) {
    // html-webpack-plugin-before-html-processing.
    compilation.plugin('html-webpack-plugin-before-html-processing', function(htmlPluginData, callback) {
      let filename = htmlPluginData.outputName;
      filename = path.basename(filename, '.html');

      //
      // pre script.
      let prescript = path.join(__dirname, '..', '..', 'src', 'views', filename, 'script-pre.html');
      if (febs.file.fileIsExist(prescript)) {
        let content = fs.readFileSync(prescript, {encoding: 'utf8'});
          htmlPluginData.html = febs.string.replace(htmlPluginData.html, '<div id=script-pre></div>', content);
          htmlPluginData.html = febs.string.replace(htmlPluginData.html, '<div id="script-pre"></div>', content);
      } else {
          htmlPluginData.html = febs.string.replace(htmlPluginData.html, '<div id=script-pre></div>', '');
          htmlPluginData.html = febs.string.replace(htmlPluginData.html, '<div id="script-pre"></div>', '');
      }

      callback(null, htmlPluginData);
    });

    // html-webpack-plugin-after-html-processing
    compilation.plugin('html-webpack-plugin-after-html-processing', function(htmlPluginData, callback) {
      let filename = htmlPluginData.outputName;
      filename = path.basename(filename, '.html');
      //
      // post script.
      let postscript = path.join(__dirname, '..', '..', 'src', 'views', filename, 'script-post.html');
      if (febs.file.fileIsExist(postscript)) {
        let content = fs.readFileSync(postscript, {encoding: 'utf8'});
        htmlPluginData.html = febs.string.replace(htmlPluginData.html, '</body>', '');
        htmlPluginData.html = febs.string.replace(htmlPluginData.html, '<div id=script-post></div>', '\n<div>' + content + '\n</div></body>');
        htmlPluginData.html = febs.string.replace(htmlPluginData.html, '<div id="script-post"></div>', '\n<div>' + content + '\n</div></body>');
      } else {
        htmlPluginData.html = febs.string.replace(htmlPluginData.html, '</body>', '');
        htmlPluginData.html = febs.string.replace(htmlPluginData.html, '<div id=script-post></div>', '</body>');
        htmlPluginData.html = febs.string.replace(htmlPluginData.html, '<div id="script-post"></div>', '</body>');
      }

      callback(null, htmlPluginData);
    });
  });
}

module.exports = Plugin;