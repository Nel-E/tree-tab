// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********       TABS FUNCTIONS          ***************


async function UpdateData() {
	if (opt.debug) {
		log("f: UpdateData");
	}
	
	setInterval(function() {
		if (tt.schedule_update_data > 1) {
			tt.schedule_update_data = 1;
		}
		if (tt.schedule_update_data > 0) {
			let PinInd = 0;
			let pins_data = [];
			document.querySelectorAll(".pin").forEach(function(pin){
				pins_data.push({id: pin.id, index: PinInd});
				PinInd++;
			});
			
			let tabs_data = [];
			document.querySelectorAll(".tab").forEach(function(tab){
				tabs_data.push({id: tab.id, parent: tab.parentNode.parentNode.id, index: Array.from(tab.parentNode.children).indexOf(tab), expand: (tab.classList.contains("c") ? "c" : (tab.classList.contains("o") ? "o" : ""))});
			});
			chrome.runtime.sendMessage({command: "update_all_tabs", pins: pins_data, tabs: tabs_data});
			tt.schedule_update_data--;
		}
	}, 1000);
}

async function RearrangeBrowserTabs() {
	setInterval(function() {
		if (tt.schedule_rearrange_tabs > 0) {
			tt.schedule_rearrange_tabs--;
			if (opt.debug) {
				log("f: RearrangeBrowserTabs");
			}
			chrome.tabs.query({currentWindow: true}, function(tabs) {
				let ttTabIds = Array.prototype.map.call(document.querySelectorAll(".pin, .tab"), function(s){
					return parseInt(s.id);
				});
				let tabIds = Array.prototype.map.call(tabs, function(t){
					return t.id;
				});
				RearrangeBrowserTabsLoop(ttTabIds, tabIds, ttTabIds.length-1);
			});
		}
	}, 1000);
}

async function RearrangeBrowserTabsLoop(ttTabIds, tabIds, tabIndex) {
	if (opt.debug) {
		log("f: RearrangeBrowserTabsLoop");
	}
	if (tabIndex >= 0 && tt.schedule_rearrange_tabs == 0){
		if (ttTabIds[tabIndex] != tabIds[tabIndex]) {
			chrome.tabs.move(ttTabIds[tabIndex], {index: tabIndex});
		}
		setTimeout(function() {
			RearrangeBrowserTabsLoop(ttTabIds, tabIds, (tabIndex-1));
		}, 0);
	}
}

function RearrangeTreeTabs(bgtabs, show_finish_in_status) {
	if (opt.debug) {
		log("f: RearrangeTreeTabs");
	}
	ShowStatusBar({show: true, spinner: true, message: "Rearranging tabs and folders"});
	document.querySelectorAll(".pin, .tab").forEach(function(tab){
		if (bgtabs[tab.id]) {
			let Sibling = tab.nextElementSibling;
			while (Sibling) {
				if (bgtabs[Sibling.id]) {
					if (bgtabs[tab.id].index > bgtabs[Sibling.id].index   ) {
						InsterAfterNode(tab, Sibling);
					}
				}
				Sibling = Sibling.nextElementSibling ? Sibling.nextElementSibling : false;
			}
		}
		if (show_finish_in_status){
			ShowStatusBar({show: true, spinner: false, message: "Rearranging: done.", hideTimeout: 1000});
		}
	});
}

