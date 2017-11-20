// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

if (browserId == "F") {
	LoadPreferences();
	FirefoxStart();
	FirefoxMessageListeners();
}


function FirefoxStart() {
	var SafeToRun = true;
	chrome.tabs.query({}, function(t) {
		// will loop forever if session restore tab is found
		for (var tabIndex = 0; tabIndex < t.length; tabIndex++) {
			if (t[tabIndex].url.match("about:sessionrestore") && t.length < 10) {
				SafeToRun = false;
				chrome.tabs.update(t[tabIndex].id, { active: true });
			}
			if (tabIndex == t.length-1) {
				if (SafeToRun) {
					if (localStorage.getItem("t0") !== null){
						LoadV015(0);
					} else {
						if (localStorage.getItem("tabs") !== null){
							FirefoxLoadV100(0);
						} else {
							FirefoxLoadTabs(0);
						}
					}
				} else {
					setTimeout(function() {
						FirefoxStart();
					}, 1000);
				}
			}
		}
	});
}

function FirefoxLoadTabs(retry) {
	chrome.windows.getAll({windowTypes: ["normal"], populate: true}, function(w) {
		var tt_ids = {};
		var tabs_matched = 0;
		var tabs_count = 0;
		for (var wIndex = 0; wIndex < w.length; wIndex++) {
			tabs_count += w[wIndex].tabs.length;
		}

		// CACHED COUNTS AND STUFF
		var lastWinId = w[w.length-1].id;
		var lastTabId = w[w.length-1].tabs[w[w.length-1].tabs.length-1].id;
		var WinCount = w.length;

		for (var wIndex = 0; wIndex < WinCount; wIndex++) {
			let winIndex = wIndex;
			let winId = w[winIndex].id;
			let tabsCount = w[winIndex].tabs.length;

			// LOAD TTID FROM FIREFOX GET WINDOW VALUE
			let win = Promise.resolve(browser.sessions.getWindowValue(winId, "TTdata")).then(function(WindowData) {
				
				if (opt.skip_load == false && WindowData != undefined) {
					windows[winId] = Object.assign({}, WindowData);
				} else {
					windows[winId] = {ttid: "", group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, activetab: 0, activetab_ttid: "", name: caption_ungrouped_group, font: ""}}, folders: {}};
				}
				
				for (var tIndex = 0; tIndex < tabsCount; tIndex++) {
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
							tabs[tabId] = {ttid: "", parent_ttid: "", parent: tabPinned ? "pin_list" : "tab_list", index: tabIndex, expand: "n"};
						}
						
						// IF ON LAST TAB AND LAST WINDOW, START MATCHING LOADED DATA
						if (tabId == lastTabId && winId == lastWinId) {
							for (var ThisSessonWinId in windows) {
								if (windows[ThisSessonWinId].ttid == ""){
									AppendWinTTId(parseInt(ThisSessonWinId));
								}
							}
							// OK, DONE WITH WINDOWS, START TABS LOOP
							for (var ThisSessonTabId in tabs) {
								if (tabs[ThisSessonTabId].ttid == ""){
									AppendTabTTId(parseInt(ThisSessonTabId));
								}
							}
							// OK, DONE, NOW REPLACE OLD PARENTS IDS WITH THIS SESSION IDS
							for (var ThisSessonTabId in tabs) {
								if (tt_ids[tabs[ThisSessonTabId].parent_ttid] != undefined) {
									tabs[ThisSessonTabId].parent = tt_ids[tabs[ThisSessonTabId].parent_ttid];
								}
							}

							// OK, SAME THING FOR ACTIVE TABS IN GROUPS
							for (var ThisSessonWinId in windows) {
								for (var group in windows[ThisSessonWinId].groups) {
									if (tt_ids[windows[ThisSessonWinId].groups[group].activetab_ttid] != undefined) {
										windows[ThisSessonWinId].groups[group].activetab = tt_ids[windows[ThisSessonWinId].groups[group].activetab_ttid];
									}
								}
							}

							// TODO
							// replace parent tab ids for each folder using reference_tabs, unless tabs will be nested ONLY in tabs and folders ONLY in folders, I did not decide yet

							// will try to find tabs for 3 times
							if (opt.skip_load == true || retry > 2 || (tabs_matched > tabs_count*0.5)) {
								running = true;
								FirefoxAutoSaveData();
								FirefoxListeners();
							} else {
								setTimeout(function() {FirefoxLoadTabs(retry+1);}, 2000);
							}

						}
					});
				}
			});			
		}
	});
}

