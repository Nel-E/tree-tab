// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********       TABS FUNCTIONS          ***************


async function UpdateData() {
	setInterval(function() {
		if (tt.schedule_update_data > 1) {
			tt.schedule_update_data = 1;
		}
		if (tt.schedule_update_data > 0) {
			let PinInd = 0;
			let pins_data = [];
			document.querySelectorAll(".pin").forEach(function(pin) {
				pins_data.push({id: pin.id, index: PinInd});
				PinInd++;
			});
			
			let tabs_data = [];
			document.querySelectorAll(".tab").forEach(function(tab) {
				tabs_data.push({id: tab.id, parent: tab.parentNode.parentNode.id, index: Array.from(tab.parentNode.children).indexOf(tab), expand: (tab.classList.contains("c") ? "c" : (tab.classList.contains("o") ? "o" : ""))});
				// console.log(Array.from(tab.parentNode.children).indexOf(tab));
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
				let ttTabIds = Array.prototype.map.call(document.querySelectorAll(".pin, .tab"), function(s) {
					return parseInt(s.id);
				});
				let tabIds = Array.prototype.map.call(tabs, function(t) {
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
	if (tabIndex >= 0 && tt.schedule_rearrange_tabs == 0) {
		if (ttTabIds[tabIndex] != tabIds[tabIndex]) {
			chrome.tabs.move(ttTabIds[tabIndex], {index: tabIndex});
		}
		setTimeout(function() {
			RearrangeBrowserTabsLoop(ttTabIds, tabIds, (tabIndex-1));
		}, 0);
	}
}

function RearrangeTree(TTtabs, TTfolders, show_finish_in_status) {
	ShowStatusBar({show: true, spinner: true, message: "Rearranging tabs and folders"});
	document.querySelectorAll(".pin, .tab, .folder").forEach(function(Node) {
		let Sibling = Node.nextElementSibling;
		if (Sibling) {
			let NodeIndex = TTtabs[Node.id] ? TTtabs[Node.id].index : (TTfolders[Node.id] ? TTfolders[Node.id].index : undefined);
			while (Sibling && NodeIndex) {
				let SiblingIndex = TTtabs[Sibling.id] ? TTtabs[Sibling.id].index : (TTfolders[Sibling.id] ? TTfolders[Sibling.id].index : 0);
				if (NodeIndex > SiblingIndex) {
					InsterAfterNode(Node, Sibling);
				}
				Sibling = Sibling.nextElementSibling ? Sibling.nextElementSibling : false;
			}
		}
		if (show_finish_in_status) {
			ShowStatusBar({show: true, spinner: false, message: "Rearranging: done.", hideTimeout: 1000});
		}
	});
}

function AppendTab(p) { // tab: chrome tab object, ParentId: int or string, InsertAfterId: int or string, Append: bool, SkipSetEvents: bool, AdditionalClass: string, SkipSetActive: bool, Scroll: bool, addCounter: bool, SkipMediaIcon: bool
	if (document.getElementById(p.tab.id) != null) {
		GetFaviconAndTitle(p.tab.id, p.addCounter);
		return;
	}
	
	let ClassList = p.tab.pinned ? "pin" : "tab";
	if (p.tab.discarded) {
		ClassList += " discarded";
	}
		// console.log(p.tab.attention);
	if (p.tab.attention) {
		ClassList += " attention";
	}
	if (p.AdditionalClass) {
		ClassList += " "+p.AdditionalClass;
	}
	if (p.ExpandState) {
		ClassList += " "+p.ExpandState;
	}
	
	let DIVT = document.createElement("div"); // TAB DIV
		DIVT.className = ClassList;
		DIVT.id = p.tab.id;
		
	let DIVT_header = document.createElement("div"); // HEADER
		DIVT_header.className = (opt.always_show_close && !opt.never_show_close) ? "tab_header close_show" : "tab_header";
		DIVT_header.id = "tab_header"+p.tab.id;
		DIVT_header.draggable = !p.SkipSetEvents ? true : false;
		DIVT.appendChild(DIVT_header);
		
	let DIVT_expand = document.createElement("div"); // EXPAND ARROW
		DIVT_expand.className = "expand";
		DIVT_expand.id = "exp"+p.tab.id;
		DIVT_header.appendChild(DIVT_expand);
	
	let DIVT_counter = document.createElement("div"); // TABS COUNTER
		DIVT_counter.className = "tab_counter";
		DIVT_counter.id = "tab_counter"+p.tab.id;
		DIVT_header.appendChild(DIVT_counter);
		
	let DIVT_counter_number = document.createElement("div"); // TABS COUNTER NUMBER
		DIVT_counter_number.className = "counter_number";
		DIVT_counter_number.id = "counter_number"+p.tab.id;
		DIVT_counter.appendChild(DIVT_counter_number);
	
	let DIVT_title = document.createElement("div"); // TITLE
		DIVT_title.className = "tab_title";
		DIVT_title.id = "tab_title"+p.tab.id;
		DIVT_header.appendChild(DIVT_title);

	let DIVT_close_button = document.createElement("div"); // CLOSE BUTTON
		DIVT_close_button.className = "close";
		DIVT_close_button.id = "close"+p.tab.id;
		DIVT_header.appendChild(DIVT_close_button);
		
	let DIVT_close_image = document.createElement("div"); // CLOSE IMAGE IN CLOSE BUTTON
		DIVT_close_image.className = "close_img";
		DIVT_close_image.id = "close_img"+p.tab.id;
		DIVT_close_button.appendChild(DIVT_close_image);

	if (opt.never_show_close) {
		DIVT_close_button.classList.add("hidden");
		DIVT_close_image.classList.add("hidden");
	}


	let DIVT_audio_indicator = document.createElement("div"); // MEDIA AUDIO ICON
		DIVT_audio_indicator.className = "tab_mediaicon";
		DIVT_audio_indicator.id = "tab_mediaicon"+p.tab.id;
		DIVT_header.appendChild(DIVT_audio_indicator);
	
	let DIVT_children = document.createElement("div"); // CHILDREN HOLDER
		DIVT_children.className = "children";
		DIVT_children.id = "°"+p.tab.id;
		DIVT.appendChild(DIVT_children);
	
	let DIVT_drop_indicator = document.createElement("div"); // DROP TARGET INDICATOR
		DIVT_drop_indicator.className = "drag_indicator";
		DIVT_drop_indicator.id = "DIVT_drop_indicator"+p.tab.id;
		DIVT.appendChild(DIVT_drop_indicator);

	if (!p.SkipSetEvents) {
		DIVT_children.onclick = function(event) {
			if (event.target == this && event.which == 1) {
				Deselect();
			}
		}
		DIVT_children.onmousedown = function(event) {
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
		DIVT_children.ondblclick = function(event) {
			if (event.target == this) {
				ActionClickGroup(this.parentNode, opt.dbclick_group);
			}
		}
		DIVT_expand.onmousedown = function(event) {
			if (document.getElementById("main_menu").style.top != "-1000px") {
				HideMenus();
			}
			if (event.which == 1 && !event.shiftKey && !event.ctrlKey) {
				EventExpandBox(this.parentNode.parentNode);
			}
		}
		DIVT_expand.onmouseenter = function(event) {
			this.classList.add("hover");
		}
		DIVT_expand.onmouseleave = function(event) {
			this.classList.remove("hover");
		}
		
		if (!opt.never_show_close) {
			DIVT_close_button.onmousedown = function(event) {
				event.stopImmediatePropagation();
				if (event.which != 3) {
					CloseTabs([parseInt(this.parentNode.parentNode.id)]);
				}
			}
			DIVT_close_button.onmouseenter = function(event) {
				this.classList.add("close_hover");
			}
			DIVT_close_button.onmouseleave = function(event) {
				this.classList.remove("close_hover");
			}
		}

		DIVT_header.onclick = function(event) {
			event.stopImmediatePropagation();
			if (document.getElementById("main_menu").style.top != "-1000px") {
				HideMenus();
			} else {
				if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target.classList.contains("tab_header")) {
					Deselect();
					chrome.tabs.update(parseInt(this.parentNode.id), { active: true });
				}
			}
		}
		DIVT_header.ondblclick = function(event) {
			if (event.target.classList && event.target.classList.contains("tab_header")) {
				ActionClickTab(this.parentNode, opt.dbclick_tab);
			}
		}
		
		DIVT_header.onmousedown = function(event) {
			if (browserId == "V") {
				chrome.windows.getCurrent({populate: false}, function(window) {
					if (tt.CurrentWindowId != window.id && window.focused) {
						location.reload();
					}
				});
			}
			event.stopImmediatePropagation();
			if (event.which == 1) {
				Select(event, this.parentNode);
			}
			if (event.which == 2) {
				event.preventDefault();
				ActionClickTab(this.parentNode, opt.midclick_tab);
			}
			if (event.which == 3) {
				ShowTabMenu(this.parentNode, event);
			}
		}

		DIVT_header.onmouseover = function(event) {
			this.classList.add("tab_header_hover");
			if (opt.never_show_close == false && opt.always_show_close == false) {
				this.classList.add("close_show");
			}
		}
		DIVT_header.onmouseleave = function(event) {
			this.classList.remove("tab_header_hover");
			if (opt.never_show_close == false && opt.always_show_close == false) {
				this.classList.remove("close_show");
			}
		}
		
		DIVT_header.ondragstart = function(event) { // DRAG START
			TabStartDrag(this.parentNode, event);
		}

		DIVT_header.ondragenter = function(event) {
			this.classList.remove("tab_header_hover");
		}

		DIVT_header.ondragleave = function(event) {
			RemoveHighlight();
		}

		DIVT_header.ondragover = function(event) {
			
			
			// DragOverTreeNode(this, "tab", event);
			
			if (tt.DraggingGroup == false && this.parentNode.classList.contains("dragged_tree") == false) {
				DragOverTab(this, event);
			}
			
			
			
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

		DIVT_audio_indicator.onmousedown = function(event) {
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
	if (p.tab.pinned == true) {
		parent = document.getElementById("pin_list");
	} else {
		
		
		if (p.ParentId == false || p.ParentId == undefined || p.ParentId == "pin_list") {
			parent = document.getElementById("°"+tt.active_group);
			
		} else {
			
			parent = document.getElementById(p.ParentId);
			
			// if (parent == null || document.querySelector(".pin[id='"+p.ParentId+"']") != null || p.ParentId == "pin_list") {
			if (parent == null || parent.classList.contains("pin")  || parent.parentNode.classList.contains("pin")) {
				parent = document.getElementById("°"+tt.active_group);
			
			} else {
			
				parent = document.getElementById("°"+p.ParentId);
				if (parent.children.length == 0) {
					parent.parentNode.classList.add("o");
					parent.parentNode.classList.remove("c");
				}
				
			}
			
			
		}
		
		
		
	}
	if (p.Append == true && parent) {
		parent.appendChild(DIVT);
	}
	if ((p.Append == false || p.Append == undefined) && parent) {
		parent.prepend(DIVT);
	}

	if (p.InsertAfterId) {
		let After = document.getElementById(p.InsertAfterId);
		if (After != null) {
			if ((p.tab.pinned && After.classList.contains("pin")) || (p.tab.pinned == false && (After.classList.contains("tab") || After.classList.contains("folder")))) {
				InsterAfterNode(DIVT, After);
			} else {
				parent.appendChild(DIVT);
			}
		} else {
			parent.appendChild(DIVT);
		}
	}
	
	GetFaviconAndTitle(p.tab.id, p.addCounter);
	if (!p.SkipMediaIcon) {
		RefreshMediaIcon(p.tab.id);
	}
	if (p.RefreshDiscarded) {
		RefreshDiscarded(p.tab.id);
	}
	if (p.tab.active && !p.SkipSetActive) {
		SetActiveTab(p.tab.id);
	}
	if (p.Scroll) {
		ScrollToTab(p.tab.id);
	}
	
	return DIVT;
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
	let GroupList = document.getElementById("°"+tt.active_group);
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
			if (document.getElementById("°"+tabId).childNodes.length > 0) { // flatten out children
				let tabs = document.querySelectorAll("#°"+tabId+" .pin, #°"+tabId+" .tab");
				for (let i = tabs.length-1; i >= 0; i--) {
					tabs[i].classList.remove("tab");
					tabs[i].classList.remove("o");
					tabs[i].classList.remove("c");
					tabs[i].classList.add("pin");
					InsterAfterNode(tabs[i], Tab);
					chrome.tabs.update(parseInt(tabs[i].id), {pinned: true});
				}
				let folders = document.querySelectorAll("#°"+tabId+" .folder");
				for (let i = folders.length-1; i >= 0; i--) {
					GroupList.prepend(folders[i]);
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
		document.querySelectorAll(".selected").forEach(function(s) {
			s.classList.remove("selected");
		});
		// document.querySelectorAll(".pin, #"+tt.active_group+" .tab"+(TabGroup.length ? ", #"+TabGroup[0].id+" .tab" : "")).forEach(function(s) {
		document.querySelectorAll(".pin, #"+tt.active_group+" .tab").forEach(function(s) {
			s.classList.remove("active_tab");
			s.classList.remove("selected");
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
				Parents.forEach(function(s) {
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
	setTimeout(function() {
		tabsIds.forEach(function(tabId) {
			let tab = document.getElementById(tabId);
			if (tab != null && tab.classList.contains("pin") && opt.allow_pin_close) {
				tab.parentNode.removeChild(tab);
				chrome.tabs.update(tabId, {pinned: false});
				chrome.runtime.sendMessage({ command: "update_tab", tabId: tabId, tab: { parent: "pin_list" } });
			}
			if (tabId == tabsIds[tabsIds.length-1]) {
				setTimeout(function() {
					chrome.tabs.remove(tabsIds, null);
				}, 10);
				RefreshGUI();
			}
		});
	}, 200);
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
		// chrome.tabs.create({ title: "tescior", discarded: true, active: false, url: "https://www.google.com"}, function(tab) {
			// browser.sessions.setTabValue(tab.id, "CachedFaviconUrl", "data:image/x-icon;base64,AAABAAIAEBAAAAEAIABoBAAAJgAAACAgAAABACAAqBAAAI4EAAAoAAAAEAAAACAAAAABACAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///zD9/f2W/f392P39/fn9/f35/f391/39/ZT+/v4uAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v7+Cf39/Zn///////////////////////////////////////////39/ZX///8IAAAAAAAAAAAAAAAA/v7+Cf39/cH/////+v35/7TZp/92ul3/WKs6/1iqOv9yuFn/rNWd//j79v///////f39v////wgAAAAAAAAAAP39/Zn/////7PXp/3G3WP9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP+Or1j//vDo///////9/f2VAAAAAP///zD/////+vz5/3G3V/9TqDT/WKo6/6LQkf/U6cz/1urO/6rUm/+Zo0r/8IZB//adZ////v7///////7+/i79/f2Y/////4nWzf9Lqkj/Vqo4/9Xqzv///////////////////////ebY//SHRv/0hUL//NjD///////9/f2U/f392v////8sxPH/Ebzt/43RsP/////////////////////////////////4roL/9IVC//i1jf///////f391/39/fr/////Cr37/wW8+/+16/7/////////////////9IVC//SFQv/0hUL/9IVC//SFQv/3pnX///////39/fn9/f36/////wu++/8FvPv/tuz+//////////////////SFQv/0hUL/9IVC//SFQv/0hUL/96p7///////9/f35/f392/////81yfz/CrL5/2uk9v///////////////////////////////////////////////////////f392P39/Zn/////ks/7/zdS7P84Rur/0NT6///////////////////////9/f////////////////////////39/Zb+/v4y//////n5/v9WYu3/NUPq/ztJ6/+VnPT/z9L6/9HU+v+WnfT/Ul7t/+Hj/P////////////////////8wAAAAAP39/Z3/////6Or9/1hj7v81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v9sdvD////////////9/f2YAAAAAAAAAAD///8K/f39w//////5+f7/paz2/11p7v88Suv/Okfq/1pm7v+iqfX/+fn+///////9/f3B/v7+CQAAAAAAAAAAAAAAAP///wr9/f2d///////////////////////////////////////////9/f2Z/v7+CQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/jL9/f2Z/f392/39/fr9/f36/f392v39/Zj///8wAAAAAAAAAAAAAAAAAAAAAPAPAADAAwAAgAEAAIABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIABAACAAQAAwAMAAPAPAAAoAAAAIAAAAEAAAAABACAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/g3+/v5X/f39mf39/cj9/f3q/f39+f39/fn9/f3q/f39yP39/Zn+/v5W////DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/iT9/f2c/f399f/////////////////////////////////////////////////////9/f31/f39mv7+/iMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/gn9/f2K/f39+////////////////////////////////////////////////////////////////////////////f39+v39/Yf///8IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+/v4k/f390v////////////////////////////////////////////////////////////////////////////////////////////////39/dD///8iAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////MP39/er//////////////////////////+r05v+v16H/gsBs/2WxSf9Wqjj/Vqk3/2OwRv99vWX/pdKV/97u2P////////////////////////////39/ej+/v4vAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/iT9/f3q/////////////////////+v15/+Pxnv/VKk2/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/36+Z//d7tf///////////////////////39/ej///8iAAAAAAAAAAAAAAAAAAAAAAAAAAD///8K/f390//////////////////////E4bn/XKw+/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/1apN/+x0pv///////////////////////39/dD///8IAAAAAAAAAAAAAAAAAAAAAP39/Yv/////////////////////sdij/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP9TqDT/YKU1/8qOPv/5wZ////////////////////////39/YcAAAAAAAAAAAAAAAD+/v4l/f39+////////////////8Lgt/9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP9utlT/n86N/7faqv+426v/pdKV/3u8ZP9UqDX/U6g0/3egN//jiUH/9IVC//SFQv/82MP//////////////////f39+v7+/iMAAAAAAAAAAP39/Z3////////////////q9Ob/W6w+/1OoNP9TqDT/U6g0/1OoNP9nskz/zOXC/////////////////////////////////+Dv2v+osWP/8YVC//SFQv/0hUL/9IVC//WQVP/++fb//////////////////f39mgAAAAD+/v4O/f399v///////////////4LHj/9TqDT/U6g0/1OoNP9TqDT/dblc//L58P/////////////////////////////////////////////8+v/3p3f/9IVC//SFQv/0hUL/9IVC//rIqf/////////////////9/f31////DP7+/ln////////////////f9v7/Cbz2/zOwhv9TqDT/U6g0/2KwRv/v9+z///////////////////////////////////////////////////////738//1kFT/9IVC//SFQv/0hUL/9plg///////////////////////+/v5W/f39nP///////////////4jf/f8FvPv/Bbz7/yG1s/9QqDz/vN2w//////////////////////////////////////////////////////////////////rHqP/0hUL/9IVC//SFQv/0hUL//vDn//////////////////39/Zn9/f3L////////////////R878/wW8+/8FvPv/Bbz7/y7C5P/7/fr//////////////////////////////////////////////////////////////////ere//SFQv/0hUL/9IVC//SFQv/718H//////////////////f39yP39/ez///////////////8cwvv/Bbz7/wW8+/8FvPv/WNL8///////////////////////////////////////0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//rIqv/////////////////9/f3q/f39+v///////////////we9+/8FvPv/Bbz7/wW8+/993P3///////////////////////////////////////SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/+cGf//////////////////39/fn9/f36////////////////B737/wW8+/8FvPv/Bbz7/33c/f//////////////////////////////////////9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/6xaX//////////////////f39+f39/e3///////////////8cwvv/Bbz7/wW8+/8FvPv/WdP8///////////////////////////////////////0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//vVv//////////////////9/f3q/f39y////////////////0bN/P8FvPv/Bbz7/wW8+/8hrvn/+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////39/cj9/f2c////////////////ht/9/wW8+/8FvPv/FZP1/zRJ6/+zuPf//////////////////////////////////////////////////////////////////////////////////////////////////////////////////f39mf7+/lr////////////////d9v7/B7n7/yB38f81Q+r/NUPq/0hV7P/u8P3////////////////////////////////////////////////////////////////////////////////////////////////////////////+/v5X////D/39/ff///////////////9tkPT/NUPq/zVD6v81Q+r/NUPq/2Fs7//y8v7////////////////////////////////////////////09f7//////////////////////////////////////////////////f399f7+/g0AAAAA/f39n////////////////+Tm/P89Suv/NUPq/zVD6v81Q+r/NUPq/1Bc7f/IzPn/////////////////////////////////x8v5/0xY7P+MlPP////////////////////////////////////////////9/f2cAAAAAAAAAAD+/v4n/f39/P///////////////7W69/81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v9ZZe7/k5v0/6609/+vtff/lJv0/1pm7v81Q+r/NUPq/zVD6v+GjvL//v7//////////////////////////////f39+/7+/iQAAAAAAAAAAAAAAAD9/f2N/////////////////////6Cn9f81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v+BivL////////////////////////////9/f2KAAAAAAAAAAAAAAAAAAAAAP7+/gv9/f3V/////////////////////7W69/8+S+v/NUPq/zVD6v81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v81Q+r/P0zr/7q/+P///////////////////////f390v7+/gkAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/ib9/f3r/////////////////////+Xn/P94gfH/NkTq/zVD6v81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v81Q+r/NkTq/3Z/8f/l5/z///////////////////////39/er+/v4kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/jL9/f3r///////////////////////////k5vz/nqX1/2p08P9IVez/OEbq/zdF6v9GU+z/aHLv/5qh9f/i5Pz////////////////////////////9/f3q////MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/ib9/f3V/////////////////////////////////////////////////////////////////////////////////////////////////f390v7+/iQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wr9/f2N/f39/P///////////////////////////////////////////////////////////////////////////f39+/39/Yv+/v4JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+/v4n/f39n/39/ff//////////////////////////////////////////////////////f399v39/Z3+/v4lAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v7+Dv7+/lr9/f2c/f39y/39/e39/f36/f39+v39/ez9/f3L/f39nP7+/ln+/v4OAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AA///AAD//AAAP/gAAB/wAAAP4AAAB8AAAAPAAAADgAAAAYAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAABgAAAAcAAAAPAAAAD4AAAB/AAAA/4AAAf/AAAP/8AAP//wAP/");
		chrome.tabs.create({}, function(tab) {
			// browser.sessions.setTabValue(tab.id, "CachedFaviconUrl", "data:image/x-icon;base64,AAABAAIAEBAAAAEAIABoBAAAJgAAACAgAAABACAAqBAAAI4EAAAoAAAAEAAAACAAAAABACAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///zD9/f2W/f392P39/fn9/f35/f391/39/ZT+/v4uAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v7+Cf39/Zn///////////////////////////////////////////39/ZX///8IAAAAAAAAAAAAAAAA/v7+Cf39/cH/////+v35/7TZp/92ul3/WKs6/1iqOv9yuFn/rNWd//j79v///////f39v////wgAAAAAAAAAAP39/Zn/////7PXp/3G3WP9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP+Or1j//vDo///////9/f2VAAAAAP///zD/////+vz5/3G3V/9TqDT/WKo6/6LQkf/U6cz/1urO/6rUm/+Zo0r/8IZB//adZ////v7///////7+/i79/f2Y/////4nWzf9Lqkj/Vqo4/9Xqzv///////////////////////ebY//SHRv/0hUL//NjD///////9/f2U/f392v////8sxPH/Ebzt/43RsP/////////////////////////////////4roL/9IVC//i1jf///////f391/39/fr/////Cr37/wW8+/+16/7/////////////////9IVC//SFQv/0hUL/9IVC//SFQv/3pnX///////39/fn9/f36/////wu++/8FvPv/tuz+//////////////////SFQv/0hUL/9IVC//SFQv/0hUL/96p7///////9/f35/f392/////81yfz/CrL5/2uk9v///////////////////////////////////////////////////////f392P39/Zn/////ks/7/zdS7P84Rur/0NT6///////////////////////9/f////////////////////////39/Zb+/v4y//////n5/v9WYu3/NUPq/ztJ6/+VnPT/z9L6/9HU+v+WnfT/Ul7t/+Hj/P////////////////////8wAAAAAP39/Z3/////6Or9/1hj7v81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v9sdvD////////////9/f2YAAAAAAAAAAD///8K/f39w//////5+f7/paz2/11p7v88Suv/Okfq/1pm7v+iqfX/+fn+///////9/f3B/v7+CQAAAAAAAAAAAAAAAP///wr9/f2d///////////////////////////////////////////9/f2Z/v7+CQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/jL9/f2Z/f392/39/fr9/f36/f392v39/Zj///8wAAAAAAAAAAAAAAAAAAAAAPAPAADAAwAAgAEAAIABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIABAACAAQAAwAMAAPAPAAAoAAAAIAAAAEAAAAABACAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/g3+/v5X/f39mf39/cj9/f3q/f39+f39/fn9/f3q/f39yP39/Zn+/v5W////DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/iT9/f2c/f399f/////////////////////////////////////////////////////9/f31/f39mv7+/iMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/gn9/f2K/f39+////////////////////////////////////////////////////////////////////////////f39+v39/Yf///8IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+/v4k/f390v////////////////////////////////////////////////////////////////////////////////////////////////39/dD///8iAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////MP39/er//////////////////////////+r05v+v16H/gsBs/2WxSf9Wqjj/Vqk3/2OwRv99vWX/pdKV/97u2P////////////////////////////39/ej+/v4vAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/iT9/f3q/////////////////////+v15/+Pxnv/VKk2/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/36+Z//d7tf///////////////////////39/ej///8iAAAAAAAAAAAAAAAAAAAAAAAAAAD///8K/f390//////////////////////E4bn/XKw+/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/1apN/+x0pv///////////////////////39/dD///8IAAAAAAAAAAAAAAAAAAAAAP39/Yv/////////////////////sdij/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP9TqDT/YKU1/8qOPv/5wZ////////////////////////39/YcAAAAAAAAAAAAAAAD+/v4l/f39+////////////////8Lgt/9TqDT/U6g0/1OoNP9TqDT/U6g0/1OoNP9utlT/n86N/7faqv+426v/pdKV/3u8ZP9UqDX/U6g0/3egN//jiUH/9IVC//SFQv/82MP//////////////////f39+v7+/iMAAAAAAAAAAP39/Z3////////////////q9Ob/W6w+/1OoNP9TqDT/U6g0/1OoNP9nskz/zOXC/////////////////////////////////+Dv2v+osWP/8YVC//SFQv/0hUL/9IVC//WQVP/++fb//////////////////f39mgAAAAD+/v4O/f399v///////////////4LHj/9TqDT/U6g0/1OoNP9TqDT/dblc//L58P/////////////////////////////////////////////8+v/3p3f/9IVC//SFQv/0hUL/9IVC//rIqf/////////////////9/f31////DP7+/ln////////////////f9v7/Cbz2/zOwhv9TqDT/U6g0/2KwRv/v9+z///////////////////////////////////////////////////////738//1kFT/9IVC//SFQv/0hUL/9plg///////////////////////+/v5W/f39nP///////////////4jf/f8FvPv/Bbz7/yG1s/9QqDz/vN2w//////////////////////////////////////////////////////////////////rHqP/0hUL/9IVC//SFQv/0hUL//vDn//////////////////39/Zn9/f3L////////////////R878/wW8+/8FvPv/Bbz7/y7C5P/7/fr//////////////////////////////////////////////////////////////////ere//SFQv/0hUL/9IVC//SFQv/718H//////////////////f39yP39/ez///////////////8cwvv/Bbz7/wW8+/8FvPv/WNL8///////////////////////////////////////0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//rIqv/////////////////9/f3q/f39+v///////////////we9+/8FvPv/Bbz7/wW8+/993P3///////////////////////////////////////SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/+cGf//////////////////39/fn9/f36////////////////B737/wW8+/8FvPv/Bbz7/33c/f//////////////////////////////////////9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/6xaX//////////////////f39+f39/e3///////////////8cwvv/Bbz7/wW8+/8FvPv/WdP8///////////////////////////////////////0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//SFQv/0hUL/9IVC//vVv//////////////////9/f3q/f39y////////////////0bN/P8FvPv/Bbz7/wW8+/8hrvn/+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////39/cj9/f2c////////////////ht/9/wW8+/8FvPv/FZP1/zRJ6/+zuPf//////////////////////////////////////////////////////////////////////////////////////////////////////////////////f39mf7+/lr////////////////d9v7/B7n7/yB38f81Q+r/NUPq/0hV7P/u8P3////////////////////////////////////////////////////////////////////////////////////////////////////////////+/v5X////D/39/ff///////////////9tkPT/NUPq/zVD6v81Q+r/NUPq/2Fs7//y8v7////////////////////////////////////////////09f7//////////////////////////////////////////////////f399f7+/g0AAAAA/f39n////////////////+Tm/P89Suv/NUPq/zVD6v81Q+r/NUPq/1Bc7f/IzPn/////////////////////////////////x8v5/0xY7P+MlPP////////////////////////////////////////////9/f2cAAAAAAAAAAD+/v4n/f39/P///////////////7W69/81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v9ZZe7/k5v0/6609/+vtff/lJv0/1pm7v81Q+r/NUPq/zVD6v+GjvL//v7//////////////////////////////f39+/7+/iQAAAAAAAAAAAAAAAD9/f2N/////////////////////6Cn9f81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v+BivL////////////////////////////9/f2KAAAAAAAAAAAAAAAAAAAAAP7+/gv9/f3V/////////////////////7W69/8+S+v/NUPq/zVD6v81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v81Q+r/P0zr/7q/+P///////////////////////f390v7+/gkAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/ib9/f3r/////////////////////+Xn/P94gfH/NkTq/zVD6v81Q+r/NUPq/zVD6v81Q+r/NUPq/zVD6v81Q+r/NkTq/3Z/8f/l5/z///////////////////////39/er+/v4kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/jL9/f3r///////////////////////////k5vz/nqX1/2p08P9IVez/OEbq/zdF6v9GU+z/aHLv/5qh9f/i5Pz////////////////////////////9/f3q////MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/ib9/f3V/////////////////////////////////////////////////////////////////////////////////////////////////f390v7+/iQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wr9/f2N/f39/P///////////////////////////////////////////////////////////////////////////f39+/39/Yv+/v4JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+/v4n/f39n/39/ff//////////////////////////////////////////////////////f399v39/Z3+/v4lAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v7+Dv7+/lr9/f2c/f39y/39/e39/f36/f39+v39/ez9/f3L/f39nP7+/ln+/v4OAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AA///AAD//AAAP/gAAB/wAAAP4AAAB8AAAAPAAAADgAAAAYAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAABgAAAAcAAAAPAAAAD4AAAB/AAAA/4AAAf/AAAP/8AAP//wAP/");
			
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
		let PrevActiveTabId = parseInt(tt.groups[tt.active_group].prev_active_tab);
		if (isNaN(PrevActiveTabId) == false) {
			chrome.tabs.update(PrevActiveTabId, {active: true});
		}
	}
}





function TabStartDrag(Node, event) {
	event.stopPropagation();
	event.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
	event.dataTransfer.setData("text", "");
	event.dataTransfer.setData("SourceWindowId", tt.CurrentWindowId);

	CleanUpDragClasses();
	EmptyDragAndDrop();

	tt.DragNodeClass = "tree";
	let Nodes = [];
	
	if (Node.classList.contains("selected")) {
		FreezeSelection(false);
	} else {
		FreezeSelection(true);
		Node.classList.add("selected_temporarly");
		Node.classList.add("selected");
	}
	
	RemoveHeadersHoverClass();

	document.querySelectorAll("[id='"+Node.id+"'], [id='"+Node.id+"'] .tab, [id='"+Node.id+"'] .folder").forEach(function(s) {
		s.classList.add("dragged_tree");
	});
	
			// console.log(GetTabDepthInTree(Node));
	
	// if (opt.max_tree_drag_drop || opt.max_tree_depth >= 0) {
	if (opt.max_tree_drag_drop && opt.max_tree_depth >= 0) {
		document.querySelectorAll(".dragged_tree .tab, .dragged_tree .folder").forEach(function(s) {
			
			let parents = GetParentsByClass(s.parentNode, "dragged_tree");
			
			
			if (parents.length > tt.DragTreeDepth) {
				tt.DragTreeDepth = parents.length;
			}
		});
	} else {
		tt.DragTreeDepth = -1;
	}
	
	// REST OF SELECTION THAT WILL BE DRAGGED
	document.querySelectorAll(".selected, .selected .tab, .selected .folder").forEach(function(s) {
		s.classList.add("dragged_tree");
	});
	
	document.querySelectorAll(".dragged_tree").forEach(function(s) {
		if (s.classList.contains("tab")) {
			tt.DraggingTab = true;
		}
		if (s.classList.contains("folder")) {
			tt.DraggingFolder = true;
		}
		if (s.classList.contains("pin")) {
			tt.DraggingPin = true;
		}
		Nodes.push({
			id: s.id,
			parent: s.parentNode.id,
			selected: (s.classList.contains("selected") || s.classList.contains("selected")),
			temporary: s.classList.contains("selected_temporarly"),
			NodeClass: (s.classList.contains("tab") ? "tab" : (s.classList.contains("pin") ? "pin" : "folder"))
		});
	});
	
	
	// let DraggedFolderParents = GetParentsByClass(Node, "folder");
	// DraggedFolderParents.forEach(function(s) {
		// s.classList.add("dragged_parents");
	// });
	// let DraggedParents = GetParentsByClass(Node, "tab");
	// DraggedParents.forEach(function(s) {
		// s.classList.add("dragged_parents");
	// });
	

	// DragAndDropData = {TabsIds: TabsIds, TabsIdsParents: TabsIdsParents, TabsIdsSelected: TabsIdsSelected};
	
	event.dataTransfer.setData("Class", "tree");
	event.dataTransfer.setData("Nodes", JSON.stringify(Nodes));

	chrome.runtime.sendMessage({
		command: "drag_drop",
		DragNodeClass: "tree",
		DragTreeDepth: tt.DragTreeDepth
	});
	
}


function GetTabDepthInTree(Node) {
	let Depth = 0;
	let ParentNode = Node;
	if (ParentNode == null) {
		return Parents;
	}
	let Stop = false;
	while (!Stop && ParentNode.parentNode != null) {
		if (ParentNode.parentNode.classList != undefined) {
			if (ParentNode.parentNode.classList.contains("tab")) {
				Depth++;
			}
			if (ParentNode.parentNode.classList.contains("folder") || ParentNode.parentNode.classList.contains("group")) {
				Stop = true;
			} else {
				ParentNode = ParentNode.parentNode;
			}
		} else {
			Stop = true;
		}
	}
	return Depth;
}


function DragOverTab(Node, event) {
	
	// let Nodes = event.dataTransfer.getData("Nodes") ? JSON.parse(event.dataTransfer.getData("Nodes")) : "shit";
	
	
	// console.log(Nodes);
	
	
	
		// DraggingPin: false,
	// DraggingTab: false,
	// DraggingFolder: false,

	
	
	
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
		
		
		// let ParentsTabs = GetParentsByClass(Node, "tab");
		let TabDepth = GetTabDepthInTree(Node);

		// let ParentsFolders = GetParentsByClass(Node, "folder");
		
		// let PDepth = ParentsTabs.length + ParentsFolders.length + tt.DragTreeDepth;
		let PDepth = TabDepth + tt.DragTreeDepth;
		
		
		let PIsGroup = Node.parentNode.parentNode.parentNode.classList.contains("group");
		let PIsTab = Node.parentNode.parentNode.parentNode.classList.contains("tab");
		let PIsFolder = Node.parentNode.parentNode.parentNode.classList.contains("folder");
		// let PIsDraggedParents = Node.parentNode.classList.contains("dragged_parents");
		// console.log(PIsGroup);
		
		
		
		
		if (  (PIsFolder == tt.DraggingFolder || tt.DraggingFolder == false || PIsGroup == true)
			&& Node.parentNode.classList.contains("before") == false
			&& event.layerY < Node.clientHeight/3
			&& (PDepth <= opt.max_tree_depth+1 || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false)
		) {
			RemoveHighlight();
			Node.parentNode.classList.remove("inside");
			Node.parentNode.classList.remove("after");
			Node.parentNode.classList.add("before");
			Node.parentNode.classList.add("highlighted_drop_target");
		}
		
		
		if (tt.DraggingFolder == false
			&& Node.parentNode.classList.contains("inside") == false
			&& event.layerY > Node.clientHeight/3
			&& event.layerY <= 2*(Node.clientHeight/3)
			&& (PDepth <= opt.max_tree_depth || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false)
		) {
			RemoveHighlight();
			Node.parentNode.classList.remove("before");
			Node.parentNode.classList.remove("after");
			Node.parentNode.classList.add("inside");
			Node.parentNode.classList.add("highlighted_drop_target");
		}
		
		
		if ( (PIsFolder == tt.DraggingFolder || tt.DraggingFolder == false || PIsGroup == true)
			&& Node.parentNode.classList.contains("after") == false
			&& Node.parentNode.classList.contains("o") == false
			&& event.layerY > 2*(Node.clientHeight/3)
			&& (PDepth <= opt.max_tree_depth+1 || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false)
		) {
			RemoveHighlight();
			Node.parentNode.classList.remove("inside");
			Node.parentNode.classList.remove("before");
			Node.parentNode.classList.add("after");
			Node.parentNode.classList.add("highlighted_drop_target");
		}
		
		
		
	}
}
