// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

if (localStorage.getItem("t0") !== null){
	LoadV015(0);
} else {
	LoadPreferences();
	FirefoxStart();
	FirefoxMessageListeners();
}

function FirefoxStart() {
	var SafeToRun = true;
	chrome.tabs.query({windowType: "normal"}, function(t) {
		// will loop forever if session restore tab is found
		for (var tabIndex = 0; tabIndex < t.length; tabIndex++) {
			if (t[tabIndex].url.match("about:sessionrestore") && t.length < 5) {
				SafeToRun = false;
				chrome.tabs.update(t[tabIndex].id, { active: true });
			}
			if (tabIndex == t.length-1) {
				if (SafeToRun) {
					FirefoxLoadTabs(0);
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

		var refTabs = {};
		var tabs_matched = 0;
		var tabs_count = 0;
		for (var wIndex = 0; wIndex < w.length; wIndex++) {
			tabs_count += w[wIndex].tabs.length;
		}

		// load tabs and windows from hdd
		var LoadedWindows = LoadData("windows", []);
		var LoadedTabs = LoadData("tabs", []);

		// if loaded tabs mismatch by 50%, then try to load back
		if (LoadedTabs.length < tabs_count*0.5 || retry > 0) {
			LoadedTabs = LoadData("tabs_BAK"+retry, []);
		}
		// if loaded windows mismatch, then try to load back
		if (LoadedWindows.length < w.length || retry > 0) {
			LoadedWindows = LoadData("windows_BAK"+retry, []);
		}
		
		// CACHED COUNTS AND STUFF
		var lastWinId = w[w.length-1].id;
		var lastTabId = w[w.length-1].tabs[w[w.length-1].tabs.length-1].id;
		
		var LoadedWinCount = LoadedWindows.length;
		var LoadedTabsCount = LoadedTabs.length;
		var WinCount = w.length;


		for (var wIndex = 0; wIndex < WinCount; wIndex++) {
			
			let winIndex = wIndex;
			let winId = w[winIndex].id;
			let tabsCount = w[winIndex].tabs.length;

			let win = Promise.resolve(browser.sessions.getWindowValue(winId, "TTId")).then(function(TTId) { // LOAD TTID FROM FIREFOX GET WINDOW VALUE
				if (TTId != undefined) {
					windows[winId] = {ttid: TTId, group_bar: true, active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, activetab: 0, name: caption_ungrouped_group, font: ""}}, folders: {}};
				} else {
					windows[winId] = {ttid: "", group_bar: true, active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, activetab: 0, name: caption_ungrouped_group, font: ""}}, folders: {}};
				}
				
				for (var tIndex = 0; tIndex < tabsCount; tIndex++) {

					let tabIndex = tIndex;
					let tabId = w[winIndex].tabs[tabIndex].id;
					let tabPinned = w[winIndex].tabs[tabIndex].pinned;
					
					let tab = Promise.resolve(browser.sessions.getTabValue(tabId, "TTId")).then(function(TTId) { // LOAD TTID FROM FIREFOX GET TAB VALUE
						if (TTId != undefined) {
							tabs[tabId] = {ttid: TTId, parent: tabPinned ? "pin_list" : "tab_list", index: tabIndex, expand: "n"};
						} else {
							tabs[tabId] = {ttid: "", parent: tabPinned ? "pin_list" : "tab_list", index: tabIndex, expand: "n"};
						}
						// IF ON LAST TAB AND LAST WINDOW, START MATCHING LOADED DATA
						if (tabId == lastTabId && winId == lastWinId) {
							for (var ThisSessonWinId in windows) {
								if (windows[ThisSessonWinId].ttid != ""){
									for (var LwIndex = 0; LwIndex < LoadedWinCount; LwIndex++) {
										if (LoadedWindows[LwIndex].ttid == windows[ThisSessonWinId].ttid) {
											windows[ThisSessonWinId].group_bar = LoadedWindows[LwIndex].group_bar;
											windows[ThisSessonWinId].active_shelf = LoadedWindows[LwIndex].active_shelf;
											windows[ThisSessonWinId].active_group = LoadedWindows[LwIndex].active_group;
											if (Object.keys(LoadedWindows[LwIndex].groups).length > 0) { windows[ThisSessonWinId].groups = Object.assign({}, LoadedWindows[LwIndex].groups); }
											if (Object.keys(LoadedWindows[LwIndex].folders).length > 0) { windows[ThisSessonWinId].folders = Object.assign({}, LoadedWindows[LwIndex].folders); }
											LoadedWindows[LwIndex].ttid = "";
											break;
										}
									}
								} else {
									AppendWinTTId(parseInt(ThisSessonWinId));
								}
							}
							// OK, DONE WITH WINDOWS, START TABS LOOP
							for (var ThisSessonTabId in tabs) {
								if (tabs[ThisSessonTabId].ttid != ""){
									for (var LtabIndex = 0; LtabIndex < LoadedTabsCount; LtabIndex++) {
										if (LoadedTabs[LtabIndex].ttid == tabs[ThisSessonTabId].ttid) {
											refTabs[LoadedTabs[LtabIndex].id] = ThisSessonTabId;
											tabs[ThisSessonTabId].parent = LoadedTabs[LtabIndex].parent;
											tabs[ThisSessonTabId].index = LoadedTabs[LtabIndex].index;
											tabs[ThisSessonTabId].expand = LoadedTabs[LtabIndex].expand;
											LoadedTabs[LtabIndex].ttid = "";
											tabs_matched++;
											break;
										}
									}
								} else {
									AppendTabTTId(parseInt(ThisSessonTabId));
								}
							}
							// OK, DONE, NOW REPLACE OLD PARENTS IDS WITH THIS SESSION IDS
							for (var ThisSessonTabId in tabs) {
								if (refTabs[tabs[ThisSessonTabId].parent] != undefined) {
									tabs[ThisSessonTabId].parent = refTabs[tabs[ThisSessonTabId].parent];
								}
							}
							// OK, SAME THING FOR ACTIVE TABS IN GROUPS
									
							for (var ThisSessonWinId in windows) {
								for (var group in windows[ThisSessonWinId].groups) {
									if (refTabs[windows[ThisSessonWinId].groups[group].activetab]) {
										windows[ThisSessonWinId].groups[group].activetab = refTabs[windows[ThisSessonWinId].groups[group].activetab];
									}
								}
							}

							// TODO
							// replace parent tab ids for each folder using reference_tabs, unless tabs will be nested ONLY in tabs and folders ONLY in folders, I did not decide yet

							
							// will try to find tabs for 3 times
							if (opt.skip_load == true || retry > 2 || (tabs_matched > tabs_count*0.5)) {
								hold = false;
								FirefoxAutoSaveData("", 1000);
								FirefoxAutoSaveData("_BAK1", 300000);
								FirefoxAutoSaveData("_BAK2", 600000);
								FirefoxAutoSaveData("_BAK3", 1800000);
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
// async function FirefoxAutoSaveData(BAK, timer) {
async function FirefoxAutoSaveData(BackupName, LoopTimer) {
	setTimeout(function() {
		FirefoxAutoSaveData(BackupName, LoopTimer);
		if (schedule_save > 1 || BackupName != "") {schedule_save = 1;}
		if (!hold && schedule_save > 0 && Object.keys(tabs).length > 1) {
			chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {
				var WinCount = w.length;
				var t_count = 0;
				var counter = 0;
				var Windows = [];
				var Tabs = [];

				for (var wIndex = 0; wIndex < WinCount; wIndex++) {
					t_count = t_count + w[wIndex].tabs.length;
				}

				for (var wIndex = 0; wIndex < WinCount; wIndex++) {
					let winId = w[wIndex].id;
					if (windows[winId] != undefined && windows[winId].ttid != undefined && windows[winId].group_bar != undefined && windows[winId].active_shelf != undefined && windows[winId].active_group != undefined && windows[winId].groups != undefined && windows[winId].folders != undefined) {
						Windows.push({ttid: windows[winId].ttid, group_bar: windows[winId].group_bar, active_shelf: windows[winId].active_shelf, active_group: windows[winId].active_group, groups: windows[winId].groups, folders: windows[winId].folders});
					}

					let TabsCount = w[wIndex].tabs.length;
					for (var tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
						let tabId = w[wIndex].tabs[tabIndex].id;
						if (tabs[tabId] != undefined && tabs[tabId].ttid != undefined && tabs[tabId].parent != undefined && tabs[tabId].index != undefined && tabs[tabId].expand != undefined) {
							Tabs.push({id: tabId, ttid: tabs[tabId].ttid, parent: tabs[tabId].parent, index: tabs[tabId].index, expand: tabs[tabId].expand});
							counter++;
						}
					}
					
					if (counter == t_count) {
						localStorage["t_count"] = JSON.stringify(t_count);
						localStorage["w_count"] = JSON.stringify(WinCount);
						localStorage["windows"+BackupName] = JSON.stringify(Windows);
						localStorage["tabs"+BackupName] = JSON.stringify(Tabs);
					}
				}
				schedule_save--;
			});
		}
	}, LoopTimer);
}

function GenerateNewWindowID(){
	var newID = GenerateRandomID();
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
	var newID = GenerateRandomID();
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
	browser.sessions.setTabValue(tabId, "TTId", NewTTTabId);
	if (tabs[tabId] != undefined) {
		tabs[tabId].ttid = NewTTTabId;
	} else {
		tabs[tabId] = {ttid: NewTTTabId, parent: "tab_list", index: 0, expand: "n"};
	}
}

function AppendWinTTId(windowId){
	let NewTTWindowId = GenerateNewWindowID();
	browser.sessions.setWindowValue(windowId, "TTId", NewTTWindowId);
	if (windows[windowId] != undefined) {
		windows[windowId].ttid = NewTTWindowId;
	} else {
		windows[windowId] = {ttid: NewTTWindowId, group_bar: true, active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, activetab: 0, name: caption_ungrouped_group, font: ""}}, folders: {}};
	}
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
		chrome.runtime.sendMessage({command: "tab_removed", windowId: removeInfo.windowId, tabId: tabId});
		delete tabs[tabId];
		schedule_save++;
	});
	
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (changeInfo.pinned == true) {
			tabs[tabId].parent = "pin_list";
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
			case "is_bg_busy":
				sendResponse(hold);
			break;
			case "update_tab":
				if (tabs[message.tabId]) {
					for (var parameter in message.tab) {
						tabs[message.tabId][parameter] = message.tab[parameter];
					}
					schedule_save++;
				}
			break;
		}
	});
}
