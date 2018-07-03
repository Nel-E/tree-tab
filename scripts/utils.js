// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


function RecheckFirefox() {
	chrome.tabs.query({pinned: false, currentWindow: true}, function(tabs) {
		if (tabs.length > 1) {
			let last_tabId = tabs[tabs.length-1].id;
			let p = [];
			let p_tt = [];
			let t_ref = {};
			let t_ind = 0;
			let ok = 0;
			let ti = 0;
			let tc = tabs.length;
			for (ti = 0; ti < tc; ti++) {
				let tabId = tabs[ti].id;
				p.push("");
				p_tt.push("");
				let t = Promise.resolve(browser.sessions.getTabValue(tabId, "TTdata")).then(function(TabData) {
					if (TabData != undefined) {
						t_ref[TabData.ttid] = tabs[t_ind].id;
						p_tt[t_ind] = TabData.parent_ttid;
						p[t_ind] = TabData.parent;
					}
					t_ind++;
					if (tabId == last_tabId) {
						let i = 0;
						for (i = 0; i < p.length; i++) {
							if (t_ref[p_tt[i]]) {
								p[i] = t_ref[p_tt[i]];
							}						
						}
						for (i = 0; i < p.length; i++) {
							let Tab = document.getElementById(tabs[i].id);
							if (Tab && p[i] == Tab.parentNode.parentNode.id) {
								ok++;
							}
						}
						if (ok < tabs.length*0.5) {
							if (opt.debug) {
								log("emergency reload");
							}
							chrome.storage.local.set({emergency_reload: true});
							chrome.runtime.sendMessage({command: "reload"});
							chrome.runtime.sendMessage({command: "reload_sidebar"});
							location.reload();
						} else {
							if (opt.debug) {
								log("f: RecheckFirefox, ok");
							}
						}
					}
				});
			}
		}
	});
}

function SavePreferences() {
	chrome.storage.local.set({preferences: opt});
	chrome.runtime.sendMessage({command: "reload_options", opt: opt});
}

function LoadDefaultPreferences() {
	opt = Object.assign({}, DefaultPreferences);
}

function ShowOpenFileDialog(extension) {
	let body = document.getElementById("body");
	let inp = document.createElement("input");
	inp.id = "file_import";
	inp.type = "file";
	inp.accept = extension;
	inp.style.display = "none";
	body.appendChild(inp);
	inp.click();
	return inp;
}

function SaveFile(filename, extension, data) {
	let file = new File([JSON.stringify(data)], filename+"."+extension, {type: "text/"+extension+";charset=utf-8"} );
	let body = document.getElementById("body");
	let savelink = document.createElement("a");
	savelink.href = URL.createObjectURL(file);
	savelink.fileSize = file.size;
	savelink.target = "_blank";
	savelink.style.display = "none";
	savelink.type = "file";
	savelink.download = filename+"."+extension;
	body.appendChild(savelink);
	setTimeout(function() {
		savelink.click();
		setTimeout(function() {
			savelink.parentNode.removeChild(savelink);
		}, 60000);
	}, 10);
}

function AppendToNode(Node, AppendNode) {
	if (Node != null && AppendNode != null) {
		AppendNode.appendChild(Node);
	}
}

function InsterBeforeNode(Node, BeforeNode) {
	if (Node != null && BeforeNode != null) {
		BeforeNode.parentNode.insertBefore(Node, BeforeNode);
	}
}

function InsterAfterNode(Node, AfterNode) {
	if (Node != null && AfterNode != null) {
		if (AfterNode.nextSibling != null) {
			AfterNode.parentNode.insertBefore(Node, AfterNode.nextSibling);
		} else {
			AfterNode.parentNode.appendChild(Node);
		}
	}
}

function HideRenameDialogs() {
	document.querySelectorAll(".edit_dialog").forEach(function(s){
		s.style.display = "none";
		s.style.top = "-500px";
		s.style.left = "-500px";
	});
}

function GetParentsByClass(Node, Class) {
	let Parents = [];
	let ParentNode = Node;
	while (ParentNode.parentNode != null) {
		if (ParentNode.parentNode.classList != undefined && ParentNode.parentNode.classList.contains(Class)) {
			Parents.push(ParentNode.parentNode);
		}
		ParentNode = ParentNode.parentNode;
	}
	return Parents;
}

function GetParentsBy2Classes(Node, ClassA, ClassB) {
	let Parents = [];
	let ParentNode = Node;
	while (ParentNode.parentNode != null) {
		if (ParentNode.parentNode.classList != undefined && ParentNode.parentNode.classList.contains(ClassA) && ParentNode.parentNode.classList.contains(ClassB)) {
			Parents.push(ParentNode.parentNode);
		}
		ParentNode = ParentNode.parentNode;
	}
	return Parents;
}

