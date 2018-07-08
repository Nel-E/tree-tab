// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function StartBackgroundListeners() {
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		if (message.command == "reload") {
			window.location.reload();
			return;
		}
		if (message.command == "reload_options") {
			opt = Object.assign({}, message.opt);
			return;
		}
		if (message.command == "get_windows") {
			sendResponse(b.windows);
			return;
		}
		if (message.command == "get_folders") {
			if (b.windows[message.windowId]) {
				sendResponse(b.windows[message.windowId].folders);
			}
			return;
		}
		if (message.command == "save_folders") {
			if (b.windows[message.windowId]) {
				b.windows[message.windowId].folders = Object.assign({}, message.folders);
				b.schedule_save++;
			}
			return;
		}
		if (message.command == "get_groups") {
			if (b.windows[message.windowId]) {
				sendResponse(b.windows[message.windowId].groups);
			}
			return;
		}
		if (message.command == "save_groups" && browserId == "F") {
			if (b.windows[message.windowId]) {
				b.windows[message.windowId].groups = Object.assign({}, message.groups);
				for (let group in b.windows[message.windowId].groups) {
					if (b.tabs[b.windows[message.windowId].groups[group].active_tab]) {
						b.windows[message.windowId].groups[group].active_tab_ttid = b.tabs[b.windows[message.windowId].groups[group].active_tab].ttid;
					}
					if (b.tabs[b.windows[message.windowId].groups[group].prev_active_tab]) {
						b.windows[message.windowId].groups[group].prev_active_tab_ttid = b.tabs[b.windows[message.windowId].groups[group].prev_active_tab].ttid;
					}
				}
				b.schedule_save++;
			}
			return;
		}
		if (message.command == "save_groups" && browserId != "F") {
			if (b.windows[message.windowId]) {
				b.windows[message.windowId].groups = Object.assign({}, message.groups);
				b.schedule_save++;
			}
			return;
		}
		if (message.command == "set_active_group") {
			if (b.windows[message.windowId]) {
				b.windows[message.windowId].active_group = message.active_group;
				b.schedule_save++;
			}
			return;
		}
		if (message.command == "get_active_group") {
			if (b.windows[message.windowId]) {
				sendResponse(b.windows[message.windowId].active_group);
			}
			return;
		}
		if (message.command == "set_search_filter") {
			if (b.windows[message.windowId]) {
				b.windows[message.windowId].search_filter = message.search_filter;
				b.schedule_save++;
			}
			return;
		}
		if (message.command == "get_search_filter") {
			if (b.windows[message.windowId]) {
				sendResponse(b.windows[message.windowId].search_filter);
			}
			return;
		}
		if (message.command == "set_active_shelf") {
			if (b.windows[message.windowId]) {
				b.windows[message.windowId].active_shelf = message.active_shelf;
				b.schedule_save++;
			}
			return;
		}
		if (message.command == "get_active_shelf") {
			if (b.windows[message.windowId]) {
				sendResponse(b.windows[message.windowId].active_shelf);
			}
			return;
		}
		if (message.command == "set_group_bar") {
			if (b.windows[message.windowId]) {
				b.windows[message.windowId].group_bar = message.group_bar;
				b.schedule_save++;
			}
			return;
		}
		if (message.command == "get_group_bar") {
			if (b.windows[message.windowId]) {
				sendResponse(b.windows[message.windowId].group_bar);
			}
			return;
		}
		if (message.command == "get_browser_tabs") {
			sendResponse(b.tabs);
			return;
		}
		if (message.command == "is_bg_ready") {
			sendResponse(b.running);
			return;
		}
		if (message.command == "update_tab" && browserId == "F") {
			if (b.tabs[message.tabId]) {
				if (message.tab.index) {
					b.tabs[message.tabId].index = message.tab.index;
				}
				if (message.tab.expand) {
					b.tabs[message.tabId].expand = message.tab.expand;
				}
				if (message.tab.parent) {
					b.tabs[message.tabId].parent = message.tab.parent;
					if (b.tabs[message.tab.parent]) {
						b.tabs[message.tabId].parent_ttid = b.tabs[message.tab.parent].ttid;
					} else {
						b.tabs[message.tabId].parent_ttid = "";
					}
				}
				b.schedule_save++;
			} else {
				b.tabs[tabId] = {ttid: "", parent: message.tab.parent, parent_ttid: "", index: message.tab.index, expand: message.tab.expand};
				b.schedule_save++;
			}
			return;
		}
		if (message.command == "update_tab" && browserId != "F") {
			if (b.tabs[message.tabId]) {
				if (message.tab.index) {
					b.tabs[message.tabId].index = message.tab.index;
				}
				if (message.tab.expand) {
					b.tabs[message.tabId].expand = message.tab.expand;
				}
				if (message.tab.parent) {
					b.tabs[message.tabId].parent = message.tab.parent;
				}
				b.schedule_save++;
			} else {
				b.tabs[tabId] = {hash: 0, parent: message.tab.parent, index: message.tab.index, expand: message.tab.expand};
				b.schedule_save++;
			}
			return;
		}
		if (message.command == "update_all_tabs" && browserId == "F") {
			for (let i = 0; i < message.pins.length; i++) {
				if (b.tabs[message.pins[i].id]) {
					b.tabs[message.pins[i].id].parent = "pin_list";
					b.tabs[message.pins[i].id].parent_ttid = "";
					b.tabs[message.pins[i].id].expand = "";
					b.tabs[message.pins[i].id].index = message.pins[i].index;
				}
			}
			for (let j = 0; j < message.tabs.length; j++) {
				if (b.tabs[message.tabs[j].id]) {
					b.tabs[message.tabs[j].id].parent = message.tabs[j].parent;
					b.tabs[message.tabs[j].id].expand = message.tabs[j].expand;
					b.tabs[message.tabs[j].id].index = message.tabs[j].index;
					if (b.tabs[message.tabs[j].parent]) {
						b.tabs[message.tabs[j].id].parent_ttid = b.tabs[message.tabs[j].parent].ttid;
					} else {
						b.tabs[message.tabs[j].id].parent_ttid = "";
					}
				}
			}
			b.schedule_save++;
			return;
		}
		if (message.command == "update_all_tabs" && browserId != "F") {
			for (let i = 0; i < message.pins.length; i++) {
				if (b.tabs[message.pins[i].id]) {
					b.tabs[message.pins[i].id].parent = "pin_list";
					b.tabs[message.pins[i].id].expand = "";
					b.tabs[message.pins[i].id].index = message.pins[i].index;
				}
			}
			for (let j = 0; j < message.tabs.length; j++) {
				if (b.tabs[message.tabs[j].id]) {
					b.tabs[message.tabs[j].id].parent = message.tabs[j].parent;
					b.tabs[message.tabs[j].id].expand = message.tabs[j].expand;
					b.tabs[message.tabs[j].id].index = message.tabs[j].index;
				}
			}
			b.schedule_save++;
			return;
		}
		if (message.command == "discard_tab") {
			DiscardTab(message.tabId);
			return;
		}
		if (message.command == "discard_window") {
			DiscardWindow(message.windowId);
			return;
		}
		if (message.command == "remove_tab_from_empty_tabs") {
			setTimeout(function() {
				if (b.EmptyTabs.indexOf(message.tabId) != -1) {
					b.EmptyTabs.splice(b.EmptyTabs.indexOf(message.tabId), 1);
				}
			}, 100);
			return;
		}
		if (message.command == "debug") {
			pushlog(message.log);
			return;
		}
	});
}

