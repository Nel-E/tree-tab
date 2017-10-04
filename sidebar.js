// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

document.addEventListener("DOMContentLoaded", Run(), false);



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
	
		var theme = {
			"TabsSizeSetNumber": 2,
			"ToolbarShow": false,
			"ScrollbarPinList": 4,
			"ScrollbarTabList": 16
		};
		// ApplyColorsSet();
		if (localStorage.getItem("current_theme") != null && localStorage["theme"+localStorage["current_theme"]] != null) {
			theme = JSON.parse(localStorage["theme"+localStorage["current_theme"]]);
			

			// $("#toolbar").html(theme.toolbar);
			
			// var css_variables = "";
			// for (var css_variable in theme.ColorsSet) {
				// css_variables = css_variables + "--" + css_variable + ":" + theme.ColorsSet[css_variable] + ";";
			// }
			// for (var css_variable in theme.TabsSizeSet) {
				// css_variables = css_variables + "--" + css_variable + ":" + theme.TabsSizeSet[css_variable] + ";";
			// }
			
			// document.styleSheets[0].insertRule("body { "+css_variables+" }", 0);
			// ApplySizeSet(0);
			// if (navigator.userAgent.match("Firefox") === null) {
				// document.styleSheets[0].insertRule(".group::-webkit-scrollbar { width:"+theme.ScrollbarTabList+"px;}", 0);
				// document.styleSheets[0].insertRule("#pin_list::-webkit-scrollbar { height:"+theme.ScrollbarPinList+"px; }", 0);
			// } else {
				// I have no idea what is going on in latest build, but why top position for various things is different in firefox?????
				// if (theme.TabsSizeSetNumber > 1) {
					// document.styleSheets[1].insertRule(".tab_header>.tab_title { margin-top: -1.5px; }", document.styleSheets[1].cssRules.length);
				// }
			// }
		}
		
			ApplySizeSet(theme["TabsSizeSetNumber"]);
			ApplyColorsSet(theme["ColorsSet"]);
		
					// ApplySizeSet(theme.TabsSizeSetNumber);

		
		if (browserId != 3) {
			// document.styleSheets[0].insertRule(".group::-webkit-scrollbar { width:"+ScrollbarTabList+"px;}", 0);
			// document.styleSheets[0].insertRule("#pin_list::-webkit-scrollbar { height:"+ScrollbarPinList+"px; }", 0);
		}
	
		chrome.tabs.query({currentWindow: true}, function(tabs) {
		

		
			AppendGroupToList("tab_list", caption_ungrouped_group, 0, 0);

			
			AppendAllGroups();
		




			
			// CurrentWindowId = tabs[0].windowId;

// console.log(bgtabs);
// console.log(bggroups);
			if (opt.pin_list_multi_row) {
				$("#pin_list").css({"white-space": "normal", "overflow-x": "hidden"});
			}
			
			

			$("#toolbar").html(DefaultToolbar);

			tabs.forEach(function(Tab) {
				AppendTab({tab: Tab, Append: true});
			});

			tabs.forEach(function(Tab) {
				if (bgtabs[Tab.id] && !Tab.pinned && $("#"+bgtabs[Tab.id].p)[0] && $("#"+bgtabs[Tab.id].p).is(".group")) {
					$("#"+bgtabs[Tab.id].p).append($("#"+Tab.id));
				}
			});
			
			tabs.forEach(function(Tab) {
				if (bgtabs[Tab.id] && !Tab.pinned) {
					if ($("#"+bgtabs[Tab.id].p).length > 0 && $("#"+bgtabs[Tab.id].p).is(".tab") && $("#"+Tab.id).find($("#ch"+bgtabs[Tab.id].p)).length == 0) {
						$("#ch"+bgtabs[Tab.id].p).append($("#"+Tab.id));
					}
				}
			});			
			
			tabs.forEach(function(Tab) {
				if (bgtabs[Tab.id] && !Tab.pinned) {
					$("#"+Tab.id).addClass(bgtabs[Tab.id].o);
				}
			});
				
			RearrangeTabs(tabs, bgtabs, true);
			
			
			// delete theme;

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
			SetActiveGroup("tab_list", true, true);
			StartChromeListeners();
			
			setTimeout(function() {
				UpdateData();
				delete bgtabs;
			},5000);
			
			if (opt.syncro_tabbar_tabs_order) {
				RearrangeBrowserTabsCheck();
			}
			
			for (var group in bggroups) {
				if ($("#"+bggroups[group].activetab)[0]) {
					$("#"+bggroups[group].activetab).addClass("active");
				}
			}
			// setTimeout(function() { ScrollToTab($(".active:visible")[0].id); },100); // Scroll to active tab
			
			
// AddNewFolder();			
			if (navigator.userAgent.match("Vivaldi") !== null) {
				VivaldiRefreshMediaIcons();
			}
				
		});			

	// }

}
	

function log(m) {
	chrome.runtime.sendMessage({command: "console_log", m: m});
}