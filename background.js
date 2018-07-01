// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////    START BACKGROUND SCRIPT   /////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


document.addEventListener("DOMContentLoaded", function() {
	if (browserId == "F") {
		setTimeout(function() {
			StartBackgroundListeners();
			QuantumStart(0);
		}, 500);
	} else {
		StartBackgroundListeners();
		ChromiumLoadTabs(0);
	}
});

////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////    BACKGROUND FUNCTIONS    /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


function pushlog(log) {
	b.debug.push(log);
	if (b.debug.length > 100) {
		b.debug.splice(0, 1);
	}
	console.log(log);
	b.schedule_save++;
}


function ReplaceParents(oldTabId, newTabId) {
	for (let tabId in b.tabs) {
		if (b.tabs[tabId].parent == oldTabId) {
			b.tabs[tabId].parent = newTabId;
		}
	}
}

async function DiscardTab(tabId) {
	let DiscardTimeout = 0;
	let Discard = setInterval(function() {
		chrome.tabs.get(tabId, function(tab) {
			if ((tab.favIconUrl != undefined && tab.favIconUrl != "" && tab.title != undefined && tab.title != "") || tab.status == "complete" || tab.audible) {
				chrome.tabs.discard(tab.id);
				clearInterval(Discard);
			}
			if (DiscardTimeout > 300) {
				clearInterval(Discard);
			}
		});
		DiscardTimeout++;
	}, 2000);
}

async function DiscardWindow(windowId) {
	let DiscardTimeout = 0;
	let DiscardedTabs = 0;
	let Discard = setInterval(function() {
		chrome.windows.get(windowId, {populate: true}, function(w) {
			for (let i = 0; i < w.tabs.length; i++) {
				if (w.tabs[i].discarded == false && w.tabs[i].active == false) {
					if ((w.tabs[i].favIconUrl != undefined && w.tabs[i].favIconUrl != "" && w.tabs[i].title != undefined && w.tabs[i].title != "") || w.tabs[i].status == "complete" || tab.audible) {
						chrome.tabs.discard(w.tabs[i].id);
						DiscardedTabs++;
					}
				}
			}
			if (DiscardedTabs == w.tabs.length) {
				clearInterval(Discard);
			}
		});
		if (DiscardTimeout > 300) {
			clearInterval(Discard);
		}
		DiscardTimeout++;
	}, 5000);
}

function GetTabGroupId(tabId, windowId) {
	let groupId = "tab_list";
	if (tabId == undefined || windowId == undefined || b.windows[windowId] == undefined || b.tabs[tabId] == undefined) {
		return groupId;
	}
	let parent = b.tabs[tabId].parent;
	while (parent) {
		if (isNaN(parent) == false && b.tabs[parent]) {
			parent = b.tabs[parent].parent;
		} else {
			if (parent.match("tab_list|g_|f_") == null && b.tabs[parent]) {
				parent = b.tabs[parent].parent;
			} else {
				if (parent.match("f_") != null && b.windows[windowId].folders[parent]) {
					parent = b.windows[windowId].folders[parent].parent;
				} else {
					if (parent.match("pin_list|tab_list|g_") != null) {
						groupId = parent;
						parent = false;
					} else {
						parent = false;
					}
				}
			}
		}
	}
	return groupId;
}

function GetTabParents(tabId) {
	let Parents = [];
	if (tabId == undefined) {
		return Parents;
	}
	if (b.tabs[tabId] == undefined) {
		return Parents;
	}
	while (b.tabs[tabId].parent != "" && b.tabs[b.tabs[tabId].parent] != undefined) {
		if (b.tabs[b.tabs[tabId].parent]) {
			Parents.push(b.tabs[tabId].parent);
		}
		tabId = b.tabs[tabId].parent;
	}
	return Parents;
}

function GetChildren(parentId) {
	let Children = [];
	for (let tId in b.tabs) {
		if (b.tabs[tId].parent == parentId) {
			Children.push(parseInt(tId));
		}
	}
	for (let i = 0; i < Children.length-1; i++) {
		for (let j = i+1; j < Children.length; j++) {
			if (b.tabs[Children[i]].index > b.tabs[Children[j]].index) {
				let swap = Children[i];
				Children[i] = Children[j];
				Children[j] = swap;
			}
		}
	}
	return Children;
}


