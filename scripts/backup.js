// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


function ExportGroup(groupId, filename, save_to_manager) {
	let GroupToSave = { group: tt.groups[groupId], folders: {}, tabs: [] };
	document.querySelectorAll("#" + groupId + " .folder").forEach(function(s) {
		if (tt.folders[s.id]) {
			GroupToSave.folders[s.id] = tt.folders[s.id];
		}
	});
	let Tabs = document.querySelectorAll("#" + groupId + " .tab");
	if (Tabs.length > 0) {
		let lastId = parseInt(Tabs[Tabs.length - 1].id);
		Tabs.forEach(function(s) {
			chrome.tabs.get(parseInt(s.id), function(tab) {
				if ((tab.url).startsWith("www") || (tab.url).startsWith("http") || (tab.url).startsWith("ftp")) {
					(GroupToSave.tabs).push({
						id: tab.id,
						parent: s.parentNode.parentNode.id,
						index: Array.from(s.parentNode.children).indexOf(s),
						expand: (s.classList.contains("c") ? "c" : (s.classList.contains("o") ? "o" : "")),
						url: tab.url
					});
				}
				if (tab.id == lastId) {
					if (filename) {
						SaveFile(filename, "tt_group", GroupToSave);
					}
					if (save_to_manager) {
						AddGroupToStorage(GroupToSave, true);
					}

					if (opt.debug) {
						log("f: ExportGroup, filename: "+filename+", groupId: "+groupId+", save_to_manager: "+save_to_manager);
					}
				}
			});
		});
	} else {
		if (filename) {
			SaveFile(filename, "tt_group", GroupToSave);
		}
		if (save_to_manager) {
			AddGroupToStorage(GroupToSave, true);
		}

		if (opt.debug) {
			log("f: ExportGroup, filename: "+filename+", groupId: "+groupId+", save_to_manager: "+save_to_manager);
		}

	}
}

function ImportGroup(recreate_group, save_to_manager) {
	let file = document.getElementById("file_import");
	let fr = new FileReader();
	if (file.files[0] == undefined) return;
	fr.readAsText(file.files[0]);
	fr.onload = function() {
		let data = fr.result;
		let group = JSON.parse(data);
		file.parentNode.removeChild(file);
		if (recreate_group) {
			RecreateGroup(group);
		}
		if (save_to_manager) {
			AddGroupToStorage(group, true);
		}
		
		if (opt.debug) {
			log("f: ImportGroup, recreate_group: "+recreate_group+", save_to_manager: "+save_to_manager);
		}
	}
}

function AddGroupToStorage(group, add_to_manager) {
	chrome.storage.local.get(null, function(storage) {
		if (storage["hibernated_groups"] == undefined) {
			let hibernated_groups = [];
			hibernated_groups.push(group);
			chrome.storage.local.set({ hibernated_groups: hibernated_groups });
			if (add_to_manager) {
				AddGroupToManagerList(group);
			}
		} else {
			let hibernated_groups = storage["hibernated_groups"];
			hibernated_groups.push(group);
			chrome.storage.local.set({ hibernated_groups: hibernated_groups });
			if (add_to_manager) {
				AddGroupToManagerList(group);
			}
		}
		if (opt.debug) {
			log("f: AddGroupToStorage, add_to_manager: "+add_to_manager);
		}
	});
}


