'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2018-06-02 16:36
* Desc: 
*/

exports.name = 'small';

exports.cmd = 'defaults write com.apple.dock springboard-columns -int 8 & defaults write com.apple.dock springboard-rows -int 7 & defaults write com.apple.dock ResetLaunchPad -bool TRUE;killall Dock';

