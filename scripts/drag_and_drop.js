// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********		  TABS EVENTS		  ***************

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
	$(document).on("mouseover", "#toolbar_groups, #toolbar, #pin_list, .group", function(event) { // set mouse over id
		MouseHoverOver = this.id;
	});
	
	// PREVENT THE DEFAULT BROWSER DROP ACTION
	$(document).bind("drop dragover", function(event) {
		event.preventDefault();
	});


	// bring to front drop zones
	$(document).on("dragenter", ".tab_header, .folder", function(event) {
		DropTargetsSendToFront();
	});



	// SET FOLDER DRAG SOURCE
	$(document).on("dragstart", ".folder_header", function(event) {
		DragAndDrop.DragNodeClass = "folder";
		DragAndDrop.Dropped = false;
		event.stopPropagation();
		event.originalEvent.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
		event.originalEvent.dataTransfer.setData("text", "");


		DragAndDrop.ComesFromWindowId = CurrentWindowId;
		DragAndDrop.SelectedTabsIds.splice(0, DragAndDrop.SelectedTabsIds.length);
		DragAndDrop.TabsIds.splice(0, DragAndDrop.TabsIds.length);
		DragAndDrop.Parents.splice(0, DragAndDrop.Parents.length);
		
		// chrome.runtime.sendMessage({command: "drag_drop", DragNodeClass: "tab", SelectedTabsIds: DragAndDrop.SelectedTabsIds, TabsIds: DragAndDrop.TabsIds, Parents: DragAndDrop.Parents, ComesFromWindowId: CurrentWindowId, Depth: DragAndDrop.Depth});
	});


	// SET TAB DRAG SOURCE
	$(document).on("dragstart", ".tab_header", function(event) {
		DragAndDrop.DragNodeClass = "tab";
		DragAndDrop.Dropped = false;
		event.stopPropagation();
		event.originalEvent.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
		event.originalEvent.dataTransfer.setData("text", "");

		if ($(this).parent().is(".active")) {
			$(this).parent().addClass("selected_temporarly").addClass("selected");
		}
		$(".close").removeClass("show");
		$(".tab_header_hover").removeClass("tab_header_hover");

		if ($(this).parent().is(":not(.selected)")) {
			$(".selected").addClass("selected_frozen").removeClass("selected");
			$(this).parent().addClass("selected_temporarly").addClass("selected");
		}

		$(".selected:not(:visible)").addClass("selected_frozen").removeClass("selected");

		DragAndDrop.ComesFromWindowId = CurrentWindowId;
		DragAndDrop.SelectedTabsIds.splice(0, DragAndDrop.SelectedTabsIds.length);
		DragAndDrop.TabsIds.splice(0, DragAndDrop.TabsIds.length);
		DragAndDrop.Parents.splice(0, DragAndDrop.Parents.length);
		
		DragAndDrop.Depth = 0;
		$(".selected:visible").find(".tab").each(function() {
			if ($(this).parents(".tab").length > DragAndDrop.Depth) { DragAndDrop.Depth = $(this).parents(".tab").length; }
		});
		DragAndDrop.Depth -= $(this).parents(".tab").length-1;
		if (DragAndDrop.Depth < 0) {
			DragAndDrop.Depth = 0;
		}
		
		$(".selected:visible").each(function() {
			DragAndDrop.SelectedTabsIds.push(parseInt(this.id));
			DragAndDrop.TabsIds.push(parseInt(this.id));
			DragAndDrop.Parents.push($(this).parent()[0].id);
			if ($("#ch" + this.id).children().length > 0) {
				$($("#ch" + this.id).find(".tab")).each(function() {
					DragAndDrop.TabsIds.push(parseInt(this.id));
					DragAndDrop.Parents.push($(this).parent()[0].id);
				});
			}
		});
		chrome.runtime.sendMessage({command: "drag_drop", DragNodeClass: "tab", SelectedTabsIds: DragAndDrop.SelectedTabsIds, TabsIds: DragAndDrop.TabsIds, Parents: DragAndDrop.Parents, ComesFromWindowId: CurrentWindowId, Depth: DragAndDrop.Depth});
	});
	
	// REMOVE DROP TARGET WHEN DRAG LEAVES
	$(document).on("dragleave", ".highlighted_drop_target", function(event) {
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
	});
	
	// SET DROP TARGET WHEN ENTERING PINS AND TABS
	$(document).on("dragenter", ".tab>.drag_entered_top:not(.highlighted_drop_target), .tab>.drag_entered_bottom:not(.highlighted_drop_target), .tab>.drag_enter_center:not(.highlighted_drop_target)", function(event) {
		event.stopPropagation();
		if ($(".selected:visible").find($(this)).length > 0 || DragAndDrop.DragNodeClass != "tab") { return; }
		if (opt.max_tree_drag_drop && opt.max_tree_depth >= 0) {
			if ($(this).is(".drag_enter_center")) {
				if (opt.max_tree_depth == 0) { return; }
				if ($(this).parents(".tab").length + DragAndDrop.Depth > opt.max_tree_depth) { return; }
			} else {
				if ($(this).parents(".tab").length + DragAndDrop.Depth > opt.max_tree_depth+1) { return; }
			}
		}
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		$(this).addClass("highlighted_drop_target");
	});
	
	// SET DROP TARGET WHEN ENTERING FOLDERS
	$(document).on("dragenter", ".folder>.drag_entered_top:not(.highlighted_drop_target), .folder>.drag_entered_bottom:not(.highlighted_drop_target), .folder>.drag_enter_center:not(.highlighted_drop_target)", function(event) {
		event.stopPropagation();
		if (DragAndDrop.DragNodeClass == "group") { return; }
		// if (/* $(".selected:visible").find($(this)).length > 0 ||  */  DragAndDrop.DragNodeClass != "folder") { return; }
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		$(this).addClass("highlighted_drop_target");
	});
	
	// SET DROP TARGET, PIN_LIST, TAB_LIST, GROUP OR GROUP_BUTTON
	$(document).on("dragover", "#pin_list, .group, .group_drag_box", function(event) {
		if (DragAndDrop.DragNodeClass != "group" && $(".highlighted_drop_target").length == 0 && event.target.className == $(this)[0].className) {
			$(this).addClass("highlighted_drop_target");
		}
	});	

	// TIMER FOR FOR AUTO EXPAND
	$(document).on("dragenter", ".drag_enter_center", function(event) {
		event.stopPropagation();
		DragAndDrop.timeout = false;
		setTimeout(function() { DragAndDrop.timeout = true; }, 1800);
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

	// DROP
	$(document).on("drop", "*", function(event) {
		DragAndDrop.Dropped = true;
		chrome.runtime.sendMessage({command: "drag_dropped", DragAndDrop: true});
		event.stopPropagation();

		if (DragAndDrop.ComesFromWindowId == CurrentWindowId && MouseHoverOver != "" && $(".highlighted_drop_target")[0] != undefined) {
			DropToTarget($(".highlighted_drop_target"));
		}

		if (DragAndDrop.ComesFromWindowId != CurrentWindowId && $(".highlighted_drop_target")[0] != undefined) {
			$(".selected").addClass("selected_frozen").removeClass("selected");
			let target = $(".highlighted_drop_target");
			let counter = DragAndDrop.TabsIds.length;
			(DragAndDrop.TabsIds).forEach(function(TabId) {
				chrome.tabs.move(TabId, { windowId: CurrentWindowId, index: -1 }, function(MovedTab) {
					counter--;
					setTimeout(function() {
						if (counter == 0) {
							setTimeout(function() {
								(DragAndDrop.SelectedTabsIds).forEach(function(selectedTabId) {
									if ($("#"+selectedTabId)[0]){
										$("#"+selectedTabId).addClass("selected_temporarly").addClass("selected");
									}
								});
								if (browserId != "F") { // I HAVE TO EXLUDE THIS IN FIREFOX SINCE MOVED TAB LOSES ITS ORIGINAL ID - WHAT IN THE ACTUAL F*CK MOZILLA!
									for (var tabsIdsIndex = 1; tabsIdsIndex < (DragAndDrop.TabsIds).length; tabsIdsIndex++) {
										if ($("#"+DragAndDrop.TabsIds[tabsIdsIndex])[0] && $("#"+DragAndDrop.Parents[tabsIdsIndex])[0]){
											$("#"+DragAndDrop.Parents[tabsIdsIndex]).append($("#"+DragAndDrop.TabsIds[tabsIdsIndex]));
										}
										
									}
								}
								DropToTarget(target);
							},300);
						}
					},300);
				});
			});
		}
	});

	// DETACH
	$(document).on("dragend", ".tab_header", function(event) {
		setTimeout(function() {
			if (DragAndDrop.Dropped == false && MouseHoverOver == "" && $(".highlighted_drop_target")[0] == undefined) {
				DetachTabs(DragAndDrop.TabsIds);
			}
		},1100);
	});


	// dragging groups
	$(document).on("dragstart", ".group_drag_box", function(event) {
		event.originalEvent.dataTransfer.setData("null", "null");
		event.originalEvent.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
		DragAndDrop.DragNodeClass = "group";
		DragAndDrop.DragNode = $(this).parent();
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
	});


	// when dragging the group, move it up or down
	$(document).on("dragenter", ".group_drag_box", function(event) {
		if (DragAndDrop.DragNode != undefined && DragAndDrop.DragNodeClass == "group" && $(this).parent() != DragAndDrop.DragNode) {
			if (   $(this).parent().index() <= DragAndDrop.DragNode.index()  ) {
				DragAndDrop.DragNode.insertBefore($(this).parent());
			} else {
				if ($(this).parent().index() > DragAndDrop.DragNode.index()) {
					DragAndDrop.DragNode.insertAfter($(this).parent());
				}
			}
			$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		}
	});

	// when finished dragging the group
	$(document).on("dragend", ".group_drag_box", function(event) {
		DragAndDrop.DragNodeClass = "";
		DragAndDrop.DragNode = undefined;
		UpdateBgGroupsOrder();
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
	});
}


function DropToTarget(TargetNode) {
	// dropped on pin
	if (TargetNode.parent().is(".pin")) {
		$(".selected").each(function() {
			SetTabClass({ id: this.id, pin: true });
			if (TargetNode.is(".drag_entered_top")) {
				$(this).insertBefore(TargetNode.parent());
			} else {
				$(this).insertAfter(TargetNode.parent());
			}
		});
	}

	// dropped on pin_list
	if (TargetNode.is("#pin_list")) {
		$(".selected").each(function() {
			SetTabClass({ id: this.id, pin: true });
		});
		TargetNode.append($(".selected"));
	}
	
	// dropped on tab
	if (TargetNode.parent().is(".tab, .folder")) {
		if (TargetNode.parent().is(".selected")) {
			TargetNode.parent().addClass("highlighted_selected").removeClass("selected");
		}
		$(".selected").each(function() {
			SetTabClass({ id: this.id, pin: false });
		});
		if (TargetNode.is(".drag_entered_top")) {
			$($(".selected").get().reverse()).insertBefore(TargetNode.parent());
		}
		if (TargetNode.is(".drag_entered_bottom")) {
			$($(".selected").get().reverse()).insertAfter(TargetNode.parent());
		}
		if (TargetNode.is(".drag_enter_center")) {
			if (opt.append_child_tab == "bottom") {
				$("#ch" + TargetNode[0].id.substr(2)).append($($(".selected").get().reverse()));
			} else {
				$("#ch" + TargetNode[0].id.substr(2)).prepend($($(".selected").get().reverse()));
			}
		}
	}
	
	// dropped on group (tab list)
	if (TargetNode.is(".group")) {
		$(".selected").each(function() {
			SetTabClass({ id: this.id, pin: false });
		});
		TargetNode.append($($(".selected").get().reverse()));
	}

	// dropped on group button (group list)
	if (TargetNode.is(".group_drag_box")) {
		$(".selected").each(function() {
			SetTabClass({ id: this.id, pin: false });
		});
		$("#"+TargetNode[0].id.substr(1)).append($($(".selected").get().reverse()));
	}	
	
	$(".highlighted_selected").addClass("selected").removeClass("highlighted_selected");
	
	RefreshExpandStates();
	DragAndDrop.timeout = false;
	RefreshGUI();
	setTimeout(function() {
		DropTargetsSendToBack();
		schedule_update_data++;
		schedule_rearrange_tabs++;
	}, 500);
	
	
	TargetNode.removeClass("highlighted_drop_target");
	$(".tab_header_hover").removeClass("tab_header_hover");
	$(".selected_frozen").addClass("selected").removeClass("selected_frozen");
	$(".selected_temporarly").removeClass("selected").removeClass("selected_temporarly");
	
	// this is group dragover indicator
	$(".dragover_highlight").removeClass("dragover_highlight");
}