function AppendTabToGroupOnRegexMatch(tabId, windowId, url) {
	let TabGroupId = GetTabGroupId(tabId, windowId);
	for (let i = 0; i < opt.tab_group_regexes.length; i++) {
		let regexPair = opt.tab_group_regexes[i];
		if (url.match(regexPair[0])) {
			let groupId = FindGroupIdByName(regexPair[1], b.windows[windowId].groups);
			let groupName = regexPair[1];
			if (groupId === null) { // no group
				let newGroupID = "";
				while (newGroupID == "") {
					newGroupID = "g_"+GenerateRandomID();
					for (let wId in b.windows) {
						for (let gId in b.windows[wId].groups) {
							console.log("check if group id exists");
							if (gId == newGroupID) {
								newGroupID = "";
								console.log("yup, redo");
							}
						}
					}
				}
				groupId = newGroupID;
				b.windows[windowId].groups[groupId] = {id: groupId, index: 999, active_tab: 0, prev_active_tab: 0, active_tab_ttid: "", name: groupName, font: ""};
				chrome.runtime.sendMessage({command: "append_group", groupId: groupId, group_name: groupName, font_color: "", windowId: windowId});
			}
			if (TabGroupId != groupId && groupId != null) {
				b.tabs[tabId].parent = groupId;
				setTimeout(function() {
					chrome.runtime.sendMessage({command: "append_tab_to_group", tabId: tabId, groupId: groupId, windowId: windowId});
				}, 100);
			}
			break;
		}
	}
	return b.tabs[tabId].parent;
}

function FindGroupIdByName(name, groups) {
	for (let groupId in groups) {
		if (!groups.hasOwnProperty(groupId)) {
			continue;
		}
		if (groups[groupId].name === name) {
			return groupId;
		}
	}
	return null;
}

////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////    QUANTUM    //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


function QuantumStart(retry) {
	chrome.windows.getAll({windowTypes: ["normal"], populate: true}, function(w) {
		if (w[0].tabs.length == 1 && (w[0].tabs[0].url == "about:blank" || w[0].tabs[0].url == "about:sessionrestore")) {
			setTimeout(function() {
				QuantumStart(retry+1);
			}, 2000);
		} else {
			QuantumLoadTabs(0);
			if (retry > 0) {
				chrome.runtime.sendMessage({command: "reload_sidebar"});
			}
			setTimeout(function() {
				b.schedule_save = 0;
			}, 2000);
		}
	});			
}

