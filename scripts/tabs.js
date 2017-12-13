// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********       TABS FUNCTIONS          ***************

async function UpdateData() {
	setInterval(function() {
		if (schedule_update_data > 1) {schedule_update_data = 1;}
		if (schedule_update_data > 0) {
			$(".pin").each(function() {
				chrome.runtime.sendMessage({
					command: "update_tab",
					tabId: parseInt(this.id),
					tab: {
						parent: "pin_list",
						index: $(this).index(),
						expand: "n"
					}
				});
			});
			$(".tab").each(function() {
				chrome.runtime.sendMessage({
					command: "update_tab",
					tabId: parseInt(this.id),
					tab: {
						// parent: $(this).parent(".group")[0] ? $(this).parent()[0].id : $(this).parent().parent(".tab, .folder")[0].id,
						parent: $(this).parent().parent()[0].id,
						index: $(this).index(),
						expand: ($(this).is(".n") ? "n" : ($(this).is(".c") ? "c" : "o"))
					}
				});
			});
			schedule_update_data--;
		}
	}, 1000);
}

function RearrangeBrowserTabsCheck() {
	setInterval(function() {
		if (opt.syncro_tabbar_tabs_order) {
			if (schedule_rearrange_tabs > 1) {schedule_rearrange_tabs = 1;}
			if (schedule_rearrange_tabs > 0) {
				let tabIds = $(".pin, .tab").map(function(){return parseInt(this.id);}).toArray();
				RearrangeBrowserTabs(tabIds, tabIds.length-1);
				schedule_rearrange_tabs--;
			}
		}
	}, 1000);
}

async function RearrangeBrowserTabs(tabIds, tabIndex) {
	if (tabIndex > 0){
		chrome.tabs.get(tabIds[tabIndex], function(tab) {
			if (tab && tabIndex != tab.index) {
				chrome.tabs.move(tabIds[tabIndex], {index: tabIndex});
			}
			setTimeout(function() {
				RearrangeBrowserTabs( tabIds, (tabIndex-1) );
			}, 1);
		});
	}
}

function RearrangeTreeTabs(tabs, bgtabs, first_loop) {
	tabs.forEach(function(Tab) {
		if (bgtabs[Tab.id] && $("#"+Tab.id)[0] && $("#"+Tab.id).parent().children().eq(bgtabs[Tab.id].index)[0]) {
			if ($("#"+Tab.id).index() > bgtabs[Tab.id].index) {
				$("#"+Tab.id).insertBefore($("#"+Tab.id).parent().children().eq(bgtabs[Tab.id].index));
			} else {
				$("#"+Tab.id).insertAfter($("#"+Tab.id).parent().children().eq(bgtabs[Tab.id].index));
			}
		}
		if (bgtabs[Tab.id] && $("#"+Tab.id).index() != bgtabs[Tab.id].index && first_loop) {
			RearrangeTreeTabs(tabs, bgtabs, false);
		}
	});
}

