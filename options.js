// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********      OPTIONS       ***************

var themes = [];
var SelectedTheme =  Object.assign({}, DefaultTheme);
var dragged_button;
active_group = "tab_list";

document.addEventListener("DOMContentLoaded", function() {
	LoadPreferences();
	document.title = "Tree Tabs";

	themes = LoadData("themes", []);
	if (localStorage.getItem("current_theme") != null) {
		LoadTheme(localStorage["current_theme"]);
	}

	GetOptions();
	RefreshFields();
	SetEvents();
	SetToolbarShelfToggle("click");
	
	AppendGroupToList("tab_list", caption_ungrouped_group, "");
	AppendGroupToList("tab_list2", caption_ungrouped_group, "");

	
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
	$("#tab_title30")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result");
	
	AppendTab({tab: {id: 31, pinned: false}, Append: true, ParentId: "30", AdditionalClass: "filtered highlighted_search"});
	$("#tab_title31")[0].textContent = "Search highlighted result hover";
	$("#tab_header31").addClass("tab_header_hover");

	AppendTab({tab: {id: 32, pinned: false}, Append: true, ParentId: "30", AdditionalClass: "filtered highlighted_search active"});
	$("#tab_title32")[0].textContent = "Search result highlighted active";
	
	AppendTab({tab: {id: 33, pinned: false}, Append: true, ParentId: "30", AdditionalClass: "filtered highlighted_search active"});
	$("#tab_title33")[0].textContent = "Search result highlighted active hover";
	$("#tab_header33").addClass("tab_header_hover");

	AppendTab({tab: {id: 34, pinned: false}, Append: true, ParentId: "30", AdditionalClass: "selected filtered highlighted_search"});
	$("#tab_title34")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected");
	
	AppendTab({tab: {id: 35, pinned: false}, Append: true, ParentId: "30", AdditionalClass: "selected filtered highlighted_search"});
	$("#tab_title35")[0].textContent = "Searh result selected hover";
	$("#tab_header35").addClass("tab_header_hover");

	AppendTab({tab: {id: 36, pinned: false}, Append: true, ParentId: "30", AdditionalClass: "selected filtered highlighted_search active"});
	$("#tab_title36")[0].textContent = "Searh result selected active";


	AppendTab({tab: {id: 37, pinned: false}, Append: true, ParentId: "30", AdditionalClass: "selected filtered highlighted_search active"});
	$("#tab_title37")[0].textContent = "Searh result selected active hover";
	$("#tab_header37").addClass("tab_header_hover");
	
	$("#_tab_list").addClass("active_group");
});


