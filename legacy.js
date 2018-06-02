// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


if (localStorage.getItem("t0") != null){
	LoadV015(0);
}



function OldHashTab(tab){
	if (tabs[tab.id] == undefined){
		tabs[tab.id] = {ttid: "", hash: 0, h: 0, parent: tab.pinned ? "pin_list" : "tab_list", index: tab.index, expand: ""};
	}
	var hash = 0;
	if (tab.url.length === 0){
		return 0;
	}
	for (var i = 0; i < tab.url.length; i++){
		hash = (hash << 5)-hash;
		hash = hash+tab.url.charCodeAt(i);
		hash |= 0;
	}
	tabs[tab.id].h = hash;
}


function LoadV015(retry){
	var	loaded_options = {};
	for (var parameter in DefaultPreferences) {
		opt[parameter] = DefaultPreferences[parameter];
	}
	// set loaded options
	if (localStorage.getItem("current_options") !== null){
		loaded_options = JSON.parse(localStorage["current_options"]);
	}
	for (var parameter in opt) {
		if (loaded_options[parameter] != undefined && opt[parameter] != undefined){
			opt[parameter] = loaded_options[parameter];
		}
	}
	SavePreferences();
	if (localStorage.getItem("current_options") !== null){
		localStorage.removeItem("current_options");

	}
	
	chrome.tabs.query({windowType: "normal"}, function(qtabs){
		// create current tabs object
		qtabs.forEach(function(Tab){
			OldHashTab(Tab);
		});

		var reference_tabs = {};
		var tabs_to_save = [];
		var tabs_matched = 0;
		
		// compare saved tabs from storage to current session tabs, but can be skipped if set in options
		qtabs.forEach(function(Tab){
			for (var t = 0; t < 9999; t++){
				if (localStorage.getItem("t"+t) !== null){
					var LoadedTab = JSON.parse(localStorage["t"+t]);
					if (LoadedTab[1] === tabs[Tab.id].h && reference_tabs[LoadedTab[0]] == undefined){
						reference_tabs[LoadedTab[0]] = Tab.id;
						tabs[Tab.id].parent = LoadedTab[2];
						tabs[Tab.id].index = LoadedTab[3];
						tabs[Tab.id].expand = LoadedTab[4];
						tabs_matched++;
						break;
					}
					
				} else {
					break;
				}

			}
		});
		
		// replace parents tabIds to new ones, for that purpose reference_tabs was made before
		for (var tabId in tabs){
			if (reference_tabs[tabs[tabId].parent] != undefined){
				tabs[tabId].parent = reference_tabs[tabs[tabId].parent];
			}
		}


		// create new hashes
		qtabs.forEach(function(Tab){
			ChromeHashURL(Tab);
		});
		qtabs.forEach(function(Tab){
			tabs_to_save.push({id: Tab.id, hash: tabs[Tab.id].hash, parent: tabs[Tab.id].parent, index: tabs[Tab.id].index, expand: tabs[Tab.id].expand});
		});

		localStorage["t_count"] = JSON.stringify(qtabs.length);
		localStorage["tabs"] = JSON.stringify(tabs_to_save);
		for (var t = 0; t < 9999; t++){
			if (localStorage.getItem("t"+t) !== null){
				localStorage.removeItem("t"+t);
			}
		}
		ConvertLegacyStorage();
	});
}


function ConvertLegacyStorage() {
	if (localStorage.getItem("current_theme") != null || localStorage.getItem("preferences") != null || localStorage.getItem("tabs") != null || localStorage.getItem("windows") != null) {
		let current_theme = "";
		if (localStorage.getItem("current_theme") != null) {
			current_theme = localStorage["current_theme"];
		}
		let LSthemes = [];
		if (localStorage.getItem("themes") != null) {
			LSthemes = LoadData("themes", []);
		}
		SLThemes = {};
		LSthemes.forEach(function(themeName) {
			let them = LoadData("theme"+themeName, {"TabsSizeSetNumber": 2, "ToolbarShow": true, "toolbar": DefaultToolbar});
			SLThemes[themeName] = them;
		});

		let LSpreferences = Object.assign({}, DefaultPreferences);
		if (localStorage.getItem("preferences") != null) {
			LSpreferences = LoadData("preferences", {});
		}

		let LStabs = {};
		if (localStorage.getItem("tabs") != null) {
			LStabs = LoadData("tabs", {});
		}
		let LSwindows = {};
		if (localStorage.getItem("windows") != null) {
			LSwindows = LoadData("windows", {});
		}
		let LStabs_BAK1 = {};
		if (localStorage.getItem("tabs_BAK1") != null) {
			LStabs_BAK1 = LoadData("tabs_BAK1", {});
		}
		let LStabs_BAK2 = {};
		if (localStorage.getItem("tabs_BAK2") != null) {
			LStabs_BAK2 = LoadData("tabs_BAK2", {});
		}
		let LStabs_BAK3 = {};
		if (localStorage.getItem("tabs_BAK3") != null) {
			LStabs_BAK3 = LoadData("tabs_BAK3", {});
		}

		let LSwindows_BAK1 = {};
		if (localStorage.getItem("windows_BAK1") != null) {
			LSwindows_BAK1 = LoadData("windows_BAK1", {});
		}
		let LSwindows_BAK2 = {};
		if (localStorage.getItem("windows_BAK2") != null) {
			LSwindows_BAK2 = LoadData("windows_BAK2", {});
		}
		let LSwindows_BAK3 = {};
		if (localStorage.getItem("windows_BAK3") != null) {
			LSwindows_BAK3 = LoadData("windows_BAK3", {});
		}
		
		
		let LSt_count = 0;
		if (localStorage.getItem("t_count") != null) {
			LSt_count = LoadData("t_count", {});
		}
		let LSw_count = 0;
		if (localStorage.getItem("w_count") != null) {
			LSw_count = LoadData("w_count", {});
		}
		chrome.storage.local.set({tabs: LStabs});
		chrome.storage.local.set({windows: LSwindows});
		chrome.storage.local.set({tabs_BAK1: LStabs_BAK1});
		chrome.storage.local.set({tabs_BAK2: LStabs_BAK2});
		chrome.storage.local.set({tabs_BAK3: LStabs_BAK3});

		chrome.storage.local.set({windows_BAK1: LSwindows_BAK1});
		chrome.storage.local.set({windows_BAK2: LSwindows_BAK2});
		chrome.storage.local.set({windows_BAK3: LSwindows_BAK3});
		chrome.storage.local.set({t_count: LSt_count});
		chrome.storage.local.set({w_count: LSw_count});

			
		chrome.storage.local.set({preferences: LSpreferences});
		chrome.storage.local.set({current_theme: current_theme});
		chrome.storage.local.set({themes: SLThemes});
		localStorage.clear();
		window.location.reload();
	}
}

function LoadData(KeyName, ExpectReturnDefaultType) {
	var data = ExpectReturnDefaultType;
	try {
		data = JSON.parse(localStorage[KeyName]);
		return data;
	} catch(e) {
		return ExpectReturnDefaultType;
	}
}
