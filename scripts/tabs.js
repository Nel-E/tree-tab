// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********       TABS FUNCTIONS          ***************

async function UpdateData() {
	setInterval(function() {
		if (schedule_update_data > 1) {
			schedule_update_data = 1;
		}
		if (schedule_update_data > 0) {
			if (opt.debug) console.log("function: update tabs");
			let pins_data = [];
			document.querySelectorAll(".pin").forEach(function(pin){
				pins_data.push({id: pin.id, index: Array.from(pin.parentNode.children).indexOf(pin)});
			});
			let tabs_data = [];
			document.querySelectorAll(".tab").forEach(function(tab){
				tabs_data.push({id: tab.id, parent: tab.parentNode.parentNode.id, index: Array.from(tab.parentNode.children).indexOf(tab), expand: (tab.classList.contains("c") ? "c" : (tab.classList.contains("o") ? "o" : ""))});
			});
			chrome.runtime.sendMessage({command: "update_all_tabs", pins: pins_data, tabs: tabs_data});
			schedule_update_data--;
		}
	}, 1000);
}

function RearrangeBrowserTabs() {
	setInterval(function() {
		if (schedule_rearrange_tabs > 0) {
			schedule_rearrange_tabs--;
			let tabIds = Array.prototype.map.call(document.querySelectorAll(".pin, .tab"), function(s){
				return parseInt(s.id);
			});
			RearrangeBrowserTabsLoop(tabIds, tabIds.length-1);
		}
	}, 1000);
}

async function RearrangeBrowserTabsLoop(tabIds, tabIndex) {
	if (tabIndex >= 0 && schedule_rearrange_tabs == 0){
		chrome.tabs.get(tabIds[tabIndex], function(tab) {
			if (tab && tabIndex != tab.index) {
				chrome.tabs.move(tabIds[tabIndex], {index: tabIndex});
			}
			RearrangeBrowserTabsLoop( tabIds, (tabIndex-1) );
		});
	}
}

function RearrangeTreeTabs(tabs, bgtabs, first_loop) {
	tabs.forEach(function(Tab) {
		let t = document.getElementById(Tab.id);
		if (bgtabs[Tab.id] && t != null && t.parentNode.childNodes[bgtabs[Tab.id].index]) {
			let tInd = Array.from(t.parentNode.children).indexOf(t);
			if (tInd > bgtabs[Tab.id].index) {
				t.parentNode.childNodes[bgtabs[Tab.id].index].parentNode.insertBefore(t, t.parentNode.childNodes[bgtabs[Tab.id].index]);
			} else {
				if (t.parentNode.childNodes[bgtabs[Tab.id].index].nextSibling != null) {
					t.parentNode.childNodes[bgtabs[Tab.id].index].parentNode.insertBefore(t, t.parentNode.childNodes[bgtabs[Tab.id].index].nextSibling);
				} else {
					t.parentNode.childNodes[bgtabs[Tab.id].index].parentNode.appendChild(t);
				}				
			}
			let newtInd = Array.from(t.parentNode.children).indexOf(t);
			if (bgtabs[Tab.id] && newtInd != bgtabs[Tab.id].index && first_loop) {
				RearrangeTreeTabs(tabs, bgtabs, false);
			}
		}
	});
}

