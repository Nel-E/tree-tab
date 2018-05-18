// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function AddNewFolder(folderId, ParentId, Name, Index, ExpandState, AdditionalClass, SetEvents) {
	var newId = folderId ? folderId : GenerateNewFolderID();
	bgfolders[newId] = { id: newId, parent: (ParentId ? ParentId : ""), index: (Index ? Index : 0), name: (Name ? Name : caption_noname_group), expand: (ExpandState ? ExpandState : "") };
	if (opt.debug) {
		log("f: AddNewFolder, folder: "+JSON.stringify(bgfolders[newId]));
	}
	AppendFolder(newId, caption_noname_group, (ParentId ? ParentId : ""), undefined, SetEvents, AdditionalClass);
	SaveFolders();
	RefreshCounters();
	RefreshExpandStates();
	return newId;
}

function AppendFolder(folderId, Name, ParentId, Expand, SetEvents, AdditionalClass) {
	if (opt.debug) {
		log("f: AppendFolder, folder: "+JSON.stringify(bgfolders[folderId]));
	}
	let ClassList = "folder ";
	if (AdditionalClass != undefined) {
		ClassList = ClassList + AdditionalClass;
	}
	if (document.getElementById(folderId) == null) {
		var fd = document.createElement("div"); fd.className = ClassList;  if (Expand) { fd.className += Expand }  fd.id = folderId; // FOLDER
		var fh = document.createElement("div"); fh.className = (opt.always_show_close && !opt.never_show_close) ? "folder_header close_show" : "folder_header"; fh.id = "folder_header"+folderId; if (SetEvents) {fh.draggable = true;} fd.appendChild(fh); // HEADER
		var ex = document.createElement("div"); ex.className = "folder_icon"; ex.id = "fop"+folderId; fh.appendChild(ex);
		var ft = document.createElement("div"); ft.className = "folder_title"; ft.id = "folder_title"+folderId; ft.textContent = Name; fh.appendChild(ft); // TITLE
		var cf = document.createElement("div"); cf.className = "children_folders"; cf.id = "cf"+folderId; fd.appendChild(cf);
		var ct = document.createElement("div"); ct.className = "children_tabs"; ct.id = "ct"+folderId; fd.appendChild(ct);
		var di = document.createElement("div"); di.className = "drag_indicator"; di.id = "di"+folderId; fd.appendChild(di); // DROP TARGET INDICATOR
		if (!opt.never_show_close) {
			var cl = document.createElement("div"); cl.className = "close"; cl.id = "close"+folderId; fh.appendChild(cl); // CLOSE BUTTON
			var ci = document.createElement("div"); ci.className = "close_img"; ci.id = "close_img"+folderId; cl.appendChild(ci);
		}
		
		if (SetEvents) {
			ct.ondblclick = function(event) {
				if (event.target == this) {
					ActionClickGroup(this.parentNode, opt.dbclick_group);
				}
			}
			cf.ondblclick = function(event) {
				if (event.target == this) {
					ActionClickGroup(this.parentNode, opt.dbclick_group);
				}
			}

			cf.onclick = function(event) {
				if (event.target == this && event.which == 1) {
					DeselectFolders();
					DeselectTabs();
				}
			}
			ct.onclick = function(event) {
				if (event.target == this && event.which == 1) {
					DeselectFolders();
					DeselectTabs();
				}
			}
			cf.onmousedown = function(event) {
				if (event.target == this) {
					if (event.which == 2 && event.target == this) {
						event.stopImmediatePropagation();
						ActionClickGroup(this.parentNode, opt.midclick_group);
					}
					if (event.which == 3) {
						ShowFGlobalMenu(event);
					}
				}
			}
			ct.onmousedown = function(event) {
				if (event.target == this) {
					if (event.which == 2 && event.target == this) {
						event.stopImmediatePropagation();
						ActionClickGroup(this.parentNode, opt.midclick_group);
					}
					if (event.which == 3) {
						ShowFGlobalMenu(event);
					}
				}
			}

			if (!opt.never_show_close) {
				cl.onmousedown = function(event) {
					event.stopImmediatePropagation();
					if (event.which != 3) {
						RemoveFolder(this.parentNode.parentNode.id);
					}
				}
				cl.onmouseenter = function(event) {
					this.classList.add("close_hover");
				}
				cl.onmouseleave = function(event) {
					this.classList.remove("close_hover");
				}
			}
			fh.onclick = function(event) {
				// SELECT FOLDER
				if (event.which == 1 && !event.shiftKey) {
					DeselectTabs();
					if (!event.ctrlKey && this.parentNode.classList.contains("selected_folder") == false) {
						DeselectFolders();
					}
					if (event.ctrlKey) {
						this.parentNode.classList.toggle("selected_folder");
					}
				}
			}
			fh.onmousedown = function(event) {
				if (document.getElementById("main_menu").style.top != "-1000px") {
					HideMenus();
				}
				if (event.which == 2) {
					event.preventDefault();
					ActionClickFolder(this.parentNode, opt.midclick_folder);
				}
				// SHOW FOLDER MENU
				if (event.which == 3) {
					ShowFolderMenu(this.parentNode, event);
				}
			}
			// edit folder
			fh.ondblclick = function(event) {
				if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target.classList.contains("folder_header")) {
					ActionClickFolder(this.parentNode, opt.dbclick_folder);
				}
			}
			fh.ondragstart = function(event) { // DRAG START
				FolderStartDrag(this, event);
			}
			fh.ondragenter = function(event) {
				this.classList.remove("folder_header_hover");
			}		
			fh.onmouseover = function(event) {
				this.classList.add("folder_header_hover");
				if (opt.never_show_close == false && opt.always_show_close == false) {
					this.classList.add("close_show");
				}
			}
			fh.onmouseleave = function(event) {
				this.classList.remove("folder_header_hover");
				if (opt.never_show_close == false && opt.always_show_close == false) {
					this.classList.remove("close_show");
				}
			}
			fh.ondragleave = function(event) {
				RemoveHighlight();
			}
			fh.ondragover = function(event) {
				FolderDragOver(this, event);
			}
			
			fh.ondragenter = function(event) {
				DragOverTimer = false;
				setTimeout(function() {
					DragOverTimer = true;
				}, 1000);
			}
			
			ex.onmousedown = function(event) {
				event.stopPropagation();
				if (document.getElementById("main_menu").style.top != "-1000px") {
					HideMenus();
				}
				// EXPAND/COLLAPSE FOLDER
				if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target == this) {
					event.stopPropagation();
					EventExpandBox(this.parentNode.parentNode);
					RefreshExpandStates();
					RefreshCounters();
				}
			}
		}	
		if (ParentId == "" || ParentId == undefined || document.getElementById("cf"+ParentId) == null) {
			document.getElementById("cf"+active_group).appendChild(fd);
		} else {
			document.getElementById("cf"+ParentId).appendChild(fd);
		}
	}
}

