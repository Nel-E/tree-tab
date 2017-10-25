// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********       GROUPS FUNCTIONS        ***************

// chrome.runtime.sendMessage({command: "save_groups"});

function AppendAllGroups() {
	// var scroll = $("#group_list").scrollTop();
	// $(".group").remove();
	// if (bggroups.length == 0) {
		// return;
	// }
	// bggroups.forEach(function(group) {

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
		// var grp = document.createElement("div"); grp.className = "group"; grp.id = groupId; grp.style.backgroundColor = "#"+background_color; $("#groups")[0].appendChild(grp);
		var grp = document.createElement("div"); grp.className = "group"; grp.id = groupId; $("#groups")[0].appendChild(grp);
	}

	if ($("#_"+groupId).length == 0) {
		var gbn = document.createElement("div"); gbn.className = "group_button"; gbn.id = "_"+groupId; $("#group_list")[0].appendChild(gbn);
		var gte = document.createElement("span"); gte.className = "group_title"; gte.id = "_gte"+groupId; gte.textContent = group_name; if (font_color != "") {gte.style.color = "#"+font_color;} gbn.appendChild(gte);
		var gtd = document.createElement("div"); gtd.className = "group_drag_box"; gtd.draggable = true; gtd.id = "-"+groupId; gbn.appendChild(gtd);

		// var gtn = document.createElement("span"); gtn.className = "group_tab_count"; gtn.id = "_gtn"+groupId; gtn.textContent = " (0)"; gtn.style.color = "#"+font_color; gbn.appendChild(gtn);

	// $(".group_button#_" +active_group+ ", .group#"+active_group).css({"background-color": "#"+bggroups[active_group].background});


	}
	// $(".group_title_container#_gtc" +active_group).css({"background-color": "#"+bggroups[active_group].background});
	
	// $("#"+groupId).attr("draggable", "true");
	// $("#"+groupId+"_button> .group_title_container > .group_title").css({"color": "#"+font_color});
	// $("#"+groupId+"_button> .group_title_container > .group_tab_count").css({"color": "#"+font_color});
	// $("#"+groupId+"_button").css({"background-color": "#"+background_color});

	if (opt.switch_with_scroll) {
		BindTabsSwitchingToMouseWheel();
	}
	if (groupId != active_group) {
		$("#"+groupId).hide();
	}

	RefreshGUI();
}

function GenerateNewGroupID(){
	var newID = "g_"+GenerateRandomID();
	if ($("#"+newID)[0]) {
		GenerateNewGroupID();
	} else {
		return newID;
	}
}
function AddNewGroup() {
	var newId = GenerateNewGroupID();
	bggroups[newId] = { id: newId, index: 0, activetab: 0, name: caption_noname_group, font: ""  };
	AppendGroupToList(newId, caption_noname_group, "");
	UpdateBgGroupsOrder();
	// chrome.runtime.sendMessage({command: "save_groups", groups: bggroups, windowId: CurrentWindowId});
}

// function AppendTabsToGroup(p) {
// }


// remove group, delete tabs if close_tabs is true
function GroupRemove(groupId, close_tabs) {
	
	$("#"+groupId).children().each(function() {
		$("#tab_list").append(this);
	});

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
	// bggroups.splice($("#"+groupId).index(),1);
	// if (vt.ActiveGroup == groupId) {
		// SetActiveGroup($("#"+groupId).prev()[0] ? $("#"+groupId).prev()[0].id : "ut", true, true);
	// }
	// $("#"+groupId).remove();
	// if (close_tabs) {
		// CloseTabs($(".tab."+groupId).map(function() {return parseInt(this.id);}).toArray());
	// } else {
		// AppendTabsToGroup({tabsIds: $(".tab."+groupId).map(function() {return parseInt(this.id);}).toArray(), groupId:"ut", insertAfter: true, moveTabs: true});
	// }
	// RefreshGUI();
	// bg.schedule_save++;
	// chrome.runtime.sendMessage({command: "group_removed", groupId: groupId, windowId: vt.windowId});
}

function UpdateBgGroupsOrder() {
	$(".group_button").each(function() {
		bggroups[(this.id).substr(1)].index = $(this).index();
	});
	// console.log(bggroups);
	chrome.runtime.sendMessage({command: "save_groups", groups: bggroups, windowId: CurrentWindowId});
	// var new_groups = [];
	// $(".group").each(function() {
		// for (var group_index = 0; group_index < bggroups.length; group_index++) {
			// if (bggroups[group_index].g == this.id) {
				// new_groups.push(bggroups[group_index]);
				// break;
			// }
		// }
	// });
	// bggroups.splice(0, bggroups.length);
	// bggroups = new_groups.slice();
	// bg.schedule_save++;
	// chrome.runtime.sendMessage({command: "groups_reappend", windowId: vt.windowId});
}

