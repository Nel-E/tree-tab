// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********       GROUPS FUNCTIONS        ***************

// chrome.runtime.sendMessage({command: "groups_save"});

function AppendAllGroups() {
	// var scroll = $("#group_list").scrollTop();
	// $(".group").remove();
	// if (bg.groups.length == 0) {
		// return;
	// }
	// bg.groups.forEach(function(group) {
		// AppendGroupToList(group.g, group.n, group.c, group.f);
	// });
	// SetActiveGroup(vt.ActiveGroup, false, false);
	// $("#group_list").scrollTop(scroll);
	
	
		// groups["tab_list"] = { id: "g_23y23hriouh", index: 0, activetab: 0, name: "QPA", background: "#000000", font: "#FFFFFF"  };
	
	for (var group in bg.groups) {
		// if (group != "tab_list") {
		AppendGroupToList(bg.groups[group].id, bg.groups[group].name, bg.groups[group].background, bg.groups[group].font);
			// groups[group].activetab = reference_tabs[groups[group].activetab];
		// }
	}
	RearrangeGroups(0);
	
}


function RearrangeGroups(stack) {
	$(".group_button").each(function() {
		if ($("#group_list").children().eq(bg.groups[(this.id).substr(1)].index)[0] && $(this).index() > bg.groups[(this.id).substr(1)].index) {
			$(this).insertBefore($("#group_list").children().eq(bg.groups[(this.id).substr(1)].index)[0]);
		} else {
			if ($("#group_list").children().eq(bg.groups[(this.id).substr(1)].index)[0] && $(this).index() < bg.groups[(this.id).substr(1)].index) {
				$(this).insertAfter($("#group_list").children().eq(bg.groups[(this.id).substr(1)].index)[0]);
			}
		}
		if ($(this).index() != bg.groups[(this.id).substr(1)].index && stack < 10) {
			RearrangeGroups(stack+1);
		}
	});
}

function AppendGroupToList(groupId, group_name, background_color, font_color) {

	if ($("#"+groupId).length == 0) {
		var grp = document.createElement("div"); grp.className = "group"; grp.id = groupId; $("#groups")[0].appendChild(grp);
	}
	
	if ($("#_"+groupId).length == 0) {
		var gbn = document.createElement("div"); gbn.className = "group_button"; gbn.draggable = true; gbn.id = "_"+groupId; $("#group_list")[0].appendChild(gbn);
		var gtc = document.createElement("div"); gtc.className = "group_title_container"; gbn.appendChild(gtc);
		var gte = document.createElement("span"); gte.className = "group_title"; gte.textContent = group_name; gtc.appendChild(gte);
		var gtn = document.createElement("span"); gtn.className = "group_tab_count"; gtn.textContent = " (0)"; gtc.appendChild(gtn);
	}
	
	// $("#"+groupId).attr("draggable", "true");
	// $("#"+groupId+"_button> .group_title_container > .group_title").css({"color": "#"+font_color});
	// $("#"+groupId+"_button> .group_title_container > .group_tab_count").css({"color": "#"+font_color});
	// $("#"+groupId+"_button").css({"background-color": "#"+background_color});

	if (bg.opt.switch_with_scroll) {
		BindTabsSwitchingToMouseWheel();
	}

	// RefreshGUI();
}

function AddNewGroup(color) {
	var newId = GetRandomID();
	
	bg.groups[newId] = { id: newId, index: 0, activetab: 0, name: "untitled", background: "#000000", font: "#FFFFFF"  };

	
	AppendGroupToList(newId, "untitled", "#000000", "#FFFFFF");
	
	// bg.groups.push({g: "g_"+newId, n:bg.caption_group, c: color, f: "d9d9d9", i: 0});
	// AppendGroupToList("g_"+newId, bg.caption_group, color);
	// $("#group_list").scrollTop($("#group_list")[0].scrollHeight);
	// bg.schedule_save++;
	chrome.runtime.sendMessage({command: "groups_reappend", windowId: CurrentWindowId});
	chrome.runtime.sendMessage({command: "groups_save"});
	// return "g_"+newId;
}


function AppendTabsToGroup(p) {
}


// remove group, delete tabs if close_tabs is true
function GroupRemove(groupId, close_tabs) {
	
	$("#"+groupId).children().each(function() {
		$("#tab_list").append(this);
	});

	delete bg.groups[groupId];
	chrome.runtime.sendMessage({command: "groups_save"});

	$("#"+groupId).remove();
	$("#_"+groupId).remove();
	
	schedule_update_data++;
	// bg.groups.splice($("#"+groupId).index(),1);
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
		bg.groups[(this.id).substr(1)].index = $(this).index();
	});
	console.log(bg.groups);
	chrome.runtime.sendMessage({command: "groups_save"});
	// var new_groups = [];
	// $(".group").each(function() {
		// for (var group_index = 0; group_index < bg.groups.length; group_index++) {
			// if (bg.groups[group_index].g == this.id) {
				// new_groups.push(bg.groups[group_index]);
				// break;
			// }
		// }
	// });
	// bg.groups.splice(0, bg.groups.length);
	// bg.groups = new_groups.slice();
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
	
	if ($("#"+groupId).find(".active")[0]){
		chrome.tabs.update(parseInt($("#"+groupId).find(".active")[0].id), {active: true});
		ScrollToTab($("#"+groupId).find(".active")[0].id);
	}
}

