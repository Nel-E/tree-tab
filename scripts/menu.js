// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********			 MENU		 ***************

function HideMenus() {
	document.querySelectorAll(".separator, .menu_item").forEach(function(s){s.style.display = "none";});
	document.querySelectorAll(".menu").forEach(function(s){
		s.style.top = "-1000px";
		s.style.left = "-1000px";
		s.style.display = "none";
	});
}

function ShowMenu(MenuNode, event) {
	MenuNode.style.display = "block";
	let x = event.pageX >= (document.body.clientWidth - MenuNode.getBoundingClientRect().width - 5) ? (document.body.clientWidth - MenuNode.getBoundingClientRect().width - 5) : (event.pageX - 5);
	let y = event.pageY >= (document.body.clientHeight - MenuNode.getBoundingClientRect().height - 16) ? (document.body.clientHeight - MenuNode.getBoundingClientRect().height - 16) : (event.pageY - 16);
	MenuNode.style.top = y + "px";
	MenuNode.style.left = x + "px";
}

function ShowTabMenu(TabNode, event) {
	HideMenus();
	menuItemNode = TabNode;
 	// $(".menu").hide(0);

	// MUTE TABS
	// if (TabNode.classList.contains("audible") && !TabNode.classList.contains("muted")) {
		// document.querySelector("#menu_mute_tab").style.display = "";
	// }
	if (TabNode.classList.contains("muted")) {
		document.querySelector("#menu_unmute_tab").style.display = "";
	} else {
		document.querySelector("#menu_mute_tab").style.display = "";
	}
	if (!TabNode.classList.contains("discarded")) {
		document.querySelector("#menu_unload").style.display = "";
	}
	
	if (TabNode.classList.contains("pin")) {
		if (opt.allow_pin_close) {
			document.getElementById("menu_close").style.display = "";
		}

		document.querySelectorAll("#menu_new_pin, #separator_unpt, #menu_unpin_tab, #separator_dupt, #menu_duplicate_tab, #separator_undclo, #menu_undo_close_tab, #separator_deta, #menu_detach_tab, #menu_reload_tab, #separator_clo, #menu_close_other, #separator_mutot, #menu_mute_other, #menu_unmute_other, #separator_tts, #menu_manager_window, #menu_treetabs_settings").forEach(function(s){
			s.style.display = "";
		});
	}
	
	if (TabNode.classList.contains("tab")) {

		document.querySelectorAll("#menu_bookmark_tree, #menu_new_tab, #separator_pit, #menu_pin_tab, #separator_newf, #menu_new_folder, #separator_dupt, #menu_duplicate_tab, #separator_undclo, #menu_undo_close_tab, #separator_expaa, #menu_expand_all, #menu_collapse_all, #separator_deta, #menu_detach_tab, #menu_reload_tab, #separator_clo, #menu_close, #menu_close_other, #separator_mut, #separator_mutot, #menu_mute_other, #menu_unmute_other, #separator_tts, #menu_manager_window, #menu_treetabs_settings").forEach(function(s){
			s.style.display = "";
		});

		if (TabNode.classList.contains("o")) {
			document.querySelector("#separator_collt").style.display = "";
			document.querySelector("#menu_collapse_tree").style.display = "";
		}
		if (TabNode.classList.contains("c")) {
			document.querySelector("#separator_expat").style.display = "";
			document.querySelector("#menu_expand_tree").style.display = "";
		}
		if (TabNode.classList.contains("c") || TabNode.classList.contains("o")) {
			document.querySelector("#menu_close_tree").style.display = "";
			document.querySelector("#separator_bkt").style.display = "";
			// document.querySelector("#menu_bookmark_tree").style.display = "";
			document.querySelector("#separator_mutt").style.display = "";
			document.querySelector("#menu_mute_tree").style.display = "";
			document.querySelector("#menu_unmute_tree").style.display = "";
		}
	}
	ShowMenu(document.getElementById("main_menu"), event);
}

