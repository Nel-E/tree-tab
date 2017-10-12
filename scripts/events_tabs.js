// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********		  TABS EVENTS		  ***************

function SetTabEvents() {
	
	// double click to create tab
	$(document).on("dblclick", ".group, #pin_list, .tab", function(event) {
		if (event.button == 0 && $(event.target).is(this)) {
			if (event.target.id == "pin_list") {
				chrome.tabs.create({ pinned: true });
			} else {
				chrome.tabs.create({});
			}
		}
	});

	$(document).on("mouseenter", ".close", function(event) {
		$(this).addClass("close_hover");
	});

	$(document).on("mouseleave", ".close", function(event) {
		$(".close_hover").removeClass("close_hover");
	});


	$(document).on("mouseenter", ".expand", function(event) {
		$(this).addClass("hover");
	});

	$(document).on("mouseleave", ".expand", function(event) {
		$(".expand.hover").removeClass("hover");
	});



	$(document).on("mouseover", ".tab_header", function(event) {
		$(this).addClass("tab_header_hover");

		if (opt.always_show_close == false) {
			$(this).addClass("close_show");
		}
	});

	$(document).on("mouseleave", ".tab_header", function(event) {
		$(this).removeClass("tab_header_hover");

		if (opt.always_show_close == false) {
			$(this).removeClass("close_show");
		}
	});

	// EXPAND BOX - EXPAND / COLLAPSE
	$(document).on("mousedown", ".expand", function(event) {
		event.stopPropagation();
		if (event.button == 0) {
			if ($(this).parent().parent().is(".o")) {
				$(this).parent().parent().removeClass("o").addClass("c");
				chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt($(this).parent().parent()[0].id), tab: { o: "c" } });
			} else {
				if ($(this).parent().parent().is(".c")) {
					if (opt.close_other_trees) {
						$(".o:visible").removeClass("o").addClass("c");
						$(this).parents(".tab").each(function() {
							$(this).removeClass("n").removeClass("c").addClass("o");
							chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(this.id), tab: { o: "o" } });
						});
						$(".c").each(function() {
							chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(this.id), tab: { o: "c" } });
						});
					}
					$(this).parent().parent().removeClass("c").addClass("o");
					chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt($(this).parent().parent()[0].id), tab: { o: "o" } });
				}
			}
		}
	});

	// SELECT OR CLOSE TAB/PIN
	$(document).on("mousedown", ".tab, .pin", function(event) {
		
		if ($(".menu").is(":visible")) {
			return;
		}		
		
		DropTargetsSendToBack();
		event.stopPropagation();
		if (event.button == 0) {

			// SET SELECTION WITH SHIFT
			if (event.shiftKey) {
				$(".pin, .tab:visible").removeClass("selected").removeClass("selected_frozen").removeClass("selected_temporarly");
				if ($(this).index() >= $(".active:visible").index()) {
					$(".active:visible").nextUntil($(this), ":visible").add($(".active:visible")).add($(this)).addClass("selected");
				} else {
					$(".active:visible").prevUntil($(this), ":visible").add($(".active:visible")).add($(this)).addClass("selected");
				}
			}

			// TOGGLE SELECTION WITH CTRL
			if (event.ctrlKey) {
				// if ($(".active:visible").is(":not(.selected)")) {
					// $(".active:visible").addClass("selected");
				// }
				$(this).toggleClass("selected");
			}
		}

		// CLOSE TAB
		if (
			(($(this).is(".tab") && $(event.target).is(":not(.expand)")) && ((event.button == 1 && opt.close_with_MMB == true) || (event.button == 0 && $(event.target).is(".close, .close_img"))))
			||
			($(this).is(".pin") && event.button == 1 && opt.close_with_MMB == true && opt.allow_pin_close == true)
		) {
			if ($(this).is(".active:visible") && opt.after_closing_active_tab != "browser") {
				if (opt.after_closing_active_tab == "above") {
					ActivatePrevTab();
				}
				if (opt.after_closing_active_tab == "below") {
					ActivateNextTab();
				}
			}

			if ($("#" + this.id).is(".pin")) {
				$("#" + this.id).remove();
				chrome.tabs.update(parseInt(this.id), { pinned: false });
			}

			chrome.tabs.remove(parseInt(this.id));
		}
	});

	// SINGLE CLICK TO ACTIVATE TAB
	$(document).on("click", ".tab_header", function(event) {
		if ($(".menu").is(":visible")) {
			return;
		}
		event.stopPropagation();
		if (!event.shiftKey && !event.ctrlKey && $(event.target).is(":not(.close, .close_img, .expand, .tab_mediaicon)")) {
			SetActiveTab($(this).parent()[0].id);
			chrome.tabs.update(parseInt($(this).parent()[0].id), { active: true });
		}
	});
}