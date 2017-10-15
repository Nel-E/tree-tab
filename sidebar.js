// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

document.addEventListener("DOMContentLoaded", Run(), false);



function Loadi18n() {
	// toolbar labels
	$(".button").each(function() {
		$(this).attr("title", chrome.i18n.getMessage(this.id));
	});

	// menu labels
	$(".menu_item").each(function() {
		$(this).text(chrome.i18n.getMessage(this.id));
	});
	
	// edit group dialog labels
	$(".group_edit_button").each(function() {
		$(this)[0].textContent = chrome.i18n.getMessage(this.id);
	});
}
	
function Run() {
	LoadPreferences();
	chrome.windows.getCurrent({populate: false}, function(window) {
		CurrentWindowId = window.id;
		chrome.runtime.sendMessage({command: "is_bg_is_busy"}, function(response) {
			let bgBusy = response;
			chrome.runtime.sendMessage({command: "get_browser_tabs"}, function(response) {
				bgtabs = Object.assign({}, response);
				chrome.runtime.sendMessage({command: "get_groups", windowId: CurrentWindowId}, function(response) {
					bggroups = Object.assign({}, response);
					setTimeout(function() {
						if (opt != undefined && browserId != undefined && bgtabs != undefined && bggroups != undefined && bgBusy == false) {
							Initialize();
						} else {
							Run();
						}
					},200);
				});
			});
		});
	});
}	
	
function Initialize() {
	
	RestoreStateOfGroupsToolbar();
	var theme = {
		"TabsSizeSetNumber": 2,
		"ToolbarShow": true,
		"toolbar": DefaultToolbar
	};

	if (localStorage.getItem("current_theme") != null && localStorage["theme"+localStorage["current_theme"]] != null) {
		theme = JSON.parse(localStorage["theme"+localStorage["current_theme"]]);
		if (browserId == "F") {
			// I have no idea what is going on in latest build, but why top position for various things is different in firefox?????
			if (theme.TabsSizeSetNumber > 1) {
				document.styleSheets[document.styleSheets.length-1].insertRule(".tab_header>.tab_title { margin-top: -1px; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
			}
		}
	}

	ApplySizeSet(theme["TabsSizeSetNumber"]);
	ApplyColorsSet(theme["ColorsSet"]);

	chrome.tabs.query({currentWindow: true}, function(tabs) {

		AppendAllGroups();

// log(bgtabs);
// log(bggroups);

		if (opt.pin_list_multi_row) {
			$("#pin_list").css({"white-space": "normal", "overflow-x": "hidden"});
		}
		if (theme.ToolbarShow) {
			$("#toolbar").html(theme.toolbar);
		}
		

		let tc = tabs.length;
		for (var ti = 0; ti < tc; ti++) {
			AppendTab({tab: tabs[ti], Append: true, SkipSetActive: true});
		}
		
		for (var group in bggroups) {
			if ($("#"+bggroups[group].activetab)[0]) {
				$("#"+bggroups[group].activetab).addClass("active");
			}
		}
		
		chrome.runtime.sendMessage({command: "get_active_group", windowId: CurrentWindowId}, function(response) {
			SetActiveGroup(response, true, true);
		});

		for (var ti = 0; ti < tc; ti++) {
			if (bgtabs[tabs[ti].id] && !tabs[ti].pinned && $("#"+bgtabs[tabs[ti].id].p)[0] && $("#"+bgtabs[tabs[ti].id].p).is(".group")) {
				$("#"+bgtabs[tabs[ti].id].p).append($("#"+tabs[ti].id));
			}
		}
		
		for (var ti = 0; ti < tc; ti++) {
			if (bgtabs[tabs[ti].id] && !tabs[ti].pinned) {
				if ($("#"+bgtabs[tabs[ti].id].p).length > 0 && $("#"+bgtabs[tabs[ti].id].p).is(".tab") && $("#"+tabs[ti].id).find($("#ch"+bgtabs[tabs[ti].id].p)).length == 0) {
					$("#ch"+bgtabs[tabs[ti].id].p).append($("#"+tabs[ti].id));
				}
			}
		}
		
		for (var ti = 0; ti < tc; ti++) {
			if (bgtabs[tabs[ti].id] && !tabs[ti].pinned) {
				$("#"+tabs[ti].id).addClass(bgtabs[tabs[ti].id].o);
			}
		}

		RearrangeTreeTabs(tabs, bgtabs, true);

		SetIOEvents();
		SetToolbarEvents();
		
		RestoreToolbarShelf();
		RestoreToolbarSearchFilter();
		SetToolbarShelfToggle();
		
		SetTRefreshEvents();
		SetGroupEvents();
		SetTabEvents();
		SetMenu();
		RefreshGUI();
		RefreshExpandStates();
		SetDragAndDropEvents();
		StartChromeListeners();
		
		Loadi18n();

		setTimeout(function() {
			UpdateData();
			delete bgtabs;
			delete theme;
		},5000);
		
		if (opt.syncro_tabbar_tabs_order) {
			RearrangeBrowserTabsCheck();
		}
		
		if (opt.syncro_tabbar_tabs_order) {
			if ($(".active").length == 0) {
				chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
					SetActiveTab(tabs[0].id);
				});
			}
		}
		
// AddNewFolder();			
		if (browserId == "V") {
			VivaldiRefreshMediaIcons();
		}
			
	});			
}
	

function log(m) {
	chrome.runtime.sendMessage({command: "console_log", m: m});
}