function QuantumStartListeners() {
	browser.browserAction.onClicked.addListener(function() {
		browser.sidebarAction.setPanel({panel: (browser.extension.getURL("/sidebar.html")) });
		browser.sidebarAction.open();
	});
	chrome.tabs.onCreated.addListener(function(tab) {
		let prevActiveTabId = b.windows[tab.windowId].activeTabId;
		b.NewTabsQueue.push(tab.id);
		let t = Promise.resolve(browser.sessions.getTabValue(tab.id, "TTdata")).then(function(TabData) {
			if (TabData != undefined) {
				b.tabs[tab.id] = Object.assign({}, TabData);
				let originalParent = TabData.parent_ttid == "" ? undefined : (b.tt_ids[TabData.parent_ttid] ? b.tt_ids[TabData.parent_ttid] : TabData.parent_ttid);
				chrome.runtime.sendMessage({command: "tab_created", windowId: tab.windowId, tabId: tab.id, tab: tab, ParentId: originalParent, InsertAfterId: undefined, Append: undefined});
			} else {
				QuantumAppendTabTTId(tab);
				OnMessageTabCreated(tab.id, prevActiveTabId);
			}
		});
	});
	chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
		let oldId = tabId;
		chrome.tabs.get(oldId, function(tab) {
			ReplaceParents(oldId, tab.id);
			chrome.runtime.sendMessage({command: "tab_attached", windowId: attachInfo.newWindowId, tab: tab, tabId: tab.id, ParentId: b.tabs[tab.id].parent});
			b.schedule_save++;
		});
	});
	
	chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
		chrome.runtime.sendMessage({command: "tab_detached", windowId: detachInfo.oldWindowId, tabId: tabId});
	});
	
	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		if (b.EmptyTabs.indexOf(tabId) != -1) {
			b.EmptyTabs.splice(b.EmptyTabs.indexOf(tabId), 1);
		}
		setTimeout(function() {
			chrome.runtime.sendMessage({command: "tab_removed", windowId: removeInfo.windowId, tabId: tabId});
		}, 5);
		// setTimeout(function() {
			// delete b.tabs[tabId];
		// },60000);
		b.schedule_save++;
	});
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (changeInfo.pinned == true) {
			if (b.tabs[tabId]) {
				b.tabs[tabId].parent = "pin_list";
				b.tabs[tabId].parent_ttid = "";
				b.schedule_save++;
			}
		}
		if (changeInfo.pinned == false) {
			if (b.tabs[tabId]) {
				b.tabs[tabId].parent = "tab_list";
				b.tabs[tabId].parent_ttid = "";
				b.schedule_save++;
			}
		}
		if (changeInfo.url != undefined) { // if set to append when url changes and matches pre-set group
			if (opt.move_tabs_on_url_change == "always" || ((opt.move_tabs_on_url_change == "from_empty" || opt.move_tabs_on_url_change == "from_empty_b") && b.EmptyTabs.indexOf(tabId) != -1)) {
				AppendTabToGroupOnRegexMatch(tabId, tab.windowId, changeInfo.url);
			}
			if (changeInfo.url != b.newTabUrl && b.EmptyTabs.indexOf(tabId) != -1) {
				b.EmptyTabs.splice(b.EmptyTabs.indexOf(tabId), 1);
			}
		}		
		if (changeInfo.title != undefined && !tab.active) {
			chrome.runtime.sendMessage({command: "tab_attention", windowId: tab.windowId, tabId: tabId});
		}
		chrome.runtime.sendMessage({command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tabId, changeInfo: changeInfo});
	});

	chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
		chrome.tabs.get(addedTabId, function(tab) {
			if (addedTabId == removedTabId) {
				chrome.runtime.sendMessage({command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tab.id, changeInfo: {status: tab.status, url: tab.url, title: tab.title, audible: tab.audible, mutedInfo: tab.mutedInfo}});
			} else {
				if (b.tabs[removedTabId]) {
					b.tabs[addedTabId] = b.tabs[removedTabId];
				}
				ReplaceParents(tabId, tab.id);
				chrome.runtime.sendMessage({command: "tab_removed", windowId: tab.windowId, tabId: removedTabId});
				chrome.runtime.sendMessage({command: "tab_attached", windowId: tab.windowId, tab: tab, tabId: addedTabId, ParentId: b.tabs[addedTabId].parent});
				// delete ttid[b.tabs[removedTabId].ttid];
				// delete b.tabs[removedTabId];
			}
			setTimeout(function() {
				QuantumAppendTabTTId(tab);
				b.schedule_save++;
			}, 100);
			
		});
	});
	chrome.tabs.onActivated.addListener(function(activeInfo) {
		if (b.windows[activeInfo.windowId]) {
			b.windows[activeInfo.windowId].activeTabId = activeInfo.tabId;
		}
		chrome.runtime.sendMessage({command: "tab_activated", windowId: activeInfo.windowId, tabId: activeInfo.tabId});
		b.schedule_save++;
	});
	chrome.windows.onCreated.addListener(function(window) {
		let win = Promise.resolve(browser.sessions.getWindowValue(window.id, "TTdata")).then(function(WindowData) {
			if (WindowData != undefined) {
				b.windows[window.id] = Object.assign({}, WindowData);
			} else {
				QuantumAppendWinTTId(window.id);
			}
			b.schedule_save++;
		});
	});
	chrome.windows.onRemoved.addListener(function(windowId) {
		// delete b.windows[windowId];
		b.schedule_save++;
	});
	// chrome.sessions.onChanged.addListener(function(session) {
		// chrome.windows.getAll({windowTypes: ['normal'], populate: false}, function(w) {
			// chrome.tabs.query({}, function(t) {
				// for (let wiInd = 0; wiInd < w.length; wiInd++) {
					// if (b.windows[w[wiInd].id] == undefined) {
						// chrome.runtime.sendMessage({command: "reload_sidebar"});
						// window.location.reload();
					// }
				// }
				// for (let tbInd = 0; tbInd < t.length; tbInd++) {
					// if (b.tabs[t[tbInd].id] == undefined) {
						// chrome.runtime.sendMessage({command: "reload_sidebar"});
						// window.location.reload();
					// }
				// }
			// });
		// });
	// });
}