function GenerateNewFolderID() {
	var newID = "f_"+GenerateRandomID();
	if (document.getElementById(newID) == null) {
		return newID;
	} else {
		GenerateNewFolderID();
	}
}

function AppendFolders(Folders) {
	if (opt.debug) {
		log("f: AppendFolders, Folders: "+JSON.stringify(Folders));
	}
	for (var folderId in Folders) {
		AppendFolder(folderId, Folders[folderId].name, Folders[folderId].parent, Folders[folderId].expand, true, undefined);
	}
	for (var folderId in Folders) {
		let f = document.getElementById(folderId);
		let parent = document.getElementById("cf"+Folders[folderId].parent);
		if (f != null && parent != null && Folders[folderId].parent != f.parentNode.parentNode.id) {
			parent.appendChild(f);
		}
	}
}

function SaveFolders() {
	document.querySelectorAll(".folder").forEach(function(s){
		bgfolders[s.id].parent = s.parentNode.parentNode.id;
		bgfolders[s.id].index = Array.from(s.parentNode.children).indexOf(s);
		bgfolders[s.id].expand = (s.classList.contains("c") ? "c" : (s.classList.contains("o") ? "o" : ""));
	});
	chrome.runtime.sendMessage({command: "save_folders", folders: bgfolders, windowId: CurrentWindowId});
}

function RearrangeFolders(first_loop) {
	if (opt.debug) {
		log("f: RearrangeFolders");
	}
	document.querySelectorAll(".folder").forEach(function(s){
		if (bgfolders[s.id] && s.parentNode.childNodes[bgfolders[s.id].index]) {
			let Ind = Array.from(s.parentNode.children).indexOf(s);
			if (Ind > bgfolders[s.id].index) {
				InsterBeforeNode(s, s.parentNode.childNodes[bgfolders[s.id].index]);
			} else {
				InsterAfterNode(s, s.parentNode.childNodes[bgfolders[s.id].index]);
			}
		}
		let newInd = Array.from(s.parentNode.children).indexOf(s);
		if (bgfolders[s.id] && newInd != bgfolders[s.id].index && first_loop) {
			RearrangeFolders(false);
		}
	});
}

