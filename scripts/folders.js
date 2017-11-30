// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


function SaveFolders() {
	$(".folder").each(function() {
		bgfolders[this.id].parent = $(this).parent()[0].id;
		bgfolders[this.id].index = $(this).index();
		bgfolders[this.id].expand = ($(this).is(".n") ? "n" : ($(this).is(".c") ? "c" : "o"));
	});
	chrome.runtime.sendMessage({command: "save_folders", folders: bgfolders, windowId: CurrentWindowId});
}
function AddNewFolder() {
	var newId = GenerateNewFolderID();
	bgfolders[newId] = { parent: "", index: 0, name: caption_noname_group, expand: "n" };
	AppendFolder({id: newId, name: caption_noname_group});
	SaveFolders();
}
function RemoveFolder(FolderId) {
	if ($("#"+FolderId)[0]) {
		if (opt.promote_children == true) {
			if (opt.promote_children_in_first_child == true) {
				if ($("#cf"+FolderId).children().length > 0) {
					let FirstChild = $("#cf"+FolderId).children()[0];
					$(FirstChild).insertAfter($("#"+FolderId));
					$("#cf"+FirstChild.id).append($("#cf"+FolderId).children());
					
					if ($("#ch"+FolderId).children().length > 0) {
						$("#ch"+FirstChild.id).append($("#ch"+FolderId).children());
					}					
				}
			} else {
				// $("#ch"+message.tabId).children().insertAfter($("#"+message.tabId));
			}
		} else {
			// $("#ch"+message.tabId).find(".tab").each(function() {
				// RemoveTabFromList(this.id);
			// });
		}
		$("#"+FolderId).remove();
		delete bgfolders[FolderId];
		RefreshExpandStates();
		chrome.runtime.sendMessage({command: "save_folders", folders: bgfolders, windowId: CurrentWindowId});
	}
	// RemoveTabFromList(message.tabId);
	// setTimeout(function() { schedule_update_data++; },300);
	// RefreshGUI()
}

