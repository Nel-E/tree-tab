// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


function OpenManagerWindow() {
	HideRenameDialogs();

	if (opt.debug) {
		log("f: OpenManagerWindow");
	}

	chrome.storage.local.get(null, function(storage) {
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
		
		ReAddSessionAutomaticToManagerList(storage);
	});
}



function AddGroupToManagerList(hibernated_group) {
	
	let GroupList = document.getElementById("manager_window_groups_list");

	let HibernatedGroupRow = document.createElement("li");
	HibernatedGroupRow.classList = "hibernated_group_row"
	GroupList.appendChild(HibernatedGroupRow);

	let DeleteGroupIcon = document.createElement("div");
	DeleteGroupIcon.classList = "manager_window_list_button delete_hibernated_group";
	DeleteGroupIcon.title = chrome.i18n.getMessage("manager_window_delete_icon");
	
	DeleteGroupIcon.onmousedown = function(event) {
		if (event.which == 1) {
			let hib_group = this.parentNode;
			let HibernategGroupIndex = Array.from(hib_group.parentNode.children).indexOf(hib_group);
			
			chrome.storage.local.get(null, function(storage) {
				let hibernated_groups = storage.hibernated_groups;
				hibernated_groups.splice(HibernategGroupIndex, 1);
				
				chrome.storage.local.set({hibernated_groups: hibernated_groups});
				hib_group.parentNode.removeChild(hib_group);
				RefreshGUI();
			});
		}
	}
	HibernatedGroupRow.appendChild(DeleteGroupIcon);


	let ExportGroupIcon = document.createElement("div");
	ExportGroupIcon.classList = "manager_window_list_button export_hibernated_group";
	ExportGroupIcon.title = chrome.i18n.getMessage("manager_window_savetofile_icon");
	ExportGroupIcon.onmousedown = function(event) {
		if (event.which == 1) {
			let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
			chrome.storage.local.get(null, function(storage) {
				let filename = storage.hibernated_groups[HibernategGroupIndex].group.name == "" ? labels.noname_group : storage.hibernated_groups[HibernategGroupIndex].group.name;
				SaveFile(filename, "tt_group", storage.hibernated_groups[HibernategGroupIndex]);
			});
		}
	}
	HibernatedGroupRow.appendChild(ExportGroupIcon);

	let LoadGroupIcon = document.createElement("div");
	LoadGroupIcon.classList = "manager_window_list_button load_hibernated_group";
	LoadGroupIcon.title = chrome.i18n.getMessage("manager_window_load_icon");
	LoadGroupIcon.onmousedown = function(event) {
		if (event.which == 1) {
			let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
			chrome.storage.local.get(null, function(storage) {
				RecreateGroup(storage.hibernated_groups[HibernategGroupIndex]);
			});
		}
	}
	HibernatedGroupRow.appendChild(LoadGroupIcon);


	let name = document.createElement("div");
	name.contentEditable = true;
	name.textContent = hibernated_group.group.name;
	name.classList = "manager_window_group_name text_input";
	name.onkeydown = function(event) { return event.which != 13; }
	name.oninput = function(event) {
		// this.textContent = (this.textContent).replace(/\n/g,' ');
		let hib_group_name = this.textContent;
		let hib_group = this.parentNode;
		let HibernategGroupIndex = Array.from(hib_group.parentNode.children).indexOf(hib_group);
		chrome.storage.local.get(null, function(storage) {
			let hibernated_groups = storage.hibernated_groups;
			hibernated_groups[HibernategGroupIndex].group.name = hib_group_name;
			chrome.storage.local.set({hibernated_groups: hibernated_groups});
		});
	}
	HibernatedGroupRow.appendChild(name);
	let tabsCounter = document.createElement("div");
	tabsCounter.textContent = " - ("+ hibernated_group.tabs.length + ")";
	tabsCounter.classList = "manager_window_group_name";
	HibernatedGroupRow.appendChild(tabsCounter);
	RefreshGUI();
}