// save every second if there is anything to save obviously
async function FirefoxAutoSaveData() {
	setInterval(function() {
		if (schedule_save > 1) {schedule_save = 1;}
		if (running && schedule_save > 0 && Object.keys(tabs).length > 1) {
			chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {
				var WinCount = w.length;
				for (var wIndex = 0; wIndex < WinCount; wIndex++) {
					let winId = w[wIndex].id;
					if (windows[winId] != undefined && windows[winId].ttid != undefined && windows[winId].group_bar != undefined && windows[winId].search_filter != undefined && windows[winId].active_shelf != undefined && windows[winId].active_group != undefined && windows[winId].groups != undefined && windows[winId].folders != undefined) {
						browser.sessions.setWindowValue(winId, "TTdata", windows[winId]   );
					}
					let TabsCount = w[wIndex].tabs.length;
					for (var tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
						let tabId = w[wIndex].tabs[tabIndex].id;
						if (tabs[tabId] != undefined && tabs[tabId].ttid != undefined && tabs[tabId].parent != undefined && tabs[tabId].index != undefined && tabs[tabId].expand != undefined) {
							browser.sessions.setTabValue( tabId, "TTdata", tabs[tabId] );
						}
					}
				}
				schedule_save--;
			});
		}
	}, 1000);
}

function GenerateNewWindowID(){
	var newID = "w_"+GenerateRandomID();
	var newIdAvailable = true;
	for (var windowId in windows) {
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

function GenerateNewTabID(){
	var newID = "t_"+GenerateRandomID();
	var newIdAvailable = true;
	for (var tabId in tabs) {
		if (tabs[tabId].ttid == newID) {
			newIdAvailable = false;
		}
	}
	if (newIdAvailable) {
		return newID;
	} else {
		GenerateNewTabID();
	}
}

function AppendTabTTId(tabId){
	let NewTTTabId = GenerateNewTabID();
	if (tabs[tabId] != undefined) {
		tabs[tabId].ttid = NewTTTabId;
	} else {
		tabs[tabId] = {ttid: NewTTTabId, parent: "tab_list", parent_ttid: "", index: 0, expand: "n"};
	}
	browser.sessions.setTabValue( tabId, "TTdata", tabs[tabId] );
}

function AppendWinTTId(windowId){
	let NewTTWindowId = GenerateNewWindowID();
	if (windows[windowId] != undefined) {
		windows[windowId].ttid = NewTTWindowId;
	} else {
		windows[windowId] = {ttid: NewTTWindowId, group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, activetab: 0, activetab_ttid: "", name: caption_ungrouped_group, font: ""}}, folders: {}};
	}
	browser.sessions.setWindowValue( windowId, "TTdata", windows[windowId] );
}

function ReplaceParents(oldTabId, newTabId) {
	for (var tabId in tabs) {
		if (tabs[tabId].parent == oldTabId) {
			console.log("replaced tab id "+oldTabId+" with "+newTabId);
			tabs[tabId].parent = newTabId;
		}
	}
	// TO DO FOLDERS
}

var DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA = {};

