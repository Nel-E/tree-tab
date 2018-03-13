// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function SetEvents() {
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
		if (!event.ctrlKey) {
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

	PinList.onmousedown = function(event) {
		if (opt.pin_list_multi_row) {
			if (event.which == 1 && event.target == this) {
				DeselectFolders();
				DeselectTabs();
				HideMenus();
			}
		} else {
			if (event.which == 1 && event.target == this && event.clientY < (this.childNodes[0].getBoundingClientRect().height + this.getBoundingClientRect().top)) {
				DeselectFolders();
				DeselectTabs();
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
	PinList.ondragenter = function(event) {
		// PIN,TAB==>PINLIST
		if (event.target.id == "pin_list" && DragAndDrop.DragNodeClass == "tab") {
			HighlightNode(this);
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
		event.preventDefault();
		if (event.target.parentNode.classList.contains("c") && event.target.parentNode.classList.contains("dragged_tree") == false) {
			if (DragAndDrop.timeout && opt.open_tree_on_hover) {
				event.target.parentNode.classList.add("o");
				event.target.parentNode.classList.remove("c");
				DragAndDrop.timeout = false;
			}
		}
	}	

	document.ondrop = function(event) {
		if (opt.debug) {
			console.log("drop");
		}
		DragAndDrop.DroppedToWindowId = CurrentWindowId;
		let target = document.querySelector(".highlighted_drop_target");
		event.preventDefault();
		if (DragAndDrop.ComesFromWindowId == CurrentWindowId) {
			let selected = (document.querySelectorAll(".selected_tab").length > 0 ? document.querySelectorAll(".selected_tab") : (document.querySelectorAll(".selected_folder").length > 0 ? document.querySelectorAll(".selected_folder") : document.querySelectorAll(".dragged_group_button")));
			DropToTarget(target, selected);
		} else {
			if (Object.keys(DragAndDrop.Folders).length > 0) {
				for (var folder in DragAndDrop.Folders) {
					bgfolders[DragAndDrop.Folders[folder].id] = Object.assign({}, DragAndDrop.Folders[folder]);
				}
				AppendFolders(bgfolders);
			}
			let currentlySelected = document.querySelectorAll(".selected_tab");
			currentlySelected.forEach(function(s){
				s.classList.add("selected_frozen");
				s.classList.remove("selected_tab");
				s.classList.remove("selected_last");
			});
			let counter = 0;
			(DragAndDrop.TabsIds).forEach(function(TabId) {
						if (opt.debug) console.log("DragAndDrop: will now move tab: "+TabId);
				chrome.tabs.move(TabId, { windowId: CurrentWindowId, index: -1 }, function(MovedTab) {
					if (browserId == "F") {																																						// MOZILLA BUG 1398272
						let MovedTabId = MovedTab[0] != undefined ? MovedTab[0].id : (MovedTab.id != undefined ? MovedTab.id : TabId);
						if ((DragAndDrop.TabsIdsParents).indexOf("ct"+DragAndDrop.TabsIds[counter]) != -1) {																// MOZILLA BUG 1398272
							DragAndDrop.TabsIdsParents[(DragAndDrop.TabsIdsParents).indexOf("ct"+DragAndDrop.TabsIds[counter])] = "ct"+MovedTabId;				// MOZILLA BUG 1398272
						}																																												// MOZILLA BUG 1398272
						if ((DragAndDrop.TabsIdsSelected).indexOf(DragAndDrop.TabsIds[counter]) != -1) {																		// MOZILLA BUG 1398272
							DragAndDrop.TabsIdsSelected[(DragAndDrop.TabsIdsSelected).indexOf(DragAndDrop.TabsIds[counter])] = MovedTabId;							// MOZILLA BUG 1398272
						}																																												// MOZILLA BUG 1398272
						DragAndDrop.TabsIds[counter] = MovedTabId;																														// MOZILLA BUG 1398272
					}																																													// MOZILLA BUG 1398272				
					counter++;
					if (counter == DragAndDrop.TabsIds.length) {
						console.log(DragAndDrop);
						setTimeout(function() {
							(DragAndDrop.TabsIdsSelected).forEach(function(selectedTabId) {
								let selectedTab = document.getElementById(selectedTabId);
								if (selectedTab != null) {
									selectedTab.classList.add("selected_temporarly");
									selectedTab.classList.add("selected_tab");
								}
							});
							for (var tabsIdsIndex = 1; tabsIdsIndex < (DragAndDrop.TabsIds).length; tabsIdsIndex++) {
								let DTab = document.getElementById(DragAndDrop.TabsIds[tabsIdsIndex]);
								let DTabParent = document.getElementById(DragAndDrop.TabsIdsParents[tabsIdsIndex]);
								if (DTab != null && DTabParent != null) {
									DTabParent.appendChild(DTab);
								}
							}
							for (var FolderSelectedIndex = 0; FolderSelectedIndex < (DragAndDrop.FoldersSelected).length; FolderSelectedIndex++) {
								let Folder = document.getElementById(DragAndDrop.FoldersSelected[FolderSelectedIndex]);
								if (Folder != null) {
									Folder.classList.add("selected_folder_temporarly");
									Folder.classList.add("selected_folder");
								}
							}
							let selected = (document.querySelectorAll(".selected_tab").length > 0 ? document.querySelectorAll(".selected_tab") : (document.querySelectorAll(".selected_folder").length > 0 ? document.querySelectorAll(".selected_folder") : document.querySelectorAll(".dragged_group_button")));
							DropToTarget(target, selected);
						}, 300);
					}
				});
			});
		}
		// event.dataTransfer.setData("folders", test_data);
		// let folders = event.dataTransfer.getData("folders");
	}
	document.ondragleave = function(event) {
		if (opt.debug) {
			console.log("global dragleave");
		}
		if (event.target.classList) {
			if (event.target.classList.contains("highlighted_drop_target") || event.target.classList.contains("drop_target")) {
				event.target.classList.remove("highlighted_drop_target");
			}
			if (event.target.classList.contains("drag_enter_center")) {
				DragAndDrop.timeout = false;
			}
		}
	}

	document.ondragend = function(event) {
		if (opt.debug) {
			console.log("document dragend");
			console.log(event);
		}
		
		
		// DETACHING TEMPORARILY DISABLED PLEASE USE MENU OR TOOLBAR!
		
		// if (DragAndDrop.ComesFromWindowId == CurrentWindowId && DragAndDrop.DroppedToWindowId == 0) {
			// if ((browserId == "F" && ( event.screenX < event.view.mozInnerScreenX || event.screenX > (event.view.mozInnerScreenX + window.innerWidth) || event.screenY < event.view.mozInnerScreenY || event.screenY > (event.view.mozInnerScreenY + window.innerHeight)))||	(browserId != "F" && (event.pageX < 0 || event.pageX > window.outerWidth || event.pageY < 0 || event.pageY > window.outerHeight))) {
				// if (opt.debug) console.log("dragged outside sidebar");
				// if (DragAndDrop.DragNodeClass == "tab") {
					// Detach(DragAndDrop.TabsIds, {});
				// }
				// if (DragAndDrop.DragNodeClass == "folder") {
					// Detach(DragAndDrop.TabsIds, DragAndDrop.Folders);
					// setTimeout(function() {
						// SaveFolders();
					// }, 500);
				// }
			// }
		// }
		CleanUpDragClasses();
		chrome.runtime.sendMessage({command: "dragend"});
	}
}


function BindTabsSwitchingToMouseWheel(Id) {
	document.getElementById(Id).onmousewheel = function(event) {
		event.preventDefault();
		let prev = event.wheelDelta > 0 || event.detail < 0;
		if (prev) {
			ActivatePrevTab();
		} else {
			ActivateNextTab();
		}
	}
}

function RemoveHeadersHoverClass() {
	document.querySelectorAll(".folder_header_hover, .tab_header_hover").forEach(function(s){
		s.classList.remove("folder_header_hover");
		s.classList.remove("tab_header_hover");
	});
}

function DropToTarget(TargetNode, selected) {
	if (opt.debug) console.log("function: DropToTarget");
	if (TargetNode != null && selected.length > 0) {
		if (DragAndDrop.DragNodeClass == "tab") {
			if (TargetNode.parentNode.classList.contains("pin")) { // dropped on pin
				if (TargetNode.classList.contains("drag_entered_top")) {
					selected.forEach(function(s){
						SetTabClass(s.id, true);
						TargetNode.parentNode.parentNode.insertBefore(s, TargetNode.parentNode);
					});
				} else {
					if (TargetNode.parentNode.nextSibling != null) {
						for (let i = selected.length-1; i >= 0; i--) {
							SetTabClass(selected[i].id, true);
							TargetNode.parentNode.parentNode.insertBefore(selected[i], TargetNode.parentNode.nextSibling);
						}
					} else {
						selected.forEach(function(s){
							SetTabClass(s.id, true);
							TargetNode.parentNode.parentNode.appendChild(s);
						});
					}
				}
			}
			if (TargetNode.id == "pin_list") { // dropped on pin_list
				document.querySelectorAll(".selected_tab").forEach(function(s){
					SetTabClass(s.id, true);
					TargetNode.appendChild(s);
				});
			}
			if (TargetNode.parentNode.classList.contains("tab") || TargetNode.parentNode.classList.contains("folder")) { // dropped on tab or folder
				selected.forEach(function(s){
					SetTabClass(s.id, false);
				});
				if (TargetNode.classList.contains("drag_entered_top")) {
					selected.forEach(function(s){
						TargetNode.parentNode.parentNode.insertBefore(s, TargetNode.parentNode);
					});
				}
				if (TargetNode.classList.contains("drag_entered_bottom")) {
					if (TargetNode.parentNode.nextSibling != null) {
						for (let i = selected.length-1; i >= 0; i--) {
							TargetNode.parentNode.parentNode.insertBefore(selected[i], TargetNode.parentNode.nextSibling);
						}
					} else {
						selected.forEach(function(s){
							TargetNode.parentNode.parentNode.appendChild(s);
						});
					}
				}
				if (TargetNode.classList.contains("drag_enter_center")) {
					let newParent = document.getElementById("ct" + TargetNode.id.substr(2));
					if (opt.append_child_tab == "bottom") {
						selected.forEach(function(s){
							newParent.appendChild(s);
						});
					} else {
						for (let i = selected.length-1; i >= 0; i--) {
							newParent.prepend(selected[i]);
						}
					}
				}
			}
			if (TargetNode.classList.contains("group")) { // dropped on group (tab list)
				selected.forEach(function(s){
					SetTabClass(s.id, false);
				});
				let newParent = document.getElementById("ct" + TargetNode.id);
				selected.forEach(function(s){
					newParent.appendChild(s);
				});
			}
			if (TargetNode.classList.contains("group_drag_box")) { // dropped on group button (group list)
				selected.forEach(function(s){
					SetTabClass(s.id, false);
				});

				let newParent = document.getElementById("ct" + TargetNode.id.substr(1));
				selected.forEach(function(s){
					newParent.appendChild(s);
				});
			}	
		}
		if (DragAndDrop.DragNodeClass == "folder") { // dropped on group button (group list)
			if (opt.debug) console.log("DragNodeClass is folder");
			if (TargetNode.classList.contains("group")) { // dropped on group (tab list)
				let newParent = document.getElementById("cf" + TargetNode.id);
				selected.forEach(function(s){
					newParent.appendChild(s);
				});
			}
			if (TargetNode.classList.contains("group_drag_box")) { // dropped on group button (group list)
				let newParent = document.getElementById("cf" + TargetNode.id.substr(1));
				selected.forEach(function(s){
					newParent.appendChild(s);
				});
			}	
			if (TargetNode.parentNode.classList.contains("folder")) { // dropped on folder
				if (TargetNode.classList.contains("drag_entered_top")) {
					selected.forEach(function(s){
						TargetNode.parentNode.parentNode.insertBefore(s, TargetNode.parentNode);
					});
				}
				if (TargetNode.classList.contains("drag_entered_bottom")) {
					if (TargetNode.parentNode.nextSibling != null) {
						for(let i = selected.length-1; i >= 0; i--) {
							TargetNode.parentNode.parentNode.insertBefore(selected[i], TargetNode.parentNode.nextSibling);
						}
					} else {
						selected.forEach(function(s){
							TargetNode.parentNode.parentNode.appendChild(s);
						});
					}
				}
				if (TargetNode.classList.contains("drag_enter_center")) {
					let newParent = document.getElementById("cf" + TargetNode.id.substr(2));
					if (opt.append_child_tab == "bottom") {
						selected.forEach(function(s){
							newParent.appendChild(s);
						});
					} else {
						for (let i = selected.length-1; i >= 0; i--) {
							newParent.prepend(selected[i]);
						}
					}
				}
			}
			setTimeout(function() {
				SaveFolders();
			}, 300);
		}

		if (TargetNode.parentNode.classList.contains("group_button") && DragAndDrop.DragNodeClass == "group") {
			if (TargetNode.classList.contains("group_button_drag_entered_top")) {
				TargetNode.parentNode.parentNode.insertBefore(selected[0], TargetNode.parentNode);
			} else {
				if (TargetNode.parentNode.nextSibling != null) {
					TargetNode.parentNode.parentNode.insertBefore(selected[0], TargetNode.parentNode.nextSibling);
				} else {
					TargetNode.parentNode.parentNode.appendChild(selected[0]);
				}
			}
			UpdateBgGroupsOrder();
			RearrangeGroupsLists();
			if (opt.syncro_tabbar_groups_tabs_order) {
				schedule_rearrange_tabs++;
			}		
		}		
		
		if (opt.syncro_tabbar_tabs_order && DragAndDrop.TabsIds[0] != undefined) {
			let tabIds = Array.prototype.map.call(document.querySelectorAll(".pin, .tab"), function(s){
				return parseInt(s.id);
			});
			if (opt.debug) console.log("After DropToTarget, will Syncro tabbar tabs order, TabsIds array is:");
			if (opt.debug) console.log(DragAndDrop.TabsIds);
			chrome.tabs.move(DragAndDrop.TabsIds, {index: tabIds.indexOf(DragAndDrop.TabsIds[0])});
			setTimeout(function() {
				schedule_rearrange_tabs++;
			}, 500);
		}
	}
	DragAndDrop.timeout = false;
	setTimeout(function() {
		EmptyDragAndDrop();
		RefreshExpandStates();
		RefreshCounters();
		RefreshGUI();
		schedule_update_data++;
	}, 100);
	
	CleanUpDragClasses();
	
}

function DropTargetsFront(ExcludeNode, tabs, groups) {
	if (ExcludeNode == undefined) {
		ExcludeNode = {parentNode: {childNodes: [{id: "x"}, {id: "x"}, {id: "x"}], id: "x"}};
	}
	if (tabs) {
		document.querySelectorAll("#"+active_group+" .drag_enter_center:not(#"+ExcludeNode.parentNode.childNodes[0].id+")").forEach(function(s){
			s.style.zIndex = 9911;
		});
		document.querySelectorAll("#"+active_group+" .drag_enter_center:not(#"+ExcludeNode.parentNode.childNodes[0].id+")").forEach(function(s){
			s.style.zIndex = 9911;
		});
		document.querySelectorAll(".drag_entered_top:not(#"+ExcludeNode.parentNode.childNodes[1].id+")").forEach(function(s){
			s.style.zIndex = 9915;
		});
		document.querySelectorAll(".drag_entered_bottom:not(#"+ExcludeNode.parentNode.childNodes[2].id+")").forEach(function(s){
			s.style.zIndex = 9920;
		});
	}
	if (groups) {
		document.querySelectorAll(".group_button:not(#"+ExcludeNode.parentNode.id+") .group_drag_box").forEach(function(s){
			s.style.zIndex = -1;
		});
	}				
}


function CleanUpDragClasses() {
	document.querySelectorAll(".highlighted_drop_target").forEach(function(s){
		s.classList.remove("highlighted_drop_target");
	});
	document.querySelectorAll(".highlighted_selected").forEach(function(s){
		s.classList.add("selected_tab");
		s.classList.remove("highlighted_selected");
	});
	document.querySelectorAll(".selected_frozen").forEach(function(s){
		s.classList.add("selected_tab");
		s.classList.remove("selected_frozen");
	});
	document.querySelectorAll(".selected_temporarly").forEach(function(s){
		s.classList.remove("selected_tab");
		s.classList.remove("selected_temporarly");
	});
	document.querySelectorAll(".highlighted_selected").forEach(function(s){
		s.classList.add("selected_folder");
		s.classList.remove("highlighted_selected");
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
	document.querySelectorAll(".dragged_group_button").forEach(function(s){ // dragged group button
		s.classList.remove("dragged_group_button");
	});
	document.querySelectorAll(".dragged_tree").forEach(function(s){
		s.classList.remove("dragged_tree");
	});
	document.querySelectorAll(".dragged_selected").forEach(function(s){
		s.classList.remove("dragged_selected");
	});
	document.querySelectorAll(".drop_target").forEach(function(s){
		s.style.zIndex = "";
	});
}
