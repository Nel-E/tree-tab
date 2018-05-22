// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function ExportGroup(groupId, filename, save_to_manager) {
	let GroupToSave = { group: bggroups[groupId], folders: {}, tabs: [] };
	document.querySelectorAll("#" + groupId + " .folder").forEach(function(s) {
		if (bgfolders[s.id]) {
			GroupToSave.folders[s.id] = bgfolders[s.id];
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
			// log("f: AddGroupToStorage, group: "+JSON.stringify(group)+", add_to_manager: "+add_to_manager);
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
						RearrangeTreeStructure({}, NewFolders, NewTabs);
					}, 1000);
					setTimeout(function() {
						RearrangeTreeStructure({}, NewFolders, NewTabs);
					}, 2000);
					setTimeout(function() {
						RearrangeTreeStructure({}, NewFolders, NewTabs);
					}, 5000);
				}, 2000);
			}
		});
	});
	
	if (opt.debug) {
		// log("f: RecreateGroup, LoadedGroup: "+JSON.stringify(LoadedGroup)+", NewFolders: "+JSON.stringify(NewFolders)+", NewTabs: "+JSON.stringify(NewTabs));
		log("f: RecreateGroup");
	}
	
}


function ExportSession(name, save_to_file, save_to_manager, save_to_autosave_manager) {
	chrome.windows.getAll({ windowTypes: ['normal'], populate: true }, function(w) {
		 chrome.runtime.sendMessage({ command: "get_browser_tabs" }, function(response) {
				let tabs = Object.assign({}, response);
				chrome.runtime.sendMessage({ command: "get_windows" }, function(response) {
					let windows = Object.assign({}, response);
					let warn = true;
					let ExportWindows = [];
					w.forEach(function(CWin) {
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
						// log("f: ExportSession, name: "+name+", session: "+JSON.stringify(ExportWindows)+", save_to_file: "+save_to_file+", save_to_manager: "+save_to_manager+", save_to_autosave_manager: "+save_to_autosave_manager);
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
			// log("f: ImportSession, session: "+data+", recreate_session: "+recreate_session+", merge_session: "+merge_session);
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
			// log("f: AddSessionToStorage, name: "+name+", add_to_manager: "+add_to_manager+", session: "+JSON.stringify(session));
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
			// log("f: AddAutosaveSessionToStorage, name: "+name+", session: "+JSON.stringify(session));
			log("f: AddAutosaveSessionToStorage, name: "+name);
		}
	});
}



function RecreateSession(LoadedSession) {
	let RefsTabs = {};

	if (opt.debug) {
		// log("f: RecreateSession, session: "+JSON.stringify(LoadedSession));
		log("f: RecreateSession");
	}

	LoadedSession.forEach(function(LWin) {
		let NewTabs = [];
		let urls = [];
		(LWin.tabs).forEach(function(Tab) {
				urls.push(Tab.url);
				NewTabs.push(Tab);
		});
		chrome.windows.create({ url: urls }, function(new_window) {
				for (let tInd = 0; tInd < new_window.tabs.length; tInd++) {
					RefsTabs[NewTabs[tInd].id] = new_window.tabs[tInd].id;
					NewTabs[tInd].id = new_window.tabs[tInd].id;
				}
				for (let tInd = 0; tInd < new_window.tabs.length; tInd++) {
					if (RefsTabs[NewTabs[tInd].parent] != undefined) {
						NewTabs[tInd].parent = RefsTabs[NewTabs[tInd].parent];
					}
				}
				let HaveResponse;
				let GiveUp = 0;
				var Append = setInterval(function() {
					chrome.runtime.sendMessage({ command: "remote_update", groups: LWin.groups, folders: LWin.folders, tabs: NewTabs, windowId: new_window.id }, function(response) {
						HaveResponse = response;
					});
					if (HaveResponse || GiveUp > 900) {
						clearInterval(Append);
					}
					GiveUp++;
				}, 2000);
		});
	});
}


function RearrangeTreeStructure(groups, folders, tabs) { // groups and folders are in object, just like bggroups and bgfolders, but tabs are in array of bgtreetabs objects
	if (opt.debug) {
		log("f: RearrangeTreeStructure");
	}

	chrome.tabs.query({ currentWindow: true }, function(ChromeTabs) {
		if (groups && Object.keys(groups).length > 0) {
			for (var group in groups) {
				bggroups[groups[group].id] = Object.assign({}, groups[group]);
			}
			AppendGroups(bggroups);
		}
		if (folders && Object.keys(folders).length > 0) {
			for (var folder in folders) {
				bgfolders[folders[folder].id] = Object.assign({}, folders[folder]);
			}
			AppendFolders(bgfolders);
		}
		let bgtabs = {};
		tabs.forEach(function(Tab) {
			if (Tab.parent == "pin_list") {
				chrome.tabs.update(Tab.id, { pinned: true });
			}
			let tb = document.getElementById(Tab.id);
			let tbp = document.getElementById("ct" + Tab.parent);
			if (tb != null && tbp != null) {
				tbp.appendChild(tb);
				if (Tab.expand != "") {
					tb.classList.add(Tab.expand);
				}
			}
			bgtabs[Tab.id] = { index: Tab.index, parent: Tab.parent, expand: Tab.expand };
		});
		RearrangeTreeTabs(ChromeTabs, bgtabs, true);
		RearrangeFolders(true);
		UpdateBgGroupsOrder();
		setTimeout(function() {
			RefreshExpandStates();
			RefreshCounters();
			schedule_update_data++;
			SaveFolders();
		}, 1000);
	});
}

function ImportMergeTabs(LoadedSession) {
	if (opt.debug) {
		// log("f: ImportMergeTabs, session: "+JSON.stringify(LoadedSession));
		log("f: ImportMergeTabs");
	}
	let RefsWins = {};
	let RefsTabs = {};
	for (let LWI = 0; LWI < LoadedSession.length; LWI++) { // clear previous window ids
		LoadedSession[LWI].id = "";
	}
	chrome.windows.getAll({ windowTypes: ['normal'], populate: true }, function(cw) {
		for (let CWI = 0; CWI < cw.length; CWI++) { // loop Windows
			for (let LWI = 0; LWI < LoadedSession.length; LWI++) { // loop Loaded Windows
				let tabsMatch = 0;
				for (let CTI = 0; CTI < cw[CWI].tabs.length; CTI++) { // loop Tabs of each Current Window
					for (let LTI = 0; LTI < LoadedSession[LWI].tabs.length; LTI++) { // loop Tabs of each Loaded Window
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
					for (let tInd = 0; tInd < new_window.tabs.length; tInd++) {
						RefsTabs[NewTabs[tInd].id] = new_window.tabs[tInd].id;
						NewTabs[tInd].id = new_window.tabs[tInd].id;
					}
					for (let tInd = 0; tInd < new_window.tabs.length; tInd++) {
						if (RefsTabs[NewTabs[tInd].parent] != undefined) {
							NewTabs[tInd].parent = RefsTabs[NewTabs[tInd].parent];
						}
					}
					let HaveResponse;
					let GiveUp = 0;
					var Append = setInterval(function() {
						chrome.runtime.sendMessage({ command: "remote_update", groups: w.groups, folders: w.folders, tabs: NewTabs, windowId: new_window.id }, function(response) {
							HaveResponse = response;
						});
						if (HaveResponse || GiveUp > 900) {
							clearInterval(Append);
						}
						GiveUp++;
					}, 2000);
				});
			} else { // window exists, lets add missing tabs
				if (opt.debug) {
					log("f: ImportMergeTabs, window exists");
				}

				let NewTabs = [];
				(w.tabs).forEach(function(Tab) {
					if (Tab.url != "") { // missing tab, lets make one
						chrome.tabs.create({ url: Tab.url, windowId: w.id }, function(tab) {
							Tab.id = tab.id;
							RefsTabs[tab.id] = tab.id;
							NewTabs.push(Tab);
						});
					} else {
						NewTabs.push(Tab);
					}
				});
				setTimeout(function() {
					for (let tInd = 0; tInd < NewTabs.length; tInd++) {
						if (RefsTabs[NewTabs[tInd].parent] != undefined) {
							NewTabs[tInd].parent = RefsTabs[NewTabs[tInd].parent];
						}
					}
				}, 4000);
				setTimeout(function() {
					if (w.id == CurrentWindowId) {
						RearrangeTreeStructure(w.groups, w.folders, NewTabs);
					} else {
						let HaveResponse;
						let GiveUp = 0;
						var Append = setInterval(function() {
							chrome.runtime.sendMessage({ command: "remote_update", groups: w.groups, folders: w.folders, tabs: NewTabs, windowId: w.id }, function(response) {
								HaveResponse = response;
							});
							if (HaveResponse || GiveUp > 900) {
								clearInterval(Append);
							}
							GiveUp++;
						}, 2000);
					}
				}, 6000);
			}
		});
	});
}


function StartAutoSaveSession() {
	if (opt.autosave_interval > 0 && opt.autosave_max_to_keep > 0) {
		AutoSaveSession = setInterval(function() {
			if (opt.debug) {
				log("f: AutoSaveSession, loop time is: "+opt.autosave_interval);
			}

			let d = new Date();
			ExportSession((d.toLocaleString().replace("/", ".").replace("/", ".").replace(":", "꞉").replace(":", "꞉")), false, false, true);

			if (document.getElementById("manager_window").style.top != "-500px") {
				chrome.storage.local.get(null, function(storage) {
					ReAddSessionAutomaticToManagerList(storage);
				});
			}

		}, opt.autosave_interval * 60000);
	}
}