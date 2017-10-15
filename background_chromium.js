// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


if (browserId != "F") {
	LoadPreferences();
	ChromeLoadTabs(0);
}

function ChromeLoadTabs(retry) {
	chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {
		started = true;
		var refTabs = {};
		var tabs_matched = 0;
		
		// load tabs and windows from hdd
		var w_count = LoadData("w_count", 0);
		var t_count = LoadData("t_count", 0);
		var LoadedWindows = LoadData("windows", []);
		var LoadedTabs = LoadData("tabs", []);

		// if loaded tabs mismatch by 50%, then try to load back
		if (LoadedTabs.length < t_count*0.5) {
			LoadedTabs = LoadData("tabs_BAK", []);
		}
		// if loaded windows mismatch, then try to load back
		if (LoadedWindows.length < w_count) {
			LoadedWindows = LoadData("windows_BAK", []);
		}


		// CACHED COUNTS
		var WinCount = w.length;
		var LoadedWinCount = LoadedWindows.length;
		var LoadedTabsCount = LoadedTabs.length;
		
		for (var a = 0; a < WinCount; a++) {
			var TabsCount = w[a].tabs.length;
			for (var b = 0; b < TabsCount; b++) {
				ChromeHashURL(w[a].tabs[b]);
			}
		}

		// compare saved tabs from storage to current session tabs, but can be skipped if set in options
		if (opt.skip_load == false && LoadedTabs.length > 0) {
			
			// match loaded tabs
			for (var i = 0; i < WinCount; i++) {
				var TabsCount = w[i].tabs.length;
				for (var j = 0; j < TabsCount; j++) {
					for (var k = 0; k < LoadedTabsCount; k++) {
						let tabId = w[i].tabs[j].id;
						if (LoadedTabs[k][1] == tabs[tabId].h && refTabs[LoadedTabs[k][0]] == undefined) {
							refTabs[LoadedTabs[k][0]] = tabId;
							tabs[tabId].p = LoadedTabs[k][2];
							tabs[tabId].i = LoadedTabs[k][3];
							tabs[tabId].o = LoadedTabs[k][4];
							tabs_matched++;
							LoadedTabs.splice(k, 1);
							break;
						}
					}
				}
			}
				
			// replace parents tabIds for new ones, for that purpose refTabs was made before
			for (var tabId in tabs) {
				if (refTabs[tabs[tabId].p] != undefined) {
					tabs[tabId].p = refTabs[tabs[tabId].p];
				}
			}
		}
			
		for (var m = 0; m < WinCount; m++) {
			if (w[m].tabs[0].url != "chrome://videopopout/") { // this is for opera for their extra video popup, which is weirdly queried as a "normal" window
				let winId = w[m].id;
				let url1 = w[m].tabs[0].url;
				let url2 = w[m].tabs[w[m].tabs.length-1].url;
				windows[winId] = {group_bar: true, active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, activetab: 0, name: caption_ungrouped_group, font: ""}}, folders: {}};
				for (var n = 0; n < LoadedWinCount; n++) {
					if (LoadedWindows[n][0] == url1 || LoadedWindows[n][1] == url2) {
						windows[winId].group_bar = LoadedWindows[n][2];
						windows[winId].active_shelf = LoadedWindows[n][3];
						windows[winId].active_group = LoadedWindows[n][4];
						if (Object.keys(LoadedWindows[n][5]).length > 0) { windows[winId].groups = Object.assign({}, LoadedWindows[n][5]); }
						if (Object.keys(LoadedWindows[n][6]).length > 0) { windows[winId].folders = Object.assign({}, LoadedWindows[n][6]); }
						LoadedWindows.splice(n, 1);
						break;
					}
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
		if (opt.skip_load == true || retry > 1 || (tabs_matched > t_count*0.5)) {
			schedule_save++;
			hold = false;
			ChromeStartListeners();
			ChromeAutoSaveData();
		} else {
			setTimeout(function() {ChromeLoadTabs(retry+1);}, 2000);
		}
	});
}