function AppendTab(tab, ParentId, InsertBeforeId, InsertAfterId, Append, Index, SetEvents, AdditionalClass, SkipSetActive, Scroll, addCounter) {
	if (document.getElementById(tab.id) != null) {
		GetFaviconAndTitle(tab.id, addCounter);
		return;
	}	
	var ClassList = tab.pinned ? "pin" : "tab";
	if (tab.discarded) {
		ClassList = ClassList + " discarded";
	}
	if (AdditionalClass != false) {
		ClassList = ClassList +" "+ AdditionalClass;
	}
	var tb = document.createElement("div"); tb.className =  ClassList; tb.id = tab.id; // TAB
	var dc = document.createElement("div"); dc.className = "drop_target drag_enter_center"; dc.id = "dc"+tab.id; tb.appendChild(dc); // DROP TARGET CENTER
	var du = document.createElement("div"); du.className = "drop_target drag_entered_top"; du.id = "du"+tab.id; tb.appendChild(du); // DROP TARGET TOP
	var dd = document.createElement("div"); dd.className = "drop_target drag_entered_bottom"; dd.id = "dd"+tab.id; tb.appendChild(dd); // DROP TARGET BOTTOM
	var th = document.createElement("div"); th.className = (opt.always_show_close && !opt.never_show_close) ? "tab_header close_show" : "tab_header"; th.id = "tab_header"+tab.id; if (SetEvents) {th.draggable = true;} tb.appendChild(th); // HEADER
	var ex = document.createElement("div"); ex.className = "expand"; ex.id = "exp"+tab.id; th.appendChild(ex); // EXPAND ARROW
	var tt = document.createElement("div"); tt.className = "tab_title"; tt.id = "tab_title"+tab.id; th.appendChild(tt); // TITLE
	if (!opt.never_show_close) {
		var cl = document.createElement("div"); cl.className = "close"; cl.id = "close"+tab.id; th.appendChild(cl); // CLOSE BUTTON
		var ci = document.createElement("div"); ci.className = "close_img"; ci.id = "close_img"+tab.id; cl.appendChild(ci);
	}
	var mi = document.createElement("div"); mi.className = "tab_mediaicon"; mi.id = "tab_mediaicon"+tab.id; th.appendChild(mi);
	var ct = document.createElement("div"); ct.className = "children_tabs"; ct.id = "ct"+tab.id; tb.appendChild(ct);
	
	if (SetEvents) {
		ct.onmousedown = function(event) {
			if (event.target == this) {
				if (event.which == 1) {
					DeselectFolders();
					DeselectTabs();
				}
				if (event.which == 2 && event.target == this) {
					event.stopImmediatePropagation();
					ActionClickGroup(this.parentNode, opt.midclick_group);
				}
				if (event.which == 3) {
					ShowFGlobalMenu(event);
				}
			}
		}
		ct.ondblclick = function(event) {
			if (event.target == this) {
				ActionClickGroup(this.parentNode, opt.dbclick_group);
			}
		}
		ex.onmousedown = function(event) {
			if (document.getElementById("main_menu").style.top != "-1000px") {
				HideMenus();
			}
			if (event.which == 1 && !event.shiftKey && !event.ctrlKey) {
				EventExpandBox(this.parentNode.parentNode);
			}
		}
		ex.onmouseenter = function(event) {
			this.classList.add("hover");
		}
		ex.onmouseleave = function(event) {
			this.classList.remove("hover");
		}
		
		if (!opt.never_show_close) {
			cl.onmousedown = function(event) {
				event.stopImmediatePropagation();
				if (event.which != 3) {
					CloseTabs([parseInt(this.parentNode.parentNode.id)]);
				}
			}
			cl.onmouseenter = function(event) {
				this.classList.add("close_hover");
			}
			cl.onmouseleave = function(event) {
				this.classList.remove("close_hover");
			}
		}
		tb.ondragenter = function(event) {
			this.childNodes[1].style.zIndex = 99999;
		}


		th.onclick = function(event) {
			event.stopImmediatePropagation();
			if (document.getElementById("main_menu").style.top != "-1000px") {
				HideMenus();
			} else {
				if (event.which == 1 && !event.shiftKey && !event.ctrlKey && (event.target.classList.contains("tab_title") || event.target.classList.contains("tab_header"))) {
					DeselectTabs();
					// SetActiveTab(this.parentNode.id);
					chrome.tabs.update(parseInt(this.parentNode.id), { active: true });
				}
			}
		}
		th.ondblclick = function(event) {
			if (event.target.classList && (event.target.classList.contains("tab_title") || event.target.classList.contains("tab_header"))) {
				ActionClickTab(this.parentNode, opt.dbclick_tab);
			}
		}
		
		th.onmousedown = function(event) {
			event.stopImmediatePropagation();
			if (event.which == 1) {
				// SELECT TAB/PIN
				EventSelectTab(event, this.parentNode);
			}
			if (event.which == 2) {
				event.preventDefault();
				ActionClickTab(this.parentNode, opt.midclick_tab);
			}
			if (event.which == 3) {
				ShowTabMenu(this.parentNode, event);
			}
		}

		th.onmouseover = function(event) {
			this.classList.add("tab_header_hover");
			if (opt.never_show_close == false && opt.always_show_close == false) {
				this.classList.add("close_show");
			}
		}
		th.onmouseleave = function(event) {
			this.classList.remove("tab_header_hover");
			if (opt.never_show_close == false && opt.always_show_close == false) {
				this.classList.remove("close_show");
			}
		}
		th.ondragstart = function(event) { // DRAG START
			event.stopPropagation();
			event.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
			event.dataTransfer.setData("text", "");
			// event.dataTransfer.setData("text/plain", "");
			// event.dataTransfer.setData("TTSourceWindowId", CurrentWindowId);
		
			CleanUpDragClasses();
			EmptyDragAndDrop();
			
			DropTargetsFront(this, true, false);

			if (this.parentNode.classList.contains("selected_tab") == false) {
				document.querySelectorAll(".selected_tab").forEach(function(s){
					s.classList.add("selected_frozen");
					s.classList.remove("selected_tab");
					s.classList.remove("selected_last");
				});
				this.parentNode.classList.add("selected_temporarly");
				this.parentNode.classList.add("selected_tab");
			} else {
				document.querySelectorAll(".group:not(#"+active_group+") .selected_tab").forEach(function(s){
					s.classList.add("selected_frozen");
					s.classList.remove("selected_tab");
					s.classList.remove("selected_last");
				});
			}
			let Tabs = GetSelectedTabs();
			
			document.querySelectorAll("[id='"+this.parentNode.id+"'], [id='"+this.parentNode.id+"'] .folder, [id='"+this.parentNode.id+"'] .tab").forEach(function(s){
				s.classList.add("dragged_tree");
			});
			document.querySelectorAll(".selected_tab, .selected_tab .tab, .selected_folder, .selected_folder .folder").forEach(function(s){
				s.classList.add("dragged_selected");
			});

			if (opt.max_tree_drag_drop) {
				document.querySelectorAll(".dragged_tree .tab").forEach(function(s){
					let parents = GetParentsByClass(s.parentNode, "dragged_tree");
					if (parents.length > DragAndDrop.Depth) {
						DragAndDrop.Depth = parents.length;
					}
				});
			} else {
				DragAndDrop.Depth = -1;
			}
			
			DragAndDrop.TabsIds = Object.assign([], Tabs.TabsIds);
			DragAndDrop.TabsIdsParents = Object.assign([], Tabs.TabsIdsParents);
			DragAndDrop.TabsIdsSelected = Object.assign([], Tabs.TabsIdsSelected);
			DragAndDrop.DragNodeClass = "tab";
			DragAndDrop.ComesFromWindowId = CurrentWindowId;
			
			chrome.runtime.sendMessage({
				command: "drag_drop",
				DragNodeClass: DragAndDrop.DragNodeClass,
				TabsIds: DragAndDrop.TabsIds,
				TabsIdsParents: DragAndDrop.TabsIdsParents,
				TabsIdsSelected: DragAndDrop.TabsIdsSelected,
				ComesFromWindowId: CurrentWindowId,
				Depth: DragAndDrop.Depth,
				Folders: DragAndDrop.Folders,
				FoldersSelected: DragAndDrop.FoldersSelected
			});
		}

		th.ondragenter = function(event) {
			this.classList.remove("tab_header_hover");
		}		
		
		dc.ondragenter = function(event) {
			DragAndDrop.timeout = false;
			setTimeout(function() {
				DragAndDrop.timeout = true;
			}, 1000);
			if (DragAndDrop.DragNodeClass == "tab") {
				HighlightDragEnter(this, 0, "tab");
			}
		}

		du.ondragenter = function(event) {
			if (DragAndDrop.DragNodeClass == "tab") {
				HighlightDragEnter(this, 1, "tab");
			}
		}

		dd.ondragenter = function(event) {
			if (DragAndDrop.DragNodeClass == "tab") {
				HighlightDragEnter(this, 1, "tab");
			}
		}

		mi.onmousedown = function(event) {
			event.stopImmediatePropagation();
			if (event.which == 1 && (this.parentNode.parentNode.classList.contains("audible") || this.parentNode.parentNode.classList.contains("muted")) ) {
				chrome.tabs.get(parseInt(this.parentNode.parentNode.id), function(tab) {
					if (tab) {
						chrome.tabs.update(tab.id, {muted:!tab.mutedInfo.muted});
					}
				});
			}
		}
	}	

	let parent;
	if (tab.pinned) {
		parent = document.getElementById("pin_list");
	} else {
		if (ParentId == false || ParentId == undefined || document.getElementById(ParentId) == null || document.querySelector(".pin[id='"+ParentId+"']") != null || ParentId == "pin_list") {
			parent = document.getElementById("ct"+active_group);
		} else {
			parent = document.getElementById("ct"+ParentId);
			if (parent.children.length == 0) {
				parent.parentNode.classList.add("o");
				parent.parentNode.classList.remove("c");
			}
		}
	}	
	if (Append && parent) {
		parent.appendChild(tb);
	}
	if (!Append && parent) {
		parent.prepend(tb);
	}
	
	if (InsertBeforeId) {
		let Before = document.getElementById(InsertBeforeId);
		if (Before != null) {
			if ((tab.pinned && Before.classList.contains("pin")) || (tab.pinned == false && Before.classList.contains("tab"))) {
				Before.parentNode.insertBefore(tb, Before);
			}
		}
	}
	if (InsertAfterId) {
		let After = document.getElementById(InsertAfterId);
		if (After != null) {
			if ((tab.pinned && After.classList.contains("pin")) || (tab.pinned == false && After.classList.contains("tab"))) {
				if (After.nextSibling != null) {
					After.parentNode.insertBefore(tb, After.nextSibling);
				} else {
					After.parentNode.appendChild(tb);
				}
			}
		}
	}
	if (Index) {
		if (tb.parentNode.childNodes.length >= Index) {
			tb.parentNode.insertBefore(tb, tb.parentNode.childNodes[Index]);
		} else {
			tb.parentNode.appendChild(tb);
		}
	}
	GetFaviconAndTitle(tab.id, addCounter);
	RefreshMediaIcon(tab.id);
	if (tab.active && SkipSetActive == false) {
		SetActiveTab(tab.id);
	}
	if (Scroll) {
		ScrollToTab(tab.id);
	}
}