function ChromiumStartListeners() { // start all listeners
	chrome.tabs.onCreated.addListener(function(tab) {
		b.NewTabsQueue.push(tab.id);
		ChromiumHashURL(tab);
		OnMessageTabCreated(tab.id, b.windows[tab.windowId].activeTabId);
	});
	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		if (b.EmptyTabs.indexOf(tabId) != -1) {
			b.EmptyTabs.splice(b.EmptyTabs.indexOf(tabId), 1);
		}
		setTimeout(function() { chrome.runtime.sendMessage({command: "tab_removed", windowId: removeInfo.windowId, tabId: tabId}); },5);
		delete b.tabs[tabId];
		b.schedule_save++;
	});
	chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
		chrome.tabs.get(tabId, function(tab) {
			chrome.runtime.sendMessage({command: "tab_attached", windowId: attachInfo.newWindowId, tab: tab, tabId: tabId, ParentId: b.tabs[tabId].parent});
		});
		b.schedule_save++;
	});
	chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
		chrome.runtime.sendMessage({command: "tab_detached", windowId: detachInfo.oldWindowId, tabId: tabId});
		b.schedule_save++;
	});
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (b.tabs[tabId] == undefined || changeInfo.url != undefined) {
			ChromiumHashURL(tab);
		}
		if (changeInfo.pinned != undefined) {
			if (changeInfo.pinned == true) {
				b.tabs[tabId].parent = "pin_list";
			}
			if (changeInfo.pinned == false) {
				b.tabs[tabId].parent = "tab_list";
			}
			b.schedule_save++;
		}
		if (changeInfo.url != undefined) { // if set to append when url changes and matches pre-set group
			if (opt.move_tabs_on_url_change == "always" || ((opt.move_tabs_on_url_change == "from_empty" || opt.move_tabs_on_url_change == "from_empty_b") && b.EmptyTabs.indexOf(tabId) != -1)) {
				AppendTabToGroupOnRegexMatch(tabId, tab.windowId, changeInfo.url);
			}
			if (changeInfo.url != b.newTabUrl && b.EmptyTabs.indexOf(tabId) != -1) {
				b.EmptyTabs.splice(b.EmptyTabs.indexOf(tabId), 1);
			}
		}		
		if (changeInfo.title != undefined && !tab.active) {
			chrome.runtime.sendMessage({command: "tab_attention", windowId: tab.windowId, tabId: tabId});
		}
		chrome.runtime.sendMessage({command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tabId, changeInfo: changeInfo});
	});
	chrome.tabs.onMoved.addListener(function(tabId, moveInfo) {
		b.schedule_save++;
	});
	chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
		chrome.tabs.get(addedTabId, function(tab) {
			if (addedTabId == removedTabId) {
				chrome.runtime.sendMessage({command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tab.id, changeInfo: {status: tab.status, url: tab.url, title: tab.title, audible: tab.audible, mutedInfo: tab.mutedInfo}});
			} else {
				ReplaceParents(tabId, tab.id);
				if (b.tabs[removedTabId]) {
					b.tabs[addedTabId] = b.tabs[removedTabId];
				} else {
					ChromiumHashURL(tab);
				}
				chrome.runtime.sendMessage({command: "tab_removed", windowId: tab.windowId, tabId: removedTabId});
				chrome.runtime.sendMessage({command: "tab_attached", windowId: tab.windowId, tab: tab, tabId: addedTabId});
				delete b.tabs[removedTabId];
			}
			b.schedule_save++;
		});
	});
	chrome.tabs.onActivated.addListener(function(activeInfo) {
		if (b.windows[activeInfo.windowId]) {
			b.windows[activeInfo.windowId].activeTabId = activeInfo.tabId;
		}
		chrome.runtime.sendMessage({command: "tab_activated", windowId: activeInfo.windowId, tabId: activeInfo.tabId});
		b.schedule_save++;
	});
	chrome.windows.onCreated.addListener(function(window) {
		ChromiumAddWindowData(window.id);
		// b.windows[window.id] = {group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, active_tab: 0, prev_active_tab: 0, name: labels.ungrouped_group, font: ""}}, folders: {}};
		b.schedule_save++;
	});
	chrome.windows.onRemoved.addListener(function(windowId) {
		delete b.windows[windowId];
		b.schedule_save++;
	});
	chrome.runtime.onSuspend.addListener(function() {
		b.running = false;
	});
}	




