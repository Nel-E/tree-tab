// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function AddNewFolder(p) { // folderId: string, ParentId: string, Name: string, Index: int, ExpandState: ("o","c"), AdditionalClass: string, SetEvents: bool
	let newId = p.folderId ? p.folderId : GenerateNewFolderID();
	tt.folders[newId] = { id: newId, parent: (p.ParentId ? p.ParentId : ""), index: (p.Index ? p.Index : 0), name: (p.Name ? p.Name : labels.noname_group), expand: (p.ExpandState ? p.ExpandState : "") };
	AppendFolder({folderId: newId, Name: labels.noname_group, ParentId: p.ParentId, ExpandState: p.ExpandState, SkipSetEvents: p.SkipSetEvents, AdditionalClass: p.AdditionalClass});
	SaveFolders();
	RefreshCounters();
	RefreshExpandStates();
	return newId;
}

function AppendFolder(p) { // folderId: string, ParentId: string, Name: string, ExpandState: ("o","c"), AdditionalClass: string, SetEvents: bool
	let ClassList = "folder";
	if (p.ExpandState) {
		ClassList += " "+p.ExpandState;
	}
	if (p.AdditionalClass != undefined) {
		ClassList += " "+p.AdditionalClass;
	}

	if (document.getElementById(p.folderId) == null) {
		let DIVF = document.createElement("div"); // FOLDER DIV
			DIVF.className = ClassList;
			DIVF.id = p.folderId;

		let DIVF_header = document.createElement("div"); // HEADER
			DIVF_header.className = (opt.always_show_close && !opt.never_show_close) ? "folder_header close_show" : "folder_header";
			DIVF_header.id = p.folderId+"_folder_header";
			DIVF_header.draggable = !p.SkipSetEvents ? true : false;
			DIVF.appendChild(DIVF_header);

		let DIVF_expand = document.createElement("div"); // EXPAND BOX
			DIVF_expand.className = "folder_icon";
			DIVF_expand.id = p.folderId+"_folder_expand";
			DIVF_header.appendChild(DIVF_expand);
			
		let DIVF_counter = document.createElement("div"); // TABS COUNTER
			DIVF_counter.className = "folder_counter";
			DIVF_counter.id = p.folderId+"_folder_counter";
			DIVF_header.appendChild(DIVF_counter);
			
		let DIVF_counter_number = document.createElement("div"); // TABS COUNTER NUMBER
			DIVF_counter_number.className = "counter_number";
			DIVF_counter_number.id = p.folderId+"_folder_counter_number";
			DIVF_counter.appendChild(DIVF_counter_number);
			
		let DIVF_title = document.createElement("div"); // TITLE
			DIVF_title.className = "folder_title";
			DIVF_title.id = p.folderId+"_folder_title";
			DIVF_title.textContent = p.Name;
			DIVF_header.appendChild(DIVF_title);
		
		let DIVF_children = document.createElement("div"); // CHILDREN HOLDER
			DIVF_children.className = "children";
			DIVF_children.id = "°"+p.folderId;
			DIVF.appendChild(DIVF_children);
		
		let DIVF_drop_indicator = document.createElement("div"); // DROP TARGET INDICATOR
			DIVF_drop_indicator.className = "drag_indicator";
			DIVF_drop_indicator.id = p.folderId+"_drag_indicator";
			DIVF.appendChild(DIVF_drop_indicator);
		
		let DIVF_close_button = document.createElement("div"); // CLOSE BUTTON
			DIVF_close_button.className = "close";
			DIVF_close_button.id = "close"+p.folderId;
			DIVF_header.appendChild(DIVF_close_button);

		let DIVF_close_image = document.createElement("div"); // CLOSE IMAGE IN CLOSE BUTTON
			DIVF_close_image.className = "close_img";
			DIVF_close_image.id = "close_img"+p.folderId;
			DIVF_close_button.appendChild(DIVF_close_image);
				
		if (opt.never_show_close) {
			DIVF_close_button.classList.add("hidden");
			DIVF_close_image.classList.add("hidden");
		}
		
		if (!p.SkipSetEvents) {
			
			DIVF_children.ondblclick = function(event) {
				if (event.target == this) {
					ActionClickGroup(this.parentNode, opt.dbclick_group);
				}
			}

			DIVF_children.onclick = function(event) {
				if (event.target == this && event.which == 1) {
					Deselect();
				}
			}
			
			DIVF_children.onmousedown = function(event) {
				event.stopImmediatePropagation();
				if (event.target == this) {
					if (event.which == 2 && event.target == this) {
						ActionClickGroup(this.parentNode, opt.midclick_group);
					}
					if (event.which == 3) {
						ShowFGlobalMenu(event);
					}
				}
			}

			if (!opt.never_show_close) {
				DIVF_close_button.onmousedown = function(event) {
					event.stopImmediatePropagation();
					if (event.which != 3) {
						RemoveFolder(this.parentNode.parentNode.id);
					}
				}
				DIVF_close_button.onmouseenter = function(event) {
					this.classList.add("close_hover");
				}
				DIVF_close_button.onmouseleave = function(event) {
					this.classList.remove("close_hover");
				}
			}

			DIVF_header.onclick = function(event) {
				if (event.which == 1 && !event.shiftKey) { // SELECT FOLDER
					if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target.classList.contains("folder_header")) {
						Deselect();
					}
				}
			}

			DIVF_header.onmousedown = function(event) {
				event.stopImmediatePropagation();
				if (document.getElementById("main_menu").style.top != "-1000px") {
					HideMenus();
				}
				if (event.which == 1) {
					Select(event, this.parentNode);
				}
				if (event.which == 2) {
					event.preventDefault();
					ActionClickFolder(this.parentNode, opt.midclick_folder);
				}
				
				if (event.which == 3) { // SHOW FOLDER MENU
					ShowFolderMenu(this.parentNode, event);
				}
			}
			

			DIVF_header.ondblclick = function(event) { // edit folder
				if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target.classList.contains("folder_header")) {
					ActionClickFolder(this.parentNode, opt.dbclick_folder);
				}
			}

			DIVF_header.ondragstart = function(event) { // DRAG START
				FolderStartDrag(this, event);
			}
			DIVF_header.ondragenter = function(event) {
				this.classList.remove("folder_header_hover");
			}		
			DIVF_header.onmouseover = function(event) {
				this.classList.add("folder_header_hover");
				if (opt.never_show_close == false && opt.always_show_close == false) {
					this.classList.add("close_show");
				}
			}
			DIVF_header.onmouseleave = function(event) {
				this.classList.remove("folder_header_hover");
				if (opt.never_show_close == false && opt.always_show_close == false) {
					this.classList.remove("close_show");
				}
			}
			
			DIVF_header.ondragleave = function(event) {
				RemoveHighlight();
			}
			
			DIVF_header.ondragover = function(event) {
				
				
				// DragOverTreeNode(this, "folder", event);
				if (tt.DraggingGroup == false && this.parentNode.classList.contains("dragged_tree") == false) {
					DragOverFolder(this, event);
				}
				
				if (opt.open_tree_on_hover && tt.DragOverId != this.id) {
					if (this.parentNode.classList.contains("c") && this.parentNode.classList.contains("dragged_tree") == false) {
						clearTimeout(tt.DragOverTimer);
						tt.DragOverId = this.id;
						let This = this;
						tt.DragOverTimer = setTimeout(function() {
							if (tt.DragOverId == This.id) {
								This.parentNode.classList.add("o");
								This.parentNode.classList.remove("c");
							}
						}, 1500);	
					}
				}
			}
			
			DIVF_expand.onmousedown = function(event) {
				event.stopPropagation();
				if (document.getElementById("main_menu").style.top != "-1000px") {
					HideMenus();
				}
				
				if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target == this) { // EXPAND/COLLAPSE FOLDER
					event.stopPropagation();
					EventExpandBox(this.parentNode.parentNode);
					RefreshExpandStates();
					RefreshCounters();
				}
			}
		}
		
		if (p.ParentId == "pin_list" || p.ParentId == "" || p.ParentId == undefined || document.getElementById("°"+p.ParentId) == null) {
			document.getElementById("°"+tt.active_group).appendChild(DIVF);
		} else {
			document.getElementById("°"+p.ParentId).appendChild(DIVF);
		}
		
	}
}

