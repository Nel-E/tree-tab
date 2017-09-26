// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


if (browserId != 3) {
	ChromeLoadTabs(0);
	LoadPreferences();
	started = true;
}

function ChromeLoadTabs(retry) {
	chrome.tabs.query({windowType: "normal"}, function(qtabs) {
		// create current tabs object
		qtabs.forEach(function(Tab) {
			ChromeHashURL(Tab);
		});
		
		var reference_tabs = {};
		var tabs_matched = 0;
		var t_count = localStorage.getItem("t_count") !== null ? JSON.parse(localStorage["t_count"]) : 0;
		var LoadedTabs = localStorage.getItem("tabs") !== null ? JSON.parse(localStorage["tabs"]) : {};

		// if loaded tabs mismatch by 50%, then try to load back
		if (LoadedTabs.length < t_count*0.5 && localStorage.getItem("tabs_BAK") !== null) {
			LoadedTabs =  JSON.parse(localStorage["tabs_BAK"]);
		}
		
		// put tabs object in ordered array
		var LoadedTabsArr;
		if (Object.keys(LoadedTabs).length > 1){
			LoadedTabsArr =  new Array(Object.keys(LoadedTabs).length).fill([0,0,0,0,0,0]);
			for (var tab_obj in LoadedTabs) {
				// LoadedTabsArr[LoadedTabs[tab_obj].j] = [parseInt(tab_obj), LoadedTabs[tab_obj].h, LoadedTabs[tab_obj].g, LoadedTabs[tab_obj].t, LoadedTabs[tab_obj].i, LoadedTabs[tab_obj].o];
				LoadedTabsArr[LoadedTabs[tab_obj].j] = [parseInt(tab_obj), LoadedTabs[tab_obj].h, LoadedTabs[tab_obj].p, LoadedTabs[tab_obj].i, LoadedTabs[tab_obj].o];
			}
		} else {
			LoadedTabsArr = [];
		}
		
// console.log(LoadedTabsArr);
		
		// qtabs.forEach(function(Tab) {
			// console.log(tabs[Tab.id]);
		// });
		// opt.skip_load = true;
		// compare saved tabs from storage to current session tabs, but can be skipped if set in options
		if (opt.skip_load == false && LoadedTabsArr.length > 0) {
			
			// match loaded tabs
			qtabs.forEach(function(Tab) {
				for (var tabIndex = 0; tabIndex < LoadedTabsArr.length; tabIndex++) {
					if (LoadedTabsArr[tabIndex][1] == tabs[Tab.id].h && reference_tabs[LoadedTabsArr[tabIndex][0]] == undefined) {
						reference_tabs[LoadedTabsArr[tabIndex][0]] = Tab.id;
						tabs[Tab.id].p = LoadedTabsArr[tabIndex][2];
						tabs[Tab.id].i = LoadedTabsArr[tabIndex][3];
						tabs[Tab.id].o = LoadedTabsArr[tabIndex][4];
						tabs_matched++;
						LoadedTabsArr.splice(tabIndex, 1);
						break;
					}
				}
			});
			// replace parents tabIds for new ones, for that purpose reference_tabs was made before
			for (var tabId in tabs) {
				if (reference_tabs[tabs[tabId].p] != undefined) {
					tabs[tabId].p = reference_tabs[tabs[tabId].p];
				}
			}
		}
		
		// LOAD WINDOWS, GROUPS AND FOLDERS
		chrome.windows.getAll({windowTypes: ['normal'], populate: false}, function(query_windows) {
		// chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(query_windows) {
			var loaded_windows = {};
			if (localStorage.getItem("windows") !== null) {
				loaded_windows = JSON.parse(localStorage["windows"]);
			}
			
			for (var winIndex = 0; winIndex < query_windows.length; winIndex++) {
				// if (query_windows[winIndex].tabs[0].url != "chrome://videopopout/") {
					windows[query_windows[winIndex].id] = {i: winIndex, groups: {}, folders: {}};
				// }
				
			}
			
			for (var loaded_windowId in loaded_windows) {
				for (var windowId in windows) {
					if (loaded_windows[loaded_windowId].i == windows[windowId].i) {
						if (Object.keys(loaded_windows[loaded_windowId].groups).length > 0) {
							windows[windowId].groups = Object.assign({}, loaded_windows[loaded_windowId].groups);
						}
						if (Object.keys(loaded_windows[loaded_windowId].folders).length > 0) {
							windows[windowId].folders = Object.assign({}, loaded_windows[loaded_windowId].folders);
						}
					}
				}
			}
			
			
			// replace active tab ids for each group using reference_tabs
			for (var windowId in windows) {
				for (var group in windows[windowId].groups) {
					if (reference_tabs[windows[windowId].groups[group].activetab]) {
						windows[windowId].groups[group].activetab = reference_tabs[windows[windowId].groups[group].activetab];
					}
				}
			}
			
			// console.log(windows);
			
		});

		// will try to find tabs for 3 times
		if (opt.skip_load == true || retry > 1 || tabs_matched > t_count*0.5) {

			schedule_save++;
			hold = false;
			ChromeStartListeners();
			// ChromePeriodicCheck();
			AutoSaveData();
			ChromeTabsUpdateIndexes();
// console.log("should start "+opt.skip_load+retry+tabs_matched+t_count+hold);
		} else {
			setTimeout(function() {ChromeLoadTabs(retry+1);}, 2000);
		}
	});
}

