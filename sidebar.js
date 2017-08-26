// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

document.addEventListener("DOMContentLoaded", Initialize(), false);

function Initialize() {
	if (bg.hold) {
		setTimeout(function() { Initialize(); },500);
		chrome.runtime.sendMessage({command: "background_start"});
	} else {

		AppendAllGroups();
		
		var theme = {
			"ToolbarShow": false,
			"ScrollbarPinList": 4,
			"ScrollbarTabList": 16
		};

		if (localStorage.getItem("current_theme") != null && localStorage["theme"+localStorage["current_theme"]] != null) {
			theme = JSON.parse(localStorage["theme"+localStorage["current_theme"]]);
			
			$("#toolbar").html(theme.toolbar);
			
			var css_variables = "";
			for (var css_variable in theme.ColorsSet) {
				css_variables = css_variables + "--" + css_variable + ":" + theme.ColorsSet[css_variable] + ";";
			}
			for (var css_variable in theme.TabsSizeSet) {
				css_variables = css_variables + "--" + css_variable + ":" + theme.TabsSizeSet[css_variable] + ";";
			}
			
			document.styleSheets[0].insertRule("body { "+css_variables+" }", 0);
		}

		if (navigator.userAgent.match("Firefox") === null) {
			document.styleSheets[0].insertRule(".group::-webkit-scrollbar { width:"+theme.ScrollbarTabList+"px;}", 0);
			document.styleSheets[0].insertRule("#pin_list::-webkit-scrollbar { height:"+theme.ScrollbarPinList+"px; }", 0);
		} else {
			// I have no idea what is going on in latest build, but why top position for various things is different in firefox?????
			if (theme.TabsSizeSetNumber > 1) {
				document.styleSheets[1].insertRule(".tab_header>.tab_title { margin-top: -1.5px; }", document.styleSheets[1].cssRules.length);
			}
			// document.styleSheets[1].insertRule("#toolbar_main { top: 1px; height: 25px; }", document.styleSheets[1].cssRules.length);
			// document.styleSheets[1].insertRule(".button_img { position: relative; top: -1px; left: -1px; }", document.styleSheets[1].cssRules.length);
		}
			
		chrome.tabs.query({currentWindow: true}, function(tabs) {
			CurrentWindowId = tabs[0].windowId;


			if (bg.opt.pin_list_multi_row) {
				$("#pin_list").css({"white-space": "normal", "overflow-x": "hidden"});
			}


			if (theme.ToolbarShow == true) {
				if (bg.opt_toolbar.filter_type == "url") {
					$("#button_filter_type").addClass("url");
				} else {
					$("#button_filter_type").addClass("title");
				}
				$(".button").each(function() {
					$(this).attr("title", chrome.i18n.getMessage(this.id));
				});
				$("#filter_box").attr("placeholder", bg.caption_searchbox);
				$("#filter_box").css({"opacity": 1});
				
				$(".on").removeClass("on");
				$("#toolbar_tools, #toolbar_search").removeClass("hidden");
				
				if (bg.opt_toolbar.active_toolbar_tool == "") {
					$("#toolbar_tools, #toolbar_search").addClass("hidden");
				}
				if (bg.opt_toolbar.active_toolbar_tool == "tools" && $("#button_tools").length != 0) {
					$("#toolbar_search").addClass("hidden");
					$("#button_tools").addClass("on");
				}
				if (bg.opt_toolbar.active_toolbar_tool == "search" && $("#button_search").length != 0) {
					$("#toolbar_tools").addClass("hidden");
					$("#button_search").addClass("on");
				}
				$("#toolbar_separator").remove();
				$("#toolbar_unused_buttons").remove();
			} else {
				$("#toolbar").children().remove();
			}

			// AppendGroupToList("tab_list", "tab_list", GetRandomHexColor(), GetRandomHexColor());
			// AppendGroupToList("g_23y23hriouh", "test", GetRandomHexColor(), GetRandomHexColor());

			
			tabs.forEach(function(Tab) {
				AppendTab({tab: Tab, Append: true});
			});

			tabs.forEach(function(Tab) {
				if (bg.tabs[Tab.id] && !Tab.pinned && $("#"+bg.tabs[Tab.id].p)[0] && $("#"+bg.tabs[Tab.id].p).is(".group")) {
					$("#"+bg.tabs[Tab.id].p).append($("#"+Tab.id));
				}
			});
			
			tabs.forEach(function(Tab) {
				if (bg.tabs[Tab.id] && !Tab.pinned) {
					$("#"+Tab.id).addClass(bg.tabs[Tab.id].o);
					if ($("#"+bg.tabs[Tab.id].p).length > 0 && $("#"+bg.tabs[Tab.id].p).is(".tab") && $("#"+Tab.id).find($("#ch"+bg.tabs[Tab.id].p)).length == 0) {
						$("#ch"+bg.tabs[Tab.id].p).append($("#"+Tab.id));
					}
				}
			});
			
			RearrangeTabs(tabs, true);

			delete theme;

			SetIOEvents();
			SetToolbarEvents();
			SetTRefreshEvents();
			SetGroupEvents();
			SetTabEvents();
			SetMenu();
			RefreshGUI();
			RefreshExpandStates();
			SetActiveGroup("tab_list", true, true);
			
			setTimeout(function() { UpdateData(); },5000);
			setTimeout(function() { ScrollToTab($(".active:visible")[0].id); },100); // Scroll to active tab
			
			
			
			if (navigator.userAgent.match("Vivaldi") !== null) {
				VivaldiRefreshMediaIcons();
			}
			
		});
	}

}
	

function log(m) {
	bg.log(m);
}