// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********		  TABS EVENTS		  ***************

function SetTabEvents() {
	
	// set bg.dt to detach tabs when drag ends outside the window
	$(document).on("dragleave", "body", function(event) {
		bg.dt.DroppedToWindowId = 0;
	});
	// set bg.dt to attach tabs when drag ends inside the window
	$(document).on("dragover", "*", function(event) {
		bg.dt.DroppedToWindowId = CurrentWindowId;
	});

	// double click to create tab
	$(document).on("dblclick", ".group, #pin_list, .expand", function(event) {
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

	$(document).on("mouseover", ".tab_header", function(event) {
		$(this).addClass("tab_header_hover");

		if (bg.opt.always_show_close == false) {
			$(this).addClass("close_show");
		}
	});

	$(document).on("mouseleave", ".tab_header", function(event) {
		$(this).removeClass("tab_header_hover");

		if (bg.opt.always_show_close == false) {
			$(this).removeClass("close_show");
		}
	});

	// PREVENT THE DEFAULT BROWSER DROP ACTION
	$(document).bind("drop dragover", function(event) {
		event.preventDefault();
	});


	// bring to front drop zones
	$(document).on("dragenter", ".tab_header", function(event) {
		DropTargetsSendToFront();
	});

	// SET DRAG SOURCE
	$(document).on("dragstart", ".tab_header", function(event) {
		event.stopPropagation();
		bg.dt.tabsIds.splice(0, bg.dt.tabsIds.length);
		bg.dt.CameFromWindowId = CurrentWindowId;

		event.originalEvent.dataTransfer.setData("null", "null");
		event.originalEvent.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);

		DragNode = $(this).parent()[0];
		$(".close").removeClass("show");
		$(".tab_header_hover").removeClass("tab_header_hover");
		$(this).parent().addClass("tab_header_hover");

		if ($(this).parent().is(":not(.selected)")) {
			$(".selected").addClass("frozen").removeClass("selected");
			$(this).parent().addClass("temporary").addClass("selected");
		}

		$(".selected:visible").each(function() {
			bg.dt.tabsIds.push(parseInt(this.id));
			if ($("#ch" + this.id).children().length > 0) {
				$($("#ch" + this.id).find(".tab")).each(function() {
					bg.dt.tabsIds.push(parseInt(this.id));
				});
			}
		});
	});
	
	// SET DROP TARGET, PIN_LIST, TAB_LIST, GROUP OR GROUP_BUTTON, UNGROUP/TAB_LIST
	$(document).on("dragenter", "#ungrouped_tabs, #pin_list, .group, .group_button", function(event) {
		event.stopPropagation();
		if ($(this).is(".group_button")){
			bg.dt.DropToTabId = (this.id).substr(1);
		}
		if ($(this).is("#pin_list, .group")){
			bg.dt.DropToTabId = this.id;
		}
		if ($(this).is("#ungrouped_tabs")){
			bg.dt.DropToTabId = "tab_list";
		}
		
		bg.dt.DropBeforeTabId = bg.dt.DropAfterTabId = undefined;
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		$(this).addClass("highlighted_drop_target");
	});
	

	// SET DROP TARGET WHEN ENTERING PINS AND TABS
	$(document).on("dragenter", ".drag_entered_top:not(.highlighted_drop_target), .drag_entered_bottom:not(.highlighted_drop_target), .drag_enter_center:not(.highlighted_drop_target)", function(event) {
		event.stopPropagation();
		if ($(".selected:visible").find($(this)).length > 0) {
			return;
		}
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		$(this).addClass("highlighted_drop_target");
		
		bg.dt.DropToTabId = bg.dt.DropBeforeTabId = bg.dt.DropAfterTabId = undefined;

		if ($(this).is(".drag_enter_center")) {
			bg.dt.DropToTabId = $(this).parent()[0].id;
		}
		
		if ($(this).is(".drag_entered_bottom")) {
			bg.dt.DropAfterTabId = $(this).parent()[0].id;
		}
		
		if ($(this).is(".drag_entered_top")) {
			bg.dt.DropBeforeTabId = $(this).parent()[0].id;
		}
	});


	// TIMER FOR FOR AUTO EXPAND
	$(document).on("dragenter", ".drag_enter_center", function(event) {
		event.stopPropagation();
		timeout = false;
		setTimeout(function() { timeout = true; }, 1800);
	});
	$(document).on("dragleave", ".drag_enter_center", function(event) {
		timeout = false;
	});
	$(document).on("dragover", ".c > .drag_enter_center", function(event) {
		if (timeout && bg.opt.open_tree_on_hover) {
			$(this).parent().addClass("o").removeClass("c");
			timeout = false;
		}
	});

	
	// THIS IS WHERE ALL DRAG&DROP IS HANDLED
	$(document).on("dragend", ".tab_header", function(event) {
		// CameFromWindowId == CurrentWindowId means that tabs were dragged from this window, DroppedToWindowId == 0, means that tabs were DROPPED out of window,
		if (bg.dt.CameFromWindowId == CurrentWindowId && bg.dt.DroppedToWindowId == 0) {
			DetachTabs(bg.dt.tabsIds);
		}

		// CameFromWindowId == CurrentWindowId means that tabs were dragged from this window, DroppedToWindowId != CurrentWindowId, means that tabs were DROPPED to another window,
		// DroppedToWindowId != 0, means there is actually a window to send tabs to
		if (bg.dt.CameFromWindowId == CurrentWindowId && bg.dt.DroppedToWindowId != CurrentWindowId && bg.dt.DroppedToWindowId != 0) {
			var pin = (bg.dt.DropToTabId == "pin_list" || $(".pin#"+bg.dt.DropBeforeTabId)[0] || $(".pin#"+bg.dt.DropAfterTabId)[0]) ? true : false;
			bg.dt.tabsIds.forEach(function(tabId) {
				chrome.tabs.update(tabId, {pinned: pin});
			});
			setTimeout(function() {
				bg.dt.tabsIds.forEach(function(tabId) {
					if ((bg.tabs[tabId].p).match("g_|tab_list|pin_list") !== null) {
						bg.tabs[tabId].p = bg.dt.DropToTabId;
					}
				});
				chrome.tabs.move(bg.dt.tabsIds, { windowId: bg.dt.DroppedToWindowId, index: -1 });
			}, 400);
		}

		if (bg.dt.CameFromWindowId == CurrentWindowId && bg.dt.DroppedToWindowId == CurrentWindowId) {
			
			// dropped on pin
			if ($(".highlighted_drop_target").parent().is(".pin")) {
				$(".selected:visible").each(function() {
					SetTabClass({ id: this.id, pin: true });
					if ($(".highlighted_drop_target").is(".drag_entered_top")) {
						$(this).insertBefore($(".highlighted_drop_target").parent());
					} else {
						$(this).insertAfter($(".highlighted_drop_target").parent());
					}
				});
			}

			// dropped on tab
			if ($(".highlighted_drop_target").parent().is(".tab")) {
				if ($(".highlighted_drop_target").parent().is(".selected")) {
					$(".highlighted_drop_target").parent().addClass("highlighted_selected").removeClass("selected");
				}
				$(".selected:visible").each(function() {
					SetTabClass({ id: this.id, pin: false });
				});
				if ($(".highlighted_drop_target").is(".drag_entered_top")) {
					$(".selected:visible").insertBefore($(".highlighted_drop_target").parent());
				}
				if ($(".highlighted_drop_target").is(".drag_entered_bottom")) {
					$(".selected:visible").insertAfter($(".highlighted_drop_target").parent());
				}
				if (($(".highlighted_drop_target").is(".drag_enter_center") && $("#" + DragNode.id).parent()[0].id != "ch" + $(".highlighted_drop_target")[0].id.substr(2))) {
					if (bg.opt.append_at_end) {
						$("#ch" + $(".highlighted_drop_target")[0].id.substr(2)).append($(".selected:visible"));
					} else {
						$("#ch" + $(".highlighted_drop_target")[0].id.substr(2)).prepend($(".selected:visible"));
					}
				}
			}
			
			// dropped on un-grouped button in groups toolbar
			if ($(".highlighted_drop_target").is("#ungrouped_tabs")) {
				$(".selected:visible").each(function() {
					SetTabClass({ id: this.id, pin: false });
				});
				$("#tab_list").append($(".selected:visible"));
			}
			
			// dropped on group button in groups toolbar
			if ($(".highlighted_drop_target").is(".group_button")) {
				$(".selected:visible").each(function() {
					SetTabClass({ id: this.id, pin: false });
				});
				$("#"+$(".highlighted_drop_target")[0].id.substr(1)).append($(".selected:visible"));
			}
			
			// dropped on group or pin_list, somewhere on empty space on tabs list
			if ($(".highlighted_drop_target").is("#pin_list, .group")) {
				$(".selected:visible").each(function() {
					SetTabClass({ id: this.id, pin: ($(".highlighted_drop_target").is("#pin_list") ? true : false) });
				});
				$(".highlighted_drop_target").append($(".selected:visible"));
			}
			
			$(".highlighted_selected").addClass("selected").removeClass("highlighted_selected");
		}
		
		RefreshExpandStates();

		setTimeout(function() {
			timeout = false;
			DragNode = undefined;
			schedule_update_data++;
			DropTargetsSendToBack();
			RefreshGUI();
		}, 500);
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		$(".tab_header_hover").removeClass("tab_header_hover");
		$(".frozen").addClass("selected").removeClass("frozen");
		$(".temporary").removeClass("selected").removeClass("temporary");
		chrome.runtime.sendMessage({command: "drag_end"});
	});


	// EXPAND BOX - EXPAND / COLLAPSE
	$(document).on("mousedown", ".exp_box", function(event) {
		event.stopPropagation();
		if (event.button == 0) {
			if ($(this).parent().parent().is(".o")) {
				$(this).parent().parent().removeClass("o").addClass("c");
				if (bg.tabs[$(this).parent().parent()[0].id]) {
					bg.tabs[$(this).parent().parent()[0].id].o = "c";
				}
			} else {
				if ($(this).parent().parent().is(".c")) {
					if (bg.opt.close_other_trees) {
						$(".o").removeClass("o").addClass("c");
						$(this).parents(".tab").each(function() {
							$(this).removeClass("n").removeClass("c").addClass("o");
							if (bg.tabs[this.id]) {
								bg.tabs[this.id].o = "o";
							}
						});
						$(".c").each(function() {
							if (bg.tabs[this.id]) {
								bg.tabs[this.id].o = "c";
							}
						});
					}
					$(this).parent().parent().removeClass("c").addClass("o");
					if (bg.tabs[$(this).parent().parent()[0].id]) {
						bg.tabs[$(this).parent().parent()[0].id].o = "o";
					}
				}
			}
			bg.schedule_save++;
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
				$(".pin, .tab:visible").removeClass("selected").removeClass("frozen").removeClass("temporary");
				if ($(this).index() >= $(".active:visible").index()) {
					$(".active:visible").nextUntil($(this), ":visible").add($(".active:visible")).add($(this)).addClass("selected");
				} else {
					$(".active:visible").prevUntil($(this), ":visible").add($(".active:visible")).add($(this)).addClass("selected");
				}
			}

			// TOGGLE SELECTION WITH CTRL
			if (event.ctrlKey) {
				$(this).toggleClass("selected");
			}
		}

		// CLOSE TAB
		if (
			(($(this).is(".tab") && $(event.target).is(":not(.expand)")) && ((event.button == 1 && bg.opt.close_with_MMB == true) || (event.button == 0 && $(event.target).is(".close, .close_img"))))
			||
			($(this).is(".pin") && event.button == 1 && bg.opt.close_with_MMB == true && bg.opt.allow_pin_close == true)
		) {
			if ($(this).is(".active:visible") && bg.opt.after_closing_active_tab != "browser") {
/* 				var tabId;
				var Prev = $(this).prev();
				var Next = $(this).next();

				// if in root, seek for closest, in order set in options, first next then prev, or prev then next
				if ($(this).parent().is("#pin_list, .group, .children")) {
					if (bg.opt.after_closing_active_tab == "above") {
						if (Prev[0]) {
							tabId = Prev[0].id;
						} else {
							if (Next[0]) {
								tabId = Next[0].id;
							}
						}
					}
					if (bg.opt.after_closing_active_tab == "below") {
						if (Next[0]) {
							tabId = Next[0].id;
						} else {
							if (Prev[0]) {
								tabId = Prev[0].id;
							}
						}
					}
				}

				// if no tabs left in the tree, go to parent
				if (tabId == undefined && $(this).parent().parent().is(".tab")) {
					tabId = $(this).parent().parent()[0].id;
				}

				// if found a matching condition a new tab will be activated
				if (tabId) {
					SetActiveTab(tabId);
					chrome.tabs.update(parseInt(tabId), { active: true });
				} */
				
				if (bg.opt.after_closing_active_tab == "above") {
					ActivatePrevTab();
				}
				if (bg.opt.after_closing_active_tab == "below") {
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