// param - tuple object with paramenters: param.tab - tab object, param.ParentId - Parent tabId, param.InsertAfterId - insert tab after this tabId (on same level),
// param.Append - if true Appends tab at the end of tree if false or prepends
function AppendTab(param) {
	if ($("#"+param.tab.id).length > 0) {
		GetFaviconAndTitle(param.tab.id, param.addCounter);
		return;
	}	
	
	var ClassList = param.tab.pinned ? "pin" : "tab n";
	if (param.tab.discarded) {
		ClassList = ClassList + " discarded";
	}
	if (param.AdditionalClass) {
		ClassList = ClassList +" "+ param.AdditionalClass;
	}
	
	var tb = document.createElement("div"); tb.className =  ClassList; tb.id = param.tab.id; // TAB
	var dc = document.createElement("div"); dc.className = "drop_target drag_enter_center"; dc.id = "dc"+param.tab.id; tb.appendChild(dc); // DROP TARGET CENTER
	var dt = document.createElement("div"); dt.className = "drop_target drag_entered_top"; dt.id = "du"+param.tab.id; tb.appendChild(dt); // DROP TARGET TOP
	var db = document.createElement("div"); db.className = "drop_target drag_entered_bottom"; db.id = "dd"+param.tab.id; tb.appendChild(db); // DROP TARGET BOTTOM
	var th = document.createElement("div"); th.className = opt.always_show_close ? "tab_header close_show" : "tab_header"; th.id = "tab_header"+param.tab.id; th.draggable = true; tb.appendChild(th); // HEADER
	var ex = document.createElement("div"); ex.className = "expand"; ex.id = "exp"+param.tab.id; th.appendChild(ex); // EXPAND ARROW
	var tt = document.createElement("div"); tt.className = "tab_title"; tt.id = "tab_title"+param.tab.id; th.appendChild(tt); // TITLE
	// var tc = document.createElement("div"); tc.className = "tab_counter"; tc.id = "tab_counter"+param.tab.id; th.appendChild(tc); // TABS COUNTER

	if (!opt.never_show_close) {
		var cl = document.createElement("div"); cl.className = "close"; cl.id = "close"+param.tab.id; th.appendChild(cl); // CLOSE BUTTON
		var ci = document.createElement("div"); ci.className = "close_img"; ci.id = "close_img"+param.tab.id; cl.appendChild(ci);
	}

	var mi = document.createElement("div"); mi.className = "tab_mediaicon"; mi.id = "tab_mediaicon"+param.tab.id; th.appendChild(mi);
	var ch = document.createElement("div"); ch.className = "children"; ch.id = "ch"+param.tab.id; tb.appendChild(ch);

	if (param.tab.pinned) {
		param.ParentId = "pin_list";
	} else {
		if (param.ParentId == undefined || $("#"+param.ParentId).is(".pin, #pin_list") || $("#"+param.ParentId).length == 0) {
			param.ParentId = "ch"+active_group;
		} else {
			// if($("#"+param.ParentId).is(".tab") || $("#"+param.ParentId).is(".group")) { /* GROUP PART IS LEGACY */
				if ($("#ch"+param.ParentId).children().length == 0) {
					$("#"+param.ParentId).addClass("o").removeClass("n").removeClass("c");
				}
				
				param.ParentId = "ch"+param.ParentId;
			/* } */
		}
	}	

	if (param.Append) {
		$("#"+param.ParentId).append(tb);
	}
	if (!param.Append) {
		$("#"+param.ParentId).prepend(tb);
	}

	if (param.InsertBeforeId != undefined && $("#"+param.InsertBeforeId)[0]) {
		if ((param.tab.pinned && $("#"+param.InsertBeforeId).is(".pin")) || (!param.tab.pinned && $("#"+param.InsertBeforeId).is(".tab"))) {
			$("#"+param.tab.id).insertBefore($("#"+param.InsertBeforeId));
		}
	}
	if (param.InsertAfterId != undefined && $("#"+param.InsertAfterId)[0]) {
		if ((param.tab.pinned && $("#"+param.InsertAfterId).is(".pin")) || (!param.tab.pinned && $("#"+param.InsertAfterId).is(".tab"))) {
			$("#"+param.tab.id).insertAfter($("#"+param.InsertAfterId));
		}
	}
 
	GetFaviconAndTitle(param.tab.id, param.addCounter);
	RefreshMediaIcon(param.tab.id);


	if (param.tab.active && param.SkipSetActive == undefined) {
		SetActiveTab(param.tab.id);
	}

	if (param.Scroll) {
		ScrollToTab(param.tab.id);
	}
}

function RemoveTabFromList(tabId) {
	if ($("#"+tabId)[0]) {
		$("#"+tabId).remove();
	}
}

// param - tuple object with paramenters: param.pin - true for pinned, param.id - tabId
function SetTabClass(param) {
	if (param.pin) {
		$("#pin_list").append($("#"+param.id));
		// flatten out children
		if ($("#ch"+param.id).children().length > 0) {
			$($("#"+param.id).children().find(".pin, .tab").get().reverse()).each(function() {
				$(this).removeClass("tab").removeClass("n").removeClass("o").removeClass("c").addClass("pin");
				$(this).insertAfter($("#"+param.id));
				chrome.tabs.update(parseInt(this.id), {pinned: true});
			});
		}
		$("#"+param.id).removeClass("tab").removeClass("n").removeClass("o").removeClass("c").addClass("pin");
	} else {
		$("#ch"+active_group).prepend($("#"+param.id));
		$("#"+param.id).removeClass("pin").removeClass("attention").addClass("tab");
		RefreshExpandStates();
	}
	chrome.tabs.update(parseInt(param.id), {pinned: param.pin});
	RefreshGUI();
}

