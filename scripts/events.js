// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function SetEvents() {
	if (opt.debug) {
		log("f: SetEvents, adding global events.");
	}

	let PinList = document.getElementById("pin_list");
	
	if (!opt.switch_with_scroll) {
		PinList.onmousewheel = function(event) {
			let pinList = document.getElementById("pin_list");
			let direction = (event.wheelDelta > 0 || event.detail < 0) ? -1 : 1;
			let speed = 0.1;
			for (let t = 1; t < 40; t++) {
				setTimeout(function() {
					if (t < 30) {
						speed = speed+0.1; // accelerate
					} else {
						speed = speed-0.3; // decelerate
					}
					pinList.scrollLeft = pinList.scrollLeft+(direction*speed);
				}, t);
			}
		}
	}

	window.addEventListener('contextmenu', function (event) {
		if (event.target.classList.contains("text_input") == false) {
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
			return false;
		}
	}, false);
	
	document.getElementById("body").addEventListener('contextmenu', function (event) {
		if (event.target.classList.contains("text_input") == false) {
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
			return false;
		}
	}, false);
	

	document.body.onresize = function(event) {
		RefreshGUI();
	}
	
	// MOUSE DOWN EVENTS
	document.body.onmousedown = function(event) {
		if (event.which == 2) {
			event.preventDefault();
		}	

		if (event.which == 1 && event.target.classList.contains("menu_item") == false) {
			HideMenus();
		}
		event.stopImmediatePropagation();

		if (event.which == 1) {
			RemoveHeadersHoverClass();
		}
	}

	// CONFIRM EDIT FOLDER
	document.getElementById("folder_edit_confirm").onmousedown = function(event) {
		if (event.which == 1) {
			FolderRenameConfirm();
		}
	}
	
	// DISCARD EDIT FOLDER
	document.getElementById("folder_edit_discard").onmousedown = function(event) {
		if (event.which == 1) {
			HideRenameDialogs();
		}
	}

	// CONFIRM EDIT GROUP
	document.getElementById("group_edit_confirm").onmousedown = function(event) {
		if (event.which == 1) {
			GroupEditConfirm();
		}
	}
	// DISCARD EDIT GROUP
	document.getElementById("group_edit_discard").onmousedown = function(event) {
		if (event.which == 1) {
			HideRenameDialogs();
		}
	}
	document.getElementById("folder_edit_name").onkeydown = function(event) {
		if (event.keyCode == 13) {
			FolderRenameConfirm();
		}
		if (event.which == 27) {
			HideRenameDialogs();
		}
	}
	document.getElementById("group_edit_name").onkeydown = function(event) {
		if (event.keyCode == 13) {
			GroupEditConfirm();
		}
		if (event.which == 27) {
			HideRenameDialogs();
		}
	}
	PinList.onclick = function(event) {
		if (event.which == 1 && event.target == this) {
			if (opt.pin_list_multi_row || (opt.pin_list_multi_row == false && event.clientY < (this.childNodes[0].getBoundingClientRect().height + this.getBoundingClientRect().top))) {
				Deselect();
			}
		}
	}
	PinList.onmousedown = function(event) {
		if (event.which == 1 && event.target == this) {
			if (opt.pin_list_multi_row || (opt.pin_list_multi_row == false && event.clientY < (this.childNodes[0].getBoundingClientRect().height + this.getBoundingClientRect().top))) {
				HideMenus();
			}
		}
		
		if (event.which == 2 && event.target == this) {
			ActionClickGroup(this, opt.midclick_group);
		}
		if (event.which == 3 && event.target == this) {
			ShowFGlobalMenu(event);
		}
	}
	PinList.ondragover = function(event) {
		// PIN,TAB==>PINLIST
		if (event.target.id == "pin_list" && tt.DragNodeClass == "tree" && this.classList.contains("highlighted_drop_target") == false) {
			RemoveHighlight();
			this.classList.add("highlighted_drop_target");
		}
	}
	
	// DOUBLE CLICK ACTION
	PinList.ondblclick = function(event) {
		if (event.target == this) {
			ActionClickGroup(this, opt.dbclick_group);
		}
	}
	
	
	// SHOW COLOR PICKER
	document.getElementById("group_edit_font").onclick = function(event) {
		if (event.which == 1) {
			event.stopPropagation();
			let ColorPicker = document.getElementById("color_picker");
			ColorPicker.setAttribute("PickColor", this.id);
			ColorPicker.value = "#"+RGBtoHex(this.style.backgroundColor);
			ColorPicker.focus();
			ColorPicker.click();
		}
	}
	document.getElementById("color_picker").oninput = function(event) {
		document.getElementById(this.getAttribute("PickColor")).style.backgroundColor = this.value;
	}
	

	document.getElementById("group_list").ondragleave = function(event) {
		if (opt.open_tree_on_hover) {
			clearTimeout(tt.DragOverTimer);
			tt.DragOverId = "";
		}
	}
	
	
	// CATCH KEYBOARD GLOBAL KEYS
	document.body.onkeydown = function(event) {
		// ctrl+a to select all
		if (event.ctrlKey && event.which == 65) {
			if (document.querySelector(".pin>.tab_header_hover") != null) {
				document.querySelectorAll(".pin").forEach(function(s) {
					s.classList.add("selected");
				});
			}
			if (document.querySelector("#"+tt.active_group+" .tab>.tab_header_hover") != null) {
				let rootId = document.querySelector("#"+tt.active_group+" .tab>.tab_header_hover").parentNode.parentNode.parentNode.id;
				document.querySelectorAll("#ct"+rootId+">.tab").forEach(function(s) {
					s.classList.add("selected");
				});
			}
		}
		// ctrl+i to invert selection
		if (event.ctrlKey && event.which == 73) {
			if (document.querySelector(".pin>.tab_header_hover") != null) {
				document.querySelectorAll(".pin").forEach(function(s) {
					s.classList.toggle("selected");
				});
			}
			if (document.querySelector("#"+tt.active_group+" .tab>.tab_header_hover") != null) {
				let rootId = document.querySelector("#"+tt.active_group+" .tab>.tab_header_hover").parentNode.parentNode.parentNode.id;
				document.querySelectorAll("#ct"+rootId+">.tab").forEach(function(s) {
					s.classList.toggle("selected");
				});
			}
		}
		// esc to unselect tabs and folders
		if (event.which == 27) {
			Deselect();
		}
		// alt+g to toggle group bar
		if (event.altKey && event.which == 71) {
			GroupsToolbarToggle();
		}

		// new folder
		if (event.which == 192 || event.which == 70) {
			if (tt.pressed_keys.indexOf(event.which) == -1) {
				tt.pressed_keys.push(event.which);
			}
			
			if (tt.pressed_keys.indexOf(192) != -1 && tt.pressed_keys.indexOf(70) != -1) {
				let FolderId = AddNewFolder({});
				ShowRenameFolderDialog(FolderId);
			}
		}

		RefreshGUI();
	}
	
	document.body.onkeyup = function(event) {
		if (tt.pressed_keys.indexOf(event.which) != -1) {
			tt.pressed_keys.splice(tt.pressed_keys.indexOf(event.which), 1);
		}
	}

	
	document.body.ondragover = function(event) {
		if (opt.debug) {
			log("drag over: "+event.target.id);
		}
		event.preventDefault();
	}	

	document.ondrop = function(event) {
		if (opt.debug) {
			log("dropped on window: "+tt.CurrentWindowId);
		}
		
		let Class = event.dataTransfer.getData("Class") ? event.dataTransfer.getData("Class") : "";
		let Nodes = event.dataTransfer.getData("Nodes") ? JSON.parse(event.dataTransfer.getData("Nodes")) : [];
		
		
		
		
		let Tabs = event.dataTransfer.getData("Tabs") ? JSON.parse(event.dataTransfer.getData("Tabs")) : [];
		console.log(Tabs);

		let Group = event.dataTransfer.getData("Group") ? JSON.parse(event.dataTransfer.getData("Group")) : {};
		let DraggedTabNode = event.dataTransfer.getData("DraggedTabNode") ? event.dataTransfer.getData("DraggedTabNode") : false;
		let TabsIds = event.dataTransfer.getData("TabsIds") ? JSON.parse(event.dataTransfer.getData("TabsIds")) : [];
		let TabsIdsParents = event.dataTransfer.getData("TabsIdsParents") ? JSON.parse(event.dataTransfer.getData("TabsIdsParents")) : [];
		let TabsIdsSelected = event.dataTransfer.getData("TabsIdsSelected") ? JSON.parse(event.dataTransfer.getData("TabsIdsSelected")) : [];
		let Folders = event.dataTransfer.getData("Folders") ? JSON.parse(event.dataTransfer.getData("Folders")) : [];
		console.log(Folders);
		let FoldersSelected = event.dataTransfer.getData("FoldersSelected") ? JSON.parse(event.dataTransfer.getData("FoldersSelected")) : [];
		let SourceWindowId = event.dataTransfer.getData("SourceWindowId") ? JSON.parse(event.dataTransfer.getData("SourceWindowId")) : 0;
		let target = document.querySelector(".highlighted_drop_target");

		let ActiveGroup = document.getElementById(tt.active_group);
		let Scroll = ActiveGroup.scrollTop;

		clearTimeout(tt.DragOverTimer);
		tt.DragOverId = "";
		
		event.preventDefault();

		if (SourceWindowId == tt.CurrentWindowId) {
			if (Class == "group") {
				DropToTarget({Class: Class, Nodes: Nodes, DraggedTabNode: DraggedTabNode, TargetNode: target, TabsIds: [], TabsIdsSelected: [], TabsIdsParents: [], Folders: {}, FoldersSelected: [], Group: Group, Scroll: Scroll});
			} else {
				// DropToTarget({Class: Class, DraggedTabNode: DraggedTabNode, TargetNode: target, TabsIds: TabsIds, TabsIdsSelected: TabsIdsSelected, TabsIdsParents: TabsIdsParents, Folders: Folders, FoldersSelected: FoldersSelected, Group: Group, Scroll: Scroll});
				DropToTarget({Class: Class, Nodes: Nodes, TargetNode: target, Group: Group, Scroll: Scroll});
			}
		} else {
			FreezeSelection();

			if (Object.keys(Group).length > 0) {
				tt.groups[Group.id] = Object.assign({}, Group);
				AppendGroupToList(Group.id, Group.name, Group.font, true);
			}


			if (Object.keys(Folders).length > 0) {
				for (var folderId in Folders) {
					AddNewFolder({folderId: folderId, ParentId: Folders[folderId].parent, Name: Folders[folderId].name, Index: Folders[folderId].index, ExpandState: Folders[folderId].expand, AdditionalClass: (FoldersSelected.indexOf(folderId) != -1 ? "selected" : undefined)});
					chrome.runtime.sendMessage({ command: "remove_folder", folderId: folderId });
				}
			}
			
			if (opt.debug) {
				log("DragAndDrop: will now move tabs");
			}

			chrome.tabs.move(TabsIds, { windowId: tt.CurrentWindowId, index: -1 }, function(MovedTab) {
				setTimeout(function() {
					DropToTarget({Class: "tree", Nodes: Nodes, DraggedTabNode: DraggedTabNode, TargetNode: target, TabsIds: TabsIds, TabsIdsSelected: TabsIdsSelected, TabsIdsParents: TabsIdsParents, Folders: Folders, FoldersSelected: FoldersSelected, Group: Group, Scroll: Scroll});
					chrome.runtime.sendMessage({ command: "remove_group", groupId: Group.id });
				}, 2000);
			});
		}
	}


	document.ondragleave = function(event) {
		if (opt.debug) {
			log("global dragleave");
		}
		RemoveHighlight();
		if (opt.open_tree_on_hover) {
			clearTimeout(tt.DragOverTimer);
			tt.DragOverId = "";
		}
	}

	document.ondragend = function(event) {
		if (opt.debug) {
			log("drag_end");
		}
		if (opt.open_tree_on_hover) {
			clearTimeout(tt.DragOverTimer);
			tt.DragOverId = "";
		}
		// DETACHING TEMPORARILY DISABLED PLEASE USE MENU OR TOOLBAR!
		// if (DragAndDrop.ComesFromWindowId == tt.CurrentWindowId && DragAndDrop.DroppedToWindowId == 0) {
			// if ((browserId == "F" && ( event.screenX < event.view.mozInnerScreenX || event.screenX > (event.view.mozInnerScreenX + window.innerWidth) || event.screenY < event.view.mozInnerScreenY || event.screenY > (event.view.mozInnerScreenY + window.innerHeight)))||	(browserId != "F" && (event.pageX < 0 || event.pageX > window.outerWidth || event.pageY < 0 || event.pageY > window.outerHeight))) {
				// log("dragged outside sidebar");
				// if (tt.DragNodeClass == "tree") {
					// Detach(DragAndDrop.TabsIds, {});
				// }
				// if (tt.DragNodeClass == "tree") {
					// Detach(DragAndDrop.TabsIds, DragAndDrop.Folders);
					// setTimeout(function() {
						// SaveFolders();
					// }, 500);
				// }
			// }
		// }
		setTimeout(function() {
			CleanUpDragClasses();
			chrome.runtime.sendMessage({command: "dragend"});
		}, 500);
	}
}


