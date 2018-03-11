// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function AppendSampleTabs() {
	// pins
	AppendTab({id: 0, pinned: true}, false, false, false, true, false, false, false, true, false, false);
	AppendTab({id: 1, pinned: true, active: false}, false, false, false, true, false, false, false, true, false, false);
	
	AppendTab({id: 10, pinned: true, active: false}, false, false, false, true, false, false, false, true, false, false);
	document.getElementById("10").classList.add("attention");

	// regular tabs
	AppendTab({id: 2, pinned: false}, false, false, false, true, false, false, false, true, false, true);
	document.getElementById("tab_title2").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal");
	
	AppendTab({id: 11, pinned: false}, "2", false, false, true, false, false, false, false, false, false);
	document.getElementById("tab_title11").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_hover");
	document.getElementById("tab_header11").classList.add("tab_header_hover");
	document.getElementById("tab_header11").classList.add("close_show");

	AppendTab({id: 12, pinned: false}, "2", false, false, true, false, false, "selected_tab", false, false, false);
	document.getElementById("tab_title12").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_selected");
	
	AppendTab({id: 13, pinned: false}, "2", false, false, true, false, false, "selected_tab", false, false, false);
	document.getElementById("tab_title13").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_selected_hover");
	document.getElementById("tab_header13").classList.add("tab_header_hover")
	document.getElementById("tab_header13").classList.add("close_show");
	document.getElementById("close13").classList.add("close_hover");

	// regular active tabs
	AppendTab({id: 3, pinned: false}, "2", false, false, true, false, false, "active_tab", false, false, false);
	document.getElementById("tab_title3").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active");
	
	AppendTab({id: 15, pinned: false}, "2", false, false, true, false, false, "active_tab", false, false, false);
	document.getElementById("tab_title15").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_hover");
	document.getElementById("tab_header15").classList.add("tab_header_hover");
	
	AppendTab({id: 14, pinned: false}, "2", false, false, true, false, false, "c selected_tab active_tab", false, false, false);
	document.getElementById("tab_title14").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_selected");
	
	AppendTab({id: 16, pinned: false}, "2", false, false, true, false, false, "c selected_tab active_tab", false, false, false);
	document.getElementById("tab_title16").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_selected_hover");
	document.getElementById("tab_header16").classList.add("tab_header_hover");
	document.getElementById("exp16").classList.add("hover");

	// discarded tabs
	AppendTab({id: 5, pinned: false, discarded: true}, false, false, false, true, false, false, false, false, false, false);
	document.getElementById("tab_title5").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded");
	
	AppendTab({id: 17, pinned: false, discarded: true}, "5", false, false, true, false, false, false, false, false, false);
	document.getElementById("tab_title17").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_hover");
	document.getElementById("tab_header17").classList.add("tab_header_hover");

	AppendTab({id: 19, pinned: false, discarded: true}, "5", false, false, true, false, false, "selected_tab", false, false, false);
	document.getElementById("tab_title19").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_selected");
	
	AppendTab({id: 20, pinned: false, discarded: true}, "5", false, false, true, false, false, "selected_tab", false, false, false);
	document.getElementById("tab_title20").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_selected_hover");
	document.getElementById("tab_header20").classList.add("tab_header_hover");

	// search result
	AppendTab({id: 6, pinned: false}, false, false, false, true, false, false, "filtered", false, false, false);
	document.getElementById("tab_title6").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result");
	
	AppendTab({id: 21, pinned: false}, "6", false, false, true, false, false, "filtered", false, false, false);
	document.getElementById("tab_title21").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_hover");
	document.getElementById("tab_header21").classList.add("tab_header_hover");

	AppendTab({id: 22, pinned: false}, "6", false, false, true, false, false, "filtered active_tab", false, false, false);
	document.getElementById("tab_title22").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_active");
	
	AppendTab({id: 23, pinned: false}, "6", false, false, true, false, false, "filtered active_tab", false, false, false);
	document.getElementById("tab_title23").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_active_hover");
	document.getElementById("tab_header23").classList.add("tab_header_hover");


	// search result selected
	AppendTab({id: 8, pinned: false}, "6", false, false, true, false, false, "selected_tab filtered", false, false, false);
	document.getElementById("tab_title8").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected");

	AppendTab({id: 18, pinned: false}, "6", false, false, true, false, false, "selected_tab filtered", false, false, false);
	document.getElementById("tab_title18").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_hover");
	document.getElementById("tab_header18").classList.add("tab_header_hover");

	AppendTab({id: 25, pinned: false}, "6", false, false, true, false, false, "selected_tab filtered active_tab", false, false, false);
	document.getElementById("tab_title25").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_active");


	AppendTab({id: 26, pinned: false}, "6", false, false, true, false, false, "selected_tab filtered active_tab", false, false, false);
	document.getElementById("tab_title26").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_active_hover");
	document.getElementById("tab_header26").classList.add("tab_header_hover");

	// search result highlighted
	AppendTab({id: 30, pinned: false}, false, false, false, true, false, false, "filtered highlighted_search", false, false, false);
	document.getElementById("tab_title30").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted");
	
	AppendTab({id: 31, pinned: false}, "30", false, false, true, false, false, "filtered highlighted_search", false, false, false);
	document.getElementById("tab_title31").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_hover");
	document.getElementById("tab_header31").classList.add("tab_header_hover");

	AppendTab({id: 32, pinned: false}, "30", false, false, true, false, false, "filtered highlighted_search active_tab", false, false, false);
	document.getElementById("tab_title32").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_active");
	
	AppendTab({id: 33, pinned: false}, "30", false, false, true, false, false, "filtered highlighted_search active_tab", false, false, false);
	document.getElementById("tab_title33").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_active_hover");
	document.getElementById("tab_header33").classList.add("tab_header_hover");

	AppendTab({id: 34, pinned: false}, "30", false, false, true, false, false, "selected_tab filtered highlighted_search", false, false, false);
	document.getElementById("tab_title34").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected");
	
	AppendTab({id: 35, pinned: false}, "30", false, false, true, false, false, "selected_tab filtered highlighted_search", false, false, false);
	document.getElementById("tab_title35").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_hover");
	document.getElementById("tab_header35").classList.add("tab_header_hover");

	AppendTab({id: 36, pinned: false}, "30", false, false, true, false, false, "selected_tab filtered highlighted_search active_tab", false, false, false);
	document.getElementById("tab_title36").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_active");


	AppendTab({id: 37, pinned: false}, "30", false, false, true, false, false, "selected_tab filtered highlighted_search active_tab", false, false, false);
	document.getElementById("tab_title37").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_active_hover");
	document.getElementById("tab_header37").classList.add("tab_header_hover");

	document.getElementById("_tab_list").classList.add("active_group");
	
}