function SetActiveTab(tabId) {
	if ($("#"+tabId).length > 0) {
		if ($("#"+tabId).is(".tab")) {
			SetActiveTabInGroup($("#"+tabId).parents(".group")[0].id, tabId);
		}
		$(".selected_folder").removeClass("selected_folder");
		$(".pin, #"+active_group+" .tab").removeClass("active_tab").removeClass("selected_tab").removeClass("selected_frozen").removeClass("selected_temporarly").removeClass("tab_header_hover");
		// if ($("#"+tabId).is(".tab")) {
			// $("#"+($("#"+tabId).parents(".group")[0].id)+" .tab").removeClass("active_tab").removeClass("selected_tab").removeClass("selected_frozen").removeClass("selected_temporarly").removeClass("tab_header_hover");
		// }
		// $(".pin").removeClass("active_tab").removeClass("selected_tab").removeClass("selected_frozen").removeClass("selected_temporarly").removeClass("tab_header_hover");
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		$("#"+tabId).removeClass("attention").addClass("active_tab");
		ScrollToTab(tabId);
	}
}

function ScrollToTab(tabId) {
	if ($("#"+tabId)[0]) {
		if ($("#"+tabId).is(".pin")) {
			if ($("#"+tabId).position().left+$("#"+tabId).outerWidth() > $("#pin_list").innerWidth()) {
				$("#pin_list").scrollLeft($("#pin_list").scrollLeft()+$("#"+tabId).position().left+$("#"+tabId).outerWidth()-$("#pin_list").innerWidth());
			} else {
				if ($("#"+tabId).position().left < 0) {
					$("#pin_list").scrollLeft($("#pin_list").scrollLeft()+$("#"+tabId).position().left);
				}
			}
		}
		if ($("#"+tabId).is(".tab")) {
			if ($("#"+active_group+" #"+tabId)[0]) {
				if ($("#"+tabId).is(":not(:visible)")) {
					$("#"+tabId).parents(".folder, .tab").removeClass("c").addClass("o");
				}
				if ($("#"+tabId).offset().top - $("#"+active_group).offset().top < 0) {
					$("#"+active_group).scrollTop($("#"+active_group).scrollTop() + $("#"+tabId).offset().top - $("#"+active_group).offset().top);
				} else {
					if ($("#"+tabId).offset().top - $("#"+active_group).offset().top > $("#"+active_group).innerHeight() - $(".tab_header").outerHeight()) {
						$("#"+active_group).scrollTop($("#"+active_group).scrollTop() + $("#"+tabId).offset().top - $("#"+active_group).offset().top - $("#"+active_group).innerHeight() + $(".tab_header").outerHeight() + 4);
					}
				}
			}
		}
	}
}

function DetachTabs(tabsIds) {
	chrome.windows.get(CurrentWindowId, {populate : true}, function(window) {
		if (window.tabs.length == 1) {
			return;
		}
		if (browserId == "F") { // AGAIN BUG 1398272 - MOZILLA!
			let counter = 0;
			let Parents = [];
			tabsIds.forEach(function(tabId) {
				if ($("#"+tabId)[0]){
					Parents.push(parseInt($("#"+tabId).parent().parent()[0].id));
				} else {
					Parents.push(0);
				}
			});
			chrome.windows.create({tabId: tabsIds[0], state:window.state}, function(new_window) {
				if (Parents.indexOf(tabsIds[counter]) != -1){
					chrome.runtime.sendMessage({command: "update_tab", tabId: tabsIds[Parents.indexOf(tabsIds[counter])], tab: {parent: new_window.tabs[0].id}});
				}
				(tabsIds).forEach(function(tabId) {
					chrome.tabs.move(tabId, {windowId: new_window.id, index:-1}, function(MovedTab) {
						if (MovedTab && Parents.indexOf(tabsIds[counter]) != -1){
							chrome.runtime.sendMessage({command: "update_tab", tabId: tabsIds[Parents.indexOf(tabsIds[counter])], tab: {parent: MovedTab[0].id}});
						}
						counter++;						
					});
				});
				// chrome.tabs.remove(new_window.tabs[0].id, null);
			});
		} else {
			chrome.windows.create({tabId: tabsIds[0], state:window.state}, function(new_window) {
				(tabsIds).forEach(function(tabId) {
					chrome.tabs.move(tabId, {windowId: new_window.id, index:-1});
				});
			});
		}
	});
}