function RemoveTabFromList(tabId) {
	let tab = document.getElementById(tabId);
	if (tab != null) {
		tab.parentNode.removeChild(tab);
	}
}

function SetTabClass(tabId, pin) {
	let PinList = document.getElementById("pin_list");
	let GroupList = document.getElementById("ct"+active_group);
	let Tab = document.getElementById(tabId);
	if (Tab != null) {
		if (pin) {
			if (Tab.parentNode.id != "pin_list") {
				document.getElementById("pin_list").appendChild(Tab);
			}
			Tab.classList.remove("tab");
			Tab.classList.remove("o");
			Tab.classList.remove("c");
			Tab.classList.add("pin");
			if (document.getElementById("ct"+tabId).childNodes.length > 0) { // flatten out children
				let tabs = document.querySelectorAll("#ct"+tabId+" .pin, #ct"+tabId+" .tab");
				for (let i = tabs.length-1; i >= 0; i--) {
					tabs[i].remove("tab");
					tabs[i].remove("o");
					tabs[i].remove("c");
					tabs[i].classList.add("pin");
					if(Tab.nextSibling != null) {
						PinList.insertBefore(tabs[i], Tab.nextSibling);
					} else {
						PinList.appendChild(tabs[i]);
					}
					chrome.tabs.update(parseInt(tabs[i].id), {pinned: true});
				}
			}

		} else {
			if (GroupList.childNodes.length > 0) { // flatten out children
				GroupList.insertBefore(Tab, GroupList.childNodes[0]);
			} else {
				GroupList.appendChild(Tab);
			}
			Tab.classList.remove("pin");
			Tab.classList.remove("attention");
			Tab.classList.add("tab");
			RefreshExpandStates();
		}
		chrome.tabs.update(parseInt(tabId), {pinned: pin});
		RefreshGUI();
	}
}

