// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********       TABS FUNCTIONS          ***************

async function UpdateData() {
	setTimeout(function() {
		// changed it from 1 to 2 if there are some more changes queued, just in case if something did not catch in the first loop
		if (schedule_update_data > 1) {
			schedule_update_data = 2;
		}
		if (schedule_update_data > 0) {
			$(".pin").each(function() {
				if (bg.tabs[this.id]) {
					bg.tabs[this.id].p = "pin_list";
					bg.tabs[this.id].n = $(this).index();
					bg.tabs[this.id].o = "n";
				}
			});
			$(".tab").each(function() {
				if (bg.tabs[this.id]) {
					bg.tabs[this.id].n = $(this).index();
					if ($(this).parent(".group")[0]) {
						bg.tabs[this.id].p = $(this).parent()[0].id;
					} else {
						bg.tabs[this.id].p = $(this).parent().parent()[0].id;
					}
					if ($(this).is(".n")) {
						bg.tabs[this.id].o = "n";
					} else {
						if ($(this).is(".c")) {
							bg.tabs[this.id].o = "c";
						} else {
							bg.tabs[this.id].o = "o";
						}
					}
				}
			});
			bg.schedule_save++;
			schedule_update_data--;
		}
		UpdateData();
	},500);
}

// p - tuple object with paramenters: p.tab - tab object, p.ParentId - Parent tabId, p.InsertAfterId - insert tab after this tabId (on same level),
// p.Append - if true Appends tab at the end of tree if false or prepends
function AppendTab(p) {
	if ($("#"+p.tab.id).length > 0) {
		GetFaviconAndTitle(p.tab.id);
		return;
	}	
	
	var tb = document.createElement("div"); tb.className = p.tab.pinned ? "pin" : (p.tab.discarded ? "tab n discarded" : "tab n"); tb.id = p.tab.id;
	var dc = document.createElement("div"); dc.className = "drop_target drag_enter_center"; dc.id = "dc"+p.tab.id; tb.appendChild(dc);
	var dt = document.createElement("div"); dt.className = "drop_target drag_entered_top"; dt.id = "du"+p.tab.id; tb.appendChild(dt);
	var db = document.createElement("div"); db.className = "drop_target drag_entered_bottom"; db.id = "dd"+p.tab.id; tb.appendChild(db);
	var ex = document.createElement("div"); ex.className = "expand"; ex.id = "exp"+p.tab.id; tb.appendChild(ex);
	var lv = document.createElement("div"); lv.className = "exp_line_v"; lv.id = "exp_line_v"+p.tab.id; ex.appendChild(lv);
	var lh = document.createElement("div"); lh.className = "exp_line_h"; lh.id = "exp_line_h"+p.tab.id; ex.appendChild(lh);
	var eb = document.createElement("div"); eb.className = "exp_box"; eb.id = "exp_box"+p.tab.id; ex.appendChild(eb);
	var th = document.createElement("div"); th.className = bg.opt.always_show_close ? "tab_header close_show" : "tab_header"; th.id = "tab_header"+p.tab.id; th.draggable = true; tb.appendChild(th);
	var tt = document.createElement("div"); tt.className = "tab_title"; tt.id = "tab_title"+p.tab.id; th.appendChild(tt);

	if (!bg.opt.never_show_close) {
		var cl = document.createElement("div"); cl.className = "close"; cl.id = "close"+p.tab.id; th.appendChild(cl);
		var ci = document.createElement("div"); ci.className = "close_img"; ci.id = "close_img"+p.tab.id; cl.appendChild(ci);
	}

	var mi = document.createElement("div"); mi.className = "tab_mediaicon"; mi.id = "tab_mediaicon"+p.tab.id; th.appendChild(mi);
	var ch = document.createElement("div"); ch.className = "children"; ch.id = "ch"+p.tab.id; tb.appendChild(ch);

	if (p.tab.pinned) {
		p.ParentId = "pin_list";
	} else {
		if (p.ParentId == undefined || $("#"+p.ParentId).is(".pin, #pin_list") || $("#"+p.ParentId).length == 0) {
			p.ParentId = active_group;
		} else {
			if($("#"+p.ParentId).is(".tab")) {
				if ($("#ch"+p.ParentId).children().length == 0) {
					$("#"+p.ParentId).addClass("o").removeClass("n").removeClass("c");
				}
				
				p.ParentId = "ch"+p.ParentId;
			}
		}
	}	

	if (p.Append) {
		$("#"+p.ParentId).append(tb);
	}
	if (!p.Append) {
		$("#"+p.ParentId).prepend(tb);
	}

	if (p.InsertBeforeId != undefined && $("#"+p.InsertBeforeId)[0]) {
		if ((p.tab.pinned && $("#"+p.InsertBeforeId).is(".pin")) || (!p.tab.pinned && $("#"+p.InsertBeforeId).is(".tab"))) {
			$("#"+p.tab.id).insertBefore($("#"+p.InsertBeforeId));
		}
	}
	if (p.InsertAfterId != undefined && $("#"+p.InsertAfterId)[0]) {
		if ((p.tab.pinned && $("#"+p.InsertAfterId).is(".pin")) || (!p.tab.pinned && $("#"+p.InsertAfterId).is(".tab"))) {
			$("#"+p.tab.id).insertAfter($("#"+p.InsertAfterId));
		}
	}
 
	GetFaviconAndTitle(p.tab.id);
	RefreshMediaIcon(p.tab.id);

	if (p.tab.active) {
		SetActiveTab(p.tab.id);
	}

	if (p.Scroll) {
		ScrollToTab(p.tab.id);
	}
}

