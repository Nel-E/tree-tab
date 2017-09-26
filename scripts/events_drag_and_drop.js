// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********		  TABS EVENTS		  ***************

function SetDragAndDropEvents() {

	$(document).on("dragover", "#toolbar_groups, #toolbar, #pin_list, .group", function(event) {
		MouseHoverOver = this.id;
	});
	$(document).on("mouseenter", "#toolbar_groups, #toolbar, #pin_list, .group", function(event) { // set mouse over id
		MouseHoverOver = this.id;
	});
	$(document).on("mouseleave", window, function(event) {
		MouseHoverOver = "";
	});
	$(document).on("dragleave", window, function(event) {
		MouseHoverOver = "";
	});
	$(document).on("dragleave", "body", function(event) {
		MouseHoverOver = "";
	});


	// set DragAndDrop to detach tabs when drag ends outside the window
	// $(document).on("dragleave", "body", function(event) {
		// if (DragAndDrop.DropToWindowId != 0) {
			// DragAndDrop.DropToWindowId = 0;
		// }
	// });
	
	// set DragAndDrop to attach tabs when drag ends inside the window
	// $(document).on("dragover", "*", function(event) {
		// if (DragAndDrop.DropToWindowId != CurrentWindowId) {
			// chrome.runtime.sendMessage({command: "drag_and_drop_drop_to_window", DropToWindowId: CurrentWindowId});
			// DragAndDrop.DropToWindowId = CurrentWindowId;
		// }
	// });

	// PREVENT THE DEFAULT BROWSER DROP ACTION
	$(document).bind("drop dragover", function(event) {
		event.preventDefault();
	});


	// bring to front drop zones
	$(document).on("dragenter", ".tab_header", function(event) {
		// if (DragAndDrop.DropToWindowId != 0 || DragAndDrop.ComesFromWindowId != 0) {
			DropTargetsSendToFront();
		// }
	});

	// SET DRAG SOURCE
	$(document).on("dragstart", ".tab_header", function(event) {
		event.stopPropagation();
		event.originalEvent.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
		// DropTargetsSendToFront();
		// DragAndDrop.tabsIds.splice(0, DragAndDrop.tabsIds.length);
		// DragAndDrop.DropToWindowId = CurrentWindowId;
		// DragAndDrop.ComesFromWindowId = CurrentWindowId;
		// DragAndDrop.DragNodeId = $(this).parent()[0] ? $(this).parent()[0].id : undefined;

		// event.originalEvent.dataTransfer.setData("null", "null");
		// event.originalEvent.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);

		$(".close").removeClass("show");
		$(".tab_header_hover").removeClass("tab_header_hover");
		$(this).parent().addClass("tab_header_hover");

		if ($(this).parent().is(":not(.selected)")) {
			$(".selected").addClass("selected_frozen").removeClass("selected");
			$(this).parent().addClass("selected_temporarly").addClass("selected");
		}

		$(".selected:not(:visible)").addClass("selected_frozen").removeClass("selected");

		let tabsIds = [];
		// let tabsIdsParents = [];
		$(".selected:visible").each(function() {
			// tabsIds.push(parseInt(this.id));
			// tabsIdsParents.push($(this).parent()[0].id);
			tabsIds.push([parseInt(this.id), $(this).parent()[0].id]);
			if ($("#ch" + this.id).children().length > 0) {
				$($("#ch" + this.id).find(".tab")).each(function() {
					// tabsIds.push(parseInt(this.id));
					// tabsIdsParents.push($(this).parent()[0].id);
					tabsIds.push([parseInt(this.id), $(this).parent()[0].id]);
					// tabsIdsParents.push();
				});
			}
		});
		// event.originalEvent.dataTransfer.setData("text", JSON.stringify({DragNodeId: $(this).parent()[0].id, ComesFromWindowId: CurrentWindowId, tabsIds: tabsIds, tabsIdsParents: tabsIdsParents}));
		event.originalEvent.dataTransfer.setData("text", JSON.stringify({DragNodeId: $(this).parent()[0].id, ComesFromWindowId: CurrentWindowId, tabsIds: tabsIds}));

		// $(".selected:visible").each(function() {
			// DragAndDrop.tabsIds.push(parseInt(this.id));
			// if ($("#ch" + this.id).children().length > 0) {
				// $($("#ch" + this.id).find(".tab")).each(function() {
					// DragAndDrop.tabsIds.push(parseInt(this.id));
				// });
			// }
		// });

		// chrome.runtime.sendMessage({command: "drag_and_drop_dragged_node_id", DragNodeId: DragAndDrop.DragNodeId});
		// chrome.runtime.sendMessage({command: "drag_and_drop_comes_from_window", ComesFromWindowId: CurrentWindowId});
		
	});
	
	// SET DROP TARGET, PIN_LIST, TAB_LIST, GROUP OR GROUP_BUTTON
	$(document).on("dragleave", "#pin_list, .group", function(event) {
		$(this).removeClass("highlighted_drop_target");
	});
	$(document).on("dragenter", "#pin_list, .group", function(event) {
		event.stopPropagation();
		// DragAndDrop.DropToGroupId = this.id; DragAndDrop.DropBeforeTabId = DragAndDrop.DropAfterTabId = DragAndDrop.DropToTabId = DragAndDrop.DropToFolderId = undefined;
		$(".highlighted_drop_target").removeClass("highlighted_drop_target"); $(this).addClass("highlighted_drop_target");
	});
	$(document).on("dragenter", ".group_button", function(event) {
		event.stopPropagation();

		// DragAndDrop.DropToGroupId = this.id.substr(1); DragAndDrop.DropBeforeTabId = DragAndDrop.DropAfterTabId = DragAndDrop.DropToTabId = DragAndDrop.DropToFolderId = undefined;
		$(".highlighted_drop_target").removeClass("highlighted_drop_target"); $("#"+this.id.substr(1)).addClass("highlighted_drop_target");
		$(".dragover_highlight").removeClass("dragover_highlight"); $(this).addClass("dragover_highlight");
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

	$(document).on("drop", ".group_button, .highlighted_drop_target", function(event) {
		event.stopPropagation();
		let data = JSON.parse(event.originalEvent.dataTransfer.getData("text"));


		if (data.ComesFromWindowId != CurrentWindowId) {
			let target = $(".highlighted_drop_target")[0].id;

			// if ($(".highlighted_drop_target")[0]) {
			// target
				// target = $(".highlighted_drop_target");
			// }
			$(".selected").addClass("selected_frozen").removeClass("selected");

			(data.tabsIds).forEach(function(TabId) {
				chrome.tabs.move(TabId[0], { windowId: CurrentWindowId, index: -1 });
			});
			if (browserId != 3) {
				setTimeout(function() {
					for (var tabsIdsIndex = 1; tabsIdsIndex < (data.tabsIds).length; tabsIdsIndex++) {
						if ($("#"+data.tabsIds[tabsIdsIndex][0])[0] && $("#"+data.tabsIds[tabsIdsIndex][1])[0]){
							$("#"+data.tabsIds[tabsIdsIndex][1]).append($("#"+data.tabsIds[tabsIdsIndex][0]));
						}
						
					}
					if (target) {
						$("#"+target).addClass("highlighted_drop_target");
					}
					// $("#"+DragNode.id).addClass("selected_temporarly").addClass("selected");
					$("#"+data.DragNode).addClass("selected_temporarly").addClass("selected");
					HandleDrop();
				},300);
			} else { // FUCKING MOZILLA
				setTimeout(function() {
					// for (var tabsIdsIndex = 1; tabsIdsIndex < (data.tabsIds).length; tabsIdsIndex++) {
						// if ($("#"+data.tabsIds[tabsIdsIndex][0])[0] && $("#"+data.tabsIds[tabsIdsIndex][1])[0]){
							// $("#"+data.tabsIds[tabsIdsIndex][1]).append($("#"+data.tabsIds[tabsIdsIndex][0]));
						// }
						
					// }
					chrome.tabs.get(parseInt(data.DragNodeId), function(DragNode) {
						if (target) {
							$("#"+target).addClass("highlighted_drop_target");
						}
						// $("#"+DragNode.id).addClass("selected_temporarly").addClass("selected");
						$("#"+data.DragNode).addClass("selected_temporarly").addClass("selected");
						HandleDrop();
					});
				},300);
			}
			
			// setTimeout(function() {
				
				
				// $("#"+TabArr[1]).append($("#"+TabArr[0]));
				
				// (message.tabsIds).forEach(function(TabArr) {
					// if($("#"+TabArr[1])[0]) {
						// $("#"+TabArr[1]).append($("#"+TabArr[0]));
					// }
				// });
				
				
				
				// $("#"+data.DragNodeId).addClass("selected_temporarly").addClass("selected");
				// $("#"+DragAndDrop.DragNodeId).addClass("selected_temporarly").addClass("selected");
				// if (target.is(":not(.highlighted_drop_target)")) {
					// target.addClass("highlighted_drop_target");
				// }
				
				// HandleDrop();
			// },2000);


				// setTimeout(function() {
						// console.log(data);
						// for (var TabIndex = 0; TabIndex < (data.tabsIds).length; TabIndex++) {
							// console.log($("#"+(data.tabsIds[TabIndex])));
							// if($("#"+(data.tabsIds[TabIndex]))[0] && $("#"+(data.tabsIdsParents[TabIndex]))[0]) {
								// $("#"+data.tabsIdsParents[TabIndex]).append($("#"+data.tabsIds[TabIndex]));
							// }
						// }
					// },2000);
			
			// chrome.tabs.move(data.tabsIds, { windowId: CurrentWindowId, index: -1 });
			// chrome.tabs.move(data.tabsIds, { windowId: CurrentWindowId, index: -1 }, function(tab) {
				
				
				// (message.tabsIds).forEach(function(TabArr) {
					// if($("#"+TabArr[1])[0]) {
						// $("#"+TabArr[1]).append($("#"+TabArr[0]));
					// }
				// });
				// console.log("moved tab/s?");  
				
			// });
		} else {
			if ($(".highlighted_drop_target")[0] != undefined) {
				HandleDrop();
			}
			
		}
		// event.originalEvent.dataTransfer.setData("text", "");
		// if (data.ComesFromWindowId == CurrentWindowId) {
			// HandleDrop();
		// }
	});
	
	// THIS IS WHERE ALL DRAG&DROP IS HANDLED
	$(document).on("dragend", ".tab_header", function(event) {
		let data = event.originalEvent.dataTransfer.getData("text");
		
		if (MouseHoverOver == "" && data) {
			
			console.log("dragend");		
			console.log(data);		
			console.log(MouseHoverOver);		
		
				$(".highlighted_selected").addClass("selected").removeClass("highlighted_selected");
				$(".highlighted_drop_target").removeClass("highlighted_drop_target");
				$(".tab_header_hover").removeClass("tab_header_hover");
				$(".selected_frozen").addClass("selected").removeClass("selected_frozen");
				$(".selected_temporarly").removeClass("selected").removeClass("selected_temporarly");
				
				// this is group dragover indicator
				$(".dragover_highlight").removeClass("dragover_highlight");

				
		}
		
		
		
		// CameFromWindowId == CurrentWindowId means that tabs were dragged from this window, DroppedToWindowId == 0, means that tabs were DROPPED out of window,
		// if (DragAndDrop.ComesFromWindowId == CurrentWindowId && DragAndDrop.DropToWindowId == 0) {

		
			// var tabsIds = [];
			// $(".selected:visible").each(function() {
				// tabsIds.push(parseInt(this.id));
				// if ($("#ch" + this.id).children().length > 0) {
					// $($("#ch" + this.id).find(".tab")).each(function() {
						// tabsIds.push(parseInt(this.id));
					// });
				// }
			// });
			
			
			// DetachTabs(DragAndDrop.tabsIds);
			// DetachTabs(tabsIds);
		// }

		// CameFromWindowId == CurrentWindowId means that tabs were dragged from this window, DroppedToWindowId != CurrentWindowId, means that tabs were DROPPED to another window,
		// DroppedToWindowId != 0, means there is actually a window to send tabs to
		// if (DragAndDrop.ComesFromWindowId == CurrentWindowId && DragAndDrop.DropToWindowId != CurrentWindowId && DragAndDrop.DropToWindowId != 0) {
			// var tabsIds = [];
			// $(".selected:visible").each(function() {
				// tabsIds.push([parseInt(this.id), $(this).parent()[0].id]);
				// if ($("#ch" + this.id).children().length > 0) {
					// $($("#ch" + this.id).find(".tab")).each(function() {
						// tabsIds.push([parseInt(this.id), $(this).parent()[0].id]);
					// });
				// }
			// });
			// chrome.runtime.sendMessage({command: "drag_and_drop_dropped", DragNodeId: DragAndDrop.DragNodeId, tabsIds: tabsIds, ComesFromWindowId: CurrentWindowId});
		// }

		// if (DragAndDrop.ComesFromWindowId == CurrentWindowId && DragAndDrop.DropToWindowId == CurrentWindowId) {
			// HandleDrop();
		// }
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
		RearrangeBrowserTabs();
	}, 500);
	$(".highlighted_drop_target").removeClass("highlighted_drop_target");
	$(".tab_header_hover").removeClass("tab_header_hover");
	$(".selected_frozen").addClass("selected").removeClass("selected_frozen");
	$(".selected_temporarly").removeClass("selected").removeClass("selected_temporarly");
	
	// this is group dragover indicator
	$(".dragover_highlight").removeClass("dragover_highlight");
	// chrome.runtime.sendMessage({command: "drag_and_drop_end"});
}
