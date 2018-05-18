// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********       GROUPS FUNCTIONS        ***************

function SaveGroups() {
	chrome.runtime.sendMessage({command: "save_groups", groups: bggroups, windowId: CurrentWindowId});
}

function AppendGroups(Groups) {
	if (opt.debug) {
		log("f: AppendGroups, Groups: "+JSON.stringify(Groups));
	}
	// let GroupList = document.getElementById("group_list");
	// let scroll = GroupList.scrollTop;

	AppendGroupToList("tab_list", caption_ungrouped_group, "", true);

	for (var group in Groups) {
		AppendGroupToList(Groups[group].id, Groups[group].name, Groups[group].font, true);
		if (document.querySelectorAll(".group").length == Object.keys(Groups).length) {
			RearrangeGroupsButtons();
			setTimeout(function() {
				RearrangeGroupsLists();
			}, 50);
		}
	}
}

function RearrangeGroupsButtons(first_loop) {
	if (opt.debug) {
		log("f: RearrangeGroupsButtons");
	}
	document.querySelectorAll(".group_button").forEach(function(s){
		let groupId = (s.id).substr(1);
		if (bggroups[groupId]) {
			if (s.parentNode.childNodes[bggroups[groupId].index] != undefined) {
				let Ind = Array.from(s.parentNode.children).indexOf(s);
				if (Ind > bggroups[groupId].index) {
					InsterBeforeNode(s, s.parentNode.childNodes[bggroups[groupId].index]);
				} else {
					InsterAfterNode(s, s.parentNode.childNodes[bggroups[groupId].index]);
				}
				let newInd = Array.from(s.parentNode.children).indexOf(s);
				if (newInd != bggroups[groupId].index && first_loop) {
					RearrangeGroupsButtons(false);
				}
			}
		}
	});
}

function RearrangeGroupsLists() {
	if (opt.debug) {
		log("f: RearrangeGroupsLists");
	}
	let activegroup = document.getElementById(active_group);
	let scroll = activegroup.scrollTop;
	let groups = document.getElementById("groups");
	document.querySelectorAll(".group_button").forEach(function(s){
		let group = document.getElementById((s.id).substr(1));
		if (group != null) {
			groups.appendChild(group);
		}
	});
	activegroup.scrollTop = scroll;
}

