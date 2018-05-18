// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

document.addEventListener("DOMContentLoaded", Run(), false);


function Run() {
	chrome.runtime.sendMessage({command: "is_bg_ready"}, function(response) {
		if (response == true) {
			Initialize();
		} else {
			setTimeout(function() {
				Run();
			},100);
		}
	});
}

function Initialize() {
	
	chrome.tabs.query({currentWindow: true}, function(tabs) {
		CurrentWindowId = tabs[0].windowId;

		chrome.storage.local.get(null, function(storage) {
			GetCurrentPreferences(storage);
		
			ApplyTheme(GetCurrentTheme(storage));

			if (opt.show_toolbar) {
				RecreateToolbar(GetCurrentToolbar(storage));
				SetToolbarEvents(false, true, true, "mousedown");
				RestoreToolbarShelf();
				RestoreToolbarSearchFilter();
			}
			
			chrome.runtime.sendMessage({command: "get_browser_tabs"}, function(response) {
				let bgtabs = Object.assign({}, response);
				chrome.runtime.sendMessage({command: "get_folders", windowId: CurrentWindowId}, function(response) {
					bgfolders = Object.assign({}, response);
					chrome.runtime.sendMessage({command: "get_groups", windowId: CurrentWindowId}, function(response) {
						bggroups = Object.assign({}, response);
						// APPEND GROUPS
						AppendGroups(bggroups);
						// APPEND FOLDERS
						AppendFolders(bgfolders);
						// APPEND TABS
						let ti = 0;
						let tc = tabs.length;
						for (ti = 0; ti < tc; ti++) {
							AppendTab(tabs[ti], false, false, false, true, false, true, false, true, false, false);
						}
						for (ti = 0; ti < tc; ti++) {
							if (bgtabs[tabs[ti].id] && !tabs[ti].pinned) {
								let TabParent = document.getElementById("ct"+bgtabs[tabs[ti].id].parent) ;
								if (TabParent != null && document.querySelector("[id='"+tabs[ti].id+"'] #ct"+bgtabs[tabs[ti].id].parent) == null) {
									TabParent.appendChild(document.getElementById(tabs[ti].id));
								}
							}
						}
						for (ti = 0; ti < tc; ti++) {
							if (bgtabs[tabs[ti].id] && !tabs[ti].pinned && bgtabs[tabs[ti].id].expand != "") {
								document.getElementById(tabs[ti].id).classList.add(bgtabs[tabs[ti].id].expand);
							}
						}
						// SET ACTIVE TAB FOR EACH GROUP
						SetActiveTabInEachGroup();
						RearrangeTreeTabs(tabs, bgtabs, true);
						RearrangeFolders(true);
						StartChromeListeners();
						SetMenu();
						SetEvents();
						SetManagerEvents();
						HideMenus();
						if (opt.switch_with_scroll) {
							BindTabsSwitchingToMouseWheel("pin_list");
						}
						if (opt.syncro_tabbar_tabs_order || opt.syncro_tabbar_groups_tabs_order) {
							RearrangeBrowserTabs();
						}
						RestorePinListRowSettings();
						StartAutoSaveSession();
						if (browserId == "V") {
							VivaldiRefreshMediaIcons();
						}
						setTimeout(function() {
							RefreshExpandStates();
							RefreshCounters();
							SetActiveTabInEachGroup();
							if (browserId == "F" && opt.skip_load == false && storage.emergency_reload == undefined) {
								RecheckFirefox();
							}
						}, 1000);
						setTimeout(function() {
							UpdateData();
							delete debug;
							delete running;
							delete schedule_save;
							delete windows;
							delete tabs;
							delete tt_ids;
							delete DefaultToolbar;
							delete DefaultTheme;
							delete DefaultPreferences;
							if (storage.emergency_reload != undefined) {
								chrome.storage.local.remove("emergency_reload");
							}
						}, 5000);
						if (browserId != "F") {
							if (Object.keys(storage["windows_BAK1"]).length > 0 && document.getElementById("button_load_bak1") != null) { document.getElementById("button_load_bak1").classList.remove("disabled"); }
							if (Object.keys(storage["windows_BAK2"]).length > 0 && document.getElementById("button_load_bak2") != null) { document.getElementById("button_load_bak2").classList.remove("disabled"); }
							if (Object.keys(storage["windows_BAK3"]).length > 0 && document.getElementById("button_load_bak3") != null) { document.getElementById("button_load_bak3").classList.remove("disabled"); }
						}
					});
				});
			});
		});
	});
}
