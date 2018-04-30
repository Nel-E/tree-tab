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
			let BAKbutton = document.getElementById("button_load_bak"+message.bak);
			if (BAKbutton != null) {
				BAKbutton.classList.remove("disabled");
			}
		}

		if (message.command == "drag_drop") {
			if (opt.debug) console.log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			if (opt.debug) console.log(message);

			CleanUpDragClasses();
			DragNodeClass = message.DragNodeClass;
			DragTreeDepth = Object.assign(0, message.DragTreeDepth);
			
			if (opt.debug) console.log(DragAndDrop);
		}

		if (message.command == "dragend") {
			CleanUpDragClasses();
			EmptyDragAndDrop();
		}

		if (message.command == "remove_folder") {
			RemoveFolder(message.folderId);
		}

		if (message.command == "reload_sidebar") {
			if (opt.debug) console.log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			if (opt.debug) console.log(message);
			window.location.reload();
		}

		if (message.command == "reload_options") {
			if (opt.debug) console.log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			opt = Object.assign({}, message.opt);
			setTimeout(function() {
				RestorePinListRowSettings();
			}, 100);
		}

		if (message.command == "reload_toolbar") {
			if (opt.debug) console.log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			opt = Object.assign({}, message.opt);

			if (opt.show_toolbar) {
				RemoveToolbar();
				RecreateToolbar(message.toolbar);
				SetToolbarEvents(false, true, true, "mousedown");
				RestoreToolbarShelf();
				RestoreToolbarSearchFilter();
			} else {
				RemoveToolbar();
			}
			RefreshGUI();
		}

		if (message.command == "reload_theme") {
			if (opt.debug) console.log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			RestorePinListRowSettings();
			ApplyTheme(message.theme);
		}

		if (message.windowId == CurrentWindowId) {
			
			// I WANT TO MOVE THIS LOGIC TO THE BACKGROUND SCRIPT!
			
			if (message.command == "tab_created") { // if set to treat unparented tabs as active tab's child
			
				if (opt.debug) console.log("tab_created: "+message.tabId);
				if (opt.debug) console.log("tab is pinned: "+message.tab.pinned);

				if (message.tab.url !== undefined) {
					for(let i = 0; i < opt.tab_group_regexes.length; i++) {
						var regexPair = opt.tab_group_regexes[i];
						if(message.tab.url.match(regexPair[0])) {
							var groupId = FindGroupIdByName(regexPair[1]);
							if(groupId === null) {
								groupId = AddNewGroup(regexPair[1]);
							}
							if(active_group !== groupId) {
								SetActiveGroup(groupId, true, true);
								// It becomes an orphan if it's being opened in a different group.
								message.parentTabId = undefined;
								message.tab.openerTabId = undefined;
							}
						}
					}
				}


				// if (opt.move_tabs_on_url_change != "never") {
					// tabUrls[message.tab.id] = message.tab.url;
				// }
					// console.log("tab_created url:");
					// console.log(message.tab.url);
					// console.log("newTabUrl");
					// console.log(newTabUrl);
				if ((opt.move_tabs_on_url_change == "from_empty" && message.tab.url == newTabUrl) || opt.move_tabs_on_url_change == "all_new") {
					EmptyTabs.push(message.tab.id);
					// console.log(EmptyTabs);
				}
				
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
						// if (!newTabButtonClicked && opt.orphaned_tabs_to_ungrouped === true) {
							// if (active_group != "tab_list") {
								// SetActiveGroup("tab_list", false, false);
							// }
						// }
						if (message.tab.url != newTabUrl && opt.orphaned_tabs_to_ungrouped === true) {
						// if (!newTabButtonClicked && opt.orphaned_tabs_to_ungrouped === true) {
							if (active_group != "tab_list") {
								SetActiveGroup("tab_list", false, false);
							}
						}
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
				setTimeout(function() {
					schedule_update_data++;
				}, 500);
				setTimeout(function() {
					RefreshCounters();
					RefreshGUI();
				},50);
				return;
			}
			if (message.command == "tab_attached") {
				if (opt.debug) console.log("tab_attached " + message.tabId + ", tab is pinned: " + message.tab.pinned + ", ParentId: "+ message.ParentId);
				AppendTab(message.tab, message.ParentId, false, false, true, false, true, false, false, true, false);
				RefreshGUI();
				return;
			}
			if (message.command == "tab_detached") {
				let ctDetachedParent = document.getElementById(message.tabId).childNodes[1];
				if (ctDetachedParent != null) {
					if (opt.promote_children_in_first_child == true && ctDetachedParent.childNodes.length > 1) {
						let ctNewParent = document.getElementById(ctDetachedParent.firstChild.id).childNodes[1];
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

				// if (tabUrls[message.tabId]) {
					// delete tabUrls[message.tabId];
				// }
				if (EmptyTabs.indexOf(message.tabId) != -1) {
					EmptyTabs.splice(EmptyTabs.indexOf(message.tabId), 1);
					// console.log(EmptyTabs);
				}


				if (opt.debug) console.log("tab_removed: "+message.tabId);
				let mTab = document.getElementById(message.tabId);
				if (mTab != null) {
					let ctParent = mTab.childNodes[1];
					if (opt.debug) console.log("tab_removed, promote children: " +opt.promote_children);
					if (opt.promote_children == true) {
						if (opt.promote_children_in_first_child == true && ctParent.childNodes.length > 1) {
							let ctNewParent = document.getElementById(ctParent.firstChild.id).childNodes[1];
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
					if (updateTab != null) {
						if (message.tab.pinned && updateTab.classList.contains("pin") == false) {
							SetTabClass(message.tabId, true);
							schedule_update_data++;
						}
						if (!message.tab.pinned && updateTab.classList.contains("tab") == false) {
							SetTabClass(message.tabId, false);
							schedule_update_data++;
						}
					}
					RefreshExpandStates();
				}
				
				if (message.changeInfo.url != undefined) {
					if (((opt.move_tabs_on_url_change === "from_empty" || opt.move_tabs_on_url_change === "all_new") && EmptyTabs.indexOf(message.tabId) != -1) || opt.move_tabs_on_url_change === "always") {
						for (let i = 0; i < opt.tab_group_regexes.length; i++) {
							var regexPair = opt.tab_group_regexes[i];
							if (message.changeInfo.url.match(regexPair[0])) {
								var groupId = FindGroupIdByName(regexPair[1]);
								if (groupId === null) {
									groupId = AddNewGroup(regexPair[1]);
								}
								if (active_group !== groupId) {
									let updateTab = document.getElementById(message.tabId);
									let newParent = document.getElementById("ct" + groupId);
									if (updateTab != null && updateTab.classList.contains("tab") && !message.tab.pinned) {
										SetTabClass(updateTab.id, false);
										newParent.appendChild(updateTab);
									}

									SetActiveGroup(groupId, true, true);
									SetActiveTabInGroup(groupId, updateTab.id);
									chrome.tabs.update(message.tabId, { active: true });
									
									// schedule_update_data++;
									// SetActiveTab(updateTab.id);
								}
								break;
							}
						}
					}

					if (EmptyTabs.indexOf(message.tabId) != -1) {
						EmptyTabs.splice(EmptyTabs.indexOf(message.tabId), 1);
						// console.log(EmptyTabs);
					}

					
					// tabUrls[message.tabId] = message.changeInfo.url;
					
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