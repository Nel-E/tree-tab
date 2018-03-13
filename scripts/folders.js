// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function AddNewFolder(ParentId, Name, Index, ExpandState) {
	var newId = GenerateNewFolderID();
	bgfolders[newId] = { id: newId, parent: (ParentId ? ParentId : ""), index: (Index ? Index : 0), name: (Name ? Name : caption_noname_group), expand: (ExpandState ? ExpandState : "") };
	AppendFolder(newId, caption_noname_group, (ParentId ? ParentId : ""), undefined, true);
	SaveFolders();
	RefreshCounters();
	RefreshExpandStates();
	return newId;
}

function AppendFolder(folderId, Name, ParentId, Expand, SetEvents) {
	if (document.getElementById(folderId) == null) {
		var fd = document.createElement("div"); fd.className = "folder ";  if (Expand) { fd.className += Expand }  fd.id = folderId;// FOLDER
		var dc = document.createElement("div"); dc.className = "drop_target drag_enter_center"; dc.id = "dc"+folderId; fd.appendChild(dc); // DROP TARGET CENTER
		var du = document.createElement("div"); du.className = "drop_target drag_entered_top"; du.id = "du"+folderId; fd.appendChild(du); // DROP TARGET TOP
		var dd = document.createElement("div"); dd.className = "drop_target drag_entered_bottom"; dd.id = "dd"+folderId; fd.appendChild(dd); // DROP TARGET BOTTOM
		var fh = document.createElement("div"); fh.className = (opt.always_show_close && !opt.never_show_close) ? "folder_header close_show" : "folder_header"; fh.id = "folder_header"+folderId; if (SetEvents) {fh.draggable = true;} fd.appendChild(fh); // HEADER
		var ex = document.createElement("div"); ex.className = "folder_icon"; ex.id = "fop"+folderId; fh.appendChild(ex);
		var ft = document.createElement("div"); ft.className = "folder_title"; ft.id = "folder_title"+folderId; ft.textContent = Name; fh.appendChild(ft); // TITLE
		var cf = document.createElement("div"); cf.className = "children_folders"; cf.id = "cf"+folderId; fd.appendChild(cf);
		var ct = document.createElement("div"); ct.className = "children_tabs"; ct.id = "ct"+folderId; fd.appendChild(ct);
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

			cf.onmousedown = function(event) {
				if (event.target == this) {
					if (event.which == 1) {
						DeselectFolders();
						DeselectTabs();
					}
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
					if (event.which == 1) {
						DeselectFolders();
						DeselectTabs();
					}
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
			fh.onmousedown = function(event) {
				if (document.getElementById("main_menu").style.top != "-1000px") {
					HideMenus();
				}
				// SELECT FOLDER
				if (event.which == 1 && !event.shiftKey) {
					DeselectTabs();
					if (!event.ctrlKey) {
						DeselectFolders();
					}
					event.target.parentNode.parentNode.classList.toggle("selected_folder");
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
				if (event.which == 1 && !event.shiftKey && !event.ctrlKey && (event.target.classList.contains("folder_title") || event.target.classList.contains("folder_header"))) {
				// if (event.which == 1) {
					// ShowRenameFolderDialog(this.parentNode.id);
					ActionClickFolder(this.parentNode, opt.dbclick_folder);
				}
			}
			fh.ondragstart = function(event) { // DRAG START
				event.stopPropagation();
				event.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
				event.dataTransfer.setData("text", "");
				// event.dataTransfer.setData("TTSourceWindowId", CurrentWindowId);
				CleanUpDragClasses();
				EmptyDragAndDrop();
			
				if (opt.debug) console.log("started dragging folder");
				if (opt.debug) console.log(DragAndDrop.DragNodeClass);
				
				DropTargetsFront(this, true, false);

				if (this.parentNode.classList.contains("selected_folder") == false) {
					if (opt.debug) console.log(this.parentNode.classList);
					document.querySelectorAll(".selected_folder").forEach(function(s){
						s.classList.add("selected_folder_frozen");
						s.classList.remove("selected_folder");
					});
					this.parentNode.classList.add("selected_folder_temporarly");
					this.parentNode.classList.add("selected_folder");
				} else {
					document.querySelectorAll(".group:not(#"+active_group+") .selected_folder").forEach(function(s){
						s.classList.add("selected_folder_frozen");
						s.classList.remove("selected_folder");
					});
				}
				RemoveHeadersHoverClass();
				// let test_data = [];
				document.querySelectorAll("[id='"+this.parentNode.id+"'], [id='"+this.parentNode.id+"'] .folder, [id='"+this.parentNode.id+"'] .tab").forEach(function(s){
					s.classList.add("dragged_tree");
				});
				document.querySelectorAll(".selected_tab, .selected_tab .tab, .selected_folder, .selected_folder .folder").forEach(function(s){
					s.classList.add("dragged_selected");
					// test_data.push(s.id);
				});
				let Folders = GetSelectedFolders();
				
				document.querySelectorAll("[id='"+this.parentNode.id+"'], [id='"+this.parentNode.id+"'] .folder, [id='"+this.parentNode.id+"'] .tab").forEach(function(s){
					s.classList.add("dragged_tree");
				});
				document.querySelectorAll(".selected_tab, .selected_tab .tab, .selected_folder, .selected_folder .folder").forEach(function(s){
					s.classList.add("dragged_selected");
				});

				if (opt.max_tree_drag_drop_folders) {
					document.querySelectorAll(".dragged_tree .folder").forEach(function(s){
						let parents = GetParentsByClass(s.parentNode, "dragged_tree");
						if (parents.length > DragAndDrop.Depth) {
							DragAndDrop.Depth = parents.length;
						}
					});
				} else {
					DragAndDrop.Depth = -1;
				}
					
				DragAndDrop.DragNodeClass = "folder";
				DragAndDrop.TabsIds = Object.assign([], Folders.TabsIds);
				DragAndDrop.TabsIdsParents = Object.assign([], Folders.TabsIdsParents);
				DragAndDrop.Folders = Object.assign({}, Folders.Folders);
				DragAndDrop.FoldersSelected = Object.assign([], Folders.FoldersSelected);
				DragAndDrop.ComesFromWindowId = CurrentWindowId;
				
				chrome.runtime.sendMessage({
					command: "drag_drop",
					DragNodeClass: DragAndDrop.DragNodeClass,
					TabsIds: DragAndDrop.TabsIds,
					TabsIdsParents: DragAndDrop.TabsIdsParents,
					TabsIdsSelected: DragAndDrop.TabsIdsSelected,
					ComesFromWindowId: CurrentWindowId,
					Depth: DragAndDrop.Depth,
					Folders: DragAndDrop.Folders,
					FoldersSelected: DragAndDrop.FoldersSelected
				});
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
			dc.ondragenter = function(event) {
				// DRAGENTER PIN,TAB,FOLDER==>DROP ZONES
				DragAndDrop.timeout = false;
				setTimeout(function() {
					DragAndDrop.timeout = true;
				}, 1000);
				if (DragAndDrop.DragNodeClass == "tab" || DragAndDrop.DragNodeClass == "folder") {
					HighlightDragEnter(this, 0, "folder");
				}
			}
			du.ondragenter = function(event) {
				// FOLDER==>FOLDER
				if (DragAndDrop.DragNodeClass == "tab" || DragAndDrop.DragNodeClass == "folder") {
					HighlightDragEnter(this, 1, "folder");
				}
			}
			dd.ondragenter = function(event) {
				// FOLDER==>FOLDER
				if (DragAndDrop.DragNodeClass == "tab" || DragAndDrop.DragNodeClass == "folder") {
					HighlightDragEnter(this, 1, "folder");
				}
			}
			ex.onmousedown = function(event) {
				if (document.getElementById("main_menu").style.top != "-1000px") {
					HideMenus();
				}
				// EXPAND/COLLAPSE FOLDER
				if (event.which == 1 && !event.shiftKey && !event.ctrlKey) {
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
	for (var folderId in Folders) {
		AppendFolder(folderId, Folders[folderId].name, Folders[folderId].parent, Folders[folderId].expand, true);
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
	document.querySelectorAll(".folder").forEach(function(s){
		if (bgfolders[s.id] && s.parentNode.childNodes[bgfolders[s.id].index]) {
			let Ind = Array.from(s.parentNode.children).indexOf(s);
			if (Ind > bgfolders[s.id].index) {
				s.parentNode.childNodes[bgfolders[s.id].index].parentNode.insertBefore(s, s.parentNode.childNodes[bgfolders[s.id].index]);
			} else {
				if (s.parentNode.childNodes[bgfolders[s.id].index].nextSibling != null) {
					s.parentNode.childNodes[bgfolders[s.id].index].parentNode.insertBefore(s, s.parentNode.childNodes[bgfolders[s.id].index].nextSibling);
				} else {
					s.parentNode.childNodes[bgfolders[s.id].index].parentNode.appendChild(s);
				}				
			}
		}
		let newInd = Array.from(s.parentNode.children).indexOf(s);
		if (bgfolders[s.id] && newInd != bgfolders[s.id].index && first_loop) {
			RearrangeFolders(false);
		}
	});
}

function RemoveFolder(FolderId) {
	let folder = document.getElementById(FolderId);
	if (folder != null) {
		let CF = folder.childNodes[4]; // CF stands for DIV with children folders
		let CT = folder.childNodes[5]; // CT stands for DIV with children tabs
		if (opt.promote_children == true) {
			if (opt.promote_children_in_first_child == true && CF.children.length > 0) {
				let FirstFolderChild = CF.firstChild;
				folder.parentNode.insertBefore(FirstFolderChild, folder);
				let NewCF = FirstFolderChild.childNodes[4];
				while (CF.firstChild) {
					NewCF.appendChild(CF.firstChild);
				}
				if (CT.childNodes.length > 0) {
					let NewCT = FirstFolderChild.childNodes[5];
					while (CT.firstChild) {
						NewCT.appendChild(CT.firstChild);
					}
				}
			} else {
				let NewCT = document.getElementById("ct"+folder.parentNode.parentNode.id);
				// let NewCT = folder.parentNode.parentNode.childNodes[5];
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

function SetActiveFolder(FolderId) {
	let folder = document.getElementById(FolderId);
	if (folder != null) {
		document.querySelectorAll(".selected_folder").forEach(function(s){
			s.classList.remove("selected_folder");
		});
		folder.classList.add("selected_folder");
	}
}

function ShowRenameFolderDialog(FolderId) { // Rename folder popup
	HideRenameDialogs();
	if (bgfolders[FolderId]) {
		let name = document.getElementById("folder_edit_name");
		name.value = bgfolders[FolderId].name;
		let folderEditDialog = document.getElementById("folder_edit");
		folderEditDialog.setAttribute("FolderId", FolderId);
		folderEditDialog.style.display = "block";
		folderEditDialog.style.top = document.getElementById("toolbar").getBoundingClientRect().height + document.getElementById("pin_list").getBoundingClientRect().height + 8 + "px";
		folderEditDialog.style.left = "22px";
		setTimeout(function(){
			document.getElementById("folder_edit_name").select();
		},5);
	}
}

function FolderRenameConfirm() { // when pressed OK in folder popup
	let name = document.getElementById("folder_edit_name");
	let FolderId = document.getElementById("folder_edit").getAttribute("FolderId");
	name.value = name.value.replace(/[\f\n\r\v\t\<\>\+\-\(\)\.\,\;\:\~\/\|\?\@\!\"\'\£\$\%\&\^\#\=\*\[\]]?/gi, "");
	bgfolders[FolderId].name = name.value;
	document.getElementById("folder_title" + FolderId).textContent = name.value;
	HideRenameDialogs();
	chrome.runtime.sendMessage({command: "save_folders", folders: bgfolders, windowId: CurrentWindowId});
	RefreshCounters();
}

function DeselectFolders() {
	document.querySelectorAll("#"+active_group+" .selected_folder").forEach(function(s){
		s.classList.remove("selected_folder");
	});
}

function ActionClickFolder(FolderNode, bgOption) {
	if (bgOption == "rename_folder") {
		ShowRenameFolderDialog(FolderNode.id);
	}
	if (bgOption == "new_folder") {
		AddNewFolder(FolderNode.id, undefined, undefined, undefined);
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