function AddSessionToManagerList(saved_session) {
	let SessionsList = document.getElementById("manager_window_sessions_list");

	let SavedSessionRow = document.createElement("li");
	SavedSessionRow.classList = "saved_session_row"
	SessionsList.appendChild(SavedSessionRow);


	let DeleteSessionIcon = document.createElement("div");
	DeleteSessionIcon.classList = "manager_window_list_button delete_saved_session";
	DeleteSessionIcon.title = chrome.i18n.getMessage("manager_window_delete_icon");
	DeleteSessionIcon.onmousedown = function(event) {
		if (event.which == 1) {
			let saved_session = this.parentNode;
			let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
			chrome.storage.local.get(null, function(storage) {
				let S_Sessions = storage.saved_sessions;
				S_Sessions.splice(SessionIndex, 1);
				chrome.storage.local.set({saved_sessions: S_Sessions});
				saved_session.parentNode.removeChild(saved_session);
				RefreshGUI();

			});
		}
	}
	SavedSessionRow.appendChild(DeleteSessionIcon);
	

	let ExportSessionIcon = document.createElement("div");
	ExportSessionIcon.classList = "manager_window_list_button export_saved_session";
	ExportSessionIcon.title = chrome.i18n.getMessage("manager_window_savetofile_icon");
	ExportSessionIcon.onmousedown = function(event) {
		if (event.which == 1) {
			let saved_session = this.parentNode;
			let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
			chrome.storage.local.get(null, function(storage) {
				let filename = storage.saved_sessions[SessionIndex].name == "" ? labels.noname_group : storage.saved_sessions[SessionIndex].name;
				SaveFile(filename, "tt_session", storage.saved_sessions[SessionIndex].session);
			});
		}
	}
	SavedSessionRow.appendChild(ExportSessionIcon);


	let LoadSessionIcon = document.createElement("div");
	LoadSessionIcon.classList = "manager_window_list_button load_saved_session";
	LoadSessionIcon.title = chrome.i18n.getMessage("manager_window_load_icon");
	LoadSessionIcon.onmousedown = function(event) {
		if (event.which == 1) {
			let saved_session = this.parentNode;
			let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
			chrome.storage.local.get(null, function(storage) {
				let S_Sessions = storage.saved_sessions;
				RecreateSession(S_Sessions[SessionIndex].session);
			});
		}
	}
	SavedSessionRow.appendChild(LoadSessionIcon);

	let MergeSessionIcon = document.createElement("div");
	MergeSessionIcon.classList = "manager_window_list_button merge_saved_session";
	MergeSessionIcon.title = chrome.i18n.getMessage("manager_window_merge_icon");
	MergeSessionIcon.onmousedown = function(event) {
		if (event.which == 1) {
			let saved_session = this.parentNode;
			let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
			chrome.storage.local.get(null, function(storage) {
				let S_Sessions = storage.saved_sessions;
				ImportMergeTabs(S_Sessions[SessionIndex].session);
			});
		}
	}
	SavedSessionRow.appendChild(MergeSessionIcon);

	let name = document.createElement("div");
	name.contentEditable = true;
	name.textContent = saved_session.name;
	name.classList = "manager_window_session_name";
	name.onkeydown = function(event) { return event.which != 13; }
	name.oninput = function(event) {
		// this.textContent = (this.textContent).replace(/\n/g,' ');
		let session_name = this.textContent;
		let s = this.parentNode;
		let SessionIndex = Array.from(s.parentNode.children).indexOf(s);
		chrome.storage.local.get(null, function(storage) {
			let S_Sessions = storage.saved_sessions;
			S_Sessions[SessionIndex].name = session_name;
			chrome.storage.local.set({saved_sessions: S_Sessions});
		});
	}
	SavedSessionRow.appendChild(name);

	RefreshGUI();
}


