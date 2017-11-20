// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

if (browserId != "F") {
	LoadPreferences();
	ChromeLoadTabs(0);
	ChromeMessageListeners();
}
function ChromeLoadTabs(retry) {
	chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {
		var refTabs = {};
		var tabs_matched = 0;
		// load tabs and windows from hdd
		var w_count = LoadData("w_count", 0);
		var t_count = LoadData("t_count", 0);
		var LoadedWindows = LoadData("windows", []);
		var LoadedTabs = LoadData("tabs", []);
		// if loaded tabs mismatch by 50%, then try to load back
		if (LoadedTabs.length < t_count*0.5 || retry > 0) {
			LoadedTabs = LoadData("tabs_BAK"+retry, []);
		}
		// if loaded windows mismatch, then try to load back
		if (LoadedWindows.length < w_count || retry > 0) {
			LoadedWindows = LoadData("windows_BAK"+retry, []);
		}
		// CACHED COUNTS
		var WinCount = w.length;
		var LoadedWinCount = LoadedWindows.length;
		var LoadedTabsCount = LoadedTabs.length;
		for (var wIndex = 0; wIndex < WinCount; wIndex++) {
			if (w[wIndex].tabs[0].url != "chrome://videopopout/") { // this is for opera for their extra video popup, which is weirdly queried as a "normal" window
				let winId = w[wIndex].id;
				let url1 = w[wIndex].tabs[0].url;
				let url2 = w[wIndex].tabs[w[wIndex].tabs.length-1].url;
				windows[winId] = {group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, activetab: 0, name: caption_ungrouped_group, font: ""}}, folders: {}};
				for (var LwIndex = 0; LwIndex < LoadedWinCount; LwIndex++) {
					if (LoadedWindows[LwIndex].url1 == url1 || LoadedWindows[LwIndex].url2 == url2) {
						if (LoadedWindows[LwIndex].group_bar) { windows[winId].group_bar = LoadedWindows[LwIndex].group_bar; }
						if (LoadedWindows[LwIndex].search_filter) { windows[winId].search_filter = LoadedWindows[LwIndex].search_filter; }
						if (LoadedWindows[LwIndex].active_shelf) { windows[winId].active_shelf = LoadedWindows[LwIndex].active_shelf; }
						if (LoadedWindows[LwIndex].active_group) { windows[winId].active_group = LoadedWindows[LwIndex].active_group; }
						if (Object.keys(LoadedWindows[LwIndex].groups).length > 0) { windows[winId].groups = Object.assign({}, LoadedWindows[LwIndex].groups); }
						if (Object.keys(LoadedWindows[LwIndex].folders).length > 0) { windows[winId].folders = Object.assign({}, LoadedWindows[LwIndex].folders); }
						LoadedWindows[LwIndex].url1 = "";
						LoadedWindows[LwIndex].url2 = "";
						break;
					}
				}
			}
		}
		for (var wIndex = 0; wIndex < WinCount; wIndex++) {
			var TabsCount = w[wIndex].tabs.length;
			for (var tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
				ChromeHashURL(w[wIndex].tabs[tabIndex]);
			}
		}
		// compare saved tabs from storage to current session tabs, but can be skipped if set in options
		if (opt.skip_load == false && LoadedTabs.length > 0) {
			// match loaded tabs
			for (var wIndex = 0; wIndex < WinCount; wIndex++) {
				var TabsCount = w[wIndex].tabs.length;
				for (var tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
					for (var LtabIndex = 0; LtabIndex < LoadedTabsCount; LtabIndex++) {
						let tabId = w[wIndex].tabs[tabIndex].id;
						if (LoadedTabs[LtabIndex].hash == tabs[tabId].hash && refTabs[LoadedTabs[LtabIndex].id] == undefined) {
							refTabs[LoadedTabs[LtabIndex].id] = tabId;
							if (LoadedTabs[LtabIndex].parent) { tabs[tabId].parent = LoadedTabs[LtabIndex].parent; }
							if (LoadedTabs[LtabIndex].index) { tabs[tabId].index = LoadedTabs[LtabIndex].index; }
							if (LoadedTabs[LtabIndex].expand) { tabs[tabId].expand = LoadedTabs[LtabIndex].expand; }
							LoadedTabs[LtabIndex].hash = undefined;
							tabs_matched++;
							break;
						}
					}
				}
			}
			// replace parents tabIds for new ones, for that purpose refTabs was made before
			for (var tabId in tabs) {
				if (refTabs[tabs[tabId].parent] != undefined) {
					tabs[tabId].parent = refTabs[tabs[tabId].parent];
				}
			}
		}
		// replace active tab ids for each group using refTabs
		for (var windowId in windows) {
			for (var group in windows[windowId].groups) {
				if (refTabs[windows[windowId].groups[group].activetab]) {
					windows[windowId].groups[group].activetab = refTabs[windows[windowId].groups[group].activetab];
				}
			}
		}
		// will try to find tabs for 3 times
		if (opt.skip_load == true || retry > 2 || (tabs_matched > t_count*0.5)) {
			schedule_save++;
			running = true;
			ChromeAutoSaveData("", 1000);
			ChromeAutoSaveData("_BAK1", 300000);
			ChromeAutoSaveData("_BAK2", 600000);
			ChromeAutoSaveData("_BAK3", 1800000);
			ChromeListeners();
		} else {
			setTimeout(function() {ChromeLoadTabs(retry+1);}, 2000);
		}
	});
}
// You maybe are asking yourself why I save tabs in array? It's because, instead of, keeping 2 index numbers (one for browser tabs on top and one for my index in tree), it's easier to just arrange them in order and save it in localstorage.
// Another reason is that Object does not preserve order in chrome, I've been told that in Firefox it is. But I can't trust that.
async function ChromeAutoSaveData(BackupName, LoopTimer) {
	setInterval(function() {
		if (schedule_save > 1 || BackupName != "") {schedule_save = 1;}
		if (running && schedule_save > 0 && Object.keys(tabs).length > 1) {
			chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {
				var WinCount = w.length;
				var t_count = 0;
				var counter = 0;
				var Windows = [];
				var Tabs = [];

				for (var wIndex = 0; wIndex < WinCount; wIndex++) {
					t_count += w[wIndex].tabs.length;
				}

				for (var wIndex = 0; wIndex < WinCount; wIndex++) {
					let winId = w[wIndex].id;
					if (windows[winId] != undefined && windows[winId].group_bar != undefined && windows[winId].search_filter != undefined && windows[winId].active_shelf != undefined && windows[winId].active_group != undefined && windows[winId].groups != undefined && windows[winId].folders != undefined) {
						Windows.push({url1: w[wIndex].tabs[0].url, url2: w[wIndex].tabs[w[wIndex].tabs.length-1].url, group_bar: windows[winId].group_bar, search_filter: windows[winId].search_filter, active_shelf: windows[winId].active_shelf, active_group: windows[winId].active_group, groups: windows[winId].groups, folders: windows[winId].folders});
					}

					let TabsCount = w[wIndex].tabs.length;
					for (var tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
						let tabId = w[wIndex].tabs[tabIndex].id;
						if (tabs[tabId] != undefined && tabs[tabId].hash != undefined && tabs[tabId].parent != undefined && tabs[tabId].index != undefined && tabs[tabId].expand != undefined) {
							Tabs.push({id: tabId, hash: tabs[tabId].hash, parent: tabs[tabId].parent, index: tabs[tabId].index, expand: tabs[tabId].expand});
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
function ChromeHashURL(tab){
	if (tabs[tab.id] == undefined) {
		tabs[tab.id] = {hash: 0, parent: tab.pinned ? "pin_list" : "tab_list", index: tab.index, expand: "n"};
	}
	var hash = 0;
	for (var charIndex = 0; charIndex < tab.url.length; charIndex++){
		hash += tab.url.charCodeAt(charIndex);
	}
	tabs[tab.id].hash = hash;
}

function ReplaceParents(oldTabId, newTabId) {
	for (var tabId in tabs) {
		if (tabs[tabId].parent == oldTabId) {
			tabs[tabId].parent = newTabId;
		}
	}
	
	// TO DO FOLDERS
}

// start all listeners
function ChromeListeners() {
	chrome.tabs.onCreated.addListener(function(tab) {
		ChromeHashURL(tab);
		chrome.runtime.sendMessage({command: "tab_created", windowId: tab.windowId, tab: tab, tabId: tab.id});
		schedule_save++;
	});
	
	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		setTimeout(function() { chrome.runtime.sendMessage({command: "tab_removed", windowId: removeInfo.windowId, tabId: tabId}); },5);
		delete tabs[tabId];
		schedule_save++;
	});
	
	chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
		chrome.tabs.get(tabId, function(tab) {
			chrome.runtime.sendMessage({command: "tab_attached", windowId: attachInfo.newWindowId, tab: tab, tabId: tabId, ParentId: tabs[tabId].parent});
		});
		schedule_save++;
	});

	chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
		chrome.runtime.sendMessage({command: "tab_detached", windowId: detachInfo.oldWindowId, tabId: tabId});
		schedule_save++;
	});
	
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (tabs[tabId] == undefined || changeInfo.url != undefined) {
			ChromeHashURL(tab);
		}
		if (changeInfo.pinned != undefined) {
			schedule_save++;
		}
		if (changeInfo.pinned == true) {
			tabs[tabId].parent = "pin_list";
		}
		if (changeInfo.title != undefined && !tab.active) {
			chrome.runtime.sendMessage({command: "tab_attention", windowId: tab.windowId, tabId: tabId});
		}
		chrome.runtime.sendMessage({command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tabId, changeInfo: changeInfo});
	});
	
	chrome.tabs.onMoved.addListener(function(tabId, moveInfo) {
		schedule_save++;
	});
	
	chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
		chrome.tabs.get(addedTabId, function(tab) {
			if (addedTabId == removedTabId) {
				chrome.runtime.sendMessage({command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tab.id, changeInfo: {status: tab.status, url: tab.url, title: tab.title, audible: tab.audible, mutedInfo: tab.mutedInfo}});
			} else {
				ReplaceParents(tabId, tab.id);
				if (tabs[removedTabId]) {
					tabs[addedTabId] = tabs[removedTabId];
				} else {
					ChromeHashURL(tab);
				}
				chrome.runtime.sendMessage({command: "tab_removed", windowId: tab.windowId, tabId: removedTabId});
				chrome.runtime.sendMessage({command: "tab_attached", windowId: tab.windowId, tab: tab, tabId: addedTabId});
				delete tabs[removedTabId];
			}
			schedule_save++;
		});
	});
	
	chrome.tabs.onActivated.addListener(function(activeInfo) {
		chrome.runtime.sendMessage({command: "tab_activated", windowId: activeInfo.windowId, tabId: activeInfo.tabId});
	});
	
	chrome.windows.onCreated.addListener(function(window) {
		windows[window.id] = {group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, activetab: 0, name: caption_ungrouped_group, font: ""}}, folders: {}};
		schedule_save++;
	});
	
	chrome.windows.onRemoved.addListener(function(windowId) {
		delete windows[windowId];
		schedule_save++;
	});
	
	chrome.runtime.onSuspend.addListener(function() {
		running = false;
	});
}	
	
function ChromeMessageListeners() {
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
					for (var parameter in message.tab) {
						tabs[message.tabId][parameter] = message.tab[parameter];
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
