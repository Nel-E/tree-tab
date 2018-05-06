// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


function OpenManagerWindow() {
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
	ExportGroup.classList = "manager_window_list_button export_hibernated_group";
	ExportGroup.onmousedown = function(event) {
		if (event.which == 1) {
			let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
			chrome.storage.local.get(null, function(storage) {
				let filename = storage.hibernated_groups[HibernategGroupIndex].group.name == "" ? caption_noname_group+".tt_group" : storage.hibernated_groups[HibernategGroupIndex].group.name+".tt_group";
				SaveFile(filename, storage.hibernated_groups[HibernategGroupIndex]);
			});
		}
	}
	HibernatedGroup.appendChild(ExportGroup);

	let LoadGroup = document.createElement("div");
	LoadGroup.classList = "manager_window_list_button load_hibernated_group";
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
	DeleteGroup.classList = "manager_window_list_button delete_hibernated_group";
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
				RefreshGUI();
			});
		}
	}
	HibernatedGroup.appendChild(DeleteGroup);


	let name = document.createElement("div");
	name.contentEditable = true;
	name.textContent = hibernated_group.group.name;
	name.classList = "manager_window_group_name text_input";
	name.onkeydown = function(event) { return event.which != 13; }
	name.oninput = function(event) {
		this.textContent = (this.textContent).replace(/\n/g,' ');
		let hib_group_name = this.textContent;
		let hib_group = this.parentNode;
		let HibernategGroupIndex = Array.from(hib_group.parentNode.children).indexOf(hib_group);
		chrome.storage.local.get(null, function(storage) {
			let hibernated_groups = storage.hibernated_groups;
			hibernated_groups[HibernategGroupIndex].group.name = hib_group_name;
			chrome.storage.local.set({hibernated_groups: hibernated_groups});
		});		
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
	
	let ExportSession = document.createElement("div");
	ExportSession.classList = "manager_window_list_button export_saved_session";
	ExportSession.onmousedown = function(event) {
		if (event.which == 1) {
			
			
			// ExportSession((d.toLocaleString().replace("/", "-").replace("/", "-").replace(":", "-").replace(":", "-"))+".tt_session", false);



			let saved_session = this.parentNode;
			let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);

			chrome.storage.local.get(null, function(storage) {
				let filename = storage.saved_sessions[SessionIndex].name == "" ? caption_noname_group+".tt_session" : storage.saved_sessions[SessionIndex].name+".tt_session";
				
				// console.log(S_Sessions[SessionIndex].session);
				console.log(filename);

				
				
				// let filename = storage.hibernated_groups[HibernategGroupIndex].group.name == "" ? caption_noname_group+".tt_group" : storage.hibernated_groups[HibernategGroupIndex].group.name+".tt_group";
				SaveFile(filename, storage.saved_sessions[SessionIndex].session);
			});

			// let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
			// chrome.storage.local.get(null, function(storage) {
				// let filename = storage.hibernated_groups[HibernategGroupIndex].group.name == "" ? caption_noname_group+".tt_group" : storage.hibernated_groups[HibernategGroupIndex].group.name+".tt_group";
				// SaveFile(filename, storage.hibernated_groups[HibernategGroupIndex]);
			// });
			// let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
			// chrome.storage.local.get(null, function(storage) {
				// SaveFile(storage.hibernated_groups[HibernategGroupIndex].group.name+".tt_group", storage.hibernated_groups[HibernategGroupIndex]);
			// });
		}
	}
	SavedSession.appendChild(ExportSession);

	let LoadSession = document.createElement("div");
	LoadSession.classList = "manager_window_list_button load_saved_session";
	LoadSession.onmousedown = function(event) {
		if (event.which == 1) {
			let saved_session = this.parentNode;
			let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
			chrome.storage.local.get(null, function(storage) {
				let S_Sessions = storage.saved_sessions;
				
				// console.log(S_Sessions[SessionIndex].session);
				
				RecreateSession(S_Sessions[SessionIndex].session);
				
			});
		}
	}
	SavedSession.appendChild(LoadSession);


	
	let DeleteSession = document.createElement("div");
	DeleteSession.classList = "manager_window_list_button delete_saved_session";
	DeleteSession.onmousedown = function(event) {
		if (event.which == 1) {
			let saved_session = this.parentNode;
					console.log(     saved_session             );
			let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
					console.log(     SessionIndex             );
		
			chrome.storage.local.get(null, function(storage) {
				let S_Sessions = storage.saved_sessions;
				console.log(     S_Sessions             );
				S_Sessions.splice(SessionIndex, 1);
				
				chrome.storage.local.set({saved_sessions: S_Sessions});
				console.log(     S_Sessions             );
				saved_session.parentNode.removeChild(saved_session);
				RefreshGUI();

			});
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
	document.querySelectorAll(".manager_window_toolbar_button").forEach(function(s){
		s.onmousedown = function(event) {
			if (event.which == 1) {
				document.querySelectorAll(".manager_window_panel").forEach(function(s){
					s.classList.remove("mw_pan_on");
				});
				document.getElementById((this.id).replace("button", "panel")).classList.add("mw_pan_on");

				document.querySelectorAll(".mw_on").forEach(function(s){
					s.classList.remove("mw_on");
				});
				this.classList.add("mw_on");
				RefreshGUI();
			}
		}
	});

	
	document.getElementById("manager_window_button_import_group").onmousedown = function(event) {
		console.log(event);
		if (event.which == 1) {
			let inputFile = ShowOpenFileDialog("file_import_group", ".tt_group");
			inputFile.onchange = function(event) {
				ImportGroup(true, false);
			}
		}
	}
	document.getElementById("manager_window_button_hibernate_group").onmousedown = function(event) {
		console.log(event);
		if (event.which == 1) {
			ExportGroup(active_group, false, true);
			setTimeout(function() {
				GroupRemove(active_group, true);
			}, 100);
			setTimeout(function() {
				OpenManagerWindow();
			}, 150);
		}
	}


	
	document.getElementById("manager_window_button_save_current_session").onmousedown = function(event) {
		if (event.which == 1) {
			let d = new Date();
			ExportSession((d.toLocaleString().replace("/", "-").replace("/", "-").replace(":", "-").replace(":", "-")), true);
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
	
	let autosessions_save_timer = document.getElementById("manager_window_autosessions_save_timer");
	autosessions_save_timer.value = opt.autosave_interval;
	autosessions_save_timer.oninput = function(event) {
		opt.autosave_interval = parseInt(this.value);
		
		clearInterval(AutoSaveSession);
		StartAutoSaveSession();
	}

	
}
