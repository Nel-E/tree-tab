// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********             TOOLBAR           ***************

// RESTORE LAST USED SEARCH TYPE (URL OR TITLE) IN TOOLBAR SEARCH
function RestoreToolbarSearchFilter() {
	chrome.runtime.sendMessage({command: "get_search_filter", windowId: CurrentWindowId}, function(response) {
		let ButtonFilter = document.getElementById("button_filter_type");
		if (response == "url") {
			ButtonFilter.classList.add("url");
			ButtonFilter.classList.remove("title");
		} else {
			ButtonFilter.classList.add("title");
			ButtonFilter.classList.remove("url");
		}
	});
}	

// RESTORE LAST ACTIVE SHELF (SEARCH, TOOLS, GROUPS, SESSION OR FOLDER) IN TOOLBAR
function RestoreToolbarShelf() {
	chrome.runtime.sendMessage({command: "get_active_shelf", windowId: CurrentWindowId}, function(response) {
		let filterBox = document.getElementById("filter_box");
		filterBox.setAttribute("placeholder", caption_searchbox);
		filterBox.style.opacity = "1";
		
		document.querySelectorAll(".on").forEach(function(s){
			s.classList.remove("on");
		});
		document.querySelectorAll(".toolbar_shelf").forEach(function(s){
			s.classList.add("hidden");
		});

		if (response == "search" && document.getElementById("button_search") != null) {
			document.getElementById("toolbar_search").classList.remove("hidden");
			document.getElementById("button_search").classList.add("on");
		}

		if (response == "tools" && document.getElementById("button_tools") != null) {
			document.getElementById("toolbar_shelf_tools").classList.remove("hidden");
			document.getElementById("button_tools").classList.add("on");
		}

		if (response == "groups" && document.getElementById("button_groups") != null) {
			document.getElementById("toolbar_shelf_groups").classList.remove("hidden");
			document.getElementById("button_groups").classList.add("on");
		}

		if (response == "backup" && document.getElementById("button_backup") != null) {
			document.getElementById("toolbar_shelf_backup").classList.remove("hidden");
			document.getElementById("button_backup").classList.add("on");
		}

		if (response == "folders" && document.getElementById("button_folders") != null) {
			document.getElementById("toolbar_shelf_folders").classList.remove("hidden");
			document.getElementById("button_folders").classList.add("on");
		}
		
		if (browserId != "F") {
			chrome.storage.local.get(null, function(storage) {
				let bak1 = storage["windows_BAK1"] ? storage["windows_BAK1"] : [];
				let bak2 = storage["windows_BAK2"] ? storage["windows_BAK2"] : [];
				let bak3 = storage["windows_BAK3"] ? storage["windows_BAK3"] : [];

				if (bak1.length && document.getElementById("#button_load_bak1") != null) {
					document.getElementById("button_load_bak1").classList.remove("disabled");
				} else {
					document.getElementById("button_load_bak1").classList.add("disabled");
				}
				
				if (bak2.length && document.getElementById("#button_load_bak2") != null) {
					document.getElementById("button_load_bak2").classList.remove("disabled");
				} else {
					document.getElementById("button_load_bak2").classList.add("disabled");
				}

				if (bak3.length && document.getElementById("#button_load_bak3") != null) {
					document.getElementById("button_load_bak3").classList.remove("disabled");
				} else {
					document.getElementById("button_load_bak3").classList.add("disabled");
				}

			});
		}
		
		RefreshGUI();
	});
}

// FUNCTION TO TOGGLE SHELFS AND SAVE IT
function ShelfToggle(mousebutton, button, toolbarId, SendMessage) {
	if (mousebutton == 1) {
		if (button.classList.contains("on")) {
			document.querySelectorAll(".on").forEach(function(s){
				s.classList.remove("on");
			});
			document.querySelectorAll(".toolbar_shelf").forEach(function(s){
				s.classList.add("hidden");
			});
		} else {
			document.querySelectorAll(".toolbar_shelf:not(#"+toolbarId+")").forEach(function(s){
				s.classList.add("hidden");
			});
			document.getElementById(toolbarId).classList.remove("hidden");
			chrome.runtime.sendMessage({command: "set_active_shelf", active_shelf: SendMessage, windowId: CurrentWindowId});
			document.querySelectorAll(".on:not(#"+button.id+")").forEach(function(s){
				s.classList.remove("on");
			});
			button.classList.add("on");
		}
		RefreshGUI();
	}
}

