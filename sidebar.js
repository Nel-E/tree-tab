// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/



// SIDEBAR VARIABLES

let tt = {
    CurrentWindowId: 0,
    active_group: "tab_list",
    tabs: {},
    groups: {},
    folders: {},
    schedule_update_data: 0,
    schedule_rearrange_tabs: 0,

    Dragging: false,
    DraggingGroup: false,
    DraggingPin: false,
    DraggingTab: false,
    DraggingFolder: false,
    DragTreeDepth: 0,
    DragOverId: "",
    DragOverTimer: undefined,

	DOMmenu: undefined,
	menu: {},
    menuItemNode: undefined,
    SearchIndex: 0,

	AutoSaveSession: undefined,
    pressed_keys: []
};

document.addEventListener("DOMContentLoaded", Run(), false);


function Run() {
	TreeTabs.Manager.ShowStatusBar({show: true, spinner: true, message: "Starting up"});
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

			TreeTabs.Menu.CreateMenu();
			TreeTabs.Theme.ApplyTheme(TreeTabs.Theme.GetCurrentTheme(storage));

			if (opt.show_toolbar) {
				TreeTabs.Toolbar.RecreateToolbar(TreeTabs.Theme.GetCurrentToolbar(storage));
				TreeTabs.Toolbar.SetToolbarEvents(false, true, true, "mousedown", true, false);
				TreeTabs.Toolbar.RestoreToolbarShelf();
				TreeTabs.Toolbar.RestoreToolbarSearchFilter();
			}
			
			chrome.runtime.sendMessage({command: "get_browser_tabs"}, function(bgtabs) {
				chrome.runtime.sendMessage({command: "get_folders", windowId: tt.CurrentWindowId}, function(f) {
					tt.folders = Object.assign({}, f);
					chrome.runtime.sendMessage({command: "get_groups", windowId: tt.CurrentWindowId}, function(g) {
						tt.groups = Object.assign({}, g);
						// APPEND GROUPS
						TreeTabs.Groups.AppendGroups(tt.groups);

						// APPEND FOLDERS TO TABLIST
						TreeTabs.Folders.PreAppendFolders(tt.folders);					
						
						// APPEND TABS TO TABLIST
						// let ta = [];
						let ti = 0;
						let tc = tabs.length;
					
						// for (ti = 0; ti < tc; ti++) {
							// ta.push(AppendTab({  tab: tabs[ti], Append: true, SkipSetActive: true, AdditionalClass: (bgtabs[tabs[ti].id].expand != "" ? bgtabs[tabs[ti].id].expand : undefined)  }));
						// }
						

						for (ti = 0; ti < tc; ti++) {
							// if (bgtabs[tabs[ti].id]){
								tt.tabs[tabs[ti].id] = new TreeTabs.Tabs.ttTab({tab: tabs[ti], Append: true, SkipSetActive: true, AdditionalClass: ((bgtabs[tabs[ti].id] && bgtabs[tabs[ti].id].expand != "") ? bgtabs[tabs[ti].id].expand : undefined)});
							// } else {
							// 	tt.tabs[tabs[ti].id] = new TreeTabs.Tabs.ttTab({tab: tabs[ti], Append: true, SkipSetActive: true)});
							// }
						}
						
						// APPEND FOLDERS TO CORRECT PARENTS
						TreeTabs.Folders.AppendFolders(tt.folders);
                        
                        
                        
				
						// APPEND TABS TO CORRECT PARENTS
						if (opt.skip_load == false) {
							for (ti = 0; ti < tc; ti++) {
								if (bgtabs[tabs[ti].id] && !tabs[ti].pinned) {
									let TabParent = document.getElementById("°"+bgtabs[tabs[ti].id].parent);
									if (TabParent != null && document.querySelector("[id='"+tabs[ti].id+"'] #°"+bgtabs[tabs[ti].id].parent) == null) {
										TabParent.appendChild(tt.tabs[tabs[ti].id].Node);
									}
								}
							}
						}
                        
                        
                        
						// APPEND TABS TO CORRECT PARENTS
						// if (opt.skip_load == false) {
							// for (ti = 0; ti < tc; ti++) {
								// if (bgtabs[tabs[ti].id] && !tabs[ti].pinned) {
									// let TabParent = document.getElementById("°"+bgtabs[tabs[ti].id].parent);
									// if (TabParent != null && document.querySelector("[id='"+tabs[ti].id+"'] #°"+bgtabs[tabs[ti].id].parent) == null) {
										// TabParent.appendChild(ta[ti]);
									// }
								// }
							// }
						// }
                        
                        
                        
                        
                        
                        
						// SET ACTIVE TAB FOR EACH GROUP, REARRENGE EVERYTHING AND START BROWSER LISTENERS
						TreeTabs.Groups.SetActiveTabInEachGroup();
						TreeTabs.Tabs.RearrangeTree(bgtabs, tt.folders, true);
						
						TreeTabs.Browser.StartSidebarListeners();
	
						TreeTabs.DOM.SetEvents();
						TreeTabs.Manager.SetManagerEvents();
						TreeTabs.Menu.HideMenus();
						
						if (opt.switch_with_scroll) {
							TreeTabs.DOM.BindTabsSwitchingToMouseWheel("pin_list");
						}
						if (opt.syncro_tabbar_tabs_order || opt.syncro_tabbar_groups_tabs_order) {
							TreeTabs.Tabs.RearrangeBrowserTabs();
						}
						
						TreeTabs.Theme.RestorePinListRowSettings();
						TreeTabs.Manager.StartAutoSaveSession();
						
						if (browserId == "V" || browserId == "O") {
							TreeTabs.DOM.VivaldiRefreshMediaIcons();
						}
						
						setTimeout(function() {
							TreeTabs.DOM.RefreshExpandStates();
							TreeTabs.DOM.RefreshCounters();
							TreeTabs.Groups.SetActiveTabInEachGroup();
							// if (browserId == "F" && opt.skip_load == false && storage.emergency_reload == undefined) {
								// TreeTabs.Utils.RecheckFirefox();
							// }
						// console.log(tt.tabs);
						}, 1000);
						
						TreeTabs.Manager.ShowStatusBar({show: true, spinner: false, message: "Ready.", hideTimeout: 2000});
						
						setTimeout(function() {
							TreeTabs.Tabs.SaveTabs();
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
