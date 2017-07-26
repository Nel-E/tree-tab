// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********         GLOBAL VARIABLES          ***************

var bg;
if (navigator.userAgent.match("Firefox") !== null) {
	bg = browser.extension.getBackgroundPage();
} else {
	bg = chrome.extension.getBackgroundPage();
}

var MouseHoverOver = "";
var DragNode;
var DropTargetsInFront = false;
var timeout = false;
var menuTabId = 0;
var menuGroupId = "tab_list";
var CurrentWindowId = 0;
var SearchIndex = 0;
var schedule_update_data = 0;
var active_group = "tab_list";
