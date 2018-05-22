// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


function ChromeLoadTabs(retry) {
	chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {
		chrome.storage.local.get(null, function(storage) {
			// LOAD PREFERENCES
			GetCurrentPreferences(storage);
		
			// load tabs and windows from storage
			let refTabs = {};
			let tabs_matched = 0;
			let w_count = storage.w_count ? storage.w_count : 0;
			let t_count = storage.t_count ? storage.t_count : 0;
			let LoadedWindows = storage.windows ? storage.windows : [];
			let LoadedTabs = storage.tabs ? storage.tabs : [];

			let bak = (1 + retry) <= 3 ? (1 + retry) : 3;

			// if loaded tabs mismatch by 50%, then try to load back
			if (LoadedTabs.length < t_count*0.5) {
				LoadedTabs = storage["tabs_BAK"+bak] ? storage["tabs_BAK"+bak] : [];
			}
			// if loaded windows mismatch, then try to load back
			if (LoadedWindows.length < w_count) {
				LoadedWindows =  storage["windows_BAK"+bak] ? storage["windows_BAK"+bak] : [];
			}

			if (opt.debug == true) {
				if (storage.debug_log != undefined) {
					debug =  storage.debug_log;
				}
				if (retry == 0) {
					pushlog("TreeTabs background start");
				}
			}

			// CACHED COUNTS
			let WinCount = w.length;
			let LoadedWinCount = LoadedWindows.length;
			let LoadedTabsCount = LoadedTabs.length;
			
			let CurrentTabsCount = 0;
			for (let wIndex = 0; wIndex < w.length; wIndex++) {
				CurrentTabsCount += w[wIndex].tabs.length;
			}
			
			for (let wIndex = 0; wIndex < WinCount; wIndex++) {
				if (w[wIndex].tabs[0].url != "chrome://videopopout/") { // this is for opera for their extra video popup, which is weirdly queried as a "normal" window
					let winId = w[wIndex].id;
					let url1 = w[wIndex].tabs[0].url;
					let url2 = w[wIndex].tabs[w[wIndex].tabs.length-1].url;
					windows[winId] = {group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, active_tab: 0, prev_active_tab: 0, name: caption_ungrouped_group, font: ""}}, folders: {}};
					for (let LwIndex = 0; LwIndex < LoadedWinCount; LwIndex++) {
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
			for (let wIndex = 0; wIndex < WinCount; wIndex++) {
				let TabsCount = w[wIndex].tabs.length;
				for (let tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
					ChromeHashURL(w[wIndex].tabs[tabIndex]);
				}
			}

			if (opt.skip_load == false && LoadedTabs.length > 0) { // compare saved tabs from storage to current session tabs, but can be skipped if set in options
				for (let wIndex = 0; wIndex < WinCount; wIndex++) { // match loaded tabs
					let TabsCount = w[wIndex].tabs.length;
					for (let tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
						for (let LtabIndex = 0; LtabIndex < LoadedTabsCount; LtabIndex++) {
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
				for (let tabId in tabs) {
					if (refTabs[tabs[tabId].parent] != undefined) {
						tabs[tabId].parent = refTabs[tabs[tabId].parent];
					}
				}
			}
			// replace active tab ids for each group using refTabs
			for (let windowId in windows) {
				for (let group in windows[windowId].groups) {
					if (refTabs[windows[windowId].groups[group].active_tab]) {
						windows[windowId].groups[group].active_tab = refTabs[windows[windowId].groups[group].active_tab];
					}
					if (refTabs[windows[windowId].groups[group].prev_active_tab]) {
						windows[windowId].groups[group].prev_active_tab = refTabs[windows[windowId].groups[group].prev_active_tab];
					}
				}
			}

			if (opt.debug){
				pushlog("ChromeLoadTabs, retry: "+retry);
				pushlog("Current windows count is: "+w.length);
				pushlog("Saved windows count is: "+LoadedWindows.length);
				pushlog("Current tabs count is: "+CurrentTabsCount);
				pushlog("Loaded tabs count is: "+LoadedTabsCount);
				pushlog("Matching tabs: "+tabs_matched);
				pushlog("Current windows:");
				pushlog(w);
			}

			// will loop trying to find tabs
			if (opt.skip_load == true || retry >= 5 || (tabs_matched > t_count*0.5)) {
				running = true;
				ChromeAutoSaveData(0, 1000);
				ChromeAutoSaveData(1, 300000);
				ChromeAutoSaveData(2, 600000);
				ChromeAutoSaveData(3, 1800000);
				ChromeListeners();

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

				delete tt_ids;

				schedule_save = -1; // 2 operations must be made to start saving data
			} else {
				if (opt.debug){
					pushlog("Attempt "+retry+" failed, matched tabs was below 50%");
				}
				setTimeout(function() {
					ChromeLoadTabs(retry+1);
				}, 5000);
			}
		});
	});
}
// You maybe are asking yourself why I save tabs in array? It's because, instead of, keeping 2 index numbers (one for browser tabs on top and one for my index in tree), it's easier to just arrange them in order and save it in localstorage.
// Another reason is that Object does not preserve order in chrome, I've been told that in Firefox it is. But I can't trust that.
async function ChromeAutoSaveData(BAK, LoopTimer) {
	setInterval(function() {
		if (schedule_save > 1 || BAK > 0) {
			schedule_save = 1;
		}
		if (running && schedule_save > 0 && Object.keys(tabs).length > 1) {
			chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {
				let WinCount = w.length;
				let t_count = 0;
				let counter = 0;
				let Windows = [];
				let Tabs = [];
				for (let wIndex = 0; wIndex < WinCount; wIndex++) {
					t_count += w[wIndex].tabs.length;
				}
				for (let wIndex = 0; wIndex < WinCount; wIndex++) {
					let winId = w[wIndex].id;
					if (windows[winId] != undefined && windows[winId].group_bar != undefined && windows[winId].search_filter != undefined && windows[winId].active_shelf != undefined && windows[winId].active_group != undefined && windows[winId].groups != undefined && windows[winId].folders != undefined) {
						Windows.push({url1: w[wIndex].tabs[0].url, url2: w[wIndex].tabs[w[wIndex].tabs.length-1].url, group_bar: windows[winId].group_bar, search_filter: windows[winId].search_filter, active_shelf: windows[winId].active_shelf, active_group: windows[winId].active_group, groups: windows[winId].groups, folders: windows[winId].folders});
					}
					let TabsCount = w[wIndex].tabs.length;
					for (let tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
						let tabId = w[wIndex].tabs[tabIndex].id;
						if (tabs[tabId] != undefined && tabs[tabId].hash != undefined && tabs[tabId].parent != undefined && tabs[tabId].index != undefined && tabs[tabId].expand != undefined) {
							Tabs.push({id: tabId, hash: tabs[tabId].hash, parent: tabs[tabId].parent, index: tabs[tabId].index, expand: tabs[tabId].expand});
							counter++;
						}
					}
					if (counter == t_count) {
						chrome.storage.local.set({t_count: t_count});
						chrome.storage.local.set({w_count: WinCount});
						
						if (BAK == 0) {
							chrome.storage.local.set({windows: Windows});
							chrome.storage.local.set({tabs: Tabs});
						}
						if (BAK == 1) {
							chrome.storage.local.set({windows_BAK1: Windows});
							chrome.storage.local.set({tabs_BAK1: Tabs});
							chrome.runtime.sendMessage({command: "backup_available", bak: 1});
						}
						if (BAK == 2) {
							chrome.storage.local.set({windows_BAK2: Windows});
							chrome.storage.local.set({tabs_BAK2: Tabs});
							chrome.runtime.sendMessage({command: "backup_available", bak: 2});
						}
						if (BAK == 3) {
							chrome.storage.local.set({windows_BAK3: Windows});
							chrome.storage.local.set({tabs_BAK3: Tabs});
							chrome.runtime.sendMessage({command: "backup_available", bak: 3});
						}
					}
				}
				schedule_save--;
			});
		}

		if (opt.debug == true) {
			chrome.storage.local.set({debug_log: debug});
		}

	}, LoopTimer);
}
function ChromeHashURL(tab) {
	if (tabs[tab.id] == undefined) {
		tabs[tab.id] = {hash: 0, parent: tab.pinned ? "pin_list" : (windows[tab.windowId] ? windows[tab.windowId].active_group : "tab_list"), index: tab.index, expand: "n"};
	}
	let hash = 0;
	for (let charIndex = 0; charIndex < tab.url.length; charIndex++) {
		hash += tab.url.charCodeAt(charIndex);
	}
	tabs[tab.id].hash = hash;
}
function ReplaceParents(oldTabId, newTabId) {
	for (let tabId in tabs) {
		if (tabs[tabId].parent == oldTabId) {
			tabs[tabId].parent = newTabId;
		}
	}
}
function ChromeListeners() { // start all listeners
	chrome.tabs.onCreated.addListener(function(tab) {
		ChromeHashURL(tab);
		chrome.runtime.sendMessage({command: "tab_created", windowId: tab.windowId, tabId: tab.id});
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
		windows[window.id] = {group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, active_tab: 0, prev_active_tab: 0, name: caption_ungrouped_group, font: ""}}, folders: {}};
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
				}
				schedule_save++;
			}
			return;
		}
		if (message.command == "update_all_tabs") {
			for (let i = 0; i < message.pins.length; i++) {
				if (tabs[message.pins[i].id]) {
					tabs[message.pins[i].id].parent = "pin_list";
					tabs[message.pins[i].id].expand = "";
					tabs[message.pins[i].id].index = message.pins[i].index;
				}
			}
			for (let j = 0; j < message.tabs.length; j++) {
				if (tabs[message.tabs[j].id]) {
					tabs[message.tabs[j].id].parent = message.tabs[j].parent;
					tabs[message.tabs[j].id].expand = message.tabs[j].expand;
					tabs[message.tabs[j].id].index = message.tabs[j].index;
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