function SetActiveTab(tabId) {
	let Tab = document.getElementById(tabId);
	if (Tab != null) {
		document.querySelectorAll(".selected_folder").forEach(function(s){
			s.classList.remove("selected_folder");
		});
		document.querySelectorAll(".pin, #"+active_group+" .tab").forEach(function(s){
			s.classList.remove("active_tab");
			s.classList.remove("selected_tab");
			s.classList.remove("selected_last");
			s.classList.remove("selected_frozen");
			s.classList.remove("selected_temporarly");
			s.classList.remove("tab_header_hover");
		});
		document.querySelectorAll(".highlighted_drop_target").forEach(function(s){
			s.classList.remove("highlighted_drop_target");
		});
		Tab.classList.remove("attention");
		Tab.classList.add("active_tab");
		ScrollToTab(tabId);
		if (Tab.classList.contains("tab")) {
			SetActiveTabInGroup(active_group, tabId);
		}
	}
}

function ScrollToTab(tabId) {
	let Tab = document.getElementById(tabId);
	if (Tab != null) {
		if (Tab.classList.contains("pin")) {
			if (Tab.getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().left < 0) {
				document.getElementById("pin_list").scrollLeft = document.getElementById("pin_list").scrollLeft + Tab.getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().left - 2;
			} else {
				if (Tab.getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().left > document.getElementById(active_group).getBoundingClientRect().width - document.querySelector(".tab_header").getBoundingClientRect().width) {
					document.getElementById("pin_list").scrollLeft = document.getElementById("pin_list").scrollLeft + Tab.getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().width + document.querySelector(".tab_header").getBoundingClientRect().width + 2;
				}
			}
		}
		if (Tab.classList.contains("tab") && document.querySelector("#"+active_group+" [id='"+tabId+"']") != null) {
			let Parents = GetParentsByClass(Tab, "c");
			if (Parents.length > 0) {
				Parents.forEach(function(s){
					s.classList.remove("c");
					s.classList.add("o");
				});
			}
			if (Tab.getBoundingClientRect().top - document.getElementById(active_group).getBoundingClientRect().top < 0) {
				document.getElementById(active_group).scrollTop = document.getElementById(active_group).scrollTop + Tab.getBoundingClientRect().top - document.getElementById(active_group).getBoundingClientRect().top - 2;
			} else {
				if (Tab.getBoundingClientRect().top - document.getElementById(active_group).getBoundingClientRect().top > document.getElementById(active_group).getBoundingClientRect().height - document.querySelector(".tab_header").getBoundingClientRect().height) {
					document.getElementById(active_group).scrollTop = document.getElementById(active_group).scrollTop + Tab.getBoundingClientRect().top - document.getElementById(active_group).getBoundingClientRect().top - document.getElementById(active_group).getBoundingClientRect().height + document.querySelector(".tab_header").getBoundingClientRect().height + 10;
				}
			}
		}
	}
}

