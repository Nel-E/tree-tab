// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********         GROUPS EVENTS         ***************

function SetGroupEvents() {
	$("#toolbar_groups").css({"display": "inline-block"});
			
	// activate group
	$(document).on("mousedown", ".group_button", function(event) {
		menuGroupId = (this.id).substr(1);
		if (event.button == 0) {
			SetActiveGroup((this.id).substr(1), true, true);
		}
	});

	// show un-grouped tabs
	$(document).on("mousedown", "#ungrouped_tabs", function(event) {
		if (event.button == 0) {
			SetActiveGroup("tab_list", true, true);
		}
	});

	// new group button
	$(document).on("mousedown", "#new_group", function(event) {
		if (event.button == 0) {
			// AddNewGroup(GenerateRandomHexColor());
			AddNewGroup();
		}
	});

	// new group button
	$(document).on("mousedown", "#remove_group", function(event) {
		if (event.button == 0) {
			if (active_group != "tab_list") {
				GroupRemove(active_group, false);
			}
		}
	});

	// edit group
	// $(document).on("mousedown", ".group_button", function(event) {
		// if (event.button == 2) {
			// ShowGroupEditWindow();
		// }
	// });
	
	// EDIT GROUP
	$(document).on("mousedown", "#edit_group", function(event) {
		if (active_group != "tab_list") {
			ShowGroupEditWindow(active_group);
		}
	});

	$(document).on("mousedown", "#group_edit_discard", function(event) {
		$("#group_edit").hide(0);
	});
	$("#group_edit_name").keyup(function(e) {
		if (e.keyCode == 13) {
			GroupEditConfirm();
		}
	});
	$(document).on("mousedown", "#group_edit_confirm", function(event) {
		GroupEditConfirm();
	});

	// show color picker
	$(document).on("mousedown", "#group_edit_font, #group_edit_background", function(event) {
		event.stopPropagation();
		PickColor = this.id;
		$("#color_picker")[0].value = "#"+rgbtoHex($(this).css("background-color"));
		$("#color_picker").focus();
		$("#color_picker").click();
	});
	
	
	

	// scroll groups
	// $(document).on("mousedown", "#scroll_group_up, #scroll_group_down", function(event) {
		// IOKeys.LMB = true;
		// ScrollGroupList($(this).is("#scroll_group_up"));
	// });
	// $(document).on("mouseleave", "#scroll_group_up, #scroll_group_down", function(event) {
		// IOKeys.LMB = false;
	// });

	// remove tabs from group button
	// $(document).on("mousedown", "#remove_tabs_from_group", function(event) {
		// if (event.button == 0 && vt.ActiveGroup.match("at|ut") == null) {
			// AppendTabsToGroup({tabsIds: $(".tab.selected:visible").map(function() {return parseInt(this.id);}).toArray(), groupId: "ut", SwitchTabIfHasActive: true, insertAfter: true, moveTabs: true});
		// }
	// });


	// activate group
	// $(document).on("mousedown", ".group, #at, #ut", function(event) {
		// if (event.button == 0) {
			// $(".filtered").removeClass("filtered");
			// RefreshGUI();
			// SetActiveGroup(this.id, true, true);
		// }
	// });

	// remove group
	// $(document).on("mousedown", ".group", function(event) {
		// if (event.button == 1 || IOKeys.Shift) {
			// if (IOKeys.Shift) {
				// GroupRemove($(this)[0].id, true);
			// } else {
				// GroupRemove($(this)[0].id, false);
			// }
		// }
	// });

	// close group button
	// $(document).on("mousedown", "#close_group", function(event) {
		// if (vt.ActiveGroup.match("at|ut") != null) {
			// return;
		// }
		// if (event.button == 0 || IOKeys.Shift) {
			// if (IOKeys.Shift) {
				// GroupRemove(vt.ActiveGroup, true);
			// } else {
				// GroupRemove(vt.ActiveGroup, false);
			// }
		// }
	// });

	// dragging groups
	$(document).on("dragstart", ".group_button", function(event) {
		// alert();
		event.originalEvent.dataTransfer.setData("null", "null");
		event.originalEvent.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
		GroupDragNode = this.id;
	});

	// when dragging the group, move it up or down
	$(document).on("dragenter", ".group_button", function(event) {
		// bg.dt.DropToGroup = this.id;
		// if (GroupDragNode == undefined || this.id == GroupDragNode) {
			// return;
		// }
		if ( $(this).index() <= $("#"+GroupDragNode).index()) {
			$("#"+GroupDragNode).insertBefore($(this));
		} else {
			if ( $(this).index() > $("#"+GroupDragNode).index()) {
				$("#"+GroupDragNode).insertAfter($(this));
			}
		}
	});

	// when entering to ungrouped
	// $(document).on("dragenter", "#at, #ut, #add_tabs_to_group, #close_group, #remove_tabs_from_group", function(event) {
		// bg.dt.DropToGroup = "ut";
	// });

	// when finished dragging the group
	$(document).on("dragend", ".group_button", function(event) {
		GroupDragNode = undefined;
		UpdateBgGroupsOrder();
	});
}