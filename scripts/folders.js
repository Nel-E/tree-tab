// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


function AddNewFolder() {
	var ID = GenerateNewFolderID();
	AppendFolder({id: ID, name: "untitled"});
}

function AppendFolder(param) {
	var fd = document.createElement("div"); fd.className = "folder"; fd.id = param.id;// FOLDER
	var dc = document.createElement("div"); dc.className = "drop_target drag_enter_center"; dc.id = "dc"+param.id; fd.appendChild(dc); // DROP TARGET CENTER
	var dt = document.createElement("div"); dt.className = "drop_target drag_entered_top"; dt.id = "du"+param.id; fd.appendChild(dt); // DROP TARGET TOP
	var db = document.createElement("div"); db.className = "drop_target drag_entered_bottom"; db.id = "dd"+param.id; fd.appendChild(db); // DROP TARGET BOTTOM

	var fh = document.createElement("div"); fh.className = "folder_header"; fh.id = "tab_header"+param.id; fh.draggable = true; fh.textContent = param.name; fd.appendChild(fh); // HEADER
					// $("#tab_title" + tab.id)[0].textContent = title;
					// $("#tab_header" + tab.id).attr("title", title);

	
	
	
	var ch = document.createElement("div"); ch.className = "children"; ch.id = "ch"+param.id; fd.appendChild(ch);
	// var tt = document.createElement("div"); tt.className = "tab_title"; tt.id = "tab_title"+param.tab.id; th.appendChild(tt); // TITLE

	$("#"+active_group).append(fd);
	
}

function GenerateNewFolderID(){
	var newID = "f_"+GenerateRandomID();
	console.log("generating "+newID);
	if ($("#"+newID)[0]) {
		GenerateNewFolderID();
	console.log("exists "+newID);
	} else {
	console.log("yay this is ok "+newID);
		return newID;
	}
}
