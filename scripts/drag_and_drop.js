// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********		  TABS EVENTS		  ***************

function GetSelectedFolders() {
	log("function: GetSelectedFolders");
	let res = {Folders: {}, FoldersSelected: [], TabsIds: [], TabsIdsParents: []};
	$("#"+active_group+" .selected_folder").each(function() {
		res.FoldersSelected.push(this.id);
		res.Folders[this.id] = Object.assign({}, bgfolders[this.id]);
		if ($("#cf" + this.id).children().length > 0) {
			$($("#cf" + this.id).find(".folder")).each(function() {
				res.Folders[this.id] = Object.assign({}, bgfolders[this.id]);
			});
		}				
		$($(this).find(".tab")).each(function() {
			res.TabsIds.push(parseInt(this.id));
			res.TabsIdsParents.push($(this).parent()[0].id);
		});
	});
	log(res);
	return res;
}
function GetSelectedTabs() {
	log("function: GetSelectedTabs");
	let res = {TabsIds: [], TabsIdsParents: [], TabsIdsSelected: []};
	$("#"+active_group+" .selected_tab").each(function() {
		res.TabsIds.push(parseInt(this.id));
		res.TabsIdsParents.push($(this).parent()[0].id);
		res.TabsIdsSelected.push(parseInt(this.id));
		if ($("#ch" + this.id).children().length > 0) {
			$($("#ch" + this.id).find(".tab")).each(function() {
				res.TabsIds.push(parseInt(this.id));
				res.TabsIdsParents.push($(this).parent()[0].id);
			});
		}
	});
	log(res);
	return res;
}
function SetDragAndDropEvents() {
	$(document).on("mouseleave", window, function(event) {
		MouseHoverOver = "";
	});
	$(document).on("dragleave", window, function(event) {
		MouseHoverOver = "";
	});
	$(document).on("dragleave", "body", function(event) {
		MouseHoverOver = "";
	});
	$(document).on("dragover", "#toolbar_groups, #toolbar, #pin_list, .group", function(event) {
		MouseHoverOver = this.id;
	});
	$(document).on("mouseover", "#toolbar_groups, #toolbar, #pin_list, .group", function(event) {
		MouseHoverOver = this.id;
	});
	$(document).bind("drop dragover", function(event) { // PREVENT THE DEFAULT BROWSER DROP ACTION
		event.preventDefault();
	});
	$(document).on("mousedown", ".drop_target", function(event) { // deny drag enter on drop_targets and allow clicks below them
		$(".drop_target").css({"pointer-events": "none"});
	});
	$(document).on("dragenter", ".tab_header, .folder_header", function(event) { // allow drag enter on drop_targets
		$(".drop_target").css({"pointer-events": "all"});
	});
	$(document).on("dragstart", ".tab_header, .folder_header", function(event) { // SET DRAG SOURCE
		event.stopPropagation();
		event.originalEvent.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
		event.originalEvent.dataTransfer.setData("text", "");
		DragAndDrop.DroppedToWindowId = 0;
		DragAndDrop.ComesFromWindowId = CurrentWindowId;
		DragAndDrop.Depth = 0;
		if ($(this)[0].classList[0] == "folder_header") {
			DragAndDrop.DragNodeClass = "folder";
			if ($(this).parent().is(":not(.selected_folder)")) {
				$(".selected_folder").addClass("selected_folder_frozen").removeClass("selected_folder");
				$(this).parent().addClass("selected_folder_temporarly").addClass("selected_folder");
			}
			$(".selected_folder:not(:visible)").addClass("selected_folder_frozen").removeClass("selected_folder");
			let Folders = GetSelectedFolders();
			DragAndDrop.TabsIds = Object.assign([], Folders.TabsIds);
			DragAndDrop.TabsIdsParents = Object.assign([], Folders.TabsIdsParents);
			DragAndDrop.TabsIdsSelected = Object.assign([], []);
			DragAndDrop.Folders = Object.assign({}, Folders.Folders);
			DragAndDrop.FoldersSelected = Object.assign([], Folders.FoldersSelected);
		}
		if ($(this)[0].classList[0] == "tab_header") {
			DragAndDrop.DragNodeClass = "tab";
			if ($(this).parent().is(".active_tab")) {
				$(this).parent().addClass("selected_temporarly").addClass("selected_tab");
			}
			$(".close").removeClass("show");
			$(".tab_header_hover").removeClass("tab_header_hover");
			if ($(this).parent().is(":not(.selected_tab)")) {
				$(".selected_tab").addClass("selected_frozen").removeClass("selected_tab");
				$(this).parent().addClass("selected_temporarly").addClass("selected_tab");
			}
			$(".selected_tab:not(:visible)").addClass("selected_frozen").removeClass("selected_tab");
			$("#"+active_group+" .selected_tab").find(".pin, .tab").each(function() {
				if ($(this).parents(".pin, .tab").length > DragAndDrop.Depth) {
					DragAndDrop.Depth = $(this).parents(".pin, .tab").length;
				}
			});
			DragAndDrop.Depth -= $(this).parents(".pin, .tab").length-1;
			if (DragAndDrop.Depth < 0) {
				DragAndDrop.Depth = 0;
			}
			let Tabs = GetSelectedTabs();
			DragAndDrop.TabsIds = Object.assign([], Tabs.TabsIds);
			DragAndDrop.TabsIdsParents = Object.assign([], Tabs.TabsIdsParents);
			DragAndDrop.TabsIdsSelected = Object.assign([], Tabs.TabsIdsSelected);
			DragAndDrop.Folders = Object.assign({}, {});
			DragAndDrop.FoldersSelected = Object.assign([], []);
		}
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
	});
	$(document).on("dragleave", ".highlighted_drop_target", function(event) { // REMOVE DROP TARGET WHEN DRAG LEAVES
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
	});
	$(document).on("dragenter", ".pin>.drag_entered_top:not(.highlighted_drop_target), .pin>.drag_entered_bottom:not(.highlighted_drop_target)", function(event) { // SET DROP TARGET WHEN ENTERING PINS
		event.stopPropagation();
		if (DragAndDrop.DragNodeClass == "tab") {
			$(".highlighted_drop_target").removeClass("highlighted_drop_target");
			$(this).addClass("highlighted_drop_target");
		}
	});
	$(document).on("dragenter", ".tab>.drag_entered_top:not(.highlighted_drop_target), .tab>.drag_entered_bottom:not(.highlighted_drop_target)", function(event) { // SET DROP TARGET WHEN ENTERING TABS
		event.stopPropagation();
		if (DragAndDrop.DragNodeClass == "tab") {
			if ($(".selected_tab:visible").find($(this)).length == 0) {
				if (opt.max_tree_drag_drop && opt.max_tree_depth >= 0) {
					if ($(this).parents(".tab").length + DragAndDrop.Depth-1 > opt.max_tree_depth) {
						return;
					}
				}
				$(".highlighted_drop_target").removeClass("highlighted_drop_target");
				$(this).addClass("highlighted_drop_target");
			}
		}
	});
	$(document).on("dragenter", ".tab>.drag_enter_center:not(.highlighted_drop_target)", function(event) {
		event.stopPropagation();
		if (DragAndDrop.DragNodeClass == "tab") {
			if ($(".selected_tab:visible").find($(this)).length == 0 && opt.max_tree_depth != 0) {
				if (opt.max_tree_drag_drop && opt.max_tree_depth > 0) {
					if ($(this).parents(".tab").length + DragAndDrop.Depth > opt.max_tree_depth) {
						return;
					}
				}
				$(".highlighted_drop_target").removeClass("highlighted_drop_target");
				$(this).addClass("highlighted_drop_target");
			}
		}
	});
	$(document).on("dragenter", ".folder>.drag_entered_top:not(.highlighted_drop_target), .folder>.drag_entered_bottom:not(.highlighted_drop_target), .folder>.drag_enter_center:not(.highlighted_drop_target)", function(event) { // SET DROP TARGET WHEN ENTERING FOLDERS
		event.stopPropagation();
		if (DragAndDrop.DragNodeClass == "folder") {
			$(".highlighted_drop_target").removeClass("highlighted_drop_target");
			$(this).addClass("highlighted_drop_target");
		}
	});
	$(document).on("dragenter", ".folder>.drag_enter_center:not(.highlighted_drop_target)", function(event) {
		event.stopPropagation();
		if (DragAndDrop.DragNodeClass == "tab") {
			$(".highlighted_drop_target").removeClass("highlighted_drop_target");
			$(this).addClass("highlighted_drop_target");
		}
	});
	$(document).on("dragover", "#pin_list, .group, .group_drag_box", function(event) { // SET DROP TARGET, PIN_LIST, TAB_LIST, GROUP OR GROUP_BUTTON
		if (DragAndDrop.DragNodeClass != "group") {
			if ($(".highlighted_drop_target").length == 0 && event.target.className == $(this)[0].className) {
				$(this).addClass("highlighted_drop_target");
			}
		}
	});	
	$(document).on("dragenter", ".drag_enter_center", function(event) { // TIMER FOR FOR AUTO EXPAND
		event.stopPropagation();
		DragAndDrop.timeout = false;
		setTimeout(function() {
			DragAndDrop.timeout = true;
		}, 1800);
	});
	$(document).on("dragleave", ".drag_enter_center", function(event) {
		DragAndDrop.timeout = false;
	});
	$(document).on("dragover", ".c > .drag_enter_center", function(event) {
		if (DragAndDrop.timeout && opt.open_tree_on_hover) {
			$(this).parent().addClass("o").removeClass("c");
			DragAndDrop.timeout = false;
		}
	});
	$(document).on("drop", "*", function(event) { // DROP
		chrome.runtime.sendMessage({command: "dropped", DroppedToWindowId: CurrentWindowId});
		event.stopPropagation();
		if (DragAndDrop.ComesFromWindowId == CurrentWindowId) {
			DropToTarget($(".highlighted_drop_target"));
		} else {
			if (Object.keys(DragAndDrop.Folders).length > 0) {
				for (var folder in DragAndDrop.Folders) {
					bgfolders[DragAndDrop.Folders[folder].id] = Object.assign({}, DragAndDrop.Folders[folder]);
				}
				AppendFolders(bgfolders);
			}
			$(".selected_tab").addClass("selected_frozen").removeClass("selected_tab");
			let target = $(".highlighted_drop_target");
			let counter = 0;
			(DragAndDrop.TabsIds).forEach(function(TabId) {
				chrome.tabs.move(TabId, { windowId: CurrentWindowId, index: -1 }, function(MovedTab) {
					if (browserId == "F") { // FIRFOX BUG 1398272 - HAVE TO REPLACE ORIGINAL ID
						if ((DragAndDrop.TabsIdsParents).indexOf("ch"+DragAndDrop.TabsIds[counter]) != -1) {
							DragAndDrop.TabsIdsParents[(DragAndDrop.TabsIdsParents).indexOf("ch"+DragAndDrop.TabsIds[counter])] = "ch"+MovedTab[0].id;
						}
						if ((DragAndDrop.TabsIdsSelected).indexOf(DragAndDrop.TabsIds[counter]) != -1) {
							DragAndDrop.TabsIdsSelected[(DragAndDrop.TabsIdsSelected).indexOf(DragAndDrop.TabsIds[counter])] = MovedTab[0].id;
						}
						DragAndDrop.TabsIds[counter] = MovedTab[0].id;
					}						
					counter++;
					if (counter == DragAndDrop.TabsIds.length) {
						setTimeout(function() {
							(DragAndDrop.TabsIdsSelected).forEach(function(selectedTabId) {
								if ($("#"+selectedTabId)[0]) {
									$("#"+selectedTabId).addClass("selected_temporarly").addClass("selected_tab");
								}
							});
							for (var tabsIdsIndex = 1; tabsIdsIndex < (DragAndDrop.TabsIds).length; tabsIdsIndex++) {
								if ($("#"+DragAndDrop.TabsIds[tabsIdsIndex])[0] && $("#"+DragAndDrop.TabsIdsParents[tabsIdsIndex])[0]) {
									$("#"+DragAndDrop.TabsIdsParents[tabsIdsIndex]).append($("#"+DragAndDrop.TabsIds[tabsIdsIndex]));
								}
							}
							for (var FolderSelectedIndex = 0; FolderSelectedIndex < (DragAndDrop.FoldersSelected).length; FolderSelectedIndex++) {
								if ($("#"+DragAndDrop.FoldersSelected[FolderSelectedIndex])[0]) {
									$("#"+DragAndDrop.FoldersSelected[FolderSelectedIndex]).addClass("selected_folder_temporarly").addClass("selected_folder");
								}
							}
							DropToTarget(target);
						}, 300);
					}
				});
			});
		}
		$(".drop_target").css({"pointer-events": "none"});
	});
	$(document).on("dragend", ".tab_header, .folder_header", function(event) { // DETACH TABS
		setTimeout(function() {
			if (DragAndDrop.ComesFromWindowId == CurrentWindowId && DragAndDrop.DroppedToWindowId == 0) {
				if (	(browserId == "F" && (event.screenX < event.view.mozInnerScreenX || event.screenX > (event.view.mozInnerScreenX + $(window).width()) || (event.screenY < event.view.mozInnerScreenY || event.screenY > (event.view.mozInnerScreenY + $(window).height()))))
					||	(browserId != "F" && (event.pageX < 0 || event.pageX > $(window).width() || event.pageY < 0 || event.pageY > $(window).height()))
				) {
					if (DragAndDrop.DragNodeClass == "tab") {
						DetachTabs(DragAndDrop.TabsIds, {});
					}
					if (DragAndDrop.DragNodeClass == "folder") {
						DetachTabs(DragAndDrop.TabsIds, DragAndDrop.Folders);
						setTimeout(function() {
							SaveFolders();
						}, 500);
					}
				}
			}
		}, 200);
		$(".drop_target").css({"pointer-events": "none"});
	});
	$(document).on("dragstart", ".group_drag_box", function(event) { // DRAGGING GROUPS
		event.originalEvent.dataTransfer.setData("null", "null");
		event.originalEvent.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
		DragAndDrop.DragNodeClass = "group";
		DragAndDrop.DragNode = $(this).parent();
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
	});
	$(document).on("dragenter", ".group_drag_box", function(event) { // WHEN DRAGGING THE GROUP, MOVE IT UP OR DOWN
		if (DragAndDrop.DragNodeClass == "group") {
			if (DragAndDrop.DragNode != undefined && $(this).parent() != DragAndDrop.DragNode) {
				if ($(this).parent().index() <= DragAndDrop.DragNode.index()) {
					DragAndDrop.DragNode.insertBefore($(this).parent());
				} else {
					if ($(this).parent().index() > DragAndDrop.DragNode.index()) {
						DragAndDrop.DragNode.insertAfter($(this).parent());
					}
				}
				$(".highlighted_drop_target").removeClass("highlighted_drop_target");
			}
		}
	});
	$(document).on("dragend", ".group_drag_box", function(event) { // WHEN FINISHED DRAGGING THE GROUP
		DragAndDrop.DragNode = undefined;
		UpdateBgGroupsOrder();
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		RearrangeGroupsLists();
		$(".drop_target").css({"pointer-events": "none"});
		if (opt.syncro_tabbar_groups_tabs_order) {
			schedule_rearrange_tabs++;
		}
	});
}
function DropToTarget(TargetNode) {
	if (DragAndDrop.DragNodeClass == "tab") {
		if (TargetNode.parent().is(".pin")) { // dropped on pin
			$(".selected_tab").each(function() {
				SetTabClass({ id: this.id, pin: true });
				if (TargetNode.is(".drag_entered_top")) {
					$(this).insertBefore(TargetNode.parent());
				} else {
					$(this).insertAfter(TargetNode.parent());
				}
			});
		}
		if (TargetNode.is("#pin_list")) { // dropped on pin_list
			$(".selected_tab").each(function() {
				SetTabClass({ id: this.id, pin: true });
			});
			TargetNode.append($(".selected_tab"));
		}
		if (TargetNode.parent().is(".tab, .folder")) { // dropped on tab or folder
			if (TargetNode.parent().is(".selected_tab")) {
				TargetNode.parent().addClass("highlighted_selected").removeClass("selected_tab");
			}
			$(".selected_tab").each(function() {
				SetTabClass({ id: this.id, pin: false });
			});
			if (TargetNode.is(".drag_entered_top")) {
				$($(".selected_tab").get().reverse()).insertBefore(TargetNode.parent());
			}
			if (TargetNode.is(".drag_entered_bottom")) {
				$($(".selected_tab").get().reverse()).insertAfter(TargetNode.parent());
			}
			if (TargetNode.is(".drag_enter_center")) {
				if (opt.append_child_tab == "bottom") {
					$("#ch" + TargetNode[0].id.substr(2)).append($($(".selected_tab").get().reverse()));
				} else {
					$("#ch" + TargetNode[0].id.substr(2)).prepend($($(".selected_tab").get().reverse()));
				}
			}
		}
		if (TargetNode.is(".group")) { // dropped on group (tab list)
			$(".selected_tab").each(function() {
				SetTabClass({ id: this.id, pin: false });
			});
			$("#ch"+TargetNode[0].id).append($($(".selected_tab").get().reverse()));
		}
		if (TargetNode.is(".group_drag_box")) { // dropped on group button (group list)
			$(".selected_tab").each(function() {
				SetTabClass({ id: this.id, pin: false });
			});
			$("#ch"+TargetNode[0].id.substr(1)).append($($(".selected_tab").get().reverse()));
		}	
		$(".highlighted_selected").addClass("selected_tab").removeClass("highlighted_selected");
		$(".selected_frozen").addClass("selected_tab").removeClass("selected_frozen");
		$(".selected_temporarly").removeClass("selected_tab").removeClass("selected_temporarly");
	}	
	if (DragAndDrop.DragNodeClass == "folder") { // dropped on group button (group list)
		if (TargetNode.is(".group_drag_box")) {
			$("#cf"+TargetNode[0].id.substr(1)).append($($(".selected_folder").get().reverse()));
		}	
		if (TargetNode.parent().is(".folder")) { // dropped on folder
			if (TargetNode.parent().is(".selected_folder")) {
				TargetNode.parent().addClass("highlighted_selected").removeClass("selected_folder");
			}
			if (TargetNode.is(".drag_entered_top")) {
				$($(".selected_folder").get().reverse()).insertBefore(TargetNode.parent());
			}
			if (TargetNode.is(".drag_entered_bottom")) {
				$($(".selected_folder").get().reverse()).insertAfter(TargetNode.parent());
			}
			if (TargetNode.is(".drag_enter_center")) {
				if (opt.append_child_tab == "bottom") {
					$("#cf" + TargetNode[0].id.substr(2)).append($($(".selected_folder").get().reverse()));
				} else {
					$("#cf" + TargetNode[0].id.substr(2)).prepend($($(".selected_folder").get().reverse()));
				}
			}
		}
		$(".highlighted_selected").addClass("selected_folder").removeClass("highlighted_selected");
		$(".selected_folder_frozen").addClass("selected_folder").removeClass("selected_folder_frozen");
		$(".selected_folder_temporarly").removeClass("selected_folder").removeClass("selected_folder_temporarly");
		setTimeout(function() {
			SaveFolders();
		}, 300);
	}
	RefreshExpandStates();
	DragAndDrop.timeout = false;
	RefreshGUI();
	RefreshCounters();
	
	if (opt.syncro_tabbar_tabs_order) {
		let TTtabsIndexes = $(".pin, .tab").map(function(){return parseInt(this.id);}).toArray();
		chrome.tabs.move(DragAndDrop.TabsIds, {index: TTtabsIndexes.indexOf(DragAndDrop.TabsIds[0])});
		setTimeout(function() {
			schedule_rearrange_tabs++;
		}, 500);
	}

	setTimeout(function() {
		schedule_update_data++;
	}, 500);
	TargetNode.removeClass("highlighted_drop_target");
	$(".tab_header_hover").removeClass("tab_header_hover");
	$(".folder_header").removeClass("folder_header_hover");
	$(".dragover_highlight").removeClass("dragover_highlight"); // this is group dragover indicator
}