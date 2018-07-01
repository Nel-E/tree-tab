// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********      OPTIONS       ***************

var current_theme = "";
var themes = [];
var SelectedTheme = Object.assign({}, DefaultTheme);
var dragged_button = {id: ""};

// options for all drop down menus
let DropDownList = ["dbclick_folder", "midclick_folder", "midclick_tab", "dbclick_group", "midclick_group", "dbclick_tab", "append_child_tab", "append_child_tab_after_limit", "append_orphan_tab", "after_closing_active_tab", "move_tabs_on_url_change"];

document.addEventListener("DOMContentLoaded", function() {
	document.title = "Tree Tabs";
	chrome.storage.local.get(null, function(storage) {
		
		AppendGroupToList("tab_list", labels.ungrouped_group, "", false);
		AppendGroupToList("tab_list2", labels.noname_group, "", false);
		AppendSampleTabs();
	
		GetCurrentPreferences(storage);

		if (storage["themes"]) {
			for (var themeName in storage["themes"]) {
				themes.push(themeName);
			}
		}
		if (storage["current_theme"]) {
			current_theme = storage["current_theme"];
			LoadTheme(storage["current_theme"]);
		}
		

		if (storage["unused_buttons"]) {
			RecreateToolbarUnusedButtons(storage["unused_buttons"]);
		}

		RecreateToolbar(GetCurrentToolbar(storage));
		SetToolbarEvents(false, false, true, "click");
		AddEditToolbarEditEvents();

		
		GetOptions(storage);
		RefreshFields();
		SetEvents();

	
		setTimeout(function() {
			document.querySelectorAll(".on").forEach(function(s){
				s.classList.remove("on");
			});
			RefreshGUI();
		}, 100);
	});
});

function SetRegexes() {
	let regexes = document.getElementById('tab_group_regexes');
	opt.tab_group_regexes = [];
	for (let child of regexes.children) {
		var regex = child.children[0].value.trim();
		var groupName = child.children[1].value.trim();
		if (regex !== "" && groupName !== "") {
			opt.tab_group_regexes.push([regex, groupName]);
		}
	}
	SavePreferences();
}

function AddRegexPair() {
	let regexes = document.getElementById('tab_group_regexes');
	let outer = document.createElement("div");

	let input = document.createElement("input");
	input.type = "text";
	input.style.width = '200px';
	input.onchange = SetRegexes;
	input.onkeyup = SetRegexes;
	outer.appendChild(input);

	input = document.createElement("input");
	input.type = "text";
	input.style.width = '200px';
	input.onchange = SetRegexes;
	input.onkeyup = SetRegexes;
	outer.appendChild(input);
	
	let deleteButton = document.createElement("input");
	deleteButton.type = "button";
	deleteButton.style.width = '75px';
	deleteButton.className = "set_button theme_buttons";
	deleteButton.value = chrome.i18n.getMessage("options_Remove_button");
	deleteButton.onclick = function() { regexes.removeChild(outer); }
	outer.appendChild(deleteButton);
	
	regexes.appendChild(outer);
	return outer;
}

// document events
function GetOptions(storage) {
	// get language labels
	document.querySelectorAll(".label, .set_button, .bg_opt_drop_down_menu").forEach(function(s){
		s.textContent = chrome.i18n.getMessage(s.id);
	});	

	// get language for menu labels
	document.querySelectorAll(".menu_item").forEach(function(s){
		s.textContent = chrome.i18n.getMessage("options_example_menu_item");
	});	
	
	// get checkboxes from saved states
	document.querySelectorAll(".opt_checkbox").forEach(function(s){
		s.checked = opt[s.id];
		if (s.checked) {
			if (s.id == "never_show_close") {
				document.getElementById("always_show_close").disabled = true;
			}
		} else {
			if (s.id == "promote_children") {
				document.getElementById("promote_children_in_first_child").disabled = true;
			}
		}
	});	
	
	// get language labels
	document.querySelectorAll(".pick_col, #close_x, #close_hover_x, .options_button_minus, .options_button_plus, .tabs_margin_spacing").forEach(function(s){
		s.title = chrome.i18n.getMessage(s.id);
	});
	

	// get options for all drop down menus (loop through all drop down items that are in DropDownList array)
	for (let i = 0; i < DropDownList.length; i++) {
		let DropDownOption = document.getElementById(DropDownList[i]);
		for (let j = 0; j < DropDownOption.options.length; j++) {
			if (DropDownOption.options[j].value == opt[DropDownList[i]]) {
				DropDownOption.selectedIndex = j;
				break;
			}
		}
		RefreshFields();
	}
	
	for (let i = 0; i < opt.tab_group_regexes.length; i++) {
		let regexPair = opt.tab_group_regexes[i];
		let outer = AddRegexPair();
		outer.children[0].value = regexPair[0];
		outer.children[1].value = regexPair[1]
	}

	// get options for tabs tree depth option
	document.getElementById("max_tree_depth").value = opt.max_tree_depth;


	// append themes to dropdown menu
	let ThemeList = document.getElementById("theme_list");
	for (var i = 0; i < themes.length; i++) {
		let theme_name = document.createElement("option");
		theme_name.value = themes[i];
		theme_name.text = storage.themes[themes[i]].theme_name;
		ThemeList.add(theme_name);
	}
	// select current theme in dropdown list
	for (var i = 0; i < ThemeList.options.length; i++) {
		if (ThemeList.options[i].value == current_theme) {
			ThemeList.selectedIndex = i;
			break;
		}
	}
}

