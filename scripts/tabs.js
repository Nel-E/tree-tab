// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********       TABS FUNCTIONS          ***************

async function UpdateData() {
	setTimeout(function() {
		if (schedule_update_data > 1) {schedule_update_data = 1;}
		if (schedule_update_data > 0) {
			$(".pin").each(function() {
				chrome.runtime.sendMessage({
					command: "update_tab",
					tabId: parseInt(this.id),
					tab: {
						p: "pin_list",
						i: $(this).index(),
						o: "n"
					}
				});
			});
			$(".tab").each(function() {
				// if ($(this).parent().parent(".tab")[0]) {
					// chrome.tabs.update(parseInt(this.id), { openerTabId: parseInt($(this).parent().parent(".tab")[0].id) }, function(tab) {
						// console.log(tab.id +" "+ tab.openerTabId);
					// });
				// }
				// console.log(($(this).parent(".group")[0] ? undefined : parseInt($(this).parents(".tab")[0].id)));
				// chrome.tabs.update(parseInt(this.id), { openerTabId: $(this).parent(".group")[0] ? undefined : parseInt($(this).parent().parent()[0].id) }, function(tab) {
				// chrome.tabs.update(parseInt(this.id), { openerTabId: ($(this).parent(".group")[0] ? undefined : parseInt($(this).parents(".tab")[0].id)) }, function(tab) {
					// console.log(tab.id +" "+ (tab.openerTabId ? "none" : tab.openerTabId));
					
				chrome.runtime.sendMessage({
					command: "update_tab",
					tabId: parseInt(this.id),
					tab: {
						p: $(this).parent(".group")[0] ? $(this).parent()[0].id : $(this).parent().parent(".tab")[0].id,
						// p: $(this).parent(".group")[0] ? $(this).parent()[0].id : $(this).parents(".tab")[0].id,
						i: $(this).index(),
						o: ($(this).is(".n") ? "n" : ($(this).is(".c") ? "c" : "o"))
					}
				});
					
				// });
			});
			
			
			
			schedule_update_data--;
		}
		UpdateData();
	},1000);
}

// async function RearrangeBrowserTabs() {
	// setTimeout(function() {
		// if (schedule_rearrange_tabs > 1) {
			// schedule_rearrange_tabs = 1;
		// }
		// if (schedule_rearrange_tabs > 0) {
			// chrome.tabs.query({currentWindow: true}, function(tabs) {
				// var tabIds = $(".pin, .tab").map(   function(){   return parseInt(this.id);   }   ).toArray();
				// for (var tabIndex = 0; tabIndex < tabIds.length; tabIndex++) {
					// if (tabIds[tabIndex] != tabs[tabIndex].id) {
						// chrome.tabs.move(tabIds[tabIndex], {index: tabIndex});
					// }
				// }
			// });			
			// schedule_rearrange_tabs--;
		// }
		// RearrangeBrowserTabs();
	// },5000);
// }


function RearrangeBrowserTabsCheck() {
	setTimeout(function() {
		RearrangeBrowserTabsCheck();
		if (schedule_rearrange_tabs > 1) {schedule_rearrange_tabs = 1;}
		if (schedule_rearrange_tabs > 0) {
			let tabIds = $(".pin, .tab").map(function(){return parseInt(this.id);}).toArray();
			RearrangeBrowserTabs(tabIds, tabIds.length-1);
			schedule_rearrange_tabs--;
		}
	},1000);}

async function RearrangeBrowserTabs(tabIds, tabIndex) {
	if (tabIndex > 0){
		chrome.tabs.get(tabIds[tabIndex], function(tab) {
			if (tab && tabIndex != tab.index) {
				chrome.tabs.move(tabIds[tabIndex], {index: tabIndex});
			}
			RearrangeBrowserTabs( tabIds, (tabIndex-1) );
		});
	}
}


// function RearrangeBrowserTabsCheck() {
	// setTimeout(function() {
		// RearrangeBrowserTabsCheck();
		// if (schedule_rearrange_tabs > 1) {schedule_rearrange_tabs = 1;}
		// if (schedule_rearrange_tabs > 0) {
			// chrome.tabs.query({currentWindow: true}, function(tabs) {
				// let atabIds = $(".pin, .tab").map(function(){return parseInt(this.id);}).toArray();
				// let btabIds = []; tabs.forEach(function(Tab){btabIds.push(Tab.id);});
				// RearrangeBrowserTabs(atabIds, btabIds, tabs.length-1);
				// schedule_rearrange_tabs--;
			// });
		// }
	// },3000);
// }

// function RearrangeBrowserTabs(tabIds, tabs, tabIndex) {
	// if (tabIndex > 0){
		// if (tabIds[tabIndex] != tabs[tabIndex]) {
			// chrome.tabs.move(tabIds[tabIndex], {index: tabIndex});
		// }
		// setTimeout(function(){ RearrangeBrowserTabs( tabIds, tabs, (tabIndex-1) ); }, 10);
	// }
// }





