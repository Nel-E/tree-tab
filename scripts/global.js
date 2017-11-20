// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********         GLOBAL VARIABLES FOR BACKGROUND, OPTIONS AND SIDEBAR         ***************


var running = false;
var schedule_save = 0;
var schedule_update_indexes = 0;
var schedule_rearrange_tabs = 0;
var windows = {};
var tabs = {};

var MouseHoverOver = "";


var DragAndDrop = {timeout: false, DragNode: undefined, DragNodeClass: "", SelectedTabsIds: [], TabsIds: [], Parents: [], ComesFromWindowId: 0, Depth: 0};
var DropTargetsInFront = false;


var menuTabId = 0;
var CurrentWindowId = 0;
var SearchIndex = 0;
var schedule_update_data = 0;
var active_group = "tab_list";
var PickColor = "";

var opt = {};
var browserId = navigator.userAgent.match("Opera") !== null ? "O" : ( navigator.userAgent.match("Vivaldi") !== null ? "V" : (navigator.userAgent.match("Firefox") !== null ? "F" : "C" )  );

var bgtabs = {};
var bggroups = {};

var caption_clear_filter = chrome.i18n.getMessage("caption_clear_filter");
var caption_loading = chrome.i18n.getMessage("caption_loading");
var caption_searchbox = chrome.i18n.getMessage("caption_searchbox");

var caption_ungrouped_group = chrome.i18n.getMessage("caption_ungrouped_group");
var caption_noname_group = chrome.i18n.getMessage("caption_noname_group");

var DefaultToolbar =
	'<div id=toolbar_main>'+
		'<div class=button id=button_new><div class=button_img></div></div>'+
		'<div class=button id=button_pin><div class=button_img></div></div>'+
		'<div class=button id=button_undo><div class=button_img></div></div>'+
		'<div class=button id=button_search><div class=button_img></div></div>'+
		'<div class=button id=button_tools><div class=button_img></div></div>'+
		'<div class=button id=button_groups><div class=button_img></div></div>'+
		'<div class=button id=button_backup><div class=button_img></div></div>'+
		// '<div class=button id=button_folders><div class=button_img></div></div>'+
	'</div>'+
	'<div class=toolbar_shelf id=toolbar_search>'+
		'<div id=toolbar_search_input_box>'+
			'<input id=filter_box type=text placeholder=Search tabs...></input>'+
			'<div id=button_filter_clear style="opacity:0; position:absolute;" type=reset></div>'+
		'</div>'+
		'<div id=toolbar_search_buttons>'+
			'<div class=button id=button_filter_type><div class=button_img></div></div>'+
			'<div class=button id=filter_search_go_prev><div class=button_img></div></div>'+
			'<div class=button id=filter_search_go_next><div class=button_img></div></div>'+
		'</div>'+
	'</div>'+
	'<div class=toolbar_shelf id=toolbar_shelf_tools>'+
		'<div class=button id=button_options><div class=button_img></div></div>'+
		(browserId != "F" ?
		'<div class=button id=button_bookmarks><div class=button_img></div></div>'+
		'<div class=button id=button_downloads><div class=button_img></div></div>'+
		'<div class=button id=button_history><div class=button_img></div></div>'+
		'<div class=button id=button_settings><div class=button_img></div></div>'+
		'<div class=button id=button_extensions><div class=button_img></div></div>'+
		'<div class=button id=button_discard><div class=button_img></div></div>'
		: '')+
		'<div class=button id=button_move><div class=button_img></div></div>'+
	'</div>'+
	'<div class=toolbar_shelf id=toolbar_shelf_groups>'+
		'<div class=button id=button_groups_toolbar_hide><div class=button_img></div></div>'+
		'<div class=button id=button_new_group><div class=button_img></div></div>'+
		'<div class=button id=button_remove_group><div class=button_img></div></div>'+
		'<div class=button id=button_edit_group><div class=button_img></div></div>'+
		'<div class=button id=button_import_group><div class=button_img></div></div>'+
		'<div class=button id=button_export_group><div class=button_img></div></div>'+
	'</div>'+
	'<div class=toolbar_shelf id=toolbar_shelf_backup>'+
		'<div class=button id=button_import_bak><div class=button_img></div></div>'+
		'<div class=button id=button_import_merge_bak><div class=button_img></div></div>'+
		'<div class=button id=button_export_bak><div class=button_img></div></div>'+
		(browserId != "F" ?
		'<div class=button id=button_load_bak1><div class=button_img></div></div>'+
		'<div class=button id=button_load_bak2><div class=button_img></div></div>'+
		'<div class=button id=button_load_bak3><div class=button_img></div></div>'
		: '')+
	'</div>';
	// '<div class=toolbar_shelf id=toolbar_shelf_folders>'+
	// '</div>'+
	