// find and select tabs
function FindTab(input) {
	$(".filtered").removeClass("filtered").removeClass("selected_tab");
	$(".highlighted_search").removeClass("highlighted_search");
	if (input.length == 0) {
		$("#filter_box")[0].value = "";
		$("#button_filter_clear").css({"opacity": "0"}).attr("title", "");
		return;
	} else {
		$("#button_filter_clear").css({"opacity": "1"});
		$("#button_filter_clear").attr("title", caption_clear_filter);
	}
	SearchIndex = 0;
	chrome.tabs.query({windowId: CurrentWindowId, pinned: false}, function(tabs) {
		tabs.forEach(function(Tab) {
			if ($("#button_filter_type").is(".url") && Tab.url.toLowerCase().match(input.toLowerCase())) {
				$("#"+Tab.id).addClass("filtered").addClass("selected_tab");
			}
			if ($("#button_filter_type").is(".title") && Tab.title.toLowerCase().match(input.toLowerCase())) {
				$("#"+Tab.id).addClass("filtered").addClass("selected_tab");
			}
		});
	});
}

function CloseTabs(tabsIds) {
	tabsIds.forEach(function(tabId) {
		if ($("#"+tabId).is(".pin") && opt.allow_pin_close) {
			$("#"+tabId).remove();
			chrome.tabs.update(tabId, {pinned: false});
		}
		if ($("#"+tabId).is(".tab")) {
			$("#"+tabId).remove();
		}
	});
	setTimeout(function() {
		chrome.tabs.remove(tabsIds, null);
	}, 100);
}


function DiscardTabs(tabsIds) {
	var delay = 100;
	if ($("#"+tabsIds[0]).is(".discarded")) {
		delay = 5;
	} else {
		chrome.tabs.discard(tabsIds[0]);
	}
	tabsIds.splice(0, 1);
	if (tabsIds.length > 0) {
		setTimeout(function() {
			DiscardTabs(tabsIds);
		}, delay);
	}
}


function ActivateNextTabAfterClose() {
	if ($(".pin.active_tab:visible")[0]) {
		if ($(".pin.active_tab").next(".pin")[0]) {
			chrome.tabs.update(parseInt($(".pin.active_tab").next(".pin")[0].id), { active: true });
		} else {
			if ($(".pin.active_tab").prev(".pin")[0]) {
				chrome.tabs.update(parseInt($(".pin.active_tab").prev(".pin")[0].id), { active: true });
			}
		}
	}
	if ($(".tab.active_tab:visible")[0] && $(".tab:visible").length > 1) {
		if ($(".active_tab:visible").children().last().children(".tab")[0]) {
			chrome.tabs.update(parseInt($(".active_tab:visible").children().last().children(".tab")[0].id), { active: true });
		} else {
			if ($(".active_tab:visible").next(".tab")[0]) {
				chrome.tabs.update(parseInt($(".active_tab:visible").next(".tab")[0].id), { active: true });
			} else {
				if ($(".active_tab:visible").prev(".tab")[0]) {
					chrome.tabs.update(parseInt($(".active_tab:visible").prev(".tab")[0].id), { active: true });
				} else {
					if ($(".tab.active_tab:visible").parent().is(".children") && $(".tab.active_tab:visible").parent().parent(".tab")[0]) {
						chrome.tabs.update(parseInt($(".tab.active_tab:visible").parent().parent(".tab")[0].id), { active: true });
					} else {
						if ($(".active_tab:visible").parents(".tab").last().next(".tab")[0]) {
							chrome.tabs.update(parseInt($(".active_tab:visible").parents(".tab").last().next(".tab")[0].id), { active: true });
						} else {
							if ($(".tab:visible:last")[0]) {
								chrome.tabs.update(parseInt($(".tab:visible:last")[0].id), { active: true });
							}
							// ActivatePrevTab();
						}
					}
				}
			}
		}
	}
}

