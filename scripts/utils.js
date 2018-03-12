// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


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


function GetSelectedFolders() {
	if (opt.debug) console.log("function: GetSelectedFolders");
	let res = {Folders: {}, FoldersSelected: [], TabsIds: [], TabsIdsParents: []};
	document.querySelectorAll("#"+active_group+" .selected_folder").forEach(function(s){
		res.FoldersSelected.push(s.id);
		res.Folders[s.id] = Object.assign({}, bgfolders[s.id]);
		let Fchildren = document.querySelectorAll("#cf"+s.id+" .folder");
		Fchildren.forEach(function(fc){
			res.Folders[fc.id] = Object.assign({}, bgfolders[fc.id]);
		});
		let Tchildren = document.querySelectorAll("#ct"+s.id+" .tab");
		Tchildren.forEach(function(tc){
			res.TabsIds.push(parseInt(tc.id));
			res.TabsIdsParents.push(tc.parentNode.id);
		});
	});
	if (opt.debug) console.log(res);
	return res;
}

function GetSelectedTabs() {
	if (opt.debug) console.log("function: GetSelectedTabs");
	// let res = {urls: [], TabsIds: [], TabsIdsParents: [], TabsIdsSelected: []};
	let res = {TabsIds: [], TabsIdsParents: [], TabsIdsSelected: []};
	document.querySelectorAll(".pin.selected_tab, #"+active_group+" .selected_tab").forEach(function(s){
		// chrome.tabs.get(parseInt(s.id), function(tab) {
			// res.urls.push(tab.url);
		// });
		
		res.TabsIds.push(parseInt(s.id));
		res.TabsIdsParents.push(s.parentNode.id);
		res.TabsIdsSelected.push(parseInt(s.id));
		let Tchildren = document.querySelectorAll("#ct"+s.id+" .tab");
		Tchildren.forEach(function(tc){
			
			// chrome.tabs.get(parseInt(tc.id), function(tab) {
				// res.urls.push(tab.url);
			// });
			
			res.TabsIds.push(parseInt(tc.id));
			res.TabsIdsParents.push(tc.parentNode.id);
		});
	});
	if (opt.debug) console.log(res);
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
		ButtonFilterClear.title = caption_clear_filter;
	}
	SearchIndex = 0;
	let FilterType = document.getElementById("button_filter_type");
	let searchUrl = FilterType.classList.contains("url");
	let searchTitle = FilterType.classList.contains("title");
	chrome.tabs.query({windowId: CurrentWindowId, pinned: false}, function(tabs) {
		tabs.forEach(function(Tab) {
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
		});
	});
}
// sort tabs main function
// function SortTabs() {
	// if ($(".tab").find(":visible:first")[0]){
		// chrome.tabs.query({windowId: vt.windowId}, function(tabs){
			// tabs.sort(function(tab_a, tab_b){
				// return SplitUrl(tab_a).localeCompare(     SplitUrl(tab_b)      );
			// });
			// var first_tabId;
			// if ($(".selected:visible")[0]){
				// first_tabId = parseInt($(".selected:visible")[0].id);
			// } else {
				// first_tabId = parseInt($(".tab").find(":visible:first")[0].parentNode.id);
			// }
			// chrome.tabs.get(first_tabId, function(tab){
				// var new_index = tab.index;
				// tabs.forEach(function(Tab){
					// // sort selected when more than 1 tab is selected
					// if (($(".selected:visible").length > 1 && $("#"+Tab.id).is(":visible") && !Tab.pinned && $("#"+Tab.id).is(".selected")) || ($(".selected:visible").length < 2 && $("#"+Tab.id).is(":visible") && !Tab.pinned)){
						// chrome.tabs.move(Tab.id, {"index": new_index});
						// new_index++;
					// }
				// });
			// });
			// if (bg.opt.scroll_to_active){
				// setTimeout(function(){
					// ScrollTabList($(".active:visible")[0].id);
				// },1000);
			// }
		// }); 
	// }
// }

// sort tabs sub function
// function SplitUrl(tab) {
	// var tmp_url = new URL(tab.url);
	// if (tmp_url.protocol != "http:"){
		// tmp_url.protocol == "http:";
	// }
	// var url_parts = [];
	// if (tab.pinned){
		// url_parts.push("#"+tab.index);
	// } else {
		// url_parts.push("~");
	// }
	// var parts = tmp_url.host.split(".");
	// parts.reverse();
	// if (parts.length > 1){
		// parts = parts.slice(1);
	// }
	// parts.join(".");
	// url_parts.push(parts);
	// url_parts.push(tab.title.toLowerCase());
	// return url_parts.join(" ! ");
// }

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
					let rootName = caption_noname_group;
					if (rootNode.classList.contains("folder") && bgfolders[rootNode.id]) {
						rootName = bgfolders[rootNode.id].name;
					}
					if (rootNode.classList.contains("group") && bggroups[rootNode.id]) {
						rootName = bggroups[rootNode.id].name;
					}

					chrome.bookmarks.create({parentId: TreeTabsId, title: rootName}, function(root) {
						let foldersRefs = {};
						
						let folders = document.querySelectorAll("#cf"+rootNode.id+" .folder");
						folders.forEach(function(s){
							if (bgfolders[s.id]) {
								let ttId = s.id;
								chrome.bookmarks.create({parentId: root.id, title: bgfolders[ttId].name}, function(Bkfolder) {
									foldersRefs[ttId] = {ttid: ttId, id: Bkfolder.id, ttparent: bgfolders[ttId].parent, parent: root.id};
									
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