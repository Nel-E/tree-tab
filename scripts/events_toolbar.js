// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********             TOOLBAR           ***************



function RestoreToolbarSearchFilter() {
	let filter_type = "url";
	if (localStorage.getItem("filter_type") !== null) {
		filter_type = localStorage["filter_type"];
	}
	if (filter_type == "url") {
		$("#button_filter_type").addClass("url").removeClass("title");
	} else {
		$("#button_filter_type").addClass("title").removeClass("url");
	}
}	

function RestoreToolbarShelf() {
	chrome.runtime.sendMessage({command: "get_active_shelf", windowId: CurrentWindowId}, function(response) {
		$("#filter_box").attr("placeholder", caption_searchbox);
		$("#filter_box").css({"opacity": 1});
		
		$(".on").removeClass("on");
		$(".toolbar_shelf").addClass("hidden");
		if (response == "search" && $("#button_search").length != 0) {
			$("#toolbar_search").removeClass("hidden");
			$("#button_search").addClass("on");
		}
		if (response == "tools" && $("#button_tools").length != 0) {
			$("#toolbar_shelf_tools").removeClass("hidden");
			$("#button_tools").addClass("on");
		}
		if (response == "groups" && $("#button_groups").length != 0) {
			$("#toolbar_shelf_groups").removeClass("hidden");
			$("#button_groups").addClass("on");
		}
		if (response == "folders" && $("#button_folders").length != 0) {
			$("#button_folders").removeClass("hidden");
			$("#button_folders").addClass("on");
		}
		RefreshGUI();
	});
}

function SetToolbarShelfToggle(click_type) {
	// tools and search buttons toggle
	$(document).on(click_type, "#button_tools, #button_search, #button_groups, #button_folders", function(event) {
		if (event.button != 0) {
			return;
		}
		if ($(this).is(".on")) {
			$(".on").removeClass("on");
			$(".toolbar_shelf").addClass("hidden");
			chrome.runtime.sendMessage({command: "set_active_shelf", active_shelf: "", windowId: CurrentWindowId});
		} else {
			$(".toolbar_shelf").addClass("hidden");
			if ($(this).is("#button_tools")) {
				$("#toolbar_shelf_tools").removeClass("hidden");
				chrome.runtime.sendMessage({command: "set_active_shelf", active_shelf: "tools", windowId: CurrentWindowId});
			}
			if ($(this).is("#button_search")) {
				$("#toolbar_search").removeClass("hidden");
				chrome.runtime.sendMessage({command: "set_active_shelf", active_shelf: "search", windowId: CurrentWindowId});
			}
			if ($(this).is("#button_groups")) {
				$("#toolbar_shelf_groups").removeClass("hidden");
				chrome.runtime.sendMessage({command: "set_active_shelf", active_shelf: "groups", windowId: CurrentWindowId});
			}
			if ($(this).is("#button_folders")) {
				$("#toolbar_shelf_folders").removeClass("hidden");
				chrome.runtime.sendMessage({command: "set_active_shelf", active_shelf: "folders", windowId: CurrentWindowId});
			}
			$(".button").removeClass("on");
			$(this).addClass("on");
		}
		RefreshGUI();
	});
}