function RemoveToolbar() {
	let toolbar = document.getElementById("toolbar");
	while(toolbar.hasChildNodes()) {
		toolbar.removeChild(toolbar.firstChild);
	}
}

function RecreateToolbar(NewToolbar) {
	let toolbar = document.getElementById("toolbar");
	
	for (var shelf in NewToolbar) {
		let NewShelf = document.createElement("div");
		NewShelf.id = shelf;
		NewShelf.classList = "toolbar_shelf";
		toolbar.appendChild(NewShelf);
		
		NewToolbar[shelf].forEach(function(button){
			let Newbutton = document.createElement("div");
			Newbutton.id = button;
			Newbutton.classList = "button";
			
			NewShelf.appendChild(Newbutton);
			
			let NewbuttonIMG = document.createElement("div");
			NewbuttonIMG.classList = "button_img";
			Newbutton.appendChild(NewbuttonIMG);
			
		});
		
	}
	
	let toolbar_main = document.getElementById("toolbar_main");
	let SearchShelf = document.getElementById("toolbar_search");

	if (toolbar_main != null && SearchShelf != null) {
		toolbar_main.classList.remove("toolbar_shelf");
		
		let SearchBox = document.createElement("div");
		SearchBox.id = "toolbar_search_input_box";
		SearchShelf.appendChild(SearchBox);
		
		let SearchInput = document.createElement("input");
		SearchInput.classList = "text_input";
		SearchInput.id = "filter_box";
		SearchInput.type = "text";
		SearchInput.placeholder = caption_searchbox;
		SearchBox.appendChild(SearchInput);
		
		let ClearX = document.createElement("div");
		ClearX.id = "button_filter_clear";
		ClearX.type = "reset";
		ClearX.style.opacity = "0";
		ClearX.style.position = "absolute";
		SearchBox.appendChild(ClearX);
		
		let SearchButtons = document.createElement("div");
		SearchButtons.id = "toolbar_search_buttons";
		SearchShelf.appendChild(SearchButtons);

		let FilterType = document.getElementById("button_filter_type");
		SearchButtons.appendChild(FilterType);
		
		let GoPrev = document.getElementById("filter_search_go_prev");
		SearchButtons.appendChild(GoPrev);
		
		let GoNext = document.getElementById("filter_search_go_next");
		SearchButtons.appendChild(GoNext);

		Loadi18n();
	}

}

function RecreateToolbarUnusedButtons(buttonsIds) {
	let unused_buttons = document.getElementById("toolbar_unused_buttons");

	buttonsIds.forEach(function(button){
		let Newbutton = document.createElement("div");
		Newbutton.id = button;
		Newbutton.classList = "button";
		unused_buttons.appendChild(Newbutton);
		let NewbuttonIMG = document.createElement("div");
		NewbuttonIMG.classList = "button_img";
		Newbutton.appendChild(NewbuttonIMG);
		
	});
}



function SaveToolbar() {
	let unused_buttons = [];
	let toolbar = {};
	
	let u = document.querySelectorAll("#toolbar_unused_buttons .button");
	u.forEach(function(b){
		unused_buttons.push(b.id);
	});

	let t = document.getElementById("toolbar");
	t.childNodes.forEach(function(s){
		toolbar[s.id] = [];
		let t = document.querySelectorAll("#"+s.id+" .button").forEach(function(b){
			toolbar[s.id].push(b.id);
		});
	});

	chrome.storage.local.set({toolbar: toolbar});
	chrome.storage.local.set({unused_buttons: unused_buttons});
	setTimeout(function() {
		chrome.runtime.sendMessage({command: "reload_toolbar", toolbar: toolbar, opt: opt});
	}, 50);
}