function ActivatePrevTabAfterClose() {
	if ($(".pin.active_tab")[0]) {
		if ($(".pin.active_tab").prev(".pin")[0]) {
			chrome.tabs.update(parseInt($(".pin.active_tab").prev(".pin")[0].id), { active: true });
		} else {
			if ($(".pin.active_tab").next(".pin")[0]) {
				chrome.tabs.update(parseInt($(".pin.active_tab").next(".pin")[0].id), { active: true });
			}
		}
	}
	if ($(".tab.active_tab:visible")[0] && $(".tab:visible").length > 1) {
		if ($(".active_tab:visible").children().last().children(".tab")[0]) {
			chrome.tabs.update(parseInt($(".active_tab:visible").children().last().children(".tab")[0].id), { active: true });
		} else {
			if ($(".active_tab:visible").prev(".tab:visible")[0]) {
				chrome.tabs.update(parseInt($(".active_tab:visible").prev(".tab:visible")[0].id), { active: true });
			} else {
				if ($(".active_tab:visible").next(".tab:visible")[0]) {
					chrome.tabs.update(parseInt($(".active_tab:visible").next(".tab:visible")[0].id), { active: true });
				} else {
					if ($(".tab.active_tab:visible").parent().is(".children") && $(".tab.active_tab:visible").parent().parent(".tab")[0]) {
						chrome.tabs.update(parseInt($(".tab.active_tab:visible").parent().parent(".tab")[0].id), { active: true });
					} else {
						if ($(".active_tab:visible").parents(".tab").last().prev(".tab:visible")[0]) {
							chrome.tabs.update(parseInt($(".active_tab:visible").parents(".tab").last().prev(".tab:visible")[0].id), { active: true });
						} else {
							if ($(".tab:visible:last")[0]) {
								chrome.tabs.update(parseInt($(".tab:visible:last")[0].id), { active: true });
							}
							// ActivateNextTab();
						}
					}
				}
			}
		}
	}
}

function ActivateNextTab() {
	if ($(".pin.active_tab:visible")[0]) {
		if ($(".pin.active_tab").next(".pin")[0]) {
			chrome.tabs.update(parseInt($(".pin.active_tab").next(".pin")[0].id), { active: true });
		} else {
			if ($(".pin.active_tab").prev(".pin")[0]) {
				chrome.tabs.update(parseInt($(".pin.active_tab").prev(".pin")[0].id), { active: true });
			}
		}
	}
	if ($(".tab.active_tab:visible")[0] && $(".tab:visible").length > 1) {
		if ($(".active_tab:visible").children().last().children(".tab")[0]) {
			chrome.tabs.update(parseInt($(".active_tab:visible").children().last().children(".tab")[0].id), { active: true });
		} else {
			if ($(".active_tab:visible").next(".tab:visible")[0]) {
				chrome.tabs.update(parseInt($(".active_tab:visible").next(".tab:visible")[0].id), { active: true });
			} else {
				if ($(".active_tab:visible").parent().parent().next(".tab:visible")[0]) {
					chrome.tabs.update(parseInt($(".active_tab:visible").parent().parent().next(".tab:visible")[0].id), { active: true });
				} else {
					if ($(".active_tab:visible").parents(".tab").last().next(".tab:visible")[0]) {
						chrome.tabs.update(parseInt($(".active_tab:visible").parents(".tab").last().next(".tab:visible")[0].id), { active: true });
					}
					// else {
						// ActivatePrevTab();
					// }
				}
			}
		}
	}
}

function ActivatePrevTab() {
	if ($(".pin.active_tab")[0]) {
		if ($(".pin.active_tab").prev(".pin")[0]) {
			chrome.tabs.update(parseInt($(".pin.active_tab").prev(".pin")[0].id), { active: true });
		} else {
			if ($(".pin.active_tab").next(".pin")[0]) {
				chrome.tabs.update(parseInt($(".pin.active_tab").next(".pin")[0].id), { active: true });
			}
		}
	}
	if ($(".tab.active_tab:visible")[0] && $(".tab:visible").length > 1) {
		if ($(".active_tab:visible").prev().find(".tab").length > 0) {
			chrome.tabs.update(parseInt($(".active_tab:visible").prev().find(".tab").last()[0].id), { active: true });
		} else {
			if ($(".active_tab:visible").prev(".tab")[0]) {
				chrome.tabs.update(parseInt($(".active_tab:visible").prev(".tab")[0].id), { active: true });
			} else {
				if ($(".tab.active_tab:visible").parent().is(".children") && $(".tab.active_tab:visible").parent().parent(".tab")[0]) {
					chrome.tabs.update(parseInt($(".tab.active_tab:visible").parent().parent(".tab")[0].id), { active: true });
				}
				// else {
					// ActivateNextTab();
				// }
			}
		}

	}
}