function BindTabsSwitchingToMouseWheel(Id) {
	if (opt.debug) {
		log("f: BindTabsSwitchingToMouseWheel, binding tabs switch to group: "+Id);
	}

	document.getElementById(Id).onwheel = function(event) {
		event.preventDefault();
		let prev = event.deltaY < 0;
		if (prev) {
			ActivatePrevTab(true);
			// ActivatePrevTabBeforeClose(true);
		} else {
			ActivateNextTab(true);
			// ActivateNextTabBeforeClose(true);
		}
	}
}

function InsertDropToTarget(p) {
	if (p.inside) {
		for (let i = 0; i < p.Nodes.length; i++) {
			let Node = document.getElementById(p.Nodes[i].id);
			if (Node != null) {
				if (p.Nodes[i].selected) {
					AppendToNode(Node, p.TargetNode);
					if (p.Nodes[i].temporary) {
						Node.classList.add("selected_temporarly");
					}
					if (p.Nodes[i].NodeClass == "tab" && Node.classList.contains("selected") == false) {
						Node.classList.add("selected");
					}
					if (p.Nodes[i].NodeClass == "folder" && Node.classList.contains("selected") == false) {
						Node.classList.add("selected");
					}
				} else {
					if (Node.parentNode.id != p.Nodes[i].parent) {
						AppendToNode(Node, document.getElementById(p.Nodes[i].parent));
					}
				}
			}
		}		
	} else {
		for (let i = (p.after ? (p.Nodes.length-1) : 0); (p.after ? i >= 0 : i < p.Nodes.length); (p.after ? i-- : i++)) {
			let Node = document.getElementById(p.Nodes[i].id);
			if (Node != null) {
				if (p.Nodes[i].selected) {
					if (p.after) {
						InsterAfterNode(Node, p.TargetNode);
					} else {
						InsterBeforeNode(Node, p.TargetNode);
					}
					if (p.Nodes[i].temporary) {
						Node.classList.add("selected_temporarly");
					}
					if (p.Nodes[i].NodeClass == "tab" && Node.classList.contains("selected") == false) {
						Node.classList.add("selected");
					}
					if (p.Nodes[i].NodeClass == "folder" && Node.classList.contains("selected") == false) {
						Node.classList.add("selected");
					}
				} else {
					if (Node.parentNode.id != p.Nodes[i].parent) {
						AppendToNode(Node, document.getElementById(p.Nodes[i].parent));
					}
				}
			}
		}
	}
}



