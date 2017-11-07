// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********      KEYBOARD AND MOUSE       ***************

function BindTabsSwitchingToMouseWheel() {
	// switch tabs with mouse scroll
	$("#pin_list, .group").bind("mousewheel DOMMouseScroll", function(event) {
		e = event.originalEvent;
		var delta = e.wheelDelta > 0 || e.detail < 0 ? -1 : 1;
		if (delta < 0) {
			ActivatePrevTab();
		} else {
			if (delta > 0) {
				ActivateNextTab();
			}
		}
		event.preventDefault();
	});
}

function SetIOEvents() {

	if (!opt.switch_with_scroll) {
		// scroll horizontally on pin list
		$("#pin_list").bind("mousewheel DOMMouseScroll", function(event) {
			event = event.originalEvent;
			var delta = event.wheelDelta > 0 || event.detail < 0 ? -1 : 1;
			var multiplier = 1;
			for (var t = 1; t < 20; t++) {
				setTimeout(function() {
					$("#pin_list").scrollLeft($("#pin_list").scrollLeft()+(delta*multiplier));
				}, t);
				multiplier++;
			}
			multiplier = 20;
			for (var t = 21; t < 40; t++) {
				setTimeout(function() {
					$("#pin_list").scrollLeft($("#pin_list").scrollLeft()+(delta*multiplier));
				}, t);
				multiplier--;
			}
		});
	}
	
	// catch keyboard keys
	$(document).keydown(function(event) {
		if (MouseHoverOver == "pin_list") {
			// ctrl+a to select all
			if (event.ctrlKey && event.which == 65) {
				$(".pin").addClass("selected");
			}
			// ctrl+i to invert selection
			if (event.ctrlKey && event.which == 73) {
				$(".pin").toggleClass("selected");
			}
		}
		if (MouseHoverOver.match("g_|tab_list") !== null) {
			// ctrl+a to select all
			if (event.ctrlKey && event.which == 65) {
				$(".tab:visible").addClass("selected");
			}
			// ctrl+i to invert selection
			if (event.ctrlKey && event.which == 73) {
				$(".tab:visible").toggleClass("selected");
			}
		}
		RefreshGUI();
	});

	// remove middle mouse and set hiding menu
	document.body.onmousedown = function(event) {
		if (event.button == 1 && opt.close_with_MMB == true) {
			event.preventDefault();
		}
		if (event.button == 0 && !$(event.target).is(".menu_item")) {
			$(".menu").hide(300);
		}
	};
}
