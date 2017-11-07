// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

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
		// $("#url_for_web_panel").select();
	} else{
		$("#field_vivaldi").hide();
	}
}

function RefreshGUI() {
	$("#button_filter_type").addClass("url").removeClass("title");
	if ($(".button").is(".on")) {
		$("#toolbar").css({ "height": 53 });
	} else {
		$("#toolbar").css({ "height": 26 });
	}
}