function Detach(tabsIds, Folders) {
	chrome.windows.get(CurrentWindowId, {populate : true}, function(window) {
		if (window.tabs.length == 1 || tabsIds.length == 0) {
			return;
		}
		if (tabsIds.length == window.tabs.length) {
			if (opt.debug) console.log("You are trying to detach all tabs! Skipping!");
			return;
		}
		chrome.windows.create({tabId: tabsIds[0], state:window.state}, function(new_window) {
			let Indexes = [];
			let Parents = [];
			let Expands = [];
			let NewIds = [];																	// MOZILLA BUG 1398272
			let NewTabs = [];
			let Ind = 0;
			tabsIds.forEach(function(tabId) {
				let tab = document.getElementById(tabId);
				NewIds.push(tabId);															// MOZILLA BUG 1398272
				Indexes.push(Array.from(tab.parentNode.children).indexOf(tab));
				Parents.push(tab.parentNode.parentNode.id);
				Expands.push( (tab.classList.contains("c") ? "c" : (tab.classList.contains("o") ? "o" : ""))  );
			});
			tabsIds.forEach(function(tabId) {
				chrome.tabs.move(tabId, {windowId: new_window.id, index:-1}, function(MovedTab) {
					if (browserId == "F") {													// MOZILLA BUG 1398272
						if (Ind == 0) {														// MOZILLA BUG 1398272
							NewIds[Ind] = new_window.tabs[0].id;						// MOZILLA BUG 1398272
						} else {																	// MOZILLA BUG 1398272
							NewIds[Ind] = MovedTab[0].id;									// MOZILLA BUG 1398272
						}																			// MOZILLA BUG 1398272
						NewTabs.push({id: NewIds[Ind], index: Indexes[Ind], parent: ((tabsIds.indexOf(parseInt(Parents[Ind])) != -1) ? NewIds[tabsIds.indexOf(parseInt(Parents[Ind]))] : Parents[Ind]), expand: Expands[Ind]});	// MOZILLA BUG 1398272
					} else {																		// MOZILLA BUG 1398272
						NewTabs.push({id: tabsIds[Ind], index: Indexes[Ind], parent: Parents[Ind], expand: Expands[Ind]}); // PUSH TAB FROM INDEX
					}																				// MOZILLA BUG 1398272
					Ind++;
					if (Ind >= Parents.length-1) {
						// chrome.tabs.remove(new_window.tabs[0].id, null);
						let Confirmations = 0;
						let GiveUpLimit = 600;
						if (opt.debug) console.log("Detach - Remote Append and Update Loop, waiting for confirmations after attach tabs");
						var Append = setInterval(function() {
							chrome.windows.get(new_window.id, function(confirm_new_window) {
								chrome.runtime.sendMessage({command: "remote_update", groups: {}, folders: Folders, tabs: NewTabs, windowId: new_window.id}, function(response) {
									if (response) {
										Confirmations++;
									}
								});
								GiveUpLimit--;
								if (opt.debug) console.log("Detach -> Attach in new window confirmed: "+Confirmations+" times. If sidebar is not open in new window this loop will give up in: "+GiveUpLimit+" seconds");
								if (Confirmations > 2 || GiveUpLimit < 0 || confirm_new_window == undefined) {
									clearInterval(Append);
								}
							});
						}, 1000);
						if (Folders && Object.keys(Folders).length > 0) {
							for (var folder in Folders) {
								RemoveFolder(Folders[folder].id);
							}
						}
					}
				});
			});
		});
	});
}

function CloseTabs(tabsIds) {
	let activeTab = document.querySelector(".pin.active_tab, #"+active_group+" .tab.active_tab");
	if (activeTab != null && tabsIds.indexOf(parseInt(activeTab.id)) != -1) {
		SwitchActiveTabBeforeClose(active_group);
	}
	tabsIds.forEach(function(tabId) {
		let tab = document.getElementById(tabId);
		if (tab.classList.contains("pin") && opt.allow_pin_close) {
			tab.parentNode.removeChild(tab);
			chrome.tabs.update(tabId, {pinned: false});
		}
		if (tabId == tabsIds[tabsIds.length-1]) {
			setTimeout(function() {
				chrome.tabs.remove(tabsIds, null);
			}, 10);
		}
	});
}

function DiscardTabs(tabsIds) {
	var delay = 100;
	let tabNode = document.getElementById(tabsIds[0]);
	if (tabNode == null || tabNode.classList.contains("discarded") || tabNode.classList.contains("active_tab")) {
		delay = 5;
	} else {
		chrome.tabs.discard(tabsIds[0]);
	}
	tabsIds.splice(0, 1);
	if (tabsIds.length > 0) {
		setTimeout(function() {
			DiscardTabs(tabsIds);
		}, delay);
	}
}

