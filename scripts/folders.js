// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


function AddNewFolder() {
	var ID = GenerateNewFolderID();
	AppendFolder({id: ID, name: "untitled"});
}

function AppendFolder(param) {
	var fd = document.createElement("div"); fd.className = "folder c"; fd.id = param.id;// FOLDER
	var dc = document.createElement("div"); dc.className = "drop_target drag_enter_center"; dc.id = "dc"+param.id; fd.appendChild(dc); // DROP TARGET CENTER
	var dt = document.createElement("div"); dt.className = "drop_target drag_entered_top"; dt.id = "du"+param.id; fd.appendChild(dt); // DROP TARGET TOP
	var db = document.createElement("div"); db.className = "drop_target drag_entered_bottom"; db.id = "dd"+param.id; fd.appendChild(db); // DROP TARGET BOTTOM


	var fh = document.createElement("div"); fh.className = "folder_header"; fh.id = "tab_header"+param.id; fh.draggable = true; fd.appendChild(fh); // HEADER
	var ex = document.createElement("div"); ex.className = "folder_icon"; ex.id = "fop"+param.id; fh.appendChild(ex);
	var ft = document.createElement("div"); ft.className = "folder_title"; ft.id = "folder_title"+param.id; ft.textContent = param.name; fh.appendChild(ft); // TITLE
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

function SetFolderEvents() {
	// EXPAND BOX - EXPAND / COLLAPSE
	$(document).on("mousedown", ".folder_icon", function(event) {
		event.stopPropagation();
		if (event.button == 0) {
			if ($(this).parent().parent().is(".o")) {
				$(this).parent().parent().removeClass("o").addClass("c");
				// chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt($(this).parent().parent()[0].id), tab: { expand: "c" } });
			} else {
				if ($(this).parent().parent().is(".c")) {
					$(this).parent().parent().removeClass("c").addClass("o");
					// chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt($(this).parent().parent()[0].id), tab: { expand: "o" } });
					// if (opt.close_other_trees) {
						// $(".o:visible:not(#"+$(this).parent().parent()[0].id+")").removeClass("o").addClass("c");
						// $(this).parents(".tab").each(function() {
							// $(this).removeClass("n").removeClass("c").addClass("o");
							// chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(this.id), tab: { expand: "o" } });
						// });
						// $(".c").each(function() {
							// chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(this.id), tab: { expand: "c" } });
						// });
					// }
				}
			}
		}
	});
}