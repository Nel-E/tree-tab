// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********       GROUPS FUNCTIONS        ***************

function AppendAllGroups() {
	// var scroll = $("#group_list").scrollTop();
	for (var group in bggroups) {
		AppendGroupToList(bggroups[group].id, bggroups[group].name, bggroups[group].font);
	}
	RearrangeGroups(0);
}

function RearrangeGroups(stack) {
	$(".group_button").each(function() {
		if ($("#group_list").children().eq(bggroups[(this.id).substr(1)].index)[0] && $(this).index() > bggroups[(this.id).substr(1)].index) {
			$(this).insertBefore($("#group_list").children().eq(bggroups[(this.id).substr(1)].index)[0]);
		} else {
			if ($("#group_list").children().eq(bggroups[(this.id).substr(1)].index)[0] && $(this).index() < bggroups[(this.id).substr(1)].index) {
				$(this).insertAfter($("#group_list").children().eq(bggroups[(this.id).substr(1)].index)[0]);
			}
		}
		if ($(this).index() != bggroups[(this.id).substr(1)].index && stack < 10) {
			RearrangeGroups(stack+1);
		}
	});
}

function AppendGroupToList(groupId, group_name, font_color) {
	if ($("#"+groupId).length == 0 && $("#groups")[0]) {
		var grp = document.createElement("div"); grp.className = "group"; grp.id = groupId; $("#groups")[0].appendChild(grp);
	}
	if ($("#_"+groupId).length == 0) {
		var gbn = document.createElement("div"); gbn.className = "group_button"; gbn.id = "_"+groupId; $("#group_list")[0].appendChild(gbn);
		var gte = document.createElement("span"); gte.className = "group_title"; gte.id = "_gte"+groupId; gte.textContent = group_name; if (font_color != "") {gte.style.color = "#"+font_color;} gbn.appendChild(gte);
		var gtd = document.createElement("div"); gtd.className = "group_drag_box"; gtd.draggable = true; gtd.id = "-"+groupId; gbn.appendChild(gtd);
	}
	if (groupId != active_group) {
		$("#"+groupId).hide();
	}
	RefreshGUI();
	
	if (opt.switch_with_scroll) {
		BindTabsSwitchingToMouseWheel();
	}
}

function GenerateNewGroupID(){
	var newID = "g_"+GenerateRandomID();
	if ($("#"+newID)[0]) {
		GenerateNewGroupID();
	} else {
		return newID;
	}
}

function AddNewGroup(p) {
	var newId = GenerateNewGroupID();
	bggroups[newId] = { id: newId, index: 0, activetab: 0, name: (p.name ? p.name : caption_noname_group), font:  (p.font ? p.font : "")  };
	AppendGroupToList(newId, bggroups[newId].name, bggroups[newId].font);
	UpdateBgGroupsOrder();
	return newId;
	// chrome.runtime.sendMessage({command: "save_groups", groups: bggroups, windowId: CurrentWindowId});
}

// function AppendTabsToGroup(p) {
// }

// remove group, delete tabs if close_tabs is true
function GroupRemove(groupId, close_tabs) {
	if (close_tabs) {
		CloseTabs($("#"+active_group).find(".tab").map(function() {return parseInt(this.id);}).toArray());
	} else {
		$("#"+groupId).children().each(function() {
			$("#tab_list").append(this);
		});
	}
	delete bggroups[groupId];
	if ($("#_"+groupId).prev(".group_button")[0]) {
		SetActiveGroup(($("#_"+groupId).prev(".group_button")[0].id).substr(1), true, true);
	} else {
		if ($("#_"+groupId).next(".group_button")[0]) {
			SetActiveGroup(($("#_"+groupId).next(".group_button")[0].id).substr(1), true, true);
		} else {
			SetActiveGroup("tab_list", true, true);
		}
	}
	chrome.runtime.sendMessage({command: "save_groups", groups: bggroups, windowId: CurrentWindowId});
	$("#"+groupId).remove();
	$("#_"+groupId).remove();
	schedule_update_data++;
}

function UpdateBgGroupsOrder() {
	$(".group_button").each(function() {
		bggroups[(this.id).substr(1)].index = $(this).index();
	});
	chrome.runtime.sendMessage({command: "save_groups", groups: bggroups, windowId: CurrentWindowId});
}