// color in format "rgb(r,g,b)" or simply "r,g,b" (can have spaces, but must contain "," between values)
function RGBtoHex(color){
	color = color.replace(/[rgb(]|\)|\s/g, ""); color = color.split(","); return color.map(function(v){ return ("0"+Math.min(Math.max(parseInt(v), 0), 255).toString(16)).slice(-2); }).join("");
}

function HexToRGB(hex, alpha){
	hex = hex.replace('#', '');
	let r = parseInt(hex.length == 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2), 16);
	let g = parseInt(hex.length == 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4), 16);
	let b = parseInt(hex.length == 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6), 16);
	if (alpha) { return 'rgba('+r+', '+g+', '+b+', '+alpha+')'; } else { return 'rgb('+r+', '+g+', '+b+')'; }
}

function GetSelectedFolders() {
	
	if (opt.debug) {
		log("f: GetSelectedFolders");
	}
	
	let res = {Folders: {}, FoldersSelected: [], TabsIds: [], TabsIdsParents: []};
	document.querySelectorAll("#"+tt.active_group+" .selected_folder").forEach(function(s){
		res.FoldersSelected.push(s.id);
		res.Folders[s.id] = Object.assign({}, tt.folders[s.id]);
		let Fchildren = document.querySelectorAll("#cf"+s.id+" .folder");
		Fchildren.forEach(function(fc){
			res.Folders[fc.id] = Object.assign({}, tt.folders[fc.id]);
		});
		let Tchildren = document.querySelectorAll("#ct"+s.id+" .tab");
		Tchildren.forEach(function(tc){
			res.TabsIds.push(parseInt(tc.id));
			res.TabsIdsParents.push(tc.parentNode.id);
		});
	});
	return res;
}

function GetSelectedTabs() {
	let res = {TabsIds: [], TabsIdsParents: [], TabsIdsSelected: []};
	document.querySelectorAll(".pin.selected_tab, #"+tt.active_group+" .selected_tab").forEach(function(s){
		res.TabsIds.push(parseInt(s.id));
		res.TabsIdsParents.push(s.parentNode.id);
		res.TabsIdsSelected.push(parseInt(s.id));
		let Tchildren = document.querySelectorAll("#ct"+s.id+" .tab");
		Tchildren.forEach(function(tc){
			res.TabsIds.push(parseInt(tc.id));
			res.TabsIdsParents.push(tc.parentNode.id);
		});
	});
	return res;
}


function FindTab(input) { // find and select tabs
	let ButtonFilterClear = document.getElementById("button_filter_clear");
	document.querySelectorAll(".filtered, .highlighted_search").forEach(function(s){
		s.classList.remove("filtered");
		s.classList.remove("selected_tab");
		s.classList.remove("selected_last");
		s.classList.remove("highlighted_search");
	})
	if (input.length == 0) {
		document.getElementById("filter_box").value = "";
		ButtonFilterClear.style.opacity = "0";
		ButtonFilterClear.title = "";
		return;
	} else {
		ButtonFilterClear.style.opacity = "1";
		ButtonFilterClear.title = labels.clear_filter;
	}
	tt.SearchIndex = 0;
	let FilterType = document.getElementById("button_filter_type");
	let searchUrl = FilterType.classList.contains("url");
	let searchTitle = FilterType.classList.contains("title");
	
	let query = {windowId: tt.CurrentWindowId, pinned: false};
	if (input == "*audible") {
		query = {windowId: tt.CurrentWindowId, discarded: false, audible: true,  muted: false, pinned: false};
	}
	if (input == "*muted") {
		query = {windowId: tt.CurrentWindowId, discarded: false, muted: true, pinned: false};
	}
	if (input == "*unloaded") {
		query = {windowId: tt.CurrentWindowId, discarded: true, pinned: false};
	}
	if (input == "*loaded") {
		query = {windowId: tt.CurrentWindowId, discarded: false, pinned: false};
	}
		
	chrome.tabs.query(query, function(tabs) {
		tabs.forEach(function(Tab) {
			if (input == "*audible" || input == "*muted" || input == "*unloaded" || input == "*loaded") {
				document.getElementById(Tab.id).classList.add("filtered");
				document.getElementById(Tab.id).classList.add("selected_tab");
			} else {
				if (searchUrl) {
					if (Tab.url.toLowerCase().match(input.toLowerCase())) {
						document.getElementById(Tab.id).classList.add("filtered");
						document.getElementById(Tab.id).classList.add("selected_tab");
					}
				}
				if (searchTitle) {
					if (Tab.title.toLowerCase().match(input.toLowerCase())) {
						document.getElementById(Tab.id).classList.add("filtered");
						document.getElementById(Tab.id).classList.add("selected_tab");
					}
				}
			}
		});
	});
}