// save every 0.5 seconds if there is anything to save obviously
async function ChromeAutoSaveData() {
	setTimeout(function() {
		ChromeAutoSaveData();
		if (schedule_save > 1) {schedule_save = 1;}
		if (!hold && schedule_save > 0 && Object.keys(tabs).length > 1) {
			
			localStorage["tabs_BAK"] = JSON.stringify(LoadData("tabs", []));
			localStorage["windows_BAK"] = JSON.stringify(LoadData("windows", []));
			
			chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {
				var WinCount = w.length;
				var t_count = 0;
				var k = [];
				var s = [];

				for (var a = 0; a < WinCount; a++) {
					t_count = t_count + w[a].tabs.length;
				}

				for (var b = 0; b < WinCount; b++) {
					let winId = w[b].id;
					if (
						windows[winId] != undefined &&
						windows[winId].group_bar != undefined &&
						windows[winId].active_shelf != undefined &&
						windows[winId].active_group != undefined &&
						windows[winId].groups != undefined &&
						windows[winId].folders != undefined
					) {
						var j = [
							w[b].tabs[0].url,
							w[b].tabs[w[b].tabs.length-1].url,
							windows[winId].group_bar,
							windows[winId].active_shelf,
							windows[winId].active_group,
							windows[winId].groups,
							windows[winId].folders
						];
						k.push(j);
					}

					let TabsCount = w[b].tabs.length;
					for (var c = 0; c < TabsCount; c++) {
						let tabId = w[b].tabs[c].id;
						if (
							tabs[tabId] != undefined &&
							tabs[tabId].h != undefined &&
							tabs[tabId].p != undefined &&
							tabs[tabId].i != undefined &&
							tabs[tabId].o != undefined
						) {
							var r = [
								tabId,
								tabs[tabId].h,
								tabs[tabId].p,
								tabs[tabId].i,
								tabs[tabId].o
							];
							s.push(r);
						}
					}
					
					if (s.length == t_count) {
						localStorage["t_count"] = JSON.stringify(t_count);
						localStorage["w_count"] = JSON.stringify(WinCount);
						localStorage["tabs"] = JSON.stringify(s);
						localStorage["windows"] = JSON.stringify(k);
					}
				}
				
				var tabsBAK = LoadData("tabs", []);
				if (tabsBAK.length) { localStorage["tabs_BAK"] = JSON.stringify(tabsBAK); }
				schedule_save--;
			});
		}
	}, 500);
}

function ChromeHashURL(tab){
	if (tabs[tab.id] == undefined) {
		tabs[tab.id] = {h: 0, p: tab.pinned ? "pin_list" : "tab_list", i: tab.index, o: "n"};
	}
	var hash = 0;
	var url = tab.url.replace(/opera|chrome|vivaldi|http|https|www|com|html|jpg|gif|pdf|[<\>\+\-\(\)\.\,\;\:\~\/\|\?\@\!\"\'\£\$\%\&\^\#\=\*\[\]]?/gi, "");
	for (var charIndex = 0; charIndex < url.length; charIndex++){
		hash = hash+url.charCodeAt(charIndex);
	}
	tabs[tab.id].h = hash;
}

function ReplaceParents(oldTabId, newTabId) {
	for (var tabId in tabs) {
		if (tabs[tabId].p == oldTabId) {
			console.log("replaced tab id "+oldTabId+" with "+newTabId);
			tabs[tabId].p = newTabId;
		}
	}
	
	// TO DO FOLDERS
}

// start all listeners
function ChromeStartListeners() {
	chrome.tabs.onCreated.addListener(function(tab) {
		ChromeHashURL(tab);
		chrome.runtime.sendMessage({command: "tab_created", windowId: tab.windowId, tab: tab, tabId: tab.id});
		schedule_save++;
	});
	
	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		chrome.runtime.sendMessage({command: "tab_removed", windowId: removeInfo.windowId, tabId: tabId});
		delete tabs[tabId];
		schedule_save++;
	});
	
	chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
		chrome.tabs.get(tabId, function(tab) {
			chrome.runtime.sendMessage({command: "tab_attached", windowId: attachInfo.newWindowId, tab: tab, tabId: tabId, ParentId: tabs[tabId].p});
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
			tabs[tabId].p = "pin_list";
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
		windows[window.id] = {i: Object.keys(windows).length, t: 0, groups: {tab_list: {id: "tab_list", index: 0, activetab: 0, name: caption_ungrouped_group, font: ""}}, folders: {}};
		schedule_save++;
	});
	
	chrome.windows.onRemoved.addListener(function(windowId) {
		delete windows[windowId];
		schedule_save++;
	});
	
	chrome.runtime.onSuspend.addListener(function() {
		hold = true;
	});
	
	
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		switch(message.command) {
			case "background_start":
				if (!started) {Start();}
			break;
			case "reload":
				window.location.reload();
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
			case "is_bg_is_busy":
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
