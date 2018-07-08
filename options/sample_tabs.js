// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function AppendSampleTabs() {

	// folders
	AddNewFolder({folderId: "f_folder1", ParentId: "cftab_list", Name: labels.noname_group, Index: 0, ExpandState: "o", AdditionalClass: "o"});
	AddNewFolder({folderId: "f_folder2", ParentId: "f_folder1", Name: labels.noname_group, Index: 0, ExpandState: "c", AdditionalClass: "c"});
	AddNewFolder({folderId: "f_folder3", ParentId: "f_folder1", Name: labels.noname_group, Index: 0, ExpandState: "c", AdditionalClass: "c"});


	// pins
	AppendTab({tab: {id: 0, pinned: true, active: false}, Append: true, SkipSetActive: true, SkipSetEvents: true});
	AppendTab({tab: {id: 1, pinned: true, active: false}, Append: true, SkipSetActive: true, SkipSetEvents: true});
	AppendTab({tab: {id: 10, pinned: true, active: false}, Append: true, SkipSetActive: true, SkipSetEvents: true});
	document.getElementById("10").classList.add("attention");

	// regular tabs
	AppendTab({tab: {id: 2, pinned: false, active: false}, Append: true, SkipSetActive: true, SkipSetEvents: true, addCounter: true});
	document.getElementById("tab_title2").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal");
	
	AppendTab({tab: {id: 11, pinned: false, active: false}, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true});
	document.getElementById("tab_title11").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_hover");
	document.getElementById("tab_header11").classList.add("tab_header_hover");
	document.getElementById("tab_header11").classList.add("close_show");

	AppendTab({tab: {id: 12, pinned: false, active: false}, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected_tab"});
	document.getElementById("tab_title12").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_selected");
	
	AppendTab({tab: {id: 13, pinned: false, active: false}, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected_tab"});
	document.getElementById("tab_title13").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_selected_hover");
	document.getElementById("tab_header13").classList.add("tab_header_hover")
	document.getElementById("tab_header13").classList.add("close_show");
	document.getElementById("close13").classList.add("close_hover");

	// regular active tabs
	AppendTab({tab: {id: 3, pinned: false, active: false}, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "active_tab"});
	document.getElementById("tab_title3").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active");
	
	AppendTab({tab: {id: 15, pinned: false, active: false}, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "active_tab"});
	document.getElementById("tab_title15").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_hover");
	document.getElementById("tab_header15").classList.add("tab_header_hover");
	
	AppendTab({tab: {id: 14, pinned: false, active: false}, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "c selected_tab active_tab"});
	document.getElementById("tab_title14").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_selected");
	
	AppendTab({tab: {id: 16, pinned: false, active: false}, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "c selected_tab active_tab"});
	document.getElementById("tab_title16").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_selected_hover");
	document.getElementById("tab_header16").classList.add("tab_header_hover");
	document.getElementById("exp16").classList.add("hover");

	// discarded tabs
	AppendTab({tab: {id: 5, pinned: false, active: false, discarded: true}, Append: true, SkipSetActive: true, SkipSetEvents: true});
	document.getElementById("tab_title5").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded");
	
	AppendTab({tab: {id: 17, pinned: false, active: false, discarded: true}, ParentId: "5", Append: true, SkipSetActive: true, SkipSetEvents: true});
	document.getElementById("tab_title17").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_hover");
	document.getElementById("tab_header17").classList.add("tab_header_hover");

	AppendTab({tab: {id: 19, pinned: false, active: false, discarded: true}, ParentId: "5", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected_tab highlighted_drop_target after"});
	document.getElementById("tab_title19").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_selected");
	
	AppendTab({tab: {id: 20, pinned: false, active: false, discarded: true}, ParentId: "5", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected_tab"});
	document.getElementById("tab_title20").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_selected_hover");
	document.getElementById("tab_header20").classList.add("tab_header_hover");

	// search result
	AppendTab({tab: {id: 6, pinned: false, active: false}, Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered"});
	document.getElementById("tab_title6").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result");
	
	AppendTab({tab: {id: 21, pinned: false, active: false}, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered"});
	document.getElementById("tab_title21").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_hover");
	document.getElementById("tab_header21").classList.add("tab_header_hover");

	AppendTab({tab: {id: 22, pinned: false, active: false}, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered active_tab"});
	document.getElementById("tab_title22").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_active");
	
	AppendTab({tab: {id: 23, pinned: false, active: false}, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered active_tab"});
	document.getElementById("tab_title23").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_active_hover");
	document.getElementById("tab_header23").classList.add("tab_header_hover");


	// search result selected
	AppendTab({tab: {id: 8, pinned: false, active: false}, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected_tab filtered"});
	document.getElementById("tab_title8").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected");

	AppendTab({tab: {id: 18, pinned: false, active: false}, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected_tab filtered"});
	document.getElementById("tab_title18").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_hover");
	document.getElementById("tab_header18").classList.add("tab_header_hover");

	AppendTab({tab: {id: 25, pinned: false, active: false}, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected_tab filtered active_tab"});
	document.getElementById("tab_title25").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_active");


	AppendTab({tab: {id: 26, pinned: false, active: false}, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected_tab filtered active_tab"});
	document.getElementById("tab_title26").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_active_hover");
	document.getElementById("tab_header26").classList.add("tab_header_hover");

	// search result highlighted
	AppendTab({tab: {id: 30, pinned: false, active: false}, Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered highlighted_search"});
	document.getElementById("tab_title30").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted");
	
	AppendTab({tab: {id: 31, pinned: false, active: false}, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered highlighted_search"});
	document.getElementById("tab_title31").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_hover");
	document.getElementById("tab_header31").classList.add("tab_header_hover");

	AppendTab({tab: {id: 32, pinned: false, active: false}, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered highlighted_search active_tab"});
	document.getElementById("tab_title32").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_active");
	
	AppendTab({tab: {id: 33, pinned: false, active: false}, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered highlighted_search active_tab"});
	document.getElementById("tab_title33").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_active_hover");
	document.getElementById("tab_header33").classList.add("tab_header_hover");

	AppendTab({tab: {id: 34, pinned: false, active: false}, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected_tab filtered highlighted_search"});
	document.getElementById("tab_title34").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected");
	
	AppendTab({tab: {id: 35, pinned: false, active: false}, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected_tab filtered highlighted_search"});
	document.getElementById("tab_title35").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_hover");
	document.getElementById("tab_header35").classList.add("tab_header_hover");

	AppendTab({tab: {id: 36, pinned: false, active: false}, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected_tab filtered highlighted_search active_tab"});
	document.getElementById("tab_title36").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_active");

	AppendTab({tab: {id: 37, pinned: false, active: false}, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected_tab filtered highlighted_search active_tab"});
	document.getElementById("tab_title37").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_active_hover");
	document.getElementById("tab_header37").classList.add("tab_header_hover");
	
	document.getElementById("_tab_list").classList.add("active_group");
	
}