function AppendGroupToList(groupId, group_name, font_color, SetEvents) {
	if (opt.debug) {
		log("f: AppendGroupToList, groupId: "+groupId+", group_name: "+group_name+", font_color: "+font_color+", SetEvents: "+SetEvents);
	}
	if (document.getElementById(groupId) == null) {
		let grp = document.createElement("div"); grp.className = "group"; grp.id = groupId; grp.style.display = "none"; document.getElementById("groups").appendChild(grp);
		let gcf = document.createElement("div"); gcf.className = "children_folders"; gcf.id = "cf"+groupId; grp.appendChild(gcf);
		let gct = document.createElement("div"); gct.className = "children_tabs"; gct.id = "ct"+groupId; grp.appendChild(gct);
		if (SetEvents) {
			grp.onclick = function(event) {
				if (event.which == 1 && event.target == this && event.clientX < (this.childNodes[0].getBoundingClientRect().width + this.getBoundingClientRect().left)) {
					DeselectFolders();
					DeselectTabs();
				}
			}
			grp.onmousedown = function(event) {
				event.stopImmediatePropagation();
				if (event.which == 1 && event.target == this && event.clientX < (this.childNodes[0].getBoundingClientRect().width + this.getBoundingClientRect().left)) {
					HideMenus();
					return false;
				}
				if (event.which == 2) {
					event.preventDefault();
					ActionClickGroup(this, opt.midclick_group);
				}
				if (event.which == 3 && event.target.id == this.id) {
					// SHOW MENU
					ShowFGlobalMenu(event);
				}
				if (browserId == "V") {
					chrome.windows.getCurrent({populate: false}, function(window) {
						if (CurrentWindowId != window.id) {
							location.reload();
						}
					});
				}
			}
			grp.ondragover = function(event) {
				// PIN,TAB==>GROUP
				if (event.target.id == this.id && (DragNodeClass == "tab" || DragNodeClass == "folder")) {
					RemoveHighlight();
					this.classList.add("highlighted_drop_target");
				}
			}
			// DOUBLE CLICK ACTION
			grp.ondblclick = function(event) {
				if (event.target.id == this.id) {
					ActionClickGroup(this, opt.dbclick_group);
				}
			}

			if (opt.switch_with_scroll) {
				BindTabsSwitchingToMouseWheel(groupId);
			}

		}

	}

	if (document.getElementById("_"+groupId) == null) {
		let gbn = document.createElement("div"); gbn.className = "group_button"; if (SetEvents) {gbn.draggable = true;} gbn.id = "_"+groupId; document.getElementById("group_list").appendChild(gbn);
		let gte = document.createElement("span"); gte.className = "group_title"; gte.id = "_gte"+groupId; gte.textContent = group_name;
		if (font_color != "") {
			gte.style.color = "#"+font_color;
		} else {
			gte.style.color = window.getComputedStyle(document.getElementById("body"), null).getPropertyValue("--group_list_default_font_color");
		}
		gbn.appendChild(gte);
		var di = document.createElement("div"); di.className = "drag_indicator"; di.id = "di"+groupId; gbn.appendChild(di); // DROP TARGET INDICATOR
		
		if (SetEvents) {

			// ACTIVATE GROUP
			gbn.onclick = function(event) {
				SetActiveGroup(this.id.substr(1), true, true);
			}
			
			// SHOW GROUP MENU
			gbn.onmousedown = function(event) {
				// event.stopImmediatePropagation();
				if (event.which == 3) {
					ShowFGroupMenu(document.getElementById(this.id.substr(1)), event);
				}
			}

			// EDIT GROUP
			gbn.ondblclick = function(event) {
				if (event.which == 1 && this.id != "_tab_list") {
					ShowGroupEditWindow((this.id).substr(1));
				}
			}

			// DRAGGING GROUPS
			gbn.ondragstart = function(event) { // DRAG START
				event.stopPropagation();
				event.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
				event.dataTransfer.setData("text", "");
				event.dataTransfer.setData("SourceWindowId", CurrentWindowId);
				CleanUpDragClasses();
				EmptyDragAndDrop();

				DragNodeClass = "group";
				
				this.classList.add("dragged_group_button");
			}

			
			gbn.ondragover = function(event) {
				GroupButtonDragOver(this, event);
			}
			
			// scroll groups
			// $(document).on("mousedown", "#scroll_group_up, #scroll_group_down", function(event) {
				// IOKeys.LMB = true;
				// ScrollGroupList($(this).is("#scroll_group_up"));
			// });
			// $(document).on("mouseleave", "#scroll_group_up, #scroll_group_down", function(event) {
				// IOKeys.LMB = false;
			// });
		}
	}
	RefreshGUI();
}

function GenerateNewGroupID(){
	let newID = "g_"+GenerateRandomID();
	if (document.getElementById(newID) == null) {
		return newID;
	} else {
		GenerateNewGroupID();
	}
}

function AddNewGroup(Name, FontColor) {
	let newId = GenerateNewGroupID();
	bggroups[newId] = { id: newId, index: 0, active_tab: 0, prev_active_tab: 0, active_tab_ttid: "", name: (Name ? Name : caption_noname_group), font:  (FontColor ? FontColor : "")  };
	if (opt.debug) {
		log("f: AddNewGroup, groupId: "+newId+", Name: "+Name+", FontColor: "+FontColor);
	}
	AppendGroupToList(newId, bggroups[newId].name, bggroups[newId].font, true);
	UpdateBgGroupsOrder();
	return newId;
}

function FindGroupIdByName(name) {
	if (opt.debug) {
		log("f: FindGroupIdByName: "+name);
	}
	for (let key in bggroups) {
		if (!bggroups.hasOwnProperty(key)) {
			continue;
		}
		if (bggroups[key].name === name) {
			return key;
		}
	}
	return null;
}

