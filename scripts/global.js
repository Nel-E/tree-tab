// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********         GLOBAL VARIABLES FOR BACKGROUND, OPTIONS AND SIDEBAR         ***************

// BACKGROUND VARIABLES
let debug = [];
var running = false;
var schedule_save = -999;
var windows = {};
var tabs = {};
var tt_ids = {};


// SIDEBAR VARIABLES
var AutoSaveSession;
var schedule_update_data = 0;
var schedule_rearrange_tabs = 0;

var DragNodeClass = "";
var DragOverTimer = true;
var DragTreeDepth = 0;

var menuItemNode;
var CurrentWindowId = 0;
var SearchIndex = 0;
var active_group = "tab_list";
var opt = {};
var browserId = navigator.userAgent.match("Opera|OPR") !== null ? "O" : ( navigator.userAgent.match("Vivaldi") !== null ? "V" : (navigator.userAgent.match("Firefox") !== null ? "F" : "C" )  );

var newTabUrl = browserId == "F" ? "about:newtab" : "chrome://startpage/";
var EmptyTabs = [];

var bggroups = {};
var bgfolders = {};
var caption_clear_filter = chrome.i18n.getMessage("caption_clear_filter");
var caption_loading = chrome.i18n.getMessage("caption_loading");
var caption_searchbox = chrome.i18n.getMessage("caption_searchbox");
var caption_ungrouped_group = chrome.i18n.getMessage("caption_ungrouped_group");
var caption_noname_group = chrome.i18n.getMessage("caption_noname_group");


// DEFAULTS NEEDED FOR START AND FOR OPTIONS PAGE
const DefaultToolbar = {
	"toolbar_main": ["button_new", "button_pin", "button_undo", "button_search", "button_tools", "button_groups", "button_backup", "button_folders"],
	"toolbar_search": ["button_filter_type", "filter_search_go_prev", "filter_search_go_next"],
	"toolbar_shelf_tools": (browserId == "F" ? ["button_manager_window", "button_options", "button_unload", "button_detach", "button_reboot"] : ["button_manager_window", "button_options", "button_bookmarks", "button_downloads", "button_history", "button_settings", "button_extensions", "button_unload", "button_detach", "button_reboot"]),
	"toolbar_shelf_groups": ["button_groups_toolbar_hide", "button_new_group", "button_remove_group", "button_edit_group", "button_import_group", "button_export_group"],
	"toolbar_shelf_backup": (browserId == "F" ? ["button_import_bak", "button_import_merge_bak", "button_export_bak"] : ["button_import_bak", "button_import_merge_bak", "button_export_bak", "button_load_bak1", "button_load_bak2", "button_load_bak3"]),
	"toolbar_shelf_folders": ["button_new_folder", "button_remove_folder", "button_edit_folder"]
};

const DefaultTheme = {
	"ToolbarShow": true,
	"ColorsSet": {},
	"TabsSizeSetNumber": 2,
	"TabsMargins": "2",
	"theme_name": "untitled",
	"theme_version": 4,
};

const DefaultPreferences = {
	"hide_other_groups_tabs_firefox": false,
	"show_toolbar": true,
	"skip_load": false,
	"pin_list_multi_row": true,
	"always_show_close": false,
	"never_show_close": false,
	"allow_pin_close": false,
	"append_child_tab": "bottom",
	"append_child_tab_after_limit": "after",
	"append_orphan_tab": "bottom",
	"after_closing_active_tab": "below_seek_in_parent",
	"collapse_other_trees": false,
	"open_tree_on_hover": true,
	"promote_children": true,
	"promote_children_in_first_child": true,
	"max_tree_depth": -1,
	// "max_tree_depth_folders": 0,
	"max_tree_drag_drop": true,
	"max_tree_drag_drop_folders": false,
	"switch_with_scroll": false,
	"syncro_tabbar_tabs_order": true,
	"show_counter_groups": true,
	"show_counter_tabs": true,
	"show_counter_tabs_hints": true,
	"groups_toolbar_default": true,
	"syncro_tabbar_groups_tabs_order": true,
	"midclick_tab": "close_tab",
	"dbclick_tab": "new_tab",
	"dbclick_group": "new_tab",
	"midclick_group": "nothing",
	"midclick_folder": "nothing",
	"dbclick_folder": "rename_folder",
	"debug": false,
	"orphaned_tabs_to_ungrouped": false,
	"tab_group_regexes": [],
	"move_tabs_on_url_change": "never",
	"autosave_max_to_keep": 5,
	"autosave_interval": 15
};

// *******************             GLOBAL FUNCTIONS                 ************************

// generate random id
function GenerateRandomID(){
	var letters = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","K","L","M","N","O","P","R","S","T","Q","U","V","W","Y","Z","a","b","c","d","e","f","g","h","i","k","l","m","n","o","p","r","s","t","q","u","v","w","y","z"];
	var random = ""; for (var letter = 0; letter < 6; letter++ ) {random += letters[Math.floor(Math.random() * letters.length)];} return random;
}


function GetCurrentPreferences(storage) {
	opt = Object.assign({}, DefaultPreferences);
	if (storage["preferences"]) {
		for (var parameter in storage["preferences"]) {
			if (opt[parameter] != undefined) {
				opt[parameter] = storage["preferences"][parameter];
			}
		}
	}
}

function LoadDefaultPreferences() {
	opt = Object.assign({}, DefaultPreferences);
}

function GetCurrentTheme(storage) {
	if (storage["current_theme"] && storage["themes"] && storage["themes"][storage["current_theme"]]) {
		let theme = storage["themes"][storage["current_theme"]];
		let correctedTheme = CheckTheme(theme);
			if (correctedTheme.theme_version < 4 && storage["preferences"].show_toolbar == undefined) {
				opt.show_toolbar = correctedTheme.ToolbarShow;
				SavePreferences();
			}
		return correctedTheme;
	} else {
		return DefaultTheme;
	}
}

function GetCurrentToolbar(storage) {
	if (storage["toolbar"]) {
		return storage["toolbar"];
	} else {
		return DefaultToolbar;
	}
}

function SavePreferences() {
	chrome.storage.local.set({preferences: opt});
	chrome.runtime.sendMessage({command: "reload_options", opt: opt});
}

function ShowOpenFileDialog(extension) {
	let body = document.getElementById("body");
	let inp = document.createElement("input");
	inp.id = "file_import";
	inp.type = "file";
	inp.accept = extension;
	inp.style.display = "none";
	body.appendChild(inp);
	setTimeout(function() {
		inp.click();
	}, 10);
	return inp;
}

function SaveFile(filename, extension, data) {
	let file = new File([JSON.stringify(data)], filename+"."+extension, {type: "text/"+extension+";charset=utf-8"} );
	let body = document.getElementById("body");
	let savelink = document.createElement("a");
	savelink.href = URL.createObjectURL(file);
	savelink.fileSize = file.size;
	savelink.target = "_blank";
	savelink.style.display = "none";
	savelink.type = "file";
	savelink.download = filename+"."+extension;
	body.appendChild(savelink);		
	setTimeout(function() {
		savelink.click();
		setTimeout(function() {
			savelink.parentNode.removeChild(savelink);
		}, 60000);
	}, 10);
}

function log(log) {
	if (opt.debug) {
		chrome.runtime.sendMessage({command: "debug", log: log});
	}
}

function pushlog(log) {
	debug.push(log);
	if (debug.length > 100) {
		debug.splice(0, 1);
	}
	console.log(log);
	schedule_save++;
}