var DefaultTheme = { "ToolbarShow": true, "ColorsSet": {}, "TabsSizeSetNumber": 2, "theme_name": "untitled", "theme_version": 2, "toolbar": DefaultToolbar, "unused_buttons": "" };
var DefaultPreferences = { "skip_load": false, "new_open_below": false, "pin_list_multi_row": false, "close_with_MMB": true, "always_show_close": false, "allow_pin_close": false, "append_child_tab": "bottom", "append_child_tab_after_limit": "after", "append_orphan_tab": "bottom", "after_closing_active_tab": "below", "close_other_trees": false, "promote_children": true, "promote_children_in_first_child": true, "open_tree_on_hover": true, "max_tree_depth": -1, "max_tree_drag_drop": true, "never_show_close": false, "switch_with_scroll": false, "syncro_tabbar_tabs_order": true, "show_counter_groups": true, "show_counter_tabs": true, "show_counter_tabs_hints": true, "groups_toolbar_default": true };




// *******************             GLOBAL FUNCTIONS                 ************************
// function LoadData(KeyName, ExpectReturnDefaultType) {
	// chrome.runtime.sendMessage({command: "load_data", K: KeyName, T: ExpectReturnDefaultType}, function(response) {
		// return response;
	// });
// }
function LoadData(KeyName, ExpectReturnDefaultType) {
	var data = ExpectReturnDefaultType;
	try {
		data = JSON.parse(localStorage[KeyName]);
		return data;
	} catch(e) {
		return ExpectReturnDefaultType;
	}
}

// generate random id
function GenerateRandomID(){
	var letters = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","K","L","M","N","O","P","R","S","T","Q","U","V","W","Y","Z","a","b","c","d","e","f","g","h","i","k","l","m","n","o","p","r","s","t","q","u","v","w","y","z"];
	var random = ""; for (var letter = 0; letter < 6; letter++ ) {random += letters[Math.floor(Math.random() * letters.length)];} return random;
}

// color in format "rgb(r,g,b)" or simply "r,g,b" (can have spaces, but must contain "," between values)
function RGBtoHex(color){
	color = color.replace(/[rgb(]|\)|\s/g, ""); color = color.split(","); return color.map(function(v){ return ("0"+Math.min(Math.max(parseInt(v), 0), 255).toString(16)).slice(-2); }).join("");
}

function HexToRGB(hex, alpha){
hex = hex.replace('#', ''); let r = parseInt(hex.length == 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2), 16); let g = parseInt(hex.length == 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4), 16); let b = parseInt(hex.length == 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6), 16); if (alpha) { return 'rgba('+r+', '+g+', '+b+', '+alpha+')'; } else { return 'rgb('+r+', '+g+', '+b+')'; }
}


/* theme colors is an object with css variables (but without --), for example; {"button_background": "#f2f2f2", "filter_box_border": "#cccccc"} */
function ApplyColorsSet(ThemeColors){
	let css_variables = "";
	for (let css_variable in ThemeColors) {
		css_variables = css_variables + "--" + css_variable + ":" + ThemeColors[css_variable] + ";";
	}
	for (let si = 0; si < document.styleSheets.length; si++) {
		if (document.styleSheets[si].ownerNode.id == "theme_colors") {
			document.styleSheets[si].deleteRule(document.styleSheets[si].cssRules.length-1);
			document.styleSheets[si].insertRule("body { "+css_variables+" }", document.styleSheets[si].cssRules.length);
		}
	}
}

function ApplySizeSet(size){
	for (let si = 0; si < document.styleSheets.length; si++) {
		if ((document.styleSheets[si].ownerNode.id).match("sizes_preset") != null) {
			if (document.styleSheets[si].ownerNode.id == "sizes_preset_"+size) {
				document.styleSheets.item(si).disabled = false;
			} else {
				document.styleSheets.item(si).disabled = true;
			}
		}
	}
	if (browserId == "F") {
		// I have no idea what is going on, but why top position for various things is different in firefox?????
		if (size > 1) {
			document.styleSheets[document.styleSheets.length-1].insertRule(".tab_header>.tab_title { margin-top: -1px; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
		} else {
			document.styleSheets[document.styleSheets.length-1].insertRule(".tab_header>.tab_title { margin-top: 0px; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
		}
	}
}

function LoadPreferences() {
	var	LoadedPreferences = LoadData("preferences", {});

	for (var parameter in DefaultPreferences) {
		opt[parameter] = DefaultPreferences[parameter];
	}
	for (var parameter in LoadedPreferences) {
		if (opt[parameter] != undefined) {
			opt[parameter] = LoadedPreferences[parameter];
		}
	}
}
function LoadDefaultPreferences() {
	for (var parameter in DefaultPreferences) {
		opt[parameter] = DefaultPreferences[parameter];
	}
}
function SavePreferences() {
	localStorage["preferences"] = JSON.stringify(opt);
	setTimeout(function() {
		chrome.runtime.sendMessage({command: "reload_options"});
	}, 200);
}
function ShowOpenFileDialog(id, extension) {
	let body = document.getElementById("body");
	let inp = document.createElement("input");
	inp.id = id;
	inp.type = "file";
	inp.accept = extension;
	inp.style.display = "none";
	body.appendChild(inp);
	$("#"+id).click();
}
function SaveFile(filename, data) {
	let d = JSON.stringify(data);
	let body = document.getElementById("body");
	let link = document.createElement("a");
	link.target = "_self";
	link.download = filename;
	link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(d);
	body.appendChild(link);
	link.click();
	link.remove();
}