function GenerateNewFolderID() {
	let newID = "";
	while (newID == "") {
		newID = "f_"+GenerateRandomID();
		if (document.getElementById(newID) != null) {
			newID = "";
		}
	}
	return newID;	
}

function PreAppendFolders(Folders) {
	for (let folderId in Folders) {
		AppendFolder({folderId: folderId, Name: Folders[folderId].name, ParentId: "tab_list", ExpandState: Folders[folderId].expand});
	}
}

function AppendFolders(Folders) {
	// for (let folderId in Folders) {
		// AppendFolder({folderId: folderId, Name: Folders[folderId].name, ParentId: Folders[folderId].parent, ExpandState: Folders[folderId].expand});
	// }
	for (let folderId in Folders) {
		let f = document.getElementById(folderId);
		let parent = document.getElementById("°"+Folders[folderId].parent);
		if (f != null && parent != null && Folders[folderId].parent != f.parentNode.parentNode.id && parent.parentNode.classList.contains("pin") == false) {
			parent.appendChild(f);
		}
	}
}

function SaveFolders() {
	document.querySelectorAll(".folder").forEach(function(s) {
		tt.folders[s.id].parent = s.parentNode.parentNode.id;
		tt.folders[s.id].index = Array.from(s.parentNode.children).indexOf(s);
		tt.folders[s.id].expand = (s.classList.contains("c") ? "c" : (s.classList.contains("o") ? "o" : ""));
	});
	chrome.runtime.sendMessage({command: "save_folders", folders: tt.folders, windowId: tt.CurrentWindowId});
}

