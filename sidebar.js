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

function StartSidebarListeners() {
    if (browserId == "F") {
        browser.browserAction.onClicked.addListener(function(tab) {
            if (tab.windowId == tt.CurrentWindowId) browser.sidebarAction.close();
        });
    }
    chrome.commands.onCommand.addListener(function(command) {
        if (command == "close_tree") {
            chrome.windows.getCurrent({populate: false}, function(window) {
                if (window.id == tt.CurrentWindowId && window.focused) {
                    chrome.tabs.query({windowId: tt.CurrentWindowId, active: true}, function(tabs) {
                        let tabsArr = [];
                        let close_tree = document.querySelectorAll("[id='" + tabs[0].id + "'] .tab, [id='" + tabs[0].id + "']");
                        for (let s of close_tree) {
                            tabsArr.push(parseInt(s.id));
                            if (s.childNodes[2].childNodes.length > 0) {
                                let trees_children = document.querySelectorAll("#" + s.childNodes[2].id + " .tab");
                                for (let t of trees_children) {
                                    tabsArr.push(parseInt(t.id));
                                }
                            }
                        }
                        Tabs_CloseTabs(tabsArr);
                    });
                }
            });
        }
    });
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.command == "bg_started") {
            window.location.reload();
            return;
        }
        if (message.command == "backup_available") {
            if (opt.debug) Utils_log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
            let BAKbutton = document.getElementById("button_load_bak" + message.bak);
            if (BAKbutton != null) BAKbutton.classList.remove("disabled");
            return;
        }
        if (message.command == "drag_start") {
            if (opt.debug) Utils_log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
            DOM_CleanUpDragAndDrop();
            tt.DragTreeDepth = message.DragTreeDepth;
            tt.DraggingGroup = message.DraggingGroup;
            tt.DraggingPin = message.DraggingPin;
            tt.DraggingTab = message.DraggingTab;
            tt.DraggingFolder = message.DraggingFolder;
            return;
        }
        if (message.command == "drag_end") {
            if (opt.debug) Utils_log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
            tt.Dragging = false;
            DOM_CleanUpDragAndDrop();
            DOM_RemoveHighlight();
            return;
        }
        if (message.command == "remove_folder") {
            if (opt.debug) Utils_log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command + " folderId: " + message.folderId);
            Folders_RemoveFolder(message.folderId);
            return;
        }
        if (message.command == "remove_group") {
            if (opt.debug) Utils_log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command + " groupId: " + message.groupId);
            setTimeout(function() {Groups_GroupRemove(message.groupId, false);}, 2000);
            return;
        }
        if (message.command == "reload_sidebar") {
            if (opt.debug) Utils_log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
            window.location.reload();
            return;
        }
        if (message.command == "reload_options") {
            if (opt.debug) Utils_log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
            opt = Object.assign({}, message.opt);
            setTimeout(function() {
                Theme_RestorePinListRowSettings();
            }, 100);
            return;
        }
        if (message.command == "reload_toolbar") {
            if (opt.debug) Utils_log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
            opt = Object.assign({}, message.opt);
            if (opt.show_toolbar) {
                Toolbar_RemoveToolbar();
                Toolbar_RecreateToolbar(message.toolbar);
                Toolbar_SetToolbarEvents(false, true, true, "mousedown", true);
                Toolbar_RestoreToolbarShelf();
                Toolbar_RestoreToolbarSearchFilter();
            } else {
                Toolbar_RemoveToolbar();
            }
            DOM_RefreshGUI();
            return;
        }
        if (message.command == "reload_theme") {
            if (opt.debug) Utils_log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
            Theme_RestorePinListRowSettings();
            Theme_ApplyTheme(message.theme);
            return;
        }
        if (message.windowId == tt.CurrentWindowId) {
            if (message.command == "tab_created") {
                if (message.InsertAfterId && document.querySelectorAll("#" + tt.active_group + " .tab").length == 0) {
                    message.InsertAfterId = undefined;
                    message.ParentId = tt.active_group;
                }
                tt.tabs[message.tabId] = new Tabs_ttTab({tab: message.tab, ParentId: message.ParentId, InsertAfterId: message.InsertAfterId, Append: message.Append, Scroll: true});
                DOM_RefreshExpandStates();
                setTimeout(function() {
                    DOM_RefreshCounters();
                    DOM_RefreshGUI();
                }, 50);
                if (opt.syncro_tabbar_tabs_order) {
                    let tabIds = Array.prototype.map.call(document.querySelectorAll(".pin, .tab"), function(s) {return parseInt(s.id);});
                    chrome.tabs.move(message.tab.id, {index: tabIds.indexOf(message.tab.id)});
                }
                setTimeout(function() {tt.schedule_update_data++;}, 2000);
                return;
            }
            if (message.command == "tab_attached") {
                if (opt.debug) Utils_log("chrome event: " + message.command + ", tabId: " + message.tabId + ", tab is pinned: " + message.tab.pinned + ", ParentId: " + message.ParentId);
                tt.tabs[message.tabId] = new Tabs_ttTab({tab: message.tab, ParentId: message.ParentId, Append: true, SkipSetActive: false, SkipMediaIcon: false});
                DOM_RefreshGUI();
                return;
            }
            if (message.command == "tab_detached") {
                if (opt.debug) Utils_log("chrome event: " + message.command + ", tabId: " + message.tabId);
                let Tab = document.getElementById(message.tabId);
                if (Tab != null && tt.tabs[message.tabId]) {
                    let ctDetachedParent = Tab.childNodes[1];
                    if (opt.promote_children_in_first_child == true && Tab.childNodes[1].childNodes.length > 1) {
                        DOM_PromoteChildrenToFirstChild(Tab);
                    } else {
                        while (ctDetachedParent.firstChild) {
                            ctDetachedParent.parentNode.parentNode.insertBefore(ctDetachedParent.firstChild, ctDetachedParent.parentNode);
                        }
                    }
                }
                tt.tabs[message.tabId].RemoveTab();
                setTimeout(function() {tt.schedule_update_data++;}, 300);
                DOM_RefreshGUI();
                return;
            }
            if (message.command == "tab_removed") {
                if (opt.debug) {Utils_log("chrome event: " + message.command + ", tabId: " + message.tabId);}
                let mTab = document.getElementById(message.tabId);
                if (mTab != null && tt.tabs[message.tabId]) {
                    let ctParent = mTab.childNodes[1];
                    if (opt.debug) Utils_log("tab_removed, promote children: " + opt.promote_children);
                    if (opt.promote_children == true) {
                        if (opt.promote_children_in_first_child == true && mTab.childNodes[1].childNodes.length > 1) {
                            DOM_PromoteChildrenToFirstChild(mTab);
                        } else {
                            while (ctParent.firstChild) {
                                ctParent.parentNode.parentNode.insertBefore(ctParent.firstChild, ctParent.parentNode);
                            }
                        }
                    } else {
                        let tab_children = document.querySelectorAll("[id='" + message.tabId + "'] .tab");
                        for (let s of tab_children) {
                            chrome.tabs.remove(parseInt(s.id));
                        }
                    }
                    tt.tabs[message.tabId].RemoveTab();
                    DOM_RefreshExpandStates();
                    setTimeout(function() {tt.schedule_update_data++;}, 300);
                    DOM_RefreshGUI();
                    DOM_RefreshCounters();
                }
                return;
            }
            if (message.command == "tab_activated") {
                if (opt.debug) Utils_log("chrome event: " + message.command + ", tabId: " + message.tabId);
                Tabs_SetActiveTab(message.tabId, true);
                return;
            }
            if (message.command == "tab_attention") {
                if (opt.debug) Utils_log("chrome event: " + message.command + ", tabId: " + message.tabId);
                if (tt.tabs[message.tabId]) tt.tabs[message.tabId].SetAttentionIcon();
                return;
            }
            if (message.command == "tab_updated") {
                if (opt.debug) Utils_log("chrome event: " + message.command + ", tabId: " + message.tabId);
                if (tt.tabs[message.tabId]) {
                    if (message.changeInfo.favIconUrl != undefined || message.changeInfo.url != undefined) {
                        if (browserId == "F" && (message.changeInfo.favIconUrl == undefined || message.changeInfo.favIconUrl == "")) browser.sessions.setTabValue(message.tabId, "CachedFaviconUrl", "");
                        setTimeout(function() {
                            if (tt.tabs[message.tabId]) tt.tabs[message.tabId].GetFaviconAndTitle(true);
                        }, 100);
                    }
                    if (message.changeInfo.title != undefined) {
                        setTimeout(function() {
                            if (tt.tabs[message.tabId]) tt.tabs[message.tabId].GetFaviconAndTitle(true);
                        }, 1000);
                    }
                    if (message.changeInfo.audible != undefined || message.changeInfo.mutedInfo != undefined) tt.tabs[message.tabId].RefreshMediaIcon();
                    if (message.changeInfo.discarded != undefined) tt.tabs[message.tabId].RefreshDiscarded();
                    if (message.changeInfo.pinned != undefined) {
                        let updateTab = document.getElementById(message.tabId);
                        if (updateTab != null) {
                            if (message.tab.pinned && updateTab.classList.contains("pin") == false) {
                                tt.tabs[message.tabId].SetTabClass(true);
                                tt.tabs[message.tabId].pinned = true;
                                tt.schedule_update_data++;
                            }
                            if (!message.tab.pinned && updateTab.classList.contains("tab") == false) {
                                tt.tabs[message.tabId].SetTabClass(false);
                                tt.tabs[message.tabId].pinned = false;
                                tt.schedule_update_data++;
                            }
                        }
                        DOM_RefreshExpandStates();
                    }
                }
                return;
            }
            // if (message.command == "set_active_group") {
            // Groups_SetActiveGroup(message.groupId, false, false);
            // return;
            // }
            if (message.command == "remote_update") {
                if (opt.debug) {
                    Utils_log("chrome event: " + message.command + ", tabId: " + message.tabId);
                    Utils_log(message);
                }
                Manager_RecreateTreeStructure(message.groups, message.folders, message.tabs);
                sendResponse(true);
                tt.schedule_update_data++;
                return;
            }
            if (message.command == "switch_active_tab") {
                Tabs_SwitchActiveTabBeforeClose(tt.active_group);
                return;
            }
        }
    });
}





