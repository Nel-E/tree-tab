// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// GLOBAL VARIABLES
let browserId = navigator.userAgent.match("Opera|OPR") !== null ? "O" : (navigator.userAgent.match("Vivaldi") !== null ? "V" : (navigator.userAgent.match("Firefox") !== null ? "F" : "C" ))
let opt = {};

let labels = {
	clear_filter: chrome.i18n.getMessage("caption_clear_filter"),
	loading: chrome.i18n.getMessage("caption_loading"),
	searchbox: chrome.i18n.getMessage("caption_searchbox"),
	ungrouped_group: chrome.i18n.getMessage("caption_ungrouped_group"),
	noname_group: chrome.i18n.getMessage("caption_noname_group")
};

// BACKGROUND VARIABLES
let b = {
	debug: [],
	running: false,
	schedule_save: -999,
	windows: {},
	tabs: {},
	tt_ids: {},
	EmptyTabs: [],
	newTabUrl: browserId == "F" ? "about:newtab" : "chrome://startpage/"
};

// DEFAULTS NEEDED FOR START AND FOR OPTIONS PAGE
const DefaultToolbar = {
	toolbar_main: ["button_new", "button_pin", "button_undo", "button_search", "button_tools", "button_groups", "button_backup", "button_folders"],
	toolbar_search: ["button_filter_type", "filter_search_go_prev", "filter_search_go_next"],
	toolbar_shelf_tools: (browserId == "F" ? ["button_manager_window", "button_options", "button_unload", "button_detach", "button_reboot"] : ["button_manager_window", "button_options", "button_bookmarks", "button_downloads", "button_history", "button_settings", "button_extensions", "button_unload", "button_detach", "button_reboot"]),
	toolbar_shelf_groups: ["button_groups_toolbar_hide", "button_new_group", "button_remove_group", "button_edit_group", "button_import_group", "button_export_group"],
	toolbar_shelf_backup: (browserId == "F" ? ["button_import_bak", "button_import_merge_bak", "button_export_bak"] : ["button_import_bak", "button_import_merge_bak", "button_export_bak", "button_load_bak1", "button_load_bak2", "button_load_bak3"]),
	toolbar_shelf_folders: ["button_new_folder", "button_remove_folder", "button_edit_folder"]
};

const DefaultTheme = {
	ToolbarShow: true,
	ColorsSet: {},
	TabsSizeSetNumber: 2,
	TabsMargins: "2",
	theme_name: "untitled",
	theme_version: 4
};

const DefaultPreferences = {
	hide_other_groups_tabs_firefox: false,
	show_toolbar: true,
	skip_load: false,
	pin_list_multi_row: true,
	always_show_close: false,
	never_show_close: false,
	allow_pin_close: false,
	append_child_tab: "bottom",
	append_child_tab_after_limit: "after",
	append_orphan_tab: "bottom",
	after_closing_active_tab: "below_seek_in_parent",
	collapse_other_trees: false,
	open_tree_on_hover: true,
	promote_children: true,
	promote_children_in_first_child: true,
	max_tree_depth: -1,
	max_tree_drag_drop: true,
	max_tree_drag_drop_folders: false,
	switch_with_scroll: false,
	syncro_tabbar_tabs_order: true,
	show_counter_groups: true,
	show_counter_tabs: true,
	show_counter_tabs_hints: true,
	groups_toolbar_default: true,
	syncro_tabbar_groups_tabs_order: true,
	midclick_tab: "close_tab",
	dbclick_tab: "new_tab",
	dbclick_group: "new_tab",
	// dbclick_group_bar: "new_group",
	midclick_group: "nothing",
	midclick_folder: "nothing",
	dbclick_folder: "rename_folder",
	debug: false,
	orphaned_tabs_to_ungrouped: false,
	tab_group_regexes: [],
	move_tabs_on_url_change: "never",
	autosave_max_to_keep: 5,
	autosave_interval: 15
};

// SIDEBAR VARIABLES
// let active_group = "tab_list";

let tt = {
	CurrentWindowId: 0,
	active_group: "tab_list",
	groups: {},
	folders: {},
	schedule_update_data: 0,
	schedule_rearrange_tabs: 0,
	DragNodeClass: "",
	DragTreeDepth: 0,
	DragOverId: "",
	menuItemNode: undefined,
	SearchIndex: 0,
	DragOverTimer: undefined,
	AutoSaveSession: undefined
};

// GLOBAL FUNCTIONS
function GenerateRandomID(){
	let letters = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","K","L","M","N","O","P","R","S","T","Q","U","V","W","Y","Z","a","b","c","d","e","f","g","h","i","k","l","m","n","o","p","r","s","t","q","u","v","w","y","z"];
	let random = ""; for (let letter = 0; letter < 6; letter++ ) {random += letters[Math.floor(Math.random() * letters.length)];} return random;
}

function GetCurrentPreferences(storage) {
	opt = Object.assign({}, DefaultPreferences);
	if (storage["preferences"]) {
		for (let parameter in storage["preferences"]) {
			if (opt[parameter] != undefined) {
				opt[parameter] = storage["preferences"][parameter];
				
				// legacy, changed from "after_active" to "after", because it is a parent tab, not necessarily an active tab
				if (parameter == "append_child_tab" && storage["preferences"][parameter] == "after_active") {
					opt[parameter] = "after";
				}
			}
		}
	}
}
