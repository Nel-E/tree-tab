// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********         GLOBAL VARIABLES FOR BACKGROUND, OPTIONS AND SIDEBAR         ***************


var hold = true;
var started = false;
var schedule_save = 0;
var schedule_update_indexes = 0;
var windows = {};
var tabs = {};
// var groups = {};


// var groups = {};


// var ready = false;
// var DD;
// var DragAndDrop = {DropToWindowId: 0};
// var DragAndDrop = {tabsIds: [], tabsIdsParents: [], DragNodeId: undefined, ComesFromWindowId: 0, DropToWindowId: 0};

var MouseHoverOver = "";
var MouseHoverOver = "";
var GroupDragNode;


// var DragAndDrop ={tabsIds: [], tabsIdsParents: [], DragNodeId: undefined, Dropped: false, };
var Dropped = false;
var DetachIfDraggedOut = [];
var DropTargetsInFront = false;


var timeout = false;
var menuTabId = 0;
// var menuGroupId = "tab_list";
var CurrentWindowId = 0;
var SearchIndex = 0;
var schedule_update_data = 0;
var active_group = "tab_list";
var PickColor = "";

var opt = {};
var browserId = 0;
if (navigator.userAgent.match("Opera") !== null)   { browserId = 1; }
if (navigator.userAgent.match("Vivaldi") !== null) { browserId = 2; }
if (navigator.userAgent.match("Firefox") !== null) { browserId = 3; }

var bgtabs = {};
var bggroups = {};

var CurrentThemeVersion = 1;
var TabsSizeSet = 2;
var ScrollbarPinList = 4;
var ScrollbarTabList = 16;
var ToolbarShow = true;
var ToolbarSet;

var caption_clear_filter = chrome.i18n.getMessage("caption_clear_filter");
var caption_loading = chrome.i18n.getMessage("caption_loading");
var caption_searchbox = chrome.i18n.getMessage("caption_searchbox");

// generate random id
function GenerateRandomID(){
	var letters = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","K","L","M","N","O","P","R","S","T","Q","U","V","W","Y","Z","a","b","c","d","e","f","g","h","i","k","l","m","n","o","p","r","s","t","q","u","v","w","y","z"];
	var random = ""; for (var letter = 0; letter < 6; letter++ ) {random += letters[Math.floor(Math.random() * letters.length)];} return random;
}

// color in format "rgb(r,g,b)" or simply "r,g,b" (can have spaces, but must contain "," between values)
function rgbtoHex(color){
	color = color.replace(/[rgb(]|\)|\s/g, ""); color = color.split(","); return color.map(function(v){ return ("0"+Math.min(Math.max(parseInt(v), 0), 255).toString(16)).slice(-2); }).join("");
}

// generate random color
// function GenerateRandomHexColor() {
	// if (opt.grayscale_groups) {
		// var rgb = Math.floor(Math.random() * 190);
		// rgb = rgb+","+rgb+","+rgb;
		// return rgbtoHex(rgb);
	// } else {
		// var letters = "0123456789ABCDEF".split(""), color = "";
		// for (var letter = 0; letter < 6; letter++ ) {
			// color += letters[Math.floor(Math.random() * 16)];
		// }
		// return color;
	// }
// }



// if (localStorage.getItem("current_theme") != null && localStorage["theme"+localStorage["current_theme"]] != null) {
	// theme = JSON.parse(localStorage["theme"+localStorage["current_theme"]]);
	
	// $("#toolbar").html(theme.toolbar);
	
	// var css_variables = "";
	// for (var css_variable in theme.TabsSizeSet) {
		// css_variables = css_variables + "--" + css_variable + ":" + theme.TabsSizeSet[css_variable] + ";";
	// }
	// for (var css_variable in theme.ColorsSet) {
		// css_variables = css_variables + "--" + css_variable + ":" + theme.ColorsSet[css_variable] + ";";
	// }
	
	// document.styleSheets[0].insertRule("body { "+css_variables+" }", 0);
// }
// if (navigator.userAgent.match("Firefox") === null) {
	// document.styleSheets[0].insertRule(".group::-webkit-scrollbar { width:"+theme.ScrollbarTabList+"px;}", 0);
	// document.styleSheets[0].insertRule("#pin_list::-webkit-scrollbar { height:"+theme.ScrollbarPinList+"px; }", 0);
