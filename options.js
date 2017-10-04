// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********      OPTIONS       ***************

// chrome.runtime.sendMessage({command: "get_opt"}, function(response) {
	// opt = response;
// });			
// chrome.runtime.sendMessage({command: "get_browser_ID"}, function(response) {
	// browserId = response;
// });	

var themes = [];
var SelectedTheme = {"toolbar": DefaultToolbar, "ToolbarShow": true, "ColorsSet": {}, "TabsSizeSetNumber": 2, "ScrollbarPinList": 4, "ScrollbarTabList": 16, /* "theme_name": "untitled",  */"theme_version": CurrentThemeVersion};
var dragged_button;
	
active_group = "tab_list";


function LoadTheme(themeName) {
	if (localStorage.getItem("theme"+themeName) != null) {
		SelectedTheme = JSON.parse(localStorage["theme"+themeName]);
	}
}
function SaveTheme(themeName) {
	console.log(themeName);
	localStorage["theme"+themeName] = JSON.stringify(SelectedTheme);
	chrome.runtime.sendMessage({command: "reload_theme", themeName: "theme"+themeName});
	return SelectedTheme;
}


function AddNewTheme() {
	SelectedTheme = {
		"ToolbarShow": true,
		"ColorsSet": {},
		"TabsSizeSetNumber": 2,
		"ScrollbarPinList": 4,
		"ScrollbarTabList": 16,
		"theme_name": "untitled",
		"theme_version": CurrentThemeVersion,
		"toolbar": DefaultToolbar
	};
}



document.addEventListener("DOMContentLoaded", function() {
	LoadPreferences();
	document.title = "Tree Tabs";

	if (localStorage.getItem("themes") != null) {
		themes = JSON.parse(localStorage["themes"]);
	}
	if (localStorage.getItem("current_theme") != null) {
		LoadTheme(localStorage["current_theme"]);
	}

	GetOptions();
	RefreshFields();
	SetEvents();
	

		// setTimeout(function() {
			// AddSamples();
		// }, 200);
		
	AppendGroupToList("tab_list", caption_ungrouped_group, 0, 0);
	// var theme = JSON.parse(localStorage["theme"+themeName]);

	// TabsSizeSetNumber = theme.TabsSizeSetNumber;

	// append toolbar from theme
	// $("#toolbar").html(theme.toolbar);
	// $("#toolbar").html(DefaultToolbar);

	// AppendCSSSheets(theme);
	
	// $("#button_filter_type").addClass("url").removeClass("title");

	// expand toolbar options
	// ToolbarShow = $("#show_toolbar")[0].checked = theme.ToolbarShow;
	// $("#field_show_toolbar").css({"height": $("#show_toolbar")[0].checked ? "" : "6"});
	// ToolbarShow ? $("#options_available_buttons, #toolbar, #toolbar_colors").show() : $("#options_available_buttons, #toolbar, #toolbar_colors").hide();
	
	// append example tabs
	// $("#pin_list, #tab_list").html("");
	// pins
	AppendTab({tab: {id: 0, pinned: true}, Append: true});
	AppendTab({tab: {id: 1, pinned: true, active: true}, Append: true});
	
	// tabs
	AppendTab({tab: {id: 2, pinned: false}, Append: true});
	$("#tab_title2")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal");
	$(".tab_header#tab_header2").addClass("close_show");
	
	AppendTab({tab: {id: 3, pinned: false, active: true}, Append: true, ParentId: "t2"});
	$("#tab_title3")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_selected");
	$(".tab#3").addClass("c selected");

	AppendTab({tab: {id: 5, pinned: false, discarded: true}, Append: true});
	$("#tab_title5")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded");

	AppendTab({tab: {id: 6, pinned: false}, Append: true});
	$("#tab_title6")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result");
	$(".tab#6").addClass("filtered");
	
	$(".tab_header#tab_header6").addClass("close_show");
	$(".close#close6").addClass("close_hover");

	AppendTab({tab: {id: 7, pinned: false}, Append: true});
	$("#tab_title7")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted");
	$(".tab#7").addClass("filtered highlighted_search");


	AppendTab({tab: {id: 8, pinned: false}, Append: true});
	$("#tab_title8")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected");
	$(".tab#8").addClass("selected filtered");
	
	
	
	AppendTab({tab: {id: 9, pinned: false}, Append: true});
	$("#tab_title9")[0].textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_active");
	$(".tab#9").addClass("active selected filtered");
	
	// drag&drop indicator
	$(".drag_entered_bottom").first().addClass("highlighted_drop_target");

	// toolbar events
	// $("#toolbar_shelf_tools, #toolbar_search").addClass("hidden");
	// $(".on").removeClass("on");

	// ScrollbarPinList = $("#scrollbar_pin_list")[0].value = theme.ScrollbarPinList;
	// ScrollbarTabList = $("#scrollbar_tab_list")[0].value = theme.ScrollbarTabList;

	// $("#active_tab_font_bold")[0].checked = theme.ColorsSet.active_font_weight == "normal" ? false : true;
	// $("#body").css({"background-color": "transparent"});

	setTimeout(function() {
		RestoreToolbarShelf();
		RestoreToolbarSearchFilter();
		SetToolbarShelfToggle();
		ApplySizeSet(4);
		ApplySizeOptionsSet(4);
		// RefreshGUI();		
	}, 400);
	
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

		if (themeObj.theme_version > CurrentThemeVersion) {
			alert(chrome.i18n.getMessage("options_loaded_theme_newer_version"));
		}
		if (themeObj.theme_version < CurrentThemeVersion) {
			alert(chrome.i18n.getMessage("options_loaded_theme_older_version"));
		}
		
		if (themeObj.theme_version <= CurrentThemeVersion) {
			for (var val in ColorsSet) {
				ColorsSet[val] = themeObj.ColorsSet[val];
			}
			
			ToolbarShow = themeObj.ToolbarShow;
			TabsSizeSetNumber = themeObj.TabsSizeSetNumber;
			ScrollbarPinList = themeObj.ScrollbarPinList;
			ScrollbarTabList = themeObj.ScrollbarTabList;

			$("#toolbar").html(themeObj.toolbar);
			ToolbarSet = themeObj.toolbar;

			if (themes.indexOf(themeObj.theme_name) != -1) {
				themeObj.theme_name = themeObj.theme_name + "(1)";
			}
			
			themes.push(themeObj.theme_name);
		
			SaveTheme(themeObj.theme_name);
			var t_list = document.getElementById("theme_list");
			var	theme_name = document.createElement("option");
				theme_name.value = themeObj.theme_name;
				theme_name.text = theme_name.value;
			t_list.add(theme_name);
			
			$("#theme_list")[0].selectedIndex = $("#theme_list")[0].options.length-1;
			
			localStorage["themes"] = JSON.stringify(themes);
			localStorage["current_theme"] = themeObj.theme_name;
			LoadTheme(themeObj.theme_name);
			RefreshFields();
		}
	}	 

}