function ShowFolderMenu(FolderNode, event) {
	HideMenus();
	menuItemNode = FolderNode;
	
	document.querySelectorAll("#menu_mute_tab, #menu_unmute_tab, #separator_unlo, #menu_unload, #menu_new_tab, #menu_new_folder, #separator_renf, #menu_rename_folder, #menu_delete_folder, #separator_bkt, #menu_bookmark_tree, #separator_expaa, #menu_expand_all, #menu_collapse_all, #menu_new_group, #separator_tts, #menu_manager_window, #menu_treetabs_settings").forEach(function(s){
		s.style.display = "";
	});

	if (FolderNode.classList.contains("o")) {
		document.querySelector("#folders_menu, #menu_collapse_tree").style.display = "";
	}
	if (FolderNode.classList.contains("c")) {
		document.querySelector("#folders_menu, #menu_expand_tree").style.display = "";
	}
	
	ShowMenu(document.getElementById("main_menu"), event);
}

function ShowFGlobalMenu(event) {
	menuItemNode = event.target;
	HideMenus();


	document.querySelectorAll("#menu_new_pin, #menu_new_tab, #menu_new_folder, #separator_undclo, #menu_undo_close_tab, #separator_expaa, #menu_expand_all, #menu_collapse_all, #separator_newg, #menu_new_group, #separator_gbk, #menu_bookmark_group, #separator_tts, #menu_manager_window, #menu_treetabs_settings").forEach(function(s){
		s.style.display = "";
	});
	ShowMenu(document.getElementById("main_menu"), event);
}

function ShowFGroupMenu(GroupNode, event) {
	HideMenus();
	menuItemNode = GroupNode;
	
	document.querySelectorAll("#menu_new_group, #menu_rename_group, #menu_delete_group, #menu_delete_group_tabs_close, #separator_gunlo, #menu_groups_unload, #separator_gbk, #separator_tts, #menu_bookmark_group, #separator_tts, #menu_groups_hibernate, #menu_manager_window, #menu_treetabs_settings").forEach(function(s){
		s.style.display = "";
	});
	if (menuItemNode.id == "tab_list") {
		document.querySelectorAll("#menu_groups_hibernate, #menu_rename_group, #menu_delete_group, #menu_delete_group_tabs_close").forEach(function(s){
			s.style.display = "none";
		});
	}
	ShowMenu(document.getElementById("main_menu"), event);
}

