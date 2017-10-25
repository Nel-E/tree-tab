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
		for (var e = 0; e < w.length; e++) {
			tabs_count += w[e].tabs.length;
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


		for (var a = 0; a < WinCount; a++) {
			
			let winIndex = a;
			let winId = w[winIndex].id;
			let tabsCount = w[winIndex].tabs.length;

			let win = Promise.resolve(browser.sessions.getWindowValue(winId, "TTId")).then(function(TTId) { // LOAD TTID FROM FIREFOX GET WINDOW VALUE
				if (TTId != undefined) {
					windows[winId] = {h: TTId, group_bar: true, active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, activetab: 0, name: caption_ungrouped_group, font: ""}}, folders: {}};
				} else {
					windows[winId] = {h: "", group_bar: true, active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, activetab: 0, name: caption_ungrouped_group, font: ""}}, folders: {}};
				}
				
				for (var t = 0; t < tabsCount; t++) {

					let tabIndex = t;
					let tabId = w[winIndex].tabs[tabIndex].id;
					let tabPinned = w[winIndex].tabs[tabIndex].pinned;

					
					let tab = Promise.resolve(browser.sessions.getTabValue(tabId, "TTId")).then(function(TTId) { // LOAD TTID FROM FIREFOX GET TAB VALUE
						if (TTId != undefined) {
							tabs[tabId] = {h: TTId, p: tabPinned ? "pin_list" : "tab_list", i: tabIndex, o: "n"};
						} else {
							tabs[tabId] = {h: "", p: tabPinned ? "pin_list" : "tab_list", i: tabIndex, o: "n"};
						}
						// IF ON LAST TAB AND LAST WINDOW, START MATCHING LOADED DATA
						if (tabId == lastTabId && winId == lastWinId) {
							for (var ThisSessonWinId in windows) {
								if (windows[ThisSessonWinId].h != ""){
									for (var j = 0; j < LoadedWinCount; j++) {
										if (LoadedWindows[j][0] != undefined) {
											if (LoadedWindows[j][0] == windows[ThisSessonWinId].h) {
												windows[ThisSessonWinId].group_bar = LoadedWindows[j][1];
												windows[ThisSessonWinId].active_shelf = LoadedWindows[j][2];
												windows[ThisSessonWinId].active_group = LoadedWindows[j][3];
												if (Object.keys(LoadedWindows[j][4]).length > 0) { windows[ThisSessonWinId].groups = Object.assign({}, LoadedWindows[j][4]); }
												if (Object.keys(LoadedWindows[j][5]).length > 0) { windows[ThisSessonWinId].folders = Object.assign({}, LoadedWindows[j][5]); }
												LoadedWindows[j][0] = undefined;
												break;
											}
										}
									}
								} else {
									AppendWinTTId(parseInt(ThisSessonWinId));
								}
							}
							// OK, DONE WITH WINDOWS, START TABS LOOP
							for (var ThisSessonTabId in tabs) {
								if (tabs[ThisSessonTabId].h != ""){
									for (var k = 0; k < LoadedTabsCount; k++) {
										if (LoadedTabs[k][0] != undefined) {
											if (LoadedTabs[k][1] == tabs[ThisSessonTabId].h) {
												refTabs[LoadedTabs[k][0]] = ThisSessonTabId;
												tabs[ThisSessonTabId].p = LoadedTabs[k][2];
												tabs[ThisSessonTabId].i = LoadedTabs[k][3];
												tabs[ThisSessonTabId].o = LoadedTabs[k][4];
												LoadedTabs[k][0] = undefined;
												tabs_matched++;
												break;
											}
										}
									}
								} else {
									AppendTabTTId(parseInt(ThisSessonTabId));
								}
							}
							// OK, DONE, NOW REPLACE OLD PARENTS IDS WITH THIS SESSION IDS
							for (var ThisSessonTabId in tabs) {
								if (refTabs[tabs[ThisSessonTabId].p] != undefined) {
									tabs[ThisSessonTabId].p = refTabs[tabs[ThisSessonTabId].p];
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
								AutoSaveBackup();
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
	// let BackupName = BAK;
	// let LoopTimer = timer;

	setTimeout(function() {
		FirefoxAutoSaveData(BackupName, LoopTimer);
		if (schedule_save > 1 || BackupName != "") {schedule_save = 1;}
		if (!hold && schedule_save > 0 && Object.keys(tabs).length > 1) {
			chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {
				var WinCount = w.length;
				var t_count = 0;
				// var x = "";
				// var y = "";
				var counter = 0;
				var k = [];
				var m = [];

				for (var a = 0; a < WinCount; a++) {
					t_count = t_count + w[a].tabs.length;
				}

				for (var b = 0; b < WinCount; b++) {
					let winId = w[b].id;
					if (
						windows[winId] != undefined &&
						windows[winId].h != undefined &&
						windows[winId].group_bar != undefined &&
						windows[winId].active_shelf != undefined &&
						windows[winId].active_group != undefined &&
						windows[winId].groups != undefined &&
						windows[winId].folders != undefined
					) {
						
						
						k.push([windows[winId].h, windows[winId].group_bar, windows[winId].active_shelf, windows[winId].active_group, windows[winId].groups, windows[winId].folders]);
						
						// x += ',["'+ windows[winId].h+'",'+
							// windows[winId].group_bar+','+
							// JSON.stringify(windows[winId].active_shelf)+','+
							// JSON.stringify(windows[winId].active_group)+','+
							// JSON.stringify(windows[winId].groups)+','+
							// JSON.stringify(windows[winId].folders)+']';
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
							m.push([tabId, tabs[tabId].h, tabs[tabId].p, tabs[tabId].i, tabs[tabId].o]);
							
							// y += ',['+tabId+',"'+tabs[tabId].h+'","'+tabs[tabId].p+'",'+tabs[tabId].i+',"'+tabs[tabId].o+'"]';
							counter++;
						}
					}
					
					if (counter == t_count) {
						// console.log("saved "+BackupName);
						// console.log(BackupName);
						localStorage["t_count"] = JSON.stringify(t_count);
						localStorage["w_count"] = JSON.stringify(WinCount);
						// localStorage["tabs"+BAK] = ("["+y.substr(1)+"]");
						// localStorage["windows"+BAK] = ("["+x.substr(1)+"]");
						localStorage["windows"+BackupName] = JSON.stringify(k);
						localStorage["tabs"+BackupName] = JSON.stringify(m);
					}
				}
				schedule_save--;
			});
		}
	}, LoopTimer);
	// }, 1000);
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
		windows[windowId] = {h: NewTTWindowId, group_bar: true, active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, activetab: 0, name: caption_ungrouped_group, font: ""}}, folders: {}};
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
