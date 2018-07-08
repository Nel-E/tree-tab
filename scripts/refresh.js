// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********          REFRESH GUI          ***************

async function RefreshGUI() {
	let toolbar = document.getElementById("toolbar");
	let toolbarHeight = 27;
	if (toolbar.children.length > 0) {
		toolbar.style.height = "";
		toolbar.style.width = "";
		toolbar.style.display = "";
		toolbar.style.border = "";
		toolbar.style.padding = "";
		if (document.querySelector(".on.button") != null) {
			toolbar.style.height = "53px";
			toolbarHeight = 54;
		} else {
			toolbar.style.height = "26px";
		}
	} else {
		toolbar.style.height = "0px";
		toolbarHeight = 0;
		toolbar.style.width = "0px";
		toolbar.style.display = "none";
		toolbar.style.border = "none";
		toolbar.style.padding = "0";
	}
	
	let group_list = document.getElementById("group_list");
	group_list.style.width = document.body.clientWidth + 50 + "px";
	
	let pin_list = document.getElementById("pin_list");
	if (pin_list.children.length > 0) {
		pin_list.style.top = toolbarHeight + "px";
		pin_list.style.height = "";
		pin_list.style.width = "";
		pin_list.style.display = "";
		pin_list.style.border = "";
		pin_list.style.padding = "";
	} else {
		pin_list.style.top = "0px";
		pin_list.style.height = "0px";
		pin_list.style.width = "0px";
		pin_list.style.display = "none";
		pin_list.style.border = "none";
		pin_list.style.padding = "0";
	}
	let pin_listHeight = pin_list.getBoundingClientRect().height;

	let toolbar_groups = document.getElementById("toolbar_groups");
	toolbar_groups.style.top = toolbarHeight + pin_listHeight + "px";
	toolbar_groups.style.height = document.body.clientHeight - toolbarHeight - pin_listHeight + "px";
	let toolbar_groupsWidth = toolbar_groups.getBoundingClientRect().width;

	if (opt.show_counter_groups) {
		document.querySelectorAll(".group").forEach(function(s){
			let groupLabel = document.getElementById("_gte"+s.id);
			if (groupLabel) {
				groupLabel.textContent = (tt.groups[s.id] ? tt.groups[s.id].name : labels.noname_group) + " (" + document.querySelectorAll("#"+s.id+" .tab").length + ")";
			}
		});
	} else {
		document.querySelectorAll(".group").forEach(function(s){
			let groupLabel = document.getElementById("_gte"+s.id);
			if (groupLabel) {
				groupLabel.textContent = tt.groups[s.id] ? tt.groups[s.id].name : labels.noname_group;
			}
		});
	}
	document.querySelectorAll(".group_button").forEach(function(s){
		s.style.height = s.firstChild.getBoundingClientRect().height + "px";
	});
	let groups = document.getElementById("groups");
	let groupsHeight = document.body.clientHeight - toolbarHeight - pin_listHeight;
	let groupsWidth =  document.body.clientWidth - toolbar_groupsWidth - 1;

	groups.style.top = toolbarHeight + pin_listHeight + "px";
	groups.style.left = toolbar_groupsWidth + "px";
	groups.style.height = groupsHeight + "px";
	groups.style.width = groupsWidth + "px";

	// let bottom_floating_buttons = document.getElementById("status_bar");
	// let active_group_tabs = document.getElementById("ct"+tt.active_group);
	// bottom_floating_buttons.style.left = toolbar_groupsWidth + "px";
	// bottom_floating_buttons.style.width = toolbar_groupsWidth + active_group_tabs.clientWidth + "px";
	
	
	let PanelList = document.querySelector(".mw_pan_on>.manager_window_list");
	let PanelListHeight = 3 + PanelList.children.length * 18;
	
	let ManagerWindowPanelButtons = document.querySelector(".mw_pan_on>.manager_window_panel_buttons");
	let ManagerWindowPanelButtonsHeight = ManagerWindowPanelButtons.clientHeight;
	
	let MaxAllowedHeight = document.body.clientHeight - 140;

	
	if (PanelListHeight + ManagerWindowPanelButtonsHeight < MaxAllowedHeight) {
		PanelList.style.height = PanelListHeight + "px";
	} else {
		PanelList.style.height = MaxAllowedHeight - ManagerWindowPanelButtonsHeight + "px";
	}
	
	
	let ManagerWindow = document.getElementById("manager_window");
	ManagerWindow.style.height = PanelList.clientHeight + ManagerWindowPanelButtonsHeight + 56 + "px";
}

