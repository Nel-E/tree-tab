// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function FirefoxStart(retry) {
	chrome.windows.getAll({windowTypes: ["normal"], populate: true}, function(w) {
		if (w[0].tabs.length == 1 && (w[0].tabs[0].url == "about:blank" || w[0].tabs[0].url == "about:sessionrestore")) {
			setTimeout(function() {
				FirefoxStart(retry+1);
			}, 2000);
		} else {
			FirefoxLoadTabs(0);
			if (retry > 0) {
				chrome.runtime.sendMessage({command: "reload_sidebar"});
			}
			setTimeout(function() {
				schedule_save = 0;
			}, 2000);
		}
	});			
}
function FirefoxLoadTabs(retry) {
	chrome.windows.getAll({windowTypes: ["normal"], populate: true}, function(w) {
		chrome.storage.local.get(null, function(storage) {
			// LOAD PREFERENCES
			GetCurrentPreferences(storage);

			// CACHED COUNTS AND STUFF
			// let tt_ids = {};
			let tabs_matched = 0;
			let tabs_count = 0;
			for (let wIndex = 0; wIndex < w.length; wIndex++) {
				tabs_count += w[wIndex].tabs.length;
			}
			let lastWinId = w[w.length-1].id;
			let lastTabId = w[w.length-1].tabs[w[w.length-1].tabs.length-1].id;
			let WinCount = w.length;

			if (opt.debug == true) {
				if (storage.debug_log != undefined) {
					debug =  storage.debug_log;
				}
				if (retry == 0) {
					pushlog("TreeTabs background start");
				}
			}

			for (let wIndex = 0; wIndex < WinCount; wIndex++) {
				let winIndex = wIndex;
				let winId = w[winIndex].id;
				let tabsCount = w[winIndex].tabs.length;

				// LOAD TTID FROM FIREFOX GET WINDOW VALUE
				let win = Promise.resolve(browser.sessions.getWindowValue(winId, "TTdata")).then(function(WindowData) {
					if (opt.skip_load == false && WindowData != undefined) {
						windows[winId] = Object.assign({}, WindowData);
					} else {
						windows[winId] = {ttid: "", group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, active_tab: 0, active_tab_ttid: "", prev_active_tab: 0, prev_active_tab_ttid: "", name: caption_ungrouped_group, font: ""}}, folders: {}};
					}
					for (let tIndex = 0; tIndex < tabsCount; tIndex++) {
						let tabIndex = tIndex;
						let tabId = w[winIndex].tabs[tabIndex].id;
						let tabPinned = w[winIndex].tabs[tabIndex].pinned;
						// LOAD TTID FROM FIREFOX GET TAB VALUE
						let tab = Promise.resolve(browser.sessions.getTabValue(tabId, "TTdata")).then(function(TabData) {
							if (opt.skip_load == false && TabData != undefined) {
								tabs[tabId] = Object.assign({}, TabData);
								tt_ids[tabs[tabId].ttid] = tabId;
								tabs_matched++;
							} else {
								tabs[tabId] = {ttid: "", parent_ttid: "", parent: tabPinned ? "pin_list" : "tab_list", index: tabIndex, expand: ""};
							}
							// IF ON LAST TAB AND LAST WINDOW, START MATCHING LOADED DATA
							if (tabId == lastTabId && winId == lastWinId) {
								for (let ThisSessonWinId in windows) {
									if (windows[ThisSessonWinId].ttid == "") {
										AppendWinTTId(parseInt(ThisSessonWinId));
									}
								}
								// OK, DONE WITH WINDOWS, START TABS LOOP
								for (let ThisSessonTabId in tabs) {
									if (tabs[ThisSessonTabId].ttid == "") {
										AppendTabTTId(parseInt(ThisSessonTabId));
									}
								}
								// OK, DONE, NOW REPLACE OLD PARENTS IDS WITH THIS SESSION IDS
								for (let ThisSessonTabId in tabs) {
									if (tt_ids[tabs[ThisSessonTabId].parent_ttid] != undefined) {
										tabs[ThisSessonTabId].parent = tt_ids[tabs[ThisSessonTabId].parent_ttid];
									}
								}
								// OK, SAME THING FOR ACTIVE TABS IN GROUPS
								for (let ThisSessonWinId in windows) {
									for (let group in windows[ThisSessonWinId].groups) {
										if (tt_ids[windows[ThisSessonWinId].groups[group].active_tab_ttid] != undefined) {
											windows[ThisSessonWinId].groups[group].active_tab = tt_ids[windows[ThisSessonWinId].groups[group].active_tab_ttid];
										}
										if (tt_ids[windows[ThisSessonWinId].groups[group].prev_active_tab_ttid] != undefined) {
											windows[ThisSessonWinId].groups[group].prev_active_tab = tt_ids[windows[ThisSessonWinId].groups[group].prev_active_tab_ttid];
										}
									}
								}

								if (opt.debug){
									pushlog("FirefoxLoadTabs, retry: "+retry);
									pushlog("Current windows count is: "+w.length);
									pushlog("Current tabs count is: "+tabs_count);
									pushlog("Matching tabs: "+tabs_matched);
									pushlog("Current windows:");
									pushlog(w);
								}


								// will try to find tabs for 3 times
								if (opt.skip_load == true || retry > 2 || (tabs_matched > tabs_count*0.5)) {
									running = true;
									FirefoxAutoSaveData();
									FirefoxListeners();

									delete schedule_update_data;
									delete schedule_rearrange_tabs;
									delete DragNodeClass;
									delete DragOverTimer;
									delete DragTreeDepth;
									delete menuItemNode;
									delete CurrentWindowId;
									delete SearchIndex;
									delete active_group;
									delete browserId;
									delete bggroups;
									delete bgfolders;
									delete caption_clear_filter;
									delete caption_loading;
									delete caption_searchbox;
									delete DefaultToolbar;
									delete DefaultTheme;
									delete DefaultPreferences;
									
									delete newTabUrl;
									delete EmptyTabs;
								} else {
									if (opt.debug){
										pushlog("Attempt "+retry+" failed, matched tabs was below 50%");
									}
									setTimeout(function() {
										FirefoxLoadTabs(retry+1);
									}, 2000);
								}
							}
						});
					}
				});
			}
		});
	});
}
// save every second if there is anything to save obviously
async function FirefoxAutoSaveData() {
	setInterval(function() {
		if (schedule_save > 1) {
			schedule_save = 1;
		}
		if (running && schedule_save > 0 && Object.keys(tabs).length > 1) {
			chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {
				let WinCount = w.length;
				for (let wIndex = 0; wIndex < WinCount; wIndex++) {
					let winId = w[wIndex].id;
					if (windows[winId] != undefined && windows[winId].ttid != undefined && windows[winId].group_bar != undefined && windows[winId].search_filter != undefined && windows[winId].active_shelf != undefined && windows[winId].active_group != undefined && windows[winId].groups != undefined && windows[winId].folders != undefined) {
						browser.sessions.setWindowValue(winId, "TTdata", windows[winId]   );
					}
					let TabsCount = w[wIndex].tabs.length;
					for (let tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
						let tabId = w[wIndex].tabs[tabIndex].id;
						if (tabs[tabId] != undefined && tabs[tabId].ttid != undefined && tabs[tabId].parent != undefined && tabs[tabId].index != undefined && tabs[tabId].expand != undefined) {
							browser.sessions.setTabValue( tabId, "TTdata", tabs[tabId] );
						}
					}
				}
				schedule_save--;
			});
		}
		if (opt.debug == true) {
			chrome.storage.local.set({debug_log: debug});
		}
	}, 1000);
}
function GenerateNewWindowID() {
	let newID = "w_"+GenerateRandomID();
	let newIdAvailable = true;
	for (let windowId in windows) {
		if (windows[windowId].ttid == newID) {
			newIdAvailable = false;
		}
	}
	if (newIdAvailable) {
		return newID;
	} else {
		GenerateNewWindowID();
	}
}
function GenerateNewTabID() {
	let newID = "t_"+GenerateRandomID();
	let newIdAvailable = true;
	// for (let tabId in tabs) {
		// if (tabs[tabId].ttid == newID) {
			// newIdAvailable = false;
		// }
	// }
	if (tt_ids[newID] != undefined) {
		newIdAvailable = false;
	}
	if (newIdAvailable) {
		return newID;
	} else {
		GenerateNewTabID();
	}
}
function AppendTabTTId(tabId) {
	let NewTTTabId = GenerateNewTabID();
	if (tabs[tabId] != undefined) {
		tabs[tabId].ttid = NewTTTabId;
	} else {
		tabs[tabId] = {ttid: NewTTTabId, parent: "tab_list", parent_ttid: "", index: 0, expand: ""};
	}
	tt_ids[NewTTTabId] = tabId;
	return NewTTTabId;
	// if (schedule_save > 0) browser.sessions.setTabValue( tabId, "TTdata", tabs[tabId] );
}