function AppendTabToGroupOnRegexMatch(tabId, url) {
	if (opt.debug) {
		log("f: AppendTabToGroupOnRegexMatch, tabId: "+tabId+", url: "+url);
	}
	let Tab = document.getElementById(tabId);

	if (Tab != null && Tab.classList.contains("tab")) {
		let TabGroup = GetParentsByClass(Tab, "group");

		for (let i = 0; i < opt.tab_group_regexes.length; i++) {
			let regexPair = opt.tab_group_regexes[i];
			if (url.match(regexPair[0])) {
				let groupId = FindGroupIdByName(regexPair[1]);
				if (groupId === null) {
					groupId = AddNewGroup(regexPair[1]);
				}
				if (TabGroup.length > 0 && TabGroup[0].id !== groupId) {
					let newParent = document.getElementById("ct" + groupId);
					newParent.appendChild(Tab);
					SetActiveGroup(groupId, true, true);
					SetActiveTabInGroup(groupId, Tab.id);
					chrome.tabs.update(tabId, { active: true });
				}
				break;
			}
		}
	}

}

// remove group, delete tabs if close_tabs is true
function GroupRemove(groupId, close_tabs) {
	if (close_tabs) {
		let tabIds = Array.prototype.map.call(document.querySelectorAll("#"+groupId+" .tab"), function(s){
			return parseInt(s.id);
		});
		CloseTabs(tabIds);
		document.querySelectorAll("#"+groupId+" .folder").forEach(function(s){
			RemoveFolder(s.id);
		});
	} else {
		let TabListFolders = document.getElementById("cftab_list");
		let GroupFolders = document.getElementById("cf"+groupId);
		while (GroupFolders.firstChild) {
			TabListFolders.appendChild(GroupFolders.firstChild);
		}
		let TabListTabs = document.getElementById("cttab_list");
		let GroupTabs = document.getElementById("ct"+groupId);
		while (GroupTabs.firstChild) {
			TabListTabs.appendChild(GroupTabs.firstChild);
		}
		RefreshExpandStates();
		RefreshCounters();
	}
	if (groupId != "tab_list") {
		delete bggroups[groupId];
		if (groupId == active_group) {
			if (document.getElementById("_"+groupId).previousSibling) {
				SetActiveGroup((document.getElementById("_"+groupId).previousSibling.id).substr(1), true, true);
			} else {
				if (document.getElementById("_"+groupId).nextSibling) {
					SetActiveGroup((document.getElementById("_"+groupId).nextSibling.id).substr(1), true, true);
				} else {
					SetActiveGroup("tab_list", true, true);
				}
			}
		}
		let group = document.getElementById(groupId);
		group.parentNode.removeChild(group);	
		let groupButton = document.getElementById("_"+groupId);
		groupButton.parentNode.removeChild(groupButton);	
	}
	SaveGroups();
	schedule_update_data++;
}

function UpdateBgGroupsOrder() {
	document.querySelectorAll(".group_button").forEach(function(s){
		if (bggroups[(s.id).substr(1)]) {
			bggroups[(s.id).substr(1)].index = Array.from(s.parentNode.children).indexOf(s);
		}
	});
	SaveGroups();
}