function RemoveFolder(FolderId) {
	if (opt.debug) {
		log("f: RemoveFolder, folderId "+FolderId);
	}
	let folder = document.getElementById(FolderId);
	if (folder != null) {
		if (opt.promote_children == true) {
			if (opt.promote_children_in_first_child == true && folder.childNodes[1].childNodes.length > 1) {
				PromoteChildrenToFirstChild(folder);
			} else {
				let Children = folder.childNodes[1];
				while (Children.lastChild) {
					InsterAfterNode(Children.lastChild, folder);
				}
			}
		} else {
			document.querySelectorAll("#"+FolderId+" .tab").forEach(function(s) {
				chrome.tabs.remove(parseInt(s.id), null);
			});
			document.querySelectorAll("#"+FolderId+" .folder").forEach(function(s) {
				delete tt.folders[s.id];
			});
		}
		folder.parentNode.removeChild(folder);	
		delete tt.folders[FolderId];
		RefreshExpandStates();
		chrome.runtime.sendMessage({command: "save_folders", folders: tt.folders, windowId: tt.CurrentWindowId});
	}
}


function ShowRenameFolderDialog(FolderId) { // Rename folder popup
	if (opt.debug) {
		log("f: ShowRenameFolderDialog, folderId "+FolderId);
	}
	HideRenameDialogs();
	if (tt.folders[FolderId]) {
		let name = document.getElementById("folder_edit_name");
		name.value = tt.folders[FolderId].name;
		let folderEditDialog = document.getElementById("folder_edit");
		folderEditDialog.setAttribute("FolderId", FolderId);
		folderEditDialog.style.display = "block";
		folderEditDialog.style.top = document.getElementById("toolbar").getBoundingClientRect().height + document.getElementById("pin_list").getBoundingClientRect().height + 8 + "px";
		// folderEditDialog.style.left = "22px";
		folderEditDialog.style.left = "";
		setTimeout(function() {
			document.getElementById("folder_edit_name").select();
		},5);
	}
}

function FolderRenameConfirm() { // when pressed OK in folder popup
	let name = document.getElementById("folder_edit_name");
	let FolderId = document.getElementById("folder_edit").getAttribute("FolderId");
	tt.folders[FolderId].name = name.value;
	document.getElementById(FolderId + "_folder_title").textContent = name.value;
	HideRenameDialogs();
	if (opt.debug) {
		log("f: FolderRenameConfirm, folderId "+FolderId+", name: "+name.value);
	}
	chrome.runtime.sendMessage({command: "save_folders", folders: tt.folders, windowId: tt.CurrentWindowId});
	RefreshCounters();
}