// } else {
	// I have no idea what is going on in latest build, but why top position for various things is different in firefox?????
	// if (theme.TabsSizeSetNumber > 1) {
		// document.styleSheets[1].insertRule(".tab_header>.tab_title { margin-top: -1.5px; }", document.styleSheets[1].cssRules.length);
	// }
// }


// AppendCSSSheets from theme
function AppendCSSSheets(theme) {
	var css_variables = "";
	for (var css_variable in theme.TabsSizeSet) {
		css_variables = css_variables + "--" + css_variable + ":" + theme.TabsSizeSet[css_variable] + ";";
	}
	
	for (var css_variable in theme.ColorsSet) {
		ColorsSet[css_variable] = theme.ColorsSet[css_variable];
		if ($("#"+css_variable)[0]) $("#"+css_variable)[0].value = theme.ColorsSet[css_variable];
		css_variables = css_variables + "--" + css_variable + ":" + theme.ColorsSet[css_variable] + ";";
	}
	
	// remove previous css rules in css sheet 0
	for (var r = 0; r < document.styleSheets[0].cssRules.length; r++) {
		if (document.styleSheets[0].cssRules[r].cssText.match("--pin_width") !== null) {
			document.styleSheets[0].deleteRule(r);
		}
		if (document.styleSheets[0].cssRules[r].cssText.match("::-webkit-scrollbar") !== null) {
			document.styleSheets[0].deleteRule(r);
		}
	}
	document.styleSheets[0].insertRule("body { "+css_variables+" }", 0);
	
	// scrollbars
	if (navigator.userAgent.match("Firefox") === null) {
		document.styleSheets[0].insertRule(".scrollbar::-webkit-scrollbar { width:"+theme.ScrollbarTabList+"px; height:"+theme.ScrollbarPinList+"px; }", 3);
	}
}

var DefaultPreferences = { 
	"skip_load": false, "new_open_below": false, "pin_list_multi_row": false, "close_with_MMB": true,
	"always_show_close": false, "allow_pin_close": false,
	"append_child_tab": "bottom", "append_child_tab_after_limit": "after",
	"append_orphan_tab": "bottom", "after_closing_active_tab": "below", "close_other_trees": false,
	"promote_children": true, "open_tree_on_hover": true, "max_tree_depth": -1, "never_show_close": false,
	"faster_scroll": false, "switch_with_scroll": false, "syncro_tabbar_tabs_order": true
};

function LoadPreferences() {
	var	LoadedPreferences = {};
	if (localStorage.getItem("preferences") !== null) {
		LoadedPreferences = JSON.parse(localStorage["preferences"]);
	}
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
}

function SaveTheme(themeName) {
    let themeObj = {
		"toolbar": ToolbarSet,
		"ToolbarShow": ToolbarShow,
		"ColorsSet": ColorsSet,
		"TabsSizeSetNumber": TabsSizeSet,
		"TabsSizeSet": TabsSizeSets[TabsSizeSet],
		"ScrollbarPinList": ScrollbarPinList,
		"ScrollbarTabList": ScrollbarTabList,
		"theme_version": CurrentThemeVersion
	};

	localStorage["theme"+themeName] = JSON.stringify(themeObj);
	return themeObj;
}

