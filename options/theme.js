// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function LoadTheme(themeName, reloadSidebar) {
	
	document.querySelectorAll(".theme_buttons").forEach(function(s){
		s.disabled = true;
	});
	
	chrome.storage.local.get(null, function(items) {
		if (items.themes[themeName]) {
			SelectedTheme = Object.assign({}, items.themes[themeName]);
			current_theme = themeName;
		} else {
			SelectedTheme = Object.assign({}, DefaultTheme);
			current_theme = "";
		}
		setTimeout(function() {
			document.getElementById("new_theme_name").value = themeName;
			setTimeout(function() {

				SetToolbarEvents(true, false, false, "");
				RemoveToolbarEditEvents();
				
				ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
				ApplyColorsSet(SelectedTheme["ColorsSet"]);

				document.getElementById("_gtetab_list").style.color = "";
				document.getElementById("_gtetab_list2").style.color = "";
				
				document.getElementById("toolbar").innerHTML = SelectedTheme.toolbar;
				document.getElementById("toolbar_unused_buttons").innerHTML = SelectedTheme.unused_buttons;

				if (browserId == "F") {
					document.querySelectorAll("#button_load_bak1, #button_load_bak2, #button_load_bak3").forEach(function(s){
						s.parentNode.removeChild(s);
					});
				}

				document.getElementById("show_toolbar").checked = SelectedTheme.ToolbarShow;

				if (SelectedTheme["TabsMargins"]) {
					document.getElementById("tabs_margin_spacing")[SelectedTheme["TabsMargins"]].checked = true;
					ApplyTabsMargins(SelectedTheme["TabsMargins"]);
				} else {
					document.getElementById("tabs_margin_spacing")["2"].checked = true;
				}

				document.querySelectorAll(".on").forEach(function(s){
					s.classList.remove("on");
				});

				SetToolbarEvents(false, false, true, "click");
				AddEditToolbarEditEvents();
				RefreshFields();
				RefreshGUI();
				if (reloadSidebar) {
					chrome.runtime.sendMessage({command: "reload_theme", themeName: "theme"+themeName});
				}
				
				document.querySelectorAll(".theme_buttons").forEach(function(s){
					s.disabled = false;
				});

			}, 200);
		}, 200);
	});
}
function SaveTheme(themeName) {
	chrome.storage.local.get(null, function(items) {
		let LSthemes = items.themes ? Object.assign({}, items.themes) : {};
		LSthemes[themeName] = Object.assign({}, SelectedTheme);
		chrome.storage.local.set({themes: LSthemes});
		chrome.runtime.sendMessage({command: "reload_theme", themeName: "theme"+themeName});
		return SelectedTheme;
	});
}
function AddNewTheme() {
	
	let ThemeList = document.getElementById("theme_list");
	let ThemeNameBox = document.getElementById("new_theme_name");
	let NewName = ThemeNameBox.value;
	
	if (ThemeNameBox.value == "") {
		alert(chrome.i18n.getMessage("options_theme_name_cannot_be_empty"));
		return;
	}
	
	document.getElementById("toolbar").innerHTML = DefaultToolbar;

	SelectedTheme = Object.assign({}, DefaultTheme);
	SelectedTheme["ColorsSet"] = {};
	DefaultTheme["ColorsSet"] = {};
	
	if (themes.indexOf(NewName) != -1) {
		while (themes.indexOf(NewName) != -1) {
			let matched = NewName.match(/\(\d+\)+/);
			if (matched != null && matched.length > 0) {
				NewName = NewName.replace(matched[0], ("(" + (parseInt(matched[0].match(/\d+/)[0]) + 1 ) + ")")         );
			} else {
				NewName = NewName + "(1)";
			}
		}
	}


	ThemeNameBox.value = NewName;
	SelectedTheme["theme_name"] = NewName;

	themes.push(NewName);

	let ThemeNameOption = document.createElement("option");
	
	ThemeNameOption.value = NewName;
	ThemeNameOption.text = NewName;

	ThemeList.add(ThemeNameOption);
	ThemeList.selectedIndex = ThemeList.options.length-1;
	
	SaveTheme(NewName);
	setTimeout(function() {
		LoadTheme(NewName, true);
	}, 50);
	
	chrome.storage.local.set({current_theme: NewName});
	RefreshFields();	
}	
function DeleteSelectedTheme() {
	chrome.storage.local.get(null, function(items) {
		let LSthemes = items.themes ? Object.assign({}, items.themes) : {};
		
		let ThemeList = document.getElementById("theme_list");
		
		themes.splice(ThemeList.selectedIndex, 1);
		if (LSthemes[current_theme]) {
			delete LSthemes[current_theme];
		}
		chrome.storage.local.set({themes: LSthemes});
		
		ThemeList.remove(ThemeList.selectedIndex);
	
		current_theme = (ThemeList.options.length > 0) ? ThemeList.value : "Default";
		chrome.storage.local.set({current_theme: current_theme});
		if (ThemeList.options.length == 0) {
			SelectedTheme = Object.assign({}, DefaultTheme);
			SelectedTheme["ColorsSet"] = {};
			chrome.storage.local.set({themes: {}});
			setTimeout(function() {
				chrome.runtime.sendMessage({command: "reload_theme", themeName: ""});
			}, 500);
		}
		LoadTheme(current_theme, true);
		RefreshFields();
	});
}
function RenameSelectedTheme() {

	let ThemeNameBox = document.getElementById("new_theme_name");

	if (themes.indexOf(ThemeNameBox.value) != -1) {
		alert(chrome.i18n.getMessage("options_there_is_a_theme_with_this_name"));
		return;
	}
	if (ThemeNameBox.value == "") {
		alert(chrome.i18n.getMessage("options_theme_name_cannot_be_empty"));
		return;
	}
	chrome.storage.local.get(null, function(items) {
		let LSthemes = items.themes ? Object.assign({}, items.themes) : {};
		SelectedTheme["theme_name"] = ThemeNameBox.value;
		let ThemeList = document.getElementById("theme_list");
		ThemeList.options[ThemeList.selectedIndex].value = ThemeNameBox.value;
		ThemeList.options[ThemeList.selectedIndex].text = ThemeNameBox.value;
		LSthemes[ThemeNameBox.value] = SelectedTheme;
		if (LSthemes[current_theme]) {
			delete LSthemes[current_theme];
		}
		current_theme = ThemeNameBox.value;
		themes[ThemeList.selectedIndex] = ThemeNameBox.value;
		chrome.storage.local.set({themes: LSthemes});
		chrome.storage.local.set({current_theme: current_theme});
	});
}
function ImportTheme() {
	var file = document.getElementById("import_theme");
	var fr = new FileReader();
	if (file.files[0] == undefined) return;
	fr.readAsText(file.files[0]);
	fr.onload = function() {
		var data = fr.result;
		file.parentNode.removeChild(file);
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
			if (themeObj.theme_version == 3) {
				SelectedTheme["TabsMargins"] = themeObj["TabsMargins"];
			}
			if (themes.indexOf(themeObj.theme_name) == -1) {
				SelectedTheme["theme_name"] = themeObj.theme_name;
			} else {
				let NewName = themeObj.theme_name;
				while (themes.indexOf(NewName) != -1) {
					let matched = NewName.match(/\(\d+\)+/);
					if (matched != null && matched.length > 0) {
						NewName = NewName.replace(matched[0], ("(" + (parseInt(matched[0].match(/\d+/)[0]) + 1 ) + ")")         );
					} else {
						NewName = NewName + "(1)";
					}
				}
				SelectedTheme["theme_name"] = NewName;
			}
			themes.push(SelectedTheme["theme_name"]);
			SaveTheme(SelectedTheme["theme_name"]);
			var ThemeList = document.getElementById("theme_list");
			var theme_name = document.createElement("option");
			theme_name.value = SelectedTheme["theme_name"];
			theme_name.text = theme_name.value;
			ThemeList.add(theme_name);
			ThemeList.selectedIndex = ThemeList.options.length-1;
			current_theme = SelectedTheme["theme_name"];
			document.createElement("new_theme_name").value = current_theme;
			setTimeout(function() {
				LoadTheme(current_theme, true);
			}, 500);
			RefreshFields();
			DefaultTheme["ColorsSet"] = {};
			chrome.storage.local.set({current_theme: current_theme});
		}
	}	 
}