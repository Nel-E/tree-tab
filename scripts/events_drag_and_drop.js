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
	$(document).on("dragenter", ".tab_header", function(event) {
		DropTargetsSendToFront();
	});

	// SET DRAG SOURCE
	$(document).on("dragstart", ".tab_header", function(event) {
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
		chrome.runtime.sendMessage({command: "drag_drop", SelectedTabsIds: DragAndDrop.SelectedTabsIds, TabsIds: DragAndDrop.TabsIds, Parents: DragAndDrop.Parents, ComesFromWindowId: CurrentWindowId});
	});
	
	// REMOVE DROP TARGET WHEN DRAG LEAVES
	$(document).on("dragleave", ".highlighted_drop_target", function(event) {
		// if (event.relatedTarget && event.relatedTarget.className == "group_title") { return; }
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
	});
	
	// SET DROP TARGET WHEN ENTERING PINS AND TABS
	$(document).on("dragenter", ".drag_entered_top:not(.highlighted_drop_target), .drag_entered_bottom:not(.highlighted_drop_target), .drag_enter_center:not(.highlighted_drop_target)", function(event) {
		event.stopPropagation();
		if ($(".selected:visible").find($(this)).length > 0) { return; }
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		$(this).addClass("highlighted_drop_target");
	});
	// SET DROP TARGET, PIN_LIST, TAB_LIST, GROUP OR GROUP_BUTTON
	$(document).on("dragover", "#pin_list, .group, .group_drag_box", function(event) {
		if (GroupDragNode == undefined && $(".highlighted_drop_target").length == 0 && event.target.className == $(this)[0].className) {
			$(this).addClass("highlighted_drop_target");
		}
	});	

	// TIMER FOR FOR AUTO EXPAND
	$(document).on("dragenter", ".drag_enter_center", function(event) {
		event.stopPropagation();
		timeout = false;
		setTimeout(function() { timeout = true; }, 1800);
	});
	$(document).on("dragleave", ".drag_enter_center", function(event) {
		timeout = false;
	});
	$(document).on("dragover", ".c > .drag_enter_center", function(event) {
		if (timeout && opt.open_tree_on_hover) {
			$(this).parent().addClass("o").removeClass("c");
			timeout = false;
		}
	});

	// DROP
	$(document).on("drop", "*", function(event) {
		DragAndDrop.Dropped = true;
		event.stopPropagation();
		if (DragAndDrop.ComesFromWindowId != CurrentWindowId) {
			$(".selected").addClass("selected_frozen").removeClass("selected");
			let target = $(".highlighted_drop_target")[0].id;
			(DragAndDrop.TabsIds).forEach(function(TabId) {
				chrome.tabs.move(TabId, { windowId: CurrentWindowId, index: -1 }, function(MovedTab) {
					if (MovedTab.id == DragAndDrop.TabsIds[0]) {
						setTimeout(function() {
							(DragAndDrop.SelectedTabsIds).forEach(function(selectedTabId) {
								if ($("#"+selectedTabId)[0]){
									$("#"+selectedTabId).addClass("selected_temporarly").addClass("selected");
								}
							});
						},500);
						setTimeout(function() {
							if (browserId != "F") { // FUCKING FIREFOX SHIT AINT WORKING, SO I HAVE TO EXLUDE THIS
								for (var tabsIdsIndex = 1; tabsIdsIndex < (DragAndDrop.TabsIds).length; tabsIdsIndex++) {
									if ($("#"+DragAndDrop.TabsIds[tabsIdsIndex])[0] && $("#"+DragAndDrop.Parents[tabsIdsIndex])[0]){
										$("#"+DragAndDrop.Parents[tabsIdsIndex]).append($("#"+DragAndDrop.TabsIds[tabsIdsIndex]));
									}
									
								}
							}
						},800);
						setTimeout(function() {
							if (target) {
								$("#"+target).addClass("highlighted_drop_target");
							}
							HandleDrop();
						},1000);
						setTimeout(function() {
							if (browserId == "F") { // FUCKING FIREFOX SHIT AINT WORKING, SO I HAVE TO EXLUDE THIS
								chrome.runtime.sendMessage({command: "reload_sidebar"});
								window.location.reload();
							}
						},2000);
					}
				});
			});
		}	
	});

	// DROP (but not in drop, as it's buggy)
	$(document).on("dragend", ".tab_header", function(event) {
		if (DragAndDrop.Dropped && MouseHoverOver != "" && $(".highlighted_drop_target")[0] != undefined) {
			HandleDrop();
		} else {
			if (!DragAndDrop.Dropped && MouseHoverOver == "" && $(".highlighted_drop_target")[0] == undefined) {
				DetachTabs(DragAndDrop.TabsIds);
				HandleDrop();
			}
		}
	});
}