// ASSIGN MOUSE EVENTS FOR TOOLBAR BUTTONS, (Buttons AND ToolbarShelfToggle), PARAMETERS DECIDE IF BUTTONS ARE CLICKABLE
// IN OPTIONS PAGE - TOOLBAR BUTTONS SAMPLES, MUST NOT CALL FUNCTIONS ON CLICKS, BUT STILL SHELFS BUTTONS MUST TOGGLE AND MOREOVER ON CLICK AND NOT ON MOUSEDOWN THIS IS WHERE ToolbarShelfToggleClickType="Click" IS NECESSARY
function SetToolbarEvents(CleanPreviousBindings, Buttons, ToolbarShelfToggle, ToolbarShelfToggleClickType) {

	let ClearSearch = document.getElementById("button_filter_clear");
	let FilterBox = document.getElementById("filter_box");
	
	if (ClearSearch != null && FilterBox != null) {
		if (CleanPreviousBindings) {
			FilterBox.removeEventListener("oninput", function(){});
			ClearSearch.removeEventListener("onmousedown", function(){});
		}	
		if (Buttons) {
			// FILTER ON INPUT
			FilterBox.oninput = function(event) {
				FindTab(this.value);
			}
			// CLEAR FILTER BUTTON
			ClearSearch.onmousedown = function(event) {
				if (event.which == 1) {
					this.style.opacity = "0";
					this.style.opacity = "0";
					this.setAttribute("title", "");
					FindTab("");
				}
			}
		}
	}

	document.querySelectorAll(".button").forEach(function(s){
		
		if (CleanPreviousBindings) {
			s.removeEventListener("onmousedown", function(){});
			s.removeEventListener("onclick", function(){});
			s.removeEventListener("click", function(){});
		}	
			
		if (ToolbarShelfToggle) {
			if (s.id == "button_search") {
				s.addEventListener(ToolbarShelfToggleClickType, function(event) {
					if (event.which == 1) {
						ShelfToggle(event.which, this, "toolbar_search", "search");
					}
				});
			}
			if (s.id == "button_tools") {
				s.addEventListener(ToolbarShelfToggleClickType, function(event) {
					if (event.which == 1) {
						ShelfToggle(event.which, this, "toolbar_shelf_tools", "tools");
					}
				});
			}
			if (s.id == "button_groups") {
				s.addEventListener(ToolbarShelfToggleClickType, function(event) {
					if (event.which == 1) {
						ShelfToggle(event.which, this, "toolbar_shelf_groups", "groups");
					}
				});
			}
			if (s.id == "button_backup") {
				s.addEventListener(ToolbarShelfToggleClickType, function(event) {
					if (event.which == 1) {
						ShelfToggle(event.which, this, "toolbar_shelf_backup", "backup");
					}
				});
			}
			if (s.id == "button_folders") {
				s.addEventListener(ToolbarShelfToggleClickType, function(event) {
					if (event.which == 1) {
						ShelfToggle(event.which, this, "toolbar_shelf_folders", "folders");
					}
				});
			}
		}
		
		if (Buttons) {
			// NEW TAB
			if (s.id == "button_new") {
				s.onclick = function(event) {
					if (event.which == 1) {
						OpenNewTab(false, active_group);
					}
				}
				s.onmousedown = function(event) {
					// DUPLICATE TAB
					if (event.which == 2) {
						event.preventDefault();
						let activeTab = document.querySelector("#"+active_group+" .active_tab") != null ? document.querySelector("#"+active_group+" .active_tab") : document.querySelector(".pin.active_tab") != null ? document.querySelector(".pin.active_tab") : null;
						if (activeTab != null) {
							DuplicateTab(activeTab);
						}
					}
					// SCROLL TO TAB
					if (event.which == 3) {
						chrome.tabs.query({currentWindow: true, active: true}, function(activeTab) {
							if (activeTab[0].pinned && opt.pin_list_multi_row == false) {
								ScrollToTab(activeTab[0].id);
							}
							if (activeTab[0].pinned == false) {
								let Tab = document.getElementById(activeTab[0].id);
								let groupId = GetParentsByClass(Tab, "group")[0].id;
								SetActiveGroup(groupId, true, true);
							}
						});
					}
				}
			}
			// PIN TAB
			if (s.id == "button_pin") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						let Tabs = document.querySelectorAll(".pin.active_tab, .pin.selected_tab, #"+active_group+" .active_tab, #"+active_group+" .selected_tab");
						Tabs.forEach(function(s){
							chrome.tabs.update(parseInt(s.id), { pinned: Tabs[0].classList.contains("tab") });
						})
					}
				}				
			}
			// VERTICAL TABS OPTIONS
			if (s.id == "button_options") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						chrome.tabs.create({url: "options.html"});
					}
				}
			}

			// UNDO CLOSE
			if (s.id == "button_undo") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						chrome.sessions.getRecentlyClosed( null, function(sessions) {
							if (sessions.length > 0) {
								chrome.sessions.restore(null, function(restored) {});
							}
						});
					}
				}
			}

			// MOVE TAB TO NEW WINDOW (DETACH)
			if (s.id == "button_detach" || s.id == "button_move") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						if (document.querySelectorAll("#"+active_group+" .selected_folder").length > 0){
							let detach = GetSelectedFolders();
							Detach(detach.TabsIds, detach.Folders);
						} else {
							let tabsArr = [];
							document.querySelectorAll(".pin.selected_tab, .pin.active_tab, #"+active_group+" .selected_tab, #"+active_group+" .active_tab").forEach(function(s){
								tabsArr.push(parseInt(s.id));
								if (s.childNodes[1].childNodes.length > 0) {
									document.querySelectorAll("#"+s.childNodes[1].id+" .tab").forEach(function(t){
										tabsArr.push(parseInt(t.id));
									});
								}
							});
							Detach(tabsArr);
						}
					}
				}
			}

			// GO TO PREVIOUS SEARCH RESULT
			if (s.id == "filter_search_go_prev") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						let filtered = document.querySelectorAll("#"+active_group+" .tab.filtered");
						if (filtered.length > 0) {
							document.querySelectorAll(".highlighted_search").forEach(function(s){
								s.classList.remove("highlighted_search");
							});
							if (SearchIndex == 0) {
								SearchIndex = filtered.length-1;
							} else {
								SearchIndex--;
							}
							filtered[SearchIndex].classList.add("highlighted_search");
							ScrollToTab(filtered[SearchIndex].id);
						}
					}
				}
			}
	
			// GO TO NEXT SEARCH RESULT
			if (s.id == "filter_search_go_next") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						let filtered = document.querySelectorAll("#"+active_group+" .tab.filtered");
						if (filtered.length > 0) {
							document.querySelectorAll(".highlighted_search").forEach(function(s){
								s.classList.remove("highlighted_search");
							});
							if (SearchIndex == filtered.length-1) {
								SearchIndex = 0;
							} else {
								SearchIndex++;
							}
							filtered[SearchIndex].classList.add("highlighted_search");
							ScrollToTab(filtered[SearchIndex].id);
						}
					}
				}
			}

			// SHOW/HIDE GROUPS TOOLBAR
			if (s.id == "button_groups_toolbar_hide") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						GroupsToolbarToggle();
					}
				}
			}

			// SHOW GROUP MANAGER
			if (s.id == "button_manager_window") {
				s.onmousedown = function(event) {
					if (event.which == 1 && document.getElementById("manager_window").style.top == "-500px") {
						OpenManagerWindow();
					} else {
						HideRenameDialogs();
					}
				}
			}
			// NEW GROUP
			if (s.id == "button_new_group") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						AddNewGroup();
					}
				}
			}

			// REMOVE GROUP
			if (s.id == "button_remove_group") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						if (active_group != "tab_list") {
							GroupRemove(active_group, event.shiftKey);
						}
					}
				}
			}

			
			
			// EDIT GROUP
			if (s.id == "button_edit_group") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						if (active_group != "tab_list") {
							ShowGroupEditWindow(active_group);
						}
					}
				}
			}
			
			// EXPORT GROUP
			if (s.id == "button_export_group") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						ExportGroup(active_group, bggroups[active_group].name+".tt_group", false);
					}
				}
			}
			
			// IMPORT GROUP
			if (s.id == "button_import_group") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						let inputFile = ShowOpenFileDialog(".tt_group");
						inputFile.onchange = function(event) {
							ImportGroup(true, false);
						}
					}
				}
			}

			// NEW FOLDER
			if (s.id == "button_new_folder") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						AddNewFolder(undefined, undefined, undefined, undefined, undefined, undefined, true);
					}
				}
			}
			
			// RENAME FOLDER
			if (s.id == "button_edit_folder") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						if (document.querySelectorAll("#"+active_group+" .selected_folder").length > 0) {
							ShowRenameFolderDialog(document.querySelectorAll("#"+active_group+" .selected_folder")[0].id);
						}
					}
				}
			}
			// REMOVE FOLDERS
			if (s.id == "button_remove_folder") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						document.querySelectorAll("#"+active_group+" .selected_folder").forEach(function(s){
							RemoveFolder(s.id);
						});
					}
				}
			}
			// DISCARD TABS
			if (s.id == "button_unload" || s.id == "button_discard") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						if (document.querySelectorAll(".pin.selected_tab:not(.active_tab), #"+active_group+" .selected_tab:not(.active_tab)").length > 0) {
							DiscardTabs(
								Array.prototype.map.call(document.querySelectorAll(".pin:not(.active_tab), #"+active_group+" .selected_tab:not(.active_tab)"), function(s){
									return parseInt(s.id);
								})
							);
						} else {
							DiscardTabs(
								Array.prototype.map.call(document.querySelectorAll(".pin:not(.active_tab), .tab:not(.active_tab)"), function(s){
									return parseInt(s.id);
								})
							);
						}
					}
				}
			}
			// IMPORT BACKUP
			if (s.id == "button_import_bak") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						let inputFile = ShowOpenFileDialog(".tt_session");
						inputFile.onchange = function(event) {
							ImportSession(true, false, false);
						}
					}
				}
			}
			// EXPORT BACKUP
			if (s.id == "button_export_bak") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						let d = new Date();
						ExportSession((d.toLocaleString().replace("/", ".").replace("/", ".").replace(":", "꞉").replace(":", "꞉"))+".tt_session", true, false, false);
					}
				}
			}
			// MERGE BACKUP
			if (s.id == "button_import_merge_bak") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						let inputFile = ShowOpenFileDialog(".tt_session");
						inputFile.onchange = function(event) {
							ImportSession(false, false, true);
							// ImportMergeTabs();
						}						
					}
				}
			}

			// CHANGE FILTERING TYPE
			if (s.id == "button_filter_type") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						if (this.classList.contains("url")) {
							this.classList.remove("url");
							this.classList.add("title");
							chrome.runtime.sendMessage({command: "set_search_filter", search_filter: "title", windowId: CurrentWindowId});
						} else {
							this.classList.remove("title");
							this.classList.add("url");
							chrome.runtime.sendMessage({command: "set_search_filter", search_filter: "url", windowId: CurrentWindowId});
						}
						FindTab(document.getElementById("filter_box").value);
					}
				}
			}

			// EMERGENCY RELOAD
			if (s.id == "button_reboot") {
				s.onmousedown = function(event) {
					if (event.which == 1) {
						chrome.runtime.sendMessage({command: "reload"});
						chrome.runtime.sendMessage({command: "reload_sidebar"});
						location.reload();
					}
				}
			}
			
			// SORT TABS
			// if (s.id == "button_sort") {
				// s.onmousedown = function(event) {
					// if (event.which == 1) {
						// SortTabs();
					// }
				// }
			// }
			// REPEAT SEARCH
			// if (s.id == "repeat_search") {
				// s.onmousedown = function(event) {
					// if (event.which == 1) {
						// FindTab(document.getElementById("filter_box").value);
					// }
				// }
			// }

			
			if (browserId != "F") {
				// BOOKMARKS
				if (s.id == "button_bookmarks") {
					s.onmousedown = function(event) {
						if (event.which == 1) {
							chrome.tabs.create({url: "chrome://bookmarks/"});
						}
					}
				}
				
				// DOWNLOADS
				if (s.id == "button_downloads") {
					s.onmousedown = function(event) {
						if (event.which == 1) {
							chrome.tabs.create({url: "chrome://downloads/"});
						}
					}
				}
				
				// HISTORY
				if (s.id == "button_history") {
					s.onmousedown = function(event) {
						if (event.which == 1) {
							chrome.tabs.create({url: "chrome://history/"});
						}
					}
				}
				
				// EXTENSIONS
				if (s.id == "button_extensions") {
					s.onmousedown = function(event) {
						if (event.which == 1) {
							chrome.tabs.create({url: "chrome://extensions"});
						}
					}
				}
				
				// SETTINGS
				if (s.id == "button_settings") {
					s.onmousedown = function(event) {
						if (event.which == 1) {
							chrome.tabs.create({url: "chrome://settings/"});
						}
					}
				}
				
				// LOAD BACKUPS
				if (s.id == "button_load_bak1" || s.id == "button_load_bak2" || s.id == "button_load_bak3") {
					s.onmousedown = function(event) {
						if (event.which == 1 && this.classList.contains("disabled") == false) {
							let BakN = (this.id).substr(15);
							chrome.storage.local.get(null, function(storage) {
								if (Object.keys(storage["windows_BAK"+BakN]).length > 0) { chrome.storage.local.set({"windows": storage["windows_BAK"+BakN]}); }
								if (Object.keys(storage["tabs_BAK"+BakN]).length > 0) { chrome.storage.local.set({"tabs": storage["tabs_BAK"+BakN]}); alert("Loaded backup"); }
								chrome.runtime.sendMessage({command: "reload"}); chrome.runtime.sendMessage({command: "reload_sidebar"}); location.reload();
							});
						}
					}
				}
			}
		}

	});

}