function Bookmark(rootNode) {
	let ToolbarId = browserId == "F" ? "toolbar_____" : "1";
	chrome.bookmarks.get(ToolbarId, function(list) {
		chrome.bookmarks.search("TreeTabs", function(list) {
			let TreeTabsId;
			for (var elem in list) {
				if (list[elem].parentId == ToolbarId) {
					TreeTabsId = list[elem].id;
					break;
				}
			}
			if (TreeTabsId == undefined) {
				chrome.bookmarks.create({parentId: ToolbarId, title: "TreeTabs"}, function(TreeTabsNew) {
					TreeTabsId = TreeTabsNew.id;
				});
				Bookmark(rootNode);
				return;
			} else {
				if (rootNode.classList.contains("tab")) {
					chrome.tabs.get(parseInt(rootNode.id), function(tab) {
						if (tab) {
							chrome.bookmarks.create({parentId: TreeTabsId, title: tab.title}, function(root) {
								document.querySelectorAll("[id='"+rootNode.id+"'], [id='"+rootNode.id+"'] .tab").forEach(function(s){
									chrome.tabs.get(parseInt(s.id), function(tab){
										if (tab) {
											chrome.bookmarks.create({parentId: root.id, title: tab.title, url: tab.url });
										}
									});
								});
							});
						}
					});
				}
				
				if (rootNode.classList.contains("folder") || rootNode.classList.contains("group")) {
					let rootName = labels.noname_group;
					if (rootNode.classList.contains("folder") && tt.folders[rootNode.id]) {
						rootName = tt.folders[rootNode.id].name;
					}
					if (rootNode.classList.contains("group") && tt.groups[rootNode.id]) {
						rootName = tt.groups[rootNode.id].name;
					}

					chrome.bookmarks.create({parentId: TreeTabsId, title: rootName}, function(root) {
						let foldersRefs = {};
						
						let folders = document.querySelectorAll("#cf"+rootNode.id+" .folder");
						folders.forEach(function(s){
							if (tt.folders[s.id]) {
								let ttId = s.id;
								chrome.bookmarks.create({parentId: root.id, title: tt.folders[ttId].name}, function(Bkfolder) {
									foldersRefs[ttId] = {ttid: ttId, id: Bkfolder.id, ttparent: tt.folders[ttId].parent, parent: root.id};
									
									let elemInd = 0;
									if (ttId == folders[folders.length-1].id) {
										for (var elem in foldersRefs) {
											let FolderTTId = foldersRefs[elem].ttid;
											let BookmarkFolderId = foldersRefs[elem].id;
											let TTParentId = foldersRefs[elem].ttparent;
											if (foldersRefs[TTParentId]) {
												foldersRefs[FolderTTId].parent = foldersRefs[TTParentId].id;
											}
											
											elemInd++;
											
											if (elemInd == Object.keys(foldersRefs).length) {
												elemInd = 0;
												for (var elem in foldersRefs) {
													let BookmarkFolderId = foldersRefs[elem].id;
													let BookmarkFolderParentId = foldersRefs[elem].parent;
													chrome.bookmarks.move(BookmarkFolderId, {parentId: BookmarkFolderParentId}, function(BkFinalfolder) {
														document.querySelectorAll("#ct"+foldersRefs[elem].ttid+" .tab").forEach(function(s){
															chrome.tabs.get(parseInt(s.id), function(tab){
																if (tab) {
																	chrome.bookmarks.create({parentId: BkFinalfolder.id, title: tab.title, url: tab.url });
																}
															});
														});
														
														elemInd++;
														
													});
												}
											}
										}
									}
								});
							}
						});
						
						document.querySelectorAll("#ct"+rootNode.id+" .tab").forEach(function(s){
							chrome.tabs.get(parseInt(s.id), function(tab){
								if (tab) {
									chrome.bookmarks.create({parentId: root.id, title: tab.title, url: tab.url });
								}
							});
						});															
						
					});
				}
			}
		});
	});
}

function ShowStatusBar(p) { // show, spinner, message
	let status_bar = document.getElementById("status_bar");
	let busy_spinner = document.getElementById("busy_spinner");
	let status_message = document.getElementById("status_message");
	if (p.show) {
		status_bar.style.display = "block";
		status_message.textContent = p.message;
		if (p.spinner) {
			busy_spinner.style.opacity = "1";
		} else {
			busy_spinner.style.opacity = "0";
		}
	} else {
		busy_spinner.style.opacity = "0";
		status_message.textContent = "";
		status_bar.style.display = "none";
	}
	if (p.hideTimeout) {
		setTimeout(function() {
			busy_spinner.style.opacity = "0";
			status_message.textContent = "";
			status_bar.style.display = "none";
		}, p.hideTimeout);
	}
}

function log(log) {
	if (opt.debug) {
		chrome.runtime.sendMessage({command: "debug", log: log});
	}
}