function RearrangeTreeTabs(tabs, bgtabs, first_run) {
	tabs.forEach(function(Tab) {
		if (bgtabs[Tab.id] && $("#"+Tab.id)[0] && $("#"+Tab.id).parent().children().eq(bgtabs[Tab.id].i)[0]) {
			if ($("#"+Tab.id).index() > bgtabs[Tab.id].i) {
				$("#"+Tab.id).insertBefore($("#"+Tab.id).parent().children().eq(bgtabs[Tab.id].i));
			} else {
				$("#"+Tab.id).insertAfter($("#"+Tab.id).parent().children().eq(bgtabs[Tab.id].i));
			}
		}
		if (bgtabs[Tab.id] && $("#"+Tab.id).index() != bgtabs[Tab.id].i && first_run) {
			RearrangeTreeTabs(tabs, bgtabs, false);
		}
	});
}

// param - tuple object with paramenters: param.tab - tab object, param.ParentId - Parent tabId, param.InsertAfterId - insert tab after this tabId (on same level),
// param.Append - if true Appends tab at the end of tree if false or prepends
function AppendTab(param) {
	if ($("#"+param.tab.id).length > 0) {
		GetFaviconAndTitle(param.tab.id);
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
			param.ParentId = active_group;
		} else {
			if($("#"+param.ParentId).is(".tab")) {
				if ($("#ch"+param.ParentId).children().length == 0) {
					$("#"+param.ParentId).addClass("o").removeClass("n").removeClass("c");
				}
				
				param.ParentId = "ch"+param.ParentId;
			}
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
 
	GetFaviconAndTitle(param.tab.id);
	RefreshMediaIcon(param.tab.id);

	if (param.tab.active) {
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
		$("#"+active_group).prepend($("#"+param.id));
		
		$("#"+param.id).removeClass("pin").removeClass("attention").addClass("tab");


		RefreshExpandStates();
	}
	chrome.tabs.update(parseInt(param.id), {pinned: param.pin});
	RefreshGUI();
}

function SetActiveTab(tabId) {
	if ($("#"+tabId).length > 0) {
		$(".active:visible").removeClass("active").removeClass("selected");
		$(".pin, .tab:visible").removeClass("active").removeClass("selected").removeClass("selected_frozen").removeClass("selected_temporarly").removeClass("tab_header_hover");
		$(".highlighted_drop_target").removeClass("highlighted_drop_target");
		$("#"+tabId).removeClass("attention").addClass("active")/* .addClass("selected") */;
		ScrollToTab(tabId);
		SetActiveTabInActiveGroup(tabId);
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
			(tabsIds).forEach(function(tabId) {
				chrome.tabs.move(tabId, {windowId: new_window.id, index:-1}, function(DetachedTab) {
					if (DetachedTab.id == tabsIds[tabsIds.length-1]) chrome.tabs.remove(new_window.tabs[0].id, null);
				});
			});
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
			if ($("#button_filter_type").is(".url") && Tab.url.toLowerCase().match(input.toLowerCase())) {
				$("#"+Tab.id).addClass("filtered").addClass("selected");
			}
			if ($("#button_filter_type").is(".title") && Tab.title.toLowerCase().match(input.toLowerCase())) {
				$("#"+Tab.id).addClass("filtered").addClass("selected");
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
	if ($(".pin.active:visible")[0]) {
		if ($(".pin.active").next(".pin")[0]) {
			chrome.tabs.update(parseInt($(".pin.active").next(".pin")[0].id), { active: true });
		} 
	}
	
	if ($(".tab.active:visible")[0]) {
		if ($(".active:visible").children().last().children(".tab")[0]) {
			chrome.tabs.update(parseInt($(".active:visible").children().last().children(".tab")[0].id), { active: true });
		} else {
			if ($(".active:visible").next(".tab")[0]) {
				chrome.tabs.update(parseInt($(".active:visible").next(".tab")[0].id), { active: true });
			} else {
				if ($(".active:visible").parent().parent().next(".tab")[0]) {
					chrome.tabs.update(parseInt($(".active:visible").parent().parent().next(".tab")[0].id), { active: true });
				} else {
					if ($(".active:visible").parents(".tab").eq(-2).next(".tab")[0]) {
						chrome.tabs.update(parseInt($(".active:visible").parents(".tab").eq(-2).next(".tab")[0].id), { active: true });
					}
				}
			}
		}
	}
}

function ActivatePrevTab() {
	if ($(".pin.active")[0]) {
		if ($(".pin.active").prev(".pin")[0]) {
			chrome.tabs.update(parseInt($(".pin.active").prev(".pin")[0].id), { active: true });
		} 
	}
	
	if ($(".tab.active:visible")[0]) {
		if ($(".active:visible").prev().find(".tab").length > 0) {
			chrome.tabs.update(parseInt($(".active:visible").prev().find(".tab").last()[0].id), { active: true });
		} else {
			if ($(".active:visible").prev(".tab")[0]) {
				chrome.tabs.update(parseInt($(".active:visible").prev(".tab")[0].id), { active: true });
			} else {
				if ($(".tab.active:visible").parent().is(".children") && $(".tab.active:visible").parent().parent(".tab")[0]) {
					chrome.tabs.update(parseInt($(".tab.active:visible").parent().parent(".tab")[0].id), { active: true });
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