function SetActiveTabInActiveGroup(tabId) {
	// if (vt.ActiveGroup == "ut") {
		// vt.utActiveTab = tabId;
	// }
	// if (vt.ActiveGroup.match("at|ut") == null && $("#"+tabId).length != 0 && $("#"+tabId).is(".tab")) {
		// bg.groups[$("#"+vt.ActiveGroup).index()].i = tabId;
		// bg.schedule_save++;
	// }
}

// direction == true goes up, false goes down
function ScrollGroupList(direction) {
	// if (direction) {
		// $("#group_list").scrollTop($("#group_list").scrollTop()-3);
	// }
	// if (!direction) {
		// $("#group_list").scrollTop($("#group_list").scrollTop()+3);
	// }
	// if (IOKeys.LMB) {
		// setTimeout(function() { ScrollGroupList(direction); },10);
	// }
}

function ScrollToGroup(groupId) {
	// if ($("#"+groupId).offset().top-$("#group_list").offset().top < 1) {
		// $("#group_list").scrollTop($("#group_list").scrollTop()+$("#"+groupId).offset().top-$("#group_list").offset().top-1);
	// } else {
		// if ($("#"+groupId).offset().top+$("#"+groupId).outerHeight()+1 > $("#group_list").offset().top+$("#group_list").innerHeight()) {
			// $("#group_list").scrollTop($("#group_list").scrollTop()+$("#"+groupId).offset().top-$("#group_list").offset().top-$("#group_list").innerHeight()+$("#"+groupId).outerHeight()-1);
		// }
	// }
}

// generate random group id
function GetRandomID(){
	var letters = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","K","L","M","N","O","P","R","S","T","Q","U","V","W","Y","Z","a","b","c","d","e","f","g","h","i","k","l","m","n","o","p","r","s","t","q","u","v","w","y","z"];
	var random = "";
	for (var i = 0; i < 2; i++ ) {
	   random += letters[Math.floor(Math.random() * letters.length)];
	}
	if ($("#"+random)[0]) {
		GetRandomID();
	} else {
		return "g_"+random;
	}
}

// generate random color
function GetRandomHexColor() {
	if (bg.opt.grayscale_groups) {
		var rgb = Math.floor(Math.random() * 190);
		rgb = rgb+","+rgb+","+rgb;
		return rgbtoHex(rgb);
	} else {
		var letters = "0123456789ABCDEF".split(""), color = "";
		for (var i = 0; i < 6; i++ ) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}
}

// color in format "rgb(r,g,b)" or simply "r,g,b" (can have spaces, but must contain "," between values)
function rgbtoHex(color){
	color = color.replace(/[rgb(]|\)|\s/g, "");
	color = color.split(",");
	return color.map(function(v){ return ("0"+Math.min(Math.max(parseInt(v), 0), 255).toString(16)).slice(-2); }).join("");
}



// bg.groups[group].id, bg.groups[group].name, bg.groups[group].background, bg.groups[group].font);


// Edit group popup
function ShowGroupEditWindow() {
	$(".menu").hide(0);
	// $("#group_edit_font").css({"background-color": "#"+bg.groups[menuGroupId].font});
	// $("#group_edit_background").css({"background-color": "#"+bg.groups[menuGroupId].background});
	$("#group_edit_name")[0].value = bg.groups[menuGroupId].name;
	$("#group_edit").css({"display": "block", "top": $("#_"+menuGroupId).offset().top, "left": 22});
}

// when pressed OK in group popup
function GroupEditConfirm() {
	$("#group_edit_name")[0].value = $("#group_edit_name")[0].value.replace(/[\f\n\r\v\t\<\>\+\-\(\)\.\,\;\:\~\/\|\?\@\!\"\'\£\$\%\&\^\#\=\*\[\]]?/gi, "");
	$("#_"+menuGroupId+"> .group_title_container > .group_title")[0].innerText = $("#group_edit_name")[0].value;
	// $("#_"+menuGroupId+"> .group_title_container > .group_title").css({"color": $("#group_edit_font").css("background-color")});
	// $("#_"+menuGroupId+"> .group_title_container > .group_tab_count").css({"color": $("#group_edit_font").css("background-color")});
	// $("#_"+menuGroupId).css({"background-color": $("#group_edit_background").css("background-color")});
	bg.groups[menuGroupId].name = $("#group_edit_name")[0].value;
	bg.groups[menuGroupId].background = rgbtoHex($("#group_edit_background").css("background-color"));
	bg.groups[menuGroupId].font = rgbtoHex($("#group_edit_font").css("background-color"));
	$("#group_edit").hide(0);
	RefreshGUI();
	
	chrome.runtime.sendMessage({command: "groups_save"});
	// bg.schedule_save++;
	// chrome.runtime.sendMessage({command: "groups_reappend", windowId: windowId});
}

// "Move to group" popup
function ShowMoveToGroupWindow(x, y) {
	// $(".move_to_group_menu_entry").remove();
	// bg.groups.forEach(function(group) {
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
}