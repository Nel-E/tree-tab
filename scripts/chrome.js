// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********         CHROME EVENTS         ***************

function StartChromeListeners() {
	if (browserId == "F") {
		browser.browserAction.onClicked.addListener(function(tab) {
			if (tab.windowId == CurrentWindowId) {
				browser.sidebarAction.close();
			}
		});
	}
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		log("message to sidebar "+CurrentWindowId+": ");
		log(message);
		if (message.command == "backup_available") {
			$("#button_load_bak"+message.bak).removeClass("disabled");
		}
		if (message.command == "drag_drop") {
			DragAndDrop.ComesFromWindowId = message.ComesFromWindowId;
			DragAndDrop.DragNodeClass = message.DragNodeClass;
			DragAndDrop.Depth = message.Depth;
			DragAndDrop.Folders = Object.assign({}, message.Folders);
			DragAndDrop.FoldersSelected = message.FoldersSelected;
			DragAndDrop.TabsIds = message.TabsIds;
			DragAndDrop.TabsIdsParents = message.TabsIdsParents;
			DragAndDrop.TabsIdsSelected = message.TabsIdsSelected;
		}
		if (message.command == "dropped") {
			DragAndDrop.DroppedToWindowId = message.DroppedToWindowId;
			if (Object.keys(DragAndDrop.Folders).length > 0 && message.DroppedToWindowId != CurrentWindowId) {
				for (var folder in DragAndDrop.Folders)
				{
					RemoveFolder(DragAndDrop.Folders[folder].id);
				}
			}
		}
		if (message.command == "reload_sidebar") {
			window.location.reload();
		}
		if (message.command == "reload_options") {
			chrome.runtime.sendMessage({command: "get_preferences"}, function(response) {
				opt = Object.assign({}, response);
				setTimeout(function() {
					RestorePinListRowSettings();
				}, 200);
			});
		}
		if (message.command == "reload_theme") {
			setTimeout(function() {
				chrome.runtime.sendMessage({command: "get_theme", windowId: CurrentWindowId}, function(response) {
					RestorePinListRowSettings();
					let theme = response;
					ApplyTheme(theme);
				});
			}, 300);
		}
		if (message.windowId == CurrentWindowId) {
			switch(message.command) {
				case "tab_created": // if set to treat unparented tabs as active tab's child
					if (opt.append_orphan_tab == "as_child" && message.tab.openerTabId == undefined && $("#"+active_group+" .active_tab")[0]) {
						message.tab.openerTabId = $("#"+active_group+" .active_tab")[0].id;
					}
					if (message.tab.openerTabId) { // child case
						if (opt.append_child_tab == "after_active") {
							AppendTab({ tab: message.tab, InsertAfterId: $("#"+active_group+" .active_tab")[0] ? $("#"+active_group+" .active_tab")[0].id : undefined, Append: false, Scroll: true  });
						} else {
							if (opt.max_tree_depth < 0 || (opt.max_tree_depth > 0 && $("#"+message.tab.openerTabId).parents(".tab").length < opt.max_tree_depth)) { // append to tree
								if (opt.append_child_tab == "top") {
									AppendTab({ tab: message.tab, ParentId: message.tab.openerTabId, Append: false, Scroll: true });
								}
								if (opt.append_child_tab == "bottom") {
									AppendTab({ tab: message.tab, ParentId: message.tab.openerTabId, Append: true, Scroll: true });
								}
							}
							if (opt.max_tree_depth > 0 && $("#"+message.tab.openerTabId).parents(".tab").length >= opt.max_tree_depth) { // if reached depth limit of the tree
								if (opt.append_child_tab_after_limit == "after") {
									AppendTab({ tab: message.tab, InsertAfterId: message.tab.openerTabId, Append: true, Scroll: true });
								}
								if (opt.append_child_tab_after_limit == "top") {
									AppendTab({ tab: message.tab, ParentId: $("#"+message.tab.openerTabId).parent().parent()[0].id, Append: false, Scroll: true });
								}
								if (opt.append_child_tab_after_limit == "bottom") {
									AppendTab({ tab: message.tab, ParentId: $("#"+message.tab.openerTabId).parent().parent()[0].id, Append: true, Scroll: true });
								}
							}
						}
						if (opt.max_tree_depth == 0) { // place tabs flat, (should I merge it with orphans case?)
							if (opt.append_child_tab_after_limit == "after") {
								AppendTab({ tab: message.tab, InsertAfterId: message.tab.openerTabId, Append: false, Scroll: true });
							}
							if (opt.append_child_tab_after_limit == "top") {
								AppendTab({ tab: message.tab, Append: false, Scroll: true });
							}
							if (opt.append_child_tab_after_limit == "bottom") {
								AppendTab({ tab: message.tab, Append: true, Scroll: true });
							}
						}
					} else { // orphan case
						if (opt.append_orphan_tab == "after_active") {
							AppendTab({ tab: message.tab, InsertAfterId: $("#"+active_group+" .active_tab")[0] ? $("#"+active_group+" .active_tab")[0].id : undefined, Append: false });
						}
						if (opt.append_orphan_tab == "top") {
							AppendTab({ tab: message.tab, Append: false });
						}
						if (opt.append_orphan_tab == "bottom" || opt.append_orphan_tab == "as_child") {
							AppendTab({ tab: message.tab, Append: true });
						}
					}
					if ($("#"+message.tab.openerTabId).is(".c")) {
						$("#"+message.tab.openerTabId).removeClass("c").addClass("o");
					}
					if (opt.syncro_tabbar_tabs_order) {
						let TTtabsIndexes = $(".pin, .tab").map(function(){return parseInt(this.id);}).toArray();
						chrome.tabs.move(message.tab.id, {index: TTtabsIndexes.indexOf(message.tab.id)});
					}
					RefreshExpandStates();
					schedule_update_data++;
					RefreshGUI();
					RefreshCounters();
				break;
				case "tab_attached":
					AppendTab({tab: message.tab, ParentId: message.ParentId, Append: true});
					RefreshGUI();
				break;
				case "tab_detached":
					if ($(".tab#"+message.tabId)[0]) {
						if (opt.promote_children == true) {
							if (opt.promote_children_in_first_child == true && $("#ch"+message.tabId).children().length > 1) {
								let FirstChild = $("#ch"+message.tabId).children()[0];
								$(FirstChild).insertAfter($("#"+message.tabId));
								$("#ch"+FirstChild.id).append($("#ch"+message.tabId).children());
							} else {
								$("#ch"+message.tabId).children().insertAfter($("#"+message.tabId));
							}
						} else {
							$("#ch"+message.tabId).find(".tab").each(function() {
								RemoveTabFromList(this.id);
							});
						}
					}
					RemoveTabFromList(message.tabId);
					setTimeout(function() {
						schedule_update_data++;
					}, 300);
					RefreshGUI();
				break;
				case "tab_removed":
					if ($(".tab#"+message.tabId)[0]) {
						if (opt.promote_children == true) {
							if (opt.promote_children_in_first_child == true && $("#ch"+message.tabId).children().length > 1) {
								let FirstChild = $("#ch"+message.tabId).children()[0];
								$(FirstChild).insertAfter($("#"+message.tabId));
								$("#ch"+FirstChild.id).append($("#ch"+message.tabId).children());
							} else {
								$("#ch"+message.tabId).children().insertAfter($("#"+message.tabId));
							}
						} else {
							$("#ch"+message.tabId).find(".tab").each(function() {
								chrome.tabs.remove(parseInt(this.id));
							});
						}
					}
					RemoveTabFromList(message.tabId);
					RefreshExpandStates();
					setTimeout(function() {
						schedule_update_data++;
					}, 300);
					RefreshGUI();
					RefreshCounters();
				break;
				case "tab_activated":
					setTimeout(function() {
						SetActiveTab(message.tabId);
					}, 200);
				break;
				case "tab_attention":
					SetAttentionIcon(message.tabId);
				break;
				case "tab_updated":
					if (message.changeInfo.favIconUrl != undefined || message.changeInfo.url != undefined) {
						setTimeout(function() {
							GetFaviconAndTitle(message.tabId, true);
						}, 100);
					}
					if (message.changeInfo.title != undefined) {
						setTimeout(function() {
							GetFaviconAndTitle(message.tabId, true);
						}, 1000);
					}
					if (message.changeInfo.audible != undefined || message.changeInfo.mutedInfo != undefined) {
						RefreshMediaIcon(message.tabId);
					}
					if (message.changeInfo.discarded != undefined) {
						RefreshDiscarded(message.tabId);
					}
					if (message.changeInfo.pinned != undefined) {
						if ((message.tab.pinned && $("#"+message.tabId).is(".tab")) || (!message.tab.pinned && $("#"+message.tabId).is(".pin"))) {
							SetTabClass({ id: message.tabId, pin: message.tab.pinned });
							schedule_update_data++;
						}
						RefreshExpandStates();
					}
				break;
				case "remote_update":
					RearrangeTreeStructure(message.groups, message.folders, message.tabs);
					sendResponse(true);
				break;
			}
		}
		
	});
}