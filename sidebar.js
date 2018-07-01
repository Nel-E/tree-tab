// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

document.addEventListener("DOMContentLoaded", Run(), false);


function Run() {
	ShowStatusBar({show: true, spinner: true, message: "Starting up"});
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
	chrome.windows.getCurrent({populate: true}, function(window) {
		tt.CurrentWindowId = window.id;
		let tabs = window.tabs;
		chrome.storage.local.get(null, function(storage) {
			GetCurrentPreferences(storage);
		
			ApplyTheme(GetCurrentTheme(storage));

			if (opt.show_toolbar) {
				RecreateToolbar(GetCurrentToolbar(storage));
				SetToolbarEvents(false, true, true, "mousedown");
				RestoreToolbarShelf();
				RestoreToolbarSearchFilter();
			}
			
			chrome.runtime.sendMessage({command: "get_browser_tabs"}, function(bgtabs) {
				chrome.runtime.sendMessage({command: "get_folders", windowId: tt.CurrentWindowId}, function(f) {
					tt.folders = Object.assign({}, f);
					chrome.runtime.sendMessage({command: "get_groups", windowId: tt.CurrentWindowId}, function(g) {
						tt.groups = Object.assign({}, g);
						// APPEND GROUPS
						AppendGroups(tt.groups);
						// APPEND FOLDERS
						AppendFolders(tt.folders);
						// APPEND TABS
						let ti = 0;
						let tc = tabs.length;
						let ttTabs = [];
					
						for (ti = 0; ti < tc; ti++) {
							ttTabs.push(AppendTab({  tab: tabs[ti], Append: true, SkipSetActive: true, AdditionalClass: (bgtabs[tabs[ti].id].expand != "" ? bgtabs[tabs[ti].id].expand : undefined)  }));
						}
				
						if (opt.skip_load == false) {
							for (ti = 0; ti < tc; ti++) {
								if (bgtabs[tabs[ti].id] && !tabs[ti].pinned) {
									let TabParent = document.getElementById("ct"+bgtabs[tabs[ti].id].parent);
									if (TabParent != null && document.querySelector("[id='"+tabs[ti].id+"'] #ct"+bgtabs[tabs[ti].id].parent) == null) {
										TabParent.appendChild(ttTabs[ti]);
									}
								}
							}
						}
						// SET ACTIVE TAB FOR EACH GROUP, REARRENGE EVERYTHING AND START BROWSER LISTENERS
						SetActiveTabInEachGroup();
						RearrangeFolders(true);
						RearrangeTreeTabs(bgtabs, true);
						StartSidebarListeners();
	
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
						ShowStatusBar({show: true, spinner: false, message: "Ready.", hideTimeout: 2000});
						setTimeout(function() {
							UpdateData();
							delete b;
							delete DefaultToolbar;
							delete DefaultTheme;
							delete DefaultPreferences;
							if (storage.emergency_reload != undefined) {
								chrome.storage.local.remove("emergency_reload");
							}
						}, 5000);
						if (browserId != "F") {
							if (storage.windows_BAK1 && Object.keys(storage["windows_BAK1"]).length > 0 && document.getElementById("button_load_bak1") != null) { document.getElementById("button_load_bak1").classList.remove("disabled"); }
							if (storage.windows_BAK2 && Object.keys(storage["windows_BAK2"]).length > 0 && document.getElementById("button_load_bak2") != null) { document.getElementById("button_load_bak2").classList.remove("disabled"); }
							if (storage.windows_BAK3 && Object.keys(storage["windows_BAK3"]).length > 0 && document.getElementById("button_load_bak3") != null) { document.getElementById("button_load_bak3").classList.remove("disabled"); }
						}
					});
				});
			});
		});
	});
}