function SetActiveGroup(groupId, switch_to_active_in_group, scroll_to_active) {
	if (opt.debug) {
		log("f: SetActiveGroup, groupId: "+groupId+", switch_to_active_in_group: "+switch_to_active_in_group+", scroll_to_active: "+scroll_to_active);
	}
	let group = document.getElementById(groupId);
	if (group != null) {
		active_group = groupId;
		document.querySelectorAll(".group_button").forEach(function(s){
			s.classList.remove("active_group");
		});
		document.getElementById("_"+groupId).classList.add("active_group");
		document.querySelectorAll(".group").forEach(function(s){
			s.style.display = "none";
		});
		group.style.display = "";
		RefreshGUI();
		HideRenameDialogs()
		let activeTab = document.querySelector("#"+groupId+" .active_tab");
		if (activeTab != null ){
			if (switch_to_active_in_group){
				chrome.tabs.update(parseInt(activeTab.id), {active: true});
			}
			if (scroll_to_active){
				ScrollToTab(activeTab.id);
			}
		}
		if (groupId == "tab_list") {
			document.querySelectorAll("#button_remove_group, #button_edit_group").forEach(function(s){
				s.classList.add("disabled");
			});
		} else {
			document.querySelectorAll("#button_remove_group, #button_edit_group").forEach(function(s){
				s.classList.remove("disabled");
			});
		}
		chrome.runtime.sendMessage({command: "set_active_group", active_group: groupId, windowId: CurrentWindowId});
		RefreshExpandStates();
		RefreshCounters();
		
		if (browserId == "F" && opt.hide_other_groups_tabs_firefox) {
			let HideTabIds = Array.prototype.map.call(document.querySelectorAll(".group:not([id='"+groupId+"']) .tab"), function(s){
				return parseInt(s.id);
			});
			let ShowTabIds = Array.prototype.map.call(document.querySelectorAll("#"+groupId+" .tab"), function(s){
				return parseInt(s.id);
			});

			browser.tabs.hide(HideTabIds);
			browser.tabs.show(ShowTabIds);
		}
		
		
	}
}

function SetActiveTabInGroup(groupId, tabId) {
	if (document.querySelector("#"+groupId+" [id='"+tabId+"']") != null && bggroups[groupId] != undefined) {
		if (groupId != active_group) {
			SetActiveGroup(groupId, false, true);
		}
		if (bggroups[groupId]) {
			bggroups[groupId].prev_active_tab = bggroups[groupId].active_tab;
			bggroups[groupId].active_tab = parseInt(tabId);
		}
		SaveGroups();
	}
}

// Edit group popup
function ShowGroupEditWindow(groupId) {
	HideRenameDialogs();
	if (bggroups[groupId]) {
		let name = document.getElementById("group_edit_name");
		name.value = bggroups[groupId].name;
		let groupEditDialog = document.getElementById("group_edit");
		groupEditDialog.setAttribute("groupId", groupId);
		groupEditDialog.style.display = "block";
		groupEditDialog.style.top = document.getElementById("toolbar").getBoundingClientRect().height + document.getElementById("pin_list").getBoundingClientRect().height + 8 + "px";
		// groupEditDialog.style.left = "22px";
		groupEditDialog.style.left = "";
		let DefaultGroupButtonFontColor = window.getComputedStyle(document.getElementById("body"), null).getPropertyValue("--group_list_default_font_color");
		let GroupEditFont = document.getElementById("group_edit_font");
		GroupEditFont.style.backgroundColor = (bggroups[groupId].font == "" ? DefaultGroupButtonFontColor : "#"+bggroups[groupId].font);
		setTimeout(function(){
			document.getElementById("group_edit_name").select();
		},5);
	}
}

// when pressed OK in group popup
function GroupEditConfirm() {
	let groupId = document.getElementById("group_edit").getAttribute("groupId");
	if (bggroups[groupId]) {
		let GroupEditName = document.getElementById("group_edit_name");
		// GroupEditName.value = GroupEditName.value.replace(/[\f\n\r\v\t\<\>\+\-\(\)\.\,\;\:\~\/\|\?\@\!\"\'\£\$\%\&\^\#\=\*\[\]]?/gi, "");
		bggroups[groupId].name = GroupEditName.value;
		let GroupEditFont = document.getElementById("group_edit_font");
		let DefaultGroupButtonFontColor = window.getComputedStyle(document.getElementById("body"), null).getPropertyValue("--group_list_default_font_color");
		let ThisGroupButtonFontColor = RGBtoHex(GroupEditFont.style.backgroundColor);
		if ("#"+ThisGroupButtonFontColor != DefaultGroupButtonFontColor) {
			bggroups[groupId].font = ThisGroupButtonFontColor;
			document.getElementById("_gte"+groupId).style.color = "#"+ThisGroupButtonFontColor;
		}
		HideRenameDialogs();
		RefreshGUI();
		SaveGroups();
	}
}

