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
		if (message.command == "backup_available") {
			if (opt.debug) console.log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			document.getElementById("button_load_bak"+message.bak).classList.remove("disabled");
		}
		if (message.command == "drag_drop") {
			if (opt.debug) console.log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			if (opt.debug) console.log(message);
			DragAndDrop.ComesFromWindowId = message.ComesFromWindowId;
			DragAndDrop.DragNodeClass = message.DragNodeClass;
			DragAndDrop.Depth = message.Depth;
			DragAndDrop.Folders = Object.assign({}, message.Folders);
			DragAndDrop.FoldersSelected = message.FoldersSelected;
			DragAndDrop.TabsIds = message.TabsIds;
			DragAndDrop.TabsIdsParents = message.TabsIdsParents;
			DragAndDrop.TabsIdsSelected = message.TabsIdsSelected;
			DropTargetsFront(undefined, true, false);
		}
		if (message.command == "dropped") {
			if (opt.debug) console.log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			if (opt.debug) console.log(message);
			DragAndDrop.DroppedToWindowId = message.DroppedToWindowId;
			if (Object.keys(DragAndDrop.Folders).length > 0 && message.DroppedToWindowId != CurrentWindowId) {
				for (var folder in DragAndDrop.Folders)
				{
					RemoveFolder(DragAndDrop.Folders[folder].id);
				}
			}
		}
		if (message.command == "dragend") {
			CleanUpDragClasses();
		}
		if (message.command == "reload_sidebar") {
			if (opt.debug) console.log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			if (opt.debug) console.log(message);
			window.location.reload();
		}
		if (message.command == "reload_options") {
			if (opt.debug) console.log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			chrome.runtime.sendMessage({command: "get_preferences"}, function(response) {
				opt = Object.assign({}, response);
				setTimeout(function() {
					RestorePinListRowSettings();
			}, 200);
			});
		}
		if (message.command == "reload_theme") {
			if (opt.debug) console.log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			setTimeout(function() {
				chrome.runtime.sendMessage({command: "get_theme", windowId: CurrentWindowId}, function(response) {
					RestorePinListRowSettings();
					let theme = response;
					ApplyTheme(theme);
				});
			}, 300);
		}
		if (message.windowId == CurrentWindowId) {
			
			// I WANT TO MOVE THIS LOGIC TO THE BACKGROUND SCRIPT!
			
			if (message.command == "tab_created") { // if set to treat unparented tabs as active tab's child
			
				if (opt.debug) console.log("tab_created: "+message.tabId);
				if (opt.debug) console.log("tab is pinned: "+message.tab.pinned);

				if (message.parentTabId != undefined) {
					AppendTab(message.tab, message.parentTabId, false, false, true, message.index, true, false, false, true, false);
				} else {
					if (opt.append_orphan_tab == "as_child" && message.tab.openerTabId == undefined && document.querySelector("#"+active_group+" .active_tab")) {
						if (opt.debug) console.log("ignore orphan case, append tab as child");
						message.tab.openerTabId = document.querySelector("#"+active_group+" .active_tab").id;
					}
					if (message.tab.openerTabId) { // child case
						if (opt.append_child_tab == "after_active") {
							if (opt.debug) console.log("child case, tab will append after active");
							AppendTab(message.tab, false, false, document.querySelector("#"+active_group+" .active_tab") != null ? document.querySelector("#"+active_group+" .active_tab").id : false, false, false, true, false, false, true, false);
						} else {
							let Parents = GetParentsByClass(document.getElementById(message.tab.openerTabId), "tab");
							if (opt.max_tree_depth < 0 || (opt.max_tree_depth > 0 && Parents.length < opt.max_tree_depth)) { // append to tree
								if (opt.append_child_tab == "top") {
									if (opt.debug) console.log("child case, in tree limit, tab will append on top");
									AppendTab(message.tab, message.tab.openerTabId, false, false, (message.tab.pinned ? true : false), false, true, false, false, true, false);
								}
								if (opt.append_child_tab == "bottom") {
									if (opt.debug) console.log("child case, in tree limit, tab will append on bottom");
									AppendTab(message.tab, message.tab.openerTabId, false, false, true, false, true, false, false, true, false);
								}
							}
							if (opt.max_tree_depth > 0 && Parents.length >= opt.max_tree_depth) { // if reached depth limit of the tree
								if (opt.debug) console.log("child case, surpassed tree limit");
								if (opt.append_child_tab_after_limit == "after") {
									if (opt.debug) console.log("tab will append after active");
									AppendTab(message.tab, false, false, message.tab.openerTabId, true, false, true, false, false, true, false);
								}
								if (opt.append_child_tab_after_limit == "top") {
									if (opt.debug) console.log("tab will append on top");
									AppendTab(message.tab, document.getElementById(message.tab.openerTabId).parentNode.parentNode.id, false, false, (message.tab.pinned ? true : false), false, true, false, false, true, false);
								}
								if (opt.append_child_tab_after_limit == "bottom") {
									if (opt.debug) console.log("tab will append on bottom");
									AppendTab(message.tab, document.getElementById(message.tab.openerTabId).parentNode.parentNode.id, false, false, true, false, true, false, false, true, false);
								}
							}
						}
						if (opt.max_tree_depth == 0) { // place tabs flat
							if (opt.debug) console.log("max_tree_depth is 0, tabs are placed on the same level");
							if (opt.append_child_tab_after_limit == "after") {
								if (opt.debug) console.log("tab will append after active");
								AppendTab(message.tab, false, false, message.tab.openerTabId, false, false, true, false, false, true, false);
							}
							if (opt.append_child_tab_after_limit == "top") {
								if (opt.debug) console.log("tab will append on top");
								AppendTab(message.tab, false, false, false, false, false, true, false, false, true, false);
							}
							if (opt.append_child_tab_after_limit == "bottom") {
								if (opt.debug) console.log("tab will append on bottom");
								AppendTab(message.tab, false, false, false, true, false, true, false, false, true, false);
							}
						}
					} else { // orphan case
						if (opt.append_orphan_tab == "after_active") {
							AppendTab(message.tab, false, false, (document.querySelector("#"+active_group+" .active_tab") != null ? document.querySelector("#"+active_group+" .active_tab").id : undefined), (message.tab.pinned ? true : false), false, true, false, false, true, false);
						}
						if (opt.append_orphan_tab == "top") {
							AppendTab(message.tab, false, false, false, false, false, true, false, false, true, false);
						}
						if (opt.append_orphan_tab == "bottom" || opt.append_orphan_tab == "as_child") {
							AppendTab(message.tab, false, false, false, true, false, true, false, false, true, false);
						}
					}
				}
				
				if (message.tab.openerTabId) { // check if openerTabId is defined, if it's in DOM and if it's closed, then change it to open
					let openerTab = document.querySelector(".c[id='"+message.tab.openerTabId+"']");
					if (openerTab != null) {
						openerTab.classList.remove("c");
						openerTab.classList.add("o");
					}
				}
				if (opt.syncro_tabbar_tabs_order) {
					let tabIds = Array.prototype.map.call(document.querySelectorAll(".pin, .tab"), function(s){
						return parseInt(s.id);
					});
					chrome.tabs.move(message.tab.id, {index: tabIds.indexOf(message.tab.id)});
				}
				RefreshExpandStates();
				schedule_update_data++;
				RefreshGUI();
				RefreshCounters();
				return;
			}
			if (message.command == "tab_attached") {
				if (opt.debug) console.log(message);
				AppendTab(message.tab, message.ParentId, false, false, true, false, true, false, false, true, false);
				RefreshGUI();
				return;
			}
			if (message.command == "tab_detached") {
				let ctDetachedParent = document.getElementById(message.tabId).childNodes[4];
				if (ctDetachedParent != null) {
					if (opt.promote_children_in_first_child == true && ctDetachedParent.childNodes.length > 1) {
						let ctNewParent = document.getElementById(ctDetachedParent.firstChild.id).childNodes[4];
						ctDetachedParent.parentNode.parentNode.insertBefore(ctDetachedParent.firstChild, ctDetachedParent.parentNode);
						while (ctDetachedParent.firstChild) {
							ctNewParent.appendChild(ctDetachedParent.firstChild);
						}
					} else {
						while (ctDetachedParent.firstChild) {
							ctDetachedParent.parentNode.parentNode.insertBefore(ctDetachedParent.firstChild, ctDetachedParent.parentNode);
						}
					}
				}
				RemoveTabFromList(message.tabId);
				setTimeout(function() {
					schedule_update_data++;
				}, 300);
				RefreshGUI();
				return;
			}
			if (message.command == "tab_removed") {
				if (opt.debug) console.log("tab_removed: "+message.tabId);
				let mTab = document.getElementById(message.tabId);
				if (mTab != null) {
					let ctParent = mTab.childNodes[4];
					if (opt.debug) console.log("tab_removed, promote children: " +opt.promote_children);
					if (opt.promote_children == true) {
						if (opt.promote_children_in_first_child == true && ctParent.childNodes.length > 1) {
							let ctNewParent = document.getElementById(ctParent.firstChild.id).childNodes[4];
							ctParent.parentNode.parentNode.insertBefore(ctParent.firstChild, ctParent.parentNode);
							while (ctParent.firstChild) {
								ctNewParent.appendChild(ctParent.firstChild);
							}
						} else {
							while (ctParent.firstChild) {
								ctParent.parentNode.parentNode.insertBefore(ctParent.firstChild, ctParent.parentNode);
							}
						}
					} else {
						document.querySelectorAll("[id='"+message.tabId+"'] .tab").forEach(function(s) {
							chrome.tabs.remove(parseInt(s.id));
						});
					}
					RemoveTabFromList(message.tabId);
					RefreshExpandStates();
					setTimeout(function() {
						schedule_update_data++;
					}, 300);
					RefreshGUI();
					RefreshCounters();
				}
				return;
			}
			if (message.command == "tab_activated") {
				SetActiveTab(message.tabId);
				return;
			}
			if (message.command == "tab_attention") {
				SetAttentionIcon(message.tabId);
				return;
			}
			if (message.command == "tab_updated") {
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
					let updateTab = document.getElementById(message.tabId);
					if (updateTab != null && ( (message.tab.pinned && updateTab.classList.contains("tab")) || (!message.tab.pinned && updateTab.classList.contains("pin")) )  ) {
						SetTabClass(message.tabId, message.tab.pinned);
						schedule_update_data++;
					}
					RefreshExpandStates();
				}
				return;
			}
			if (message.command == "remote_update") {
				RearrangeTreeStructure(message.groups, message.folders, message.tabs);
				sendResponse(true);
				return;
			}
		}
		
	});
}