function RemoveFolder(FolderId) {
	if (opt.debug) {
		log("f: RemoveFolder, folderId "+FolderId);
	}
	let folder = document.getElementById(FolderId);
	if (folder != null) {
		let CF = folder.childNodes[1]; // CF stands for DIV with children folders
		let CT = folder.childNodes[2]; // CT stands for DIV with children tabs
		if (opt.promote_children == true) {
			if (opt.promote_children_in_first_child == true && CF.children.length > 0) {
				let FirstFolderChild = CF.firstChild;
				folder.parentNode.insertBefore(FirstFolderChild, folder);
				let NewCF = FirstFolderChild.childNodes[1];
				while (CF.firstChild) {
					NewCF.appendChild(CF.firstChild);
				}
				if (CT.childNodes.length > 0) {
					let NewCT = FirstFolderChild.childNodes[2];
					while (CT.firstChild) {
						NewCT.appendChild(CT.firstChild);
					}
				}
			} else {
				let NewCT = document.getElementById("ct"+folder.parentNode.parentNode.id);
				// let NewCT = folder.parentNode.parentNode.childNodes[2];
				while (CT.firstChild) {
					NewCT.appendChild(CT.firstChild);
				}
				while (CF.lastChild) {
					folder.parentNode.insertBefore(CF.lastChild, folder);
				}
			}
		} else {
			document.querySelectorAll("#"+FolderId+" .tab").forEach(function(s){
				chrome.tabs.remove(parseInt(s.id), null);
			});

			document.querySelectorAll("#"+FolderId+" .folder").forEach(function(s){
				delete bgfolders[s.id];
			});
		}
		folder.parentNode.removeChild(folder);	
		delete bgfolders[FolderId];
		RefreshExpandStates();
		chrome.runtime.sendMessage({command: "save_folders", folders: bgfolders, windowId: CurrentWindowId});
	}
}

// function SetActiveFolder(FolderId) {
	// let folder = document.getElementById(FolderId);
	// if (folder != null) {
		// document.querySelectorAll(".selected_folder").forEach(function(s){
			// s.classList.remove("selected_folder");
		// });
		// folder.classList.add("selected_folder");
	// }
// }

function ShowRenameFolderDialog(FolderId) { // Rename folder popup
	if (opt.debug) {
		log("f: ShowRenameFolderDialog, folderId "+FolderId);
	}
	HideRenameDialogs();
	if (bgfolders[FolderId]) {
		let name = document.getElementById("folder_edit_name");
		name.value = bgfolders[FolderId].name;
		let folderEditDialog = document.getElementById("folder_edit");
		folderEditDialog.setAttribute("FolderId", FolderId);
		folderEditDialog.style.display = "block";
		folderEditDialog.style.top = document.getElementById("toolbar").getBoundingClientRect().height + document.getElementById("pin_list").getBoundingClientRect().height + 8 + "px";
		// folderEditDialog.style.left = "22px";
		folderEditDialog.style.left = "";
		setTimeout(function(){
			document.getElementById("folder_edit_name").select();
		},5);
	}
}

function FolderRenameConfirm() { // when pressed OK in folder popup
	let name = document.getElementById("folder_edit_name");
	let FolderId = document.getElementById("folder_edit").getAttribute("FolderId");
	// name.value = name.value.replace(/[\f\n\r\v\t\<\>\+\-\(\)\.\,\;\:\~\/\|\?\@\!\"\'\£\$\%\&\^\#\=\*\[\]]?/gi, "");
	bgfolders[FolderId].name = name.value;
	document.getElementById("folder_title" + FolderId).textContent = name.value;
	HideRenameDialogs();
	if (opt.debug) {
		log("f: FolderRenameConfirm, folderId "+FolderId+", name: "+name.value);
	}
	chrome.runtime.sendMessage({command: "save_folders", folders: bgfolders, windowId: CurrentWindowId});
	RefreshCounters();
}

function DeselectFolders() {
	if (opt.debug) {
		log("f: DeselectFolders");
	}
	document.querySelectorAll("#"+active_group+" .selected_folder").forEach(function(s){
		s.classList.remove("selected_folder");
	});
}