function ReAddSessionAutomaticToManagerList(storage) {
	let SessionsAutomaticList = document.getElementById("manager_window_autosessions_list");
	while (SessionsAutomaticList.hasChildNodes()) {
		SessionsAutomaticList.removeChild(SessionsAutomaticList.firstChild);
	}
	if (storage.saved_sessions_automatic != undefined) {
		(storage.saved_sessions_automatic).forEach(function(saved_sessions_automatic){
			AddSessionAutomaticToManagerList(saved_sessions_automatic);
		});
	}
	RefreshGUI();
}


function AddSessionAutomaticToManagerList(saved_session) {
	let SessionsList = document.getElementById("manager_window_autosessions_list");

	let SavedSessionRow = document.createElement("li");
	SavedSessionRow.classList = "saved_session_row"
	SessionsList.appendChild(SavedSessionRow);


	let LoadSessionIcon = document.createElement("div");
	LoadSessionIcon.classList = "manager_window_list_button load_saved_session";
	LoadSessionIcon.title = chrome.i18n.getMessage("manager_window_load_icon");
	LoadSessionIcon.onmousedown = function(event) {
		if (event.which == 1) {
			let saved_session = this.parentNode;
			let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
			chrome.storage.local.get(null, function(storage) {
				let S_Sessions = storage.saved_sessions_automatic;
				RecreateSession(S_Sessions[SessionIndex].session);
			});
		}
	}
	SavedSessionRow.appendChild(LoadSessionIcon);

	
	let MergeSessionIcon = document.createElement("div");
	MergeSessionIcon.classList = "manager_window_list_button merge_saved_session";
	MergeSessionIcon.title = chrome.i18n.getMessage("manager_window_merge_icon");
	MergeSessionIcon.onmousedown = function(event) {
		if (event.which == 1) {
			let saved_session = this.parentNode;
			let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
			chrome.storage.local.get(null, function(storage) {
				let S_Sessions = storage.saved_sessions_automatic;
				// RecreateSession(S_Sessions[SessionIndex].session);
				ImportMergeTabs(S_Sessions[SessionIndex].session);
			});
		}
	}
	SavedSessionRow.appendChild(MergeSessionIcon);

	

	let name = document.createElement("div");
	name.textContent = saved_session.name;
	name.classList = "manager_window_session_name";
	SavedSessionRow.appendChild(name);

	RefreshGUI();
}


function SetManagerEvents() {
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
		if (event.which == 1) {
			let inputFile = ShowOpenFileDialog(".tt_group");
			inputFile.onchange = function(event) {
				ImportGroup(false, true);
			}
		}
	}
	document.getElementById("manager_window_button_hibernate_group").onmousedown = function(event) {
		if (event.which == 1) {
			ExportGroup(tt.active_group, false, true);
			setTimeout(function() {
				GroupRemove(tt.active_group, true);
			}, 100);
			setTimeout(function() {
				OpenManagerWindow();
			}, 150);
		}
	}

	
	document.getElementById("manager_window_button_save_current_session").onmousedown = function(event) {
		if (event.which == 1) {
			let d = new Date();
			ExportSession((d.toLocaleString().replace("/", ".").replace("/", ".").replace(":", "꞉").replace(":", "꞉")), false, true, false);
		}
	}
	document.getElementById("manager_window_button_import_session").onmousedown = function(event) {
		if (event.which == 1) {
			let inputFile = ShowOpenFileDialog(".tt_session");
			inputFile.onchange = function(event) {
				ImportSession(false, true, false);
			}
		}
	}
	

	let autosessions_save_max_to_keep = document.getElementById("manager_window_autosessions_maximum_saves");
	autosessions_save_max_to_keep.value = opt.autosave_max_to_keep;
	autosessions_save_max_to_keep.oninput = function(event) {
		opt.autosave_max_to_keep = parseInt(this.value);
		SavePreferences();
	}
	

	let autosessions_save_timer = document.getElementById("manager_window_autosessions_save_timer");
	autosessions_save_timer.value = opt.autosave_interval;
	autosessions_save_timer.oninput = function(event) {
		opt.autosave_interval = parseInt(this.value);
		SavePreferences();
		clearInterval(tt.AutoSaveSession);
		StartAutoSaveSession();
	}

}