function QuantumLoadTabs(retry) {
	chrome.windows.getAll({windowTypes: ["normal"], populate: true}, function(w) {
		chrome.storage.local.get(null, function(storage) {
			// LOAD PREFERENCES
			GetCurrentPreferences(storage);

			// CACHED COUNTS AND STUFF
			// let b.tt_ids = {};
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
					b.debug =  storage.debug_log;
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
						b.windows[winId] = Object.assign({}, WindowData);
					} else {
						QuantumAppendWinTTId(winId);
					}
					for (let tIndex = 0; tIndex < tabsCount; tIndex++) {
						let tab = w[winIndex].tabs[tIndex];
						let tabIndex = tIndex;
						let tabId = w[winIndex].tabs[tabIndex].id;
						let tabPinned = w[winIndex].tabs[tabIndex].pinned;

						if (tab.active) {
							b.windows[winId].activeTabId[0] = tabId;
							b.windows[winId].activeTabId[1] = tabId;
						}

						// LOAD TTID FROM FIREFOX GET TAB VALUE
						let tt_tab = Promise.resolve(browser.sessions.getTabValue(tabId, "TTdata")).then(function(TabData) {
							if (opt.skip_load == false && TabData != undefined) {
								b.tabs[tabId] = Object.assign({}, TabData);
								b.tt_ids[b.tabs[tabId].ttid] = tabId;
								tabs_matched++;
							} else {
								QuantumAppendTabTTId(tab);
							}
							// IF ON LAST TAB AND LAST WINDOW, START MATCHING LOADED DATA
							if (tabId == lastTabId && winId == lastWinId) {
								
								// OK, DONE, NOW REPLACE OLD PARENTS IDS WITH THIS SESSION IDS
								for (let ThisSessonTabId in b.tabs) {
									if (b.tabs[ThisSessonTabId].parent_ttid != "" && b.tt_ids[b.tabs[ThisSessonTabId].parent_ttid] != undefined) {
										b.tabs[ThisSessonTabId].parent = b.tt_ids[b.tabs[ThisSessonTabId].parent_ttid];
									}
								}
								
								// OK, SAME THING FOR ACTIVE TABS IN GROUPS
								for (let ThisSessonWinId in b.windows) {
									for (let group in b.windows[ThisSessonWinId].groups) {
										if (b.tt_ids[b.windows[ThisSessonWinId].groups[group].active_tab_ttid] != undefined) {
											b.windows[ThisSessonWinId].groups[group].active_tab = b.tt_ids[b.windows[ThisSessonWinId].groups[group].active_tab_ttid];
										}
										if (b.tt_ids[b.windows[ThisSessonWinId].groups[group].prev_active_tab_ttid] != undefined) {
											b.windows[ThisSessonWinId].groups[group].prev_active_tab = b.tt_ids[b.windows[ThisSessonWinId].groups[group].prev_active_tab_ttid];
										}
									}
								}

								if (opt.debug){ pushlog("QuantumLoadTabs, retry: "+retry); pushlog("Current windows count is: "+w.length); pushlog("Current tabs count is: "+tabs_count); pushlog("Matching tabs: "+tabs_matched); pushlog("Current windows:"); pushlog(w); }

								// will try to find tabs for 3 times
								if (opt.skip_load == true || retry > 2 || (tabs_matched > tabs_count*0.5)) {
									b.running = true;
									QuantumAutoSaveData();
									QuantumStartListeners();
									delete DefaultToolbar; delete DefaultTheme; delete DefaultPreferences;
								} else {
									if (opt.debug){
										pushlog("Attempt "+retry+" failed, matched tabs was below 50%");
									}
									setTimeout(function() {
										QuantumLoadTabs(retry+1);
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
async function QuantumAutoSaveData() {
	setInterval(function() {
		if (b.schedule_save > 1) {
			b.schedule_save = 1;
		}
		if (b.running && b.schedule_save > 0 && Object.keys(b.tabs).length > 1) {
			chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {
				let WinCount = w.length;
				for (let wIndex = 0; wIndex < WinCount; wIndex++) {
					let winId = w[wIndex].id;
					if (b.windows[winId] != undefined && b.windows[winId].ttid != undefined && b.windows[winId].group_bar != undefined && b.windows[winId].search_filter != undefined && b.windows[winId].active_shelf != undefined && b.windows[winId].active_group != undefined && b.windows[winId].groups != undefined && b.windows[winId].folders != undefined) {
						browser.sessions.setWindowValue(winId, "TTdata", b.windows[winId]   );
					}
					let TabsCount = w[wIndex].tabs.length;
					for (let tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
						let tabId = w[wIndex].tabs[tabIndex].id;
						if (b.tabs[tabId] != undefined && b.tabs[tabId].ttid != undefined && b.tabs[tabId].parent != undefined && b.tabs[tabId].index != undefined && b.tabs[tabId].expand != undefined) {
							browser.sessions.setTabValue( tabId, "TTdata", b.tabs[tabId] );
						}
					}
				}
				b.schedule_save--;
			});
		}
		if (opt.debug == true) { chrome.storage.local.set({debug_log: b.debug}); }
	}, 1000);
}

function QuantumGenerateNewWindowID() {
	let newID = "";
	while (newID == "") {
		newID = "w_"+GenerateRandomID();
		for (let wId in b.windows) {
			if (wId == newID) {
				newID = "";
			}
		}
	}
	return newID;
}

function QuantumGenerateNewTabID() {
	let newID = "";
	while (newID == "") {
		newID = "t_"+GenerateRandomID();
		for (let tId in b.tabs) {
			if (tId == newID) {
				newID = "";
			}
		}
	}
	return newID;		
}

function QuantumAppendTabTTId(tab) {
	let NewTTTabId = QuantumGenerateNewTabID();
	if (b.tabs[tab.id] != undefined) {
		b.tabs[tab.id].ttid = NewTTTabId;
	} else {
		b.tabs[tab.id] = {ttid: NewTTTabId, parent: (b.windows[tab.windowId] ? b.windows[tab.windowId].active_group : "tab_list"), parent_ttid: "", index: tab.index, expand: ""};
	}
	b.tt_ids[NewTTTabId] = tab.id;
	return NewTTTabId;
	// if (b.schedule_save > 0) browser.sessions.setTabValue( tab.id, "TTdata", b.tabs[tab.id] );
}

function QuantumAppendWinTTId(windowId) {
	let NewTTWindowId = QuantumGenerateNewWindowID();
	if (b.windows[windowId] != undefined) {
		b.windows[windowId].ttid = NewTTWindowId;
	} else {
		b.windows[windowId] = {activeTabId: [0,0], ttid: NewTTWindowId, group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, active_tab: 0, active_tab_ttid: "", prev_active_tab: 0, prev_active_tab_ttid: "", name: labels.ungrouped_group, font: ""}}, folders: {}};
	}
	// if (b.schedule_save > 0) browser.sessions.setWindowValue( windowId, "TTdata", b.windows[windowId] );
}


////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////    CHROMIUM    /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function ChromiumLoadTabs(retry) {
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
			let CurrentTabsCount = 0;
			for (let wIndex = 0; wIndex < w.length; wIndex++) {
				CurrentTabsCount += w[wIndex].tabs.length;
			}

			let bak = (1 + retry) <= 3 ? (1 + retry) : 3;

			if (opt.skip_load == false) {
				// if loaded tabs mismatch by 50%, then try to load back
				if (LoadedTabs.length < t_count*0.5) {
					LoadedTabs = storage["tabs_BAK"+bak] ? storage["tabs_BAK"+bak] : [];
				}
				// if loaded windows mismatch, then try to load back
				if (LoadedWindows.length < w_count) {
					LoadedWindows =  storage["windows_BAK"+bak] ? storage["windows_BAK"+bak] : [];
				}
			} else {
				tabs_matched = CurrentTabsCount;
			}

			if (opt.debug == true) {
				if (storage.debug_log != undefined) {
					b.debug =  storage.debug_log;
				}
				if (retry == 0) {
					pushlog("TreeTabs background start");
				}
			}

			// CACHED COUNTS
			let WinCount = w.length;
			let LoadedWinCount = LoadedWindows.length;
			let LoadedTabsCount = LoadedTabs.length;
		
			for (let wIndex = 0; wIndex < WinCount; wIndex++) {
				if (w[wIndex].tabs[0].url != "chrome://videopopout/") { // this is for opera for their extra video popup, which is weirdly queried as a "normal" window
					let winId = w[wIndex].id;
					let url1 = w[wIndex].tabs[0].url;
					let url2 = w[wIndex].tabs[w[wIndex].tabs.length-1].url;
					ChromiumAddWindowData(winId);
					
					if (opt.skip_load == false) {
						for (let LwIndex = 0; LwIndex < LoadedWinCount; LwIndex++) {
							if (LoadedWindows[LwIndex].url1 == url1 || LoadedWindows[LwIndex].url2 == url2) {
								if (LoadedWindows[LwIndex].group_bar) { b.windows[winId].group_bar = LoadedWindows[LwIndex].group_bar; }
								if (LoadedWindows[LwIndex].search_filter) { b.windows[winId].search_filter = LoadedWindows[LwIndex].search_filter; }
								if (LoadedWindows[LwIndex].active_shelf) { b.windows[winId].active_shelf = LoadedWindows[LwIndex].active_shelf; }
								if (LoadedWindows[LwIndex].active_group) { b.windows[winId].active_group = LoadedWindows[LwIndex].active_group; }
								if (Object.keys(LoadedWindows[LwIndex].groups).length > 0) { b.windows[winId].groups = Object.assign({}, LoadedWindows[LwIndex].groups); }
								if (Object.keys(LoadedWindows[LwIndex].folders).length > 0) { b.windows[winId].folders = Object.assign({}, LoadedWindows[LwIndex].folders); }
								LoadedWindows[LwIndex].url1 = "";
								LoadedWindows[LwIndex].url2 = "";
								break;
							}
						}
					}
				}
			}

			// add new hashes for current tabs
			for (let wIndex = 0; wIndex < WinCount; wIndex++) {
				let TabsCount = w[wIndex].tabs.length;
				for (let tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
					ChromiumHashURL(w[wIndex].tabs[tabIndex]);
					
					if (w[wIndex].tabs[tabIndex].active) {
						b.windows[w[wIndex].id].activeTabId[0] = w[wIndex].tabs[tabIndex].id;
						b.windows[w[wIndex].id].activeTabId[1] = w[wIndex].tabs[tabIndex].id;
					}

				}
			}
			
			// compare saved tabs from storage to current session tabs, but can be skipped if set in options
			if (opt.skip_load == false && LoadedTabs.length > 0) { 
				for (let wIndex = 0; wIndex < WinCount; wIndex++) {
					let TabsCount = w[wIndex].tabs.length;
					for (let tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
						for (let LtabIndex = 0; LtabIndex < LoadedTabsCount; LtabIndex++) {
							let tabId = w[wIndex].tabs[tabIndex].id;
							if (LoadedTabs[LtabIndex].hash == b.tabs[tabId].hash && refTabs[LoadedTabs[LtabIndex].id] == undefined) {
								refTabs[LoadedTabs[LtabIndex].id] = tabId;
								if (LoadedTabs[LtabIndex].parent) { b.tabs[tabId].parent = LoadedTabs[LtabIndex].parent; }
								if (LoadedTabs[LtabIndex].index) { b.tabs[tabId].index = LoadedTabs[LtabIndex].index; }
								if (LoadedTabs[LtabIndex].expand) { b.tabs[tabId].expand = LoadedTabs[LtabIndex].expand; }
								LoadedTabs[LtabIndex].hash = undefined;
								tabs_matched++;
								break;
							}
						}
					}
				}
				// replace parents tabIds for new ones, for that purpose refTabs was made before
				for (let tabId in b.tabs) {
					if (refTabs[b.tabs[tabId].parent] != undefined) {
						b.tabs[tabId].parent = refTabs[b.tabs[tabId].parent];
					}
				}
				// replace active tab ids for each group using refTabs
				for (let windowId in b.windows) {
					for (let group in b.windows[windowId].groups) {
						if (refTabs[b.windows[windowId].groups[group].active_tab]) {
							b.windows[windowId].groups[group].active_tab = refTabs[b.windows[windowId].groups[group].active_tab];
						}
						if (refTabs[b.windows[windowId].groups[group].prev_active_tab]) {
							b.windows[windowId].groups[group].prev_active_tab = refTabs[b.windows[windowId].groups[group].prev_active_tab];
						}
					}
				}
			}

			if (opt.debug){
				pushlog("ChromiumLoadTabs, retry: "+retry); pushlog("Current windows count is: "+w.length); pushlog("Saved windows count is: "+LoadedWindows.length); pushlog("Current tabs count is: "+CurrentTabsCount);
				pushlog("Loaded tabs count is: "+LoadedTabsCount); pushlog("Matching tabs: "+tabs_matched); pushlog("Current windows:"); pushlog(w);
			}

			// will loop trying to find tabs
			if (opt.skip_load || retry >= 5 || (tabs_matched > t_count*0.5)) {
				b.running = true;
				ChromiumAutoSaveData(0, 1000); ChromiumAutoSaveData(1, 300000); ChromiumAutoSaveData(2, 600000); ChromiumAutoSaveData(3, 1800000);
				ChromiumStartListeners();
				delete DefaultToolbar; delete DefaultTheme; delete DefaultPreferences;
				b.schedule_save = -1; // 2 operations must be made to start saving data
			} else {
				if (opt.debug){
					pushlog("Attempt "+retry+" failed, matched tabs was below 50%");
				}
				setTimeout(function() {
					ChromiumLoadTabs(retry+1);
				}, 5000);
			}
		});
	});
}

async function ChromiumAutoSaveData(BAK, LoopTimer) {
	setInterval(function() {
		if (b.schedule_save > 1 || BAK > 0) {
			b.schedule_save = 1;
		}
		if (b.running && b.schedule_save > 0 && Object.keys(b.tabs).length > 1) {
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
					if (b.windows[winId] != undefined && b.windows[winId].group_bar != undefined && b.windows[winId].search_filter != undefined && b.windows[winId].active_shelf != undefined && b.windows[winId].active_group != undefined && b.windows[winId].groups != undefined && b.windows[winId].folders != undefined) {
						Windows.push({ url1: w[wIndex].tabs[0].url, url2: w[wIndex].tabs[w[wIndex].tabs.length-1].url, group_bar: b.windows[winId].group_bar, search_filter: b.windows[winId].search_filter, active_shelf: b.windows[winId].active_shelf, active_group: b.windows[winId].active_group, groups: b.windows[winId].groups, folders: b.windows[winId].folders });
					}
					let TabsCount = w[wIndex].tabs.length;
					for (let tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
						let tabId = w[wIndex].tabs[tabIndex].id;
						if (b.tabs[tabId] != undefined && b.tabs[tabId].hash != undefined && b.tabs[tabId].parent != undefined && b.tabs[tabId].index != undefined && b.tabs[tabId].expand != undefined) {
							Tabs.push({ id: tabId, hash: b.tabs[tabId].hash, parent: b.tabs[tabId].parent, index: b.tabs[tabId].index, expand: b.tabs[tabId].expand });
							counter++;
						}
					}
					if (counter == t_count) {
						chrome.storage.local.set({t_count: t_count});
						chrome.storage.local.set({w_count: WinCount});
						if (BAK == 0) { chrome.storage.local.set({windows: Windows}); chrome.storage.local.set({tabs: Tabs}); }
						if (BAK == 1) { chrome.storage.local.set({windows_BAK1: Windows}); chrome.storage.local.set({tabs_BAK1: Tabs}); chrome.runtime.sendMessage({command: "backup_available", bak: 1}); }
						if (BAK == 2) { chrome.storage.local.set({windows_BAK2: Windows}); chrome.storage.local.set({tabs_BAK2: Tabs}); chrome.runtime.sendMessage({command: "backup_available", bak: 2}); }
						if (BAK == 3) { chrome.storage.local.set({windows_BAK3: Windows}); chrome.storage.local.set({tabs_BAK3: Tabs}); chrome.runtime.sendMessage({command: "backup_available", bak: 3}); }
					}
				}
				b.schedule_save--;
			});
		}
		if (opt.debug == true) { chrome.storage.local.set({debug_log: b.debug}); }
	}, LoopTimer);
}

function ChromiumAddWindowData(winId) {
	b.windows[winId] = {activeTabId: [0,0], group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, active_tab: 0, prev_active_tab: 0, name: labels.ungrouped_group, font: ""}}, folders: {}};
}

function ChromiumHashURL(tab) {
	if (b.tabs[tab.id] == undefined) { b.tabs[tab.id] = {hash: 0, parent: tab.pinned ? "pin_list" : (b.windows[tab.windowId] ? b.windows[tab.windowId].active_group : "tab_list"), index: (Object.keys(b.tabs).length + 1), expand: "n"}; }
	let hash = 0;
	for (let charIndex = 0; charIndex < tab.url.length; charIndex++) {
		hash += tab.url.charCodeAt(charIndex);
	}
	b.tabs[tab.id].hash = hash;
}
