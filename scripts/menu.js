// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********			 MENU		 ***************

function ShowTabMenu(TabNode, event) {
	$(".menu").hide(0);
	menuItemId = parseInt(TabNode[0].id);
	// MUTE TABS
	if (TabNode.is(".muted")) {
		$("#tabs_menu_mute").css({ "display": "none" });
		$("#tabs_menu_unmute").css({ "display": "" });
	} else {
		$("#tabs_menu_mute").css({ "display": "" });
		$("#tabs_menu_unmute").css({ "display": "none" });
	}
	if (TabNode.is(".pin")) {
		if (!opt.allow_pin_close) {
			$("#tabs_menu_close").css({ "display": "none" });
		}
		// show contextmenu with correct size position
		if ($("#pins_menu").outerWidth() > $(window).width() - 10) {
			$("#pins_menu").css({ "width": $(window).width() - 10 });
		} else {
			$("#pins_menu").css({ "width": "" });
		}
		var x = event.pageX >= $(window).width() - $("#pins_menu").outerWidth() ? $(window).width() - $("#pins_menu").outerWidth() : event.pageX;
		var y = event.pageY >= $(window).height() - $("#pins_menu").outerHeight() - 10 ? $(window).height() - $("#pins_menu").outerHeight() - 10 : event.pageY;
		$("#pins_menu").css({ "display": "block", "top": y - 15, "left": x - 5 });
	}
	if (TabNode.is(".tab")) {
		if ($("#" + menuItemId).is(".o, .c")) {
			$("#tabs_menu_close_tree").css({ "display": "" });
		} else {
			$("#tabs_menu_close_tree").css({ "display": "none" });
		}
		if ($("#tabs_menu").outerWidth() > $(window).width() - 10) {
			$("#tabs_menu").css({ "width": $(window).width() - 10 });
		} else {
			$("#tabs_menu").css({ "width": "" });
		}
		var x = event.pageX >= $(window).width() - $("#tabs_menu").outerWidth() ? $(window).width() - $("#tabs_menu").outerWidth() : event.pageX;
		var y = event.pageY >= $(window).height() - $("#tabs_menu").outerHeight() - 10 ? $(window).height() - $("#tabs_menu").outerHeight() - 10 : event.pageY;
		$("#tabs_menu").css({ "display": "block", "top": y - 15, "left": x - 5 });
	}
}

function ShowFolderMenu(FolderNode, event) {
	$(".menu").hide(0);
	menuItemId = FolderNode[0].id;
	if ($("#folders_menu").outerWidth() > $(window).width() - 10) {
		$("#folders_menu").css({ "width": $(window).width() - 10 });
	} else {
		$("#folders_menu").css({ "width": "" });
	}
	var x = event.pageX >= $(window).width() - $("#folders_menu").outerWidth() ? $(window).width() - $("#folders_menu").outerWidth() : event.pageX;
	var y = event.pageY >= $(window).height() - $("#folders_menu").outerHeight() - 10 ? $(window).height() - $("#folders_menu").outerHeight() - 10 : event.pageY;
	$("#folders_menu").css({ "display": "block", "top": y - 15, "left": x - 5 });
}

