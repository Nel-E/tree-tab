// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function LoadTheme(themeName) {
	if (localStorage.getItem("theme"+themeName) != null) {
		SelectedTheme = JSON.parse(localStorage["theme"+themeName]);
		$("#new_theme_name")[0].value = themeName;
		setTimeout(function() {
			ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
			ApplyColorsSet(SelectedTheme["ColorsSet"]);
			ApplySizeOptionsSet(SelectedTheme["TabsSizeSetNumber"]);
			
			$("#toolbar").html(SelectedTheme.toolbar);
			$("#toolbar_unused_buttons").html(SelectedTheme.unused_buttons);
			
			// expand toolbar options
			SelectedTheme.ToolbarShow = $("#show_toolbar")[0].checked = SelectedTheme.ToolbarShow;
			$("#field_show_toolbar").css({"height": $("#show_toolbar")[0].checked ? "" : "6"});
			SelectedTheme.ToolbarShow ? $("#options_available_buttons, #toolbar, #toolbar_colors").show() : $("#options_available_buttons, #toolbar, #toolbar_colors").hide();
			
			$(".on").removeClass("on");
			RefreshGUI();

			chrome.runtime.sendMessage({command: "reload_theme", themeName: "theme"+themeName});
		}, 200);
	}
}

function SaveTheme(themeName) {
	localStorage["theme"+themeName] = JSON.stringify(SelectedTheme);
	chrome.runtime.sendMessage({command: "reload_theme", themeName: "theme"+themeName});
	return SelectedTheme;
}

function AddNewTheme() {
	if (themes.indexOf($("#new_theme_name")[0].value) != -1) {
		alert(chrome.i18n.getMessage("options_there_is_a_theme_with_this_name"));
		return;
	}
	
	if ($("#new_theme_name")[0].value == "") {
		alert(chrome.i18n.getMessage("options_theme_name_cannot_be_empty"));
		return;
	}
	
	$("#toolbar").html(DefaultToolbar);
	SelectedTheme = Object.assign({}, DefaultTheme);
	SelectedTheme["ColorsSet"] = {};
	DefaultTheme["ColorsSet"] = {};
	
	themes.push($("#new_theme_name")[0].value);
	var t_list = document.getElementById("theme_list");
	var	theme_name = document.createElement("option");
		theme_name.value = $("#new_theme_name")[0].value;
		theme_name.text = theme_name.value;
	t_list.add(theme_name);
	
	$("#theme_list")[0].selectedIndex = $("#theme_list")[0].options.length-1;
	SaveTheme(theme_name.value);
	LoadTheme(theme_name.value);
	
	localStorage["themes"] = JSON.stringify(themes);
	localStorage["current_theme"] = $("#theme_list").val();
	RefreshFields();	
}	
	
function DeleteSelectedTheme() {
	if ($("#theme_list")[0].options.length == 0) {
		localStorage["current_theme"] = "Default";
		return;
	}
	themes.splice(themes.indexOf($("#theme_list").val()), 1);
	localStorage["themes"] = JSON.stringify(themes);

	// localStorage.removeItem("theme"+($("#theme_list").val()));
	localStorage.removeItem("theme"+SelectedTheme["theme_name"]);
	
	var x = document.getElementById("theme_list");
	x.remove(x.selectedIndex);

	localStorage["current_theme"] = ($("#theme_list")[0].options.length > 0) ? $("#theme_list").val() : "Default";
	LoadTheme(localStorage["current_theme"]);
	RefreshFields();
	if ($("#theme_list")[0].options.length == 0) {
		SelectedTheme = Object.assign({}, DefaultTheme);
		SelectedTheme["ColorsSet"] = {};
		chrome.runtime.sendMessage({command: "reload_theme", themeName: "themeDefault"});
	}
}

