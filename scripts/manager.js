// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


function OpenManagerWindow(groupId) {
	HideRenameDialogs();

	chrome.storage.local.get(null, function(storage) {

		if (opt.debug) console.log(storage);

		let ManagerWindow = document.getElementById("manager_window");
		ManagerWindow.style.display = "block";
	
		// ManagerWindow.style.top = document.getElementById("toolbar").getBoundingClientRect().height - 13 + "px";
		ManagerWindow.style.top = "";
		ManagerWindow.style.left = "";

		let GroupList = document.getElementById("manager_window_groups_list");
		while (GroupList.hasChildNodes()) {
			GroupList.removeChild(GroupList.firstChild);
		}
						
		let SessionsList = document.getElementById("manager_window_sessions_list");
		while (SessionsList.hasChildNodes()) {
			SessionsList.removeChild(SessionsList.firstChild);
		}
						
		if (storage.hibernated_groups != undefined) {
			storage.hibernated_groups.forEach(function(hibernated_group){
				AddGroupToManagerList(hibernated_group);
			});
		}
		if (storage.saved_sessions != undefined) {
			(storage.saved_sessions).forEach(function(saved_session){
				AddSessionToManagerList(saved_session);
			});
		}
	});
}


function AddGroupToManagerList(hibernated_group) {
	
	let GroupList = document.getElementById("manager_window_groups_list");

	let HibernatedGroup = document.createElement("li");
	HibernatedGroup.classList = "hibernated_group_row"
	GroupList.appendChild(HibernatedGroup);

	let ExportGroup = document.createElement("div");
	ExportGroup.classList = "manager_window_list_button export_hibernated_group"
	ExportGroup.onmousedown = function(event) {
		if (event.which == 1) {
			let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
			chrome.storage.local.get(null, function(storage) {
				SaveFile(storage.hibernated_groups[HibernategGroupIndex].group.name+".tt_group", storage.hibernated_groups[HibernategGroupIndex]);
			});
		}
	}
	HibernatedGroup.appendChild(ExportGroup);

	let LoadGroup = document.createElement("div");
	LoadGroup.classList = "manager_window_list_button load_hibernated_group"
	LoadGroup.onmousedown = function(event) {
		if (event.which == 1) {
			let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
			chrome.storage.local.get(null, function(storage) {
				RecreateGroup(storage.hibernated_groups[HibernategGroupIndex]);
			});
		}
	}
	HibernatedGroup.appendChild(LoadGroup);

	let DeleteGroup = document.createElement("div");
	DeleteGroup.classList = "manager_window_list_button delete_hibernated_group"
	DeleteGroup.onmousedown = function(event) {
		if (event.which == 1) {
			let hib_group = this.parentNode;
			let HibernategGroupIndex = Array.from(hib_group.parentNode.children).indexOf(hib_group);
			
			chrome.storage.local.get(null, function(storage) {
				// console.log(      storage.hibernated_groups[HibernategGroupIndex].group.name             );
				
				let hibernated_groups = storage.hibernated_groups;
				
					console.log(     hibernated_groups             );
				hibernated_groups.splice(HibernategGroupIndex, 1);
				
				// RecreateGroup(storage.hibernated_groups[HibernategGroupIndex]);
				// hibernated_groups[HibernategGroupIndex].group.name = "test";
				
				chrome.storage.local.set({hibernated_groups: hibernated_groups});
				console.log(     hibernated_groups             );
				hib_group.parentNode.removeChild(hib_group);
			});
		}
	}
	HibernatedGroup.appendChild(DeleteGroup);

	
	// let ren = document.createElement("div");
	// ren.classList = "rename_hibernated_group"
		
	// ren.onmousedown = function(event) {
		// if (event.which == 1) {
			// this.nextSibling.contentEditable = true;
			// this.nextSibling.focus();
			// this.nextSibling.click();
			
			// let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
			// chrome.storage.local.get(null, function(storage) {
				// console.log(      storage.hibernated_groups[HibernategGroupIndex].group.name             );
				// let hibernated_groups = storage.hibernated_groups;
				
				// hibernated_groups[HibernategGroupIndex].group.name = "test";
				
				// chrome.storage.local.set({hibernated_groups: hibernated_groups});
				
			// });
		// }
	// }				

	// HibernatedGroup.appendChild(ren);
	

	let name = document.createElement("div");
	name.contentEditable = true;
	name.textContent = hibernated_group.group.name;
	name.classList = "manager_window_group_name";
	name.oninput = function(event) {
		console.log(event);
		console.log(this.textContent);
	}
	HibernatedGroup.appendChild(name);
	
	let tabsCounter = document.createElement("div");
	tabsCounter.textContent = " - ("+ hibernated_group.tabs.length + ")";
	tabsCounter.classList = "manager_window_group_name";
	HibernatedGroup.appendChild(tabsCounter);
	
	
	RefreshGUI();
}

function AddSessionToManagerList(saved_session) {
	let SessionsList = document.getElementById("manager_window_sessions_list");

	let SavedSession = document.createElement("li");
	SavedSession.classList = "saved_session_row"
	SessionsList.appendChild(SavedSession);
	
	
	let DeleteSession = document.createElement("div");
	DeleteSession.classList = "manager_window_list_button delete_hibernated_session"
	DeleteSession.onmousedown = function(event) {
		if (event.which == 1) {

		}
	}
	SavedSession.appendChild(DeleteSession);

	let name = document.createElement("div");
	name.textContent = saved_session.name;
	name.classList = "manager_window_session_name";
	SavedSession.appendChild(name);

	RefreshGUI();
}


function SetManagerEvents() {
	// HIDE MANAGER WWINDOW
	document.getElementById("manager_window_close").onmousedown = function(event) {
		if (event.which == 1) {
			HideRenameDialogs();
		}
	}

	document.getElementById("manager_window_button_import_group").onmousedown = function(event) {
		if (event.which == 1) {
			let inputFile = ShowOpenFileDialog("file_import_group", ".tt_group");
			inputFile.onchange = function(event) {
				ImportGroup(false, true);
			}
		}
	}
	document.getElementById("manager_window_button_import_session").onmousedown = function(event) {
		if (event.which == 1) {
			let inputFile = ShowOpenFileDialog("file_import_backup", ".tt_session");
			inputFile.onchange = function(event) {
				ImportSession(false, true);
			}
		}
	}

	document.getElementById("manager_window_toolbar_groups_button").onmousedown = function(event) {
		if (event.which == 1) {
			document.getElementById("manager_window_sessions_list").style.display = "none";
			document.getElementById("manager_window_groups_list").style.display = "";
			
			document.querySelectorAll(".mw_on").forEach(function(s){
				s.classList.remove("mw_on");
			});
			this.classList.add("mw_on");
			
			RefreshGUI();
		}
	}
	document.getElementById("manager_window_toolbar_sessions_button").onmousedown = function(event) {
		if (event.which == 1) {
			document.getElementById("manager_window_sessions_list").style.display = "";
			document.getElementById("manager_window_groups_list").style.display = "none";
			document.querySelectorAll(".mw_on").forEach(function(s){
				s.classList.remove("mw_on");
			});
			this.classList.add("mw_on");
			RefreshGUI();
		}
	}

	
}