function RecreateGroup(LoadedGroup) {
	let NewFolders = {};
	let RefsTabs = {};
	let NewTabs = [];
	let NewGroupId = AddNewGroup(LoadedGroup.group.name, LoadedGroup.group.font);
	SetActiveGroup(NewGroupId, false, false);
	for (var folder in LoadedGroup.folders) {
		let newId = GenerateNewFolderID();
		NewFolders[folder] = { id: newId, parent: NewGroupId, index: (LoadedGroup.folders[folder].index), name: (LoadedGroup.folders[folder].name), expand: (LoadedGroup.folders[folder].expand) };
	}
	for (var folder in NewFolders) {
		if (NewFolders[LoadedGroup.folders[folder].parent]) {
			NewFolders[folder].parent = NewFolders[LoadedGroup.folders[folder].parent].id;
		}
	}
	(LoadedGroup.tabs).forEach(function(Tab) {
		chrome.tabs.create({ url: Tab.url, active: false }, function(new_tab) {
			if (new_tab) {
				RefsTabs[Tab.id] = new_tab.id;
				Tab.id = new_tab.id;
				NewTabs.push(Tab);
				setTimeout(function() {
					let nt = document.getElementById(new_tab.id);
					let NewGroupTabs = document.getElementById("ct" + NewGroupId);
					if (nt != null && NewGroupTabs != null) {
						NewGroupTabs.appendChild(nt);
					}
				}, 1000);
				
				if (browserId != "O") {
					chrome.runtime.sendMessage({command: "discard_tab", tabId: new_tab.id});
				}
				
			}
			if (NewTabs.length == LoadedGroup.tabs.length - 1) {
				setTimeout(function() {
					NewTabs.forEach(function(LTab) {
						if (LTab.parent == LoadedGroup.group.id) {
							LTab.parent = NewGroupId;
						}
						if (NewFolders[LTab.parent]) {
							LTab.parent = NewFolders[LTab.parent].id;
						}
						if (RefsTabs[LTab.parent]) {
							LTab.parent = RefsTabs[LTab.parent];
						}
					});
					setTimeout(function() {
						RcreateTreeStructure({}, NewFolders, NewTabs);
					}, 1000);
					setTimeout(function() {
						RcreateTreeStructure({}, NewFolders, NewTabs);
					}, 2000);
					setTimeout(function() {
						RcreateTreeStructure({}, NewFolders, NewTabs);
					}, 5000);
				}, 2000);
			}
		});
	});
	
	if (opt.debug) {
		log("f: RecreateGroup");
	}
	
}


function ExportSession(name, save_to_file, save_to_manager, save_to_autosave_manager) {
	chrome.windows.getAll({ windowTypes: ['normal'], populate: true }, function(win) {
		 chrome.runtime.sendMessage({ command: "get_browser_tabs" }, function(t) {
				let tabs = Object.assign({}, t);
				chrome.runtime.sendMessage({ command: "get_windows" }, function(w) {
					let windows = Object.assign({}, w);
					let warn = true;
					let ExportWindows = [];
					win.forEach(function(CWin) {
						 if (CWin.tabs.length > 0) {
								windows[CWin.id]["id"] = CWin.id;
								windows[CWin.id]["tabs"] = [];
								CWin.tabs.forEach(function(CTab) {
									if ((CTab.url).startsWith("www") || (CTab.url).startsWith("http") || (CTab.url).startsWith("ftp")) {
										windows[CWin.id]["tabs"].push({ id: CTab.id, url: CTab.url, parent: tabs[CTab.id].parent, index: tabs[CTab.id].index, expand: tabs[CTab.id].expand });
									}
								});
								ExportWindows.push(windows[CWin.id]);
						}
					});
					if (save_to_file) {
						SaveFile(name, "tt_session", ExportWindows);
					}
					if (save_to_manager) {
						AddSessionToStorage(ExportWindows, name, true);
					}
					if (save_to_autosave_manager) {
						AddAutosaveSessionToStorage(ExportWindows, name)
					}

					if (opt.debug) {
						log("f: ExportSession, name: "+name+", save_to_file: "+save_to_file+", save_to_manager: "+save_to_manager+", save_to_autosave_manager: "+save_to_autosave_manager);
					}

				});
		});
	});
}

function ImportSession(recreate_session, save_to_manager, merge_session) {
	let file = document.getElementById("file_import");
	let fr = new FileReader();
	if (file.files[0] == undefined) return;
	fr.readAsText(file.files[file.files.length - 1]);

	fr.onload = function() {
		let data = fr.result;
		file.parentNode.removeChild(file);

		let LoadedSession = JSON.parse(data);

		if (opt.debug) {
			log("f: ImportSession, recreate_session: "+recreate_session+", merge_session: "+merge_session);
		}

		if (recreate_session) {
			RecreateSession(LoadedSession);
		}
		if (merge_session) {
			ImportMergeTabs(LoadedSession);
		}
		if (save_to_manager) {
			AddSessionToStorage(LoadedSession, (file.files[file.files.length - 1].name).replace(".tt_session", ""), true);
		}
	}
}

function AddSessionToStorage(session, name, add_to_manager) {
	chrome.storage.local.get(null, function(storage) {
		if (storage.saved_sessions == undefined) {
			let saved_sessions = [];
			saved_sessions.push({ name: name, session: session });
			chrome.storage.local.set({ saved_sessions: saved_sessions });
			if (add_to_manager) {
				AddSessionToManagerList(saved_sessions[saved_sessions.length - 1]);
			}
		} else {
			let saved_sessions = storage.saved_sessions;
			saved_sessions.push({ name: name, session: session });

			chrome.storage.local.set({ saved_sessions: saved_sessions });
			if (add_to_manager) {
				AddSessionToManagerList(saved_sessions[saved_sessions.length - 1]);
			}
		}

		if (opt.debug) {
			log("f: AddSessionToStorage, name: "+name+", add_to_manager: "+add_to_manager);
		}
	});

}