function DropToTarget(p) { // Class: ("group", "tab", "folder"), DraggedTabNode: TabId, TargetNode: query node, TabsIdsSelected: arr of selected tabIds, TabsIds: arr of tabIds, TabsIdsParents: arr of parent tabIds, Folders: object with folders objects, FoldersSelected: arr of selected folders ids, Group: groupId, Scroll: bool
	if (p.TargetNode != null) {
		// if (opt.debug) {
			// log("f: DropToTarget, DragNodeClass: "+p.Class+", TargetNode: "+p.TargetNode.id+", TabsIdsSelected: "+JSON.stringify(p.TabsIdsSelected)+", TabsIds: "+JSON.stringify(p.TabsIds)+", TabsIdsParents: "+JSON.stringify(p.TabsIdsParents)+", Folders: "+JSON.stringify(p.Folders)+", FoldersSelected: "+JSON.stringify(p.FoldersSelected)  );
		// }

		let ActiveGroup = document.getElementById(tt.active_group);
		let pinTabs = false;
		let SelectedTabsAppendTarget;
		let FoldersSelectedAppendTarget;

		
		
		
		
		console.log("TargetNode.classList");
		console.log(p.TargetNode.classList);
		
		
		// let NewParent = null;

		// if (p.TargetNode.classList.contains("group_button")) { // dropped on group button (group list)
			// NewParent = document.getElementById("°" + p.TargetNode.id.substr(1));
		// }
		
		// if (p.TargetNode.classList.contains("before")) {
			// NewParent = p.TargetNode.parentNode;
		// }
		// if (p.TargetNode.classList.contains("after")) {
			// for (let i = p.TabsIdsSelected.length-1; i >= 0; i--) {
				// InsterAfterNode(document.getElementById(p.TabsIdsSelected[i]), p.TargetNode);
			// }
		// }
		// if (p.TargetNode.classList.contains("inside")) {
			// SelectedTabsAppendTarget = p.TargetNode.childNodes[1];
		// }
		
				// console.log(p.Class);
		
		if (p.Class == "tree") {
			
			if (p.TargetNode.classList.contains("tab") || p.TargetNode.classList.contains("folder")) {
				InsertDropToTarget({TargetNode: (p.TargetNode.classList.contains("inside") ? p.TargetNode.childNodes[1] : p.TargetNode), Nodes: p.Nodes, after: p.TargetNode.classList.contains("after"), inside: p.TargetNode.classList.contains("inside")});
			}
			
			if (p.TargetNode.classList.contains("pin")) {
				pinTabs = true;
				InsertDropToTarget({TargetNode: p.TargetNode, Nodes: p.Nodes, after: p.TargetNode.classList.contains("after"), inside: false});
			}
			
			if (p.TargetNode.id == "pin_list") {
				
				// for (var tabId in p.Tabs) {
					// InsertDropToTarget({id: tabId, selected: true, TargetNode: p.TargetNode, ParentId: "pin_list"});
				// }
				
				
				
				// let ActiveGroup = document.getElementById("#°"+tt.active_group);
				// for (var folderId in p.Folders) {
					// AppendToNode(document.getElementById(folderId), ActiveGroup);
				// }

				pinTabs = true;
				
				// for (let i = 0; i < p.Nodes.length; i++) {
					// let Node = document.getElementById(p.Nodes[i].id);
					// if (Node != null) {
						// if (p.Nodes[i].NodeClass == "tab") {
							// AppendToNode(Node, p.TargetNode);
							// if (p.Nodes[i].temporary) {
								// Node.classList.add("selected_temporarly");
							// }
						// }
					// }
				// }
			
				// SelectedTabsAppendTarget = p.TargetNode;
				// let PinList = document.getElementById("pin_list");
				// for (var tabId in p.Tabs) {
					// AppendToNode(document.getElementById(tabId), PinList);
				// }
			}

			if (p.TargetNode.classList.contains("group_button")) {
				let group = document.getElementById("°"+p.TargetNode.id.substr(1));
				console.log(group);
				// for (var tabId in p.Tabs) {
					// InsertDropToTarget({id: tabId, selected: p.Tabs[tabId].selected, TargetNode: group, ParentId: p.Tabs[tabId].parent});
					InsertDropToTarget({TargetNode: group, Nodes: p.Nodes, after: false, inside: true});
				// }
				
				// chrome.tabs.query({currentWindow: true, active: true}, function(activeTab) {
					// let Tab = document.getElementById(activeTab[0].id);
					// if (Tab != null && p.TabsIds.indexOf(activeTab[0].id) != -1) {
						// SetActiveGroup(p.TargetNode.id.substr(1), false, false);
						// SetActiveTab(activeTab[0].id, true);
					// }
				// });
			}

				// if (p.TargetNode.classList.contains("before")) {
					// p.TabsIdsSelected.forEach(function(tabId) {
						// InsterBeforeNode(document.getElementById(tabId), p.TargetNode);
					// });
				// }
				// if (p.TargetNode.classList.contains("after")) {
					// for (let i = p.TabsIdsSelected.length-1; i >= 0; i--) {
						// InsterAfterNode(document.getElementById(p.TabsIdsSelected[i]), p.TargetNode);
					// }
				// }
				// if (p.TargetNode.classList.contains("inside")) {
					// SelectedTabsAppendTarget = p.TargetNode.childNodes[1];
				// }
				// ActiveGroup.scrollTop = p.Scroll;
			// }

			// if (p.TargetNode.classList.contains("group")) {
				// SelectedTabsAppendTarget = p.TargetNode.childNodes[1];
				// ActiveGroup.scrollTop = p.Scroll;
			// }

			// if (p.TargetNode.classList.contains("folder")) {
				// SelectedTabsAppendTarget = p.TargetNode.childNodes[1];
				// ActiveGroup.scrollTop = p.Scroll;
			// }
			
			// if (p.TargetNode.classList.contains("group_button")) { // dropped on group button (group list)
				// SelectedTabsAppendTarget = document.getElementById("cf" + (p.TargetNode.id.substr(1)));
			// }
			setTimeout(function() {
				SaveFolders();
			}, 600);
		}

		
		// if (p.Class == "folder") {
			// if (p.TargetNode.classList.contains("tab") || p.TargetNode.classList.contains("folder")) { // dropped on folder
				// if (p.TargetNode.classList.contains("before")) {
					// p.FoldersSelected.forEach(function(folderId) {
						// InsterBeforeNode(document.getElementById(folderId), p.TargetNode);
					// });
				// }
				// if (p.TargetNode.classList.contains("after")) {
					// for(let i = p.FoldersSelected.length-1; i >= 0; i--) {
						// InsterAfterNode(document.getElementById(p.FoldersSelected[i]), p.TargetNode);
					// }
				// }
				// if (p.TargetNode.classList.contains("inside")) {
					// FoldersSelectedAppendTarget = p.TargetNode.childNodes[1];
				// }
				// ActiveGroup.scrollTop = p.Scroll;
			// }
			
			// if (p.TargetNode.classList.contains("group")) {
				// FoldersSelectedAppendTarget = p.TargetNode.childNodes[1];
				// ActiveGroup.scrollTop = p.Scroll;
			// }
			
			// if (p.TargetNode.classList.contains("group_button")) { // dropped on group button (group list)
				// FoldersSelectedAppendTarget = document.getElementById("cf" + p.TargetNode.id.substr(1));
			// }

			// setTimeout(function() {
				// SaveFolders();
			// }, 600);
		// }



		if (p.Class == "group") {
			if (p.TargetNode.classList.contains("before")) {
				InsterBeforeNode(document.getElementById("_"+p.Group.id), p.TargetNode);
			}
			if (p.TargetNode.classList.contains("after")) {
				InsterAfterNode(document.getElementById("_"+p.Group.id), p.TargetNode);
			}
			UpdateBgGroupsOrder();
			RearrangeGroupsLists();
			if (opt.syncro_tabbar_groups_tabs_order) {
				tt.schedule_rearrange_tabs++;
			}
		}
		
		// if (FoldersSelectedAppendTarget) {
			// p.FoldersSelected.forEach(function(folderId) {
				// AppendToNode(document.getElementById(folderId), FoldersSelectedAppendTarget);
			// });
		// }

		// if (SelectedTabsAppendTarget) {
			// p.TabsIdsSelected.forEach(function(tabId) {
				// AppendToNode(document.getElementById(tabId), SelectedTabsAppendTarget);
			// });
		// }
		
		
		// recheck new structure
		// if (Object.keys(p.Folders).length > 0) {
			// for (var folderId in p.Folders) {
				// if (p.FoldersSelected.indexOf(folderId) == -1) {
					// let Folder = document.getElementById(folderId);
					// if (Folder != null && Folder.parentNode.id != "cf" + p.Folders[folderId].parent) {
						// let FolderParent = document.getElementById("cf" + p.Folders[folderId].parent);
						// if (FolderParent != null) {
							// FolderParent.appendChild(Folder);
						// }
					// }
				// }
			// }
		// }




		// if (p.TabsIds.length) {
			// if (pinTabs) {
				// for (var ind = 0; ind < p.TabsIds.length; ind++) {
					// let Tab = document.getElementById(p.TabsIds[ind]);
					// if (Tab != null && Tab.parentNode.id != "pin_list") {
						// document.getElementById("pin_list").appendChild(Tab);
					// }
				// }
			// } else {
				// for (var ind = 0; ind < p.TabsIds.length; ind++) {
					// if (p.TabsIdsSelected.indexOf(p.TabsIds[ind]) == -1) {
						// let Tab = document.getElementById(p.TabsIds[ind]);
						// let TabParent = document.getElementById(p.TabsIdsParents[ind]);
						// if (TabParent != null && Tab != null && TabParent.id != Tab.parentNode.id) {
							// TabParent.appendChild(Tab);
						// }
					// }
				// }
			// }
		// }

		
		
		
		// SetMultiTabsClass(p.TabsIds, pinTabs);

		for (var n in p.Nodes) {
			if (p.Nodes[n].NodeClass == "pin" || p.Nodes[n].NodeClass == "tab") {
				console.log(p.Nodes[n]);
				SetTabClass(p.Nodes[n].id, pinTabs);
				chrome.tabs.update(parseInt(p.Nodes[n].id), {pinned: pinTabs});
			}
		}
		
		
		// p.TabsIdsSelected.forEach(function(selectedTabId) {
			// let selectedTab = document.getElementById(selectedTabId);
			// if (selectedTab != null) {
				// selectedTab.classList.add("selected");
			// }
		// });

		// if (p.DraggedTabNode) {
			// let tabNode = document.getElementById(p.DraggedTabNode);
			// if (tabNode != null) {
				// tabNode.classList.add("selected_temporarly");
			// }
		// }
		
		
/* 		
		if (opt.syncro_tabbar_tabs_order && p.Nodes[0] != undefined) {
			let tabIds = Array.prototype.map.call(document.querySelectorAll(".pin, .tab"), function(s) {
				return parseInt(s.id);
			});
			
			// if (opt.debug) {
				// log(  "f: DropToTarget, will Syncro tabbar tabs order, TabsIds array is:"+JSON.stringify(p.TabsIds)  );
			// }
				
			chrome.tabs.move(p.TabsIds, {index: tabIds.indexOf(p.TabsIds[0])});
			setTimeout(function() {
				tt.schedule_rearrange_tabs++;
			}, 500);
		}
		
		 */
		
	}
	
	KeepOnlyOneActiveTabInGroup();

	RefreshExpandStates();
	RefreshCounters();
	
	setTimeout(function() {
		CleanUpDragClasses();
		RemoveHighlight();
	}, 100);
	
	setTimeout(function() {
		// RefreshExpandStates();
		// RefreshCounters();
		tt.schedule_update_data++;
		RefreshGUI();
		EmptyDragAndDrop();

		if (opt.debug) {
			log("DropToTarget END");
		}
	}, 500);

}