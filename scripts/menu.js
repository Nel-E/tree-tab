// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********			 MENU		 ***************

function SetMenu() {
	// set menu labels
	$(".menu_item").each(function() {
		$(this).text(chrome.i18n.getMessage(this.id));
	});

	// trigger action when the contexmenu is about to be shown
	$(document).bind("contextmenu", function(event) {
		if (!event.ctrlKey) {
			event.preventDefault();
		}
	});

	// show menu
	$(document).on("mousedown", "#tabs_box, .tab, .pin", function(event) {
		event.stopPropagation();
		if (event.button == 2) {
			$(".menu").hide(0);

			if ($(this).is(".tab, .pin")) {
				menuTabId = parseInt($(this)[0].id);
			} else {
				if ($(".active:visible")[0]) {
					menuTabId = parseInt($(".active:visible")[0].id);
				} else {
					if ($(".active")[0]) {
						menuTabId = parseInt($(".active")[0].id);
					}
				}
			}
			if ($("#" + menuTabId).is(".pin")) {
				$("#tabs_menu_pin").text(chrome.i18n.getMessage("tabs_menu_unpin"));
				$("#tabs_menu_close").prev().css({ "display": "none" });
				$("#tabs_menu_close_other").css({ "display": "none" });

				$("#tabs_menu_expand_all, #tabs_menu_collapse_all").css({ "display": "none" });
				$("#tabs_menu_collapse_all").next().css({ "display": "none" });

				if (!bg.opt.allow_pin_close) {
					$("#tabs_menu_close").css({ "display": "none" });
				}
			} else {
				$("#tabs_menu_pin").text(chrome.i18n.getMessage("tabs_menu_pin"));
				$("#tabs_menu_close").prev().css({ "display": "" });
				$("#tabs_menu_close, #tabs_menu_close_other").css({ "display": "" });

				$("#tabs_menu_expand_all, #tabs_menu_collapse_all").css({ "display": "" });
				$("#tabs_menu_collapse_all").next().css({ "display": "" });
			}

			if ($("#" + menuTabId).is(".o, .c")) {
				$("#tabs_menu_close_tree").css({ "display": "" });
			} else {
				$("#tabs_menu_close_tree").css({ "display": "none" });
			}

			// MUTE TABS
			if ($("#" + menuTabId).is(".muted")) {
				$("#tabs_menu_mute").css({ "display": "none" });
				$("#tabs_menu_unmute").css({ "display": "" });
			} else {
				$("#tabs_menu_mute").css({ "display": "" });
				$("#tabs_menu_unmute").css({ "display": "none" });
			}


			// APPEND TABS TO BG.DATA ARRAY
			bg.dt.tabsIds = $("#" + menuTabId).is(".selected") ? $(".tab.selected:visible").map(function() { return parseInt(this.id); }).toArray() : [menuTabId];

			// show contextmenu with correct size position
			if ($("#tabs_menu").outerWidth() > $(window).width() - 10) {
				$("#tabs_menu").css({ "width": $(window).width() - 10 });
			} else {
				$("#tabs_menu").css({ "width": "" });
			}
			var x = event.pageX >= $(window).width() - $("#tabs_menu").outerWidth() ? $(window).width() - $("#tabs_menu").outerWidth() : event.pageX;
			var y = event.pageY >= $(window).height() - $("#tabs_menu").outerHeight() - 10 ? $(window).height() - $("#tabs_menu").outerHeight() - 10 : event.pageY;
			$("#tabs_menu").css({ "display": "block", "top": y - 15, "left": x - 5 });
		}
	});

	// hide menu
	// $(document).on("mousedown", "body", function(event) {
		// if (event.button != 2) {
			// $(".menu").hide(300);
		// }
	// });

	// $(document).on("mouseleave", "body", function(event) {
		// $(".menu").hide(300);
	// });

	// if the menu element is clicked
	$(document).on("mousedown", "#tabs_menu li", function(event) {
		if (event.button != 0) {
			return;
		}
		event.stopPropagation();
		switch ($(this).attr("data-action")) {
			case "tab_new":
				chrome.tabs.create({});
				break;
			case "tab_clone":
				if ($("#" + menuTabId).is(".selected")) {
					$(".selected:visible").each(function() {
						chrome.tabs.duplicate(parseInt(this.id));
					});
				} else {
					chrome.tabs.duplicate(menuTabId);
				}
				break;
			case "tab_move":
				if ($("#" + menuTabId).is(".selected")) {
					DetachTabs($(".selected:visible").map(function() { return parseInt(this.id); }).toArray());
				} else {
					DetachTabs([menuTabId]);
				}
				break;
			case "tab_reload":
				if ($("#" + menuTabId).is(".selected")) {
					$(".selected:visible").each(function() {
						chrome.tabs.reload(parseInt(this.id));
					});
				} else {
					chrome.tabs.reload(menuTabId);
				}
				break;
			case "tab_pin":
				if ($("#" + menuTabId).is(".selected")) {
					$(".selected:visible").each(function() {
						chrome.tabs.update(parseInt(this.id), { pinned: ($("#" + menuTabId).is(".pin") ? false : true) });
					});
				} else {
					chrome.tabs.update(menuTabId, { pinned: ($("#" + menuTabId).is(".pin") ? false : true) });
				}
				break;
			case "tab_mute":
				if ($("#" + menuTabId).is(".selected")) {
					$(".selected:visible").each(function() {
						chrome.tabs.get(parseInt(this.id), function(tab) {
							chrome.tabs.update(tab.id, { muted: true });
						});
					});
				} else {
					chrome.tabs.get(menuTabId, function(tab) {
						chrome.tabs.update(tab.id, { muted: true });
					});
				}
				break;
			case "tab_unmute":
				if ($("#" + menuTabId).is(".selected")) {
					$(".selected:visible").each(function() {
						chrome.tabs.get(parseInt(this.id), function(tab) {
							chrome.tabs.update(tab.id, { muted: false });
						});
					});
				} else {
					chrome.tabs.get(menuTabId, function(tab) {
						chrome.tabs.update(tab.id, { muted: false });
					});
				}
				break;
			case "tab_mute_other":
				if ($("#" + menuTabId).is(".selected")) {
					$(".tab:visible:not(.selected)").each(function() {
						chrome.tabs.update(parseInt(this.id), { muted: true });
					});
				} else {
					$(".tab:visible:not(#" + menuTabId + ")").each(function() {
						chrome.tabs.update(parseInt(this.id), { muted: true });
					});
				}
				break;
			case "tab_unmute_other":
				if ($("#" + menuTabId).is(".selected")) {
					$(".tab:visible:not(.selected)").each(function() {
						chrome.tabs.update(parseInt(this.id), { muted: false });
					});
				} else {
					$(".tab:visible:not(#" + menuTabId + ")").each(function() {
						chrome.tabs.update(parseInt(this.id), { muted: false });
					});
				}
				break;
			case "tab_close":
				CloseTabs($("#" + menuTabId).is(".selected") ? $(".selected:visible").map(function() { return parseInt(this.id); }).toArray() : [menuTabId]);
				break;
			case "tab_close_tree":
				CloseTabs($("#" + menuTabId).find(".tab").map(function() { return parseInt(this.id); }).toArray());
				CloseTabs([menuTabId]);
				break;
			case "tab_close_other":
				CloseTabs($(".tab:visible:not(#" + menuTabId + ")").map(function() { return parseInt(this.id); }).toArray());
				break;
			case "tab_undo_close":
				chrome.sessions.getRecentlyClosed(null, function(sessions) {
					if (sessions.length > 0) {
						chrome.sessions.restore(null, function() {});
					}
				});
				break;
			case "tab_discard":
				DiscardTabs(bg.dt.tabsIds);
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
		}
		$(".menu").hide(0);
	});
	
	
	
	
	
	
	
	
	
	
	
	// **********          GROUPS MENU          ***************



	// set menu labels
	// $(".groups_menu_item").each(function() {
		// $(this).text(chrome.i18n.getMessage(this.id));
	// });

	// show menu
	// $(document).on("mousedown", "#group_list, .group, #new_group, #at, #ut, #close_group, #remove_tabs_from_group", function(event) {
		// event.stopPropagation();

		// if (event.button == 2) {
			// $(".menu").hide(0);

			// set menu groupId
			// if ($(this).is("#group_list")) {
				// vt.menuGroupId = vt.ActiveGroup;
			// } else {
				// vt.menuGroupId = $(this)[0].id;
			// }
			
			// check what was clicked and modify menu accordingly
			// $(".separator").css({"display":""});
			// $(".groups_menu_item").css({"display":"none"});
			
			// if ($(this).is(".group")) {
				// $("#groups_menu_new, #groups_menu_edit, #groups_menu_bookmark, #groups_menu_mute, #groups_menu_unmute, #groups_menu_mute_other, #groups_menu_unmute_other, #groups_menu_close, #groups_menu_close_with_tabs, #groups_menu_suspend").css({"display":""});
				// if (bg.OperaVersion > 45) {
					// $("#groups_menu_discard, #tabs_menu_discard").css({"display":""});
				// }
				
				// bg.dt.tabsIds = $(".tab."+this.id).map(function() {return parseInt(this.id);}).toArray();
			// }
			
			// if ($(this).is("#at")) {
				// bg.dt.tabsIds = $(".tab").map(function() {return parseInt(this.id);}).toArray();
			// }
			
			// if ($(this).is("#ut")) {
				// bg.dt.tabsIds = $(".tab.at, .tab.ut").map(function() {return parseInt(this.id);}).toArray();
			// }
			
			// if ($(this).is("#at, #ut")) {
				// $("#groups_menu_new, #groups_menu_bookmark, #groups_menu_mute, #groups_menu_unmute").css({"display":""});
				// $("#groups_menu_unmute_other").next().css({"display":"none"});
				// if (bg.OperaVersion > 45) {
					// $("#groups_menu_discard, #tabs_menu_discard").css({"display":""});
				// }
			// }
			
			// if ($(this).is("#group_list, #new_group, #close_group, #remove_tabs_from_group")) {
				// $("#groups_menu_new").css({"display":""});
				// $("#groups_menu_bookmark").next().css({"display":"none"});
				// $("#groups_menu_unmute_other").next(".separator").css({"display":"none"});
			// }

			// add suspended groups to menu
			// $("#groups_menu_suspend").next().css({"display": "none"});
			// if (Object.keys(bg.suspended_groups).length > 0) {
				// $("#groups_menu_suspend").next().css({"display": ""});
				// for (var group in bg.suspended_groups) {
					// if ($("#"+group).length == 0) {
						// var li_group = document.createElement("LI");
							// li_group.id = group;
							// li_group.className = "groups_menu_restore";
							// li_group.setAttribute("data-action", "group_restore");
							// li_group.innerText = bg.suspended_groups[group].n;
						// $("#groups_menu")[0].appendChild(li_group);
					// }
				// }
			// }
			
			// show contextmenu with correct size position
			// if ($("#groups_menu").outerWidth() > $(window).width()-10) {
				// $("#groups_menu").css({"width": $(window).width()-10});
			// } else {
				// $("#groups_menu").css({"width": ""});
			// }
			// var x = event.pageX >= $(window).width()-$("#groups_menu").outerWidth() ? $(window).width()-$("#groups_menu").outerWidth() : event.pageX; // get cursor position and check if menu will fit on the right and bottom
			// var y = event.pageY >= $(window).height()-$("#groups_menu").outerHeight()-10 ? $(window).height()-$("#groups_menu").outerHeight()-10 : event.pageY;
			// $("#groups_menu").css({"display": "block", "top": y, "left": x});
		// }
	// });

	// edit group
	// $(document).on("dblclick", ".group", function(event) {
		// vt.menuGroupId = vt.ActiveGroup;
		// setTimeout(function() {
			// ShowGroupEditWindow();
		// },100);
	// });
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
		vt.PickColorFor = this.id;
		$("#color_picker")[0].value = "#"+rgbtoHex($(this).css("background-color"));
		$("#color_picker").focus();
		$("#color_picker").click();
	});

	// set color from color picker (here, because it is available only from menu)
	// $(document).on("input", "#color_picker", function(event) {
		// $("#"+PickColorFor).css({"background-color": $("#color_picker")[0].value});
	// });

	// move tabs to group
	// $(document).on("mousedown", "#tabs_menu_move_to_new_group, .move_to_group_menu_entry", function(event) {
		// var tabsIds
		// if ($(this).is("#tabs_menu_move_to_new_group")) {
			// bg.dt.DropToGroup = AddNewGroup(575757);
			// GetColorFromMiddlePixel(vt.menuTabId, bg.dt.DropToGroup);
		// } else {
			// bg.dt.DropToGroup = this.id.substr(8);
		// }
		// AppendTabsToGroup({tabsIds: bg.dt.tabsIds, groupId: bg.dt.DropToGroup, SwitchTabIfHasActive: true, insertAfter: true, RemoveClass: "selected", moveTabs: true});
	// });


	// if the menu element is clicked
	// $(document).on("mousedown", "#groups_menu li", function(event) {
		// if (event.button != 0) {
			// return;
		// }
		// event.stopPropagation();
		// switch($(this).attr("data-action")) {
			// case "group_new":
				// AddNewGroup(GetRandomHexColor());
			// break;
			// case "group_mute":
				// bg.dt.tabsIds.forEach(function(tabId) {
					// chrome.tabs.update(tabId, {muted: true});
				// });
			// break;
			// case "group_unmute":
				// bg.dt.tabsIds.forEach(function(tabId) {
					// chrome.tabs.update(tabId, {muted: false});
				// });
			// break;
			// case "group_mute_other":
				// $(".tab:not(."+vt.menuGroupId+")").each(function() {
					// chrome.tabs.update(parseInt(this.id), {muted: true});
				// });
			// break;
			// case "group_unmute_other":
				// $(".tab:not(."+vt.menuGroupId+")").each(function() {
					// chrome.tabs.update(parseInt(this.id), {muted: false});
				// });
			// break;
			// case "group_bookmark":
				// BookmarkTabs(bg.dt.tabsIds, vt.menuGroupId.match("at") != null ? "All tabs" : vt.menuGroupId.match("ut") != null ? "Ungrouped tabs" : bg.groups[$("#"+vt.menuGroupId).index()].n);
			// break;
			// case "group_discard":
				// DiscardTabs(bg.dt.tabsIds);
			// break;
			// case "group_edit":
				// ShowGroupEditWindow();
			// break;
			// case "group_close":
				// GroupRemove(vt.menuGroupId, false);
			// break;
			// case "group_close_with_tabs":
				// GroupRemove(vt.menuGroupId, true);
			// break;
			// case "group_suspend":
				// chrome.tabs.query({windowId:-2}, function(tabs) {
					// bg.suspended_groups[vt.menuGroupId] = {n: "", c: "", tabs: []};
					// tabs.forEach(function(Tab) {
						// if (bg.tabs[Tab.id] && bg.tabs[Tab.id].g == vt.menuGroupId && !Tab.pinned) {
							// bg.groups.forEach(function(group) {
								// if (group.g == vt.menuGroupId) {
									// bg.suspended_groups[vt.menuGroupId].n = group.n;
									// bg.suspended_groups[vt.menuGroupId].c = group.c;
								// }
							// });
							// bg.suspended_groups[vt.menuGroupId].tabs.push(Tab.url);
						// }
					// });
					// setTimeout(function() {
						// localStorage["suspended_groups"] = JSON.stringify(bg.suspended_groups);
					// },3000);
					// GroupRemove(vt.menuGroupId, true);
				// });
			// break;
			// case "group_restore":
				// var newId = "g_"+GetRandomID();
				// bg.groups.push( {g:newId, n:bg.suspended_groups[this.id].n, c:bg.suspended_groups[this.id].c} );
				// AppendGroupToList(newId, bg.suspended_groups[this.id].n, bg.suspended_groups[this.id].c);
				// CreateTabs(bg.suspended_groups[this.id].tabs, newId);
				// delete bg.suspended_groups[this.id];
				// $(this).remove();
				// setTimeout(function() {
					// localStorage["suspended_groups"] = JSON.stringify(bg.suspended_groups);
				// },5000);
			// break;
		// }
		// $(".menu").hide(0);
	// });

}