var DefaultToolbar =
	'<div class=toolbar id=toolbar>'+
		'<div id=toolbar_main>'+
			'<div class=button id=button_new><div class=button_img></div></div>'+
			'<div class=button id=button_pin><div class=button_img></div></div>'+
			'<div class=button id=button_undo><div class=button_img></div></div>'+
			'<div class=button id=button_search><div class=button_img></div></div>'+
			'<div class=button id=button_tools><div class=button_img></div></div>'+
			'<div class=button id=button_groups><div class=button_img></div></div>'+
			'<div class=button id=button_folders><div class=button_img></div></div>'+
		'</div>'+
		'<div class=toolbar_shelf id=toolbar_search>'+
			'<div id=toolbar_search_input_box>'+
				'<input id=filter_box type=text placeholder=Search tabs...></input>'+
				'<div id=button_filter_clear style=opacity:0; type=reset></div>'+
			'</div>'+
			'<div id=toolbar_search_buttons>'+
				'<div class=button id=button_filter_type><div class=button_img></div></div>'+
				'<div class=button id=filter_search_go_prev><div class=button_img></div></div>'+
				'<div class=button id=filter_search_go_next><div class=button_img></div></div>'+
			'</div>'+
		'</div>'+
		'<div class=toolbar_shelf id=toolbar_shelf_tools>'+
			'<div class=button id=button_options><div class=button_img></div></div>'+
			'<div class=button id=button_bookmarks><div class=button_img></div></div>'+
			'<div class=button id=button_downloads><div class=button_img></div></div>'+
			'<div class=button id=button_history><div class=button_img></div></div>'+
			'<div class=button id=button_settings><div class=button_img></div></div>'+
			'<div class=button id=button_extensions><div class=button_img></div></div>'+
			'<div class=button id=button_discard><div class=button_img></div></div>'+
			'<div class=button id=button_move><div class=button_img></div></div>'+
		'</div>'+
		'<div class=toolbar_shelf id=toolbar_shelf_groups>'+
			'<div class=button id=new_group><div class=button_img></div></div>'+
			'<div class=button id=remove_group><div class=button_img></div></div>'+
			'<div class=button id=remove_tabs_from_group><div class=button_img></div></div>'+
			'<div class=button id=ungrouped_tabs><div class=button_img></div></div>'+
			'<div class=button id=edit_group><div class=button_img></div></div>'+
		'</div>'+
		// '<div class=toolbar_shelf id=toolbar_shelf_folders>'+
		// '</div>'+
		// '<div id=toolbar_separator>'+
		// '</div>'+
		// '<div class=toolbar_int id=toolbar_unused_buttons>'+
		// '</div>'+
	'</div>';

	
	
	
	
var DefaultColors = {
	// scrolls
	"scrollbar_thumb": "#cdcdcd", "scrollbar_thumb_hover": "#a6a6a6", "scrollbar_track": "#e4e4e4",
	// toolbar
	"toolbar_background": "#f2f2f2", "toolbar_border_bottom": "#cccccc", "button_border": "#f2f2f2", "button_background": "#f2f2f2",
	"button_hover_border": "#bebebe", "button_hover_background": "#dcdcdc", "button_icons": "#808080",
	// search box
	"filter_box_background": "#fafafa", "filter_box_border": "#cccccc", "filter_box_font": "#333333", "filter_clear_icon": "#808080",
	// lists
	"pin_list_border_bottom": "#cccccc", "pin_list_background": "#fafafa", "tab_list_background": "#fafafa", 
	// tabs
	"tab_background": "#f2f2f2", "tab_border": "#bebebe", "tab_hover_background": "#d7d7d7", "tab_hover_border": "#878787", "tab_selected_background": "#e5f3fb",
	"tab_selected_border": "#70c0e7", "tab_selected_hover_border": "#78aee5", "tab_selected_hover_background": "#d0e2f0", "tab_filtered": "#e8e000",
	"tab_filtered_highlighted": "#ffa500", "tab_filtered_selected": "#0f8079", "tab_filtered_selected_active": "#1299a9", "active_font_weight": "bold",
	// tabs title
	"tab_title": "#000000", "tab_title_active": "#000000", "tab_title_discarded": "#7e7e7e", 
	// drag&drop placeholder indicator
	"drag_indicator": "#339bf3",
	// close button
	"close_x": "#7d7d7d", "close_hover_x": "#fbfcfe", "close_hover_border": "#757676", "close_hover_background": "#939394",
	// trees expand
	"expand_open_background": "#339bf3", "expand_closed_background": "#969696", "expand_hover_background": "#ffa500", 
	// menu
	"tabs_menu_font": "#333333", "tabs_menu_background": "#fafafa", "tabs_menu_border": "#bebebe", "tabs_menu_hover_background": "#efefef", "tabs_menu_hover_border": "#bebebe", "tabs_menu_separator": "#efefef"
}