function SetActiveGroup(groupId, switch_to_active_in_group, scroll_to_active) {
	if ($("#"+groupId)[0] == undefined) {
		return;
	}
	$(".group_button").removeClass("active_group");
	$("#_"+groupId).addClass("active_group");
	$(".tab, .group").hide();
	$("#"+groupId).show();
	$("#"+groupId).find(".tab").show();
	active_group = groupId;
	RefreshGUI();
	$("#group_edit").hide();
	if ($("#"+groupId).find(".active")[0]){
		chrome.tabs.update(parseInt($("#"+groupId).find(".active")[0].id), {active: true});
		ScrollToTab($("#"+groupId).find(".active")[0].id);
	}
	if (groupId == "tab_list" && $("#button_edit_group")[0]) {
		$("#button_remove_group, #button_edit_group").addClass("disabled");
	} else {
		$("#button_remove_group, #button_edit_group").removeClass("disabled");
	}
	
	
	// setTimeout(function() {
		// let grp = document.getElementById(groupId);
		// let scrll = grp.getElementsByTagName("scrollbar")[0];
		// scrll.setAttribute("increment", 100);

		// var gsb = document.createElement("scrollbar"); gsb.setAttribute("increment", 100); grp.appendChild(gsb);
	
	
	
	// }, 400);
	
	// let gr = $("#"+groupId+" scrollbar");
	// let scrll = $("#"+groupId+" scrollbar");
	// .getElementsByTagName(")[0];
	// let gr = document.getElementById("groups");
	// let scrll = gr.getElementsByTagName("scrollbar");
	// let scrll = document.getElementsByTagName("scrollbar");
	// let scrll = document.getElementById(groupId).childNodes;
	// console.log(scrll);
	
	chrome.runtime.sendMessage({command: "set_active_group", active_group: groupId, windowId: CurrentWindowId});
}

function SetActiveTabInActiveGroup(tabId) {
	if (bggroups[active_group] != undefined) {
		bggroups[active_group].activetab = parseInt(tabId);
		chrome.runtime.sendMessage({command: "save_groups", groups: bggroups, windowId: CurrentWindowId});
	}
}

// direction == true goes up, false goes down
// function ScrollGroupList(direction) {
	// if (direction) {
		// $("#group_list").scrollTop($("#group_list").scrollTop()-3);
	// }
	// if (!direction) {
		// $("#group_list").scrollTop($("#group_list").scrollTop()+3);
	// }
	// if (IOKeys.LMB) {
		// setTimeout(function() { ScrollGroupList(direction); },10);
	// }
// }

// function ScrollToGroup(groupId) {
	// if ($("#"+groupId).offset().top-$("#group_list").offset().top < 1) {
		// $("#group_list").scrollTop($("#group_list").scrollTop()+$("#"+groupId).offset().top-$("#group_list").offset().top-1);
	// } else {
		// if ($("#"+groupId).offset().top+$("#"+groupId).outerHeight()+1 > $("#group_list").offset().top+$("#group_list").innerHeight()) {
			// $("#group_list").scrollTop($("#group_list").scrollTop()+$("#"+groupId).offset().top-$("#group_list").offset().top-$("#group_list").innerHeight()+$("#"+groupId).outerHeight()-1);
		// }
	// }
// }

// Edit group popup
function ShowGroupEditWindow(GroupId) {
	$("#group_edit_name")[0].value = bggroups[GroupId].name;
	$("#group_edit").css({"display": "block", "top": $("#toolbar_groups").offset().top + 8, "left": 22});
	$("#group_edit_font").css({"background-color": bggroups[GroupId].font == "" ? "var(--button_icons, #808080)" : "#"+bggroups[GroupId].font});
}

// when pressed OK in group popup
function GroupEditConfirm() {
	$("#group_edit_name")[0].value = $("#group_edit_name")[0].value.replace(/[\f\n\r\v\t\<\>\+\-\(\)\.\,\;\:\~\/\|\?\@\!\"\'\£\$\%\&\^\#\=\*\[\]]?/gi, "");
	bggroups[active_group].name = $("#group_edit_name")[0].value;
	bggroups[active_group].font = RGBtoHex($("#group_edit_font").css("background-color"));
	$("#group_edit").hide(0);
	$(".group_title#_gte" +active_group).css({"color": "#"+bggroups[active_group].font});
	RefreshGUI();
	chrome.runtime.sendMessage({command: "save_groups", groups: bggroups, windowId: CurrentWindowId});
}

// "Move to group" popup
// function ShowMoveToGroupWindow(x, y) {
	// $(".move_to_group_menu_entry").remove();
	// bggroups.forEach(function(group) {
		// if (vt.ActiveGroup != group.g) {
			// var	li = document.createElement("li");
				// li.id = "move_to_"+group.g;
				// li.className = "menu_item move_to_group_menu_entry";
				// li.innerHTML = group.n;
			// $("#move_to_group_menu")[0].appendChild(li);
		// }
	// });
	// if (x >= $(window).width()-$("#tabs_menu").outerWidth()) {
		// x = $(window).width()-$("#tabs_menu").outerWidth();
	// }
	// if (y >= $(window).height()-$("#move_to_group_menu").outerHeight()-20) {
		// y = $(window).height()-$("#move_to_group_menu").outerHeight();
	// }
	// $("#move_to_group_menu").css({"display": "block", "top": y-24, "left": x-20});
// }