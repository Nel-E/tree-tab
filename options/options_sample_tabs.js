// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function AppendSampleTabs() {
	// pins
	AppendTab({tab: {id: 0, pinned: true}, Append: true});
	AppendTab({tab: {id: 1, pinned: true, active: false}, Append: true});
	
	AppendTab({tab: {id: 10, pinned: true, active: false}, Append: true});
	$(".pin#10").addClass("attention");

	
	// regular tabs
	AppendTab({tab: {id: 2, pinned: false}, Append: true});
	$("#tab_title2")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal");
	
	AppendTab({tab: {id: 11, pinned: false}, Append: true, ParentId: "2"});
	$("#tab_title11")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_hover");
	$("#tab_header11").addClass("tab_header_hover").addClass("close_show");

	AppendTab({tab: {id: 12, pinned: false}, Append: true, ParentId: "2", AdditionalClass: "selected"});
	$("#tab_title12")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_selected");
	
	AppendTab({tab: {id: 13, pinned: false}, Append: true, ParentId: "2", AdditionalClass: "selected"});
	$("#tab_title13")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_selected_hover");
	$("#tab_header13").addClass("tab_header_hover").addClass("close_show");
	$("#close13").addClass("close_hover");

	// regular active tabs
	AppendTab({tab: {id: 3, pinned: false}, Append: true, ParentId: "2", AdditionalClass: "active"});
	$("#tab_title3")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active");
	
	AppendTab({tab: {id: 15, pinned: false}, Append: true, ParentId: "2", AdditionalClass: "active"});
	$("#tab_title15")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_hover");
	$("#tab_header15").addClass("tab_header_hover");
	
	AppendTab({tab: {id: 14, pinned: false}, Append: true, ParentId: "2", AdditionalClass: "c selected active"});
	$("#tab_title14")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_selected");
	
	AppendTab({tab: {id: 16, pinned: false}, Append: true, ParentId: "2", AdditionalClass: "c selected active"});
	$("#tab_title16")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_selected_hover");
	$("#tab_header16").addClass("tab_header_hover");
	$("#exp16").addClass("hover");

	// discarded tabs
	AppendTab({tab: {id: 5, pinned: false, discarded: true}, Append: true});
	$("#tab_title5")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded");
	
	AppendTab({tab: {id: 17, pinned: false, discarded: true}, Append: true, ParentId: "5"});
	$("#tab_title17")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_hover");
	$("#tab_header17").addClass("tab_header_hover");

	AppendTab({tab: {id: 19, pinned: false, discarded: true}, Append: true, ParentId: "5", AdditionalClass: "selected"});
	$("#tab_title19")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_selected");
	
	AppendTab({tab: {id: 20, pinned: false, discarded: true}, Append: true, ParentId: "5", AdditionalClass: "selected"});
	$("#tab_title20")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_selected_hover");
	$("#tab_header20").addClass("tab_header_hover");

	// search result
	AppendTab({tab: {id: 6, pinned: false}, Append: true, AdditionalClass: "filtered"});
	$("#tab_title6")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result");
	
	AppendTab({tab: {id: 21, pinned: false}, Append: true, ParentId: "6", AdditionalClass: "filtered"});
	$("#tab_title21")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_hover");
	$("#tab_header21").addClass("tab_header_hover");

	AppendTab({tab: {id: 22, pinned: false}, Append: true, ParentId: "6", AdditionalClass: "filtered active"});
	$("#tab_title22")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_active");
	
	AppendTab({tab: {id: 23, pinned: false}, Append: true, ParentId: "6", AdditionalClass: "filtered active"});
	$("#tab_title23")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_active_hover");
	$("#tab_header23").addClass("tab_header_hover");


	// search result selected
	AppendTab({tab: {id: 8, pinned: false}, Append: true, ParentId: "6", AdditionalClass: "selected filtered"});
	$("#tab_title8")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected");

	AppendTab({tab: {id: 18, pinned: false}, Append: true, ParentId: "6", AdditionalClass: "selected filtered"});
	$("#tab_title18")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_hover");
	$("#tab_header18").addClass("tab_header_hover");

	AppendTab({tab: {id: 25, pinned: false}, Append: true, ParentId: "6", AdditionalClass: "selected filtered active"});
	$("#tab_title25")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_active");


	AppendTab({tab: {id: 26, pinned: false}, Append: true, ParentId: "6", AdditionalClass: "selected filtered active"});
	$("#tab_title26")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_active_hover");
	$("#tab_header26").addClass("tab_header_hover");

	// search result highlighted
	AppendTab({tab: {id: 30, pinned: false}, Append: true, AdditionalClass: "filtered highlighted_search"});
	$("#tab_title30")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted");
	
	AppendTab({tab: {id: 31, pinned: false}, Append: true, ParentId: "30", AdditionalClass: "filtered highlighted_search"});
	$("#tab_title31")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_hover");
	$("#tab_header31").addClass("tab_header_hover");

	AppendTab({tab: {id: 32, pinned: false}, Append: true, ParentId: "30", AdditionalClass: "filtered highlighted_search active"});
	$("#tab_title32")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_active");
	
	AppendTab({tab: {id: 33, pinned: false}, Append: true, ParentId: "30", AdditionalClass: "filtered highlighted_search active"});
	$("#tab_title33")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_active_hover");
	$("#tab_header33").addClass("tab_header_hover");

	AppendTab({tab: {id: 34, pinned: false}, Append: true, ParentId: "30", AdditionalClass: "selected filtered highlighted_search"});
	$("#tab_title34")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected");
	
	AppendTab({tab: {id: 35, pinned: false}, Append: true, ParentId: "30", AdditionalClass: "selected filtered highlighted_search"});
	$("#tab_title35")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_hover");
	$("#tab_header35").addClass("tab_header_hover");

	AppendTab({tab: {id: 36, pinned: false}, Append: true, ParentId: "30", AdditionalClass: "selected filtered highlighted_search active"});
	$("#tab_title36")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_active");


	AppendTab({tab: {id: 37, pinned: false}, Append: true, ParentId: "30", AdditionalClass: "selected filtered highlighted_search active"});
	$("#tab_title37")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_active_hover");
	$("#tab_header37").addClass("tab_header_hover");
	
	$("#_tab_list").addClass("active_group");
	
}