// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********      OPTIONS       ***************

var current_theme = "";
var themes = [];
var SelectedTheme = Object.assign({}, DefaultTheme);
var dragged_button;
active_group = "tab_list";

// options for all drop down menus
let DropDownList = ["dbclick_folder", "midclick_folder", "midclick_tab", "dbclick_group", "midclick_group", "dbclick_tab", "append_child_tab", "append_child_tab_after_limit", "append_orphan_tab", "after_closing_active_tab"];

document.addEventListener("DOMContentLoaded", function() {
	document.title = "Tree Tabs";
	chrome.runtime.sendMessage({command: "get_preferences"}, function(response) {
		opt = Object.assign({}, response);
		chrome.storage.local.get(null, function(items) {
			if (items["themes"]) {
				for (var themeName in items["themes"]) {
					themes.push(themeName);
				}
			}
			if (items["current_theme"]) {
				current_theme = items["current_theme"];
				LoadTheme(items["current_theme"]);
			}
			GetOptions();
			RefreshFields();
			SetEvents();
			AppendGroupToList("tab_list", caption_ungrouped_group, "", false);
			AppendGroupToList("tab_list2", caption_noname_group, "", false);
			AppendSampleTabs();
		});
	});
});

// document events
function GetOptions() {
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
	}

	// get options for tabs tree depth option
	document.getElementById("max_tree_depth").value = opt.max_tree_depth;


	// append themes to dropdown menu
	let ThemeList = document.getElementById("theme_list");
	for (var i = 0; i < themes.length; i++) {
		let theme_name = document.createElement("option");
		theme_name.value = themes[i];
		theme_name.text = themes[i];
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
	if (document.styleSheets[document.styleSheets.length-1].cssRules.length) {
		document.styleSheets[document.styleSheets.length-1].deleteRule(document.styleSheets[document.styleSheets.length-1].cssRules.length-1);
	}
	document.querySelectorAll(".hover_blinking").forEach(function(s){s.classList.remove("hover_blinking");});
	document.querySelectorAll(".hover_border_blinking").forEach(function(s){s.classList.remove("hover_border_blinking");});
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
	document.querySelectorAll(".pick_col, #filter_box_font").forEach(function(s){s.onmouseenter = function(event) {
		document.styleSheets[document.styleSheets.length-1].insertRule("body { --"+this.id+": red; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
	}});
	document.querySelectorAll(".font_weight_normal").forEach(function(s){s.onmouseenter = function(event) {
		document.styleSheets[document.styleSheets.length-1].insertRule("body { --"+this.id+": normal; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
	}});
	document.querySelectorAll(".font_weight_bold").forEach(function(s){s.onmouseenter = function(event) {
		document.styleSheets[document.styleSheets.length-1].insertRule("body { --"+this.id+": bold; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
	}});
	document.querySelectorAll(".font_style_normal").forEach(function(s){s.onmouseenter = function(event) {
		document.styleSheets[document.styleSheets.length-1].insertRule("body { --"+this.id+": normal; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
	}});
	document.querySelectorAll(".font_style_italic").forEach(function(s){s.onmouseenter = function(event) {
		document.styleSheets[document.styleSheets.length-1].insertRule("body { --"+this.id+": italic; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
	}});
	document.querySelectorAll(".pick_col, .font_weight_normal, .font_weight_bold, .font_style_normal, .font_style_italic, #filter_box_font").forEach(function(s){s.onmouseleave = function(event) {
		RemovePreview();
	}});
	

	document.getElementById("group_list_default_font_color").onmouseenter = function(event) {
		document.getElementById("_gtetab_list").style.color = "red";
		document.getElementById("_gtetab_list2").style.color = "red";
		
	}
	document.getElementById("group_list_default_font_color").onmouseleave = function(event) {
		document.getElementById("_gtetab_list").style.color = "";
		document.getElementById("_gtetab_list2").style.color = "";
	}

	
	document.getElementById("scrollbar_thumb_hover").onmouseenter = function(event) {
		RemovePreview();
		document.getElementById("group_scrollbar_thumb").classList.add("hover_blinking");
		document.getElementById("pin_list_scrollbar_thumb").classList.add("hover_blinking");
	}
	document.getElementById("scrollbar_thumb_hover").onmouseleave = function(event) {
		RemovePreview();
	}
	

	document.getElementById("group_list_button_hover_background").onmouseenter = function(event) {
		RemovePreview();
		document.getElementById("_tab_list2").classList.add("hover_blinking");
	}
	document.getElementById("group_list_button_hover_background").onmouseleave = function(event) {
		RemovePreview();
	}

	document.getElementById("button_hover_background").onmouseenter = function(event) {
		RemovePreview();
		document.querySelectorAll(".button").forEach(function(s){s.classList.add("hover_blinking");});
	}
	document.getElementById("button_hover_background").onmouseleave = function(event) {
		RemovePreview();
	}
	


	document.getElementById("button_icons_hover").onmouseenter = function(event) {
		RemovePreview();
		document.querySelectorAll(".button_img").forEach(function(s){s.classList.remove("hover_blinking");});
	}
	document.getElementById("button_icons_hover").onmouseleave = function(event) {
		RemovePreview();
	}

	document.getElementById("button_hover_border").onmouseenter = function(event) {
		RemovePreview();
		document.querySelectorAll(".button").forEach(function(s){s.classList.add("hover_border_blinking");});
	}
	document.getElementById("button_hover_border").onmouseleave = function(event) {
		RemovePreview();
	}
	
	document.getElementById("options_tab_list_scrollbar_width_up").onmouseenter = function(event) {
		document.getElementById("group_scrollbar").style.backgroundColor = "red";
		document.getElementById("group_scrollbar_thumb").style.backgroundColor = "red";
	}
	document.getElementById("options_tab_list_scrollbar_width_down").onmouseenter = function(event) {
		document.getElementById("group_scrollbar").style.backgroundColor = "red";
		document.getElementById("group_scrollbar_thumb").style.backgroundColor = "red";
	}
	
	document.getElementById("options_tab_list_scrollbar_width_up").onmouseleave = function(event) {
		document.getElementById("group_scrollbar").style.backgroundColor = "";
		document.getElementById("group_scrollbar_thumb").style.backgroundColor = "";
	}
	document.getElementById("options_tab_list_scrollbar_width_down").onmouseleave = function(event) {
		document.getElementById("group_scrollbar").style.backgroundColor = "";
		document.getElementById("group_scrollbar_thumb").style.backgroundColor = "";
	}
	

	
	document.getElementById("options_tab_list_scrollbar_height_up").onmouseenter = function(event) {
		document.getElementById("pin_list_scrollbar").style.backgroundColor = "red";
		document.getElementById("pin_list_scrollbar_thumb").style.backgroundColor = "red";
	}
	document.getElementById("options_tab_list_scrollbar_height_down").onmouseenter = function(event) {
		document.getElementById("pin_list_scrollbar").style.backgroundColor = "red";
		document.getElementById("pin_list_scrollbar_thumb").style.backgroundColor = "red";
	}
	
	document.getElementById("options_tab_list_scrollbar_height_up").onmouseleave = function(event) {
		document.getElementById("pin_list_scrollbar").style.backgroundColor = "";
		document.getElementById("pin_list_scrollbar_thumb").style.backgroundColor = "";
	}
	document.getElementById("options_tab_list_scrollbar_height_down").onmouseleave = function(event) {
		document.getElementById("pin_list_scrollbar").style.backgroundColor = "";
		document.getElementById("pin_list_scrollbar_thumb").style.backgroundColor = "";
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
	}}});


	// options that need reload
	document.onclick = function(event) {if (event.which == 1) {
		if (event.target.id == "show_toolbar" || event.target.id == "syncro_tabbar_tabs_order" || event.target.id == "allow_pin_close" || event.target.id == "switch_with_scroll" || event.target.id == "always_show_close" || event.target.id == "never_show_close" || 
			event.target.id == "collapse_other_trees" || event.target.id == "show_counter_tabs" || event.target.id == "show_counter_tabs_hints" || event.target.id == "syncro_tabbar_tabs_order" || event.target.id == "syncro_tabbar_groups_tabs_order" || event.target.id == "groups_toolbar_default") {
			chrome.runtime.sendMessage({command: "reload_sidebar"});
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
console.log(opt[this.id]);
console.log(this.value);
			opt[this.id] = this.value;
			SavePreferences();
			chrome.runtime.sendMessage({command: "reload_sidebar"});
		}
	}

	// set tabs tree depth option
	document.getElementById("max_tree_depth").oninput = function(event) {
		opt.max_tree_depth = parseInt(this.value);
		SavePreferences();
		chrome.runtime.sendMessage({command: "reload_sidebar"});
	}
	
	// set toolbar on/off and show/hide all toolbar options
	document.getElementById("show_toolbar").onclick = function(event) {if (event.which == 1) {
		SelectedTheme.ToolbarShow = this.checked ? true : false;
		RefreshFields();
		SaveTheme(document.getElementById("theme_list").value);
	}}

	
// ------------------------------OTHER------------------------------------------------------------------------------------	

	// block system dragging
	document.ondrop = function(event) {
		event.preventDefault();
	}
	document.ondragover = function(event) {
		event.preventDefault();
	}

// ----------------------------RESET TOOLBAR BUTTON-----------------------------------------------------------------------	
	
	document.getElementById("options_reset_toolbar_button").onclick = function(event) {if (event.which == 1) {
		SetToolbarEvents(true, false, false, "");
		RemoveToolbarEditEvents();
		SelectedTheme["toolbar"] = DefaultToolbar;
		SelectedTheme["unused_buttons"] = "";
		document.getElementById("toolbar").innerHTML = DefaultToolbar;
		document.getElementById("toolbar_unused_buttons").innerHTML = "";
		SaveTheme(document.getElementById("theme_list").value);
		document.querySelectorAll(".on").forEach(function(s){s.classList.remove("on");});
		RefreshGUI();
		SetToolbarEvents(false, false, true, "click");
		AddEditToolbarEditEvents();
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
		let inputFile = ShowOpenFileDialog("import_theme", ".tt_theme");
		inputFile.onchange = function(event) {
			ImportTheme();
		}						
	}}

	// export theme preset button
	document.getElementById("options_export_theme_button").onclick = function(event) {if (event.which == 1) {
		if (document.getElementById("theme_list").options.length == 0) {
			alert(chrome.i18n.getMessage("options_no_theme_to_export"));
		} else {
			SaveFile(document.getElementById("theme_list").value + ".tt_theme", SelectedTheme);
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



// ----------------------CLEAR DATA BUTTON--------------------------------------------------------------------------------	

	// clear data
	document.getElementById("options_clear_data").onclick = function(event) {if (event.which == 1) {
		chrome.storage.local.clear();
		chrome.runtime.sendMessage({command: "reload"});
		chrome.runtime.sendMessage({command: "reload_sidebar"});
		setTimeout(function() {
			location.reload();
		}, 300);
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

function AddEditToolbarEditEvents() {
	document.querySelectorAll("#button_filter_clear").forEach(function(s){
		s.style.opacity = "1";
	});
	document.querySelectorAll(".button_img").forEach(function(s){
		if (s.parentNode.id != "button_filter_type" || s.parentNode.id != "filter_search_go_prev" || s.parentNode.id != "filter_search_go_next") {
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
					this.parentNode.parentNode.insertBefore(dragged_button, this.parentNode);
				} else {
					if (this.parentNode.nextSibling != null) {
						this.parentNode.parentNode.insertBefore(dragged_button, this.parentNode.nextSibling);
					} else {
						this.parentNode.parentNode.appendChild(dragged_button);
					}				
				}
			}
			// save toolbar
			s.ondragend = function(event) {
				RemoveToolbarEditEvents();

				SelectedTheme.toolbar = document.getElementById("toolbar").innerHTML;
				SelectedTheme.unused_buttons = document.getElementById("toolbar_unused_buttons").innerHTML;
				SaveTheme(document.getElementById("theme_list").value);
				
				AddEditToolbarEditEvents();
			}
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


// dummy functions
function BindTabsSwitchingToMouseWheel() {}
function GetFaviconAndTitle() {}
function RefreshMediaIcon() {}