function RemovePreview() {
	document.querySelectorAll(".hover_blinking").forEach(function(s){s.classList.remove("hover_blinking");});
	document.querySelectorAll(".hover_border_blinking").forEach(function(s){s.classList.remove("hover_border_blinking");});
	document.querySelectorAll(".red_preview").forEach(function(s){
		s.style.backgroundColor = "";
		s.style.border = "";
		s.style.borderBottom = "";
		s.style.borderRight = "";
		s.style.color = "";
		s.style.animation = "";
		s.style.fontWeight = "";
		s.style.fontStyle = "";
		// s.style.zIndex = "";
		s.classList.remove("red_preview");
	});
}



function AddRedStylePreview(Id, style, value, removePreview) {
	if (removePreview) RemovePreview();
	let d = document.getElementById(Id);
	d.classList.add("red_preview");
	d.style[style] = value;
}

function AddBlueBackgroundPreview(Id, removePreview) {
	if (removePreview) RemovePreview();
	document.getElementById(Id).classList.add("hover_blinking");
}
function AddBlueBorderPreview(Id, removePreview) {
	if (removePreview) RemovePreview();
	document.getElementById(Id).classList.add("hover_border_blinking");
}


// document events
function SetEvents() {
// --------------------------------DONATIONS-----------------------------------------------------------------------------
	
	document.getElementById("donate_paypal").onclick = function(event) {if (event.which == 1) {
		chrome.tabs.create({url: "https://www.paypal.me/KarolJagiello/1"});
	}}
	document.getElementById("donate_litecoin").onclick = function(event) {if (event.which == 1) {
		copyStringToClipboard("LdQ1ZH1CgSneBbmmVBFrg5BFDFHZMa6h76");
		alert(chrome.i18n.getMessage("options_copied_wallet_address"));
	}}
	document.getElementById("donate_bitcoin").onclick = function(event) {if (event.which == 1) {
		copyStringToClipboard("19Z8w1RJEcBQpKSdiWa3UTBuKRJUkr96nJ");
		alert(chrome.i18n.getMessage("options_copied_wallet_address"));
	}}
	document.getElementById("donate_ethereum").onclick = function(event) {if (event.which == 1) {
		copyStringToClipboard("0x70B05eAD03bF08220d5aF4E1E868C351bfe145D6");
		alert(chrome.i18n.getMessage("options_copied_wallet_address"));
	}}
	
// --------------------------------COPY VIVALDI LINK----------------------------------------------------------------------	
	
	document.getElementById("copy_vivaldi_url_for_web_panel").onclick = function(event) {if (event.which == 1) {
			copyStringToClipboard(chrome.runtime.getURL("sidebar.html"));
			alert(chrome.i18n.getMessage("options_vivaldi_copied_url"));
	}}

// --------------------------------ADD RED AND BLUE PREVIEWS---------------------------------------------------------------
	// document.body.onmousedown = function(event) {
		// if (event.which == 1 && (event.target.id || event.target.classList)) {
			// console.log(event.target);
		// }
	// }
	
	
	document.querySelectorAll("#scrollbar_thumb_hover, #options_tab_list_scrollbar_height_up, #options_tab_list_scrollbar_height_down, #options_tab_list_scrollbar_width_up, #options_tab_list_scrollbar_width_down, .pick_col, .font_weight_normal, .font_weight_bold, .font_style_normal, .font_style_italic, #filter_box_font").forEach(function(s){s.onmouseleave = function(event) {
		RemovePreview();
	}});

	// toolbar buttons
	document.getElementById("button_background").onmouseenter = function(event) {
		AddRedStylePreview("button_theme_plus", "backgroundColor", "red", true);
	}
	document.getElementById("button_hover_background").onmouseenter = function(event) {
		AddBlueBackgroundPreview("button_theme_plus", true);
	}

	document.getElementById("button_on_background").onmouseenter = function(event) {
		AddRedStylePreview("button_theme_search", "backgroundColor", "red", true);
	}
	
	document.getElementById("button_icons").onmouseenter = function(event) {
		AddRedStylePreview("button_theme_plus_img", "backgroundColor", "red", true);
	}
	document.getElementById("button_icons_hover").onmouseenter = function(event) {
		AddBlueBackgroundPreview("button_theme_plus_img", true);
	}
	document.getElementById("button_on_icons").onmouseenter = function(event) {
		AddRedStylePreview("button_theme_search_img", "backgroundColor", "red", true);
	}

	document.getElementById("button_border").onmouseenter = function(event) {
		AddRedStylePreview("button_theme_plus", "border", "1px solid red", true);
	}
	document.getElementById("button_hover_border").onmouseenter = function(event) {
		AddBlueBorderPreview("button_theme_plus", true);
	}


	// search box
	document.getElementById("filter_box_font").onmouseenter = function(event) {
		AddRedStylePreview("filter_box_theme", "color", "red", true);
	}
	document.getElementById("filter_box_background").onmouseenter = function(event) {
		AddRedStylePreview("filter_box_theme", "backgroundColor", "red", true);
	}
	document.getElementById("filter_box_border").onmouseenter = function(event) {
		AddRedStylePreview("filter_box_theme", "border", "1px solid red", true);
	}
	document.getElementById("filter_clear_icon").onmouseenter = function(event) {
		AddRedStylePreview("button_filter_clear_theme", "backgroundColor", "red", true);
	}
	
	// toolbar background
	document.getElementById("toolbar_background").onmouseenter = function(event) {
		AddRedStylePreview("toolbar_main_theme", "backgroundColor", "red", true);
	}

	// shelf toolbar background
	document.getElementById("toolbar_shelf_background").onmouseenter = function(event) {
		AddRedStylePreview("toolbar_search_input_box_theme", "backgroundColor", "red", true);
	}

	// toolbar's border
	document.getElementById("toolbar_border_bottom").onmouseenter = function(event) {
		AddRedStylePreview("button_theme_search", "border", "1px solid red", true);
		AddRedStylePreview("toolbar_main_theme", "borderBottom", "1px solid red");
		AddRedStylePreview("toolbar_theme", "borderBottom", "1px solid red");
	}
	
	// shelf toolbar buttons
	document.getElementById("button_shelf_background").onmouseenter = function(event) {
		AddRedStylePreview("button_theme_pen", "backgroundColor", "red", true);
	}
	document.getElementById("button_shelf_hover_background").onmouseenter = function(event) {
		AddBlueBackgroundPreview("button_theme_pen", true);
	}
	document.getElementById("button_shelf_icons").onmouseenter = function(event) {
		AddRedStylePreview("button_theme_pen_img", "backgroundColor", "red", true);
	}
	document.getElementById("button_shelf_icons_hover").onmouseenter = function(event) {
		AddBlueBackgroundPreview("button_theme_pen_img", true);
	}
	document.getElementById("button_shelf_border").onmouseenter = function(event) {
		AddRedStylePreview("button_theme_pen", "border", "1px solid red", true);
	}
	document.getElementById("button_shelf_hover_border").onmouseenter = function(event) {
		AddBlueBorderPreview("button_theme_pen", true);
	}

	// pinned tab attention_background
	document.getElementById("attention_background").onmouseenter = function(event) {
		AddRedStylePreview("tab_header10", "backgroundColor", "red", true);
		document.getElementById("tab_header10").style.animation = "none";
	}

	// pinned tab attention_border
	document.getElementById("attention_border").onmouseenter = function(event) {
		AddRedStylePreview("tab_header10", "border", "1px solid red", true);
		document.getElementById("tab_header10").style.animation = "none";
	}

	// pin_list border bottom
	document.getElementById("pin_list_border_bottom").onmouseenter = function(event) {
		AddRedStylePreview("pin_list", "borderBottom", "1px solid red", true);
	}

	// pin_list background
	document.getElementById("pin_list_background").onmouseenter = function(event) {
		AddRedStylePreview("pin_list", "backgroundColor", "red", true);
	}
	
	
	// tab row font_color
	document.querySelectorAll(".tab_col.font_color").forEach(function(s){s.onmouseenter = function(event) {
		AddRedStylePreview("tab_title" + this.parentNode.id.substr(1), "color", "red", true);
	}});

	// tab row font not bold
	document.querySelectorAll(".tab_col.font_weight_normal").forEach(function(s){s.onmouseenter = function(event) {
		AddRedStylePreview("tab_title" + this.parentNode.id.substr(1), "color", "red", true);
		AddRedStylePreview("tab_title" + this.parentNode.id.substr(1), "fontWeight", "normal", false);
	}});

	// tab row font bold
	document.querySelectorAll(".tab_col.font_weight_bold").forEach(function(s){s.onmouseenter = function(event) {
		AddRedStylePreview("tab_title" + this.parentNode.id.substr(1), "color", "red", true);
		AddRedStylePreview("tab_title" + this.parentNode.id.substr(1), "fontWeight", "bold", false);
	}});

	// tab row font style normal
	document.querySelectorAll(".tab_col.font_style_normal").forEach(function(s){s.onmouseenter = function(event) {
		AddRedStylePreview("tab_title" + this.parentNode.id.substr(1), "color", "red", true);
		AddRedStylePreview("tab_title" + this.parentNode.id.substr(1), "fontStyle", "normal", false);
	}});
	// tab row font style italic
	document.querySelectorAll(".tab_col.font_style_italic").forEach(function(s){s.onmouseenter = function(event) {
		AddRedStylePreview("tab_title" + this.parentNode.id.substr(1), "color", "red", true);
		AddRedStylePreview("tab_title" + this.parentNode.id.substr(1), "fontStyle", "italic", false);
	}});
	
	
	// tab border
	document.querySelectorAll(".tab_col.color_border").forEach(function(s){s.onmouseenter = function(event) {
		AddRedStylePreview("tab_header" + this.parentNode.id.substr(1), "border", "1px solid red", true);
	}});
	
	// tab background
	document.querySelectorAll(".tab_col.color_bucket").forEach(function(s){s.onmouseenter = function(event) {
		AddRedStylePreview("tab_header" + this.parentNode.id.substr(1), "backgroundColor", "red", true);
	}});
	
	// scrollbars hover
	document.getElementById("scrollbar_thumb_hover").onmouseenter = function(event) {
		AddBlueBackgroundPreview("group_scrollbar_thumb", true);
		AddBlueBackgroundPreview("pin_list_scrollbar_thumb");
	}
	
	// scrollbars thumb
	document.getElementById("scrollbar_thumb").onmouseenter = function(event) {
		AddRedStylePreview("group_scrollbar_thumb", "backgroundColor", "red", true);
		AddRedStylePreview("pin_list_scrollbar_thumb", "backgroundColor", "red");
	}
	
	
	// scrollbars track
	document.getElementById("scrollbar_track").onmouseenter = function(event) {
		AddRedStylePreview("group_scrollbar", "backgroundColor", "red", true);
		AddRedStylePreview("pin_list_scrollbar", "backgroundColor", "red");
	}
	

	// tab_list scrollbars
	document.querySelectorAll("#options_tab_list_scrollbar_width_up, #options_tab_list_scrollbar_width_down").forEach(function(s){s.onmouseenter = function(event) {
		AddRedStylePreview("group_scrollbar", "backgroundColor", "red", true);
		AddRedStylePreview("group_scrollbar_thumb", "backgroundColor", "red");
	}});
	
	// pin_list scrollbars
	document.querySelectorAll("#options_tab_list_scrollbar_height_up, #options_tab_list_scrollbar_height_down").forEach(function(s){s.onmouseenter = function(event) {
		AddRedStylePreview("pin_list_scrollbar", "backgroundColor", "red", true);
		AddRedStylePreview("pin_list_scrollbar_thumb", "backgroundColor", "red");
	}});



	// folder icon open
	document.getElementById("folder_icon_open").onmouseenter = function(event) {
		AddRedStylePreview("fopf_folder1", "backgroundColor", "red", true);
	}
	// folder icon closed
	document.getElementById("folder_icon_closed").onmouseenter = function(event) {
		AddRedStylePreview("fopf_folder2", "backgroundColor", "red", true);
	}
	// folder icon hover
	document.getElementById("folder_icon_hover").onmouseenter = function(event) {
		AddBlueBackgroundPreview("fopf_folder3", true);
	}


	// tab expand closed
	document.getElementById("expand_closed_background").onmouseenter = function(event) {
		AddRedStylePreview("exp14", "backgroundColor", "red", true);
	}
	// tab expand hover
	document.getElementById("expand_hover_background").onmouseenter = function(event) {
		AddBlueBackgroundPreview("exp16", true);
	}
	// tab expand open
	document.getElementById("expand_open_background").onmouseenter = function(event) {
		AddRedStylePreview("exp5", "backgroundColor", "red", true);
	}


	
	
	
	// drag indicator
	document.getElementById("drag_indicator").onmouseenter = function(event) {
		AddRedStylePreview("di19", "borderBottom", "1px solid red", true);
	}


	// close x
	document.getElementById("close_x").onmouseenter = function(event) {
		AddRedStylePreview("close_img11", "backgroundColor", "red", true);
	}
	// close x hover
	document.getElementById("close_hover_x").onmouseenter = function(event) {
		AddBlueBackgroundPreview("close_img13", true);
	}
	// close border hover
	document.getElementById("close_hover_border").onmouseenter = function(event) {
		AddBlueBorderPreview("close13", true);
	}
	// close border hover
	document.getElementById("close_hover_background").onmouseenter = function(event) {
		AddBlueBackgroundPreview("close13", true);
	}


	
	
	// group button hover
	document.getElementById("group_list_button_hover_background").onmouseenter = function(event) {
		AddBlueBackgroundPreview("_tab_list2", true);
	}
	// group buttons borders
	document.getElementById("group_list_borders").onmouseenter = function(event) {
		AddRedStylePreview("toolbar_groups_block", "borderRight", "1px solid red", true);
		AddRedStylePreview("_tab_list", "border", "1px solid red");
	}
	// group buttons font
	document.getElementById("group_list_default_font_color").onmouseenter = function(event) {
		AddRedStylePreview("_gtetab_list", "color", "red", true);
		AddRedStylePreview("_gtetab_list2", "color", "red");
	}
	// group list background
	document.getElementById("group_list_background").onmouseenter = function(event) {
		AddRedStylePreview("toolbar_groups_block", "backgroundColor", "red", true);
	}
	// tab_list background
	document.getElementById("tab_list_background").onmouseenter = function(event) {
		AddRedStylePreview("tab_list", "backgroundColor", "red", true);
		AddRedStylePreview("_tab_list", "backgroundColor", "red");
	}

	
	
	
	
	// menu hover border
	document.getElementById("tabs_menu_hover_border").onmouseenter = function(event) {
		AddRedStylePreview("menu_hover_sample", "border", "1px solid red", true);
	}
	// menu hover background
	document.getElementById("tabs_menu_hover_background").onmouseenter = function(event) {
		AddRedStylePreview("menu_hover_sample", "backgroundColor", "red", true);
	}

	// menu separator
	document.getElementById("tabs_menu_separator").onmouseenter = function(event) {
		AddRedStylePreview("menu_separator1", "backgroundColor", "red", true);
		AddRedStylePreview("menu_separator2", "backgroundColor", "red");
	}

	// menu font
	document.getElementById("tabs_menu_font").onmouseenter = function(event) {
		AddRedStylePreview("menu_hover_sample", "color", "red", true);
		AddRedStylePreview("menu_sample1", "color", "red");
		AddRedStylePreview("menu_sample2", "color", "red");
	}


	// menu border
	document.getElementById("tabs_menu_border").onmouseenter = function(event) {
		AddRedStylePreview("tabs_menu", "border", "1px solid red", true);
	}

	// menu background
	document.getElementById("tabs_menu_background").onmouseenter = function(event) {
		AddRedStylePreview("tabs_menu", "backgroundColor", "red", true);
	}



// --------------------------------------COLOR PICKER---------------------------------------------------------------------	
	
	// change fonts weight && style
	document.querySelectorAll(".font_weight_normal, .font_weight_bold, .font_style_normal, .font_style_italic").forEach(function(s){s.onmousedown = function(event) {
		event.stopPropagation();
		// if this.classList.contains("font_weight_normal") || this.classList.contains("font_style_normal")
		let FontStyle = "normal";
		if (this.classList.contains("font_weight_bold")) {
			FontStyle = "bold";
		}
		if (this.classList.contains("font_style_italic")) {
			FontStyle = "italic";
		}
		SelectedTheme["ColorsSet"][this.id] = FontStyle;
		ApplyColorsSet(SelectedTheme["ColorsSet"]);
		SaveTheme(document.getElementById("theme_list").value);
	}});

	// show color picker
	document.querySelectorAll(".pick_col").forEach(function(s){s.onclick = function(event) {if (event.which == 1) {
		RemovePreview();
		event.stopPropagation();
		let bod = document.getElementById("body");
		let color = window.getComputedStyle(bod, null).getPropertyValue("--"+this.id);
		let ColorPicker = document.getElementById("color_picker");
		ColorPicker.setAttribute("PickColor", this.id);
		ColorPicker.value = color.replace(" ", "");
		ColorPicker.click();
	}}});

	document.getElementById("color_picker").oninput = function(event) {
		let ColorPicker = document.getElementById("color_picker");
		SelectedTheme["ColorsSet"][this.getAttribute("PickColor")] = ColorPicker.value;
		ApplyColorsSet(SelectedTheme["ColorsSet"]);
		// SaveTheme(document.getElementById("theme_list").value);
	}
	document.getElementById("color_picker").onchange = function(event) {
		SaveTheme(document.getElementById("theme_list").value);
	}


// ----------------------------------EVENTS FOR CHECKBOXES AND DROPDOWN MENUS---------------------------------------------	

	// set checkbox options on/off and save
	document.querySelectorAll(".bg_opt").forEach(function(s){s.onclick = function(event) {if (event.which == 1) {
		opt[this.id] = this.checked ? true : false;
		if (this.checked) {
			if (this.id == "never_show_close") {
				document.getElementById("always_show_close").disabled = true;
			}
			if (this.id == "promote_children") {
				document.getElementById("promote_children_in_first_child").disabled = false;
			}
		} else {
			if (this.id == "never_show_close") {
				document.getElementById("always_show_close").disabled = false;
			}
			if (this.id == "promote_children") {
				document.getElementById("promote_children_in_first_child").disabled = true;
			}
		}
		SavePreferences();
		if (this.id == "show_toolbar") {
			SaveToolbar();
			RefreshFields();

			
			// setTimeout(function() {
				// chrome.runtime.sendMessage({command: "reload_toolbar", toolbar: toolbar, opt: opt});
			// }, 300);
		}
	}}});


	// options that need reload
	document.onclick = function(event) {if (event.which == 1) {
		if (event.target.id == "syncro_tabbar_tabs_order" || event.target.id == "allow_pin_close" || event.target.id == "switch_with_scroll" || event.target.id == "always_show_close" || event.target.id == "never_show_close" || event.target.id == "hide_other_groups_tabs_firefox" || 
			event.target.id == "collapse_other_trees" || event.target.id == "show_counter_tabs" || event.target.id == "show_counter_tabs_hints" || event.target.id == "syncro_tabbar_tabs_order" || event.target.id == "syncro_tabbar_groups_tabs_order" || event.target.id == "groups_toolbar_default") {
			setTimeout(function() {
				chrome.runtime.sendMessage({command: "reload_sidebar"});
			}, 50);
		}
		if (event.target.id == "groups_toolbar_default") {
			chrome.runtime.sendMessage({command: "reload"});
			setTimeout(function() {
				location.reload();
			}, 300);
		}
	}}

	// set dropdown menu options
	for (let i = 0; i < DropDownList.length; i++) {
		document.getElementById(DropDownList[i]).onchange = function(event) {
			opt[this.id] = this.value;
			RefreshFields();
			setTimeout(function() {
				SavePreferences();
				// chrome.runtime.sendMessage({command: "reload_sidebar"});
			}, 50);
		}
	}

	// set tabs tree depth option
	document.getElementById("max_tree_depth").oninput = function(event) {
		opt.max_tree_depth = parseInt(this.value);
		setTimeout(function() {
			SavePreferences();
		}, 50);
	}
	
	// set toolbar on/off and show/hide all toolbar options
	// document.getElementById("show_toolbar").onclick = function(event) {if (event.which == 1) {
		// SelectedTheme.ToolbarShow = this.checked ? true : false;
		// RefreshFields();
		// SaveTheme(document.getElementById("theme_list").value);
	// }}

	
// ------------------------------OTHER-----------------------------------------------------------------------------------	

	// block system dragging
	document.ondrop = function(event) {
		event.preventDefault();
	}
	document.ondragover = function(event) {
		event.preventDefault();
	}
	
// ------------------------------ADD REGEX FILTER-------------------------------------------------------------------------	

	document.getElementById("add_tab_group_regex").onclick = AddRegexPair;
	
// ----------------------------RESET TOOLBAR BUTTON-----------------------------------------------------------------------	
	
	document.getElementById("options_reset_toolbar_button").onclick = function(event) {if (event.which == 1) {

		SetToolbarEvents(true, false, false, "");
		RemoveToolbarEditEvents();
		

		let unused_buttons = document.getElementById("toolbar_unused_buttons");
		while(unused_buttons.hasChildNodes()) {
			unused_buttons.removeChild(unused_buttons.firstChild);
		}
		
		RemoveToolbar();
		RecreateToolbar(DefaultToolbar);
		SetToolbarEvents(false, false, true, "click");
		AddEditToolbarEditEvents();
		
		SaveToolbar();
		
		
	}}


// --------------------------------------THEME BUTTONS--------------------------------------------------------------------	


	// add new theme preset button
	document.getElementById("options_add_theme_button").onclick = function(event) {if (event.which == 1) {
		AddNewTheme();
	}}

	// remove theme preset button
	document.getElementById("options_remove_theme_button").onclick = function(event) {if (event.which == 1) {
		DeleteSelectedTheme();
	}}
	
	// select theme from list
	document.getElementById("theme_list").onchange = function(event) {
		LoadTheme(this.value, true);
		chrome.storage.local.set({current_theme: this.value});
	}

	// import theme preset button
	document.getElementById("options_import_theme_button").onclick = function(event) {if (event.which == 1) {
		let inputFile = ShowOpenFileDialog(".tt_theme");
		inputFile.onchange = function(event) {
			ImportTheme();
		}						
	}}

	// export theme preset button
	document.getElementById("options_export_theme_button").onclick = function(event) {if (event.which == 1) {
		let ThemeList = document.getElementById("theme_list");
		if (ThemeList.options.length == 0) {
			alert(chrome.i18n.getMessage("options_no_theme_to_export"));
		} else {
			SaveFile(ThemeList.options[ThemeList.selectedIndex].text, "tt_theme", SelectedTheme);
		}
	}}

	// rename theme preset button
	document.getElementById("options_rename_theme_button").onclick = function(event) {if (event.which == 1) {
		RenameSelectedTheme();
	}}
	// get themes
	document.getElementById("options_share_theme_link").onclick = function(event) {if (event.which == 1) {
		chrome.tabs.create({url: "https://drive.google.com/drive/folders/0B3jXQpRtOfvSelFrTEVHZEx3Nms?usp=sharing"});
	}}


// -------------------------------INDENTATION ADJUSTMENT------------------------------------------------------------------	

	// change tabs size preset(down)
	document.getElementById("options_tabs_indentation_down").onmousedown = function(event) {
		let bod = document.getElementById("body");
		var indentation = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--children_padding_left")).replace("p","").replace("x",""));
		if (indentation > 0) {
			indentation--;
			SelectedTheme["ColorsSet"]["children_padding_left"] = indentation+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme(document.getElementById("theme_list").value);
		}
	}

	// change tabs size preset(up)
	document.getElementById("options_tabs_indentation_up").onmousedown = function(event) {
		let bod = document.getElementById("body");
		var indentation = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--children_padding_left")).replace("p","").replace("x",""));
		if (indentation < 50) {
			indentation++;
			SelectedTheme["ColorsSet"]["children_padding_left"] = indentation+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme(document.getElementById("theme_list").value);
		}
	}
	
	
// --------------------------TABS ROUNDNESS ADJUSTMENT--------------------------------------------------------------------	

	// change tabs roundness preset(down)
	document.getElementById("options_tabs_roundness_down").onmousedown = function(event) {
		let bod = document.getElementById("body");
		var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--tab_header_border_radius").replace("p","").replace("x","")));
		if (border_radius > 0) {
			border_radius--;
			SelectedTheme["ColorsSet"]["tab_header_border_radius"] = border_radius+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme(document.getElementById("theme_list").value);
		}
	}

	// change tabs roundness preset(up)
	document.getElementById("options_tabs_roundness_up").onmousedown = function(event) {
		let bod = document.getElementById("body");
		var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--tab_header_border_radius")).replace("p","").replace("x",""));
		if (border_radius < 25) {
			border_radius++;
			SelectedTheme["ColorsSet"]["tab_header_border_radius"] = border_radius+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme(document.getElementById("theme_list").value);
		}
	}

// -------------------------------SIZE ADJUSTMENT-------------------------------------------------------------------------	

	// set tabs margins
	document.getElementById("tabs_margin_spacing").onchange = function(event) {
		let size = "0";
		if (this[1].checked) {
			size = "1";
		} else {
			if (this[2].checked) {
				size = "2";
			}
		}
		SelectedTheme["TabsMargins"] = size;
		ApplyTabsMargins(size);
		SaveTheme(document.getElementById("theme_list").value);
	}


	// change tabs size preset(down)
	document.getElementById("options_tabs_size_down").onmousedown = function(event) {
		if (SelectedTheme["TabsSizeSetNumber"] > 0) {
			SelectedTheme["TabsSizeSetNumber"]--;
			ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
			SaveTheme(document.getElementById("theme_list").value);
		}
	}

	// change tabs size preset(up)
	document.getElementById("options_tabs_size_up").onmousedown = function(event) {
		if (SelectedTheme["TabsSizeSetNumber"] < 4) {
			SelectedTheme["TabsSizeSetNumber"]++;
			ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
			SaveTheme(document.getElementById("theme_list").value);
		}
	}


// -------------------------------TABS SCROLLBAR SIZE ADJUSTMENT----------------------------------------------------------	

	// change tab list scrollbar preset(down)
	document.getElementById("options_tab_list_scrollbar_width_down").onmousedown = function(event) {
		let bod = document.getElementById("body");
		var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_width").replace("p","").replace("x","")));
		if (border_radius > 0) {
			border_radius--;
			SelectedTheme["ColorsSet"]["scrollbar_width"] = border_radius+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme(document.getElementById("theme_list").value);
		}
	}

	// change tab list scrollbar preset(up)
	document.getElementById("options_tab_list_scrollbar_width_up").onmousedown = function(event) {
		let bod = document.getElementById("body");
		var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_width")).replace("p","").replace("x",""));
		if (border_radius < 20) {
			border_radius++;
			SelectedTheme["ColorsSet"]["scrollbar_width"] = border_radius+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme(document.getElementById("theme_list").value);
		}
	}

	// change pin list scrollbar preset(down)
	document.getElementById("options_tab_list_scrollbar_height_down").onmousedown = function(event) {
		let bod = document.getElementById("body");
		var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_height").replace("p","").replace("x","")));
		if (border_radius > 0) {
			border_radius--;
			SelectedTheme["ColorsSet"]["scrollbar_height"] = border_radius+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme(document.getElementById("theme_list").value);
		}
	}

	// change pin list scrollbar preset(up)
	document.getElementById("options_tab_list_scrollbar_height_up").onmousedown = function(event) {
		let bod = document.getElementById("body");
		var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_height")).replace("p","").replace("x",""));
		if (border_radius < 20) {
			border_radius++;
			SelectedTheme["ColorsSet"]["scrollbar_height"] = border_radius+"px";
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			SaveTheme(document.getElementById("theme_list").value);
		}
	}



// ----------------------EXPORT DEBUG LOG---------------------------------------------------------------------------------	
	document.getElementById("options_export_debug").onclick = function(event) {if (event.which == 1) {
		chrome.storage.local.get(null, function(storage) {
			SaveFile("TreeTabs", "log", storage.debug_log);
		});
	}}

// ----------------------IMPORT DEBUG LOG----------------------------------------------------------------------------	
	document.getElementById("options_print_debug").onclick = function(event) {if (event.which == 1) {
		let inputFile = ShowOpenFileDialog(".log");
		inputFile.onchange = function(event) {
			let file = document.getElementById("file_import");
			let fr = new FileReader();
			if (file.files[0] == undefined) return;
			fr.readAsText(file.files[file.files.length - 1]);
			fr.onload = function() {
				let data = fr.result;
				file.parentNode.removeChild(file);
				let LoadedData = JSON.parse(data);
				// LoadedData.forEach(function(d){
					// console.log(d);
				// });
				// LoadedData.forEach(function(d){
					console.log(LoadedData);
				// });
			}
		}						

	}}

// ----------------------CLEAR DATA BUTTON--------------------------------------------------------------------------------	

	// clear data
	document.getElementById("options_clear_data").onclick = function(event) {if (event.which == 1) {
		chrome.storage.local.clear();
		setTimeout(function() {
			chrome.runtime.sendMessage({command: "reload"});
			chrome.runtime.sendMessage({command: "reload_sidebar"});
			location.reload();
		}, 100);
	}}

}