function ActionClickFolder(FolderNode, bgOption) {
	if (opt.debug) {
		log("f: ActionClickFolder, folderId "+FolderNode.id+", bgOption: "+bgOption);
	}
	if (bgOption == "rename_folder") {
		ShowRenameFolderDialog(FolderNode.id);
	}
	if (bgOption == "new_folder") {
		let FolderId = AddNewFolder({ParentId: FolderNode.id});
		ShowRenameFolderDialog(FolderId);
	}
	if (bgOption == "new_tab") {
		OpenNewTab(false, FolderNode.id);
	}
	if (bgOption == "expand_collapse") {
		EventExpandBox(FolderNode);
	}
	if (bgOption == "close_folder") {
		RemoveFolder(FolderNode.id);
	}
	if (bgOption == "unload_folder") {
		let tabsArr = [];
		document.querySelectorAll("#"+FolderNode.id+" .tab").forEach(function(s) {
			tabsArr.push(parseInt(s.id));
		});
		DiscardTabs(tabsArr);
	}
}

function FolderStartDrag(Node, event) {
	if (opt.debug) {
		log("f: FolderStartDrag, folderId "+Node.id);
	}
	event.stopPropagation();
	event.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
	event.dataTransfer.setData("text", "");
	event.dataTransfer.setData("SourceWindowId", tt.CurrentWindowId);
	CleanUpDragClasses();
	EmptyDragAndDrop();

	tt.DragNodeClass = "tree";
	let Nodes = [];
	
	// let Tabs = {};
	
	// let TabsIds = [];
	// let TabsIdsParents = [];
	
	// let Folders = {};
	// let FoldersSelected = [];


	if (Node.parentNode.classList.contains("selected")) {
		document.querySelectorAll(".group:not(#"+tt.active_group+") .selected").forEach(function(s) {
			s.classList.add("selected_frozen");
			s.classList.remove("selected");
		});
	} else {
		FreezeSelection();
		Node.parentNode.classList.add("selected_temporarly");
		Node.parentNode.classList.add("selected");
	}
	
	RemoveHeadersHoverClass();
	
	document.querySelectorAll("[id='"+Node.parentNode.id+"'], [id='"+Node.parentNode.id+"'] .folder, [id='"+Node.parentNode.id+"'] .tab").forEach(function(s) {
		s.classList.add("dragged_tree");
	});

	// console.log(opt.max_tree_drag_drop_folders);
	// console.log(opt.max_tree_depth);
	
	
	// if (opt.max_tree_drag_drop_folders || opt.max_tree_depth >= 0) {
	if (opt.max_tree_depth >= 0) {
		document.querySelectorAll(".dragged_tree .tab, .dragged_tree .folder").forEach(function(s) {
		// document.querySelectorAll(".dragged_tree .folder").forEach(function(s) {
			let parents = GetParentsByClass(s.parentNode, "dragged_tree");
			if (parents.length > tt.DragTreeDepth) {
				tt.DragTreeDepth = parents.length;
			}
		});
	} else {
		tt.DragTreeDepth = -1;
	}

	// REST OF SELECTED FOLDERS+TABS THAT WILL BE DRAGGED
	document.querySelectorAll(".selected, .selected .tab, .selected .folder").forEach(function(s) {
		s.classList.add("dragged_tree");
	});

	document.querySelectorAll(".dragged_tree").forEach(function(s) {
		if (s.classList.contains("tab")) {
			tt.DraggingTab = true;
		}
		if (s.classList.contains("folder")) {
			tt.DraggingFolder = true;
		}
		if (s.classList.contains("pin")) {
			tt.DraggingPin = true;
		}
		Nodes.push({
			id: s.id,
			parent: s.parentNode.id,
			selected: (s.classList.contains("selected") || s.classList.contains("selected")),
			temporary: s.classList.contains("selected_temporarly"),
			NodeClass: (s.classList.contains("tab") ? "tab" : (s.classList.contains("pin") ? "pin" : "folder"))
		});
	});
	
	// let DraggedFolderParents = GetParentsByClass(Node, "folder");
	// DraggedFolderParents.forEach(function(s) {
		// s.classList.add("dragged_parents");
	// });
	// let DraggedParents = GetParentsByClass(Node, "tab");
	// DraggedParents.forEach(function(s) {
		// s.classList.add("dragged_parents");
	// });
	
	
	
	// document.querySelectorAll("#"+tt.active_group+" .selected").forEach(function(s) {
		
		
		// Folders[s.id] = {id: s.id, parent: s.parentNode.id, selected: true};
		
		// FoldersSelected.push(s.id);
		// Folders[s.id] = Object.assign({}, tt.folders[s.id]);
		
		
		
		// let Fchildren = document.querySelectorAll("#°"+s.id+" .folder");
		// Fchildren.forEach(function(fc) {
			// Folders[fc.id] = Folders[fc.id] = Object.assign({}, tt.folders[fc.id]);
		// });
		
		// let Tchildren = document.querySelectorAll("#°"+s.id+" .tab");
		// Tchildren.forEach(function(tc) {
			// TabsIds.push(parseInt(tc.id));
			
			// Tabs[tc.id] = {id: tc.id, parent: tc.parentNode.id, selected: (tc.classList.contains("selected_frozen"))   };
			
			
			// TabsIdsParents.push(tc.parentNode.id);
		// });
		
	// });
	
	// let DraggedFolderParents = GetParentsByClass(Node, "folder");
	// DraggedFolderParents.forEach(function(s) {
		// s.classList.add("dragged_parents");
	// });

	event.dataTransfer.setData("Class", "tree");
	event.dataTransfer.setData("Nodes", JSON.stringify(Nodes));

	
	
	// event.dataTransfer.setData("Tabs", JSON.stringify(Tabs));
	
	
	// event.dataTransfer.setData("TabsIds", JSON.stringify(TabsIds));
	// event.dataTransfer.setData("TabsIdsParents", JSON.stringify(TabsIdsParents));

	// event.dataTransfer.setData("Folders", JSON.stringify(Folders));
	// event.dataTransfer.setData("FoldersSelected", JSON.stringify(FoldersSelected));
	
	chrome.runtime.sendMessage({
		command: "drag_drop",
		DragNodeClass: "tree",
		DragTreeDepth: tt.DragTreeDepth
	});	
}


