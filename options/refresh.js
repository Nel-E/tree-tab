// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

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
		document.getElementById("firefox_option_hide_other_groups_tabs_firefox").style.display = "none";
	}
	if (browserId == "V") {
		let WebPanelUrlBox = document.getElementById("url_for_web_panel");
		WebPanelUrlBox.value = (chrome.runtime.getURL("sidebar.html"));
		WebPanelUrlBox.setAttribute("readonly", true);
	} else{
		document.getElementById("field_vivaldi").style.display = "none";
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