function RemoveTabFromList(tabId) {
	if ($("#"+tabId).length > 0) {
		$("#"+tabId).remove();
	}
}

function SetTabClass(p) {
	if (p.pin) {
		$("#pin_list").append($("#"+p.id));
		// flatten out children
		if ($("#ch"+p.id).children().length > 0) {
			$($("#"+p.id).children().find(".pin, .tab").get().reverse()).each(function() {
				$(this).removeClass("tab").removeClass("n").removeClass("o").removeClass("c").addClass("pin");
				$(this).insertAfter($("#"+p.id));
				chrome.tabs.update(parseInt(this.id), {pinned: true});
			});
		}
		$("#"+p.id).removeClass("tab").removeClass("n").removeClass("o").removeClass("c").addClass("pin");
	} else {
		$("#"+active_group).prepend($("#"+p.id));
		
		$("#"+p.id).removeClass("pin").addClass("tab");
		RefreshExpandStates();
	}
	chrome.tabs.update(parseInt(p.id), {pinned: p.pin});
	RefreshGUI();
}

function SetActiveTab(tabId) {
	if ($("#"+tabId).length > 0) {
		$(".active:visible").removeClass("active").removeClass("selected");
		$(".pin, .tab:visible").removeClass("active").removeClass("selected").removeClass("frozen").removeClass("temporary").removeClass("tab_header_hover");
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		$("#"+tabId).addClass("active").addClass("selected");
		ScrollToTab(tabId);
	}
}

function ScrollToTab(tabId) {
	if ($("#"+tabId).length == 0) {
		return false;
	}
	if ($("#"+tabId).is(":not(:visible)")) {
		$("#"+tabId).parents(".tab").removeClass("c").addClass("o");
	}
	
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
		if ($("#"+tabId).offset().top - $("#"+active_group).offset().top < 0) {
			$("#"+active_group).scrollTop($("#"+active_group).scrollTop() + $("#"+tabId).offset().top - $("#"+active_group).offset().top);
		} else {
			if ($("#"+tabId).offset().top - $("#"+active_group).offset().top > $("#"+active_group).innerHeight() - $(".tab_header").outerHeight()) {
				$("#"+active_group).scrollTop($("#"+active_group).scrollTop() + $("#"+tabId).offset().top - $("#"+active_group).offset().top - $("#"+active_group).innerHeight() + $(".tab_header").outerHeight() + 4);
			}
		}
	}
}