function ChromeHashURL(tab){
	if (tabs[tab.id] == undefined) {
		tabs[tab.id] = {j: tab.index, h: 0, p: tab.pinned ? "pin_list" : "tab_list", i: tab.index, o: "n"};
	}
	var hash = 0;
	var url = tab.url.replace(/opera|chrome|vivaldi|http|https|www|com|html|jpg|gif|pdf|[<\>\+\-\(\)\.\,\;\:\~\/\|\?\@\!\"\'\£\$\%\&\^\#\=\*\[\]]?/gi, "");
	for (var charIndex = 0; charIndex < url.length; charIndex++){
		hash = hash+url.charCodeAt(charIndex);
	}
	tabs[tab.id].h = hash;
}

function ChromeTabsUpdateIndexes(){
	setTimeout(function() {
		ChromeTabsUpdateIndexes();
		if (schedule_update_indexes > 1) {
			schedule_update_indexes = 1;
		}
		if (!hold && schedule_update_indexes > 0) {
			schedule_update_indexes--;
			chrome.tabs.query({windowType: "normal"}, function(qtabs) {
				qtabs.forEach(function(Tab){
					if (tabs[Tab.id] != undefined){
						tabs[Tab.id].j = Tab.index;
					} else {
						ChromeHashURL(Tab);
					}
				});
				schedule_save++;
			});
		}
	}, 500);
}

async function ChromePeriodicCheck() {
	setTimeout(function() {
		ChromePeriodicCheck();
		if (!hold) {
			chrome.tabs.query({windowType: "normal"}, function(qtabs) {
				qtabs.forEach(function(Tab) {
					if (tabs[Tab.id] == undefined) {
						ChromeHashURL(Tab);
						setTimeout(function() {chrome.runtime.sendMessage({command: "recheck_tabs"});},300);
						setTimeout(function() {schedule_save++;},600);
					}
				});
			});
		}
	},60000);
}

function ChromeWindowsUpdateIndexes(){
	chrome.windows.getAll({windowTypes: ['normal'], populate: false}, function(query_windows) {
		for (var winIndex = 0; winIndex < query_windows.length; winIndex++) {
			if (windows[query_windows[winIndex].id] != undefined) {
				windows[query_windows[winIndex].id].i = winIndex;
			}
		}
	});
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
		schedule_update_indexes++;
		chrome.runtime.sendMessage({command: "tab_created", windowId: tab.windowId, tab: tab, tabId: tab.id});
		schedule_save++;
	});
	
	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		chrome.runtime.sendMessage({command: "tab_removed", windowId: removeInfo.windowId, tabId: tabId});
		delete tabs[tabId];
		schedule_update_indexes++;
	});
	
	chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
		chrome.tabs.get(tabId, function(tab) {
			chrome.runtime.sendMessage({command: "tab_attached", windowId: attachInfo.newWindowId, tab: tab, tabId: tabId, ParentId: tabs[tabId].p});
		});
		schedule_update_indexes++;
	});

	chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
		chrome.runtime.sendMessage({command: "tab_detached", windowId: detachInfo.oldWindowId, tabId: tabId});
		schedule_update_indexes++;
	});
	
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (tabs[tabId] == undefined || changeInfo.url != undefined) {
			ChromeHashURL(tab);
		}
		if (changeInfo.pinned != undefined) {
			schedule_update_indexes++;
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
		schedule_update_indexes++;
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
		windows[window.id] = {i: Object.keys(windows).length, groups: {}, folders: {}};
		ChromeWindowsUpdateIndexes();
	});
	
	chrome.windows.onRemoved.addListener(function(windowId) {
		delete windows[windowId];
		ChromeWindowsUpdateIndexes();
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
			case "groups_save":
				windows[message.windowId].groups = Object.assign({}, message.groups);
			// var obj2 = Object.assign({}, obj);
			// groups: bggroups, windowId: CurrentWindowId
			
				schedule_save++;
				// localStorage["windows"] = JSON.stringify(windows);
			break;
			case "console_log":
				console.log(message.m);
			break;

			case "get_browser_tabs":
				sendResponse(tabs);
			break;
			case "bg_is_busy":
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
