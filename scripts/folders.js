// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


function AddNewFolder(p) {
	var newId = GenerateNewFolderID();
	bgfolders[newId] = { id: newId, parent: (p.ParentId ? p.ParentId : ""), index: (p.index ? p.index : 0), name: (p.name ? p.name : caption_noname_group), expand: (p.expand ? p.expand : "n") };
	AppendFolder({id: newId, ParentId: (p.ParentId ? p.ParentId : ""), name: caption_noname_group});
	SaveFolders();
	RefreshCounters();
	return newId;
}
function AppendFolder(param) {
	if ($("#"+param.id).length == 0) {
		var fd = document.createElement("div"); fd.className = "folder ";  if (param.expand) { fd.className += param.expand }  fd.id = param.id;// FOLDER
		var dc = document.createElement("div"); dc.className = "drop_target drag_enter_center"; dc.id = "dc"+param.id; fd.appendChild(dc); // DROP TARGET CENTER
		var dt = document.createElement("div"); dt.className = "drop_target drag_entered_top"; dt.id = "du"+param.id; fd.appendChild(dt); // DROP TARGET TOP
		var db = document.createElement("div"); db.className = "drop_target drag_entered_bottom"; db.id = "dd"+param.id; fd.appendChild(db); // DROP TARGET BOTTOM
		var fh = document.createElement("div"); fh.className = opt.always_show_close ? "folder_header close_show" : "folder_header"; fh.id = "folder_header"+param.id; fh.draggable = true; fd.appendChild(fh); // HEADER
		var ex = document.createElement("div"); ex.className = "folder_icon"; ex.id = "fop"+param.id; fh.appendChild(ex);
		var ft = document.createElement("div"); ft.className = "folder_title"; ft.id = "folder_title"+param.id; ft.textContent = param.name; fh.appendChild(ft); // TITLE
		var cf = document.createElement("div"); cf.className = "children"; cf.id = "cf"+param.id; fd.appendChild(cf);
		var ch = document.createElement("div"); ch.className = "children"; ch.id = "ch"+param.id; fd.appendChild(ch);
		if (!opt.never_show_close) {
			var cl = document.createElement("div"); cl.className = "close"; cl.id = "close"+param.id; fh.appendChild(cl); // CLOSE BUTTON
			var ci = document.createElement("div"); ci.className = "close_img"; ci.id = "close_img"+param.id; cl.appendChild(ci);
		}
		if (param.ParentId == "" || param.ParentId == undefined || $("#cf"+param.ParentId).length == 0) {
			$("#cf"+active_group).append(fd);
		} else {
			$("#cf"+param.ParentId).append(fd);
		}
	}
}
function GenerateNewFolderID() {
	var newID = "f_"+GenerateRandomID();
	if ($("#"+newID)[0]) {
		GenerateNewFolderID();
	} else {
		return newID;
	}
}
function AppendFolders(Folders) {
	for (var folderId in Folders) {
		AppendFolder({id: folderId, ParentId: Folders[folderId].parent, name: Folders[folderId].name, expand: Folders[folderId].expand});
	}
	// APPEND FOLDERS TO PARENTS
	for (var folderId in Folders) {
		if ($("#"+folderId)[0] && Folders[folderId].parent != $("#"+folderId).parent().parent()[0].id) {
			$("#cf"+Folders[folderId].parent).append($("#"+folderId));
		}
	}
}
function SaveFolders() {
	$(".folder").each(function() {
		bgfolders[this.id].parent = $(this).parent().parent()[0].id;
		bgfolders[this.id].index = $(this).index();
		bgfolders[this.id].expand = ($(this).is(".n") ? "n" : ($(this).is(".c") ? "c" : "o"));
	});
	chrome.runtime.sendMessage({command: "save_folders", folders: bgfolders, windowId: CurrentWindowId});
}
function RearrangeFolders(first_loop) {
	$(".folder").each(function() {
		if (bgfolders[this.id] && $(this).parent().children().eq(bgfolders[this.id].index)[0]) {
			if ($(this).index() > bgfolders[this.id].index) {
				$(this).insertBefore($(this).parent().children().eq(bgfolders[this.id].index));
			} else {
				$(this).insertAfter($(this).parent().children().eq(bgfolders[this.id].index));
			}
		}
		if (bgfolders[this.id] && $(this).index() != bgfolders[this.id].index && first_loop) {
			RearrangeFolders(false);
		}
	});
}
function RemoveFolder(FolderId) {
	if ($("#"+FolderId)[0]) {
		if (opt.promote_children == true) {
			if (opt.promote_children_in_first_child == true && $("#cf"+FolderId).children().length > 0) {
				let FirstChild = $("#cf"+FolderId).children()[0];
				$(FirstChild).insertAfter($("#"+FolderId));
				$("#cf"+FirstChild.id).append($("#cf"+FolderId).children());
				if ($("#ch"+FolderId).children().length > 0) {
					$("#ch"+FirstChild.id).append($("#ch"+FolderId).children());
				}					
			} else {
				$("#ch"+($("#"+FolderId).parent().parent()[0].id)).append($("#ch"+FolderId).children());
				$("#cf"+FolderId).children().insertAfter($("#"+FolderId));
			}
		} else {
			$("#"+FolderId+" .tab").each(function() {
				chrome.tabs.remove(parseInt(this.id), null);
			});
			$("#"+FolderId+" .folder").each(function() {
				delete bgfolders[this.id];
			});
		}
		$("#"+FolderId).remove();
		delete bgfolders[FolderId];
		RefreshExpandStates();
		chrome.runtime.sendMessage({command: "save_folders", folders: bgfolders, windowId: CurrentWindowId});
	}
}
function SetActiveFolder(FolderId) {
	if ($("#"+FolderId).length > 0) {
		$(".selected_folder").removeClass("selected_folder");
		$("#"+FolderId).addClass("selected_folder");
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
	RefreshCounters();
}
function SetFolderEvents() {
	// EXPAND BOX - EXPAND / COLLAPSE
	$(document).on("click", ".folder_icon", function(event) {
		event.stopPropagation();
		if (event.button == 0) {
			if ($(this).parent().parent().is(".o")) {
				$(this).parent().parent().removeClass("o").addClass("c");
			} else {
				if ($(this).parent().parent().is(".c")) {
					$(this).parent().parent().removeClass("c").addClass("o");
				}
			}
			RefreshExpandStates();
			RefreshCounters();
			SaveFolders();
		}
	});
	// SINGLE CLICK TO ACTIVATE FOLDER
	$(document).on("click", ".folder_header", function(event) {
		event.stopPropagation();
		if (event.button == 0 && !event.shiftKey) {
			$("#"+active_group+" .tab").removeClass("selected_tab");
			if (!event.ctrlKey) {
				$(".selected_folder:not(#"+($(this).parent()[0].id)+")").removeClass("selected_folder");
			}
			// SetActiveFolder();
			$(this).parent().toggleClass("selected_folder");
		}
	});
	// CLOSE TAB/PIN
	$(document).on("mousedown", ".folder_header", function(event) {
		if ((event.button == 1 && opt.close_with_MMB == true) || (event.button == 0 && $(event.target).is(".close, .close_img"))) {
			RemoveFolder($(this).parent()[0].id);
		}
		if (event.button == 2) {
			event.stopPropagation();
			ShowFolderMenu($(this).parent(), event);
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
	$(document).on("dblclick", ".folder_title", function(event) {
		if (event.button == 0) {
			ShowRenameFolderDialog($(this).parent().parent()[0].id);
		}
	});	
	$(document).on("mouseover", ".folder_header", function(event) {
		$(this).addClass("folder_header_hover");
		if (opt.always_show_close == false) {
			$(this).addClass("close_show");
		}
	});
	$(document).on("mouseleave", ".folder_header", function(event) {
		$(this).removeClass("folder_header_hover");
		if (opt.always_show_close == false) {
			$(this).removeClass("close_show");
		}
	});
}