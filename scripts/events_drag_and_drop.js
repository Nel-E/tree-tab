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
	// $(document).on("mouseenter", "#toolbar_groups, #toolbar, #pin_list, .group", function(event) { // set mouse over id
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
		Dropped = false;
		event.stopPropagation();
		event.originalEvent.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);

		$(".close").removeClass("show");
		$(".tab_header_hover").removeClass("tab_header_hover");
		$(this).parent().addClass("tab_header_hover");

		if ($(this).parent().is(":not(.selected)")) {
			$(".selected").addClass("selected_frozen").removeClass("selected");
			$(this).parent().addClass("selected_temporarly").addClass("selected");
		}

		$(".selected:not(:visible)").addClass("selected_frozen").removeClass("selected");
		
		DetachIfDraggedOut.splice(0, DetachIfDraggedOut.length);
		let SelectedTabsIds = [];
		let TabsIds = [];
		$(".selected:visible").each(function() {
			SelectedTabsIds.push(parseInt(this.id));
			DetachIfDraggedOut.push(parseInt(this.id));
			TabsIds.push([parseInt(this.id), $(this).parent()[0].id]);
			if ($("#ch" + this.id).children().length > 0) {
				$($("#ch" + this.id).find(".tab")).each(function() {
					DetachIfDraggedOut.push(parseInt(this.id));
					TabsIds.push([parseInt(this.id), $(this).parent()[0].id]);
				});
			}
		});
		event.originalEvent.dataTransfer.setData("text", JSON.stringify({DragNodeId: $(this).parent()[0].id, ComesFromWindowId: CurrentWindowId, selectedTabs: SelectedTabsIds, tabsIds: TabsIds}));
	});
	
	// SET DROP TARGET WHEN ENTERING PINS AND TABS
	$(document).on("dragenter", ".drag_entered_top:not(.highlighted_drop_target), .drag_entered_bottom:not(.highlighted_drop_target), .drag_enter_center:not(.highlighted_drop_target)", function(event) {
		event.stopPropagation();
		// if ($(".selected:visible").find($(this)).length > 0 || DragAndDrop.DropToWindowId == 0 || DragAndDrop.ComesFromWindowId == 0) {
		if ($(".selected:visible").find($(this)).length > 0) {
			return;
		}
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		$(this).addClass("highlighted_drop_target");

	});
	// SET DROP TARGET, PIN_LIST, TAB_LIST, GROUP OR GROUP_BUTTON
	$(document).on("dragleave", "#pin_list, .group", function(event) {
		$(this).removeClass("highlighted_drop_target");
	});
	$(document).on("dragenter", "#pin_list, .group", function(event) {
		event.stopPropagation();
		$(".highlighted_drop_target").removeClass("highlighted_drop_target"); $(this).addClass("highlighted_drop_target");
	});
	$(document).on("dragenter", ".group_button", function(event) {
		event.stopPropagation();

		// DragAndDrop.DropToGroupId = this.id.substr(1); DragAndDrop.DropBeforeTabId = DragAndDrop.DropAfterTabId = DragAndDrop.DropToTabId = DragAndDrop.DropToFolderId = undefined;
		$(".highlighted_drop_target").removeClass("highlighted_drop_target"); $("#"+this.id.substr(1)).addClass("highlighted_drop_target");
		$(".dragover_highlight").removeClass("dragover_highlight"); $(this).addClass("dragover_highlight");
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

	// $(document).on("drop", ".group_button, .group, #pin_list", function(event) {
	$(document).on("drop", "*", function(event) {
		Dropped = true;
		event.stopPropagation();
		chrome.runtime.sendMessage({command: "dropped_tabs"});
		let data = JSON.parse(event.originalEvent.dataTransfer.getData("text"));
		if (data.ComesFromWindowId != CurrentWindowId) {
			$(".selected").addClass("selected_frozen").removeClass("selected");
			let target = $(".highlighted_drop_target")[0].id;
			(data.tabsIds).reverse().forEach(function(TabId) {
				chrome.tabs.move(TabId[0], { windowId: CurrentWindowId, index: -1 }, function(MovedTab) {
					if (MovedTab.id == data.tabsIds[data.tabsIds.length-1][0]) {
						setTimeout(function() {
							if (browserId != 3) { // FUCKING FIREFOX SHIT AINT WORKING
								for (var tabsIdsIndex = 1; tabsIdsIndex < (data.tabsIds).length; tabsIdsIndex++) {
									if ($("#"+data.tabsIds[tabsIdsIndex][0])[0] && $("#"+data.tabsIds[tabsIdsIndex][1])[0]){
										$("#"+data.tabsIds[tabsIdsIndex][1]).append($("#"+data.tabsIds[tabsIdsIndex][0]));
									}
									
								}
							}
						},100);
						setTimeout(function() {
							(data.selectedTabs).forEach(function(selectedTabId) {
								if ($("#"+selectedTabId)[0]){
									$("#"+selectedTabId).addClass("selected_temporarly").addClass("selected");
								}
							});
							// $("#"+data.DragNodeId).addClass("selected_temporarly").addClass("selected");
						},500);
						setTimeout(function() {
							if (target) {
								$("#"+target).addClass("highlighted_drop_target");
							}
							HandleDrop();
						},1000);
					}
				});
			});
		} else {
			if ($(".highlighted_drop_target")[0] != undefined) {
				HandleDrop();
			}
			
		}
	});
	
	// DETACH TABS
	$(document).on("dragend", ".tab_header", function(event) {
		setTimeout(function() {
			if (MouseHoverOver == "" && !Dropped) {
				DetachTabs(DetachIfDraggedOut);
				$(".highlighted_drop_target").removeClass("highlighted_drop_target");
				HandleDrop();
			}
		},500);
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

	// dropped on tab
	if ($(".highlighted_drop_target").parent().is(".tab")) {
		if ($(".highlighted_drop_target").parent().is(".selected")) {
			$(".highlighted_drop_target").parent().addClass("highlighted_selected").removeClass("selected");
		}
		$(".selected").each(function() {
			SetTabClass({ id: this.id, pin: false });
		});
		if ($(".highlighted_drop_target").is(".drag_entered_top")) {
			$(".selected").insertBefore($(".highlighted_drop_target").parent());
		}
		if ($(".highlighted_drop_target").is(".drag_entered_bottom")) {
			$(".selected").insertAfter($(".highlighted_drop_target").parent());
		}
		// if (($(".highlighted_drop_target").is(".drag_enter_center") && $("#" + DragAndDrop.DragNodeId).parent()[0].id != "ch" + $(".highlighted_drop_target")[0].id.substr(2))) {
		if ($(".highlighted_drop_target").is(".drag_enter_center")) {
			if (opt.append_at_end) {
				$("#ch" + $(".highlighted_drop_target")[0].id.substr(2)).append($(".selected"));
			} else {
				$("#ch" + $(".highlighted_drop_target")[0].id.substr(2)).prepend($(".selected"));
			}
		}
	}
	
	// dropped on group or pin_list, somewhere on empty space on tabs list
	if ($(".highlighted_drop_target").is("#pin_list, .group")) {
console.log("dropped on group");
		$(".selected").each(function() {
			SetTabClass({ id: this.id, pin: ($(".highlighted_drop_target").is("#pin_list") ? true : false) });
		});
		$(".highlighted_drop_target").append($(".selected"));
	}
	
	$(".highlighted_selected").addClass("selected").removeClass("highlighted_selected");
	
	RefreshExpandStates();
	timeout = false;
	RefreshGUI();
	setTimeout(function() {
		DropTargetsSendToBack();
		schedule_update_data++;
		
		// if (opt.syncro_tabbar_tabs_order) {
			
			// chrome.tabs.query({currentWindow: true}, function(tabs) {
				// let tabIds = $(".pin, .tab").map(function(){return parseInt(this.id);}).toArray();
				// let qtabIds = tabs;
				// RearrangeBrowserTabs(tabIds, qtabIds, qtabIds.length-1);
			// });
		// }
		
		
		// Dropped = false;
	}, 500);
	
	setTimeout(function() {
		schedule_rearrange_tabs++;
	}, 1000);

	
	$(".highlighted_drop_target").removeClass("highlighted_drop_target");
	$(".tab_header_hover").removeClass("tab_header_hover");
	$(".selected_frozen").addClass("selected").removeClass("selected_frozen");
	$(".selected_temporarly").removeClass("selected").removeClass("selected_temporarly");
	
	// this is group dragover indicator
	$(".dragover_highlight").removeClass("dragover_highlight");
}