function SetActiveGroup(groupId, switch_to_active_in_group, scroll_to_active) {
	if ($("#"+groupId)[0] == undefined) {
		return;
	}
	
	
	$(".group_button").removeClass("active_group");
	$("#_"+groupId).addClass("active_group");
	$(".tab, .group").hide();
	// $(".tab").hide();
	// $(".group").css({"width": "0px"});
	// $(".group").css({"top": "-1px", "width": "0px", "height": "0px"});

	$("#"+groupId).show();
	$("#"+groupId).find(".tab").show();
	
	
	// $("#"+groupId).css({"width": ""});
	// $("#"+groupId).css({"top": "", "width": "", "height": ""});

	active_group = groupId;
	RefreshGUI();
	
	$("#group_edit").hide();
	
	if ($("#"+groupId).find(".active")[0]){
		chrome.tabs.update(parseInt($("#"+groupId).find(".active")[0].id), {active: true});
		ScrollToTab($("#"+groupId).find(".active")[0].id);
	}
	
	if (groupId == "tab_list" && $(".button#edit_group")[0]) {
		$(".button#edit_group").addClass("disabled");
	} else {
		$(".button#edit_group").removeClass("disabled");
	}
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




// bggroups[group].id, bggroups[group].name, bggroups[group].background, bggroups[group].font);


// Edit group popup
function ShowGroupEditWindow(GroupId) {
	$("#group_edit_name")[0].value = bggroups[GroupId].name;
	$("#group_edit").css({"display": "block", "top": $("#toolbar_groups").offset().top + 8, "left": 22});
	
	// $("#group_edit_font").css({"background-color": (ggroups[menuGroupId].font).match("var") != null ? ggroups[menuGroupId].font : "#"+bggroups[menuGroupId].font});
	$("#group_edit_font").css({"background-color": bggroups[GroupId].font == "" ? "var(--button_icons, #808080)" : "#"+bggroups[GroupId].font});
	// $("#group_edit_background").css({"background-color": bggroups[GroupId].background == "" ? "var(--tab_list_background, #fafafa)" : "#"+bggroups[menuGroupId].background});

	// $("#group_edit_background").css({"background-color": "#"+bggroups[menuGroupId].background});
}

// when pressed OK in group popup
function GroupEditConfirm() {
	$("#group_edit_name")[0].value = $("#group_edit_name")[0].value.replace(/[\f\n\r\v\t\<\>\+\-\(\)\.\,\;\:\~\/\|\?\@\!\"\'\£\$\%\&\^\#\=\*\[\]]?/gi, "");
	
	// $("#_"+active_group+"> .group_title_container > .group_title")[0].innerText = $("#group_edit_name")[0].value;
	
	
	
	// $("#_"+menuGroupId+"> .group_title_container > .group_title").css({"color": $("#group_edit_font").css("background-color")});
	// $("#_"+menuGroupId+"> .group_title_container > .group_tab_count").css({"color": $("#group_edit_font").css("background-color")});
	// $("#_"+menuGroupId).css({"background-color": $("#group_edit_background").css("background-color")});
	bggroups[active_group].name = $("#group_edit_name")[0].value;
	// bggroups[active_group].background = RGBtoHex($("#group_edit_background").css("background-color"));
	bggroups[active_group].font = RGBtoHex($("#group_edit_font").css("background-color"));
	
	
	
	
	$("#group_edit").hide(0);
	RefreshGUI();

	$(".group_title#_gte" +active_group+ ", .group_tab_count#_gtn"+active_group).css({"color": "#"+bggroups[active_group].font});

	// $(".group_button#_" +active_group+ ", .group#"+active_group).css({"background-color": "#"+bggroups[active_group].background});
	// $(".group_title_container#_gtc" +active_group).css({"background-color": "#"+bggroups[active_group].background});
	
	
	
	chrome.runtime.sendMessage({command: "save_groups", groups: bggroups, windowId: CurrentWindowId});
	// bg.schedule_save++;
	// chrome.runtime.sendMessage({command: "groups_reappend", windowId: windowId});
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