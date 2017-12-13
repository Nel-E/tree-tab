// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********      KEYBOARD AND MOUSE       ***************

function BindTabsSwitchingToMouseWheel() {
	// switch tabs with mouse scroll
	$("#pin_list, .group").bind("mousewheel DOMMouseScroll", function(event) {
		let prev = event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0;
		if (prev) {
			ActivatePrevTab();
		} else {
			ActivateNextTab();
		}
		event.preventDefault();
	});
}

function SetIOEvents() {
	if (!opt.switch_with_scroll) {
		$("#pin_list").bind("mousewheel DOMMouseScroll", function(event) {
			let direction = (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) ? -1 : 1;
			let speed = 0.1;
			for (let t = 1; t < 40; t++) {
				setTimeout(function() {
					if (t < 30) {
						speed = speed+0.1; // accelerate
					} else {
						speed = speed-0.3; // decelerate
					}
					$("#pin_list").scrollLeft($("#pin_list").scrollLeft()+(direction*speed));
				}, t);
			}
		});
	}
	
	// catch keyboard keys
	$(document).keydown(function(event) {
		if (MouseHoverOver == "pin_list") {
			// ctrl+a to select all
			if (event.ctrlKey && event.which == 65) {
				$(".pin").addClass("selected_tab");
			}
			// ctrl+i to invert selection
			if (event.ctrlKey && event.which == 73) {
				$(".pin").toggleClass("selected_tab");
			}
		}
		if (MouseHoverOver.match("g_|tab_list") !== null) {
			// ctrl+a to select all
			if (event.ctrlKey && event.which == 65) {
				$("#ch"+active_group).children(".tab:visible").addClass("selected_tab");
			}
			// ctrl+i to invert selection
			if (event.ctrlKey && event.which == 73) {
				$(".tab:visible").toggleClass("selected_tab");
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