// set discarded class
function RefreshDiscarded(tabId) {
	let t = document.getElementById(tabId);
	if (t != null) {
		chrome.tabs.get(parseInt(tabId), function(tab) {
			if (tab) {
				if (tab.discarded) {
					t.classList.add("discarded");
				} else {
					t.classList.remove("discarded");
					t.classList.remove("audible");
					t.classList.remove("muted");
				}
			}
		});
	}
}

// set discarded class
function SetAttentionIcon(tabId) {
	let t = document.getElementById(tabId);
	if (t != null) {
		t.classList.add("attention");
	}
}

// change media icon
function RefreshMediaIcon(tabId) {
	let t = document.getElementById(tabId);
	if (t != null) {
		chrome.tabs.get(parseInt(tabId), function(tab) {
			if (tab) {
				if (tab.mutedInfo.muted && !tab.discarded) {
					t.classList.remove("audible");
					t.classList.add("muted");
				}
				if (!tab.mutedInfo.muted && tab.audible && !tab.discarded) {
					t.classList.remove("muted");
					t.classList.add("audible");
				}
				if ((!tab.mutedInfo.muted && !tab.audible) || tab.discarded) {
					t.classList.remove("audible");
					t.classList.remove("muted");
				}
			}
		});
	}
}


// Vivaldi does not have changeInfo.audible listener, this is my own implementation, hopefully this will not affect performance too much
function VivaldiRefreshMediaIcons() {
	setInterval(function() {
		chrome.tabs.query({currentWindow: true, audible: true}, function(tabs) {
			document.querySelectorAll(".audible, .muted").forEach(function(s){
				s.classList.remove("audible");
				s.classList.remove("muted");
			});
			let tc = tabs.length;
			for (var ti = 0; ti < tc; ti++) {
				if (tabs[ti].audible) {
					document.getElementById(tabs[ti].id).classList.add("audible");
				}
				if (tabs[ti].mutedInfo.muted) {
					document.getElementById(tabs[ti].id).classList.add("muted");
				}
			}
		});
	}, 2000);
}

async function LoadFavicon(tabId, Img, TryUrls, TabHeaderNode, i) {
	if (TabHeaderNode){
		Img.src = TryUrls[i];
		Img.onload = function() {
			TabHeaderNode.style.backgroundImage = "url(" + TryUrls[i] + ")";
			if (browserId == "F") { // cache Firefox favicon - solution for bug with empty favicons in unloaded tabs
				browser.sessions.setTabValue(tabId, "CachedFaviconUrl", TryUrls[i]);
			}
		};
		Img.onerror = function() {
			if (i < TryUrls.length) {
				LoadFavicon(tabId, Img, TryUrls, TabHeaderNode, (i+1));
			}
		}
	}
}

async function GetFaviconAndTitle(tabId, addCounter) {
	let t = document.getElementById(tabId);
	if (t != null) {
		
		let CachedFavicon;
		if (browserId == "F") {
			let ttf = Promise.resolve(browser.sessions.getTabValue(tabId, "CachedFaviconUrl")).then(function(FaviconUrl) {
				CachedFavicon = FaviconUrl;
			});
		}
		
		chrome.tabs.get(parseInt(tabId), function(tab) {
			if (tab){
				let title = tab.title ? tab.title : tab.url;
				let tHeader = t.childNodes[0];
				let tTitle = t.childNodes[0].childNodes[2];
				if (tab.status == "complete" || tab.discarded) {
					t.classList.remove("loading");

					tTitle.textContent = title;
					tHeader.title = title;
					if (opt.show_counter_tabs_hints) {
						tHeader.setAttribute("tabTitle", title);
					}
	
					let Img = new Image();

					if (browserId != "F") {
						CachedFavicon = "chrome://favicon/"+tab.url;
					}
					let TryCases = [tab.favIconUrl, CachedFavicon, , "./theme/icon_empty.svg"];
					LoadFavicon(tabId, Img, TryCases, tHeader, 0);

				}
				if (tab.status == "loading" && tab.discarded == false) {
					title = tab.title ? tab.title : labels.loading;
					t.classList.add("loading");
					tHeader.style.backgroundImage = "";
					tHeader.title = labels.loading;
					if (opt.show_counter_tabs_hints) {
						tHeader.setAttribute("tabTitle", labels.loading);
					}
					tTitle.textContent = labels.loading;
					setTimeout(function() {
						if (document.getElementById(tab.id) != null) GetFaviconAndTitle(tab.id, addCounter);
					}, 1000);
				}
				if (addCounter && (opt.show_counter_tabs || opt.show_counter_tabs_hints)) {
					RefreshTabCounter(tabId);
				}
			}
		});
	}
}