function RestoreStateOfGroupsToolbar() {
	chrome.runtime.sendMessage({command: "get_group_bar", windowId: CurrentWindowId}, function(response) {
		let toolbarGroups = document.getElementById("toolbar_groups");
		if (response == true) {
			toolbarGroups.style.display = "inline-block";
			toolbarGroups.style.width = "19px";
			toolbarGroups.style.borderRight = "1px solid var(--group_list_borders)";
			toolbarGroups.classList.remove("hidden");
		} else {
			toolbarGroups.style.display = "none";
			toolbarGroups.style.width = "0px";
			toolbarGroups.style.borderRight = "none";
			toolbarGroups.classList.add("hidden");
		}
	});
}

function GroupsToolbarToggle() {
	let toolbarGroups = document.getElementById("toolbar_groups");
	toolbarGroups.classList.toggle("hidden");
	if (toolbarGroups.classList.contains("hidden")) {
		toolbarGroups.style.display = "none";
		toolbarGroups.style.width = "0px";
		toolbarGroups.style.borderRight = "none";
		chrome.runtime.sendMessage({command: "set_group_bar", group_bar: false, windowId: CurrentWindowId});
	} else {
		toolbarGroups.style.display = "inline-block";
		toolbarGroups.style.width = "19px";
		toolbarGroups.style.borderRight = "1px solid var(--group_list_borders)";
		chrome.runtime.sendMessage({command: "set_group_bar", group_bar: true, windowId: CurrentWindowId});
	}
	RefreshGUI();
}

function ActionClickGroup(Node, bgOption) {
	if (bgOption == "new_tab") {
		if (Node.id == "pin_list") {
			OpenNewTab(true, undefined);
		}
		if (Node.classList.contains("tab") || Node.classList.contains("folder") || Node.classList.contains("group")) {
			OpenNewTab(false, Node.id);
		}
	}
	if (bgOption == "activate_previous_active") {
		chrome.tabs.update(parseInt(bggroups[active_group].prev_active_tab), {active: true});
	}
	if (bgOption == "undo_close_tab") {
		chrome.sessions.getRecentlyClosed( null, function(sessions) {
			if (sessions.length > 0) {
				chrome.sessions.restore(null, function(restored) {});
			}
		});
	}
}




// SET ACTIVE TAB FOR EACH GROUP
function SetActiveTabInEachGroup() {
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
		SetActiveTab(tabs[0].id);
		chrome.runtime.sendMessage({command: "get_active_group", windowId: CurrentWindowId}, function(response) {
			if (response) {
				SetActiveGroup(response, false, true);
				for (var group in bggroups) {
					let ActiveInGroup = document.querySelector("#"+group+" [id='"+bggroups[group].active_tab+"']");
					if (ActiveInGroup != null) {
						ActiveInGroup.classList.add("active_tab");
					}
				}
				if (tabs[0].pinned) {
					let ActiveTabinActiveGroup = document.querySelectorAll("#"+active_group+" .active_tab");
					if (ActiveTabinActiveGroup != null) {
						ActiveTabinActiveGroup.forEach(function(s){
							s.classList.remove("active_tab");
						});
					}
				}
			} else {
				SetActiveGroup("tab_list", false, true);
			}
		});
	});
}

function GroupButtonDragOver(Node, event) {
	if (Node.classList.contains("inside") == false && (DragNodeClass == "tab" || DragNodeClass == "folder")) {
		RemoveHighlight();
		Node.classList.remove("before");
		Node.classList.remove("after");
		Node.classList.add("inside");
		Node.classList.add("highlighted_drop_target");
	}
	
	if (Node.classList.contains("before") == false && event.layerY < Node.clientHeight/2 && DragNodeClass == "group") {
		RemoveHighlight();
		Node.classList.add("before");
		Node.classList.remove("after");
		Node.classList.remove("inside");
		Node.classList.add("highlighted_drop_target");
	}
	
	if (Node.classList.contains("after") == false && event.layerY > Node.clientHeight/2 && DragNodeClass == "group") {
		RemoveHighlight();
		Node.classList.remove("before");
		Node.classList.add("after");
		Node.classList.remove("inside");
		Node.classList.add("highlighted_drop_target");
	}
}



// function AppendTabsToGroup(p) {
// }

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

