// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********      OPTIONS       ***************

var themes = [];
var SelectedTheme = Object.assign({}, DefaultTheme);
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

	AppendSampleTabs();

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
		if ($("#theme_list")[0].options[i].value == localStorage["current_theme"]) {
			$("#theme_list")[0].selectedIndex = i;
			break;
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
// --------------------------------DONATIONS------------------------------------------------------------------------------
	
	// Donate
	$(document).on("click", "#donate_paypal", function(event) {
		chrome.tabs.create({url: "https://www.paypal.me/KarolJagiello/1"});
	});
	
	$(document).on("click", "#donate_bitcoin", function(event) {
		copyStringToClipboard("19Z8w1RJEcBQpKSdiWa3UTBuKRJUkr96nJ");
		alert(chrome.i18n.getMessage("options_copied_wallet_address"));
	});
	
	$(document).on("click", "#donate_ethereum", function(event) {
		copyStringToClipboard("0x70B05eAD03bF08220d5aF4E1E868C351bfe145D6");
		alert(chrome.i18n.getMessage("options_copied_wallet_address"));
	});
	
	
	
	
// --------------------------------COPY VIVALDI LINK----------------------------------------------------------------------	
	
	$(document).on("click", "#copy_vivaldi_url_for_web_panel", function(event) {
		copyStringToClipboard(chrome.runtime.getURL("sidebar.html"));
		alert(chrome.i18n.getMessage("options_vivaldi_copied_url"));
	});

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
	
	$(document).on("mouseenter", "#scrollbar_thumb_hover", function(event) {
		$("#group_scrollbar_thumb, #pin_list_scrollbar_thumb").addClass("hover_blinking");
	});
	
	$(document).on("mouseleave", "#scrollbar_thumb_hover", function(event) {
		$("#group_scrollbar_thumb, #pin_list_scrollbar_thumb").removeClass("hover_blinking");
	});
	
	$(document).on("mouseenter", "#group_list_button_hover_background", function(event) {
		$("#_tab_list2").addClass("hover_blinking");
	});
	
	$(document).on("mouseleave", "#group_list_button_hover_background", function(event) {
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
		event.stopPropagation();
		SelectedTheme["ColorsSet"][this.id] = $(this).is(".font_weight_normal") ? "normal" : "bold";
		ApplyColorsSet(SelectedTheme["ColorsSet"]);
		SaveTheme($("#theme_list").val());
	});
	
	// change fonts style
	$(document).on("mousedown", ".font_style_normal, .font_style_italic", function(event) {
		event.stopPropagation();
		SelectedTheme["ColorsSet"][this.id] = $(this).is(".font_style_normal") ? "normal" : "italic";
		ApplyColorsSet(SelectedTheme["ColorsSet"]);
		SaveTheme($("#theme_list").val());
	});
	
	
	// show color picker
	$(document).on("click", ".pick_col", function(event) {
		RemoveRedPreview();
		// if (event.shiftKey || event.ctrlKey) return;
		event.stopPropagation();
		PickColor = this.id;
		let bod = document.getElementById("body");
		let color = window.getComputedStyle(bod, null).getPropertyValue("--"+this.id);
		$("#color_picker")[0].value = color.replace(" ", "");
		$("#color_picker").click();
	});
	$(document).on("input", "#color_picker", function(event) {
		event.stopPropagation();
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
	$(document).on("click", "#syncro_tabbar_tabs_order, #allow_pin_close, #switch_with_scroll, #always_show_close, #never_show_close, #close_other_trees, #show_counter_tabs, #show_counter_tabs_hints", function(event) {
		chrome.runtime.sendMessage({command: "reload_sidebar"});
	});
	
	// options that need a total reload
	$(document).on("click", "#groups_toolbar_default", function(event) {
		chrome.runtime.sendMessage({command: "reload"});
		chrome.runtime.sendMessage({command: "reload_sidebar"});
		location.reload();
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
	});
	
	// set dragged button node
	$(document).on("dragstart", ".button", function(event) {
		event.originalEvent.dataTransfer.setData(" "," ");
		event.originalEvent.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
	});
	
	// remove draggable attribute to clean html which will be saved in the toolbar
	$(document).on("mouseleave", ".button", function(event) {
		$(".button").removeAttr("draggable");
	});
	
	
	
	// drag&drop buttons to lists
	$(document).on("dragenter", "#toolbar_main, .toolbar_shelf, #toolbar_unused_buttons", function(event) {
		if ($(dragged_button).is("#button_tools, #button_search, #button_groups, #button_backup, #button_folders") && $(this).is(".toolbar_shelf")) {
			return;
		}
		if (dragged_button.parentNode.id != this.id) {
			// if ($(dragged_button).is("#button_tools, #button_search, #button_groups, #button_backup, #button_folders") && $(this).is("#toolbar_unused_buttons")) {
				// $(".on").removeClass("on");
			// }
			$("#"+dragged_button.id).appendTo($(this));
		}
	});

	// move (flip) buttons
	$(document).on("dragenter", ".button", function(event) {
		if ($(dragged_button).is("#button_tools, #button_search, #button_groups, #button_backup, #button_folders") && $(this).parent().is(".toolbar_shelf")) {
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
		$("#button_filter_clear").css({"opacity": "0"});

		SelectedTheme.toolbar = $("#toolbar").html();
		SelectedTheme.unused_buttons = $("#toolbar_unused_buttons").html();
		SaveTheme($("#theme_list").val());
		$("#button_filter_clear").css({"opacity": "1"});
	});
	
	// reset toolbar
	$(document).on("click", "#options_reset_toolbar_button", function(event) {
		SelectedTheme["toolbar"] = DefaultToolbar;
		SelectedTheme["unused_buttons"] = "";
		$("#toolbar").html(DefaultToolbar);
		$("#toolbar_unused_buttons").html("");
		SaveTheme($("#theme_list").val());
		$(".on").removeClass("on");
		RefreshGUI();
	});


// --------------------------------------THEME BUTTONS--------------------------------------------------------------------	


	// add new theme preset button
	$(document).on("click", "#options_add_theme_button", function(event) {
		AddNewTheme();
	});

	// remove theme preset button
	$(document).on("click", "#options_remove_theme_button", function(event) {
		DeleteSelectedTheme();
	});
	
	// select theme from list
	$("#theme_list").change(function() {
		localStorage["current_theme"] = $(this).val();
		LoadTheme($(this).val());
	});

	// import theme preset button
	$(document).on("click", "#options_import_theme_button", function(event) {
		ShowOpenFileDialog("import_theme", ".tt_theme");
	});
	$(document).on("change", "#import_theme", function(event) {
		ImportTheme();
	});
	
	// export theme preset button
	$(document).on("click", "#options_export_theme_button", function(event) {
		if ($("#theme_list")[0].options.length == 0) {
			alert(chrome.i18n.getMessage("options_no_theme_to_export"));
		} else {
			SaveFile($("#theme_list").val() + ".tt_theme", SelectedTheme);
		}
	});

	// rename theme preset button
	$(document).on("click", "#options_rename_theme_button", function(event) {
		RenameSelectedTheme();
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
		chrome.runtime.sendMessage({command: "reload"});
		chrome.runtime.sendMessage({command: "reload_sidebar"});
		location.reload();
	});



	
// THIIIIIIIIIIIS IS TO MOVE ICONS FOR SETUP OPTIONS PAGE	
	
	// $(document).bind("contextmenu", function(event) {
		// if (event.ctrlKey || event.shiftKey) {
			// event.preventDefault();
		// }
	// });
	// $(document).on("mousedown", "*", function(event) {
	// $(document).on("mousedown", ".pick_col", function(event) {
		// event.stopPropagation();
		// if (event.button == 0 && event.shiftKey) {
			// $(this).css({ "left": $(this).position().left-1 });
		// }
		// if (event.button == 2 && event.shiftKey) {
			// $(this).css({ "left": $(this).position().left+1 });
		// }
		// if (event.button == 0 && event.ctrlKey) {
			// $(this).css({ "top": $(this).position().top-1 });
		// }
		// if (event.button == 2 && event.ctrlKey) {
			// $(this).css({ "top": $(this).position().top+1 });
		// }
		// console.log(this.id + " top: " + $(this).position().top + "px; left: " + $(this).position().left + "px;");
		// console.log(this.id);
	// });
}


function copyStringToClipboard(string) {
	function handler (event){
		event.clipboardData.setData('text/plain', string);
		event.preventDefault();
		document.removeEventListener('copy', handler, true);
	}
	document.addEventListener('copy', handler, true);
	document.execCommand('copy');
}


// dummy functions
function BindTabsSwitchingToMouseWheel() {}
function GetFaviconAndTitle() {}
function RefreshMediaIcon() {}