function SetMenu() {
	// trigger action when the contexmenu is about to be shown
	$(document).bind("contextmenu", function(event) {
		if (!event.ctrlKey) {
			event.preventDefault();
		}
	});

	// show global menu
	$(document).on("mousedown", "#pin_list, .group", function(event) {
		event.stopPropagation();
		if (event.button == 2) {
			$(".menu").hide(0);
			menuItemId = active_group;

			var x = event.pageX >= $(window).width() - $("#global_menu").outerWidth() ? $(window).width() - $("#global_menu").outerWidth() : event.pageX;
			var y = event.pageY >= $(window).height() - $("#global_menu").outerHeight() - 10 ? $(window).height() - $("#global_menu").outerHeight() - 10 : event.pageY;
			$("#global_menu").css({ "display": "block", "top": y - 15, "left": x - 5 });
		}
	});

	// show global menu
	$(document).on("mousedown", ".group_drag_box", function(event) {
		// event.stopPropagation();
		if (event.button == 2) {
			$(".menu").hide(0);
			if (this.id == "-tab_list") {
				menuItemId = "tab_list";
				$("#groups_menu_rename, #groups_menu_delete, #groups_menu_delete_tabs_close").hide();
			} else {
				menuItemId = (this.id).substr(1);
				$("#groups_menu_rename, #groups_menu_delete, #groups_menu_delete_tabs_close").show();
			}
			var x = event.pageX >= $(window).width() - $("#groups_menu").outerWidth() ? $(window).width() - $("#groups_menu").outerWidth() : event.pageX;
			var y = event.pageY >= $(window).height() - $("#groups_menu").outerHeight() - 10 ? $(window).height() - $("#groups_menu").outerHeight() - 10 : event.pageY;
			$("#groups_menu").css({ "display": "block", "top": y - 15, "left": x - 5 });
		}
	});



	// if the menu element is clicked
	$(document).on("mousedown", ".menu li", function(event) {
		event.stopPropagation();
		if (event.button != 0) {
			return;
		}
		switch ($(this).attr("data-action")) {
			case "tab_new":
				chrome.tabs.create({});
			break;
			case "tab_clone":
				if ($("#" + menuItemId).is(".selected_tab")) {
					$(".selected_tab:visible").each(function() {
						chrome.tabs.duplicate(parseInt(this.id));
					});
				} else {
					chrome.tabs.duplicate(menuItemId);
				}
			break;
			case "tab_move":
				if ($("#" + menuItemId).is(".selected_tab, .active_tab")) {
					let tabsArr = [];
					$(".active_tab:visible, .selected_tab:visible").each(function() {
						tabsArr.push(parseInt(this.id));
						if ($("#ch"+this.id).children().length > 0) {
							$($("#ch"+this.id).find(".tab")).each(function() {
								tabsArr.push(parseInt(this.id));
							});
						}
					});
					DetachTabs(tabsArr);
				} else {
					DetachTabs([menuItemId]);
				}
			break;
			case "tab_reload":
				if ($("#" + menuItemId).is(".selected_tab")) {
					$(".selected_tab:visible").each(function() {
						chrome.tabs.reload(parseInt(this.id));
					});
				} else {
					chrome.tabs.reload(menuItemId);
				}
			break;
			case "tab_pin":
				if ($("#" + menuItemId).is(".selected_tab")) {
					$(".selected_tab:visible").each(function() {
						chrome.tabs.update(parseInt(this.id), { pinned: ($("#" + menuItemId).is(".pin") ? false : true) });
					});
				} else {
					chrome.tabs.update(menuItemId, { pinned: ($("#" + menuItemId).is(".pin") ? false : true) });
				}
			break;
			case "tab_mute":
				if ($("#" + menuItemId).is(".selected_tab")) {
					$(".selected_tab:visible").each(function() {
						chrome.tabs.get(parseInt(this.id), function(tab) {
							if (tab) {
								chrome.tabs.update(tab.id, { muted: true });
							}
						});
					});
				} else {
					chrome.tabs.get(menuItemId, function(tab) {
						if (tab) {
							chrome.tabs.update(tab.id, { muted: true });
						}
					});
				}
			break;
			case "tab_unmute":
				if ($("#" + menuItemId).is(".selected_tab")) {
					$(".selected_tab:visible").each(function() {
						chrome.tabs.get(parseInt(this.id), function(tab) {
							if (tab) {
								chrome.tabs.update(tab.id, { muted: false });
							}
						});
					});
				} else {
					chrome.tabs.get(menuItemId, function(tab) {
						chrome.tabs.update(tab.id, { muted: false });
					});
				}
			break;
			case "tab_mute_other":
				if ($("#" + menuItemId).is(".selected_tab")) {
					$(".tab:visible:not(.selected_tab)").each(function() {
						chrome.tabs.update(parseInt(this.id), { muted: true });
					});
				} else {
					$(".tab:visible:not(#" + menuItemId + ")").each(function() {
						chrome.tabs.update(parseInt(this.id), { muted: true });
					});
				}
			break;
			case "tab_unmute_other":
				if ($("#" + menuItemId).is(".selected_tab")) {
					$(".tab:visible:not(.selected_tab)").each(function() {
						chrome.tabs.update(parseInt(this.id), { muted: false });
					});
				} else {
					$(".tab:visible:not(#" + menuItemId + ")").each(function() {
						chrome.tabs.update(parseInt(this.id), { muted: false });
					});
				}
			break;
			case "tab_close":
				CloseTabs($("#" + menuItemId).is(".selected_tab") ? $(".selected_tab:visible").map(function() { return parseInt(this.id); }).toArray() : [menuItemId]);
			break;
			case "tab_close_tree":
				CloseTabs($("#" + menuItemId).find(".tab").map(function() { return parseInt(this.id); }).toArray());
				CloseTabs([menuItemId]);
			break;
			case "tab_close_other":
				CloseTabs($(".tab:visible:not(#" + menuItemId + ")").map(function() { return parseInt(this.id); }).toArray());
			break;
			case "tab_undo_close":
				chrome.sessions.getRecentlyClosed(null, function(sessions) {
					if (sessions.length > 0) {
						chrome.sessions.restore(null, function() {});
					}
				});
			break;
			case "tab_discard":
				DiscardTabs($("#" + menuItemId).is(".selected_tab") ? $(".tab.selected_tab:visible").map(function() { return parseInt(this.id); }).toArray() : [menuItemId]);
			break;
			case "tab_settings":
				chrome.tabs.create({ "url": "options.html" });
			break;
			case "tab_expand_all":
				$(".tab.c").addClass("o").removeClass("c");
				schedule_update_data++;
			break;
			case "tab_collapse_all":
				$(".tab.o").addClass("c").removeClass("o");
				schedule_update_data++;
			break;
			case "folder_new":
				AddNewFolder({});
			break;
			case "folder_rename":
				if ($("#" + menuItemId).is(".selected_folder")) {
					$(".selected_folder:visible").each(function() {
						ShowRenameFolderDialog(this.id);
					});
				} else {
					ShowRenameFolderDialog(menuItemId);
				}
			break;
			case "folder_delete":
				if ($("#" + menuItemId).is(".selected_folder")) {
					$(".selected_folder:visible").each(function() {
						RemoveFolder(this.id);
					});
				} else {
					RemoveFolder(menuItemId);
				}
			break;
			case "group_new":
				AddNewGroup({});
			break;
			case "group_rename":
				ShowGroupEditWindow();
			break;
			case "group_delete":
				GroupRemove(menuItemId, false);
			break;
			case "group_delete_tabs_close":
				GroupRemove(menuItemId, true);
			break;
			case "group_unload":
				DiscardTabs($("#"+menuItemId+" .tab").map(function() { return parseInt(this.id); }).toArray());
			break;
		}
		$(".menu").hide(0);
	});
	
	


	// move tabs to group
	// $(document).on("mousedown", "#tabs_menu_move_to_new_group, .move_to_group_menu_entry", function(event) {
		// var tabsIds
		// if ($(this).is("#tabs_menu_move_to_new_group")) {
			// bg.dt.DropToGroup = AddNewGroup(575757);
			// GetColorFromMiddlePixel(vt.menuItemId, bg.dt.DropToGroup);
		// } else {
			// bg.dt.DropToGroup = this.id.substr(8);
		// }
		// AppendTabsToGroup({tabsIds: DragAndDrop.tabsIds, groupId: bg.dt.DropToGroup, SwitchTabIfHasActive: true, insertAfter: true, RemoveClass: "selected_tab", moveTabs: true});
	// });



}