function DragOverFolder(Node, event) {
	
		
		// let ParentsTabs = GetParentsByClass(Node, "tab");
		// let TabDepth = GetTabDepthInTree(Node);

		// let ParentsFolders = GetParentsByClass(Node, "folder");
		
		// let PDepth = ParentsTabs.length + ParentsFolders.length + tt.DragTreeDepth;
		// let PDepth = TabDepth + tt.DragTreeDepth;
		
		
		// let PIsGroup = Node.parentNode.parentNode.parentNode.classList.contains("group");
		// let PIsTab = Node.parentNode.parentNode.parentNode.classList.contains("tab");
		// let PIsFolder = Node.parentNode.parentNode.parentNode.classList.contains("folder");
		
		
		
		
		if (
		// (PIsFolder == tt.DraggingFolder || tt.DraggingFolder == false || PIsGroup == true)
			// && 
			Node.parentNode.classList.contains("before") == false
			&& event.layerY < Node.clientHeight/3
			// && (PDepth <= opt.max_tree_depth+1 || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false)
		) {
			RemoveHighlight();
			Node.parentNode.classList.remove("inside");
			Node.parentNode.classList.remove("after");
			Node.parentNode.classList.add("before");
			Node.parentNode.classList.add("highlighted_drop_target");
		}
		
		
		if (
		// tt.DraggingFolder == false
			// && 
			Node.parentNode.classList.contains("inside") == false
			&& event.layerY > Node.clientHeight/3
			&& event.layerY <= 2*(Node.clientHeight/3)
			// && (PDepth <= opt.max_tree_depth || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false)
		) {
			RemoveHighlight();
			Node.parentNode.classList.remove("before");
			Node.parentNode.classList.remove("after");
			Node.parentNode.classList.add("inside");
			Node.parentNode.classList.add("highlighted_drop_target");
		}
		
		
		if (
		// (PIsFolder == tt.DraggingFolder || tt.DraggingFolder == false || PIsGroup == true)
			// && 
			Node.parentNode.classList.contains("after") == false
			&& Node.parentNode.classList.contains("o") == false
			&& event.layerY > 2*(Node.clientHeight/3)
			// && (PDepth <= opt.max_tree_depth+1 || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false)
		) {
			RemoveHighlight();
			Node.parentNode.classList.remove("inside");
			Node.parentNode.classList.remove("before");
			Node.parentNode.classList.add("after");
			Node.parentNode.classList.add("highlighted_drop_target");
		}
		
		
		
}