function AppendWinTTId(windowId) {
	let NewTTWindowId = GenerateNewWindowID();
	if (windows[windowId] != undefined) {
		windows[windowId].ttid = NewTTWindowId;
	} else {
		windows[windowId] = {ttid: NewTTWindowId, group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, active_tab: 0, active_tab_ttid: "", prev_active_tab: 0, prev_active_tab_ttid: "", name: caption_ungrouped_group, font: ""}}, folders: {}};
	}
	// if (schedule_save > 0) browser.sessions.setWindowValue( windowId, "TTdata", windows[windowId] );
}
function ReplaceParents(oldTabId, newTabId) {
	for (let tabId in tabs) {
		if (tabs[tabId].parent == oldTabId) {
			tabs[tabId].parent = newTabId;
		}
	}
}
let DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA = {};					// MOZILLA BUG 1398272
// start all listeners
function FirefoxListeners() {
	browser.browserAction.onClicked.addListener(function() {
		browser.sidebarAction.setPanel({panel: (browser.extension.getURL("/sidebar.html")) });
		browser.sidebarAction.open();
	});
	chrome.tabs.onCreated.addListener(function(tab) {
		let t = Promise.resolve(browser.sessions.getTabValue(tab.id, "TTdata")).then(function(TabData) {
			if (TabData != undefined) {
				tabs[tab.id] = Object.assign({}, TabData);
				let originalParent = TabData.parent_ttid == "" ? undefined : (tt_ids[TabData.parent_ttid] ? tt_ids[TabData.parent_ttid] : TabData.parent_ttid);
				chrome.runtime.sendMessage({command: "tab_created", windowId: tab.windowId, tabId: tab.id, parentTabId: originalParent, index: TabData.index});
			} else {
				AppendTabTTId(tab.id);
				chrome.runtime.sendMessage({command: "tab_created", windowId: tab.windowId, tabId: tab.id});
			}
			schedule_save++;
		});
	});
	chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
		let oldId = tabId;
		chrome.tabs.get(oldId, function(tab) {
			ReplaceParents(oldId, tab.id);
			tt_ids[tabs[oldId].ttid] = tab.id;																// MOZILLA BUG 1398272
			tabs[tab.id] = tabs[oldId];																		// MOZILLA BUG 1398272
			DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA[oldId] = tab.id;				// MOZILLA BUG 1398272
			DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA[tab.id] = oldId;				// MOZILLA BUG 1398272
			browser.sessions.setTabValue( tab.id, "TTdata", tabs[oldId] );							// MOZILLA BUG 1398272
			chrome.runtime.sendMessage({command: "tab_attached", windowId: attachInfo.newWindowId, tab: tab, tabId: tab.id, ParentId: tabs[tab.id].parent});
			schedule_save++;
		});
	});
	
	chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
		chrome.runtime.sendMessage({command: "tab_detached", windowId: detachInfo.oldWindowId, tabId: tabId});
		let detachTabId = tabId;
		if (DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA[tabId] != undefined) {																												// MOZILLA BUG 1398272
			detachTabId = DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA[tabId];																													// MOZILLA BUG 1398272
			chrome.runtime.sendMessage({command: "tab_detached", windowId: detachInfo.oldWindowId, tabId: DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA[tabId]});		// MOZILLA BUG 1398272
		}																																																							// MOZILLA BUG 1398272
	});
	
	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		setTimeout(function() {
			if (DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA[tabId] != undefined) {																											// MOZILLA BUG 1398272
				chrome.runtime.sendMessage({command: "tab_removed", windowId: removeInfo.windowId, tabId: DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA[tabId]});		// MOZILLA BUG 1398272
			}																																																						// MOZILLA BUG 1398272
			chrome.runtime.sendMessage({command: "tab_removed", windowId: removeInfo.windowId, tabId: tabId});
		}, 5);
		// setTimeout(function() {
			// delete tabs[tabId];
		// },60000);
		schedule_save++;
	});
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (changeInfo.pinned == true && tabs[tabId]) {
			tabs[tabId].parent = "pin_list";
			tabs[tabId].parent_ttid = "";
			schedule_save++;
		} else {
			AppendTabTTId(tabId);
		}
		if (changeInfo.title != undefined && !tab.active) {
			chrome.runtime.sendMessage({command: "tab_attention", windowId: tab.windowId, tabId: tabId});
		}
		chrome.runtime.sendMessage({command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tabId, changeInfo: changeInfo});
	});
	chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
		chrome.tabs.get(addedTabId, function(tab) {
			if (addedTabId == removedTabId) {
				chrome.runtime.sendMessage({command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tab.id, changeInfo: {status: tab.status, url: tab.url, title: tab.title, audible: tab.audible, mutedInfo: tab.mutedInfo}});
			} else {
				if (tabs[removedTabId]) {
					tabs[addedTabId] = tabs[removedTabId];
				}
				ReplaceParents(tabId, tab.id);
				chrome.runtime.sendMessage({command: "tab_removed", windowId: tab.windowId, tabId: removedTabId});
				chrome.runtime.sendMessage({command: "tab_attached", windowId: tab.windowId, tab: tab, tabId: addedTabId, ParentId: tabs[addedTabId].parent});
				// delete ttid[tabs[removedTabId].ttid];
				// delete tabs[removedTabId];
			}
			setTimeout(function() {
				AppendTabTTId(addedTabId);
				schedule_save++;
			}, 100);
			
		});
	});
	chrome.tabs.onActivated.addListener(function(activeInfo) {
		chrome.runtime.sendMessage({command: "tab_activated", windowId: activeInfo.windowId, tabId: activeInfo.tabId});
	});
	chrome.windows.onCreated.addListener(function(window) {
		let win = Promise.resolve(browser.sessions.getWindowValue(window.id, "TTdata")).then(function(WindowData) {
			if (WindowData != undefined) {
				windows[window.id] = Object.assign({}, WindowData);
			} else {
				AppendWinTTId(window.id);
			}
			schedule_save++;
		});
	});
	chrome.windows.onRemoved.addListener(function(windowId) {
		// delete windows[windowId];
		schedule_save++;
	});
	chrome.sessions.onChanged.addListener(function(session) {
		chrome.windows.getAll({windowTypes: ['normal'], populate: false}, function(w) {
			chrome.tabs.query({}, function(t) {
				for (let wiInd = 0; wiInd < w.length; wiInd++) {
					if (windows[w[wiInd].id] == undefined) {
						chrome.runtime.sendMessage({command: "reload_sidebar"});
						window.location.reload();
					}
				}
				for (let tbInd = 0; tbInd < t.length; tbInd++) {
					if (tabs[t[tbInd].id] == undefined) {
						chrome.runtime.sendMessage({command: "reload_sidebar"});
						window.location.reload();
					}
				}
			});
		});
	});
}
function FirefoxMessageListeners() {
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

		if (message.command == "reload") {
			window.location.reload();
			return;
		}
		if (message.command == "get_windows") {
			sendResponse(windows);
			return;
		}
		if (message.command == "get_folders") {
			if (windows[message.windowId]) {
				sendResponse(windows[message.windowId].folders);
			}
			return;
		}
		if (message.command == "save_folders") {
			if (windows[message.windowId]) {
				windows[message.windowId].folders = Object.assign({}, message.folders);
				schedule_save++;
			}
			return;
		}
		if (message.command == "get_groups") {
			if (windows[message.windowId]) {
				sendResponse(windows[message.windowId].groups);
			}
			return;
		}
		if (message.command == "save_groups") {
			if (windows[message.windowId]) {
				windows[message.windowId].groups = Object.assign({}, message.groups);
				for (let group in windows[message.windowId].groups) {
					if (tabs[windows[message.windowId].groups[group].active_tab]) {
						windows[message.windowId].groups[group].active_tab_ttid = tabs[windows[message.windowId].groups[group].active_tab].ttid;
					}
					if (tabs[windows[message.windowId].groups[group].prev_active_tab]) {
						windows[message.windowId].groups[group].prev_active_tab_ttid = tabs[windows[message.windowId].groups[group].prev_active_tab].ttid;
					}
				}				
				schedule_save++;
			}
			return;
		}
		if (message.command == "set_active_group") {
			if (windows[message.windowId]) {
				windows[message.windowId].active_group = message.active_group;
				schedule_save++;
			}
			return;
		}
		if (message.command == "get_active_group") {
			if (windows[message.windowId]) {
				sendResponse(windows[message.windowId].active_group);
			}
			return;
		}
		if (message.command == "set_search_filter") {
			if (windows[message.windowId]) {
				windows[message.windowId].search_filter = message.search_filter;
				schedule_save++;
			}
			return;
		}
		if (message.command == "get_search_filter") {
			if (windows[message.windowId]) {
				sendResponse(windows[message.windowId].search_filter);
			}
			return;
		}
		if (message.command == "set_active_shelf") {
			if (windows[message.windowId]) {
				windows[message.windowId].active_shelf = message.active_shelf;
				schedule_save++;
			}
			return;
		}
		if (message.command == "get_active_shelf") {
			if (windows[message.windowId]) {
				sendResponse(windows[message.windowId].active_shelf);
			}
			return;
		}
		if (message.command == "set_group_bar") {
			if (windows[message.windowId]) {
				windows[message.windowId].group_bar = message.group_bar;
				schedule_save++;
			}
			return;
		}
		if (message.command == "get_group_bar") {
			if (windows[message.windowId]) {
				sendResponse(windows[message.windowId].group_bar);
			}
			return;
		}
		if (message.command == "get_browser_tabs") {
			sendResponse(tabs);
			return;
		}
		if (message.command == "is_bg_ready") {
			sendResponse(running);
			return;
		}
		if (message.command == "update_tab") {
			if (tabs[message.tabId]) {
				if (message.tab.index) {
					tabs[message.tabId].index = message.tab.index;
				}
				if (message.tab.expand) {
					tabs[message.tabId].expand = message.tab.expand;
				}
				if (message.tab.parent) {
					tabs[message.tabId].parent = message.tab.parent;
					if (tabs[message.tab.parent]) {
						tabs[message.tabId].parent_ttid = tabs[message.tab.parent].ttid;
					} else {
						tabs[message.tabId].parent_ttid = "";
					}
				}
				schedule_save++;
			}
			return;
		}
		if (message.command == "update_all_tabs") {
			for (let i = 0; i < message.pins.length; i++) {
				if (tabs[message.pins[i].id]) {
					tabs[message.pins[i].id].parent = "pin_list";
					tabs[message.pins[i].id].parent_ttid = "";
					tabs[message.pins[i].id].expand = "";
					tabs[message.pins[i].id].index = message.pins[i].index;
				}
			}
			for (let j = 0; j < message.tabs.length; j++) {
				if (tabs[message.tabs[j].id]) {
					tabs[message.tabs[j].id].parent = message.tabs[j].parent;
					tabs[message.tabs[j].id].expand = message.tabs[j].expand;
					tabs[message.tabs[j].id].index = message.tabs[j].index;
					if (tabs[message.tabs[j].parent]) {
						tabs[message.tabs[j].id].parent_ttid = tabs[message.tabs[j].parent].ttid;
					} else {
						tabs[message.tabs[j].id].parent_ttid = "";
					}
				}
			}
			schedule_save++;
			return;
		}
		if (message.command == "debug") {
			pushlog(message.log);
			return;
		}
	});
}