function RemoveToolbarEditEvents() {
	document.querySelectorAll("#button_filter_clear").forEach(function(s){
		s.style.opacity = "0";
	});
	document.querySelectorAll(".button").forEach(function(s){
		s.removeAttribute("draggable");
	});
}

// ----------------------EDIT TOOLBAR-------------------------------------------------------------------------------------	
function AddEditToolbarEditEvents() {
	document.querySelectorAll("#button_filter_clear").forEach(function(s){
		s.style.opacity = "1";
	});

	document.querySelectorAll("#toolbar_main .button_img, #toolbar_shelf_tools .button_img, #toolbar_shelf_groups .button_img, #toolbar_shelf_backup .button_img, #toolbar_shelf_folders .button_img").forEach(function(s){
		s.setAttribute("draggable", true);
		s.onmousedown = function(event) {
			if (event.which == 1) {
				dragged_button = document.getElementById(this.parentNode.id);
			}
		}
		s.ondragstart = function(event) {
			event.dataTransfer.setData(" "," ");
			event.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
		}
		// move (flip) buttons
		s.ondragenter = function(event) {
			if ((dragged_button.id == "button_tools" || dragged_button.id == "button_search" || dragged_button.id == "button_groups" || dragged_button.id == "button_backup" || dragged_button.id == "button_folders") && this.parentNode.parentNode.classList.contains("toolbar_shelf")) {
				return;
			}
			let dragged_buttonIndex = Array.from(dragged_button.parentNode.children).indexOf(dragged_button);
			let Index = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
			
			if (Index <= dragged_buttonIndex) {
				InsterBeforeNode(dragged_button, this.parentNode);
			} else {
				InsterAfterNode(dragged_button, this.parentNode);
			}
		}
		// save toolbar
		s.ondragend = function(event) {
			RemoveToolbarEditEvents();
			SaveToolbar();
			AddEditToolbarEditEvents();
		}
	});
	
	
	document.querySelectorAll("#toolbar_main, .toolbar_shelf:not(#toolbar_search), #toolbar_unused_buttons").forEach(function(s){s.ondragenter = function(event) {
		if ((dragged_button.id == "button_tools" || dragged_button.id == "button_search" || dragged_button.id == "button_groups" || dragged_button.id == "button_backup" || dragged_button.id == "button_folders") && this.classList.contains("toolbar_shelf")) {
			return;
		}
		if (dragged_button.parentNode.id != this.id) {
			this.appendChild(dragged_button);
		}

	}});
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


// shrink or expand theme field
function RefreshFields() {
	if (document.getElementById("theme_list").options.length == 0) {
		document.getElementById("field_theme").style.height = "45px";
	} else {
		document.getElementById("field_theme").style.height = "";
	}
	if (browserId == "F") {
		document.querySelectorAll("#scrollbar_size_indicator, #scrollbar_thumb, #scrollbar_thumb_hover, #scrollbar_track").forEach(function(s){
			s.style.display = "none";
		});
	} else {
		document.querySelectorAll("#firefox_option_hide_other_groups_tabs_firefox").forEach(function(s){
			s.style.display = "none";
		});
	}
	if (browserId == "V") {
		let WebPanelUrlBox = document.getElementById("url_for_web_panel");
		WebPanelUrlBox.value = (chrome.runtime.getURL("sidebar.html"));
		WebPanelUrlBox.setAttribute("readonly", true);
		document.getElementById("field_vivaldi").style.display = "block";
	}
	if (document.getElementById("show_toolbar").checked) {
		document.querySelectorAll("#options_available_buttons, #sample_toolbar_block, #options_reset_toolbar_button").forEach(function(s){
			s.style.display = "";
		});
		document.getElementById("options_toolbar_look").style.display = "";
		document.getElementById("field_show_toolbar").style.height = "";
	} else{
		document.querySelectorAll("#options_available_buttons, #sample_toolbar_block, #options_reset_toolbar_button").forEach(function(s){
			s.style.display = "none";
		});
		document.getElementById("options_toolbar_look").style.display = "none";
		document.getElementById("field_show_toolbar").style.height = "6";
	}
	
	
	if (document.getElementById("append_child_tab").value == "after") {
		document.getElementById("append_child_tab_after_limit_dropdown").style.display = "none";
		document.getElementById("options_append_orphan_tab_as_child").style.display = "none";

		if (opt.append_child_tab == "after" && opt.append_orphan_tab == "as_child") {
			opt.append_orphan_tab = "after_active";
			document.getElementById("append_orphan_tab").value = "after_active";
			SavePreferences();
		}
		
	} else {
		document.getElementById("append_child_tab_after_limit_dropdown").style.display = "";
		document.getElementById("options_append_orphan_tab_as_child").style.display = "";
	}
}

function RefreshGUI() {
	let button_filter_type = document.getElementById("button_filter_type");
	if (button_filter_type != null) {
		button_filter_type.classList.add("url");
		button_filter_type.classList.remove("title");
	}
	if (document.querySelector(".on") != null) {
		document.getElementById("toolbar").style.height = "53px";
	} else {
		document.getElementById("toolbar").style.height = "26px";
	}
}



// dummy functions
function BindTabsSwitchingToMouseWheel() {}
function GetFaviconAndTitle() {}
function RefreshMediaIcon() {}
function SetActiveTab() {}
function RefreshCounters() {}
function RefreshExpandStates() {}
function Loadi18n() {}