function HandleDrop() {
	// dropped on pin
	if ($(".highlighted_drop_target").parent().is(".pin")) {
		$(".selected").each(function() {
			SetTabClass({ id: this.id, pin: true });
			if ($(".highlighted_drop_target").is(".drag_entered_top")) {
				$(this).insertBefore($(".highlighted_drop_target").parent());
			} else {
				$(this).insertAfter($(".highlighted_drop_target").parent());
			}
		});
	}

	// dropped on pin_list
	if ($(".highlighted_drop_target").is("#pin_list")) {
		$(".selected").each(function() {
			SetTabClass({ id: this.id, pin: true });
		});
		$(".highlighted_drop_target").append($(".selected"));
	}
	
	// dropped on tab
	if ($(".highlighted_drop_target").parent().is(".tab")) {
		if ($(".highlighted_drop_target").parent().is(".selected")) {
			$(".highlighted_drop_target").parent().addClass("highlighted_selected").removeClass("selected");
		}
		$(".selected").each(function() {
			SetTabClass({ id: this.id, pin: false });
		});
		if ($(".highlighted_drop_target").is(".drag_entered_top")) {
			$($(".selected").get().reverse()).insertBefore($(".highlighted_drop_target").parent());
		}
		if ($(".highlighted_drop_target").is(".drag_entered_bottom")) {
			$($(".selected").get().reverse()).insertAfter($(".highlighted_drop_target").parent());
		}
		if ($(".highlighted_drop_target").is(".drag_enter_center")) {
			if (opt.append_child_tab == "bottom") {
				$("#ch" + $(".highlighted_drop_target")[0].id.substr(2)).append($($(".selected").get().reverse()));
			} else {
				$("#ch" + $(".highlighted_drop_target")[0].id.substr(2)).prepend($($(".selected").get().reverse()));
			}
		}
	}
	
	// dropped on group (tab list)
	if ($(".highlighted_drop_target").is(".group")) {
		$(".selected").each(function() {
			SetTabClass({ id: this.id, pin: false });
		});
		$(".highlighted_drop_target").append($($(".selected").get().reverse()));
	}

	// dropped on group button (group list)
	if ($(".highlighted_drop_target").is(".group_drag_box")) {
		$(".selected").each(function() {
			SetTabClass({ id: this.id, pin: false });
		});
		$("#"+$(".highlighted_drop_target")[0].id.substr(1)).append($($(".selected").get().reverse()));
	}	
	
	$(".highlighted_selected").addClass("selected").removeClass("highlighted_selected");
	
	RefreshExpandStates();
	timeout = false;
	RefreshGUI();
	setTimeout(function() {
		DropTargetsSendToBack();
		schedule_update_data++;
		schedule_rearrange_tabs++;
	}, 500);
	
	
	$(".highlighted_drop_target").removeClass("highlighted_drop_target");
	$(".tab_header_hover").removeClass("tab_header_hover");
	$(".selected_frozen").addClass("selected").removeClass("selected_frozen");
	$(".selected_temporarly").removeClass("selected").removeClass("selected_temporarly");
	
	// this is group dragover indicator
	$(".dragover_highlight").removeClass("dragover_highlight");
}