// document events
function GetOptions() {
	// get language labels
	$(".label").each(function() {
		$(this).text(chrome.i18n.getMessage(this.id));
	});
	// get language for color pick labels
	$(".cpl").each(function() {
		$(this).text(chrome.i18n.getMessage(this.id));
	});
	// get language for menu labels
	$(".menu_item").each(function() {
		$(this).text(chrome.i18n.getMessage("options_example_menu_item"));
	});
	
	// get checkboxes from saved states
	$(".opt_checkbox").each(function() {
		$(this)[0].checked = opt[this.id];
	});
	$(".set_button").each(function() {
		$(this)[0].textContent = chrome.i18n.getMessage(this.id);
	});
	
	// get language dropdown menus
	$(".bg_opt_drop_down_menu").each(function() {
		$(this)[0].textContent = chrome.i18n.getMessage(this.id);
	});




	// get language for color pick labels
	$(".color_border").each(function() {
		$(this).attr("title", chrome.i18n.getMessage("options_color_pick_border"));
	});
	$(".color_bucket").each(function() {
		$(this).attr("title", chrome.i18n.getMessage("options_color_pick_background"));
	});
	$(".pick_col_hover").each(function() {
		$(this).attr("title", chrome.i18n.getMessage("options_color_pick_hover"));
	});
	$(".font_color").each(function() {
		$(this).attr("title", chrome.i18n.getMessage("options_color_pick_font"));
	});

	$(".options_button_minus, .options_button_plus").each(function() {
		$(this).attr("title", chrome.i18n.getMessage(this.id));
	});
	$("#filter_clear_icon").each(function() {
		$(this).attr("title", chrome.i18n.getMessage("options_color_pick_filter_clear_icon"));
	});

	
	
	
	// get options for append child tab
	for (var i = 0; i < $("#append_child_tab")[0].options.length; i++) {
		if ($("#append_child_tab")[0].options[i].value === opt.append_child_tab) {
			$("#append_child_tab")[0].selectedIndex = i;
			break;
		}
	}

	// get options for append child tab after limit
	for (var i = 0; i < $("#append_child_tab_after_limit")[0].options.length; i++) {
		if ($("#append_child_tab_after_limit")[0].options[i].value === opt.append_child_tab_after_limit) {
			$("#append_child_tab_after_limit")[0].selectedIndex = i;
			break;
		}
	}
	
	// get options for append orphan tab
	for (var i = 0; i < $("#append_orphan_tab")[0].options.length; i++) {
		if ($("#append_orphan_tab")[0].options[i].value === opt.append_orphan_tab) {
			$("#append_orphan_tab")[0].selectedIndex = i;
			break;
		}
	}
	
	// get options for action after closing active tab
	for (var i = 0; i < $("#after_closing_active_tab")[0].options.length; i++) {
		if ($("#after_closing_active_tab")[0].options[i].value === opt.after_closing_active_tab) {
			$("#after_closing_active_tab")[0].selectedIndex = i;
			break;
		}
	}

	// get options for tabs tree depth option
	$("#max_tree_depth")[0].value = opt.max_tree_depth;

	// append themes to dropdown menu
	for (var i = 0; i < themes.length; i++) {
		var t_list = document.getElementById("theme_list");
		var	theme_name = document.createElement("option");
			theme_name.value = themes[i];
			theme_name.text = themes[i];
		t_list.add(theme_name);
	}
	
	// select current theme in dropdown list
	for (var i = 0; i < $("#theme_list")[0].options.length; i++) {
		if ($("#theme_list")[0].options[i].value === localStorage["current_theme"]) {
			$("#theme_list")[0].selectedIndex = i;
			break;
		}
	}
}


function ExportTheme(filename) {
	var data = JSON.stringify(SelectedTheme);
	var body = document.getElementById("body");
	var link = document.createElement("a");
	link.target = "_blank";
	link.download = filename;
	link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
	body.appendChild(link);
	link.click();
	link.remove();
}


function ImportTheme() {
	var file = document.getElementById("import_theme");
	var fr = new FileReader();
	if (file.files[0] == undefined) return;
	fr.readAsText(file.files[0]);
	fr.onload = function() {
		var data = fr.result;
		var themeObj = JSON.parse(data);

		if (themeObj.theme_version > DefaultTheme["theme_version"]) {
			alert(chrome.i18n.getMessage("options_loaded_theme_newer_version"));
		}
		if (themeObj.theme_version < DefaultTheme["theme_version"]) {
			alert(chrome.i18n.getMessage("options_loaded_theme_older_version"));
		}
		
		if (themeObj.theme_version <= DefaultTheme["theme_version"]) {
			for (var val in themeObj.ColorsSet) {
				SelectedTheme["ColorsSet"][val] = themeObj.ColorsSet[val];
			}
			
			SelectedTheme["ToolbarShow"] = themeObj.ToolbarShow;
			SelectedTheme["TabsSizeSetNumber"] = themeObj.TabsSizeSetNumber;
			SelectedTheme["ScrollbarPinList"] = themeObj.ScrollbarPinList;
			SelectedTheme["ScrollbarTabList"] = themeObj.ScrollbarTabList;
			SelectedTheme["theme_version"] = DefaultTheme["theme_version"];
			SelectedTheme["unused_buttons"] = themeObj["unused_buttons"] ? themeObj["unused_buttons"] : "";

			if (themes.indexOf(themeObj.theme_name) == -1) {
				SelectedTheme["theme_name"] = themeObj.theme_name;
			} else {
				SelectedTheme["theme_name"] = themeObj.theme_name + "(1)";
			}
			
			themes.push(SelectedTheme["theme_name"]);
		
			SaveTheme(SelectedTheme["theme_name"]);
			var t_list = document.getElementById("theme_list");
			var theme_name = document.createElement("option");
			theme_name.value = SelectedTheme["theme_name"];
			theme_name.text = theme_name.value;
			t_list.add(theme_name);
			
			$("#theme_list")[0].selectedIndex = $("#theme_list")[0].options.length-1;
			
			localStorage["themes"] = JSON.stringify(themes);
			localStorage["current_theme"] = themeObj.theme_name;
			LoadTheme(SelectedTheme["theme_name"]);
			RefreshFields();
		}
	}	 

}



