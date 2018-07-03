// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function StartSidebarListeners() {
	if (browserId == "F") {
		browser.browserAction.onClicked.addListener(function(tab) {
			if (tab.windowId == tt.CurrentWindowId) {
				browser.sidebarAction.close();
			}
		});
	}
	
	chrome.commands.onCommand.addListener(function(command) {
		chrome.windows.getCurrent({populate: false}, function(window) {
			if (window.id == tt.CurrentWindowId && window.focused) {
				chrome.tabs.query({windowId: tt.CurrentWindowId, active: true}, function(tabs) {
					let tabsArr = [];
					document.querySelectorAll("[id='"+tabs[0].id+"'] .tab, [id='"+tabs[0].id+"']").forEach(function(s){
						tabsArr.push(parseInt(s.id));
						if (s.childNodes[1].childNodes.length > 0) {
							document.querySelectorAll("#"+s.childNodes[1].id+" .tab").forEach(function(t){
								tabsArr.push(parseInt(t.id));
							});
						}
					});
					CloseTabs(tabsArr);
				});
			}
		});
	});

	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		if (message.command == "backup_available") {
			if (opt.debug) {
				log("message to sidebar "+tt.CurrentWindowId+": message: "+message.command);
			}
			let BAKbutton = document.getElementById("button_load_bak"+message.bak);
			if (BAKbutton != null) {
				BAKbutton.classList.remove("disabled");
			}
			return;
		}
		if (message.command == "drag_drop") {
			if (opt.debug) {
				log("message to sidebar "+tt.CurrentWindowId+": message: "+message.command);
			}
			CleanUpDragClasses();
			tt.DragNodeClass = message.DragNodeClass;
			tt.DragTreeDepth = message.DragTreeDepth;
			return;
		}
		if (message.command == "dragend") {
			if (opt.debug) {
				log("message to sidebar "+tt.CurrentWindowId+": message: "+message.command);
			}
			CleanUpDragClasses();
			EmptyDragAndDrop();
			return;
		}
		if (message.command == "remove_folder") {
			if (opt.debug) {
				log("message to sidebar "+tt.CurrentWindowId+": message: "+message.command+" folderId: "+message.folderId);
			}
			RemoveFolder(message.folderId);
			return;
		}
		if (message.command == "remove_group") {
			if (opt.debug) {
				log("message to sidebar "+tt.CurrentWindowId+": message: "+message.command+" groupId: "+message.groupId);
			}
			setTimeout(function() {
				GroupRemove(message.groupId, false);
			}, 2000);
			return;
		}
		if (message.command == "reload_sidebar") {
			if (opt.debug) {
				log("message to sidebar "+tt.CurrentWindowId+": message: "+message.command);
			}
			window.location.reload();
			return;
		}
		if (message.command == "reload_options") {
			if (opt.debug) {
				log("message to sidebar "+tt.CurrentWindowId+": message: "+message.command);
			}
			opt = Object.assign({}, message.opt);
			setTimeout(function() {
				RestorePinListRowSettings();
			}, 100);
			return;
		}
		if (message.command == "reload_toolbar") {
			if (opt.debug) {
				log("message to sidebar "+tt.CurrentWindowId+": message: "+message.command);
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
			return;
		}
		if (message.command == "reload_theme") {
			if (opt.debug) {
				log("message to sidebar "+tt.CurrentWindowId+": message: "+message.command);
			}
			RestorePinListRowSettings();
			ApplyTheme(message.theme);
			return;
		}
		if (message.windowId == tt.CurrentWindowId) {
			
			if (message.command == "append_group") {
				if (tt.groups[message.groupId] == undefined) {
					tt.groups[message.groupId] = {id: message.groupId, index: Object.keys(tt.groups).length, active_tab: 0, prev_active_tab: 0, active_tab_ttid: "", name: message.group_name, font: message.font_color};
					AppendGroupToList(message.groupId, message.group_name, message.font_color, true);
				}
				return;
			}
		
			if (message.command == "append_tab_to_group") {
				let Group = document.getElementById("ct"+message.groupId);
				let Tab = document.getElementById(message.tabId);
				if (Group && Tab) {
					Group.appendChild(Tab);
					SetActiveGroup(message.groupId, false, true);
				}
				return;
			}	
		
			if (message.command == "tab_created") {
				AppendTab({tab: message.tab, ParentId: message.ParentId, InsertAfterId: message.InsertAfterId, Append: message.Append, Scroll: true});
				
				RefreshExpandStates();
				setTimeout(function() {
					RefreshCounters();
					RefreshGUI();
				},50);
				
				if (opt.syncro_tabbar_tabs_order) {
					let tabIds = Array.prototype.map.call(document.querySelectorAll(".pin, .tab"), function(s){
						return parseInt(s.id);
					});
					chrome.tabs.move(message.tab.id, {index: tabIds.indexOf(message.tab.id)});
				}
				
				setTimeout(function() {
					tt.schedule_update_data++;
				}, 1000);
				
				return;
			}				
			if (message.command == "tab_attached") {
				if (opt.debug) {
					log("chrome event: "+message.command+", tabId: "+message.tabId+", tab is pinned: "+message.tab.pinned+", ParentId: "+message.ParentId);
				}

				AppendTab({tab: message.tab, ParentId: message.ParentId, Append: true, SkipSetActive: true, SkipMediaIcon: true});
				RefreshGUI();
				return;
			}
			if (message.command == "tab_detached") {
				if (opt.debug) {
					log("chrome event: "+message.command+ ", tabId: " + message.tabId);
				}
				let Tab = document.getElementById(message.tabId);
				if (Tab != null) {
					let ctDetachedParent = Tab.childNodes[1];
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
					tt.schedule_update_data++;
				}, 300);
				RefreshGUI();
				return;
			}
			if (message.command == "tab_removed") {
				if (opt.debug) {
					log("chrome event: "+message.command+ ", tabId: " + message.tabId);
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
						tt.schedule_update_data++;
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
					log("chrome event: "+message.command+ ", tabId: " + message.tabId);
					// + ", changeInfo: "+JSON.stringify(message.changeInfo));
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
					// RefreshMediaIcon(message.tabId);
				}
				if (message.changeInfo.pinned != undefined) {
					let updateTab = document.getElementById(message.tabId);
					if (updateTab != null) {
						if (message.tab.pinned && updateTab.classList.contains("pin") == false) {
							SetTabClass(message.tabId, true);
							tt.schedule_update_data++;
						}
						if (!message.tab.pinned && updateTab.classList.contains("tab") == false) {
							SetTabClass(message.tabId, false);
							tt.schedule_update_data++;
						}
					}
					RefreshExpandStates();
				}
				return;
			}
			// if (message.command == "set_active_group") {
				// SetActiveGroup(message.groupId, false, false);
				// return;
			// }
			if (message.command == "remote_update") {
				if (opt.debug) {
					log("chrome event: "+message.command+ ", tabId: " + message.tabId);
					log(message);
				}
				RcreateTreeStructure(message.groups, message.folders, message.tabs);
				sendResponse(true);
				tt.schedule_update_data++;
				return;
			}
		}
	});
}