// document events
function SetEvents() {

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


	
	
	
	
	
	
	
	
	
	
	// set checkbox options on/off and save
	$(document).on("click", ".bg_opt", function(event) {
		opt[this.id] = $(this)[0].checked ? true : false;
		SavePreferences();
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
		ToolbarShow = $("#show_toolbar")[0].checked ? true : false;
		SaveTheme($("#theme_list").val());
		$("#field_show_toolbar").css({"height": $("#show_toolbar")[0].checked ? "" : "6"});
		ToolbarShow ? $("#options_available_buttons, #toolbar, #toolbar_colors").show() : $("#options_available_buttons, #toolbar, #toolbar_colors").hide();
	});


	// block system dragging
	$(document).bind("drop dragover", function(event) {
		event.preventDefault();
	});











	$(document).on("mousedown", ".button", function(event) {
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
		if ($(dragged_button).is("#button_tools, #button_search, #button_groups, #button_folders") && $(this).is(".toolbar_shelf")) {
			return;
		}
		if (dragged_button.parentNode.id != this.id) {
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
		ToolbarSet = $("#toolbar").html();
		SaveTheme($("#theme_list").val());
	});
	
	// reset toolbar
	$(document).on("click", "#options_reset_toolbar_button", function(event) {
		SelectedTheme["toolbar"] = DefaultToolbar;
		$("#toolbar").html(DefaultToolbar);
		SaveTheme($("#theme_list").val());
	});










	
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
		

		// AddNewTheme();
		// LoadTheme("Default");
			
		SelectedTheme = {"toolbar": DefaultToolbar, "ToolbarShow": true, "ColorsSet": {}, "TabsSizeSetNumber": 2, "ScrollbarPinList": 4, "ScrollbarTabList": 16, /* "theme_name": "untitled",  */"theme_version": CurrentThemeVersion};
		
		themes.push($("#new_theme_name")[0].value);
		var t_list = document.getElementById("theme_list");
		var	theme_name = document.createElement("option");
			theme_name.value = $("#new_theme_name")[0].value;
			theme_name.text = theme_name.value;
		t_list.add(theme_name);
		
		$("#theme_list")[0].selectedIndex = $("#theme_list")[0].options.length-1;
		
		SaveTheme(theme_name.value);
		
		
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

		

		

	// change colors with color pickers
	$(document).on("input", ".cp", function(event) {
		SelectedTheme["ColorsSet"][this.id] = $(this)[0].value;
		
		console.log(SelectedTheme["ColorsSet"]);
		ApplyColorsSet(SelectedTheme["ColorsSet"]);
		// ColorsSet[this.id] = $(this)[0].value;
		// AppendCSSSheets(SaveTheme($("#theme_list").val()));
	});






	// set scrollbar sizes
	$(document).on("input", "#scrollbar_pin_list, #scrollbar_tab_list", function(event) {
		ScrollbarPinList = $("#scrollbar_pin_list")[0].value;
		ScrollbarTabList = $("#scrollbar_tab_list")[0].value;
		SaveTheme($("#theme_list").val());
		document.styleSheets[0].addRule(".scrollbar::-webkit-scrollbar", "width:"+ScrollbarTabList+"px; height:"+ScrollbarPinList+"px;");
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

	// change tabs size preset(down)
	$(document).on("click", "#options_tabs_size_down", function(event) {
		if (SelectedTheme["TabsSizeSetNumber"] > 0) {
			SelectedTheme["TabsSizeSetNumber"]--;
			ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
			ApplySizeOptionsSet(SelectedTheme["TabsSizeSetNumber"]);
			SaveTheme($("#theme_list").val());
		}
	});



	
	// change active_tab_font_bold
	$(document).on("click", "#active_tab_font_bold", function(event) {
		SelectedTheme["ColorsSet"]["active_font_weight"] = $(this)[0].checked ? "bold" : "normal";
		ApplyColorsSet(SelectedTheme["ColorsSet"]);
		
		// console.log(SelectedTheme["ColorsSet"]);
		// ApplyColorsSet(ThemeColors);
		SaveTheme($("#theme_list").val());
		// AppendCSSSheets(SaveTheme($("#theme_list").val()));
	});
	








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

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	// show color picker
	$(document).on("mousedown", ".brush, .brush2, .brush3, .brush4", function(event) {
		event.stopPropagation();
		PickColor = this.id;
		// $("#color_picker")[0].value = "#"+RGBtoHex($(this).css("background-color"));
		
		// $("#color_picker").css({"background-color": "var(--"+this.id+")"});
		
		
		// $("#color_picker").css({"background-color": "var(--"+$(this).parent()[0].id+")"});
		// console.log($("#color_picker")[0].style.backgroundColor);
		
		let bod = document.getElementById("body");
		let color = window.getComputedStyle(bod, null).getPropertyValue("--"+this.id);
		// $("#color_picker")[0].value = (window.getComputedStyle(bod, null).getPropertyValue("--"+$(this).parent()[0].id)).substr(1);
		console.log(color.replace(" ", "").replace("#", ""));
		
		$("#color_picker")[0].value = color.replace(" ", "");
		
		
		// $("#color_picker").focus();
		$("#color_picker").click();
	});
	
	$(document).on("input", "#color_picker", function(event) {
		console.log($("#color_picker")[0].value);
		console.log(PickColor);
		
		SelectedTheme["ColorsSet"][PickColor] = $("#color_picker")[0].value;
		console.log(SelectedTheme["ColorsSet"]);
		ApplyColorsSet(SelectedTheme["ColorsSet"]);
		

		SaveTheme($("#theme_list").val());
	});	
	
	
	
	
	
	
	
	
	
	
	
	
	
}

// shrink or expand theme field
function RefreshFields() {
	// if ($("#theme_list")[0].options.length == 0) {
		// $("#field_theme").css({"height": "45px"});
	// } else {
		// $("#field_theme").css({"height": ""});
	// }
	// if (navigator.userAgent.match("Firefox") !== null) {
		// $("#field_scrollbars").hide();
	// } else {
		// $("#faster_scroll_for_firefox").hide();
	// }
	// if (navigator.userAgent.match("Vivaldi") !== null) {
		// $("#url_for_web_panel").val(chrome.runtime.getURL("sidebar.html"));
		// $("#url_for_web_panel").prop("readonly", true);
		// $("#url_for_web_panel").select();
	// } else{
		// $("#field_vivaldi").hide();
	// }
}


// dummy functions
function GetFaviconAndTitle() {}
function RefreshMediaIcon() {}
function RefreshGUI() {}



// /* AppendCSSSheets from theme */
// function AppendCSSSheets(theme) {
	// var css_variables = "";
	// for (var css_variable in theme.TabsSizeSetNumber) {
		// css_variables = css_variables + "--" + css_variable + ":" + theme.TabsSizeSetNumber[css_variable] + ";";
	// }
	
	// for (var css_variable in theme.ColorsSet) {
		// ColorsSet[css_variable] = theme.ColorsSet[css_variable];
		// if ($("#"+css_variable)[0]) $("#"+css_variable)[0].value = theme.ColorsSet[css_variable];
		// css_variables = css_variables + "--" + css_variable + ":" + theme.ColorsSet[css_variable] + ";";
	// }
	
	// /* remove previous css rules in css sheet 0 */
	// for (var r = 0; r < document.styleSheets[0].cssRules.length; r++) {
		// if (document.styleSheets[0].cssRules[r].cssText.match("--pin_width") !== null) {
			// document.styleSheets[0].deleteRule(r);
		// }
		// if (document.styleSheets[0].cssRules[r].cssText.match("::-webkit-scrollbar") !== null) {
			// document.styleSheets[0].deleteRule(r);
		// }
	// }
	// document.styleSheets[0].insertRule("body { "+css_variables+" }", 0);
	
	// /* scrollbars */
	// if (navigator.userAgent.match("Firefox") === null) {
		// document.styleSheets[0].insertRule(".scrollbar::-webkit-scrollbar { width:"+theme.ScrollbarTabList+"px; height:"+theme.ScrollbarPinList+"px; }", 3);
	// }
// }

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