var TabsSizeSets = [
	// placed them in one line to see differences at glance, TO DO! PEOPLE WANT EVEN BIGGER TABS AND CUSTOM INDENTATION FOR TREE
	{"pin_height": "20px", "pin_width": "22px", "tab_height": "15px", "tab_height_line": "17px", "expand_box_size": "5px", "expand_box_top": "4px", "expand_box_left": "3px", "expand_line_h_top": "7px",  "expand_line_h_width": "12px", "expand_line_h_oc_width": "3px", "expand_line_v_top": "-7px",  "expand_line_v_left": "0px", "expand_line_v_last_height": "15px", "title_padding_with_close": "20px", "title_font_size": "10.5px", "title_padding_left": "19px", "drag_area_top": "6px", "drag_area_bottom": "4px", "close_top": "1px", "close_right": "1px", "close_size": "11px", "favicon_size": "13px 13px", "favicon_pos": "4px"},
	{"pin_height": "22px", "pin_width": "24px", "tab_height": "17px", "tab_height_line": "19px", "expand_box_size": "5px", "expand_box_top": "5px", "expand_box_left": "3px", "expand_line_h_top": "8px",  "expand_line_h_width": "12px", "expand_line_h_oc_width": "3px", "expand_line_v_top": "-8px",  "expand_line_v_left": "0px", "expand_line_v_last_height": "17px", "title_padding_with_close": "20px", "title_font_size": "10.5px", "title_padding_left": "20px", "drag_area_top": "7px", "drag_area_bottom": "5px", "close_top": "2px", "close_right": "2px", "close_size": "11px", "favicon_size": "14px 14px", "favicon_pos": "5px"},
	{"pin_height": "25px", "pin_width": "25px", "tab_height": "19px", "tab_height_line": "23px", "expand_box_size": "5px", "expand_box_top": "6px", "expand_box_left": "3px", "expand_line_h_top": "9px",  "expand_line_h_width": "12px", "expand_line_h_oc_width": "3px", "expand_line_v_top": "-9px",  "expand_line_v_left": "0px", "expand_line_v_last_height": "19px", "title_padding_with_close": "24px", "title_font_size": "12px",   "title_padding_left": "25px", "drag_area_top": "7px", "drag_area_bottom": "5px", "close_top": "2px", "close_right": "2px", "close_size": "13px", "favicon_size": "16px 16px", "favicon_pos": "6px"},
	{"pin_height": "26px", "pin_width": "28px", "tab_height": "21px", "tab_height_line": "25px", "expand_box_size": "5px", "expand_box_top": "7px", "expand_box_left": "3px", "expand_line_h_top": "10px", "expand_line_h_width": "12px", "expand_line_h_oc_width": "3px", "expand_line_v_top": "-10px", "expand_line_v_left": "0px", "expand_line_v_last_height": "21px", "title_padding_with_close": "24px", "title_font_size": "12px",   "title_padding_left": "25px", "drag_area_top": "8px", "drag_area_bottom": "5px", "close_top": "3px", "close_right": "3px", "close_size": "13px", "favicon_size": "16px 16px", "favicon_pos": "6px"},
	{"pin_height": "28px", "pin_width": "30px", "tab_height": "23px", "tab_height_line": "26px", "expand_box_size": "5px", "expand_box_top": "8px", "expand_box_left": "3px", "expand_line_h_top": "11px", "expand_line_h_width": "12px", "expand_line_h_oc_width": "3px", "expand_line_v_top": "-11px", "expand_line_v_left": "0px", "expand_line_v_last_height": "23px", "title_padding_with_close": "24px", "title_font_size": "12.5px", "title_padding_left": "25px", "drag_area_top": "9px", "drag_area_bottom": "6px", "close_top": "4px", "close_right": "4px", "close_size": "14px", "favicon_size": "16px 16px", "favicon_pos": "6px"}
];


// if (localStorage.getItem("themeDefault") === null) {
	// SaveTheme("Default");
	// localStorage["current_theme"] = "Default";
// } else {
	// var theme = JSON.parse(localStorage["themeDefault"]);
	// if (theme.theme_version != CurrentThemeVersion) {
		// SaveTheme("Default");
	// }
// }

// save every 0.5 seconds if there is anything to save obviously
async function AutoSaveData() {
	setTimeout(function() {
		AutoSaveData();
		if (schedule_save > 1) {
			schedule_save = 1;
		}
		if (!hold && schedule_save > 0 && Object.keys(tabs).length > 1) {
			if (localStorage.getItem("tabs") !== null) {
				var tabs_BAK = JSON.parse(localStorage["tabs"]);
				localStorage["tabs_BAK"] = JSON.stringify(tabs_BAK);
			}
			localStorage["t_count"] = Object.keys(tabs).length;
			setTimeout(function() {localStorage["tabs"] = JSON.stringify(tabs);}, 100);
			
			if (localStorage.getItem("windows") !== null) {
				var windows_BAK = JSON.parse(localStorage["windows"]);
				localStorage["windows_BAK"] = JSON.stringify(windows_BAK);
			}
			localStorage["w_count"] = Object.keys(windows).length;
			setTimeout(function() {localStorage["windows"] = JSON.stringify(windows);}, 100);
			
			schedule_save--;
		}
	}, 500);
}