function AddAutosaveSessionToStorage(session, name) {
	chrome.storage.local.get(null, function(storage) {
		if (storage.saved_sessions_automatic == undefined) {
			let s = [];
			s.push({ name: name, session: session });
			chrome.storage.local.set({ saved_sessions_automatic: s });
		} else {
			let s = storage.saved_sessions_automatic;
			s.unshift({ name: name, session: session });
			if (s[opt.autosave_max_to_keep]) {
				s.splice(opt.autosave_max_to_keep, (s.length - opt.autosave_max_to_keep));
			}
			chrome.storage.local.set({ saved_sessions_automatic: s });
		}

		if (opt.debug) {
			log("f: AddAutosaveSessionToStorage, name: "+name);
		}
	});
}


function RecreateSession(LoadedSession) {
	let RefsTabs = {};

	if (opt.debug) {
		log("f: RecreateSession");
	}

	LoadedSession.forEach(function(LWin) {
		let NewTabs = [];
		let urls = [];
		(LWin.tabs).forEach(function(Tab) {
			urls.push(Tab.url);
			NewTabs.push(Tab);
		});

		chrome.windows.create({ url: urls   /* , discarded: true */ }, function(new_window) {
			chrome.runtime.sendMessage({command: "save_groups", windowId: new_window.id, groups: LWin.groups});
			chrome.runtime.sendMessage({command: "save_folders", windowId: new_window.id, folders: LWin.folders});
			
			for (let tInd = 0; tInd < new_window.tabs.length; tInd++) {
				RefsTabs[NewTabs[tInd].id] = new_window.tabs[tInd].id;
				NewTabs[tInd].id = new_window.tabs[tInd].id;
			}
			for (let tInd = 0; tInd < new_window.tabs.length; tInd++) {
				if (RefsTabs[NewTabs[tInd].parent] != undefined) {
					NewTabs[tInd].parent = RefsTabs[NewTabs[tInd].parent];
				}
			}
			for (let tInd = 0; tInd < new_window.tabs.length; tInd++) {
				if (NewTabs[tInd].parent == "pin_list") {
					chrome.tabs.update(new_window.tabs[tInd].id, { pinned: true });
				}
				chrome.runtime.sendMessage({command: "update_tab", tabId: new_window.tabs[tInd].id, tab: {index: NewTabs[tInd].index, expand: NewTabs[tInd].expand, parent: NewTabs[tInd].parent}});
	
				// if (browserId != "O") {
					// chrome.runtime.sendMessage({command: "discard_tab", tabId: new_window.tabs[tInd].id});
				// }
			}
			
			if (browserId != "O") {
				setTimeout(function() {
					chrome.runtime.sendMessage({command: "discard_window", windowId: new_window.id});
				}, urls.length * 300);
			}

		});
	});
}

// groups and folders are in object, just like tt.groups and tt.folders, but tabs are in array of treetabs objects
function RcreateTreeStructure(groups, folders, tabs) {
	if (opt.debug) {
		log("f: RcreateTreeStructure");
	}

	ShowStatusBar({show: true, spinner: true, message: "Quick check and recreating structure..."});
	if (groups && Object.keys(groups).length > 0) {
		for (var group in groups) {
			tt.groups[groups[group].id] = Object.assign({}, groups[group]);
		}
		AppendGroups(tt.groups);
	}
	if (folders && Object.keys(folders).length > 0) {
		for (var folder in folders) {
			tt.folders[folders[folder].id] = Object.assign({}, folders[folder]);
		}
		AppendFolders(tt.folders);
	}
	let bgtabs = {};
	tabs.forEach(function(Tab) {
		if (Tab.parent == "pin_list") {
			chrome.tabs.update(Tab.id, { pinned: true });
		}
		if (Tab.parent != "") {
			let tb = document.getElementById(Tab.id);
			let tbp = document.getElementById("ct" + Tab.parent);
			if (tb && tbp) {
				tbp.appendChild(tb);
				if (Tab.expand != "") {
					tb.classList.add(Tab.expand);
				}
			}
			bgtabs[Tab.id] = { index: Tab.index, parent: Tab.parent, expand: Tab.expand };
		}
	});
	RearrangeTreeTabs(bgtabs, false);
	RearrangeFolders(true);
	UpdateBgGroupsOrder();
	setTimeout(function() {
		RefreshExpandStates();
		RefreshCounters();
		tt.schedule_update_data++;
		SaveFolders();
	}, 3000);
	// ShowStatusBar({show: true, spinner: true, message: "Sorting"});
	// ShowStatusBar(false, "Wait just a little more...");
}