function SwitchActiveTabBeforeClose(ActiveGroupId) {
	if (opt.debug) console.log("function: SwitchActiveTabBeforeClose");
	let activeGroup = document.getElementById(ActiveGroupId);
	if (document.querySelectorAll("#"+ActiveGroupId+" .tab").length <= 1 && document.querySelector(".pin.active_tab") == null) {
		if (opt.after_closing_active_tab == "above" || opt.after_closing_active_tab == "above_seek_in_parent") {
			if (activeGroup.previousSibling != null) {
				if (document.querySelectorAll("#"+activeGroup.previousSibling.id+" .tab").length > 0) {
					SetActiveGroup(activeGroup.previousSibling.id, true, true);
				} else {
					SwitchActiveTabBeforeClose(activeGroup.previousSibling.id);
					return;
				}
			} else {
				SetActiveGroup("tab_list", true, true);
			}
		} else {
			if (activeGroup.nextSibling != null) {
				if (document.querySelectorAll("#"+activeGroup.nextSibling.id+" .tab").length > 0) {
					SetActiveGroup(activeGroup.nextSibling.id, true, true);
				} else {
					SwitchActiveTabBeforeClose(activeGroup.nextSibling.id);
					return;
				}
			} else {
				SetActiveGroup("tab_list", true, true);
			}
		}
	} else {
		if (opt.after_closing_active_tab == "above") {
			ActivatePrevTab(true);
		}
		if (opt.after_closing_active_tab == "below") {
			ActivateNextTab(true);
		}
		if (opt.after_closing_active_tab == "above_seek_in_parent") {
			ActivatePrevTabBeforeClose();
		}
		if (opt.after_closing_active_tab == "below_seek_in_parent") {
			ActivateNextTabBeforeClose();
		}
	}
}

function ActivateNextTabBeforeClose() {
	let activePin = document.querySelector(".pin.active_tab");
	if (activePin != null) {
		if (activePin.nextSibling != null) {
			chrome.tabs.update(parseInt(activePin.nextSibling.id), { active: true });
		} else {
			if (activePin.previousSibling != null) {
				chrome.tabs.update(parseInt(activePin.previousSibling.id), { active: true });
			}
		}
	}
	let activeTab = document.querySelector("#"+active_group+" .tab.active_tab");
	if (activeTab != null && document.querySelectorAll("#"+active_group+" .tab").length > 1) {
		if (opt.promote_children && activeTab.lastChild.firstChild != null) {
			chrome.tabs.update(parseInt(activeTab.lastChild.firstChild.id), { active: true });
		} else {
			if (activeTab.nextSibling != null) {
				chrome.tabs.update(parseInt(activeTab.nextSibling.id), { active: true });
			} else {
				if (activeTab.previousSibling != null) {
					chrome.tabs.update(parseInt(activeTab.previousSibling.id), { active: true });
				} else {
					if (activeTab.parentNode.parentNode.classList.contains("tab")) {
						chrome.tabs.update(parseInt(activeTab.parentNode.parentNode.id), { active: true });
					} else {
						ActivatePrevTab();
					}
				}
			}
		}
	}
}

function ActivatePrevTabBeforeClose() {
	let activePin = document.querySelector(".pin.active_tab");
	if (activePin != null) {
		if (activePin.previousSibling != null) {
			chrome.tabs.update(parseInt(activePin.previousSibling.id), { active: true });
		} else {
			if (activePin.nextSibling != null) {
				chrome.tabs.update(parseInt(activePin.nextSibling.id), { active: true });
			}
		}
	}
	let activeTab = document.querySelector("#"+active_group+" .tab.active_tab");
	if (activeTab != null && document.querySelectorAll("#"+active_group+" .tab").length > 1) {
		if (opt.promote_children && activeTab.lastChild.firstChild != null) {
			chrome.tabs.update(parseInt(activeTab.lastChild.firstChild.id), { active: true });
		} else {
			if (activeTab.previousSibling != null) {
				chrome.tabs.update(parseInt(activeTab.previousSibling.id), { active: true });
			} else {
				if (activeTab.nextSibling != null) {
					chrome.tabs.update(parseInt(activeTab.nextSibling.id), { active: true });
				} else {
					if (activeTab.parentNode.parentNode.classList.contains("tab")) {
						chrome.tabs.update(parseInt(activeTab.parentNode.parentNode.id), { active: true });
					} else {
						ActivateNextTab();
					}
				}
			}
		}
	}		
}

