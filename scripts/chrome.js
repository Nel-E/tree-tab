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
			if (opt.debug) {
				log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			}
			let BAKbutton = document.getElementById("button_load_bak"+message.bak);
			if (BAKbutton != null) {
				BAKbutton.classList.remove("disabled");
			}
		}

		if (message.command == "drag_drop") {
			if (opt.debug) {
				log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			}
			CleanUpDragClasses();
			DragNodeClass = message.DragNodeClass;
			DragTreeDepth = Object.assign(0, message.DragTreeDepth);
		}

		if (message.command == "dragend") {
			if (opt.debug) {
				log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			}
			CleanUpDragClasses();
			EmptyDragAndDrop();
		}

		if (message.command == "remove_folder") {
			if (opt.debug) {
				log("message to sidebar "+CurrentWindowId+": message: "+message.command+" folderId: "+message.folderId);
			}
			RemoveFolder(message.folderId);
		}

		if (message.command == "reload_sidebar") {
			if (opt.debug) {
				log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			}
			window.location.reload();
		}

		if (message.command == "reload_options") {
			if (opt.debug) {
				log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			}
			opt = Object.assign({}, message.opt);
			setTimeout(function() {
				RestorePinListRowSettings();
			}, 100);
		}

		if (message.command == "reload_toolbar") {
			if (opt.debug) {
				log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			}
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
			if (opt.debug) {
				log("message to sidebar "+CurrentWindowId+": message: "+message.command);
			}
			RestorePinListRowSettings();
			ApplyTheme(message.theme);
		}

		if (message.windowId == CurrentWindowId) {
			
			// I WANT TO MOVE THIS LOGIC TO THE BACKGROUND SCRIPT!
			
			if (message.command == "tab_created") {

				chrome.tabs.get(message.tabId, function(NewTab) { // get tab again as reported tab's url is empty! Also for some reason firefox sends tab with "active == false" even if tab is active (THIS IS POSSIBLY A NEW BUG IN FF 60.01!)
					if (opt.debug) {
						log("chrome event: tab_created: "+message.tabId);
					}
					
					if (opt.move_tabs_on_url_change == "from_empty_b" && NewTab.url == newTabUrl) {
						EmptyTabs.push(message.tabId);
					}

					if (document.getElementById(message.tabId) == null) {

						if (opt.move_tabs_on_url_change == "from_empty" && NewTab.url == newTabUrl) {
							EmptyTabs.push(message.tabId);
						}
						
						if (message.parentTabId != undefined) {
							AppendTab(NewTab, message.parentTabId, false, false, true, message.index, true, false, false, true, false);
						} else {
							if (opt.append_orphan_tab == "as_child" && NewTab.openerTabId == undefined && document.querySelector("#"+active_group+" .active_tab")) {
								if (opt.debug) {
									log("tab_created: as_child, ignores orphan case, appending tab as child");
								}
								NewTab.openerTabId = document.querySelector("#"+active_group+" .active_tab").id;
							}
							if (NewTab.openerTabId) { // child case
								if (opt.append_child_tab == "after_active") {
									if (opt.debug) {
										log("tab_created: child case, tab will append after active, openerTabId: "+NewTab.openerTabId);
									}
									AppendTab(NewTab, false, false, document.querySelector("#"+active_group+" .active_tab") != null ? document.querySelector("#"+active_group+" .active_tab").id : false, false, false, true, false, false, true, false);
								} else {
									let Parents = GetParentsByClass(document.getElementById(NewTab.openerTabId), "tab");
									if (opt.max_tree_depth < 0 || (opt.max_tree_depth > 0 && Parents.length < opt.max_tree_depth)) { // append to tree
										if (opt.append_child_tab == "top") {
											if (opt.debug) {
												log("tab_created: child case, in tree limit, tab will append on top, openerTabId: "+NewTab.openerTabId);
											}
											AppendTab(NewTab, NewTab.openerTabId, false, false, (NewTab.pinned ? true : false), false, true, false, false, true, false);
										}
										if (opt.append_child_tab == "bottom") {
											if (opt.debug) {
												log("tab_created: child case, in tree limit, tab will append on bottom, openerTabId: "+NewTab.openerTabId);
											}
											AppendTab(NewTab, NewTab.openerTabId, false, false, true, false, true, false, false, true, false);
										}
									}
									if (opt.max_tree_depth > 0 && Parents.length >= opt.max_tree_depth) { // if reached depth limit of the tree
										if (opt.debug) {
											log("tab_created: child case, surpassed tree limit, openerTabId: "+NewTab.openerTabId);
										}
										if (opt.append_child_tab_after_limit == "after") {
											if (opt.debug) {
												log("tab_created: tab will append after active, openerTabId: "+NewTab.openerTabId);
											}
											AppendTab(NewTab, false, false, NewTab.openerTabId, true, false, true, false, false, true, false);
										}
										if (opt.append_child_tab_after_limit == "top") {
											if (opt.debug) {
												log("tab_created: tab will append on top, openerTabId: "+NewTab.openerTabId);
											}
											AppendTab(NewTab, document.getElementById(NewTab.openerTabId).parentNode.parentNode.id, false, false, (NewTab.pinned ? true : false), false, true, false, false, true, false);
										}
										if (opt.append_child_tab_after_limit == "bottom") {
											if (opt.debug) {
												log("tab_created: tab will append on bottom, openerTabId: "+NewTab.openerTabId);
											}
											AppendTab(NewTab, document.getElementById(NewTab.openerTabId).parentNode.parentNode.id, false, false, true, false, true, false, false, true, false);
										}
									}
								}
								if (opt.max_tree_depth == 0) { // place tabs flat
									if (opt.debug) {
										log("tab_created: max_tree_depth is 0, tabs are placed on the same level");
									}
									if (opt.append_child_tab_after_limit == "after") {
										if (opt.debug) {
											log("tab_created: tab will append after active");
										}
										AppendTab(NewTab, false, false, NewTab.openerTabId, false, false, true, false, false, true, false);
									}
									if (opt.append_child_tab_after_limit == "top") {
										if (opt.debug) {
											log("tab_created: tab will append on top");
										}
										AppendTab(NewTab, false, false, false, false, false, true, false, false, true, false);
									}
									if (opt.append_child_tab_after_limit == "bottom") {
										if (opt.debug) {
											log("tab_created: tab will append on bottom");
										}
										AppendTab(NewTab, false, false, false, true, false, true, false, false, true, false);
									}
								}
							} else { // orphan case

								// if set to append orphan tabs to ungrouped group
								// if tab is still not present, basically, not opened by OpenNewTab(), it will switch to ungrouped group
								// if (opt.orphaned_tabs_to_ungrouped === true && document.getElementById(message.tabId) == null && !NewTab.pinned) {
								if (opt.orphaned_tabs_to_ungrouped === true && !NewTab.pinned) {
									if (opt.debug) {
										log("tab_created: orphan case, orphaned tab goes to ungrouped");
									}
									if (active_group != "tab_list") {
										SetActiveGroup("tab_list", false, false);
									}
								}

								if (opt.append_orphan_tab == "after_active") {
									if (opt.debug) {
										log("tab_created: orphan case, appending tab after active");
									}
									AppendTab(NewTab, false, false, (document.querySelector("#"+active_group+" .active_tab") != null ? document.querySelector("#"+active_group+" .active_tab").id : undefined), (NewTab.pinned ? true : false), false, true, false, false, true, false);
								}
								if (opt.append_orphan_tab == "top") {
									if (opt.debug) {
										log("tab_created: orphan case, appending tab on top");
									}
									AppendTab(NewTab, false, false, false, false, false, true, false, false, true, false);
								}
								if (opt.append_orphan_tab == "bottom" || opt.append_orphan_tab == "as_child") {
									if (opt.debug) {
										log("tab_created: orphan case, appending tab on bottom");
									}
									AppendTab(NewTab, false, false, false, true, false, true, false, false, true, false);
								}
							}
						}
						if (opt.move_tabs_on_url_change === "all_new") {
							AppendTabToGroupOnRegexMatch(message.tabId, NewTab.url);
						}

						if (NewTab.openerTabId) { // check if openerTabId is defined, if it's in DOM and if it's closed, then change it to open
							let openerTab = document.querySelector(".c[id='"+NewTab.openerTabId+"']");
							if (openerTab != null) {
								openerTab.classList.remove("c");
								openerTab.classList.add("o");
							}
						}
						if (opt.syncro_tabbar_tabs_order) {
							let tabIds = Array.prototype.map.call(document.querySelectorAll(".pin, .tab"), function(s){
								return parseInt(s.id);
							});
							chrome.tabs.move(message.tabId, {index: tabIds.indexOf(message.tabId)});
						}

						RefreshExpandStates();
						setTimeout(function() {
							schedule_update_data++;
						}, 500);
						setTimeout(function() {
							RefreshCounters();
							RefreshGUI();
						},50);
					}
				});
				return;
			}
			if (message.command == "tab_attached") {
				if (opt.debug) {
					log("chrome event: "+message.command+", tabId: "+message.tabId+", tab is pinned: "+message.tab.pinned+", ParentId: "+message.ParentId);
				}
				AppendTab(message.tab, message.ParentId, false, false, true, false, true, false, false, true, false);
				RefreshGUI();
				return;
			}
			if (message.command == "tab_detached") {
				if (opt.debug) {
					log("chrome event: "+message.command+ ", tabId: " + message.tabId);
				}
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
				if (opt.debug) {
					log("chrome event: "+message.command+ ", tabId: " + message.tabId);
				}

				if (EmptyTabs.indexOf(message.tabId) != -1) {
					EmptyTabs.splice(EmptyTabs.indexOf(message.tabId), 1);
				}

				let mTab = document.getElementById(message.tabId);
				if (mTab != null) {
					let ctParent = mTab.childNodes[1];
					if (opt.debug) {
						log("tab_removed, promote children: " +opt.promote_children);
					}
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
				if (opt.debug) {
					log("chrome event: "+message.command+ ", tabId: " + message.tabId);
				}
				SetActiveTab(message.tabId, true);
				return;
			}
			if (message.command == "tab_attention") {
				if (opt.debug) {
					log("chrome event: "+message.command+ ", tabId: " + message.tabId);
				}
				SetAttentionIcon(message.tabId);
				return;
			}
			if (message.command == "tab_updated") {
				if (opt.debug) {
					log("chrome event: "+message.command+ ", tabId: " + message.tabId+ ", changeInfo: "+JSON.stringify(message.changeInfo));
					// log(message.changeInfo);
				}
				
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
				
				
				// if set to append when url changes and matches pre-set group
				if (message.changeInfo.url != undefined && message.changeInfo.url != newTabUrl) {
					// if (((opt.move_tabs_on_url_change == "from_empty" || opt.move_tabs_on_url_change == "from_empty_b") && EmptyTabs.indexOf(message.tabId) != -1) || opt.move_tabs_on_url_change == "always") {
					if (EmptyTabs.indexOf(message.tabId) != -1 || opt.move_tabs_on_url_change == "always") {
						AppendTabToGroupOnRegexMatch(message.tabId, message.changeInfo.url);
					}
					if (EmptyTabs.indexOf(message.tabId) != -1) {
						EmptyTabs.splice(EmptyTabs.indexOf(message.tabId), 1);
					}
				}
				
				return;
			}
			if (message.command == "remote_update") {
				if (opt.debug) {
					log("chrome event: "+message.command+ ", tabId: " + message.tabId);
					log(message);
				}
				RearrangeTreeStructure(message.groups, message.folders, message.tabs);
				sendResponse(true);
				return;
			}
		}
		
	});
}