// start all listeners
function FirefoxListeners() {
	
	// browser.commands.onCommand.addListener(function(command) {
		// if (command == "open_sidebar") {
			// browser.sidebarAction.setPanel({panel: (browser.extension.getURL("/sidebar.html")) });
			// browser.sidebarAction.open();
		// }
			// chrome.windows.getLastFocused({windowTypes: ["normal"]}, function(window) {
			// if (CurrentWindowId == window.id) {
				// if (command == "open_sidebar") {
					// ActivatePrevTab();
				// }
			// }
		// });
	// });

	browser.browserAction.onClicked.addListener(function() {
		browser.sidebarAction.setPanel({panel: (browser.extension.getURL("/sidebar.html")) });
		browser.sidebarAction.open();
	});
	
	chrome.tabs.onCreated.addListener(function(tab) {
		AppendTabTTId(tab.id);
		chrome.runtime.sendMessage({command: "tab_created", windowId: tab.windowId, tab: tab, tabId: tab.id});
		schedule_save++;
	});
	
	chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
		chrome.tabs.get(tabId, function(tab) {
			ReplaceParents(tabId, tab.id);
			DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA[tabId] = tab.id;
			tabs[tab.id] = tabs[tabId];
			AppendTabTTId(tab.id);
			// let ParentId = DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA[tabs[tabId].parent] ? DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA[tabs[tabId].parent] : tabs[tabId].parent;
			// chrome.runtime.sendMessage({command: "tab_attached", windowId: attachInfo.newWindowId, tab: tab, tabId: tabId, ParentId: ParentId});
			chrome.runtime.sendMessage({command: "tab_attached", windowId: attachInfo.newWindowId, tab: tab, tabId: tabId, ParentId: tabs[tabId].parent});
			schedule_save++;
		});
	});
	
	chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
		let detachTabId =  tabId;
		if (DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA[tabId] != undefined) {
			detachTabId = DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA[tabId];
			setTimeout(function() {
				delete DETACHED_TABS___Bug1398272___WTF_ARE_YOU_DOING_MOZILLA[tabId];
			},2000);
		}
		chrome.runtime.sendMessage({command: "tab_detached", windowId: detachInfo.oldWindowId, tabId: detachTabId});
	});
	
	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		setTimeout(function() { chrome.runtime.sendMessage({command: "tab_removed", windowId: removeInfo.windowId, tabId: tabId}); },5);
		delete tabs[tabId];
		schedule_save++;
	});
	
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (changeInfo.pinned == true) {
			tabs[tabId].parent = "pin_list";
			tabs[tabId].parent_ttid = "";
			schedule_save++;
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
				delete tabs[removedTabId];
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
		AppendWinTTId(window.id);
		schedule_save++;
	});
	
	chrome.windows.onRemoved.addListener(function(windowId) {
		delete windows[windowId];
		schedule_save++;
	});
}
	
function FirefoxMessageListeners() {
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		switch(message.command) {
			case "reload":
				window.location.reload();
			break;
			case "get_windows":
				sendResponse(windows);
			break;
			case "get_groups":
				if (windows[message.windowId]) {
					sendResponse(windows[message.windowId].groups);
				}
			break;
			case "save_groups":
				windows[message.windowId].groups = Object.assign({}, message.groups);
				for (var group in windows[message.windowId].groups) {
					if (tabs[windows[message.windowId].groups[group].activetab]) {
						windows[message.windowId].groups[group].activetab_ttid = tabs[windows[message.windowId].groups[group].activetab].ttid;
					}
				}				
				schedule_save++;
			break;
			case "set_active_group":
				windows[message.windowId].active_group = message.active_group;
				schedule_save++;
			break;
			case "get_active_group":
				if (windows[message.windowId]) {
					sendResponse(windows[message.windowId].active_group);
				}
			break;
			case "set_search_filter":
				windows[message.windowId].search_filter = message.search_filter;
				schedule_save++;
			break;
			case "get_search_filter":
				if (windows[message.windowId]) {
					sendResponse(windows[message.windowId].search_filter);
				}
			break;			
			case "set_active_shelf":
				windows[message.windowId].active_shelf = message.active_shelf;
				schedule_save++;
			break;
			case "get_active_shelf":
				if (windows[message.windowId]) {
					sendResponse(windows[message.windowId].active_shelf);
				}
			break;
			case "set_group_bar":
				windows[message.windowId].group_bar = message.group_bar;
				schedule_save++;
			break;
			case "get_group_bar":
				if (windows[message.windowId]) {
					sendResponse(windows[message.windowId].group_bar);
				}
			break;
			case "console_log":
				console.log(message.m);
			break;
			case "get_browser_tabs":
				sendResponse(tabs);
			break;
			case "is_bg_running":
				sendResponse(running);
			break;
			case "update_tab":
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
			break;
			case "get_theme":
				let theme = LoadData(("theme"+localStorage["current_theme"]), {"TabsSizeSetNumber": 2, "ToolbarShow": true, "toolbar": DefaultToolbar});
				sendResponse(theme);
			break;
		}
	});
}
