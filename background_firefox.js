// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

if (browserId == 3) {
	LoadPreferences();
	FirefoxStart();
}

function FirefoxStart() {
	started = true;
	chrome.tabs.query({windowType: "normal"}, function(BrowserTabs) {
		let SafeToRun = true;
		// will loop forever if session restore tab is found
		for (var tabIndex = 0; tabIndex < BrowserTabs.length; tabIndex++) {
			if (BrowserTabs[tabIndex].url.match("sessionrestore")) {
				SafeToRun = false;
				chrome.tabs.update(BrowserTabs[tabIndex].id, { active: true });
				break;
			}
		}
		if (SafeToRun) {
			FirefoxLoadTabs();
		} else {
			setTimeout(function() { FirefoxStart(); }, 1000);
		}
	});
}
	
	
function FirefoxLoadTabs() {
	chrome.windows.getAll({windowTypes: ["normal"], populate: false}, function(BrowserWindows) {
		chrome.tabs.query({windowType: "normal"}, function(BrowserTabs) {
			// LOAD TABS
			var LoadedTabs = localStorage.getItem("tabs") !== null && opt.skip_load == false ? JSON.parse(localStorage["tabs"]) : {};
			let refTabs = {};
			BrowserTabs.forEach(function(TabA) {
				tabs[TabA.id] = {h: "", p: TabA.pinned ? "pin_list" : "tab_list", i: TabA.index, o: "n"};
				let t = Promise.resolve(browser.sessions.getTabValue(TabA.id, "TTId")).then(function(TTId) {
					if (TTId != undefined) {
						tabs[TabA.id].h = TTId;
					}
					if (TabA.id == BrowserTabs[BrowserTabs.length-1].id) { // IF ON LAST TAB, START THIS LOOP
						BrowserTabs.forEach(function(TabB) {
							if (tabs[TabB.id].h == ""){
								AppendTabTTId(TabB.id);
							} else {
								for (var LoadedTabId in LoadedTabs) {
									if (LoadedTabs[LoadedTabId].h == tabs[TabB.id].h) {
										refTabs[LoadedTabId] = TabB.id;
										tabs[TabB.id].p = LoadedTabs[LoadedTabId].p;
										tabs[TabB.id].i = LoadedTabs[LoadedTabId].i;
										tabs[TabB.id].o = LoadedTabs[LoadedTabId].o;
										delete LoadedTabs[LoadedTabId];
									}
								}
							}
						});
						BrowserTabs.forEach(function(TabC) {
							if (refTabs[tabs[TabC.id].p] != undefined) {
								tabs[TabC.id].p = refTabs[tabs[TabC.id].p];
							}
						});
					}
				});
			});

				
			// LOAD WINDOWS, GROUPS AND FOLDERS
			// var LoadedWindows = localStorage.getItem("windows") !== null && opt.skip_load == false ? JSON.parse(localStorage["windows"]) : {};
			// for (var BrowserWindowIndex = 0; BrowserWindowIndex < BrowserWindows.length; BrowserWindowIndex++) {
				// let WindowIndex = BrowserWindowIndex;
				// let WindowId = BrowserWindows[WindowIndex].id;
				// windows[WindowId] = {h: "", groups: {}, folders: {}};
				// let w = Promise.resolve(browser.sessions.getWindowValue(WindowId, "TTId")).then(function(TTId) {
					// if (TTId != undefined) {
						// windows[WindowId].h = TTId;
					// }
					// if (WindowIndex == BrowserWindows.length-1) {
						// BrowserWindows.forEach(function(BrowserWindow) {
							// if (windows[BrowserWindow.id].h == ""){
								// AppendWinTTId(BrowserWindow.id);
							// } else {
								// for (var LoadedWindowId in LoadedWindows) {
									// if (LoadedWindows[LoadedWindowId].h == windows[BrowserWindow.id].h) {
										// if (Object.keys(LoadedWindows[LoadedWindowId].groups).length > 0) {
											// windows[WindowId].groups = Object.assign({}, LoadedWindows[LoadedWindowId].groups);
										// }
										// if (Object.keys(LoadedWindows[LoadedWindowId].folders).length > 0) {
											// windows[WindowId].folders = Object.assign({}, LoadedWindows[LoadedWindowId].folders);
										// }
									// }
								// }
								// hold = false;

							// }
						// });
					// }
				// });			
			// }

			var LoadedWindows = localStorage.getItem("windows") !== null && opt.skip_load == false ? JSON.parse(localStorage["windows"]) : {};
			BrowserWindows.forEach(function(WinA) {
				windows[WinA.id] = {h: "", groups: {}, folders: {}};
				let w = Promise.resolve(browser.sessions.getWindowValue(WinA.id, "TTId")).then(function(TTId) {
					if (TTId != undefined) {
						windows[WinA.id].h = TTId;
					}
					if (WinA.id == BrowserWindows[BrowserWindows.length-1].id) { // IF ON LAST WINDOW, START THIS LOOP
						BrowserWindows.forEach(function(WinB) {
							if (windows[WinB.id].h == ""){
								AppendWinTTId(WinB.id);
							} else {
								for (var LoadedWindowId in LoadedWindows) {
									if (LoadedWindows[LoadedWindowId].h == windows[WinB.id].h) {
										if (Object.keys(LoadedWindows[LoadedWindowId].groups).length > 0) {
											windows[WinA.id].groups = Object.assign({}, LoadedWindows[LoadedWindowId].groups);
										}
										if (Object.keys(LoadedWindows[LoadedWindowId].folders).length > 0) {
											windows[WinA.id].folders = Object.assign({}, LoadedWindows[LoadedWindowId].folders);
										}
									}
								}
								hold = false;
							}
						});
					}
				});			
			});			
			
			// replace active tab ids for each group using reference_tabs
			for (var windowId in windows) {
				for (var group in windows[windowId].groups) {
					if (reference_tabs[windows[windowId].groups[group].activetab]) {
						windows[windowId].groups[group].activetab = reference_tabs[windows[windowId].groups[group].activetab];
					}
				}
			}
			
			// TODO
			// replace parent tab ids for each folder using reference_tabs, unless tabs will be nested ONLY in tabs, I did not decide yet
			// if (TabIndex == BrowserTabs.length-1) {
				// folders
			// }
				
			// setTimeout(function() {localStorage["windows"] = JSON.stringify(windows);}, 3000);
			// setTimeout(function() {localStorage["tabs"] = JSON.stringify(tabs);}, 3000);
			
			setTimeout(function() {
				FirefoxStartListeners();
				AutoSaveData();
			}, 1000);
		});
	});

}