function OnMessageTabCreated(tabId, activeTabId) {
	if (b.NewTabsQueue.length > 0 && b.NewTabsQueue[0] == tabId) {
		chrome.tabs.get(tabId, function(NewTab) { // get tab again as reported tab's url is empty! Also for some reason firefox sends tab with "active == false" even if tab is active (THIS IS POSSIBLY A NEW BUG IN FF 60!)

			let ParentId;
			let AfterId;
			let append;
			
			if (b.windows[NewTab.windowId] && NewTab.active) {
				b.windows[NewTab.windowId].groups[b.windows[NewTab.windowId].active_group].active_tab = NewTab.id;
			}

			if (NewTab.url == b.newTabUrl) {
				b.EmptyTabs.push(tabId);
			}

			if (NewTab.pinned) {
				let PinTabs = GetChildren("pin_list");
				b.tabs[NewTab.id].parent = "pin_list";
				if (browserId == "F") {
					b.tabs[NewTab.id].parent_ttid = "";
				}
				for (let i = PinTabs.indexOf(NewTab.openerTabId)+1; i < PinTabs.length; i++) { // shift next siblings indexes
					b.tabs[PinTabs[i]].index += 1;
				}
				b.tabs[NewTab.id].index = NewTab.index;
		
			} else {
				
				if (opt.append_orphan_tab == "as_child" && opt.orphaned_tabs_to_ungrouped == false) {
					NewTab.openerTabId = activeTabId;
				}					
				
				if (NewTab.openerTabId) { // child case
				
					let OpenerSiblings = GetChildren(b.tabs[NewTab.openerTabId].parent);

					if (opt.append_child_tab == "after") { // place tabs flat
						b.tabs[NewTab.id].parent = b.tabs[NewTab.openerTabId].parent;
						if (browserId == "F") {
							b.tabs[NewTab.id].parent_ttid = b.tabs[NewTab.openerTabId].parent_ttid;
						}
						for (let i = OpenerSiblings.indexOf(NewTab.openerTabId)+1; i < OpenerSiblings.length; i++) { // shift next siblings indexes
							b.tabs[OpenerSiblings[i]].index += 1;
						}
						b.tabs[NewTab.id].index = b.tabs[NewTab.openerTabId].index+1;
						AfterId = NewTab.openerTabId;
						
					} else {
						
						if (opt.max_tree_depth == 0) { // place tabs flat if limit is set to 0

							b.tabs[NewTab.id].parent = b.tabs[NewTab.openerTabId].parent;
							if (browserId == "F"){
								b.tabs[NewTab.id].parent_ttid = b.tabs[NewTab.openerTabId].parent_ttid;
							}

							if (opt.append_child_tab_after_limit == "after") { // max tree depth, place tab after parent
								for (let i = OpenerSiblings.indexOf(NewTab.openerTabId)+1; i < OpenerSiblings.length; i++) { // shift next siblings indexes
									b.tabs[OpenerSiblings[i]].index += 1;
								}
								b.tabs[NewTab.id].index = b.tabs[NewTab.openerTabId].index+1;
								AfterId = NewTab.openerTabId;
							}
							
							if (opt.append_child_tab_after_limit == "top" && opt.append_child_tab != "after") { // max tree depth, place tab on top (above parent)
								for (let i = 0; i < OpenerSiblings.length; i++) { // shift all siblings indexes
									b.tabs[OpenerSiblings[i]].index += 1;
								}
								b.tabs[NewTab.id].index = 0;
								ParentId = b.tabs[NewTab.id].parent;
							}
							
							if (opt.append_child_tab_after_limit == "bottom" && opt.append_child_tab != "after") { // max tree depth, place tab on bottom (below parent)
								if (OpenerSiblings.length > 0) {
									b.tabs[NewTab.id].index = b.tabs[OpenerSiblings[OpenerSiblings.length-1]].index+1;
								} else {
									b.tabs[NewTab.id].index = 1;
								}
								ParentId = b.tabs[NewTab.id].parent;
								append = true;
							}
							
						} else {

							let Parents = GetTabParents(NewTab.openerTabId);
							let OpenerChildren = GetChildren(NewTab.openerTabId);
						
							if (opt.max_tree_depth < 0 || (opt.max_tree_depth > 0 && Parents.length < opt.max_tree_depth)) { // append to tree on top and bottom

								b.tabs[NewTab.id].parent = NewTab.openerTabId;
								if (browserId == "F"){
									b.tabs[NewTab.id].parent_ttid = b.tabs[NewTab.openerTabId].ttid;
								}
								
								if (opt.append_child_tab == "top") { // place child tab at the top (reverse hierarchy)
									for (let i = 0; i < OpenerChildren.length; i++) { // shift all siblings indexes
										b.tabs[OpenerChildren[i]].index += 1;
									}
									b.tabs[NewTab.id].index = 0;
									ParentId = b.tabs[NewTab.id].parent;
								}

								if (opt.append_child_tab == "bottom") { // place child tab at the bottom
									if (OpenerChildren.length > 0) {
										b.tabs[NewTab.id].index = b.tabs[OpenerChildren[OpenerChildren.length-1]].index+1;
									} else {
										b.tabs[NewTab.id].index = 0;
									}
									ParentId = b.tabs[NewTab.id].parent;
									append = true;
								}

							} else {

								if (opt.max_tree_depth > 0 && Parents.length >= opt.max_tree_depth) { // if reached depth limit of the tree
									
									b.tabs[NewTab.id].parent = b.tabs[NewTab.openerTabId].parent;
									if (browserId == "F"){
										b.tabs[NewTab.id].parent_ttid = b.tabs[NewTab.openerTabId].parent_ttid;
									}

									if (opt.append_child_tab_after_limit == "after") {  // tab will append after opener
										for (let i = OpenerSiblings.indexOf(NewTab.openerTabId)+1; i < OpenerSiblings.length; i++) { // shift next siblings indexes
											b.tabs[OpenerSiblings[i]].index += 1;
										}
										b.tabs[NewTab.id].index = b.tabs[NewTab.openerTabId].index+1;
										AfterId = NewTab.openerTabId;
									}

									if (opt.append_child_tab_after_limit == "top") { // tab will append on top
										for (let i = 0; i < OpenerChildren.length; i++) { // shift all siblings indexes
											b.tabs[OpenerChildren[i]].index += 1;
										}
										b.tabs[NewTab.id].index = 0;
										ParentId = b.tabs[NewTab.id].parent;
									}

									if (opt.append_child_tab_after_limit == "bottom") { // tab will append on bottom
										if (OpenerSiblings.length > 0) {
											b.tabs[NewTab.id].index = b.tabs[OpenerSiblings[OpenerSiblings.length-1]].index+1;
										} else {
											b.tabs[NewTab.id].index = 1;
										}
										ParentId = b.tabs[NewTab.id].parent;
										append = true;
									}
									
								}
							}
						}									
					}

				} else { // orphan tab
					
					if (opt.orphaned_tabs_to_ungrouped == true) { // if set to append orphan tabs to ungrouped group
						let TabListTabs = GetChildren("tab_list");
						b.tabs[NewTab.id].index = b.tabs[TabListTabs[TabListTabs.length-1]].index+1;
						ParentId = "tab_list";
						append = true;
					} else {
						
						if (opt.append_orphan_tab == "after_active") {
							
							if (b.windows[NewTab.windowId] && b.windows[NewTab.windowId].activeTabId) {
								if (b.tabs[activeTabId]) {
									
									let ActiveSiblings = GetChildren(b.tabs[activeTabId].parent);
									b.tabs[NewTab.id].parent = b.tabs[activeTabId].parent;
									for (let i = ActiveSiblings.indexOf(activeTabId)+1; i < ActiveSiblings.length; i++) { // shift next siblings indexes
										b.tabs[ActiveSiblings[i]].index += 1;
									}
									b.tabs[NewTab.id].index = b.tabs[activeTabId].index+1;
									if (browserId == "F"){
										b.tabs[NewTab.id].parent_ttid = b.tabs[activeTabId].parent_ttid;
									}
									
									AfterId = activeTabId;	
									
								} else { // FAIL, no active tab!
									let GroupTabs = GetChildren(b.windows[NewTab.windowId].active_group);
									b.tabs[NewTab.id].parent = b.windows[NewTab.windowId].active_group;
									if (browserId == "F"){
										b.tabs[NewTab.id].parent_ttid = "";
									}
									if (GroupTabs.length > 0) {
										b.tabs[NewTab.id].index = b.tabs[GroupTabs[GroupTabs.length-1]].index+1;
									} else {
										b.tabs[NewTab.id].index = 0;
									}
									ParentId = b.windows[NewTab.windowId].active_group;
								}
							} else {
								b.tabs[NewTab.id].parent = "tab_list";
								if (browserId == "F"){
									b.tabs[NewTab.id].parent_ttid = "";
								}
								b.tabs[NewTab.id].index = NewTab.index;
								ParentId = "tab_list";
							}
						}

						if (opt.append_orphan_tab == "top") {
							let GroupTabs = GetChildren(b.windows[NewTab.windowId].active_group);
							b.tabs[NewTab.id].parent = b.windows[NewTab.windowId].active_group;
							if (browserId == "F"){
								b.tabs[NewTab.id].parent_ttid = "";
							}
							for (let i = 0; i < GroupTabs.length; i++) { // shift all tabs indexes in group
								b.tabs[GroupTabs[i]].index += 1;
							}
							b.tabs[NewTab.id].index = 0;
							ParentId = b.windows[NewTab.windowId].active_group;
						}

						if (opt.append_orphan_tab == "bottom") {
							let GroupTabs = GetChildren(b.windows[NewTab.windowId].active_group);
							b.tabs[NewTab.id].parent = b.windows[NewTab.windowId].active_group;
							if (browserId == "F"){
								b.tabs[NewTab.id].parent_ttid = "";
							}
							if (GroupTabs.length > 0) {
								b.tabs[NewTab.id].index = b.tabs[GroupTabs[GroupTabs.length-1]].index+1;
							} else {
								b.tabs[NewTab.id].index = 0;
							}
							ParentId = b.windows[NewTab.windowId].active_group;
							append = true;
						}
					}
				}
				
				if (opt.move_tabs_on_url_change === "all_new") {
					setTimeout(function() {
						chrome.tabs.get(NewTab.id, function(CheckTabsUrl) {
							AppendTabToGroupOnRegexMatch(CheckTabsUrl.id, CheckTabsUrl.windowId, CheckTabsUrl.url);
						});
					}, 100);
				}
			}
			setTimeout(function() {
				b.schedule_save++;
			}, 500);

			chrome.runtime.sendMessage({command: "tab_created", windowId: NewTab.windowId, tabId: NewTab.id, tab: NewTab, ParentId: ParentId, InsertAfterId: AfterId, Append: append});

			if (b.NewTabsQueue.indexOf(NewTab.id) != -1) {
				b.NewTabsQueue.splice(b.NewTabsQueue.indexOf(NewTab.id), 1);
			}
			
		});

	} else {
		console.log("tab_created in queue");
		setTimeout(function() {
			OnMessageTabCreated(tabId, activeTabId);
		}, 100);
		
	}
}