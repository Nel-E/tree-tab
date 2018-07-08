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

	document.oncontextmenu = function (event) {
		if (!event.ctrlKey && event.target.classList.contains("text_input") == false) {
			event.preventDefault();
			event.stopPropagation();
			return false;
		}
	};

	window.addEventListener('contextmenu', function (event) {
		if (!event.ctrlKey && event.target.classList.contains("text_input") == false) {
			event.preventDefault();
			event.stopPropagation();
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
				DeselectFolders();
				DeselectTabs();
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
		if (event.target.id == "pin_list" && tt.DragNodeClass == "tab" && this.classList.contains("highlighted_drop_target") == false) {
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
				document.querySelectorAll(".pin").forEach(function(s){
					s.classList.add("selected_tab");
				});
			}
			if (document.querySelector("#"+tt.active_group+" .tab>.tab_header_hover") != null) {
				let rootId = document.querySelector("#"+tt.active_group+" .tab>.tab_header_hover").parentNode.parentNode.parentNode.id;
				document.querySelectorAll("#ct"+rootId+">.tab").forEach(function(s){
					s.classList.add("selected_tab");
				});
			}
		}
		// ctrl+i to invert selection
		if (event.ctrlKey && event.which == 73) {
			if (document.querySelector(".pin>.tab_header_hover") != null) {
				document.querySelectorAll(".pin").forEach(function(s){
					s.classList.toggle("selected_tab");
				});
			}
			if (document.querySelector("#"+tt.active_group+" .tab>.tab_header_hover") != null) {
				let rootId = document.querySelector("#"+tt.active_group+" .tab>.tab_header_hover").parentNode.parentNode.parentNode.id;
				document.querySelectorAll("#ct"+rootId+">.tab").forEach(function(s){
					s.classList.toggle("selected_tab");
				});
			}
		}
		// esc to deselect tabs
		if (event.which == 27) {
			DeselectTabs();
			DeselectFolders();
		}
		// alt+g to toggle group bar
		if (event.altKey && event.which == 71) {
			GroupsToolbarToggle();
		}

		// new folder
		if (event.which == 192 && event.which == 70 && event.which == 69) {
			let FolderId = AddNewFolder({SetEvents: true});
			ShowRenameFolderDialog(FolderId);
		}
		RefreshGUI();
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
		let Group = event.dataTransfer.getData("Group") ? JSON.parse(event.dataTransfer.getData("Group")) : {};
		let DraggedTabNode = event.dataTransfer.getData("DraggedTabNode") ? event.dataTransfer.getData("DraggedTabNode") : false;
		let TabsIds = event.dataTransfer.getData("TabsIds") ? JSON.parse(event.dataTransfer.getData("TabsIds")) : [];
		let TabsIdsParents = event.dataTransfer.getData("TabsIdsParents") ? JSON.parse(event.dataTransfer.getData("TabsIdsParents")) : [];
		let TabsIdsSelected = event.dataTransfer.getData("TabsIdsSelected") ? JSON.parse(event.dataTransfer.getData("TabsIdsSelected")) : [];
		let Folders = event.dataTransfer.getData("Folders") ? JSON.parse(event.dataTransfer.getData("Folders")) : {};
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
				DropToTarget({Class: Class, DraggedTabNode: DraggedTabNode, TargetNode: target, TabsIds: [], TabsIdsSelected: [], TabsIdsParents: [], Folders: {}, FoldersSelected: [], Group: Group, Scroll: Scroll});
			} else {
				DropToTarget({Class: Class, DraggedTabNode: DraggedTabNode, TargetNode: target, TabsIds: TabsIds, TabsIdsSelected: TabsIdsSelected, TabsIdsParents: TabsIdsParents, Folders: Folders, FoldersSelected: FoldersSelected, Group: Group, Scroll: Scroll});
			}
		} else {
			FreezeSelected();

			if (Object.keys(Group).length > 0) {
				tt.groups[Group.id] = Object.assign({}, Group);
				AppendGroupToList(Group.id, Group.name, Group.font, true);
			}


			if (Object.keys(Folders).length > 0) {
				for (var folderId in Folders) {
					AddNewFolder({folderId: folderId, ParentId: Folders[folderId].parent, Name: Folders[folderId].name, Index: Folders[folderId].index, ExpandState: Folders[folderId].expand, AdditionalClass: (FoldersSelected.indexOf(folderId) != -1 ? "selected_folder" : undefined), SetEvents: true});
					chrome.runtime.sendMessage({ command: "remove_folder", folderId: folderId });
				}
			}
			
			if (opt.debug) {
				log("DragAndDrop: will now move tabs");
			}

			chrome.tabs.move(TabsIds, { windowId: tt.CurrentWindowId, index: -1 }, function(MovedTab) {
				setTimeout(function() {
					DropToTarget({Class: Class, DraggedTabNode: DraggedTabNode, TargetNode: target, TabsIds: TabsIds, TabsIdsSelected: TabsIdsSelected, TabsIdsParents: TabsIdsParents, Folders: Folders, FoldersSelected: FoldersSelected, Group: Group, Scroll: Scroll});
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
		if (opt.open_tree_on_hover) {
			clearTimeout(tt.DragOverTimer);
			tt.DragOverId = "";
		}
		// log("document dragend");
		// DETACHING TEMPORARILY DISABLED PLEASE USE MENU OR TOOLBAR!
		// if (DragAndDrop.ComesFromWindowId == tt.CurrentWindowId && DragAndDrop.DroppedToWindowId == 0) {
			// if ((browserId == "F" && ( event.screenX < event.view.mozInnerScreenX || event.screenX > (event.view.mozInnerScreenX + window.innerWidth) || event.screenY < event.view.mozInnerScreenY || event.screenY > (event.view.mozInnerScreenY + window.innerHeight)))||	(browserId != "F" && (event.pageX < 0 || event.pageX > window.outerWidth || event.pageY < 0 || event.pageY > window.outerHeight))) {
				// log("dragged outside sidebar");
				// if (tt.DragNodeClass == "tab") {
					// Detach(DragAndDrop.TabsIds, {});
				// }
				// if (tt.DragNodeClass == "folder") {
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
			ActivatePrevTab();
		} else {
			ActivateNextTab();
		}
	}
}

function RemoveHighlight() {
	document.querySelectorAll(".highlighted_drop_target").forEach(function(s){
		if (opt.debug) {
			log("removing highlight of: " + s.id);
		}
		s.classList.remove("before");
		s.classList.remove("after");
		s.classList.remove("inside");
		s.classList.remove("highlighted_drop_target");
	});
}

function RemoveHeadersHoverClass() {
	document.querySelectorAll(".folder_header_hover, .tab_header_hover").forEach(function(s){
		if (opt.debug) {
			log("removing hover of: " + s.id);
		}
		s.classList.remove("folder_header_hover");
		s.classList.remove("tab_header_hover");
	});
}



function DropToTarget(p) { // Class: ("group", "tab", "folder"), DraggedTabNode: TabId, TargetNode: query node, TabsIdsSelected: arr of selected tabIds, TabsIds: arr of tabIds, TabsIdsParents: arr of parent tabIds, Folders: object with folders objects, FoldersSelected: arr of selected folders ids, Group: groupId, Scroll: bool
	if (p.TargetNode != null) {
		if (opt.debug) {
			log("f: DropToTarget, DragNodeClass: "+p.Class+", TargetNode: "+p.TargetNode.id+", TabsIdsSelected: "+JSON.stringify(p.TabsIdsSelected)+", TabsIds: "+JSON.stringify(p.TabsIds)+", TabsIdsParents: "+JSON.stringify(p.TabsIdsParents)+", Folders: "+JSON.stringify(p.Folders)+", FoldersSelected: "+JSON.stringify(p.FoldersSelected)  );
		}

		let ActiveGroup = document.getElementById(tt.active_group);
		let pinTabs = false;
		let SelectedTabsAppendTarget;
		let FoldersSelectedAppendTarget;

		if (p.Class == "tab") {
			if (p.TargetNode.classList.contains("pin")) {
				pinTabs = true;
				if (p.TargetNode.classList.contains("before")) {
					p.TabsIds.forEach(function(tabId){
						InsterBeforeNode(document.getElementById(tabId), p.TargetNode);
					});
				}
				if (p.TargetNode.classList.contains("after")) {
					for (let i = p.TabsIds.length-1; i >= 0; i--) {
						InsterAfterNode(document.getElementById(p.TabsIds[i]), p.TargetNode);
					}
				}
			}

			if (p.TargetNode.classList.contains("tab")) {
				if (p.TargetNode.classList.contains("before")) {
					p.TabsIdsSelected.forEach(function(tabId){
						InsterBeforeNode(document.getElementById(tabId), p.TargetNode);
					});
				}
				if (p.TargetNode.classList.contains("after")) {
					for (let i = p.TabsIdsSelected.length-1; i >= 0; i--) {
						InsterAfterNode(document.getElementById(p.TabsIdsSelected[i]), p.TargetNode);
					}
				}
				if (p.TargetNode.classList.contains("inside")) {
					SelectedTabsAppendTarget = p.TargetNode.childNodes[1];
				}
				ActiveGroup.scrollTop = p.Scroll;
			}

			if (p.TargetNode.id == "pin_list") {
				pinTabs = true;
				SelectedTabsAppendTarget = p.TargetNode;
			}

			if (p.TargetNode.classList.contains("group")) {
				SelectedTabsAppendTarget = p.TargetNode.childNodes[1];
				ActiveGroup.scrollTop = p.Scroll;
			}

			if (p.TargetNode.classList.contains("folder")) {
				SelectedTabsAppendTarget = p.TargetNode.childNodes[2];
				ActiveGroup.scrollTop = p.Scroll;
			}
			
			if (p.TargetNode.classList.contains("group_button")) { // dropped on group button (group list)
				SelectedTabsAppendTarget = document.getElementById("ct" + (p.TargetNode.id.substr(1)));
			}
		}

		
		if (p.Class == "folder") {
			if (p.TargetNode.classList.contains("folder")) { // dropped on folder
				if (p.TargetNode.classList.contains("before")) {
					p.FoldersSelected.forEach(function(folderId){
						InsterBeforeNode(document.getElementById(folderId), p.TargetNode);
					});
				}
				if (p.TargetNode.classList.contains("after")) {
					for(let i = p.FoldersSelected.length-1; i >= 0; i--) {
						InsterAfterNode(document.getElementById(p.FoldersSelected[i]), p.TargetNode);
					}
				}
				if (p.TargetNode.classList.contains("inside")) {
					FoldersSelectedAppendTarget = p.TargetNode.childNodes[1];
				}
				ActiveGroup.scrollTop = p.Scroll;
			}
			
			if (p.TargetNode.classList.contains("group")) {
				FoldersSelectedAppendTarget = p.TargetNode.childNodes[0];
				ActiveGroup.scrollTop = p.Scroll;
			}
			
			if (p.TargetNode.classList.contains("group_button")) { // dropped on group button (group list)
				FoldersSelectedAppendTarget = document.getElementById("cf" + p.TargetNode.id.substr(1));
			}

			setTimeout(function() {
				SaveFolders();
			}, 600);
		}

		if (p.TargetNode.classList.contains("group_button") && (p.Class == "tab" || p.Class == "folder")) {
			chrome.tabs.query({currentWindow: true, active: true}, function(activeTab) {
				let Tab = document.getElementById(activeTab[0].id);
				if (Tab != null && p.TabsIds.indexOf(activeTab[0].id) != -1) {
					SetActiveGroup(p.TargetNode.id.substr(1), false, false);
					SetActiveTab(activeTab[0].id, true);
				}
			});
		}

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
		
		if (FoldersSelectedAppendTarget) {
			p.FoldersSelected.forEach(function(folderId){
				AppendToNode(document.getElementById(folderId), FoldersSelectedAppendTarget);
			});
		}

		if (SelectedTabsAppendTarget) {
			p.TabsIdsSelected.forEach(function(tabId){
				AppendToNode(document.getElementById(tabId), SelectedTabsAppendTarget);
			});
		}
		
		
		// recheck new structure
		if (Object.keys(p.Folders).length > 0) {
			for (var folderId in p.Folders) {
				if (p.FoldersSelected.indexOf(folderId) == -1) {
					let Folder = document.getElementById(folderId);
					if (Folder != null && Folder.parentNode.id != "cf" + p.Folders[folderId].parent) {
						let FolderParent = document.getElementById("cf" + p.Folders[folderId].parent);
						if (FolderParent != null) {
							FolderParent.appendChild(Folder);
						}
					}
				}
			}
		}




		if (p.TabsIds.length) {
			if (pinTabs) {
				for (var ind = 0; ind < p.TabsIds.length; ind++) {
					let Tab = document.getElementById(p.TabsIds[ind]);
					if (Tab != null && Tab.parentNode.id != "pin_list") {
						document.getElementById("pin_list").appendChild(Tab);
					}
				}
			} else {
				for (var ind = 0; ind < p.TabsIds.length; ind++) {
					if (p.TabsIdsSelected.indexOf(p.TabsIds[ind]) == -1) {
						let Tab = document.getElementById(p.TabsIds[ind]);
						let TabParent = document.getElementById(p.TabsIdsParents[ind]);
						if (TabParent != null && Tab != null && TabParent.id != Tab.parentNode.id) {
							TabParent.appendChild(Tab);
						}
					}
				}
			}
		}

		
		
		
		SetMultiTabsClass(p.TabsIds, pinTabs);

		p.TabsIdsSelected.forEach(function(selectedTabId) {
			let selectedTab = document.getElementById(selectedTabId);
			if (selectedTab != null) {
				selectedTab.classList.add("selected_tab");
			}
		});

		if (p.DraggedTabNode) {
			let tabNode = document.getElementById(p.DraggedTabNode);
			if (tabNode != null) {
				tabNode.classList.add("selected_temporarly");
			}
		}
		
		if (opt.syncro_tabbar_tabs_order && p.TabsIds[0] != undefined) {
			let tabIds = Array.prototype.map.call(document.querySelectorAll(".pin, .tab"), function(s){
				return parseInt(s.id);
			});
			
			if (opt.debug) {
				log(  "f: DropToTarget, will Syncro tabbar tabs order, TabsIds array is:"+JSON.stringify(p.TabsIds)  );
			}
				
			chrome.tabs.move(p.TabsIds, {index: tabIds.indexOf(p.TabsIds[0])});
			setTimeout(function() {
				tt.schedule_rearrange_tabs++;
			}, 500);
		}
	}
	
	KeepOnlyOneActiveTabInGroup();

	setTimeout(function() {
		RefreshExpandStates();
		RefreshCounters();
		tt.schedule_update_data++;
		RefreshGUI();
		EmptyDragAndDrop();

		if (opt.debug) {
			log("DropToTarget END");
		}
	}, 500);

	setTimeout(function() {
		CleanUpDragClasses();
		RemoveHighlight();
	}, 100);
}



function FreezeSelected() {
	document.querySelectorAll(".selected_tab").forEach(function(s){
		if (opt.debug) {
			log("freezing selected tab: " + s.id);
		}
		s.classList.add("selected_frozen");
		s.classList.remove("selected_tab");
		s.classList.remove("selected_last");
	});
	document.querySelectorAll(".selected_folder").forEach(function(s){
		if (opt.debug) {
			log("freezing selected folder: " + s.id);
		}
		s.classList.add("selected_folder_frozen");
		s.classList.remove("selected_folder");
	});
}


function CleanUpDragClasses() {
	if (opt.debug) {
		log("f: CleanUpDragClasses, unfreezing and removing temporary classes...");
	}
	document.querySelectorAll(".selected_frozen").forEach(function(s){
		s.classList.add("selected_tab");
		s.classList.remove("selected_frozen");
	});
	document.querySelectorAll(".selected_temporarly").forEach(function(s){
		s.classList.remove("selected_tab");
		s.classList.remove("selected_temporarly");
	});
	document.querySelectorAll(".selected_folder_frozen").forEach(function(s){
		s.classList.add("selected_folder");
		s.classList.remove("selected_folder_frozen");
	});
	document.querySelectorAll(".selected_folder_temporarly").forEach(function(s){
		s.classList.remove("selected_folder");
		s.classList.remove("selected_folder_temporarly");
	});
	document.querySelectorAll(".tab_header_hover").forEach(function(s){
		s.classList.remove("tab_header_hover");
	});
	document.querySelectorAll(".folder_header").forEach(function(s){
		s.classList.remove("folder_header_hover");
	});
	document.querySelectorAll(".dragged_tree").forEach(function(s){
		s.classList.remove("dragged_tree");
	});
	document.querySelectorAll(".dragged_parents").forEach(function(s){
		s.classList.remove("dragged_parents");
	});
}

function EmptyDragAndDrop() {
	if (opt.debug) {
		log("f: EmptyDragAndDrop and removing DragNodeClass...");
	}
	tt.DragNodeClass = "";
	tt.DragTreeDepth = 0;
}