function DropTargetsSendToFront() {
	if (DropTargetsInFront == false) {
		$(".drop_target").show();
		DropTargetsInFront = true;
	}
}
function DropTargetsSendToBack() {
	if (DropTargetsInFront) {
		$(".drop_target").hide();
		DropTargetsInFront = false;
	}
}


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
		if (event.button == 0) {
			if ($(this).parent().parent().is(".o")) {
				$(this).parent().parent().removeClass("o").addClass("c");
				chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt($(this).parent().parent()[0].id), tab: { expand: "c" } });
			} else {
				if ($(this).parent().parent().is(".c")) {
					$(this).parent().parent().removeClass("c").addClass("o");
					chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt($(this).parent().parent()[0].id), tab: { expand: "o" } });
					if (opt.close_other_trees) {
						$(".o:visible:not(#"+$(this).parent().parent()[0].id+")").removeClass("o").addClass("c");
						$(this).parents(".tab").each(function() {
							$(this).removeClass("n").removeClass("c").addClass("o");
							chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(this.id), tab: { expand: "o" } });
						});
						$(".c").each(function() {
							chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(this.id), tab: { expand: "c" } });
						});
					}
				}
			}
		}
	});

	// SELECT TAB/PIN
	$(document).on("mousedown", ".tab, .pin", function(event) {
		if ($(".menu").is(":visible")) {
			return;
		}
		event.stopPropagation();
		if (event.button == 0) {
			DropTargetsSendToBack();
			let tabId = parseInt(this.id);
			// SET SELECTION WITH SHIFT
			if (event.shiftKey) {
				$(".pin, .tab:visible").removeClass("selected_tab").removeClass("selected_frozen").removeClass("selected_temporarly");
				if ($(this).index() >= $(".active_tab:visible").index()) {
					$(".active_tab:visible").nextUntil($(this), ":visible").add($(".active_tab:visible")).add($(this)).addClass("selected_tab");
				} else {
					$(".active_tab:visible").prevUntil($(this), ":visible").add($(".active_tab:visible")).add($(this)).addClass("selected_tab");
				}
			}
			// TOGGLE SELECTION WITH CTRL
			if (event.ctrlKey) {
				// if ($(".active_tab:visible").is(":not(.selected_tab)")) {
					// $(".active_tab:visible").addClass("selected_tab");
				// }
				$(this).toggleClass("selected_tab");
			}
		}
	});


	// CLOSE TAB/PIN
	$(document).on("mousedown", ".tab_header", function(event) {
		if ($(".menu").is(":visible")) {
			return;
		}
		let tabId = parseInt($(this).parent()[0].id);
		if ((event.button == 1 && opt.close_with_MMB == true && $(this).parent().is(".tab")) || (event.button == 1 && opt.close_with_MMB == true && $(this).parent().is(".pin") && opt.allow_pin_close == true) || (event.button == 0 && $(event.target).is(".close, .close_img"))) {
			if ($(this).parent().is(".active_tab:visible") && opt.after_closing_active_tab != "browser") {
				if (opt.after_closing_active_tab == "above") {
					ActivatePrevTabAfterClose();
				}
				if (opt.after_closing_active_tab == "below") {
					ActivateNextTabAfterClose();
				}

				if (opt.after_closing_active_tab == "above_seek_in_parent") {
					ActivatePrevTab();
				}
				if (opt.after_closing_active_tab == "below_seek_in_parent") {
					ActivateNextTab();
				}
			}
			// hide pin before it will be closed by listener
			$(".pin#"+tabId).css({ "width": "0px", "height": "0px", "border": "none", "overflow": "hidden" });
			chrome.tabs.update(tabId, {pinned: false});
			if ($("#"+tabId)[0]) chrome.tabs.remove(tabId);
		}
	});



	// SINGLE CLICK TO ACTIVATE TAB
	$(document).on("click", ".tab_header", function(event) {
		if ($(".menu").is(":visible")  || ($(this).parent().is(".c, .o") && $(event.target).is(".expand")) || $(event.target).is(".close, .close_img, .tab_mediaicon")) {
			return;
		}
		event.stopPropagation();
		if (event.button == 0 && !event.shiftKey && !event.ctrlKey) {
			SetActiveTab($(this).parent()[0].id);
			chrome.tabs.update(parseInt($(this).parent()[0].id), { active: true });
		}
	});
}