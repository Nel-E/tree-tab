// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

document.addEventListener("DOMContentLoaded", Run(), false);
function Loadi18n() {
	// toolbar labels
	$(".button").each(function() {
		$(this).attr("title", chrome.i18n.getMessage(this.id));
	});
	// menu labels
	$(".menu_item").each(function() {
		$(this).text(chrome.i18n.getMessage(this.id));
	});
	// edit group dialog labels
	$(".edit_dialog_button").each(function() {
		$(this)[0].textContent = chrome.i18n.getMessage(this.id);
	});
}
function RestorePinListRowSettings() {
	if (opt.pin_list_multi_row) {
		$("#pin_list").css({"white-space": "normal", "overflow-x": "hidden"});
	} else {
		$("#pin_list").css({"white-space": "", "overflow-x": ""});
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
			AppendTab({tab: tabs[ti], Append: true, SkipSetActive: true});
		}
		for (var ti = 0; ti < tc; ti++) {
			if (bgtabs[tabs[ti].id] && !tabs[ti].pinned) {
				if ($("#"+bgtabs[tabs[ti].id].parent).length > 0 && $("#"+tabs[ti].id).find($("#ch"+bgtabs[tabs[ti].id].parent)).length == 0) {
					$("#ch"+bgtabs[tabs[ti].id].parent).append($("#"+tabs[ti].id));
				}
			}
		}
		for (var ti = 0; ti < tc; ti++) {
			if (bgtabs[tabs[ti].id] && !tabs[ti].pinned) {
				$("#"+tabs[ti].id).addClass(bgtabs[tabs[ti].id].expand);
			}
		}
		// SET ACTIVE TAB FOR EACH GROUP
		for (var group in bggroups) {
			if ($("#"+group+" #"+bggroups[group].active_tab)[0]) {
				$("#"+bggroups[group].active_tab).addClass("active_tab");
			}
		}				
		chrome.runtime.sendMessage({command: "get_active_group", windowId: CurrentWindowId}, function(response) {
			SetActiveGroup(response, false, true);
		});
		RearrangeTreeTabs(tabs, bgtabs, true);
		RearrangeFolders(true);
		SetToolbarShelfToggle("mousedown");
		StartChromeListeners();
		SetIOEvents();
		SetToolbarEvents();
		SetTRefreshEvents();
		SetGroupEvents();
		SetTabEvents();
		SetFolderEvents();
		SetMenu();
		SetDragAndDropEvents();
		if (opt.syncro_tabbar_tabs_order || opt.syncro_tabbar_groups_tabs_order) {
			RearrangeBrowserTabs();
		}
		RestorePinListRowSettings();
		if (browserId == "V") {
			VivaldiRefreshMediaIcons();
		}
		
		var SetActiveLoop = setInterval(function() {
			log("SetActiveTab");
			chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
				if (tabs[0].pinned && $("#"+active_group+" .active_tab")[0]) {
					SetActiveTab(tabs[0].id);
				} else {
					clearInterval(SetActiveLoop);
				}
			});
		}, 1000);

		setTimeout(function() {
			RefreshExpandStates();
			RefreshCounters();
		}, 1000);
		setTimeout(function() {
			UpdateData();
			delete bgtabs;
			delete theme;
		}, 5000);
		if (browserId != "F") {
			chrome.storage.local.get(null, function(items) {
				if (Object.keys(items["windows_BAK1"]).length > 0) { $("#button_load_bak1").removeClass("disabled"); }
				if (Object.keys(items["windows_BAK2"]).length > 0) { $("#button_load_bak2").removeClass("disabled"); }
				if (Object.keys(items["windows_BAK3"]).length > 0) { $("#button_load_bak3").removeClass("disabled"); }
			});
		}
	});			
}