function ImportMergeTabs(LoadedSession) {
	if (opt.debug) {
		log("f: ImportMergeTabs");
	}
	let RefsWins = {};
	let RefsTabs = {};
	for (let LWI = 0; LWI < LoadedSession.length; LWI++) { // clear previous window ids
		LoadedSession[LWI].id = "";
	}
	ShowStatusBar({show: true, spinner: true, message: "Loaded Tree structure..."});
	chrome.windows.getAll({ windowTypes: ['normal'], populate: true }, function(cw) {
		for (let CWI = 0; CWI < cw.length; CWI++) { // Current Windows
		
			for (let LWI = 0; LWI < LoadedSession.length; LWI++) { // Loaded Windows
			
				if (LoadedSession[LWI].id == "") {
		
					let tabsMatch = 0;
					for (let CTI = 0; CTI < cw[CWI].tabs.length; CTI++) { // loop Tabs of CWI Window
						for (let LTI = 0; LTI < LoadedSession[LWI].tabs.length; LTI++) { // loop Tabs of Loaded Window
							if (cw[CWI].tabs[CTI].url == LoadedSession[LWI].tabs[LTI].url) {
								RefsTabs[LoadedSession[LWI].tabs[LTI].id] = cw[CWI].tabs[CTI].id;
								LoadedSession[LWI].tabs[LTI].id = cw[CWI].tabs[CTI].id;
								LoadedSession[LWI].tabs[LTI].url = "";
								tabsMatch++;
								break;
							}
						}
					}
					if (opt.debug) {
						log("f: ImportMergeTabs, tabsMatch: "+tabsMatch);
					}
					if (tabsMatch > LoadedSession[LWI].tabs.length * 0.6) {
						LoadedSession[LWI].id = cw[CWI].id;
						break;
					}
					
				}
			}
		}

		LoadedSession.forEach(function(w) {
			if (w.id == "") { // missing window, lets make one
				if (opt.debug) {
					log("f: ImportMergeTabs, missing window");
				}

				let NewTabs = [];
				let urls = [];
				(w.tabs).forEach(function(Tab) {
					urls.push(Tab.url);
					NewTabs.push(Tab);
				});
				chrome.windows.create({ url: urls }, function(new_window) {
					chrome.runtime.sendMessage({command: "save_groups", windowId: new_window.id, groups: w.groups});
					chrome.runtime.sendMessage({command: "save_folders", windowId: new_window.id, folders: w.folders});
					
					for (let tInd = 0; tInd < new_window.tabs.length; tInd++) {
						if (NewTabs[tInd]) {
							RefsTabs[NewTabs[tInd].id] = new_window.tabs[tInd].id;
							NewTabs[tInd].id = new_window.tabs[tInd].id;
						}
					}
					for (let tInd = 0; tInd < NewTabs.length; tInd++) {
						if (RefsTabs[NewTabs[tInd].parent] != undefined) {
							NewTabs[tInd].parent = RefsTabs[NewTabs[tInd].parent];
						}
					}

					for (let tInd = 0; tInd < new_window.tabs.length; tInd++) {
						if (NewTabs[tInd].parent == "pin_list") {
							chrome.tabs.update(new_window.tabs[tInd].id, { pinned: true });
						}
						chrome.runtime.sendMessage({command: "update_tab", tabId: new_window.tabs[tInd].id, tab: {index: NewTabs[tInd].index, expand: NewTabs[tInd].expand, parent: NewTabs[tInd].parent}});
					}
					

					let done = 3;
					var Append = setInterval(function() {
						chrome.runtime.sendMessage({command: "remote_update", groups: w.groups, folders: w.folders, tabs: NewTabs, windowId: w.id });
						if (done < 0) { clearInterval(Append); }
						done--;
					}, 2000);
				});
			} else { // window exists, lets add missing tabs
				let NewTabs = [];
				let RefsTabs = {};

				chrome.runtime.sendMessage({command: "get_folders", windowId: w.id}, function(f) {
					chrome.runtime.sendMessage({command: "get_groups", windowId: w.id}, function(g) {
						if (Object.keys(w.groups).length > 0) {
							for (var group in w.groups) {
								if (group != "" && group != "undefined" && w.groups[group] != undefined) {
									g[w.groups[group].id] = Object.assign({}, w.groups[group]);
								}
							}
						}
						if (Object.keys(w.folders).length > 0) {
							for (var folder in w.folders) {
								if (folder != "" && folder != "undefined" && w.folders[folder] != undefined) {
									w.folders[w.folders[folder].id] = Object.assign({}, w.folders[folder]);
								}
							}
						}
						
						if (Object.keys(g).length > 0) {
							for (var groupId in g) {
								w.groups[groupId] = Object.assign({}, g[groupId]);
							}
						}
						if (Object.keys(f).length > 0) {
							for (var folderId in f) {
								w.folders[folderId] = Object.assign({}, f[folderId]);
							}
						}

						chrome.runtime.sendMessage({command: "save_groups", windowId: w.id, groups: g});
						chrome.runtime.sendMessage({command: "save_folders", windowId: w.id, folders: f});
						chrome.runtime.sendMessage({ command: "remote_update", groups: w.groups, folders: w.folders, tabs: [], windowId: w.id });

						if (w.id == tt.CurrentWindowId) {
							RcreateTreeStructure(w.groups, w.folders, []);
						}

						(w.tabs).forEach(function(Tab) {
							if (Tab.url != "") { // missing tab, lets make one
								chrome.tabs.create({ url: Tab.url, pinned: (Tab.parent == "pin_list" ? true : false), windowId: w.id }, function(tab) {
									RefsTabs[Tab.id] = tab.id;
									Tab.id = tab.id;
									NewTabs.push(Tab);
									chrome.runtime.sendMessage({command: "update_tab", tabId: tab.id, tab: {index: Tab.index, expand: Tab.expand, parent: Tab.parent}});
								});
							} else {
								NewTabs.push(Tab);
							}
						});

						setTimeout(function() {
							ShowStatusBar({show: true, spinner: true, message: "Finding reference tabs..."});
							for (let tInd = 0; tInd < NewTabs.length; tInd++) {
								if (RefsTabs[NewTabs[tInd].parent] != undefined) {
									NewTabs[tInd].parent = RefsTabs[NewTabs[tInd].parent];
								}
							}
						}, 4000);
						
						setTimeout(function() {
							for (let tInd = 0; tInd < NewTabs.length; tInd++) {
								chrome.runtime.sendMessage({command: "update_tab", tabId: NewTabs[tInd].id, tab: {index: NewTabs[tInd].index, expand: NewTabs[tInd].expand, parent: NewTabs[tInd].parent}});
							}
							let done = 10;
							var Append = setInterval(function() {
								ShowStatusBar({show: true, spinner: true, message: "Finding other windows to add tabs..."});
								
								if (w.id == tt.CurrentWindowId) {
									RcreateTreeStructure(w.groups, w.folders, NewTabs);
								} else {
									chrome.runtime.sendMessage({command: "remote_update", groups: w.groups, folders: w.folders, tabs: NewTabs, windowId: w.id });
								}
								if (done < 0) {
									ShowStatusBar({show: true, spinner: false, message: "All done.", hideTimeout: 2000});
									clearInterval(Append);
								}
								done--;
							}, 500);
						}, 6000);

					});
				});

			}
		});
	});
}


function StartAutoSaveSession() {
	if (opt.autosave_interval > 0 && opt.autosave_max_to_keep > 0) {
		tt.AutoSaveSession = setInterval(function() {
			if (opt.debug) {
				log("f: AutoSaveSession, loop time is: "+opt.autosave_interval);
			}

			let d = new Date();
			let newName = d.toLocaleString().replace("/", ".").replace("/", ".").replace(":", "꞉").replace(":", "꞉");
			ExportSession(newName, false, false, true);
			
			ShowStatusBar({show: true, spinner: false, message: "Autosave: "+newName, hideTimeout: 1500});

			if (document.getElementById("manager_window").style.top != "-500px") {
				chrome.storage.local.get(null, function(storage) {
					ReAddSessionAutomaticToManagerList(storage);
				});
			}

		}, opt.autosave_interval * 60000);
	}
}