function SetToolbarEvents() {
	// go to previous or next search result
	$(document).on("mousedown", "#filter_search_go_prev, #filter_search_go_next", function(event) {
		if (event.button != 0 || $(".tab.filtered").length == 0) {
			return;
		}
		
		if ($(this).is("#filter_search_go_prev")){
			if (SearchIndex == 0) {
				SearchIndex = $(".tab.filtered").length-1;
			} else {
				SearchIndex--;
			}
		} else {
			if (SearchIndex == $(".tab.filtered").length-1) {
				SearchIndex = 0;
			} else {
				SearchIndex++;
			}
		}
		$(".highlighted_search").removeClass("highlighted_search");
		$($(".tab.filtered")[SearchIndex]).addClass("highlighted_search");
		ScrollToTab($(".tab.filtered")[SearchIndex].id);
	});

	// new tab
	$(document).on("mousedown", "#button_new", function(event) {
		if (event.button == 0) {
			chrome.tabs.create({});
		}
		if (event.button == 1 && $(".active:visible")[0]) {
			chrome.tabs.duplicate(parseInt($(".active:visible")[0].id), function(tab) {
				setTimeout(function() {
					$("#"+tab.id).insertAfter($(".active:visible")[0]);
					RefreshExpandStates();
					schedule_update_data++;
				}, 100);
			});
		}
		if (event.button == 2 && $(".active:visible")[0]) {
			ScrollToTab($(".active:visible")[0].id);
		}
	});
	// pin tab
	$(document).on("mousedown", "#button_pin", function(event) {
		if (event.button != 0) {
			return;
		}
		$(".active:visible, .selected:visible").each(function() {
			chrome.tabs.update(parseInt(this.id), { pinned: ($(this).is(".pin") ? false : true) });
		});
	});
	// undo close
	$(document).on("mousedown", "#button_undo", function(event) {
		if (event.button != 0) {
			return;
		}
		chrome.sessions.getRecentlyClosed( null, function(sessions) {
			if (sessions.length > 0) {
				chrome.sessions.restore(null, function(restored) {
					if (browserId == "F") {
						if (restored.tab != undefined) {
							let t = Promise.resolve(browser.sessions.getTabValue(restored.tab.id, "TTId")).then(function(TTId) {

// TODO RESTORE TREE IF POSSIBLE

								// console.log(TTId);
							});
						}
					}
				});
			}
		});
	});
	// move tab to new window (detach)
	$(document).on("mousedown", "#button_move", function(event) {
		if (event.button != 0) {
			return;
		}
		var tabsArr = [];
		$(".active:visible, .selected:visible").each(function() {
			tabsArr.push(parseInt(this.id));
			if ($("#ch"+this.id).children().length > 0) {
				$($("#ch"+this.id).find(".tab")).each(function() {
					tabsArr.push(parseInt(this.id));
				});
			}
		});
		DetachTabs(tabsArr);
	});
	// move tab to new window (detach)
	$(document).on("mousedown", "#repeat_search", function(event) {
		if (event.button != 0) {
			return;
		}
		FindTab($("#filter_box")[0].value);
	});
	// filter on input
	$("#filter_box").on("input", function() {
		if ($("#filter_box")[0].value == "") {
			$("#button_filter_clear").css({"opacity": "0"}).attr("title", "");
		} else {
			$("#button_filter_clear").css({"opacity": "1"});
			$("#button_filter_clear").attr("title", caption_clear_filter);
		}
		FindTab($("#filter_box")[0].value);
	});
	// change filtering type
	$(document).on("mousedown", "#button_filter_type", function(event) {
		if (event.button != 0) {
			return;
		}
		$("#button_filter_type").toggleClass("url").toggleClass("title");
		FindTab($("#filter_box")[0].value);
		localStorage["filter_type"] = $(this).is(".url") ? "url" : "title";
	});
	// clear filter button
	$(document).on("mousedown", "#button_filter_clear", function(event) {
		if (event.button != 0) {
			return;
		}
		$("#button_filter_clear").css({"opacity": "0"}).attr("title", "");
		FindTab("");
	});
	// sort tabs
	$(document).on("mousedown", "#button_sort", function(event) {
		if (event.button != 0) {
			return;
		}
		SortTabs();
	});
	// bookmarks
	$(document).on("mousedown", "#button_bookmarks", function(event) {
		if (event.button != 0) {
			return;
		}
		chrome.tabs.create({url: "chrome://bookmarks/"});
	});
	// downloads
	$(document).on("mousedown", "#button_downloads", function(event) {
		if (event.button != 0) {
			return;
		}
		chrome.tabs.create({url: "chrome://downloads/"});
	});
	// history
	$(document).on("mousedown", "#button_history", function(event) {
		if (event.button != 0) {
			return;
		}
		chrome.tabs.create({url: "chrome://history/"});
	});
	// extensions
	$(document).on("mousedown", "#button_extensions", function(event) {
		if (event.button != 0) {
			return;
		}
		chrome.tabs.create({url: "chrome://extensions"});
	});
	// settings
	$(document).on("mousedown", "#button_settings", function(event) {
		if (event.button != 0) {
			return;
		}
		chrome.tabs.create({url: "chrome://settings/"});
	});
	// vertical tabs options
	$(document).on("mousedown", "#button_options", function(event) {
		if (event.button != 0) {
			return;
		}
		chrome.tabs.create({url: "options.html" });
	});
	// discard tabs
	$(document).on("mousedown", "#button_discard", function(event) {
		if (event.button != 0) {
			return;
		}
		chrome.tabs.query({windowId: CurrentWindowId, pinned: false}, function(tabs) {
			var tabsIds = [];
			tabs.forEach(function(Tab) {
				tabsIds.push(Tab.id);
			});
			DiscardTabs(tabsIds);
		});
	});
}