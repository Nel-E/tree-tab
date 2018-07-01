// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


function Loadi18n() {
	// toolbar labels
	document.querySelectorAll(".button, .manager_window_toolbar_button").forEach(function(s){
		s.title = chrome.i18n.getMessage(s.id);
	});
	// menu labels and edit group dialog labels
	document.querySelectorAll(".menu_item, .edit_dialog_button, #manager_window_header_title, .manager_window_label").forEach(function(s){
		s.textContent = chrome.i18n.getMessage(s.id);
	});
}

function RestorePinListRowSettings() {
	plist = document.getElementById("pin_list");
	if (opt.pin_list_multi_row) {
		plist.style.whiteSpace = "normal";
		plist.style.overflowX = "hidden";
	} else {
		plist.style.whiteSpace = "";
		plist.style.overflowX = "";
	}
	RefreshGUI();
}

function ApplyTheme(theme) {
	RestoreStateOfGroupsToolbar();
	ApplySizeSet(theme["TabsSizeSetNumber"]);
	ApplyColorsSet(theme["ColorsSet"]);
	ApplyTabsMargins(theme["TabsMargins"]);
	RefreshGUI();
	
	for (var groupId in tt.groups) {
		let groupTitle = document.getElementById("_gte"+groupId);
		if (groupTitle != null && tt.groups[groupId].font == "") {
			groupTitle.style.color = "";
		}
	}
	Loadi18n();
}

// theme colors is an object with css variables (but without --), for example; {"button_background": "#f2f2f2", "filter_box_border": "#cccccc"}
function ApplyColorsSet(ThemeColors){
	let css_variables = "";
	for (let css_variable in ThemeColors) {
		css_variables = css_variables + "--" + css_variable + ":" + ThemeColors[css_variable] + ";";
	}
	for (let si = 0; si < document.styleSheets.length; si++) {
		if (document.styleSheets[si].ownerNode.id == "theme_colors") {
			document.styleSheets[si].deleteRule(document.styleSheets[si].cssRules.length-1);
			document.styleSheets[si].insertRule("body { "+css_variables+" }", document.styleSheets[si].cssRules.length);
		}
	}
}

