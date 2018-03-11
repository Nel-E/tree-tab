// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********          REFRESH GUI          ***************

function RefreshGUI() {
	let toolbar = document.getElementById("toolbar");
	if (toolbar.children.length > 0) {
		toolbar.style.height = "";
		toolbar.style.width = "";
		toolbar.style.display = "";
		toolbar.style.border = "";
		toolbar.style.padding = "";
		if (document.querySelector(".on.button") != null) {
			toolbar.style.height = "53px";
		} else {
			toolbar.style.height = "26px";
		}
	} else {
		toolbar.style.height = "0px";
		toolbar.style.width = "0px";
		toolbar.style.display = "none";
		toolbar.style.border = "none";
		toolbar.style.padding = "0";
	}
	let pin_list = document.getElementById("pin_list");
	if (pin_list.children.length > 0) {
		pin_list.style.top = toolbar.getBoundingClientRect().height + "px";
		pin_list.style.height = "";
		pin_list.style.width = document.body.clientWidth + "px";;
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
	let toolbar_groups = document.getElementById("toolbar_groups");
	toolbar_groups.style.top = toolbar.getBoundingClientRect().height + pin_list.getBoundingClientRect().height + "px";
	toolbar_groups.style.height = document.body.clientHeight - toolbar.getBoundingClientRect().height - pin_list.getBoundingClientRect().height + "px";
	if (opt.show_counter_groups) {
		document.querySelectorAll(".group").forEach(function(s){
			let groupLabel = document.getElementById("_gte"+s.id);
			if (groupLabel) {
				groupLabel.textContent = (bggroups[s.id] ? bggroups[s.id].name : caption_noname_group) + " (" + document.querySelectorAll("#"+s.id+" .tab").length + ")";
			}
		});
	} else {
		document.querySelectorAll(".group").forEach(function(s){
			let groupLabel = document.getElementById("_gte"+s.id);
			if (groupLabel) {
				groupLabel.textContent = bggroups[s.id] ? bggroups[s.id].name : caption_noname_group;
			}
		});
	}
	document.querySelectorAll(".group_button").forEach(function(s){
		s.style.height = s.firstChild.getBoundingClientRect().height + "px";
	});
	let groups = document.getElementById("groups");
	groups.style.top = toolbar.getBoundingClientRect().height + pin_list.getBoundingClientRect().height + "px";
	groups.style.left = toolbar_groups.getBoundingClientRect().width + "px";
	groups.style.height = document.body.clientHeight - pin_list.getBoundingClientRect().height - toolbar.getBoundingClientRect().height + "px";
	groups.style.width = document.body.clientWidth - toolbar_groups.getBoundingClientRect().width + 1 + "px";
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
				if (tab.mutedInfo.muted) {
					t.classList.remove("audible");
					t.classList.add("muted");
				}
				if (!tab.mutedInfo.muted && tab.audible) {
					t.classList.remove("muted");
					t.classList.add("audible");
				}
				if (!tab.mutedInfo.muted && !tab.audible) {
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
		chrome.tabs.query({currentWindow: true}, function(tabs) {
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
	// }, 1400);
	}, 1000);
}

function GetFaviconAndTitle(tabId, addCounter) {
	let t = document.getElementById(tabId);
	if (t != null) {
		chrome.tabs.get(parseInt(tabId), function(tab) {
			if (tab){
				let title = tab.title ? tab.title : tab.url;
				let tHeader = t.childNodes[3];
				let tTitle = tHeader.childNodes[1];
				if (tab.status == "complete") {
					t.classList.remove("loading");
					// change title
					tTitle.textContent = title;
					tHeader.title = title;
					tHeader.setAttribute("tabTitle", title);
					// compatibility with various Tab suspender extensions
					if (tab.favIconUrl != undefined && tab.favIconUrl.match("data:image/png;base64") != null) {
						tHeader.style.backgroundImage = "url(" + tab.favIconUrl + ")";
					} else {
						// case for internal pages, favicons don't have access, but can be loaded from url
						if (tab.url.match("opera://|vivaldi://|browser://|chrome://|chrome-extension://") != null) {
							tHeader.style.backgroundImage = "url(chrome://favicon/" + tab.url + ")";
						} else {
							// change favicon
							let img = new Image();
							img.src = tab.favIconUrl;
							img.onload = function() {
								tHeader.style.backgroundImage = "url(" + tab.favIconUrl + ")";
							};
							img.onerror = function() {
								tHeader.style.backgroundImage = ((tab.url == "" || browserId == "F") ? "url(./theme/icon_empty.svg)" : ("url(chrome://favicon/" + tab.url + ")"));
								// "url(" + tab.url + ")"
							}
						}
					}
				}
				if (tab.status == "loading") {
					title = tab.title ? tab.title : caption_loading;
					t.classList.add("loading");
					tHeader.style.backgroundImage = "";
					tHeader.title = caption_loading;
					tHeader.setAttribute("tabTitle", caption_loading);
					tTitle.textContent = caption_loading;
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
function RefreshExpandStates() {
	document.querySelectorAll("#"+active_group+" .folder").forEach(function(s){
		if (s.childNodes[4].children.length == 0 && s.childNodes[5].children.length == 0) {
			s.classList.remove("o");
			s.classList.remove("c");
		} else {
			if (s.classList.contains("o") == false && s.classList.contains("c") == false) {
				s.classList.add("o");
			}
		}
	});
	document.querySelectorAll("#"+active_group+" .tab").forEach(function(s){
		if (s.childNodes[4].children.length == 0) {
			s.classList.remove("o");
			s.classList.remove("c");
		} else {
			if (s.classList.contains("o") == false && s.classList.contains("c") == false) {
				s.classList.add("o");
			}
		}
	});
}

function RefreshCounters() {
	if (opt.show_counter_tabs || opt.show_counter_tabs_hints) {
		document.querySelectorAll("#"+active_group+" .tab").forEach(function(s){
			let title = s.childNodes[3].getAttribute("tabTitle");
			if (title != null) {
				s.childNodes[3].title = title;
				s.childNodes[3].childNodes[1].textContent =title;
			}
		});
		document.querySelectorAll("#"+active_group+" .o.tab, #"+active_group+" .c.tab").forEach(function(s){
			let title = s.childNodes[3].getAttribute("tabTitle");

			if (opt.show_counter_tabs && title != null) {
				s.childNodes[3].childNodes[1].textContent = ("("+ document.querySelectorAll("[id='" + s.id + "'] .tab").length +") ") + title;
			}
			if (opt.show_counter_tabs_hints) {
				s.childNodes[3].title = ("("+ document.querySelectorAll("[id='" + s.id + "'] .tab").length +") ") + title;
			}
		});
		
		
		document.querySelectorAll("#"+active_group+" .folder").forEach(function(s){
			if (opt.show_counter_tabs && bgfolders[s.id]) {
				s.childNodes[3].childNodes[1].textContent = ("("+ document.querySelectorAll("[id='" + s.id + "'] .tab").length +") ") + bgfolders[s.id].name;
			}
			if (opt.show_counter_tabs_hints && bgfolders[s.id]) {
				s.childNodes[3].title = ("("+ document.querySelectorAll("[id='" + s.id + "'] .tab").length +") ") + bgfolders[s.id].name;
			}
		});
	}
}

function RefreshTabCounter(tabId) {
	let t = document.getElementById(tabId);
	let title = t.childNodes[3].getAttribute("tabTitle");
	if (t != null && title != null) {
		if (t.classList.contains("o") || t.classList.contains("c")) {
			if (opt.show_counter_tabs) {
				t.childNodes[3].childNodes[1].textContent = ("("+ document.querySelectorAll("[id='" + t.id + "'] .tab").length +") ") + title;
			}
			if (opt.show_counter_tabs_hints) {
				t.childNodes[3].title = ("("+ document.querySelectorAll("[id='" + t.id + "'] .tab").length +") ") + title;
			}
		} else {
				t.childNodes[3].title = title;
				t.childNodes[3].childNodes[1].textContent = title;
		}
	}
}