function AppendTab(p) { // tab: chrome tab object, ParentId: int or string, InsertBeforeId: int or string, InsertAfterId: int or string, Append: bool, SkipSetEvents: bool, AdditionalClass: string, SkipSetActive: bool, Scroll: bool, addCounter: bool, SkipMediaIcon: bool
	if (document.getElementById(p.tab.id) != null) {
		GetFaviconAndTitle(p.tab.id, p.addCounter);
		return;
	}	
	let ClassList = p.tab.pinned ? "pin" : "tab";
	if (p.tab.discarded) {
		ClassList = ClassList + " discarded";
	}
	if (p.AdditionalClass) {
		ClassList = ClassList +" "+ p.AdditionalClass;
	}
	let tb = document.createElement("div"); tb.className =  ClassList; tb.id = p.tab.id; // TAB
	let tbh = document.createElement("div"); tbh.className = (opt.always_show_close && !opt.never_show_close) ? "tab_header close_show" : "tab_header"; tbh.id = "tab_header"+p.tab.id; if (!p.SkipSetEvents) {tbh.draggable = true;} tb.appendChild(tbh); // HEADER
	let tbe = document.createElement("div"); tbe.className = "expand"; tbe.id = "exp"+p.tab.id; tbh.appendChild(tbe); // EXPAND ARROW
	let tbt = document.createElement("div"); tbt.className = "tab_title"; tbt.id = "tab_title"+p.tab.id; tbh.appendChild(tbt); // TITLE
	let cl = undefined;
	if (!opt.never_show_close) {
		cl = document.createElement("div"); cl.className = "close"; cl.id = "close"+p.tab.id; tbh.appendChild(cl); // CLOSE BUTTON
		let ci = document.createElement("div"); ci.className = "close_img"; ci.id = "close_img"+p.tab.id; cl.appendChild(ci);
	}
	let mi = document.createElement("div"); mi.className = "tab_mediaicon"; mi.id = "tab_mediaicon"+p.tab.id; tbh.appendChild(mi);
	let ct = document.createElement("div"); ct.className = "children_tabs"; ct.id = "ct"+p.tab.id; tb.appendChild(ct);
	let di = document.createElement("div"); di.className = "drag_indicator"; di.id = "di"+p.tab.id; tb.appendChild(di); // DROP TARGET INDICATOR
	
	if (!p.SkipSetEvents) {
		ct.onclick = function(event) {
			if (event.target == this && event.which == 1) {
				DeselectFolders();
				DeselectTabs();
			}
		}
		ct.onmousedown = function(event) {
			if (event.target == this) {
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
		tbe.onmousedown = function(event) {
			if (document.getElementById("main_menu").style.top != "-1000px") {
				HideMenus();
			}
			if (event.which == 1 && !event.shiftKey && !event.ctrlKey) {
				EventExpandBox(this.parentNode.parentNode);
			}
		}
		tbe.onmouseenter = function(event) {
			this.classList.add("hover");
		}
		tbe.onmouseleave = function(event) {
			this.classList.remove("hover");
		}
		
		if (!opt.never_show_close && cl) {
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

		tbh.onclick = function(event) {
			event.stopImmediatePropagation();
			if (document.getElementById("main_menu").style.top != "-1000px") {
				HideMenus();
			} else {
				if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target.classList.contains("tab_header")) {
					DeselectTabs();
					chrome.tabs.update(parseInt(this.parentNode.id), { active: true });
				}
			}
		}
		tbh.ondblclick = function(event) {
			if (event.target.classList && event.target.classList.contains("tab_header")) {
				ActionClickTab(this.parentNode, opt.dbclick_tab);
			}
		}
		
		tbh.onmousedown = function(event) {
			if (browserId == "V") {
				chrome.windows.getCurrent({populate: false}, function(window) {
					if (tt.CurrentWindowId != window.id && window.focused) {
						location.reload();
					}
				});
			}
			event.stopImmediatePropagation();
			if (event.which == 1) {
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

		tbh.onmouseover = function(event) {
			this.classList.add("tab_header_hover");
			if (opt.never_show_close == false && opt.always_show_close == false) {
				this.classList.add("close_show");
			}
		}
		tbh.onmouseleave = function(event) {
			this.classList.remove("tab_header_hover");
			if (opt.never_show_close == false && opt.always_show_close == false) {
				this.classList.remove("close_show");
			}
		}


		
		tbh.ondragstart = function(event) { // DRAG START
			TabStartDrag(this.parentNode, event);
		}

		tbh.ondragenter = function(event) {
			this.classList.remove("tab_header_hover");
		}

		tbh.ondragleave = function(event) {
			RemoveHighlight();
		}

		tbh.ondragover = function(event) {
			TabDragOver(this, event);
			if (opt.open_tree_on_hover && tt.DragOverId != this.id) {
				if (this.parentNode.classList.contains("c") && this.parentNode.classList.contains("dragged_tree") == false) {
					clearTimeout(tt.DragOverTimer);
					tt.DragOverId = this.id;
					let This = this;
					tt.DragOverTimer = setTimeout(function() {
						if (tt.DragOverId == This.id) {
							This.parentNode.classList.add("o");
							This.parentNode.classList.remove("c");
						}
					}, 1500);	
				}
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
	if (p.tab.pinned) {
		parent = document.getElementById("pin_list");
	} else {
		if (p.ParentId == false || p.ParentId == undefined || document.getElementById(p.ParentId) == null || document.querySelector(".pin[id='"+p.ParentId+"']") != null || p.ParentId == "pin_list") {
			parent = document.getElementById("ct"+tt.active_group);
		} else {
			parent = document.getElementById("ct"+p.ParentId);
			if (parent.children.length == 0) {
				parent.parentNode.classList.add("o");
				parent.parentNode.classList.remove("c");
			}
		}
	}	
	if (p.Append && parent) {
		parent.appendChild(tb);
	}
	if (!p.Append && parent) {
		parent.prepend(tb);
	}
	
	if (p.InsertBeforeId) {
		let Before = document.getElementById(p.InsertBeforeId);
		if (Before != null) {
			if ((p.tab.pinned && Before.classList.contains("pin")) || (p.tab.pinned == false && Before.classList.contains("tab"))) {
				Before.parentNode.insertBefore(tb, Before);
			}
		}
	}
	if (p.InsertAfterId) {
		let After = document.getElementById(p.InsertAfterId);
		if (After != null) {
			if ((p.tab.pinned && After.classList.contains("pin")) || (p.tab.pinned == false && After.classList.contains("tab"))) {
				InsterAfterNode(tb, After);
			}
		}
	}
	GetFaviconAndTitle(p.tab.id, p.addCounter);
	if (!p.SkipMediaIcon) {
		RefreshMediaIcon(p.tab.id);
	}
	if (p.tab.active && !p.SkipSetActive) {
		SetActiveTab(p.tab.id);
	}
	if (p.Scroll) {
		ScrollToTab(p.tab.id);
	}
	
	return tb;
}


function RemoveTabFromList(tabId) {
	if (opt.debug) {
		log("f: RemoveTabFromList, tabId: "+tabId);
	}
	let tab = document.getElementById(tabId);
	if (tab != null) {
		tab.parentNode.removeChild(tab);
	}
}

function SetTabClass(tabId, pin) {
	let PinList = document.getElementById("pin_list");
	let GroupList = document.getElementById("ct"+tt.active_group);
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
					tabs[i].classList.remove("tab");
					tabs[i].classList.remove("o");
					tabs[i].classList.remove("c");
					tabs[i].classList.add("pin");
					InsterAfterNode(tabs[i], Tab);
					chrome.tabs.update(parseInt(tabs[i].id), {pinned: true});
				}
			}
			chrome.tabs.update(parseInt(tabId), {pinned: true});
		} else {
			if (Tab.parentNode.id == "pin_list") { // if coming from pin_list
				if (GroupList.childNodes.length > 0) {
					GroupList.insertBefore(Tab, GroupList.childNodes[0]);
				} else {
					GroupList.appendChild(Tab);
				}
			}
			Tab.classList.remove("pin");
			Tab.classList.remove("attention");
			Tab.classList.add("tab");
			RefreshExpandStates();
			chrome.tabs.update(parseInt(tabId), {pinned: false});
		}
		RefreshGUI();
	}
}
function SetMultiTabsClass(TabsIds, pin) {
	TabsIds.forEach(function(tabId){
		SetTabClass(tabId, pin);
		chrome.tabs.update(parseInt(tabId), {pinned: pin});
	});
}

function SetActiveTab(tabId, switchToGroup) {
	if (opt.debug) {
		log("f: SetActiveTab, tabId: "+tabId);
	}
	let Tab = document.getElementById(tabId);
	if (Tab != null) {
		let TabGroup = GetParentsByClass(Tab, "group");
		if (TabGroup.length) {
			if (Tab.classList.contains("tab")) {
				SetActiveTabInGroup(TabGroup[0].id, tabId);
			}
			if (switchToGroup) {
				SetActiveGroup(TabGroup[0].id, false, false); // not going to scroll, because mostly it's going to change to a new active in group AFTER switch, so we are not going to scroll to previous active tab
			}
		}
		document.querySelectorAll(".selected_folder").forEach(function(s){
			s.classList.remove("selected_folder");
		});
		// document.querySelectorAll(".pin, #"+tt.active_group+" .tab"+(TabGroup.length ? ", #"+TabGroup[0].id+" .tab" : "")).forEach(function(s){
		document.querySelectorAll(".pin, #"+tt.active_group+" .tab").forEach(function(s){
			s.classList.remove("active_tab");
			s.classList.remove("selected_tab");
			s.classList.remove("selected_last");
			s.classList.remove("selected_frozen");
			s.classList.remove("selected_temporarly");
			s.classList.remove("tab_header_hover");
		});
		RemoveHighlight();
		Tab.classList.remove("attention");
		Tab.classList.add("active_tab");
		ScrollToTab(tabId);
	}
}

function ScrollToTab(tabId) {
	let Tab = document.getElementById(tabId);
	if (Tab != null) {
		if (Tab.classList.contains("pin")) {
			if (Tab.getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().left < 0) {
				document.getElementById("pin_list").scrollLeft = document.getElementById("pin_list").scrollLeft + Tab.getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().left - 2;
			} else {
				if (Tab.getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().left > document.getElementById(tt.active_group).getBoundingClientRect().width - document.querySelector(".tab_header").getBoundingClientRect().width) {
					document.getElementById("pin_list").scrollLeft = document.getElementById("pin_list").scrollLeft + Tab.getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().width + document.querySelector(".tab_header").getBoundingClientRect().width + 2;
				}
			}
		}
		if (Tab.classList.contains("tab") && document.querySelector("#"+tt.active_group+" [id='"+tabId+"']") != null) {
			let Parents = GetParentsByClass(Tab, "c");
			if (Parents.length > 0) {
				Parents.forEach(function(s){
					s.classList.remove("c");
					s.classList.add("o");
				});
			}
			if (Tab.getBoundingClientRect().top - document.getElementById(tt.active_group).getBoundingClientRect().top < 0) {
				document.getElementById(tt.active_group).scrollTop = document.getElementById(tt.active_group).scrollTop + Tab.getBoundingClientRect().top - document.getElementById(tt.active_group).getBoundingClientRect().top - 2;
			} else {
				if (Tab.getBoundingClientRect().top - document.getElementById(tt.active_group).getBoundingClientRect().top > document.getElementById(tt.active_group).getBoundingClientRect().height - document.querySelector(".tab_header").getBoundingClientRect().height) {
					document.getElementById(tt.active_group).scrollTop = document.getElementById(tt.active_group).scrollTop + Tab.getBoundingClientRect().top - document.getElementById(tt.active_group).getBoundingClientRect().top - document.getElementById(tt.active_group).getBoundingClientRect().height + document.querySelector(".tab_header").getBoundingClientRect().height + 10;
				}
			}
		}
	}
}

function Detach(tabsIds, Folders) {
	if (opt.debug) {
		log("f: Detach");
	}
	chrome.windows.get(tt.CurrentWindowId, {populate : true}, function(window) {
		if (window.tabs.length == 1 || tabsIds.length == 0) {
			return;
		}
		if (tabsIds.length == window.tabs.length) {
			if (opt.debug) {
				log("You are trying to detach all tabs! Skipping!");
			}
			return;
		}

		let Indexes = [];
		let Parents = [];
		let Expands = [];
		let NewTabs = [];
		let Ind = 0;

		tabsIds.forEach(function(tabId) {
			let tab = document.getElementById(tabId);
			Indexes.push(Array.from(tab.parentNode.children).indexOf(tab));
			Parents.push(tab.parentNode.parentNode.id);
			Expands.push( (tab.classList.contains("c") ? "c" : (tab.classList.contains("o") ? "o" : ""))  );
		});

		chrome.windows.create({tabId: tabsIds[0], state:window.state}, function(new_window) {

			tabsIds.splice(0, 1);
			chrome.tabs.move(tabsIds, {windowId: new_window.id, index:-1}, function(MovedTabs) {
						
				if (Folders && Object.keys(Folders).length > 0) {
					for (let folder in Folders) {
						RemoveFolder(Folders[folder].id);
					}
				}
						
			});
		});
	});
}

function CloseTabs(tabsIds) {
	if (opt.debug) {
		log("f: CloseTabs, tabsIds are: "+JSON.stringify(tabsIds));
	}
	tabsIds.forEach(function(tabId) {
		let Tab = document.getElementById(tabId);
		if (Tab != null) {
			Tab.classList.add("will_be_closed");
		}
	});
	let activeTab = document.querySelector(".pin.active_tab, #"+tt.active_group+" .tab.active_tab");
	if (activeTab != null && tabsIds.indexOf(parseInt(activeTab.id)) != -1) {
		SwitchActiveTabBeforeClose(tt.active_group);
	}
	tabsIds.forEach(function(tabId) {
		let tab = document.getElementById(tabId);
		if (tab.classList.contains("pin") && opt.allow_pin_close) {
			tab.parentNode.removeChild(tab);
			chrome.tabs.update(tabId, {pinned: false});
			RefreshGUI();
		}
		if (tabId == tabsIds[tabsIds.length-1]) {
			setTimeout(function() {
				chrome.tabs.remove(tabsIds, null);
			}, 10);
		}
	});
}

function DiscardTabs(tabsIds) {
	let delay = 100;
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
	if (opt.debug) {
		log("f: SwitchActiveTabBeforeClose");
	}
	let activeGroup = document.getElementById(ActiveGroupId);
	
	if (document.querySelectorAll("#"+ActiveGroupId+" .tab").length <= 1 && document.querySelector(".pin.active_tab") == null) { // CHECK IF CLOSING LAST TAB IN ACTIVE GROUP
		
		let pins = document.querySelectorAll(".pin");
		
		if (pins.length > 0) { // IF THERE ARE ANY PINNED TABS, ACTIVATE IT
			if (opt.debug) {
				log("available pin, switching to: "+pins[pins.length-1].id);
			}
			chrome.tabs.update(parseInt(pins[pins.length-1].id), {active: true});
			return;
		} else { // NO OTHER CHOICE BUT TO SEEK IN ANOTHER GROUP
			
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
		}
	} else {
		
		if (opt.debug) {
			log("available tabs in current group, switching option is: "+opt.after_closing_active_tab);
		}
		
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
	
	let will_be_closed = document.querySelectorAll("#"+tt.active_group+" .will_be_closed");
	let activeTab = will_be_closed.length > 0 ? will_be_closed[will_be_closed.length-1] : document.querySelector("#"+tt.active_group+" .tab.active_tab");
	
	if (activeTab != null && document.querySelectorAll("#"+tt.active_group+" .tab:not(.will_be_closed)").length > 1) {
		if (opt.promote_children && activeTab.childNodes[1].firstChild != null) {
			chrome.tabs.update(parseInt(activeTab.childNodes[1].firstChild.id), { active: true });
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

	let will_be_closed = document.querySelectorAll("#"+tt.active_group+" .will_be_closed");
	let activeTab = will_be_closed.length > 0 ? will_be_closed[0] : document.querySelector("#"+tt.active_group+" .tab.active_tab");

	if (activeTab != null && document.querySelectorAll("#"+tt.active_group+" .tab:not(.will_be_closed)").length > 1) {
		if (opt.promote_children && activeTab.childNodes[1].firstChild != null) {
			chrome.tabs.update(parseInt(activeTab.childNodes[1].firstChild.id), { active: true });
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

	let will_be_closed = document.querySelectorAll("#"+tt.active_group+" .will_be_closed");
	let activeTab = will_be_closed.length > 0 ? will_be_closed[will_be_closed.length-1] : document.querySelector("#"+tt.active_group+" .tab.active_tab");

	if (activeTab != null && document.querySelectorAll("#"+tt.active_group+" .tab").length > 1) {
		let FirstChild = activeTab.childNodes[1].firstChild;
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

	let will_be_closed = document.querySelectorAll("#"+tt.active_group+" .will_be_closed");
	let activeTab = will_be_closed.length > 0 ? will_be_closed[0] : document.querySelector("#"+tt.active_group+" .tab.active_tab");

	if (activeTab != null && document.querySelectorAll("#"+tt.active_group+" .tab").length > 1) {
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


function OpenNewTab(pin, parentId) {
	if (pin) {
		chrome.tabs.create({pinned: true}, function(tab) {
			if (parentId) {
				AppendTab({tab: tab, ParentId: "pin_list", InsertAfterId: parentId, Append: true, Scroll: true});
				tt.schedule_update_data++;
			}
		});
	} else {
		chrome.tabs.create({}, function(tab) {
			if (parentId) {
				AppendTab({tab: tab, ParentId: parentId, Append: (opt.append_orphan_tab == "top" ? false : true), Scroll: true});
				tt.schedule_update_data++;
			}
			if (opt.move_tabs_on_url_change == "from_empty") {
				chrome.runtime.sendMessage({command: "remove_tab_from_empty_tabs", tabId: tab.id});
			}
		});
	}
}

function DuplicateTab(SourceTabNode) {
	chrome.tabs.duplicate(parseInt(SourceTabNode.id), function(tab) {
		let DupRetry = setInterval(function() {
			let DupTab = document.getElementById(tab.id);
			if (DupTab != null) {
				if (browserId == "F" && tab.pinned) {
					DupTab.classList.remove("tab");
					DupTab.classList.add("pin");
				}
				InsterAfterNode(DupTab, SourceTabNode);
				RefreshExpandStates();
				tt.schedule_update_data++;
				RefreshCounters();
				clearInterval(DupRetry);
			}
		}, 10);
		setTimeout(function() {
			if (DupRetry) {
				clearInterval(DupRetry);
			}
		}, 500);
	});

}

function DeselectTabs() {
	document.querySelectorAll(".pin.selected_tab, #"+tt.active_group+" .selected_tab").forEach(function(s){
		s.classList.remove("selected_tab");
		s.classList.remove("selected_last");
	});
}


// TAB EVENTS

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
				document.querySelectorAll("#"+tt.active_group+" .o.tab").forEach(function(s){
					s.classList.remove("o");
					s.classList.add("c");
					chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(s.id), tab: { expand: "c" } });
				});
				
				document.querySelectorAll("#"+tt.active_group+" .o.folder").forEach(function(s){
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

function EventSelectTab(event, TabNode) {
	DeselectFolders();
	if (event.shiftKey) { // SET SELECTION WITH SHIFT
		let activeTab = document.querySelector("#"+tt.active_group+" .selected_tab.selected_last");
		if (activeTab == null) {
			activeTab = document.querySelector(".pin.active_tab, #"+tt.active_group+" .tab.active_tab");
		}
		if (activeTab != null && TabNode.parentNode.id == activeTab.parentNode.id) {

			if (!event.ctrlKey) {
				document.querySelectorAll(".pin.selected_tab, #"+tt.active_group+" .selected_tab").forEach(function(s){
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
	if (bgOption == "undo_close_tab") {
		chrome.sessions.getRecentlyClosed( null, function(sessions) {
			if (sessions.length > 0) {
				chrome.sessions.restore(null, function(restored) {});
			}
		});
	}
	if (bgOption == "reload_tab") {
		chrome.tabs.reload(parseInt(TabNode.id));
	}
	if (bgOption == "unload_tab") {
		if (TabNode.classList.contains("active_tab")) {
			SwitchActiveTabBeforeClose(tt.active_group);
			setTimeout(function() {
				DiscardTabs([parseInt(TabNode.id)]);
			}, 500);
		} else {
			DiscardTabs([parseInt(TabNode.id)]);
		}
	}
	if (bgOption == "activate_previous_active" && TabNode.classList.contains("active_tab")) {
		chrome.tabs.update(parseInt(tt.groups[tt.active_group].prev_active_tab), {active: true});
	}
}





function TabStartDrag(Node, event) {
	event.stopPropagation();
	event.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
	event.dataTransfer.setData("text", "");
	event.dataTransfer.setData("SourceWindowId", tt.CurrentWindowId);

	CleanUpDragClasses();
	EmptyDragAndDrop();

	tt.DragNodeClass = "tab";
	
	let TabsIds = [];
	let TabsIdsParents = [];
	let TabsIdsSelected = [];
	
	if (Node.classList.contains("selected_tab")) {
		document.querySelectorAll(".group:not(#"+tt.active_group+") .selected_tab").forEach(function(s){
			s.classList.add("selected_frozen");
			s.classList.remove("selected_tab");
			s.classList.remove("selected_last");
		});
		document.querySelectorAll("#pin_list .selected_tab, .group#"+tt.active_group+" .selected_tab").forEach(function(s){
			TabsIdsSelected.push(parseInt(s.id));
		});
	} else {
		FreezeSelected();
		Node.classList.add("selected_temporarly");
		Node.classList.add("selected_tab");
		TabsIdsSelected.push(parseInt(Node.id));
		event.dataTransfer.setData("DraggedTabNode", Node.id);
	}
	
	document.querySelectorAll("[id='"+Node.id+"'], [id='"+Node.id+"'] .tab").forEach(function(s){
		s.classList.add("dragged_tree");
	});

	
	if (opt.max_tree_drag_drop || opt.max_tree_depth >= 0) {
		document.querySelectorAll(".dragged_tree .tab").forEach(function(s){
			let parents = GetParentsByClass(s.parentNode, "dragged_tree");
			if (parents.length > tt.DragTreeDepth) {
				tt.DragTreeDepth = parents.length;
			}
		});
	} else {
		tt.DragTreeDepth = -1;
	}
	
	// REST OF SELECTED TABS THAT WILL BE DRAGGED
	document.querySelectorAll(".selected_tab, .selected_tab .tab").forEach(function(s){
		s.classList.add("dragged_tree");
		TabsIds.push(parseInt(s.id));
		TabsIdsParents.push(s.parentNode.id);
	});
	
	let DraggedFolderParents = GetParentsByClass(Node, "folder");
	DraggedFolderParents.forEach(function(s){
		s.classList.add("dragged_parents");
	});
	let DraggedParents = GetParentsByClass(Node, "tab");
	DraggedParents.forEach(function(s){
		s.classList.add("dragged_parents");
	});
	

	DragAndDropData = {TabsIds: TabsIds, TabsIdsParents: TabsIdsParents, TabsIdsSelected: TabsIdsSelected};
	
	event.dataTransfer.setData("Class", "tab");

	event.dataTransfer.setData("TabsIds", JSON.stringify(TabsIds));
	event.dataTransfer.setData("TabsIdsParents", JSON.stringify(TabsIdsParents));
	event.dataTransfer.setData("TabsIdsSelected", JSON.stringify(TabsIdsSelected));
	
	chrome.runtime.sendMessage({
		command: "drag_drop",
		DragNodeClass: "tab",
		DragTreeDepth: tt.DragTreeDepth
	});
	
	if (opt.debug) {
		log("f: TabStartDrag, Node: "+Node.id+", TabsIdsSelected: "+JSON.stringify(TabsIdsSelected)+", TabsIds: "+JSON.stringify(TabsIds)+", TabsIdsParents: "+JSON.stringify(TabsIdsParents) );
	}
	
}

function TabDragOver(Node, event) {
	if (tt.DragNodeClass == "tab" && Node.parentNode.classList.contains("dragged_tree") == false) {

		if (Node.parentNode.classList.contains("pin")) {
			if (Node.parentNode.classList.contains("before") == false && event.layerX < Node.clientWidth/2) {
				RemoveHighlight();
				Node.parentNode.classList.remove("after");
				Node.parentNode.classList.add("before");
				Node.parentNode.classList.add("highlighted_drop_target");
			}
			if (Node.parentNode.classList.contains("after") == false && event.layerX >= Node.clientWidth/2) {
				RemoveHighlight();
				Node.parentNode.classList.remove("before");
				Node.parentNode.classList.add("after");
				Node.parentNode.classList.add("highlighted_drop_target");
			}
		}
		
		if (Node.parentNode.classList.contains("tab")) {
			let PDepth = (GetParentsByClass(Node, "tab")).length + tt.DragTreeDepth;
			let PIsGroup = Node.parentNode.parentNode.parentNode.classList.contains("group");
			let PIsDraggedParents = Node.parentNode.classList.contains("dragged_parents");

			if (Node.parentNode.classList.contains("before") == false && event.layerY < Node.clientHeight/3 && (PDepth <= opt.max_tree_depth+1 || opt.max_tree_depth < 0 || PIsGroup || PIsDraggedParents || opt.max_tree_drag_drop == false)) {
				RemoveHighlight();
				Node.parentNode.classList.remove("inside");
				Node.parentNode.classList.remove("after");
				Node.parentNode.classList.add("before");
				Node.parentNode.classList.add("highlighted_drop_target");
			}
			
			
			if (Node.parentNode.classList.contains("inside") == false && event.layerY > Node.clientHeight/3 && event.layerY <= 2*(Node.clientHeight/3) && (PDepth <= opt.max_tree_depth || opt.max_tree_depth < 0 || PIsDraggedParents || opt.max_tree_drag_drop == false)) {
				RemoveHighlight();
				Node.parentNode.classList.remove("before");
				Node.parentNode.classList.remove("after");
				Node.parentNode.classList.add("inside");
				Node.parentNode.classList.add("highlighted_drop_target");
			}
			
			
			if (Node.parentNode.classList.contains("after") == false && Node.parentNode.classList.contains("o") == false && event.layerY > 2*(Node.clientHeight/3) && (PDepth <= opt.max_tree_depth+1 || opt.max_tree_depth < 0 || PIsGroup || PIsDraggedParents || opt.max_tree_drag_drop == false)) {
				RemoveHighlight();
				Node.parentNode.classList.remove("inside");
				Node.parentNode.classList.remove("before");
				Node.parentNode.classList.add("after");
				Node.parentNode.classList.add("highlighted_drop_target");
			}
		}
	}
}