function AppendFolder(param) {
	var fd = document.createElement("div"); fd.className = "folder ";  if (param.expand) { fd.className += param.expand }  fd.id = param.id;// FOLDER
	var dc = document.createElement("div"); dc.className = "drop_target drag_enter_center"; dc.id = "dc"+param.id; fd.appendChild(dc); // DROP TARGET CENTER
	var dt = document.createElement("div"); dt.className = "drop_target drag_entered_top"; dt.id = "du"+param.id; fd.appendChild(dt); // DROP TARGET TOP
	var db = document.createElement("div"); db.className = "drop_target drag_entered_bottom"; db.id = "dd"+param.id; fd.appendChild(db); // DROP TARGET BOTTOM


	var fh = document.createElement("div"); fh.className = "folder_header"; fh.id = "tab_header"+param.id; fh.draggable = true; fd.appendChild(fh); // HEADER
	var ex = document.createElement("div"); ex.className = "folder_icon"; ex.id = "fop"+param.id; fh.appendChild(ex);
	var ft = document.createElement("div"); ft.className = "folder_title"; ft.id = "folder_title"+param.id; ft.textContent = param.name; fh.appendChild(ft); // TITLE
					// $("#tab_title" + tab.id)[0].textContent = title;
					// $("#tab_header" + tab.id).attr("title", title);

	
	
	
	var ch = document.createElement("div"); ch.className = "children"; ch.id = "ch"+param.id; fd.appendChild(ch);
	var cf = document.createElement("div"); cf.className = "children"; cf.id = "cf"+param.id; fd.appendChild(cf);
	// var tt = document.createElement("div"); tt.className = "tab_title"; tt.id = "tab_title"+param.tab.id; th.appendChild(tt); // TITLE







	if (param.ParentId == undefined || $("#"+param.ParentId).length == 0) {
		param.ParentId = active_group;
	}
	// else {
		// if($("#"+param.ParentId).parent().is(".folder")) {
			// if ($("#ch"+param.ParentId).children().length == 0) {
				// $("#"+param.ParentId).addClass("o").removeClass("n").removeClass("c");
			// }
			
			// param.ParentId = "ch"+param.ParentId;
		// }
	// }

	// if (param.Append) {
		// $("#"+param.ParentId).append(tb);
	// }
	// if (!param.Append) {
		// $("#"+param.ParentId).prepend(tb);
	// }

	// if (param.InsertBeforeId != undefined && $("#"+param.InsertBeforeId)[0]) {
		// if ((param.tab.pinned && $("#"+param.InsertBeforeId).is(".pin")) || (!param.tab.pinned && $("#"+param.InsertBeforeId).is(".tab"))) {
			// $("#"+param.tab.id).insertBefore($("#"+param.InsertBeforeId));
		// }
	// }
	// if (param.InsertAfterId != undefined && $("#"+param.InsertAfterId)[0]) {
		// if ((param.tab.pinned && $("#"+param.InsertAfterId).is(".pin")) || (!param.tab.pinned && $("#"+param.InsertAfterId).is(".tab"))) {
			// $("#"+param.tab.id).insertAfter($("#"+param.InsertAfterId));
		// }
	// }

	$("#"+param.ParentId).append(fd);
	
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

function SetActiveFolder(FolderId) {
	if ($("#"+FolderId).length > 0) {
		$(".active_folder").removeClass("active_folder");
		$("#"+FolderId).addClass("active_folder");
	}
}

// Rename folder popup
function ShowRenameFolderDialog(FolderId) {
	$("#folder_edit_name")[0].value = bgfolders[FolderId].name;
	$("#folder_edit_name").data("FolderId", FolderId);
	$("#folder_edit").css({"display": "block", "top": $("#toolbar_groups").offset().top + 8, "left": 22});
}

// when pressed OK in folder popup
function FolderRenameConfirm() {
	$("#folder_edit_name")[0].value = $("#folder_edit_name")[0].value.replace(/[\f\n\r\v\t\<\>\+\-\(\)\.\,\;\:\~\/\|\?\@\!\"\'\£\$\%\&\^\#\=\*\[\]]?/gi, "");
	bgfolders[$("#folder_edit_name").data("FolderId")].name = $("#folder_edit_name")[0].value;
	$("#folder_title"+$("#folder_edit_name").data("FolderId"))[0].innerText = $("#folder_edit_name")[0].value;
	$(".edit_dialog").hide(0);
	chrome.runtime.sendMessage({command: "save_folders", folders: bgfolders, windowId: CurrentWindowId});
}

function SetFolderEvents() {
	// EXPAND BOX - EXPAND / COLLAPSE
	$(document).on("click", ".folder_icon", function(event) {
		event.stopPropagation();
		if (event.button == 0) {
			if ($(this).parent().parent().is(".o")) {
				$(this).parent().parent().removeClass("o").addClass("c");
				// console.log($(this).parent().parent().id);
				// if ($(this).parent().parent()) {
					// $(this).parent().parent().id
				// }
				// chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt($(this).parent().parent()[0].id), tab: { expand: "c" } });
			} else {
				if ($(this).parent().parent().is(".c")) {
					$(this).parent().parent().removeClass("c").addClass("o");
				}
			}
			RefreshExpandStates();
			RefreshCounters();
			SaveFolders();
			// chrome.runtime.sendMessage({command: "save_folders", folders: bgfolders, windowId: CurrentWindowId});
		}
	});
	
	
	
	// SINGLE CLICK TO ACTIVATE FOLDER
	$(document).on("mousedown", ".folder_header", function(event) {
		if ($(".menu").is(":visible")) {
			return;
		}
		event.stopPropagation();
		if (event.button == 0 && !event.shiftKey && !event.ctrlKey) {
			SetActiveFolder($(this).parent()[0].id);
		}
	});
	
	
	// edit folder dialog box
	$(document).on("mousedown", "#folder_edit_discard", function(event) {
		$(".edit_dialog").hide(0);
	});
	$("#folder_edit_name").keyup(function(e) {
		if (e.keyCode == 13) {
			FolderRenameConfirm();
		}
	});
	$(document).on("mousedown", "#folder_edit_confirm", function(event) {
		FolderRenameConfirm();
	});

	

	// edit folder
	$(document).on("dblclick", ".folder_header", function(event) {
		if (event.button == 0) {
			ShowRenameFolderDialog($(this).parent()[0].id);
		}
	});	
	
}