function Initialize() {
	chrome.windows.getCurrent({populate: true}, function(window) {
		tt.CurrentWindowId = window.id;
		chrome.storage.local.get(null, function(storage) {
			Preferences_GetCurrentPreferences(storage);

			Menu_CreateMenu();
			Theme_ApplyTheme(Theme_GetCurrentTheme(storage));

			if (opt.show_toolbar) {
				Toolbar_RecreateToolbar(Theme_GetCurrentToolbar(storage));
				Toolbar_SetToolbarEvents(false, true, true, "mousedown", true, false);
				Toolbar_RestoreToolbarShelf();
				Toolbar_RestoreToolbarSearchFilter();
			}
			
			chrome.runtime.sendMessage({command: "get_browser_tabs"}, function(bgtabs) {
				chrome.runtime.sendMessage({command: "get_folders", windowId: tt.CurrentWindowId}, function(f) {
					tt.folders = Object.assign({}, f);
					chrome.runtime.sendMessage({command: "get_groups", windowId: tt.CurrentWindowId}, function(g) {
						tt.groups = Object.assign({}, g);
						// APPEND GROUPS
						Groups_AppendGroups(tt.groups);

						// APPEND FOLDERS TO TABLIST
						Folders_PreAppendFolders(tt.folders);					

						// APPEND TABS TO TABLIST
						for (const tab of window.tabs) {
							tt.tabs[tab.id] = new Tabs_ttTab({tab: tab, Append: true, SkipSetActive: true, AdditionalClass: ((bgtabs[tab.id] && bgtabs[tab.id].expand != "") ? bgtabs[tab.id].expand : undefined)});
						}
						
						// APPEND FOLDERS TO CORRECT PARENTS
						Folders_AppendFolders(tt.folders);
				
						// APPEND TABS TO CORRECT PARENTS
						if (opt.skip_load == false) {
							for (const tab of window.tabs) {
								if (bgtabs[tab.id] && !tab.pinned) {
									let TabParent = document.getElementById("°"+bgtabs[tab.id].parent);
									if (TabParent != null && document.querySelector("[id='"+tab.id+"'] #°"+bgtabs[tab.id].parent) == null) {
										TabParent.appendChild(tt.tabs[tab.id].Node);
									}
								}
							}
						}
                        
						// SET ACTIVE TAB FOR EACH GROUP, REARRENGE EVERYTHING AND START BROWSER LISTENERS
						Groups_SetActiveTabInEachGroup();
						Tabs_RearrangeTree(bgtabs, tt.folders, true);
						
						StartSidebarListeners();
	
						DOM_SetEvents();
						Manager_SetManagerEvents();
						Menu_HideMenus();
						
						if (opt.switch_with_scroll) {
							DOM_BindTabsSwitchingToMouseWheel("pin_list");
						}
						if (opt.syncro_tabbar_tabs_order || opt.syncro_tabbar_groups_tabs_order) {
							Tabs_RearrangeBrowserTabs();
						}
						
						Theme_RestorePinListRowSettings();
						Manager_StartAutoSaveSession();
						
						if (browserId == "O") {
							DOM_AutoRefreshMediaIcons();
						}
						
						setTimeout(function() {
							DOM_RefreshExpandStates();
							DOM_RefreshCounters();
							Groups_SetActiveTabInEachGroup();
						}, 1000);
						
						Manager_ShowStatusBar({show: true, spinner: false, message: "Ready.", hideTimeout: 2000});
						
						setTimeout(function() {
							Tabs_SaveTabs();
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

function Run() {
	Manager_ShowStatusBar({show: true, spinner: true, message: "Starting up"});
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

document.addEventListener("DOMContentLoaded", Run(), false);