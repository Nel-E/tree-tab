// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function ExportGroup(filename) {
	if (opt.debug) {
		console.log("function: ExportGroup, filename "+filename);
	}
	let GroupToSave = { group: bggroups[active_group], folders: {}, tabs: [] };
	document.querySelectorAll("#"+active_group+" .folder").forEach(function(s){
		if (bgfolders[s.id]) {
			GroupToSave.folders[s.id] = bgfolders[s.id];
		}
	});
	let Tabs = document.querySelectorAll("#"+active_group+" .tab");
	if (Tabs.length > 0) {
		let lastId = parseInt(Tabs[Tabs.length-1].id);
		Tabs.forEach(function(s){
			chrome.tabs.get(parseInt(s.id), function(tab) {
				if ((tab.url).startsWith("www") || (tab.url).startsWith("http") || (tab.url).startsWith("ftp")) {
					(GroupToSave.tabs).push(
						{
							id: tab.id,
							parent: s.parentNode.parentNode.id,
							index: Array.from(s.parentNode.children).indexOf(s),
							expand: (s.classList.contains("c") ? "c" : (s.classList.contains("o") ? "o" : "")),
							url: tab.url
						}
					);
				}
				
				if (tab.id == lastId) {
					// if (opt.debug) {
						// console.log(GroupToSave);
					// }
					SaveFile(filename, GroupToSave);
				}
			});
		});
	}
}
function ImportGroup() {
	let file = document.getElementById("file_import_group");
	let fr = new FileReader();
	if (file.files[0] == undefined) return;
	fr.readAsText(file.files[0]);
	fr.onload = function() {
		let data = fr.result;
		file.parentNode.removeChild(file);
		let LoadedGroup = JSON.parse(data);
		let NewFolders = {};
		let RefsTabs = {};
		let NewTabs = [];
		let NewGroupId = AddNewGroup(LoadedGroup.group.name, LoadedGroup.group.font);
		SetActiveGroup(NewGroupId, false, false);
		for (var folder in LoadedGroup.folders) {
			let newId = GenerateNewFolderID();
			NewFolders[folder] =  { id: newId, parent: NewGroupId, index: (LoadedGroup.folders[folder].index), name: (LoadedGroup.folders[folder].name), expand: (LoadedGroup.folders[folder].expand) };
		}
		for (var folder in NewFolders) {
			if (NewFolders[LoadedGroup.folders[folder].parent]) {
				NewFolders[folder].parent = NewFolders[LoadedGroup.folders[folder].parent].id;
			}
		}
		(LoadedGroup.tabs).forEach(function(Tab){
			chrome.tabs.create({url: Tab.url, active: false}, function(new_tab) {
				if (new_tab) {
					RefsTabs[Tab.id] = new_tab.id;
					Tab.id = new_tab.id;
					NewTabs.push(Tab);
					setTimeout(function() {
						let nt = document.getElementById(new_tab.id);
						let NewGroupTabs = document.getElementById("ct"+NewGroupId);
						if (nt != null && NewGroupTabs != null) {
							NewGroupTabs.appendChild(nt);
						}
					}, 1000);
				}
				if (NewTabs.length == LoadedGroup.tabs.length-1) {
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
						RearrangeTreeStructure({}, NewFolders, NewTabs);
					}, 2000);
				}
			});
		});
	}	 
}
function ExportSession(filename) {
	chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {
		chrome.runtime.sendMessage({command: "get_browser_tabs"}, function(response) {
			let tabs = Object.assign({}, response);
			chrome.runtime.sendMessage({command: "get_windows"}, function(response) {
				let windows = Object.assign({}, response);
				let warn = true;
				let ExportWindows = [];
				w.forEach(function(CWin) {
					if (CWin.tabs.length > 0) {
						// if (CWin.tabs.length > 100 && warn) {
							// alert(chrome.i18n.getMessage("warning_exporting_big_amount_of_tabs"));
							// warn = false;
						// }
						windows[CWin.id]["id"] = CWin.id;
						windows[CWin.id]["tabs"] = [];
						CWin.tabs.forEach(function(CTab) {
							if ((CTab.url).startsWith("www") || (CTab.url).startsWith("http") || (CTab.url).startsWith("ftp")) {
								windows[CWin.id]["tabs"].push({id: CTab.id, url: CTab.url, parent: tabs[CTab.id].parent, index: tabs[CTab.id].index, expand: tabs[CTab.id].expand});
							}
						});
						ExportWindows.push(windows[CWin.id]);
					}
				});
				SaveFile(filename, ExportWindows);
			});
		});
	});
}
function ImportSession() {
	let file = document.getElementById("file_import_backup");
	let fr = new FileReader();
	if (file.files[0] == undefined) return;
	fr.readAsText(file.files[file.files.length-1]);
	fr.onload = function() {
		let data = fr.result;
		file.parentNode.removeChild(file);
		let LoadedWindows = JSON.parse(data);
		let RefsTabs = {};
		if (opt.debug) console.log(LoadedWindows);
		LoadedWindows.forEach(function(LWin) {
			let NewTabs = [];
			let urls = [];
			(LWin.tabs).forEach(function(Tab) {
				urls.push(Tab.url);
				NewTabs.push(Tab);
			});
			chrome.windows.create({url: urls}, function(new_window) {
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
					chrome.runtime.sendMessage({command: "remote_update", groups: LWin.groups, folders: LWin.folders, tabs: NewTabs, windowId: new_window.id}, function(response) {
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
}
function RearrangeTreeStructure(groups, folders, tabs) { // groups and folders are in object, just like bggroups and bgfolders, but tabs are in array of bgtreetabs objects
	if (opt.debug) console.log("function: RearrangeTreeStructure");
	chrome.tabs.query({currentWindow: true}, function(ChromeTabs) {
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
				chrome.tabs.update(Tab.id, {pinned: true});
			}
			let tb = document.getElementById(Tab.id);
			let tbp = document.getElementById("ct"+Tab.parent);
			if (tb != null && tbp != null) {
				tbp.appendChild(tb);
				if (Tab.expand != "") {
					tb.classList.add(Tab.expand);
				}
			}
			bgtabs[Tab.id] = {index: Tab.index, parent: Tab.parent, expand: Tab.expand};
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
function ImportMergeTabs() {
	if (opt.debug) console.log("function: ImportMergeTabs");
	let file = document.getElementById("file_import_merge_backup");
	let fr = new FileReader();
	if (file.files[0] == undefined) return;
	fr.readAsText(file.files[0]);
	fr.onload = function() {
		let data = fr.result;
		file.parentNode.removeChild(file);
		let lw = JSON.parse(data);
		let RefsWins = {};
		let RefsTabs = {};
		for (let LWI = 0; LWI < lw.length; LWI++) { // clear previous window ids
			lw[LWI].id = "";
		}
		if (opt.debug) console.log(lw);
		chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(cw) {
			for (let CWI = 0; CWI < cw.length; CWI++) { // loop Windows
				for (let LWI = 0; LWI < lw.length; LWI++) { // loop Loaded Windows
					let tabsMatch = 0;
					for (let CTI = 0; CTI < cw[CWI].tabs.length; CTI++) { // loop Tabs of each Current Window
						for (let LTI = 0; LTI < lw[LWI].tabs.length; LTI++) { // loop Tabs of each Loaded Window
							if (cw[CWI].tabs[CTI].url == lw[LWI].tabs[LTI].url) {
								RefsTabs[lw[LWI].tabs[LTI].id] = cw[CWI].tabs[CTI].id;
								lw[LWI].tabs[LTI].id = cw[CWI].tabs[CTI].id;
								lw[LWI].tabs[LTI].url = "";
								tabsMatch++;
								break;
							}
						}
					}
					if (opt.debug) console.log(tabsMatch);
					if (tabsMatch > lw[LWI].tabs.length*0.8) {
						lw[LWI].id = cw[CWI].id;
						break;
					}
				}
			}
			if (opt.debug) console.log(lw);
			lw.forEach(function(w) {
				if (w.id == "") { // missing window, lets make one
					if (opt.debug) console.log("missing window");
					let NewTabs = [];
					let urls = [];
					(w.tabs).forEach(function(Tab) {
						urls.push(Tab.url);
						NewTabs.push(Tab);
					});
					chrome.windows.create({url: urls}, function(new_window) {
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
							chrome.runtime.sendMessage({command: "remote_update", groups: w.groups, folders: w.folders, tabs: NewTabs, windowId: new_window.id}, function(response) {
								HaveResponse = response;
							});
							if (HaveResponse || GiveUp > 900) {
								clearInterval(Append);
							}
							GiveUp++;
						}, 2000);
					});
				}
				else
				{ // window exists, lets add missing tabs
					if (opt.debug) console.log("window exists");
					let NewTabs = [];
					(w.tabs).forEach(function(Tab) {
						if (Tab.url != "") { // missing tab, lets make one
							chrome.tabs.create({url: Tab.url, windowId: w.id}, function(tab) {
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
								chrome.runtime.sendMessage({command: "remote_update", groups: w.groups, folders: w.folders, tabs: NewTabs, windowId: w.id}, function(response) {
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
}