function ActionClickFolder(FolderNode, bgOption) {
	if (opt.debug) {
		log("f: ActionClickFolder, folderId "+FolderNode.id+", bgOption: "+bgOption);
	}
	if (bgOption == "rename_folder") {
		ShowRenameFolderDialog(FolderNode.id);
	}
	if (bgOption == "new_folder") {
		AddNewFolder(undefined, FolderNode.id, undefined, undefined, undefined, undefined, true);
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
		document.querySelectorAll("#"+FolderNode.id+" .tab").forEach(function(s){
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
	event.dataTransfer.setData("SourceWindowId", CurrentWindowId);
	CleanUpDragClasses();
	EmptyDragAndDrop();

	DragNodeClass = "folder";
	
	let TabsIds = [];
	let TabsIdsParents = [];
	
	let Folders = {};
	let FoldersSelected = [];


	if (Node.parentNode.classList.contains("selected_folder")) {
		document.querySelectorAll(".group:not(#"+active_group+") .selected_folder").forEach(function(s){
			s.classList.add("selected_folder_frozen");
			s.classList.remove("selected_folder");
		});
	} else {
		FreezeSelected();
		Node.parentNode.classList.add("selected_folder_temporarly");
		Node.parentNode.classList.add("selected_folder");
	}
	
	RemoveHeadersHoverClass();
	
	document.querySelectorAll("[id='"+Node.parentNode.id+"'], [id='"+Node.parentNode.id+"'] .folder, [id='"+Node.parentNode.id+"'] .tab").forEach(function(s){
		s.classList.add("dragged_tree");
	});

	if (opt.max_tree_drag_drop_folders) {
		document.querySelectorAll(".dragged_tree .folder").forEach(function(s){
			let parents = GetParentsByClass(s.parentNode, "dragged_tree");
			if (parents.length > DragTreeDepth) {
				DragTreeDepth = parents.length;
			}
		});
	} else {
		DragTreeDepth = -1;
	}

	// REST OF SELECTED FOLDERS+TABS THAT WILL BE DRAGGED
	document.querySelectorAll(".selected_folder, .selected_folder .tab, .selected_folder .folder").forEach(function(s){
		s.classList.add("dragged_tree");
	});

	document.querySelectorAll("#"+active_group+" .selected_folder").forEach(function(s){
		FoldersSelected.push(s.id);
		Folders[s.id] = Object.assign({}, bgfolders[s.id]);
		let Fchildren = document.querySelectorAll("#cf"+s.id+" .folder");
		Fchildren.forEach(function(fc){
			Folders[fc.id] = Folders[fc.id] = Object.assign({}, bgfolders[fc.id]);
		});
		let Tchildren = document.querySelectorAll("#ct"+s.id+" .tab");
		Tchildren.forEach(function(tc){
			TabsIds.push(parseInt(tc.id));
			TabsIdsParents.push(tc.parentNode.id);
		});
	});

	event.dataTransfer.setData("TabsIds", JSON.stringify(TabsIds));
	event.dataTransfer.setData("TabsIdsParents", JSON.stringify(TabsIdsParents));

	event.dataTransfer.setData("Folders", JSON.stringify(TabsIds));
	event.dataTransfer.setData("FoldersSelected", JSON.stringify(FoldersSelected));
	
	chrome.runtime.sendMessage({
		command: "drag_drop",
		DragNodeClass: "folder",
		DragTreeDepth: DragTreeDepth
	});	
}

function FolderDragOver(Node, event) {
	if (opt.debug) {
		log("f: debug, folderId "+Node.id);
	}
	if (Node.parentNode.classList.contains("dragged_tree") == false) {

		let P = (GetParentsByClass(Node, "folder")).length + DragTreeDepth;
		let PGroup = Node.parentNode.parentNode.parentNode.classList.contains("group");
	
		if (DragNodeClass == "folder" && Node.parentNode.classList.contains("before") == false && event.layerY < Node.clientHeight/3 && (P <= opt.max_tree_depth+1 || opt.max_tree_depth<0 || PGroup || opt.max_tree_drag_drop_folders == false)) {
			RemoveHighlight();
			Node.parentNode.classList.remove("inside");
			Node.parentNode.classList.remove("after");
			Node.parentNode.classList.add("before");
			Node.parentNode.classList.add("highlighted_drop_target");
		}
		
		if (DragNodeClass == "folder" && Node.parentNode.classList.contains("inside") == false && event.layerY > Node.clientHeight/3 && event.layerY <= 2*(Node.clientHeight/3) && (P <= opt.max_tree_depth || opt.max_tree_depth<0 || opt.max_tree_drag_drop_folders == false)) {
			RemoveHighlight();
			Node.parentNode.classList.remove("before");
			Node.parentNode.classList.remove("after");
			Node.parentNode.classList.add("inside");
			Node.parentNode.classList.add("highlighted_drop_target");
		}
		
		if (DragNodeClass == "folder" && Node.parentNode.classList.contains("after") == false && Node.parentNode.classList.contains("o") == false && event.layerY > 2*(Node.clientHeight/3) && (P <= opt.max_tree_depth+1 || opt.max_tree_depth<0 || PGroup || opt.max_tree_drag_drop_folders == false)) {
			RemoveHighlight();
			Node.parentNode.classList.remove("inside");
			Node.parentNode.classList.remove("before");
			Node.parentNode.classList.add("after");
			Node.parentNode.classList.add("highlighted_drop_target");
		}
		
		if (DragNodeClass == "tab" && Node.parentNode.classList.contains("inside") == false && (P <= opt.max_tree_depth || opt.max_tree_depth<0 || opt.max_tree_drag_drop_folders == false)) {
			RemoveHighlight();
			Node.parentNode.classList.remove("before");
			Node.parentNode.classList.remove("after");
			Node.parentNode.classList.add("inside");
			Node.parentNode.classList.add("highlighted_drop_target");
		}
	}
}