function GenerateNewWindowID(){
	var newID = GenerateRandomID();
	var newIdAvailable = true;
	for (var windowId in windows) {
		if (windows[windowId].h == newID) {
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
		if (tabs[tabId].h == newID) {
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
// console.log("AppendTabTTId");
	let NewTTTabId = GenerateNewTabID();
	browser.sessions.setTabValue(tabId, "TTId", NewTTTabId);
	if (tabs[tabId] != undefined) {
		tabs[tabId].h = NewTTTabId;
	} else {
		tabs[tabId] = {h: NewTTTabId, p: "tab_list", i: 0, o: "n"};
	}
}

function AppendWinTTId(windowId){
	let NewTTWindowId = GenerateNewWindowID();
	browser.sessions.setWindowValue(windowId, "TTId", NewTTWindowId);
	if (windows[windowId] != undefined) {
		windows[windowId].h = NewTTWindowId;
	} else {
		windows[windowId] = {h: NewTTWindowId, groups: {}, folders: {}};
	}
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

var DETACHEDTABSBug1402742WTFAREYOUDOINGMOZILLA = {};

// start all listeners
function FirefoxStartListeners() {
	chrome.tabs.onCreated.addListener(function(tab) {
		AppendTabTTId(tab.id);
		chrome.runtime.sendMessage({command: "tab_created", windowId: tab.windowId, tab: tab, tabId: tab.id});
		schedule_save++;
	});
	
	chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
		chrome.tabs.get(tabId, function(tab) {
			ReplaceParents(tabId, tab.id);
			DETACHEDTABSBug1402742WTFAREYOUDOINGMOZILLA[tabId] = tab.id;
			tabs[tab.id] = tabs[tabId];
			AppendTabTTId(tab.id);
			// let ParentId = DETACHEDTABSBug1402742WTFAREYOUDOINGMOZILLA[tabs[tabId].p] ? DETACHEDTABSBug1402742WTFAREYOUDOINGMOZILLA[tabs[tabId].p] : tabs[tabId].p;
			// chrome.runtime.sendMessage({command: "tab_attached", windowId: attachInfo.newWindowId, tab: tab, tabId: tabId, ParentId: ParentId});
			chrome.runtime.sendMessage({command: "tab_attached", windowId: attachInfo.newWindowId, tab: tab, tabId: tabId, ParentId: tabs[tabId].p});
			schedule_save++;
		});
	});
	
	chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
		let detachTabId =  tabId;
		if (DETACHEDTABSBug1402742WTFAREYOUDOINGMOZILLA[tabId] != undefined) {
			detachTabId = DETACHEDTABSBug1402742WTFAREYOUDOINGMOZILLA[tabId];
			setTimeout(function() {
				delete DETACHEDTABSBug1402742WTFAREYOUDOINGMOZILLA[tabId];
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
			tabs[tabId].p = "pin_list";
		}
		if (changeInfo.title != undefined && !tab.active) {
			chrome.runtime.sendMessage({command: "tab_attention", windowId: tab.windowId, tabId: tabId});
		}
		chrome.runtime.sendMessage({command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tabId, changeInfo: changeInfo});
	});
	
	// chrome.tabs.onMoved.addListener(function(tabId, moveInfo) {
	// });
	
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
				chrome.runtime.sendMessage({command: "tab_attached", windowId: tab.windowId, tab: tab, tabId: addedTabId, ParentId: tabs[addedTabId].p});
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
		// windows[window.id] = {h: "", groups: {}, folders: {}};
		// let NewTTWindowId = GenerateNewWindowID();
		// browser.sessions.setWindowValue(window.id, "TTId", NewTTWindowId);
		// windows[window.id].h = NewTTWindowId;
		schedule_save++;
	});
	
	chrome.windows.onRemoved.addListener(function(windowId) {
		delete windows[windowId];
		schedule_save++;
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
