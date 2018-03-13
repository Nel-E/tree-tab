// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

document.addEventListener("DOMContentLoaded", Run(), false);
function Loadi18n() {
	// toolbar labels
	document.querySelectorAll(".button").forEach(function(s){
		s.title = chrome.i18n.getMessage(s.id);
	});
	// menu labels and edit group dialog labels
	document.querySelectorAll(".menu_item, .edit_dialog_button").forEach(function(s){
		s.textContent = chrome.i18n.getMessage(s.id);
	});
}
function RestorePinListRowSettings() {
	plist = document.getElementById("pin_list");
	if (opt.pin_list_multi_row) {
		plist.style.whiteSpace = "normal";
		plist.style.overflowX = "hidden";
	} else {
		plist.style.whiteSpace = "";
		plist.style.overflowX = "";
	}
	RefreshGUI();
}
function Run() {
	chrome.runtime.sendMessage({command: "is_bg_ready"}, function(response) {
		setTimeout(function() {
			if (response == true) {
				Load();
			} else {
				Run();
			}
		},200);
	});
}
function Load() {
	chrome.windows.getCurrent({populate: false}, function(window) {
		CurrentWindowId = window.id;
		chrome.runtime.sendMessage({command: "get_preferences"}, function(response) {
			opt = Object.assign({}, response);
			chrome.runtime.sendMessage({command: "get_browser_tabs"}, function(response) {
				bgtabs = Object.assign({}, response);
				chrome.runtime.sendMessage({command: "get_folders", windowId: CurrentWindowId}, function(response) {
					bgfolders = Object.assign({}, response);
					chrome.runtime.sendMessage({command: "get_groups", windowId: CurrentWindowId}, function(response) {
						bggroups = Object.assign({}, response);
						chrome.runtime.sendMessage({command: "get_theme", windowId: CurrentWindowId}, function(response) {
							ApplyTheme(response);
							Initialize();
						});
					});
				});
			});
		});
	});
}
function Initialize() {
	// APPEND GROUPS
	AppendGroups(bggroups);
	chrome.tabs.query({currentWindow: true}, function(tabs) {
		// APPEND FOLDERS
		AppendFolders(bgfolders);
		// APPEND TABS
		let tc = tabs.length;
		for (var ti = 0; ti < tc; ti++) {
			AppendTab(tabs[ti], false, false, false, true, false, true, false, true, false, false);
		}
		for (var ti = 0; ti < tc; ti++) {
			if (bgtabs[tabs[ti].id] && !tabs[ti].pinned) {
				let TabParent = document.getElementById("ct"+bgtabs[tabs[ti].id].parent) ;

				if (TabParent != null && document.querySelector("[id='"+tabs[ti].id+"'] #ct"+bgtabs[tabs[ti].id].parent) == null) {
					TabParent.appendChild(document.getElementById(tabs[ti].id));
				}
			}
		}
		for (var ti = 0; ti < tc; ti++) {
			if (bgtabs[tabs[ti].id] && !tabs[ti].pinned && bgtabs[tabs[ti].id].expand != "") {
				document.getElementById(tabs[ti].id).classList.add(bgtabs[tabs[ti].id].expand);
			}
		}
		// SET ACTIVE TAB FOR EACH GROUP
		chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
			chrome.runtime.sendMessage({command: "get_active_group", windowId: CurrentWindowId}, function(response) {
				for (var group in bggroups) {
					if (response && tabs[0].pinned && response == group) {
						SetActiveTab(tabs[0].id);
						continue;
					}
					let activeInGroup = document.querySelector("#"+group+" [id='"+bggroups[group].active_tab+"']");
					if (activeInGroup != null) {
						activeInGroup.classList.add("active_tab");
					}
				}
				if (response) {
					SetActiveGroup(response, true, true);
				} else {
					SetActiveGroup("tab_list", true, true);
				}
			});
		});
		RearrangeTreeTabs(tabs, bgtabs, true);
		RearrangeFolders(true);
		StartChromeListeners();
		SetMenu();
		SetEvents();
		HideMenus();
		if (opt.switch_with_scroll) {
			BindTabsSwitchingToMouseWheel("pin_list");
		}
		if (opt.syncro_tabbar_tabs_order || opt.syncro_tabbar_groups_tabs_order) {
			RearrangeBrowserTabs();
		}
		RestorePinListRowSettings();
		if (browserId == "V") {
			VivaldiRefreshMediaIcons();
		}
		setTimeout(function() {
			RefreshExpandStates();
			RefreshCounters();
		}, 3000);
		setTimeout(function() {
			UpdateData();
			delete bgtabs;
			delete theme;
		}, 5000);
		if (browserId != "F") {
			chrome.storage.local.get(null, function(items) {
				if (Object.keys(items["windows_BAK1"]).length > 0 && document.getElementById("button_load_bak1") != null) { document.getElementById("button_load_bak1").classList.remove("disabled"); }
				if (Object.keys(items["windows_BAK2"]).length > 0 && document.getElementById("button_load_bak2") != null) { document.getElementById("button_load_bak2").classList.remove("disabled"); }
				if (Object.keys(items["windows_BAK3"]).length > 0 && document.getElementById("button_load_bak3") != null) { document.getElementById("button_load_bak3").classList.remove("disabled"); }
			});
		}
	});			
}