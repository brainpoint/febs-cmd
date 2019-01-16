'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2018-06-02 16:36
* Desc: 
*/

exports.name = 'hide file';

exports.cmd = 'defaults write com.apple.finder AppleShowAllFiles -bool false & killall Finder';

