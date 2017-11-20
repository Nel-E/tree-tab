// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********         CHROME EVENTS         ***************

function StartChromeListeners(){
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		if (message.command == "drag_drop") {
			DragAndDrop.DragNodeClass = message.DragNodeClass;
			DragAndDrop.SelectedTabsIds = message.SelectedTabsIds;
			DragAndDrop.TabsIds = message.TabsIds;
			DragAndDrop.Parents = message.Parents;
			DragAndDrop.ComesFromWindowId = message.ComesFromWindowId;
			DragAndDrop.Depth = message.Depth;
		}
		if (message.command == "reload_sidebar") {
			window.location.reload();
		}
		if (message.command == "reload_options") {
			LoadPreferences();
			setTimeout(function() {
				RestorePinListRowSettings();
			},200);
		}
		if (message.command == "reload_theme") {
			let theme = LoadData(message.themeName, DefaultTheme);
			ApplySizeSet(theme["TabsSizeSetNumber"]);
			ApplyColorsSet(theme["ColorsSet"]);
			if (theme.ToolbarShow) {
				$("#toolbar").html(theme.toolbar);
			} else {
				$("#toolbar").html("");
			}
			RestoreToolbarSearchFilter();
			RestoreToolbarShelf();
		}
		if (message.windowId == CurrentWindowId) {
			switch(message.command) {
				case "tab_created":
					// if set to treat unparented tabs as active tab's child
					if (opt.append_orphan_tab == "as_child" && message.tab.openerTabId == undefined && $(".active:visible")[0]) {
						message.tab.openerTabId = $(".active:visible")[0].id;
					}
					// child case
					if (message.tab.openerTabId) {
						// append to tree
						if (opt.max_tree_depth < 0 || (opt.max_tree_depth > 0 && $("#"+message.tab.openerTabId).parents(".tab").length < opt.max_tree_depth)) {
							if (opt.append_child_tab == "top") {
								AppendTab({ tab: message.tab, ParentId: message.tab.openerTabId, Append: false, Scroll: true });
							}
							if (opt.append_child_tab == "bottom") {
								AppendTab({ tab: message.tab, ParentId: message.tab.openerTabId, Append: true, Scroll: true });
							}
						}
						// if reached depth limit of the tree
						if (opt.max_tree_depth > 0 && $("#"+message.tab.openerTabId).parents(".tab").length >= opt.max_tree_depth) {
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
						// place tabs flat, (should I merge it with orphans case?)
						if (opt.max_tree_depth == 0) {
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
					// orphan case
					} else {
						if (opt.append_orphan_tab == "after_active") {
							AppendTab({ tab: message.tab, InsertAfterId: $(".active:visible")[0] ? $(".active:visible")[0].id : undefined, Append: false });
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
					RefreshExpandStates();
					schedule_update_data++;
					RefreshGUI();
				break;
				case "tab_attached":
					AppendTab({ tab: message.tab, ParentId: message.ParentId, Append: true});
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
					setTimeout(function() { schedule_update_data++; },300);
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
					setTimeout(function() { schedule_update_data++; },300);
					RefreshGUI();
				break;
				case "tab_activated":
					setTimeout(function() { SetActiveTab(message.tabId); },100);
				break;
				case "tab_attention":
					SetAttentionIcon(message.tabId);
				break;
				case "tab_updated":
					if (message.changeInfo.favIconUrl != undefined || message.changeInfo.url != undefined) {
						setTimeout(function() {
							GetFaviconAndTitle(message.tabId, true);
						},100);
					}
					if (message.changeInfo.title != undefined) {
						setTimeout(function() {
							GetFaviconAndTitle(message.tabId, true);
						},1000);
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
			}
		}
		
	});
}