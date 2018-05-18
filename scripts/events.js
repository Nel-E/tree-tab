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
	document.oncontextmenu = function(event){
		if (!event.ctrlKey && event.target.classList.contains("text_input") == false) {
			event.preventDefault();
		}
	}	
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
		if (event.target.id == "pin_list" && DragNodeClass == "tab" && this.classList.contains("highlighted_drop_target") == false) {
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
	
	
	
	// CATCH KEYBOARD GLOBAL KEYS
	document.body.onkeydown = function(event) {
		// ctrl+a to select all
		if (event.ctrlKey && event.which == 65) {
			if (document.querySelector(".pin>.tab_header_hover") != null) {
				document.querySelectorAll(".pin").forEach(function(s){
					s.classList.add("selected_tab");
				});
			}
			if (document.querySelector("#"+active_group+" .tab>.tab_header_hover") != null) {
				let rootId = document.querySelector("#"+active_group+" .tab>.tab_header_hover").parentNode.parentNode.parentNode.id;
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
			if (document.querySelector("#"+active_group+" .tab>.tab_header_hover") != null) {
				let rootId = document.querySelector("#"+active_group+" .tab>.tab_header_hover").parentNode.parentNode.parentNode.id;
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
		RefreshGUI();
	}

	
	document.body.ondragover = function(event) {
		if (opt.debug) {
			log("drag over: "+event.target.id);
		}
		event.preventDefault();
		if (event.target.parentNode.classList.contains("c") && event.target.parentNode.classList.contains("dragged_tree") == false) {
			if (DragOverTimer && opt.open_tree_on_hover) {
				event.target.parentNode.classList.add("o");
				event.target.parentNode.classList.remove("c");
				DragOverTimer = false;
			}
		}
	}	

	document.ondrop = function(event) {
		if (opt.debug) {
			log("dropped on window: "+CurrentWindowId);
		}

		let TabsIds = event.dataTransfer.getData("TabsIds") ? JSON.parse(event.dataTransfer.getData("TabsIds")) : [];
		let TabsIdsParents = event.dataTransfer.getData("TabsIdsParents") ? JSON.parse(event.dataTransfer.getData("TabsIdsParents")) : [];
		let TabsIdsSelected = event.dataTransfer.getData("TabsIdsSelected") ? JSON.parse(event.dataTransfer.getData("TabsIdsSelected")) : [];
		let Folders = event.dataTransfer.getData("Folders") ? JSON.parse(event.dataTransfer.getData("Folders")) : {};
		let FoldersSelected = event.dataTransfer.getData("FoldersSelected") ? JSON.parse(event.dataTransfer.getData("FoldersSelected")) : [];
		let SourceWindowId = event.dataTransfer.getData("SourceWindowId") ? JSON.parse(event.dataTransfer.getData("SourceWindowId")) : 0;
		let target = document.querySelector(".highlighted_drop_target");

		event.preventDefault();
		
		if (SourceWindowId == CurrentWindowId) {
			DropToTarget(target, TabsIdsSelected, TabsIds, TabsIdsParents, Folders, FoldersSelected);
		} else {
			FreezeSelected();

			if (Object.keys(Folders).length > 0) {

				let SelectedFolders = Object.assign([], FoldersSelected);

				for (var folder in Folders) {
					AddNewFolder(folder, Folders[folder].parent, Folders[folder].name, Folders[folder].index, Folders[folder].expand, (FoldersSelected.indexOf(folder) != -1 ? "selected_folder" : undefined), true);
					chrome.runtime.sendMessage({ command: "remove_folder", folderId: Folders[folder].id });
				}
			}
			
			let counter = 0;
			if (TabsIds.length == 0) {
				DropToTarget(target, TabsIdsSelected, TabsIds, TabsIdsParents, Folders, FoldersSelected);
			} else {
				(TabsIds).forEach(function(TabId) {
					if (opt.debug) {
						log("DragAndDrop: will now move tab: "+TabId);
					}

					chrome.tabs.move(TabId, { windowId: CurrentWindowId, index: -1 }, function(MovedTab) {
						if (browserId == "F") {																																// MOZILLA BUG 1398272
							let MovedTabId = MovedTab[0] != undefined ? MovedTab[0].id : (MovedTab.id != undefined ? MovedTab.id : TabId);		// MOZILLA BUG 1398272
							if ((TabsIdsParents).indexOf("ct"+TabsIds[counter]) != -1) {																		// MOZILLA BUG 1398272
								TabsIdsParents[(TabsIdsParents).indexOf("ct"+TabsIds[counter])] = "ct"+MovedTabId;										// MOZILLA BUG 1398272
							}																																						// MOZILLA BUG 1398272
							if ((TabsIdsSelected).indexOf(TabsIds[counter]) != -1) {																				// MOZILLA BUG 1398272
								TabsIdsSelected[(TabsIdsSelected).indexOf(TabsIds[counter])] = MovedTabId;													// MOZILLA BUG 1398272
							}																																						// MOZILLA BUG 1398272
							TabsIds[counter] = MovedTabId;																												// MOZILLA BUG 1398272
						}																																							// MOZILLA BUG 1398272				
						counter++;
						if (counter == TabsIds.length) {
							setTimeout(function() {
								(TabsIdsSelected).forEach(function(selectedTabId) {
									let selectedTab = document.getElementById(selectedTabId);
									if (selectedTab != null) {
										selectedTab.classList.add("selected_temporarly");
										selectedTab.classList.add("selected_tab");
									}
								});
								DropToTarget(target, TabsIdsSelected, TabsIds, TabsIdsParents, Folders, FoldersSelected);
							}, 200);
						}
					});
				});
			}
		}
	}


	document.ondragleave = function(event) {
		if (opt.debug) {
			log("global dragleave");
		}

		if (event.target.classList) {
			if (event.target.classList.contains("drag_enter_center")) {
				DragOverTimer = false;
			}
		}
		RemoveHighlight();
	}

	document.ondragend = function(event) {
		// log("document dragend");
		// DETACHING TEMPORARILY DISABLED PLEASE USE MENU OR TOOLBAR!
		// if (DragAndDrop.ComesFromWindowId == CurrentWindowId && DragAndDrop.DroppedToWindowId == 0) {
			// if ((browserId == "F" && ( event.screenX < event.view.mozInnerScreenX || event.screenX > (event.view.mozInnerScreenX + window.innerWidth) || event.screenY < event.view.mozInnerScreenY || event.screenY > (event.view.mozInnerScreenY + window.innerHeight)))||	(browserId != "F" && (event.pageX < 0 || event.pageX > window.outerWidth || event.pageY < 0 || event.pageY > window.outerHeight))) {
				// log("dragged outside sidebar");
				// if (DragNodeClass == "tab") {
					// Detach(DragAndDrop.TabsIds, {});
				// }
				// if (DragNodeClass == "folder") {
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






function DropToTarget(TargetNode, TabsIdsSelected, TabsIds, TabsIdsParents, Folders, FoldersSelected) {
	if (TargetNode != null) {

		if (opt.debug) {
			log("f: DropToTarget, TargetNode: "+TargetNode.id+", TabsIdsSelected: "+JSON.stringify(TabsIdsSelected)+", TabsIds: "+JSON.stringify(TabsIds)+", TabsIdsParents: "+JSON.stringify(TabsIdsParents)+", Folders: "+JSON.stringify(Folders)+", FoldersSelected: "+JSON.stringify(FoldersSelected)  );
		}

		// let Append;
		let pinTabs = false;

		if (DragNodeClass == "tab") {
			if (TargetNode.classList.contains("pin")) {
				pinTabs = true;
				if (TargetNode.classList.contains("before")) {
					TabsIds.forEach(function(tabId){
						InsterBeforeNode(document.getElementById(tabId), TargetNode);
					});
				}
				if (TargetNode.classList.contains("after")) {
					for (let i = TabsIds.length-1; i >= 0; i--) {
						InsterAfterNode(document.getElementById(TabsIds[i]), TargetNode);
					}
				}
			}

			if (TargetNode.classList.contains("tab")) {
				if (TargetNode.classList.contains("before")) {
					TabsIdsSelected.forEach(function(tabId){
						InsterBeforeNode(document.getElementById(tabId), TargetNode);
					});
				}
				if (TargetNode.classList.contains("after")) {
					for (let i = TabsIdsSelected.length-1; i >= 0; i--) {
						InsterAfterNode(document.getElementById(TabsIdsSelected[i]), TargetNode);
					}
				}
				if (TargetNode.classList.contains("inside")) {
					TabsIdsSelected.forEach(function(tabId){
						AppendToNode(document.getElementById(tabId), TargetNode.childNodes[1]);
					});
				}
			}

			if (TargetNode.id == "pin_list") {
				pinTabs = true;
				TabsIds.forEach(function(tabId){
					AppendToNode(document.getElementById(tabId), TargetNode);
				});
			}

			if (TargetNode.classList.contains("group")) {
				TabsIdsSelected.forEach(function(tabId){
					AppendToNode(document.getElementById(tabId), TargetNode.childNodes[1]);
				});
			}

			if (TargetNode.classList.contains("folder")) {
				TabsIdsSelected.forEach(function(tabId){
					AppendToNode(document.getElementById(tabId), TargetNode.childNodes[2]);
				});
			}
			
			if (TargetNode.classList.contains("group_button")) { // dropped on group button (group list)
				TabsIdsSelected.forEach(function(tabId){
					AppendToNode(document.getElementById(tabId), document.getElementById("ct" + (TargetNode.id.substr(1))));
				});
			}
		}

		
		if (DragNodeClass == "folder") {
			if (TargetNode.classList.contains("folder")) { // dropped on folder
				if (TargetNode.classList.contains("before")) {
					FoldersSelected.forEach(function(folderId){
						InsterBeforeNode(document.getElementById(folderId), TargetNode);
					});
				}
				if (TargetNode.classList.contains("after")) {
					for(let i = FoldersSelected.length-1; i >= 0; i--) {
						InsterAfterNode(document.getElementById(FoldersSelected[i]), TargetNode);
					}
				}
				if (TargetNode.classList.contains("inside")) {
					FoldersSelected.forEach(function(folderId){
						AppendToNode(document.getElementById(folderId), TargetNode.childNodes[1]);
					});
				}
			}
			
			if (TargetNode.classList.contains("group")) {
				FoldersSelected.forEach(function(folderId){
					AppendToNode(document.getElementById(folderId), TargetNode.childNodes[0]);
				});
			}
			
			if (TargetNode.classList.contains("group_button")) { // dropped on group button (group list)
				FoldersSelected.forEach(function(folderId){
					AppendToNode(document.getElementById(folderId),  document.getElementById("cf" + TargetNode.id.substr(1)));
				});
			}

			setTimeout(function() {
				SaveFolders();
			}, 600);
		}

		if (TargetNode.classList.contains("group_button") && (DragNodeClass == "tab" || DragNodeClass == "folder")) {
			chrome.tabs.query({currentWindow: true, active: true}, function(activeTab) {
				let Tab = document.getElementById(activeTab[0].id);
				if (Tab != null && TabsIds.indexOf(activeTab[0].id) != -1) {
					SetActiveGroup(TargetNode.id.substr(1), false, false);
					SetActiveTab(activeTab[0].id, true);
				}
			});
		}

		if (DragNodeClass == "group") {
			if (TargetNode.classList.contains("before")) {
				InsterBeforeNode(document.querySelector(".dragged_group_button"), TargetNode);
			}
			if (TargetNode.classList.contains("after")) {
				InsterAfterNode(document.querySelector(".dragged_group_button"), TargetNode);
			}
			UpdateBgGroupsOrder();
			RearrangeGroupsLists();
			if (opt.syncro_tabbar_groups_tabs_order) {
				schedule_rearrange_tabs++;
			}		
		}
		
		SetMultiTabsClass(TabsIds, pinTabs);
		// SetMultiTabsClass(TabsIdsSelected, pinTabs);

		// recheck new structure
		if (TabsIds.length) {
			for (var ind = 0; ind < TabsIds.length; ind++) {
				if (TabsIdsSelected.indexOf(TabsIds[ind]) == -1) {
					let Tab = document.getElementById(TabsIds[ind]);
					let TabParent = document.getElementById(TabsIdsParents[ind]);
					if (TabParent != null && TabParent.id != Tab.parentNode.id) {
						TabParent.appendChild(Tab);
					}
				}
			}
		}
		
		if (opt.syncro_tabbar_tabs_order && TabsIds[0] != undefined) {
			let tabIds = Array.prototype.map.call(document.querySelectorAll(".pin, .tab"), function(s){
				return parseInt(s.id);
			});
			
			if (opt.debug) {
				log(  "f: DropToTarget, will Syncro tabbar tabs order, TabsIds array is:"+JSON.stringify(TabsIds)  );
			}
				
			chrome.tabs.move(TabsIds, {index: tabIds.indexOf(TabsIds[0])});
			setTimeout(function() {
				schedule_rearrange_tabs++;
			}, 500);
		}
	}

	DragOverTimer = false;
	setTimeout(function() {
		RefreshExpandStates();
		RefreshCounters();
		schedule_update_data++;
		RefreshGUI();
		EmptyDragAndDrop();

		if (opt.debug) {
			log("DropToTarget END");
		}
	}, 300);

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
	document.querySelectorAll(".dragged_group_button").forEach(function(s){
		s.classList.remove("dragged_group_button");
	});
	document.querySelectorAll(".dragged_tree").forEach(function(s){
		s.classList.remove("dragged_tree");
	});
}

function EmptyDragAndDrop() {
	if (opt.debug) {
		log("f: EmptyDragAndDrop, reset DragOverTimer and removing DragNodeClass...");
	}
	DragOverTimer = false;
	DragNodeClass = "";
	DragTreeDepth = 0;
}