function SetMenu() {
	document.querySelectorAll(".menu_item").forEach(function(m){
		if (m.id == "menu_new_pin") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					if (menuItemNode.classList.contains("pin")) {
						OpenNewTab(true, menuItemNode.id);
					} else {
						OpenNewTab(true, undefined);
					}
					HideMenus();
				}
			}				
		}
		if (m.id == "menu_new_tab") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					if (menuItemNode.classList.contains("folder")) {
						OpenNewTab(false, menuItemNode.id);
					} else {
						if (menuItemNode.classList.contains("pin")) {
							OpenNewTab(true, menuItemNode.id);
						} else {
							if (menuItemNode.classList.contains("tab")) {
								OpenNewTab(false, menuItemNode.id);
							} else {
								OpenNewTab(false, active_group);
							}
						}
					}
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_unpin_tab" || m.id == "menu_pin_tab") {
			m.onmousedown = function(event) {
				event.stopPropagation();
				if (event.which == 1) {
					if (menuItemNode.classList.contains("selected_tab")) {
						document.querySelectorAll(".pin.selected_tab, #"+active_group+" .selected_tab").forEach(function(s){
							chrome.tabs.update(parseInt(s.id), { pinned: (menuItemNode.classList.contains("tab")) });
						});
					} else {
						chrome.tabs.update(parseInt(menuItemNode.id), { pinned: (menuItemNode.classList.contains("tab")) });
					}
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_duplicate_tab") {
			m.onmousedown = function(event) {
				event.stopPropagation();
				if (event.which == 1) {
					if (menuItemNode.classList.contains("selected_tab")) {
						document.querySelectorAll(".pin.selected_tab, #"+active_group+" .selected_tab").forEach(function(s){
							DuplicateTab(s);
						});
					} else {
						DuplicateTab(menuItemNode);
					}
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_detach_tab") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();

					if (menuItemNode.classList.contains("selected_tab")) {
						let tabsArr = [];
						document.querySelectorAll(".pin.selected_tab, #"+active_group+" .selected_tab").forEach(function(s){
							tabsArr.push(parseInt(s.id));
							if (s.childNodes[1].childNodes.length > 0) {
								document.querySelectorAll("#"+s.childNodes[1].id+" .tab").forEach(function(t){
									tabsArr.push(parseInt(t.id));
								});
							}
						});
						Detach(tabsArr);
					} else {
						Detach([parseInt(menuItemNode.id)]);
					}
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_reload_tab") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					if (menuItemNode.classList.contains("selected_tab")) {
						document.querySelectorAll(".pin.selected_tab, #"+active_group+" .selected_tab").forEach(function(s){
							chrome.tabs.reload(parseInt(s.id));
						});
					} else {
						chrome.tabs.reload(parseInt(menuItemNode.id));
					}
					HideMenus();
				}
			}				
		}
		
		if (m.id == "menu_unload") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					if (menuItemNode.classList.contains("pin") || menuItemNode.classList.contains("tab")) {
						if (menuItemNode.classList.contains("selected_tab")) {
							let tabsArr = [];
							document.querySelectorAll(".pin.selected_tab, #"+active_group+" .selected_tab").forEach(function(s){
								tabsArr.push(parseInt(s.id));
								if (s.childNodes[1].childNodes.length > 0) {
									document.querySelectorAll("#"+s.childNodes[1].id+" .tab").forEach(function(t){
										tabsArr.push(parseInt(t.id));
									});
								}
							});
							DiscardTabs(tabsArr);
						} else {
							DiscardTabs([parseInt(menuItemNode.id)]);
						}
					}
					if (menuItemNode.classList.contains("folder")) {
						let tabsArr = [];
						document.querySelectorAll("#"+menuItemNode.id+" .tab").forEach(function(s){
							tabsArr.push(parseInt(s.id));
						});
						DiscardTabs(tabsArr);
					}
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_close") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					if (menuItemNode.classList.contains("selected_tab")) {
						let tabsArr = [];
						document.querySelectorAll(".pin.selected_tab, #"+active_group+" .selected_tab").forEach(function(s){
							tabsArr.push(parseInt(s.id));
							if (s.childNodes[1].childNodes.length > 0) {
								document.querySelectorAll("#"+s.childNodes[1].id+" .tab").forEach(function(t){
									tabsArr.push(parseInt(t.id));
								});
							}
						});
						CloseTabs(tabsArr);
					} else {
						CloseTabs([parseInt(menuItemNode.id)]);
					}
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_mute_tab") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					if (menuItemNode.classList.contains("pin") || menuItemNode.classList.contains("tab")) {
						if (menuItemNode.classList.contains("selected_tab")) {
							document.querySelectorAll(".pin.selected_tab, #"+active_group+" .selected_tab").forEach(function(s){
								chrome.tabs.update(parseInt(s.id), { muted: true });
							});
						} else {
							chrome.tabs.update(parseInt(menuItemNode.id), { muted: true });
						}
					}
					if (menuItemNode.classList.contains("folder")) {
						document.querySelectorAll("#"+menuItemNode.id+" .tab").forEach(function(s){
							chrome.tabs.update(parseInt(s.id), { muted: true });
						});
					}
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_mute_tree") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					document.querySelectorAll("[id='"+menuItemNode.id+"'], [id='"+menuItemNode.id+"'] .tab").forEach(function(s){
						chrome.tabs.update(parseInt(s.id), { muted: true });
					});
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_unmute_tab") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					if (menuItemNode.classList.contains("pin") || menuItemNode.classList.contains("tab")) {
						if (menuItemNode.classList.contains("selected_tab")) {
							document.querySelectorAll(".pin.selected_tab, #"+active_group+" .selected_tab").forEach(function(s){
								chrome.tabs.update(parseInt(s.id), { muted: false });
							});
						} else {
							chrome.tabs.update(parseInt(menuItemNode.id), { muted: false });
						}
					}
					if (menuItemNode.classList.contains("folder")) {
						document.querySelectorAll("#"+menuItemNode.id+" .tab").forEach(function(s){
							chrome.tabs.update(parseInt(s.id), { muted: false });
						});
					}
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_unmute_tree") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					document.querySelectorAll("[id='"+menuItemNode.id+"'], [id='"+menuItemNode.id+"'] .tab").forEach(function(s){
						chrome.tabs.update(parseInt(s.id), { muted: false });
					});
					HideMenus();
				}
			}				
		}

		
		if (m.id == "menu_mute_other") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					if (menuItemNode.classList.contains("selected_tab")) {
						document.querySelectorAll(".pin:not(.selected_tab), #"+active_group+" .tab:not(.selected_tab)").forEach(function(s){
							chrome.tabs.update(parseInt(s.id), { muted: true });
						});
					} else {
						document.querySelectorAll(".pin:not([id='"+menuItemNode.id+"']), #"+active_group+" .tab:not([id='"+menuItemNode.id+"'])").forEach(function(s){
							chrome.tabs.update(parseInt(s.id), { muted: true });
						});
					}

					HideMenus();
				}
			}				
		}

		
		if (m.id == "menu_unmute_other") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					if (menuItemNode.classList.contains("selected_tab")) {
						document.querySelectorAll(".pin:not(.selected_tab), #"+active_group+" .tab:not(.selected_tab)").forEach(function(s){
							chrome.tabs.update(parseInt(s.id), { muted: false });
						});
					} else {
						document.querySelectorAll(".pin:not([id='"+menuItemNode.id+"']), #"+active_group+" .tab:not([id='"+menuItemNode.id+"'])").forEach(function(s){
							chrome.tabs.update(parseInt(s.id), { muted: false });
						});
					}
					HideMenus();
				}
			}				
		}



		
		if (m.id == "menu_undo_close_tab") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					chrome.sessions.getRecentlyClosed(null, function(sessions) {
						if (sessions.length > 0) {
							chrome.sessions.restore(null, function() {});
						}
					});
					HideMenus();
				}
			}				
		}

		
		if (m.id == "menu_new_folder") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					if (menuItemNode.classList.contains("folder")) {
						AddNewFolder(undefined, menuItemNode.id, undefined, undefined, undefined, undefined, true);
					} else {
						if (menuItemNode.classList.contains("tab")) {
							let folders = GetParentsByClass(menuItemNode, "folder");
							if (folders.length > 0) {
								AddNewFolder(undefined, folders[0].id, undefined, undefined, undefined, undefined, true);
							} else {
								AddNewFolder(undefined, undefined, undefined, undefined, undefined, undefined, true);
							}
						} else {
							AddNewFolder(undefined, undefined, undefined, undefined, undefined, undefined, true);
						}
					}
					HideMenus();
				}
			}				
		}


		if (m.id == "menu_expand_tree") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					document.querySelectorAll("[id='"+menuItemNode.id+"'], [id='"+menuItemNode.id+"'] .folder.c, [id='"+menuItemNode.id+"'] .tab.c").forEach(function(s){
						s.classList.add("o");
						s.classList.remove("c");
					});
						
					schedule_update_data++;
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_collapse_tree") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					document.querySelectorAll("[id='"+menuItemNode.id+"'], [id='"+menuItemNode.id+"'] .folder.c, [id='"+menuItemNode.id+"'] .tab.c").forEach(function(s){
						s.classList.add("c");
						s.classList.remove("o");
					});
					schedule_update_data++;
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_expand_all") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					document.querySelectorAll("#"+active_group+" .folder.c, #"+active_group+" .tab.c").forEach(function(s){
						s.classList.add("o");
						s.classList.remove("c");
					});
					schedule_update_data++;
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_collapse_all") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					document.querySelectorAll("#"+active_group+" .folder.o, #"+active_group+" .tab.o").forEach(function(s){
						s.classList.add("c");
						s.classList.remove("o");
					});
					schedule_update_data++;
					HideMenus();
				}
			}				
		}



		if (m.id == "menu_close_tree") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();

					let tabsArr = [];
					document.querySelectorAll("[id='"+menuItemNode.id+"'] .tab, [id='"+menuItemNode.id+"']").forEach(function(s){
						tabsArr.push(parseInt(s.id));
						if (s.childNodes[1].childNodes.length > 0) {
							document.querySelectorAll("#"+s.childNodes[1].id+" .tab").forEach(function(t){
								tabsArr.push(parseInt(t.id));
							});
						}
					});
					CloseTabs(tabsArr);
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_rename_folder") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					ShowRenameFolderDialog(menuItemNode.id);
					HideMenus();
				}
			}				
		}


		if (m.id == "menu_delete_folder") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					if (menuItemNode.classList.contains("selected_folder")) {
						document.querySelectorAll("#"+menuItemNode.id+"  .selected_folder, #"+menuItemNode.id).forEach(function(s){
							RemoveFolder(s.id);
						});
					} else {
						RemoveFolder(menuItemNode.id);
					}
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_close_other") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					let tabsArr = [];
					if (menuItemNode.classList.contains("selected_tab")) {
						document.querySelectorAll(".pin:not(.selected_tab), #"+active_group+" .tab:not(.selected_tab)").forEach(function(s){
							let children = document.querySelectorAll("[id='"+s.id+"'] .selected_tab");
							if (children.length == 0 || opt.promote_children) {
								tabsArr.push(parseInt(s.id));
							}
						});
						CloseTabs(tabsArr);
					} else {
						if (menuItemNode.classList.contains("tab")) {
							document.getElementById(active_group).appendChild(menuItemNode);
						}
						document.querySelectorAll(".pin:not([id='"+menuItemNode.id+"']), #"+active_group+" .tab:not([id='"+menuItemNode.id+"'])").forEach(function(s){
							tabsArr.push(parseInt(s.id));
						});
			
						CloseTabs(tabsArr);
					}
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_bookmark_tree") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					Bookmark(menuItemNode);
					HideMenus();
				}
			}				
		}


		if (m.id == "menu_rename_group") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					ShowGroupEditWindow(menuItemNode.id);
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_delete_group") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					GroupRemove(menuItemNode.id, false);
					HideMenus();
				}
			}				
		}


		if (m.id == "menu_delete_group_tabs_close") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					GroupRemove(menuItemNode.id, true);
					HideMenus();
				}
			}				
		}


		if (m.id == "menu_groups_unload") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					let tabsArr = [];
					document.querySelectorAll("[id='"+menuItemNode.id+"'] .tab").forEach(function(s){
						tabsArr.push(parseInt(s.id));
					});
					DiscardTabs(tabsArr);					
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_manager_window") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					OpenManagerWindow();
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_groups_hibernate") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					ExportGroup(menuItemNode.id, false, true);
					HideMenus();
					setTimeout(function() {
						GroupRemove(menuItemNode.id, true);
					}, 100);
				}
			}				
		}


		if (m.id == "menu_bookmark_group") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					Bookmark(menuItemNode);
					HideMenus();
				}
			}				
		}

		if (m.id == "menu_new_group") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					AddNewGroup();
					HideMenus();
				}
			}				
		}


		if (m.id == "menu_treetabs_settings") {
			m.onmousedown = function(event) {
				if (event.which == 1) {
					event.stopPropagation();
					chrome.tabs.create({ "url": "options.html" });
					HideMenus();
				}
			}				
		}


	});
	
	

	// move tabs to group
	// $(document).on("mousedown", "#menu_detach_tab_to_new_group, .move_to_group_menu_entry", function(event) {
		// var tabsIds
		// if ($(this).is("#menu_detach_tab_to_new_group")) {
			// bg.dt.DropToGroup = AddNewGroup(575757);
			// GetColorFromMiddlePixel(vt.menuItemId, bg.dt.DropToGroup);
		// } else {
			// bg.dt.DropToGroup = this.id.substr(8);
		// }
		// AppendTabsToGroup({tabsIds: DragAndDrop.tabsIds, groupId: bg.dt.DropToGroup, SwitchTabIfHasActive: true, insertAfter: true, RemoveClass: "selected_tab", moveTabs: true});
	// });



}