function ApplySizeSet(size){
	for (let si = 0; si < document.styleSheets.length; si++) {
		if ((document.styleSheets[si].ownerNode.id).match("sizes_preset") != null) {
			if (document.styleSheets[si].ownerNode.id == "sizes_preset_"+size) {
				document.styleSheets.item(si).disabled = false;
			} else {
				document.styleSheets.item(si).disabled = true;
			}
		}
	}
	if (browserId == "F") {
		// for some reason top position for various things is different in firefox?????
		if (size > 1) {
			document.styleSheets[document.styleSheets.length-1].insertRule(".tab_header>.tab_title { margin-top: -1px; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
		} else {
			document.styleSheets[document.styleSheets.length-1].insertRule(".tab_header>.tab_title { margin-top: 0px; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
		}
	}
}

function ApplyTabsMargins(size){
	for (let si = 0; si < document.styleSheets.length; si++) {
		if ((document.styleSheets[si].ownerNode.id).match("tabs_margin") != null) {
			if (document.styleSheets[si].ownerNode.id == "tabs_margin_"+size) {
				document.styleSheets.item(si).disabled = false;
			} else {
				document.styleSheets.item(si).disabled = true;
			}
		}
	}
}

function GetCurrentToolbar(storage) {
	if (storage["toolbar"]) {
		return storage["toolbar"];
	} else {
		return DefaultToolbar;
	}
}


function GetCurrentTheme(storage) {
	if (storage["current_theme"] && storage["themes"] && storage["themes"][storage["current_theme"]]) {
		let theme = storage["themes"][storage["current_theme"]];
		let correctedTheme = CheckTheme(theme);
			if (correctedTheme.theme_version < 4 && storage["preferences"].show_toolbar == undefined) {
				opt.show_toolbar = correctedTheme.ToolbarShow;
				SavePreferences();
			}
		return correctedTheme;
	} else {
		return DefaultTheme;
	}
}

// OPTIONS PAGE
function LoadTheme(ThemeId, reloadInSidebar) {
	
	document.querySelectorAll(".theme_buttons").forEach(function(s){
		s.disabled = true;
	});
	
	chrome.storage.local.set({current_theme: ThemeId}, function() {
		chrome.storage.local.get(null, function(storage) {
			SelectedTheme = Object.assign({}, GetCurrentTheme(storage));
			setTimeout(function() {
				document.getElementById("new_theme_name").value = SelectedTheme.theme_name;
				setTimeout(function() {
					// SetToolbarEvents(true, false, false, "");
					RemoveToolbarEditEvents();
					
					ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
					ApplyColorsSet(SelectedTheme["ColorsSet"]);
					document.getElementById("_gtetab_list").style.color = "";
					document.getElementById("_gtetab_list2").style.color = "";

					if (SelectedTheme["TabsMargins"]) {
						document.getElementById("tabs_margin_spacing")[SelectedTheme["TabsMargins"]].checked = true;
						ApplyTabsMargins(SelectedTheme["TabsMargins"]);
					} else {
						document.getElementById("tabs_margin_spacing")["2"].checked = true;
					}

					if (reloadInSidebar) {
						chrome.runtime.sendMessage({command: "reload_theme", ThemeId: ThemeId, theme: SelectedTheme});
					}
					
					document.querySelectorAll(".theme_buttons").forEach(function(s){
						s.disabled = false;
					});

				}, 200);
			}, 200);
		});
	});
}

function SaveTheme(ThemeId) {
	chrome.storage.local.get(null, function(storage) {
		
		SelectedTheme.theme_version = DefaultTheme.theme_version;
		
		let LSthemes = storage.themes ? Object.assign({}, storage.themes) : {};
		
		LSthemes[ThemeId] = Object.assign({}, SelectedTheme);

		chrome.storage.local.set({themes: LSthemes});

		chrome.runtime.sendMessage({command: "reload_theme", ThemeId: ThemeId, theme: SelectedTheme});
		return SelectedTheme;
	});
}

function AddNewTheme() {
	
	let ThemeId = GenerateRandomID() + GenerateRandomID();
	let ThemeList = document.getElementById("theme_list");
	let ThemeNameBox = document.getElementById("new_theme_name");
	let NewName = ThemeNameBox.value;
	
	if (ThemeNameBox.value == "") {
		alert(chrome.i18n.getMessage("options_theme_name_cannot_be_empty"));
		return;
	}

	SelectedTheme = Object.assign({}, DefaultTheme);
	SelectedTheme["ColorsSet"] = {};

	// let Names = [];
	
	// for (let i = 0; i < ThemeList.options.length; i++) {
		// Names.push(ThemeList.options[i].text);
	// }
	
	// while (Names.indexOf(NewName) != -1) {
		// let matched = NewName.match(/\(\d+\)+/);
		// if (matched != null && matched.length > 0) {
			// NewName = NewName.replace(matched[0], ("(" + (parseInt(matched[0].match(/\d+/)[0]) + 1 ) + ")")         );
		// } else {
			// NewName = NewName + "(1)";
		// }
	// }
	
	ThemeNameBox.value = NewName;
	SelectedTheme["theme_name"] = NewName;

	themes.push(ThemeId);

	let ThemeNameOption = document.createElement("option");
	
	ThemeNameOption.value = ThemeId;
	ThemeNameOption.text = NewName;

	ThemeList.add(ThemeNameOption);
	ThemeList.selectedIndex = ThemeList.options.length-1;
	
	SaveTheme(ThemeId);
	setTimeout(function() {
		LoadTheme(ThemeId, true);
	}, 50);
	
	chrome.storage.local.set({current_theme: ThemeId});
	RefreshFields();	
}

function DeleteSelectedTheme() {
	chrome.storage.local.get(null, function(storage) {
		let LSthemes = storage.themes ? Object.assign({}, storage.themes) : {};
		
		let ThemeList = document.getElementById("theme_list");
		
		themes.splice(ThemeList.selectedIndex, 1);
		if (LSthemes[current_theme]) {
			delete LSthemes[current_theme];
		}
		chrome.storage.local.set({themes: LSthemes});
		
		ThemeList.remove(ThemeList.selectedIndex);
	
		current_theme = (ThemeList.options.length > 0) ? ThemeList.value : "default";
		
		
		chrome.storage.local.set({current_theme: current_theme});
		
		if (ThemeList.options.length == 0) {
			current_theme = "";
			SelectedTheme = Object.assign({}, DefaultTheme);
			SelectedTheme["ColorsSet"] = {};
			chrome.storage.local.set({themes: {}});
			setTimeout(function() {
				chrome.runtime.sendMessage({command: "reload_theme", themeName: "", theme: SelectedTheme});
			}, 500);
		}
		LoadTheme(current_theme, true);
		RefreshFields();
	});
}

function RenameSelectedTheme() {
	let ThemeList = document.getElementById("theme_list");
	let ThemeNameBox = document.getElementById("new_theme_name");

	// for (let i = 0; i < ThemeList.options.length; i++) {
		// if (ThemeNameBox.value == ThemeList.options[i].text){
			// alert(chrome.i18n.getMessage("options_there_is_a_theme_with_this_name"));
			// return;
		// }
	// }
	
	if (ThemeNameBox.value == "") {
		alert(chrome.i18n.getMessage("options_theme_name_cannot_be_empty"));
		return;
	}
	
	
	chrome.storage.local.get(null, function(storage) {
		let LSthemes = storage.themes ? Object.assign({}, storage.themes) : {};
		ThemeList.options[ThemeList.selectedIndex].text = ThemeNameBox.value;
		SelectedTheme["theme_name"] = ThemeNameBox.value;
		LSthemes[current_theme]["theme_name"] = ThemeNameBox.value;
		chrome.storage.local.set({themes: LSthemes});
		chrome.storage.local.set({current_theme: current_theme});
	});
}



function CheckTheme(theme) {
	if (theme.theme_version < 2) {
		theme["ColorsSet"]["scrollbar_height"] = theme.ScrollbarPinList + "px";
		theme["ColorsSet"]["scrollbar_width"] = theme.ScrollbarTabList + "px";
	}
	if (theme["TabsMargins"] == undefined) {
		theme["TabsMargins"] = "2";
	}
	if (theme.theme_version < 4) {
		delete theme["ColorsSet"]["active_font_weight"];
		delete theme["ColorsSet"]["expand_lines"];
		delete theme["ColorsSet"]["expand_open_border"];
		delete theme["ColorsSet"]["expand_closed_border"];
		
		if (theme["ColorsSet"]["toolbar_background"]) {
			theme["ColorsSet"]["toolbar_shelf_background"] = theme["ColorsSet"]["toolbar_background"];
			theme["ColorsSet"]["button_on_background"] = theme["ColorsSet"]["toolbar_background"];
		}
		if (theme["ColorsSet"]["button_icons"]) {
			theme["ColorsSet"]["button_on_icons"] = theme["ColorsSet"]["button_icons"];
			theme["ColorsSet"]["button_shelf_icons"] = theme["ColorsSet"]["button_icons"];
		}
		if (theme["ColorsSet"]["button_background"]) {
			theme["ColorsSet"]["button_shelf_background"] = theme["ColorsSet"]["button_background"];
		}
		if (theme["ColorsSet"]["button_hover_background"]) {
			theme["ColorsSet"]["button_shelf_hover_background"] = theme["ColorsSet"]["button_hover_background"];
		}
		if (theme["ColorsSet"]["button_border"]) {
			theme["ColorsSet"]["button_shelf_border"] = theme["ColorsSet"]["button_border"];
		}
		if (theme["ColorsSet"]["button_hover_border"]) {
			theme["ColorsSet"]["button_shelf_hover_border"] = theme["ColorsSet"]["button_hover_border"];
		}
		if (theme["ColorsSet"]["button_icons_hover"]) {
			theme["ColorsSet"]["button_shelf_icons_hover"] = theme["ColorsSet"]["button_icons_hover"];
		}
		
		if (theme["ColorsSet"]["expand_hover_background"]) {
			theme["ColorsSet"]["folder_icon_hover"] = theme["ColorsSet"]["expand_hover_background"];
		}
		if (theme["ColorsSet"]["expand_closed_background"]) {
			theme["ColorsSet"]["folder_icon_closed"] = theme["ColorsSet"]["expand_closed_background"];
		}
		if (theme["ColorsSet"]["expand_open_background"]) {
			theme["ColorsSet"]["folder_icon_open"] = theme["ColorsSet"]["expand_open_background"];
		}
	}
		
	return theme;
}



function ImportTheme() {
	var file = document.getElementById("file_import");
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
			let ThemeList = document.getElementById("theme_list");
			let ThemeId = GenerateRandomID() + GenerateRandomID();
			let correctedTheme = CheckTheme(themeObj);
			
			SelectedTheme = Object.assign({}, DefaultTheme);

			for (var val in correctedTheme.ColorsSet) {
				SelectedTheme["ColorsSet"][val] = correctedTheme.ColorsSet[val];
			}
			
			SelectedTheme["TabsSizeSetNumber"] = correctedTheme.TabsSizeSetNumber;
			SelectedTheme["TabsMargins"] = correctedTheme["TabsMargins"];
			SelectedTheme["theme_version"] = DefaultTheme["theme_version"];
			
			// let Names = [];
			// for (let i = 0; i < ThemeList.options.length; i++) {
				// Names.push(ThemeList.options[i].text);
			// }
			
			// if (Names.indexOf(correctedTheme.theme_name) == -1) {
				SelectedTheme["theme_name"] = correctedTheme.theme_name;
			// } else {
				// let NewName = correctedTheme.theme_name;
				// while (Names.indexOf(NewName) != -1) {
					// let matched = NewName.match(/\(\d+\)+/);
					// if (matched != null && matched.length > 0) {
						// NewName = NewName.replace(matched[0], ("(" + (parseInt(matched[0].match(/\d+/)[0]) + 1 ) + ")")         );
					// } else {
						// NewName = NewName + "(1)";
					// }
				// }
				// SelectedTheme["theme_name"] = NewName;
			// }
			
			themes.push(ThemeId);
			SaveTheme(ThemeId);
			
			var theme_name = document.createElement("option");
			
			theme_name.value = ThemeId;
			theme_name.text = SelectedTheme["theme_name"];
			
			ThemeList.add(theme_name);
			ThemeList.selectedIndex = ThemeList.options.length-1;
			
			current_theme = ThemeId;
			document.createElement("new_theme_name").value = ThemeId;
			
			setTimeout(function() {
				LoadTheme(ThemeId, true);
			}, 500);
			RefreshFields();
			DefaultTheme["ColorsSet"] = {};
			chrome.storage.local.set({current_theme: ThemeId});
		}
	}	 
}