function ActivateNextTab(allow_reverse) {
	let activePin = document.querySelector(".pin.active_tab");
	if (activePin != null) {
		if (activePin.nextSibling != null) {
			chrome.tabs.update(parseInt(activePin.nextSibling.id), { active: true });
		} else {
			if (activePin.previousSibling != null && allow_reverse) {
				chrome.tabs.update(parseInt(activePin.previousSibling.id), { active: true });
			}
		}
	}
	let activeTab = document.querySelector("#"+active_group+" .tab.active_tab");
	if (activeTab != null && document.querySelectorAll("#"+active_group+" .tab").length > 1) {
		let FirstChild = activeTab.lastChild.firstChild;
		if (FirstChild != null) {
			chrome.tabs.update(parseInt(FirstChild.id), { active: true });
		} else {
			if (activeTab.nextSibling != null) {
				chrome.tabs.update(parseInt(activeTab.nextSibling.id), { active: true });
			} else {
				let Next = null;
				while (Next == null && activeTab.parentNode != null && activeTab.parentNode.parentNode != null) {
					if (activeTab.parentNode.parentNode.classList != undefined && activeTab.parentNode.parentNode.classList.contains("tab") && activeTab.parentNode.parentNode.nextSibling != null && activeTab.parentNode.parentNode.nextSibling.classList.contains("tab")) {
						Next = activeTab.parentNode.parentNode.nextSibling;
					}
					activeTab = activeTab.parentNode.parentNode;
				}
				if (Next != null) {
					chrome.tabs.update(parseInt(Next.id), { active: true });
				} else {
					if (allow_reverse) {
						ActivatePrevTab();
					}
				}
			}
		}
	}
}

function ActivatePrevTab(allow_reverse) {
	let activePin = document.querySelector(".pin.active_tab");
	if (activePin != null) {
		if (activePin.previousSibling != null) {
			chrome.tabs.update(parseInt(activePin.previousSibling.id), { active: true });
		} else {
			if (activePin.nextSibling != null && allow_reverse) {
				chrome.tabs.update(parseInt(activePin.nextSibling.id), { active: true });
			}
		}
	}
	let activeTab = document.querySelector("#"+active_group+" .tab.active_tab");
	if (activeTab != null && document.querySelectorAll("#"+active_group+" .tab").length > 1) {
		let pSchildren = activeTab.previousSibling != null ? document.querySelectorAll("#ct"+activeTab.previousSibling.id+" .tab") : null;
		if (activeTab.previousSibling != null && pSchildren.length > 0) {
			chrome.tabs.update(parseInt(pSchildren[pSchildren.length-1].id), { active: true });
		} else {
			if (activeTab.previousSibling != null) {
				chrome.tabs.update(parseInt(activeTab.previousSibling.id), { active: true });
			} else {
				if (activeTab.parentNode.parentNode.classList.contains("tab")) {
					chrome.tabs.update(parseInt(activeTab.parentNode.parentNode.id), { active: true });
				} else {
					if (allow_reverse) {
						ActivateNextTab();
					}
				}
			}
		}
	}
}

function DeselectTabs() {
	document.querySelectorAll(".pin.selected_tab, #"+active_group+" .selected_tab").forEach(function(s){
		s.classList.remove("selected_tab");
		s.classList.remove("selected_last");
	});
}

function HighlightNode(Node) {
		document.querySelectorAll(".highlighted_drop_target").forEach(function(s){
			s.classList.remove("highlighted_drop_target");
		});
		Node.classList.add("highlighted_drop_target");
}

function HighlightDragEnter(Node, addDepth, Class) { // Class == "tab" or "folder"
	// PIN,TAB==>TAB OR PIN,TAB==>FOLDER
	// AND AVOID ENTERING INSIDE OWN CHILDREN
	if (Node.classList.contains("highlighted_drop_target") == false && Node.parentNode.classList.contains("dragged_tree") == false && Node.parentNode.classList.contains("dragged_selected") == false) {
		if (opt.max_tree_depth >= 0 && DragAndDrop.Depth >= 0 && DragAndDrop.DragNodeClass == Class) {
			let Parents = GetParentsByClass(Node, Class);
			if ((Parents.length + DragAndDrop.Depth <= opt.max_tree_depth + addDepth) || (Node.parentNode.parentNode.parentNode.classList.contains("group") && Node.classList.contains("drag_enter_center") == false)) {
				HighlightNode(Node);
			}
		} else {
			HighlightNode(Node);
		}
	}
}

