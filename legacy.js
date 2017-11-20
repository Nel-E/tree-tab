


function FirefoxLoadTabsOLD(retry) {
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

			let dta = Promise.resolve(browser.sessions.getWindowValue(winId, "TTdata")).then(function(data) { // LOAD TTID FROM FIREFOX GET WINDOW VALUE
				if (data != undefined) {
					console.log(data);
				}
			});	

					
			let win = Promise.resolve(browser.sessions.getWindowValue(winId, "TTId")).then(function(TTId) { // LOAD TTID FROM FIREFOX GET WINDOW VALUE
				if (TTId != undefined) {
					windows[winId] = {ttid: TTId, group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, activetab: 0, name: caption_ungrouped_group, font: ""}}, folders: {}};
				} else {
					windows[winId] = {ttid: "", group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, activetab: 0, name: caption_ungrouped_group, font: ""}}, folders: {}};
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
											if (LoadedWindows[LwIndex].group_bar) { windows[ThisSessonWinId].group_bar = LoadedWindows[LwIndex].group_bar; }
											if (LoadedWindows[LwIndex].search_filter) { windows[ThisSessonWinId].search_filter = LoadedWindows[LwIndex].search_filter; }
											if (LoadedWindows[LwIndex].active_shelf) { windows[winId].active_shelf = LoadedWindows[LwIndex].active_shelf; }
											if (LoadedWindows[LwIndex].active_group) { windows[ThisSessonWinId].active_group = LoadedWindows[LwIndex].active_group; }
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
											if (LoadedTabs[LtabIndex].parent) { tabs[ThisSessonTabId].parent = LoadedTabs[LtabIndex].parent; }
											if (LoadedTabs[LtabIndex].index) { tabs[ThisSessonTabId].index = LoadedTabs[LtabIndex].index; }
											if (LoadedTabs[LtabIndex].expand) { tabs[ThisSessonTabId].expand = LoadedTabs[LtabIndex].expand; }
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
								running = true;
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





async function FirefoxAutoSaveDataOLD(BackupName, LoopTimer) {
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
					t_count = t_count + w[wIndex].tabs.length;
				}

				for (var wIndex = 0; wIndex < WinCount; wIndex++) {
					let winId = w[wIndex].id;
					if (windows[winId] != undefined && windows[winId].ttid != undefined && windows[winId].group_bar != undefined && windows[winId].search_filter != undefined && windows[winId].active_shelf != undefined && windows[winId].active_group != undefined && windows[winId].groups != undefined && windows[winId].folders != undefined) {
						Windows.push({ttid: windows[winId].ttid, group_bar: windows[winId].group_bar, search_filter: windows[winId].search_filter, active_shelf: windows[winId].active_shelf, active_group: windows[winId].active_group, groups: windows[winId].groups, folders: windows[winId].folders});
					}

					let TabsCount = w[wIndex].tabs.length;
					for (var tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
						let tabId = w[wIndex].tabs[tabIndex].id;
						if (tabs[tabId] != undefined && tabs[tabId].ttid != undefined && tabs[tabId].parent != undefined && tabs[tabId].index != undefined && tabs[tabId].expand != undefined) {
							Tabs.push({id: tabId, ttid: tabs[tabId].ttid, parent: tabs[tabId].parent, index: tabs[tabId].index, expand: tabs[tabId].expand});
							counter++;
						}
					}
					
					if (counter == t_count && Tabs.length > 1) {
						localStorage["windows"+BackupName] = JSON.stringify(Windows);
						localStorage["tabs"+BackupName] = JSON.stringify(Tabs);
					}
				}
				schedule_save--;
			});
		}
	}, LoopTimer);
}