// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********         GLOBAL VARIABLES FOR BACKGROUND, OPTIONS AND SIDEBAR         ***************


var hold = true;
var started = false;
var schedule_save = 0;
var schedule_update_indexes = 0;
var schedule_rearrange_tabs = 0;
var windows = {};
var tabs = {};
// var groups = {};


// var groups = {};


// var ready = false;
// var DD;
// var DragAndDrop = {DropToWindowId: 0};
// var DragAndDrop = {tabsIds: [], tabsIdsParents: [], DragNodeId: undefined, ComesFromWindowId: 0, DropToWindowId: 0};

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

var CurrentThemeVersion = 2;
// var TabsSizeSet = 2;
// var ScrollbarPinList = 4;
// var ScrollbarTabList = 16;
// var ToolbarShow = true;
// var ToolbarSet;

var caption_clear_filter = chrome.i18n.getMessage("caption_clear_filter");
var caption_loading = chrome.i18n.getMessage("caption_loading");
var caption_searchbox = chrome.i18n.getMessage("caption_searchbox");

var caption_ungrouped_group = "Ungrouped tabs";
var caption_noname_group = "untitled";

var DefaultPreferences = { "skip_load": false, "new_open_below": false, "pin_list_multi_row": false, "close_with_MMB": true, "always_show_close": false, "allow_pin_close": false, "append_child_tab": "bottom", "append_child_tab_after_limit": "after", "append_orphan_tab": "bottom", "after_closing_active_tab": "below", "close_other_trees": false, "promote_children": true, "open_tree_on_hover": true, "max_tree_depth": -1, "never_show_close": false, "faster_scroll": false, "switch_with_scroll": false, "syncro_tabbar_tabs_order": true };
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
			'<div class=button id=groups_toolbar_hide><div class=button_img></div></div>'+
			'<div class=button id=new_group><div class=button_img></div></div>'+
			'<div class=button id=remove_group><div class=button_img></div></div>'+
			'<div class=button id=remove_tabs_from_group><div class=button_img></div></div>'+
			'<div class=button id=ungrouped_tabs><div class=button_img></div></div>'+
			'<div class=button id=edit_group><div class=button_img></div></div>'+
		'</div>'+
		'<div class=toolbar_shelf id=toolbar_shelf_folders>'+
		'</div>'+
		// '<div id=toolbar_separator>'+
		// '</div>'+
		// '<div class=toolbar_int id=toolbar_unused_buttons>'+
		// '</div>'+
	'</div>';




// *******************             GLOBAL FUNCTIONS                 ************************
// save every 0.5 seconds if there is anything to save obviously
async function AutoSaveData() {
	setTimeout(function() {
		AutoSaveData();
		if (schedule_save > 1) {schedule_save = 1;}
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
}





	// SelectedTheme = {
		// "ToolbarShow": true,
		// "ColorsSet": {},
		// "TabsSizeSetNumber": 2,
		// "ScrollbarPinList": 4,
		// "ScrollbarTabList": 16,
		// "theme_name": "untitled",
		// "theme_version": CurrentThemeVersion,
		// "toolbar": DefaultToolbar
	// };


// generate random color
// function GenerateRandomHexColor() {
	// if (opt.grayscale_groups) {
		// var rgb = Math.floor(Math.random() * 190);
		// rgb = rgb+","+rgb+","+rgb;
		// return RGBtoHex(rgb);
	// } else {
		// var letters = "0123456789ABCDEF".split(""), color = "";
		// for (var letter = 0; letter < 6; letter++ ) {
			// color += letters[Math.floor(Math.random() * 16)];
		// }
		// return color;
	// }
// }













		// var theme = {
			// "ToolbarShow": false,
			// "ScrollbarPinList": 4,
			// "ScrollbarTabList": 16
		// };


			// document.styleSheets[0].insertRule(".group::-webkit-scrollbar { width:"+ScrollbarTabList+"px;}", 0);
			// document.styleSheets[0].insertRule("#pin_list::-webkit-scrollbar { height:"+ScrollbarPinList+"px; }", 0);



		// if (localStorage.getItem("current_theme") != null && localStorage["theme"+localStorage["current_theme"]] != null) {
			// theme = JSON.parse(localStorage["theme"+localStorage["current_theme"]]);
			
			// $("#toolbar").html(theme.toolbar);
			
			// var css_variables = "";
			// for (var css_variable in theme.ColorsSet) {
				// css_variables = css_variables + "--" + css_variable + ":" + theme.ColorsSet[css_variable] + ";";
			// }
			// for (var css_variable in theme.TabsSizeSet) {
				// css_variables = css_variables + "--" + css_variable + ":" + theme.TabsSizeSet[css_variable] + ";";
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
			
			// CurrentWindowId = tabs[0].windowId;




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



// /* AppendCSSSheets from theme */
// function AppendCSSSheets(theme) {
	// var css_variables = "";
	// for (var css_variable in theme.TabsSizeSet) {
		// css_variables = css_variables + "--" + css_variable + ":" + theme.TabsSizeSet[css_variable] + ";";
	// }
	
	// for (var css_variable in theme.ColorsSet) {
		// ColorsSet[css_variable] = theme.ColorsSet[css_variable];
		// if ($("#"+css_variable)[0]) $("#"+css_variable)[0].value = theme.ColorsSet[css_variable];
		// css_variables = css_variables + "--" + css_variable + ":" + theme.ColorsSet[css_variable] + ";";
	// }
	
	// /* remove previous css rules in css sheet 0 */
	// for (var r = 0; r < document.styleSheets[0].cssRules.length; r++) {
		// if (document.styleSheets[0].cssRules[r].cssText.match("--pin_width") !== null) {
			// document.styleSheets[0].deleteRule(r);
		// }
		// if (document.styleSheets[0].cssRules[r].cssText.match("::-webkit-scrollbar") !== null) {
			// document.styleSheets[0].deleteRule(r);
		// }
	// }
	// document.styleSheets[0].insertRule("body { "+css_variables+" }", 0);
	
	// /* scrollbars */
	// if (navigator.userAgent.match("Firefox") === null) {
		// document.styleSheets[0].insertRule(".scrollbar::-webkit-scrollbar { width:"+theme.ScrollbarTabList+"px; height:"+theme.ScrollbarPinList+"px; }", 3);
	// }
// }


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



// function LoadTheme(themeName) {
	// var theme = JSON.parse(localStorage["theme"+themeName]);

	// TabsSizeSet = theme.TabsSizeSetNumber;

// }