// refresh open closed trees states
async function RefreshExpandStates() {
	document.querySelectorAll("#"+tt.active_group+" .folder").forEach(function(s){
		if (s.childNodes[1].children.length == 0 && s.childNodes[2].children.length == 0) {
			s.classList.remove("o");
			s.classList.remove("c");
		} else {
			if (s.classList.contains("o") == false && s.classList.contains("c") == false) {
				s.classList.add("o");
			}
		}
	});
	document.querySelectorAll("#"+tt.active_group+" .tab").forEach(function(s){
		if (s.childNodes[1].children.length == 0) {
			s.classList.remove("o");
			s.classList.remove("c");
		} else {
			if (s.classList.contains("o") == false && s.classList.contains("c") == false) {
				s.classList.add("o");
			}
		}
	});
}

async function RefreshCounters() {
	if (opt.show_counter_tabs || opt.show_counter_tabs_hints) {
		// if (opt.show_counter_tabs_hints) {
			// document.querySelectorAll("#"+tt.active_group+" .tab").forEach(function(s){
				// let title = s.childNodes[0].getAttribute("tabTitle");
				// if (title != null) {
					// s.childNodes[0].title = title;
					// s.childNodes[0].childNodes[1].textContent = title;
				// }
			// });
		// }
		
		document.querySelectorAll("#"+tt.active_group+" .o.tab, #"+tt.active_group+" .c.tab").forEach(function(s){
			if (opt.show_counter_tabs) {
				s.childNodes[0].childNodes[1].childNodes[0].textContent = document.querySelectorAll("[id='" + s.id + "'] .tab").length;
			}
			if (opt.show_counter_tabs_hints) {
				let title = s.childNodes[0].getAttribute("tabTitle");
				s.childNodes[0].title = (document.querySelectorAll("[id='" + s.id + "'] .tab").length +" • ") + title;
			}
		});
		// ·
		document.querySelectorAll("#"+tt.active_group+" .folder").forEach(function(s){
			if (opt.show_counter_tabs && tt.folders[s.id]) {
				s.childNodes[0].childNodes[1].childNodes[0].textContent = document.querySelectorAll("[id='" + s.id + "'] .tab").length;
			}
			if (opt.show_counter_tabs_hints && tt.folders[s.id]) {
				s.childNodes[0].title = (document.querySelectorAll("[id='" + s.id + "'] .tab").length +" • ") + tt.folders[s.id].name;
			}
		});
	}
}

async function RefreshTabCounter(tabId) {
	let t = document.getElementById(tabId);
	if (t != null && t.childNodes[0]) {
		let title = t.childNodes[0].getAttribute("tabTitle");
		if (t != null && title != null) {
			if (t.classList.contains("o") || t.classList.contains("c")) {
				if (opt.show_counter_tabs) {
					t.childNodes[0].childNodes[1].childNodes[0].textContent = document.querySelectorAll("[id='" + t.id + "'] .tab").length;
				}
				if (opt.show_counter_tabs_hints) {
					t.childNodes[0].title = (document.querySelectorAll("[id='" + t.id + "'] .tab").length +" • ") + title;
				}
			} else {
				t.childNodes[0].title = title;
			}
		}
	}
}