function DetachTabs(tabsIds) {
	chrome.windows.get(CurrentWindowId, {populate : true}, function(window) {
		if (window.tabs.length == 1) {
			return;
		}
		chrome.windows.create({state:window.state}, function(new_window) {
			chrome.tabs.move(tabsIds[0], {windowId: new_window.id, index:-1});
			for (var i = 1; i < tabsIds.length; i++) {
				chrome.tabs.move(tabsIds[i], {windowId: new_window.id, index:-1});
			}
			chrome.tabs.update(tabsIds[0], {active: true});
			setTimeout(function() {
				chrome.tabs.remove(new_window.tabs[0].id, null);
			},500);
		})
	});
}

// find and select tabs
function FindTab(input) {
	$(".filtered").removeClass("filtered").removeClass("selected");
	$(".highlighted_search").removeClass("highlighted_search");
	if (input.length == 0) {
		$("#filter_box")[0].value = "";
		return;
	}
	SearchIndex = 0;
	chrome.tabs.query({windowId: CurrentWindowId, pinned: false}, function(tabs) {
		tabs.forEach(function(Tab) {
			if (bg.opt_toolbar.filter_type == "url" && Tab.url.toLowerCase().match(input.toLowerCase())) {
				$("#"+Tab.id).addClass("filtered").addClass("selected");
			}
			if (bg.opt_toolbar.filter_type == "title" && Tab.title.toLowerCase().match(input.toLowerCase())) {
				$("#"+Tab.id).addClass("filtered").addClass("selected");
			}
		});
	});
}

function CloseTabs(tabsIds) {
	tabsIds.forEach(function(tabId) {
		if ($("#"+tabId).is(".pin") && bg.opt.allow_pin_close) {
			$("#"+tabId).remove();
			chrome.tabs.update(tabId, {pinned: false});
		}
		if ($("#"+tabId).is(".tab")) {
			$("#"+tabId).remove();
		}
	});
	setTimeout(function() {
		chrome.tabs.remove(tabsIds, null);
	},100);
}


function DiscardTabs(tabsIds) {
	var delay = 400;
	if ($("#"+tabsIds[0]).is(".discarded")) {
		delay = 5;
	} else {
		chrome.tabs.discard(tabsIds[0]);
	}
	tabsIds.splice(0, 1);
	if (tabsIds.length > 0) {
		setTimeout(function() {
			DiscardTabs(tabsIds);
		},delay);
	}
}


function ActivateNextTab() {
	if ($(".active:visible").is(".pin")) {
		if ($(".pin.active").next()[0]) {
			chrome.tabs.update(parseInt($(".pin.active").next()[0].id), { active: true });
		} 
	}
	
	if ($(".active:visible").is(".tab")) {
		if ($(".active:visible").children().last().children()[0]) {
			chrome.tabs.update(parseInt($(".active:visible").children().last().children()[0].id), { active: true });
		} else {
			if ($(".active:visible").next()[0]) {
				chrome.tabs.update(parseInt($(".active:visible").next()[0].id), { active: true });
			} else {
				if ($(".active:visible").parent().parent().next().is(".tab")) {
					chrome.tabs.update(parseInt($(".active:visible").parent().parent().next()[0].id), { active: true });
				} else {
					if ($(".active:visible").parents(".tab").eq(-2).next().is(".tab")) {
						chrome.tabs.update(parseInt($(".active:visible").parents(".tab").eq(-2).next()[0].id), { active: true });
					}
				}
			}
		}
	}
}

function ActivatePrevTab() {
	if ($(".active").is(".pin")) {
		if ($(".pin.active").prev()[0]) {
			chrome.tabs.update(parseInt($(".pin.active").prev()[0].id), { active: true });
		} 
	}
	
	if ($(".active:visible").is(".tab")) {
		if ($(".active:visible").prev().find(".tab").length > 0) {
			chrome.tabs.update(parseInt($(".active:visible").prev().find(".tab").last()[0].id), { active: true });
		} else {
			if ($(".active:visible").prev()[0]) {
				chrome.tabs.update(parseInt($(".active:visible").prev()[0].id), { active: true });
			} else {
				if ($(".active:visible").parent().is(".children")) {
					chrome.tabs.update(parseInt($(".active:visible").parent().parent()[0].id), { active: true });
				}
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