function RenameSelectedTheme() {
		if (themes.indexOf($("#new_theme_name")[0].value) != -1) {
			alert(chrome.i18n.getMessage("options_there_is_a_theme_with_this_name"));
			return;
		}
		if ($("#new_theme_name")[0].value == "") {
			alert(chrome.i18n.getMessage("options_theme_name_cannot_be_empty"));
			return;
		}
		var t_list = document.getElementById("theme_list");
		localStorage.removeItem("theme"+SelectedTheme["theme_name"]);
		SelectedTheme["theme_name"] = $("#new_theme_name")[0].value;
		themes[themes.indexOf(t_list.options[t_list.selectedIndex].value)] = SelectedTheme["theme_name"];
		t_list.options[t_list.selectedIndex].value = t_list.options[t_list.selectedIndex].text = SelectedTheme["theme_name"];
		localStorage["current_theme"] = SelectedTheme["theme_name"];
		localStorage["themes"] = JSON.stringify(themes);
		SaveTheme(SelectedTheme["theme_name"]);
}


function ImportTheme() {
	var file = document.getElementById("import_theme");
	var fr = new FileReader();
	if (file.files[0] == undefined) return;
	fr.readAsText(file.files[0]);
	fr.onload = function() {
		var data = fr.result;
		file.remove();
		var themeObj = JSON.parse(data);

		if (themeObj.theme_version > DefaultTheme["theme_version"]) {
			alert(chrome.i18n.getMessage("options_loaded_theme_newer_version"));
		}
		if (themeObj.theme_version < DefaultTheme["theme_version"]) {
			alert(chrome.i18n.getMessage("options_loaded_theme_older_version"));
		}
		
		if (themeObj.theme_version <= DefaultTheme["theme_version"]) {
			
			SelectedTheme = Object.assign({}, DefaultTheme);
			SelectedTheme["ColorsSet"] = {};
			
			for (var val in themeObj.ColorsSet) {
				SelectedTheme["ColorsSet"][val] = themeObj.ColorsSet[val];
			}
			
			SelectedTheme["ToolbarShow"] = themeObj.ToolbarShow;
			SelectedTheme["TabsSizeSetNumber"] = themeObj.TabsSizeSetNumber;
			SelectedTheme["theme_version"] = DefaultTheme["theme_version"];

			if (themeObj.theme_version == 1) {
				SelectedTheme["ColorsSet"]["scrollbar_height"] = themeObj.ScrollbarPinList + "px";
				SelectedTheme["ColorsSet"]["scrollbar_width"] = themeObj.ScrollbarTabList + "px";
			}
			if (themeObj.theme_version == 2) {
				SelectedTheme["unused_buttons"] = themeObj["unused_buttons"];
			}



			if (themes.indexOf(themeObj.theme_name) == -1) {
				SelectedTheme["theme_name"] = themeObj.theme_name;
			} else {
				SelectedTheme["theme_name"] = themeObj.theme_name + "(1)";
			}
			
			themes.push(SelectedTheme["theme_name"]);
		
			SaveTheme(SelectedTheme["theme_name"]);
			var t_list = document.getElementById("theme_list");
			var theme_name = document.createElement("option");
			theme_name.value = SelectedTheme["theme_name"];
			theme_name.text = theme_name.value;
			t_list.add(theme_name);

			localStorage["themes"] = JSON.stringify(themes);
			localStorage["current_theme"] = themeObj.theme_name;
			
			$("#theme_list")[0].selectedIndex = $("#theme_list")[0].options.length-1;
			
			LoadTheme(SelectedTheme["theme_name"]);
			RefreshFields();
			
			DefaultTheme["ColorsSet"] = {};
		}
	}	 

}


function ApplySizeOptionsSet(size){
	for (let si = 0; si < document.styleSheets.length; si++) {
		if ((document.styleSheets[si].ownerNode.id).match("size_settings") != null) {
			if (document.styleSheets[si].ownerNode.id == "size_settings_"+size) {
				document.styleSheets.item(si).disabled = false;
			} else {
				document.styleSheets.item(si).disabled = true;
			}
		}

	}
}