function EventExpandBox(Node) {
	if (Node.classList.contains("o")) {
		Node.classList.remove("o");
		Node.classList.add("c");
		
		if (Node.classList.contains("tab")) {
			chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(Node.id), tab: { expand: "c" } });
		}
		
		if (Node.classList.contains("folder")) {
			SaveFolders();
		}
		
	} else {
		if (Node.classList.contains("c")) {
			if (opt.collapse_other_trees) {
				let thisTreeTabs = GetParentsByClass(Node.childNodes[0], "tab"); // start from tab's first child, instead of tab, important to include clicked tab as well
				let thisTreeFolders = GetParentsByClass(Node.childNodes[0], "folder"); 
				document.querySelectorAll("#"+active_group+" .o.tab").forEach(function(s){
					s.classList.remove("o");
					s.classList.add("c");
					chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(s.id), tab: { expand: "c" } });
				});
				
				document.querySelectorAll("#"+active_group+" .o.folder").forEach(function(s){
					s.classList.remove("o");
					s.classList.add("c");
				});
				thisTreeTabs.forEach(function(s){
					s.classList.remove("c");
					s.classList.add("o");
					chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(s.id), tab: { expand: "o" } });
				});
				thisTreeFolders.forEach(function(s){
					s.classList.remove("c");
					s.classList.add("o");
				});
				SaveFolders();
				if (Node.classList.contains("tab")) {
					ScrollToTab(Node.id);
				}
			} else {
				Node.classList.remove("c");
				Node.classList.add("o");
				
				if (Node.classList.contains("tab")) {
					chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(Node.id), tab: { expand: "o" } });
				}
				
				if (Node.classList.contains("folder")) {
					SaveFolders();
				}
				
			}
		}
	}
}


function OpenNewTab(pin, parentId) {
	if (pin) {
		chrome.tabs.create({pinned: true}, function(tab) {
			if (parentId) {
				AppendTab(tab, "pin_list", false, parentId, true, false, true, false, false, true, false);
				schedule_update_data++;
			}
		});
	} else {
		chrome.tabs.create({}, function(tab) {
			if (parentId) {
				AppendTab(tab, parentId, false, false, (opt.append_orphan_tab == "top" ? false : true), false, true, false, false, true, false);
				schedule_update_data++;
			}
		});
	}
}


function EventSelectTab(event, TabNode) {
	DeselectFolders();
	if (event.shiftKey) { // SET SELECTION WITH SHIFT
		let activeTab = document.querySelector("#"+active_group+" .selected_tab.selected_last");
		if (activeTab == null) {
			activeTab = document.querySelector(".pin.active_tab, #"+active_group+" .tab.active_tab");
		}
		if (activeTab != null && TabNode.parentNode.id == activeTab.parentNode.id) {

			if (!event.ctrlKey) {
				document.querySelectorAll(".pin.selected_tab, #"+active_group+" .selected_tab").forEach(function(s){
					s.classList.remove("selected_frozen");
					s.classList.remove("selected_temporarly");
					s.classList.remove("selected_tab");
					s.classList.remove("selected_last");
				});
			}
			let ChildrenArray = Array.from(TabNode.parentNode.children);
			let activeTabIndex = ChildrenArray.indexOf(activeTab);
			let thisTabIndex = ChildrenArray.indexOf(TabNode);
			let fromIndex = thisTabIndex >= activeTabIndex ? activeTabIndex : thisTabIndex;
			let toIndex = thisTabIndex >= activeTabIndex ? thisTabIndex : activeTabIndex;
			for (let i = fromIndex; i <= toIndex; i++) {
				activeTab.parentNode.childNodes[i].classList.add("selected_tab");
				if (i == toIndex && event.ctrlKey) {
					activeTab.parentNode.childNodes[i].classList.add("selected_last");
				}
			}
		}
	}
	if (event.ctrlKey && !event.shiftKey) { // TOGGLE SELECTION WITH CTRL
		TabNode.classList.toggle("selected_tab");
		if (TabNode.classList.contains("selected_tab")) {
			document.querySelectorAll(".selected_last").forEach(function(s){
				s.classList.remove("selected_last");
			});
			TabNode.classList.add("selected_last");
		} else {
			TabNode.classList.remove("selected_last");
		}
	}
}

function ActionClickTab(TabNode, bgOption) {
	if (bgOption == "new_tab") {
		OpenNewTab(TabNode.classList.contains("pin"), TabNode.id);
	}
	if (bgOption == "expand_collapse") {
		EventExpandBox(TabNode);
	}
	if (bgOption == "close_tab") {
		if ((TabNode.classList.contains("pin") && opt.allow_pin_close) || TabNode.classList.contains("tab")) {
			CloseTabs([parseInt(TabNode.id)]);
		}
	}
	if (bgOption == "reload_tab") {
		chrome.tabs.reload(parseInt(TabNode.id));
	}
	if (bgOption == "unload_tab") {
		SwitchActiveTabBeforeClose(active_group);
		DiscardTabs([parseInt(TabNode.id)]);
	}
	if (bgOption == "activate_previous_active" && TabNode.classList.contains("active_tab")) {
		chrome.tabs.update(parseInt(bggroups[active_group].prev_active_tab), {active: true});
	}
}