function RemoveRedPreview() {
	if (document.styleSheets[document.styleSheets.length-1].cssRules.length) {
		document.styleSheets[document.styleSheets.length-1].deleteRule(document.styleSheets[document.styleSheets.length-1].cssRules.length-1);
	}
}


// document events
function SetEvents() {
	
// --------------------------------ADD RED PREVIEW------------------------------------------------------------------------	

	$(document).on("mouseenter", ".pick_col, #filter_box_font", function(event) {
		document.styleSheets[document.styleSheets.length-1].insertRule("body { --"+this.id+": red; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
	});
	$(document).on("mouseenter", ".font_weight_normal", function(event) {
		document.styleSheets[document.styleSheets.length-1].insertRule("body { --"+this.id+": normal; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
	});
	$(document).on("mouseenter", ".font_weight_bold", function(event) {
		document.styleSheets[document.styleSheets.length-1].insertRule("body { --"+this.id+": bold; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
	});
	
	$(document).on("mouseenter", ".font_style_normal", function(event) {
		document.styleSheets[document.styleSheets.length-1].insertRule("body { --"+this.id+": normal; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
	});
	$(document).on("mouseenter", ".font_style_italic", function(event) {
		document.styleSheets[document.styleSheets.length-1].insertRule("body { --"+this.id+": italic; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
	});
	
	
	$(document).on("mouseleave", ".pick_col, .font_weight_normal, .font_weight_bold, .font_style_normal, .font_style_italic, #filter_box_font", function(event) {
		RemoveRedPreview();
	});



	// $(document).on("mouseenter", "#filter_box_font", function(event) {
		// $(".button").addClass("hover_border_blinking");
	// });
	// $(document).on("mouseleave", "#filter_box_font", function(event) {
		// $(".button").removeClass("hover_border_blinking");
	// });


	
	$(document).on("mouseenter", "#scrollbar_thumb_hover", function(event) {
		// $("#group_scrollbar_thumb").css({ "background-color": "red" });
		$("#group_scrollbar_thumb, #pin_list_scrollbar_thumb").addClass("hover_blinking");
	});
	
	$(document).on("mouseleave", "#scrollbar_thumb_hover", function(event) {
		// $("#group_scrollbar_thumb").css({ "background-color": "" });
		$("#group_scrollbar_thumb, #pin_list_scrollbar_thumb").removeClass("hover_blinking");
	});
	
	$(document).on("mouseenter", "#group_list_button_hover_background", function(event) {
		// $("#group_scrollbar_thumb").css({ "background-color": "red" });
		$("#_tab_list2").addClass("hover_blinking");
	});
	
	
	$(document).on("mouseleave", "#group_list_button_hover_background", function(event) {
		// $("#group_scrollbar_thumb").css({ "background-color": "" });
		$("#_tab_list2").removeClass("hover_blinking");
	});
	

	
	$(document).on("mouseenter", "#button_hover_background", function(event) {
		$(".button").addClass("hover_blinking");
	});
	$(document).on("mouseleave", "#button_hover_background", function(event) {
		$(".button").removeClass("hover_blinking");
	});
	
	$(document).on("mouseenter", "#button_icons_hover", function(event) {
		$(".button_img").addClass("hover_blinking");
	});
	$(document).on("mouseleave", "#button_icons_hover", function(event) {
		$(".button_img").removeClass("hover_blinking");
	});
	
	$(document).on("mouseenter", "#button_hover_border", function(event) {
		$(".button").addClass("hover_border_blinking");
	});
	$(document).on("mouseleave", "#button_hover_border", function(event) {
		$(".button").removeClass("hover_border_blinking");
	});
	
	
	
// filter_box_font 

	$(document).on("mouseenter", "#options_tab_list_scrollbar_width_up, #options_tab_list_scrollbar_width_down", function(event) {
		$("#group_scrollbar, #group_scrollbar_thumb").css({ "background-color": "red" });
	});
	$(document).on("mouseleave", "#options_tab_list_scrollbar_width_up, #options_tab_list_scrollbar_width_down", function(event) {
		$("#group_scrollbar, #group_scrollbar_thumb").css({ "background-color": "" });
	});
	
	$(document).on("mouseenter", "#options_tab_list_scrollbar_height_up, #options_tab_list_scrollbar_height_down", function(event) {
		$("#pin_list_scrollbar, #pin_list_scrollbar_thumb").css({ "background-color": "red" });
	});
	$(document).on("mouseleave", "#options_tab_list_scrollbar_height_up, #options_tab_list_scrollbar_height_down", function(event) {
		$("#pin_list_scrollbar, #pin_list_scrollbar_thumb").css({ "background-color": "" });
	});
	


// --------------------------------------COLOR PICKER---------------------------------------------------------------------	
	
	// change fonts weight
	$(document).on("mousedown", ".font_weight_normal, .font_weight_bold", function(event) {
		SelectedTheme["ColorsSet"][this.id] = $(this).is(".font_weight_normal") ? "normal" : "bold";
		ApplyColorsSet(SelectedTheme["ColorsSet"]);
		SaveTheme($("#theme_list").val());
	});
	
	// change fonts style
	$(document).on("mousedown", ".font_style_normal, .font_style_italic", function(event) {
		SelectedTheme["ColorsSet"][this.id] = $(this).is(".font_style_normal") ? "normal" : "italic";
		ApplyColorsSet(SelectedTheme["ColorsSet"]);
		SaveTheme($("#theme_list").val());
	});
	
	
	// show color picker
	$(document).on("mousedown", ".pick_col", function(event) {
		RemoveRedPreview();
		if (event.shiftKey || event.ctrlKey) return;
		event.stopPropagation();
		PickColor = this.id;
		let bod = document.getElementById("body");
		let color = window.getComputedStyle(bod, null).getPropertyValue("--"+this.id);
		console.log(color.replace(" ", "").replace("#", ""));
		$("#color_picker")[0].value = color.replace(" ", "");
		$("#color_picker").click();
	});
	$(document).on("input", "#color_picker", function(event) {
		SelectedTheme["ColorsSet"][PickColor] = $("#color_picker")[0].value;
		ApplyColorsSet(SelectedTheme["ColorsSet"]);
		SaveTheme($("#theme_list").val());
	});	
	


	
// ----------------------------------EVENTS FOR CHECKBOXES AND DROPDOWN MENUS---------------------------------------------	
	// set checkbox options on/off and save
	$(document).on("click", ".bg_opt", function(event) {
		opt[this.id] = $(this)[0].checked ? true : false;
		SavePreferences();
	});

	// options that need reload
	$(document).on("click", "#syncro_tabbar_tabs_order, #allow_pin_close, #switch_with_scroll, #always_show_close, #never_show_close, #close_other_trees, #faster_scroll", function(event) {
		chrome.runtime.sendMessage({command: "reload_sidebar"});
	});

	// set dropdown menu options
	$("#append_child_tab, #append_child_tab_after_limit, #after_closing_active_tab, #append_orphan_tab").change(function() {
		opt[this.id] = $(this).val();
		SavePreferences();
	});

	
	// set tabs tree depth option
	$(document).on("input", "#max_tree_depth", function(event) {
		opt.max_tree_depth = $(this)[0].value;
		SavePreferences();
	});

	
	// set toolbar on/off and show/hide all toolbar options
	$(document).on("click", "#show_toolbar", function(event) {
		SelectedTheme.ToolbarShow = $("#show_toolbar")[0].checked ? true : false;
		SaveTheme($("#theme_list").val());
		
		LoadTheme($("#theme_list").val());
		// $("#field_show_toolbar").css({"height": $("#show_toolbar")[0].checked ? "" : "6"});
		// SelectedTheme.ToolbarShow ? $("#options_available_buttons, #toolbar, #toolbar_colors").show() : $("#options_available_buttons, #toolbar, #toolbar_colors").hide();
	});

	
// ------------------------------OTHER------------------------------------------------------------------------------------	

	// block system dragging
	$(document).bind("drop dragover", function(event) {
		event.preventDefault();
	});









// ----------------------------TOOLBAR CUSTOMIZATION----------------------------------------------------------------------	


	$(document).on("mousedown", ".button", function(event) {
		
		$("#button_filter_clear").css({"opacity": "1", "position": "absolute"});
		if ($(this).is("#button_filter_type, #filter_search_go_prev, #filter_search_go_next")) {
			return;
		}
		$(this).attr("draggable", "true");
		dragged_button = this;
		// setTimeout(function() {
			// on.addClass("on");
		// },20);
	});
	
	// set dragged button node
	$(document).on("dragstart", ".button", function(event) {
		event.originalEvent.dataTransfer.setData(" "," ");
		event.originalEvent.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);

		// if ($(this).is(".on")) {
			// $(".on").removeClass("on");
			RefreshGUI();
		// }


	});
	
	// remove draggable attribute to clean html which will be saved in the toolbar
	$(document).on("mouseleave", ".button", function(event) {
		$(".button").removeAttr("draggable");
	});
	
	
	
	// drag&drop buttons to lists
	$(document).on("dragenter", "#toolbar_main, .toolbar_shelf, #toolbar_unused_buttons", function(event) {
		if ($(dragged_button).is("#button_tools, #button_search, #button_groups, #button_folders") && $(this).is(".toolbar_shelf")) {
			return;
		}
		if (dragged_button.parentNode.id != this.id) {
			// if ($(dragged_button).is("#button_tools, #button_search, #button_groups, #button_folders") && $(this).is("#toolbar_unused_buttons")) {
				// $(".on").removeClass("on");
			// }
			$("#"+dragged_button.id).appendTo($(this));
		}
	});

	// move (flip) buttons
	$(document).on("dragenter", ".button", function(event) {
		if ($(dragged_button).is("#button_tools, #button_search, #button_groups, #button_folders") && $(this).parent().is(".toolbar_shelf")) {
			return;
		}
		if ($(this).parent().is("#toolbar_search, #toolbar_search_buttons")) {
			return;
		}
		if ( $(this).index() <= $("#"+dragged_button.id).index()) {
			$("#"+dragged_button.id).insertBefore($(this));
		} else {
			$("#"+dragged_button.id).insertAfter($(this));
		}
	});

	// save toolbar
	$(document).on("dragend", ".button", function(event) {
		// let on = $(".on");
		// $(".on").removeClass("on");
		$("#button_filter_clear").css({"opacity": "0"});

		SelectedTheme.toolbar = $("#toolbar").html();
		SelectedTheme.unused_buttons = $("#toolbar_unused_buttons").html();
		SaveTheme($("#theme_list").val());
		$("#button_filter_clear").css({"opacity": "1"});
		// on.addClass("on");
	});
	
	// reset toolbar
	$(document).on("click", "#options_reset_toolbar_button", function(event) {
		SelectedTheme["toolbar"] = DefaultToolbar;
		$("#toolbar").html(DefaultToolbar);
		$("#toolbar_unused_buttons").html("");
		SaveTheme($("#theme_list").val());
	});











// -------------------------OLD COLOR PICKER TO BE REPLACED---------------------------------------------------------------	
		

	// change colors with color pickers
	$(document).on("input", ".cp", function(event) {
		SelectedTheme["ColorsSet"][this.id] = $(this)[0].value;
		
		// console.log(SelectedTheme["ColorsSet"]);
		ApplyColorsSet(SelectedTheme["ColorsSet"]);
		// ColorsSet[this.id] = $(this)[0].value;
		// AppendCSSSheets(SaveTheme($("#theme_list").val()));
	});



	
	// change active_tab_font_bold
	// $(document).on("click", "#active_tab_font_bold", function(event) {
		// SelectedTheme["ColorsSet"]["active_font_weight"] = $(this)[0].checked ? "bold" : "normal";
		// ApplyColorsSet(SelectedTheme["ColorsSet"]);
		
		// console.log(SelectedTheme["ColorsSet"]);
		// ApplyColorsSet(ThemeColors);
		// SaveTheme($("#theme_list").val());
		// AppendCSSSheets(SaveTheme($("#theme_list").val()));
	// });
	








	// show close button on hover
	// $(document).on("mouseenter", ".close", function(event) {
		// $(this).addClass("close_hover");
	// });
	// $(document).on("mouseleave", ".close", function(event) {
		// $(".close_hover").removeClass("close_hover");
	// });
	
	// tabs on hover
	// $(document).on("mouseover", ".tab_header", function(event) {
		// $(this).addClass("tab_header_hover").addClass("close_show");
	// });
	// $(document).on("mouseleave", ".tab_header", function(event) {
		// $(this).removeClass("tab_header_hover").removeClass("close_show");
	// });






// --------------------------------------THEME BUTTONS--------------------------------------------------------------------	


	// add new theme preset button
	$(document).on("click", "#options_add_theme_button", function(event) {
		if (themes.indexOf($("#new_theme_name")[0].value) != -1) {
			alert(chrome.i18n.getMessage("options_there_is_a_theme_with_this_name"));
			return;
		}
		
		if ($("#new_theme_name")[0].value == "") {
			alert(chrome.i18n.getMessage("options_theme_name_cannot_be_empty"));
			return;
		}
		
		$("#toolbar").html(DefaultToolbar);
		SelectedTheme = Object.assign({}, DefaultTheme);
		
		themes.push($("#new_theme_name")[0].value);
		var t_list = document.getElementById("theme_list");
		var	theme_name = document.createElement("option");
			theme_name.value = $("#new_theme_name")[0].value;
			theme_name.text = theme_name.value;
		t_list.add(theme_name);
		
		$("#theme_list")[0].selectedIndex = $("#theme_list")[0].options.length-1;
		
		SaveTheme(theme_name.value);
		
		
		// ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
		// ApplyColorsSet(SelectedTheme["ColorsSet"]);
		// ApplySizeOptionsSet(SelectedTheme["TabsSizeSetNumber"]);
		LoadTheme(theme_name.value);
		
		localStorage["themes"] = JSON.stringify(themes);
		localStorage["current_theme"] = $("#theme_list").val();
		RefreshFields();
	});

	// remove theme preset button
	$(document).on("click", "#options_remove_theme_button", function(event) {
		if ($("#theme_list")[0].options.length == 0) {
			localStorage["current_theme"] = "Default";
			return;
		}

		themes.splice(themes.indexOf($("#theme_list").val()), 1);
		localStorage["themes"] = JSON.stringify(themes);

		localStorage.removeItem("theme"+($("#theme_list").val()));
		var x = document.getElementById("theme_list");
		x.remove(x.selectedIndex);

		localStorage["current_theme"] = ($("#theme_list")[0].options.length > 0) ? $("#theme_list").val() : "Default";
		LoadTheme(localStorage["current_theme"]);
		RefreshFields();
	});
	
	// select theme from list
	$("#theme_list").change(function() {
		localStorage["current_theme"] = $(this).val();
		LoadTheme($(this).val());
	});

	// import theme preset button
	$(document).on("click", "#options_import_theme_button", function(event) {
		$("#import_theme").click();
	});
	$(document).on("change", "#import_theme", function(event) {
		ImportTheme();
	});
	
	// export theme preset button
	$(document).on("click", "#options_export_theme_button", function(event) {
		if ($("#theme_list")[0].options.length == 0) {
			alert(chrome.i18n.getMessage("options_no_theme_to_export"));
		} else {
			ExportTheme($("#theme_list").val() + ".tt_theme");
		}
	});

	// rename theme preset button
	$(document).on("click", "#options_rename_theme_button", function(event) {
		
		if (themes.indexOf($("#new_theme_name")[0].value) != -1) {
			alert(chrome.i18n.getMessage("options_there_is_a_theme_with_this_name"));
			return;
		}
		
		if ($("#new_theme_name")[0].value == "") {
			alert(chrome.i18n.getMessage("options_theme_name_cannot_be_empty"));
			return;
		}

		
		localStorage["theme"+($("#new_theme_name")[0].value)] = localStorage["theme"+($("#theme_list").val())];
		localStorage.removeItem("theme"+($("#theme_list").val()));

		var t_list = document.getElementById("theme_list");
		
		themes[themes.indexOf(t_list.options[t_list.selectedIndex].value)] = $("#new_theme_name")[0].value;
		t_list.options[t_list.selectedIndex].value = t_list.options[t_list.selectedIndex].text = $("#new_theme_name")[0].value;
		localStorage["themes"] = JSON.stringify(themes);
		localStorage["current_theme"] = $("#theme_list").val();
	});





// -------------------------------INDENTATION ADJUSTMENT------------------------------------------------------------------	

	// change tabs size preset(down)
	$(document).on("click", "#options_tabs_indentation_down", function(event) {
		let bod = document.getElementById("body");
		var indentation = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--children_padding_left")).replace("p","").replace("x",""));
		if (indentation > 0) {
			indentation--;
			SelectedTheme["ColorsSet"]["children_padding_left"] = indentation+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme($("#theme_list").val());
		}
	});

	// change tabs size preset(up)
	$(document).on("click", "#options_tabs_indentation_up", function(event) {
		let bod = document.getElementById("body");
		var indentation = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--children_padding_left")).replace("p","").replace("x",""));
		if (indentation < 50) {
			indentation++;
			SelectedTheme["ColorsSet"]["children_padding_left"] = indentation+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme($("#theme_list").val());
		}
	});
	
	
// --------------------------TABS ROUNDNESS ADJUSTMENT--------------------------------------------------------------------	

	// change tabs roundness preset(down)
	$(document).on("click", "#options_tabs_roundness_down", function(event) {
		let bod = document.getElementById("body");
		var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--tab_header_border_radius").replace("p","").replace("x","")));
		if (border_radius > 0) {
			border_radius--;
			SelectedTheme["ColorsSet"]["tab_header_border_radius"] = border_radius+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme($("#theme_list").val());
		}
	});

	// change tabs roundness preset(up)
	$(document).on("click", "#options_tabs_roundness_up", function(event) {
		let bod = document.getElementById("body");
		var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--tab_header_border_radius")).replace("p","").replace("x",""));
		if (border_radius < 25) {
			border_radius++;
			SelectedTheme["ColorsSet"]["tab_header_border_radius"] = border_radius+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme($("#theme_list").val());
		}
	});

// -------------------------------SIZE ADJUSTMENT-------------------------------------------------------------------------	

	// change tabs size preset(down)
	$(document).on("click", "#options_tabs_size_down", function(event) {
		if (SelectedTheme["TabsSizeSetNumber"] > 0) {
			SelectedTheme["TabsSizeSetNumber"]--;
			ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
			ApplySizeOptionsSet(SelectedTheme["TabsSizeSetNumber"]);
			SaveTheme($("#theme_list").val());
		}
	});

	// change tabs size preset(up)
	$(document).on("click", "#options_tabs_size_up", function(event) {
		if (SelectedTheme["TabsSizeSetNumber"] < 4) {
			SelectedTheme["TabsSizeSetNumber"]++;
			ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
			ApplySizeOptionsSet(SelectedTheme["TabsSizeSetNumber"]);
			SaveTheme($("#theme_list").val());
		}
	});


// -------------------------------TABS SCROLLBAR SIZE ADJUSTMENT----------------------------------------------------------	

	// change tab list scrollbar preset(down)
	$(document).on("mousedown", "#options_tab_list_scrollbar_width_down", function(event) {
		let bod = document.getElementById("body");
		var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_width").replace("p","").replace("x","")));
		if (border_radius > 0) {
			border_radius--;
			SelectedTheme["ColorsSet"]["scrollbar_width"] = border_radius+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme($("#theme_list").val());
		}
	});

	// change tab list scrollbar preset(up)
	$(document).on("mousedown", "#options_tab_list_scrollbar_width_up", function(event) {
		let bod = document.getElementById("body");
		var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_width")).replace("p","").replace("x",""));
		if (border_radius < 20) {
			border_radius++;
			SelectedTheme["ColorsSet"]["scrollbar_width"] = border_radius+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme($("#theme_list").val());
		}
	});

	// change pin list scrollbar preset(down)
	$(document).on("mousedown", "#options_tab_list_scrollbar_height_down", function(event) {
		let bod = document.getElementById("body");
		var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_height").replace("p","").replace("x","")));
		if (border_radius > 0) {
			border_radius--;
			SelectedTheme["ColorsSet"]["scrollbar_height"] = border_radius+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme($("#theme_list").val());
		}
	});

	// change pin list scrollbar preset(up)
	$(document).on("mousedown", "#options_tab_list_scrollbar_height_up", function(event) {
		let bod = document.getElementById("body");
		var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_height")).replace("p","").replace("x",""));
		if (border_radius < 20) {
			border_radius++;
			SelectedTheme["ColorsSet"]["scrollbar_height"] = border_radius+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme($("#theme_list").val());
		}
	});



// ----------------------CLEAR DATA BUTTON--------------------------------------------------------------------------------	


	// clear data
	$(document).on("click", "#options_clear_data", function(event) {
		localStorage.clear();
		location.reload();
		chrome.runtime.sendMessage({command: "reload"});
		chrome.runtime.sendMessage({command: "reload_sidebar"});
	});



	
// THIIIIIIIIIIIS IS TO MOVE ICONS FOR SETUP OPTIONS PAGE	
	
	$(document).bind("contextmenu", function(event) {
		if (event.ctrlKey || event.shiftKey) {
			event.preventDefault();
		}
	});
	$(document).on("mousedown", ".pick_col", function(event) {
		event.stopPropagation();
		if (event.button == 0 && event.shiftKey) {
			$(this).css({ "left": $(this).position().left-1 });
		}
		if (event.button == 2 && event.shiftKey) {
			$(this).css({ "left": $(this).position().left+1 });
		}
		if (event.button == 0 && event.ctrlKey) {
			$(this).css({ "top": $(this).position().top-1 });
		}
		if (event.button == 2 && event.ctrlKey) {
			$(this).css({ "top": $(this).position().top+1 });
		}
		console.log(this.id + " top: " + $(this).position().top + "px; left: " + $(this).position().left + "px;");
	});
	
	
	
	
	
	
	
	
	
	
}

// shrink or expand theme field
function RefreshFields() {
	if ($("#theme_list")[0].options.length == 0) {
		$("#field_theme").css({"height": "45px"});
	} else {
		$("#field_theme").css({"height": ""});
	}
	if (browserId != "F") {
		$("#faster_scroll_for_firefox").hide();
	}
	if (browserId == "F") {
		$("#scrollbar_size_indicator").hide();
	}
	if (browserId == "V") {
		$("#url_for_web_panel").val(chrome.runtime.getURL("sidebar.html"));
		$("#url_for_web_panel").prop("readonly", true);
		$("#url_for_web_panel").select();
	} else{
		$("#field_vivaldi").hide();
	}
}



// function RepositionColorPicks() {
	// if ($(".button:first").offset().top > 0){
		// $("#button_icons").css({ "top": $(".button:first").offset().top - 10, "left": $(".button:first").offset().left - 10 });
	// } else {
		// $("#button_icons").css({ "top": -100, "left": -100 });
	// }
// }





function RefreshGUI() {
	$("#button_filter_type").addClass("url").removeClass("title");
	if ($(".button").is(".on")) {
		$("#toolbar").css({ "height": 53 });
	} else {
		$("#toolbar").css({ "height": 26 });
	}
}

function ApplySizeOptionsSet(size){
	for (let si = 0; si < document.styleSheets.length; si++) {
		if ((document.styleSheets[si].ownerNode.id).match("size_settings") != null) {
			if (document.styleSheets[si].ownerNode.id == "size_settings_"+size) {
				document.styleSheets.item(si).disabled = false;
			} else {
				document.styleSheets.item(si).disabled = true;
			}
		}

	}
}

function LoadTheme(themeName) {
	if (localStorage.getItem("theme"+themeName) != null) {
		SelectedTheme = JSON.parse(localStorage["theme"+themeName]);
		setTimeout(function() {
			ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			ApplySizeOptionsSet(SelectedTheme["TabsSizeSetNumber"]);
			
			$("#toolbar").html(SelectedTheme.toolbar);
			$("#toolbar_unused_buttons").html(SelectedTheme.unused_buttons);
			
			// expand toolbar options
			SelectedTheme.ToolbarShow = $("#show_toolbar")[0].checked = SelectedTheme.ToolbarShow;
			$("#field_show_toolbar").css({"height": $("#show_toolbar")[0].checked ? "" : "6"});
			SelectedTheme.ToolbarShow ? $("#options_available_buttons, #toolbar, #toolbar_colors").show() : $("#options_available_buttons, #toolbar, #toolbar_colors").hide();
			
			$("#button_filter_type").addClass("url").removeClass("title");
			$(".on").removeClass("on");
			
			RefreshGUI();
			setTimeout(function() {
				chrome.runtime.sendMessage({command: "reload_theme", themeName: "theme"+themeName});
			}, 200);
		}, 200);
	}
}

function SaveTheme(themeName) {
	localStorage["theme"+themeName] = JSON.stringify(SelectedTheme);
	chrome.runtime.sendMessage({command: "reload_theme", themeName: "theme"+themeName});
	return SelectedTheme;
}
function SavePreferences() {
	localStorage["preferences"] = JSON.stringify(opt);
	setTimeout(function() {
		chrome.runtime.sendMessage({command: "reload_options"});
	},200);
}




// dummy functions
function BindTabsSwitchingToMouseWheel() {}
function GetFaviconAndTitle() {}
function RefreshMediaIcon() {}
