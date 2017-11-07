// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function OldHashTab(tab){
	if (tabs[tab.id] == undefined){
		tabs[tab.id] = {ttid: "", hash: 0, h: 0, parent: tab.pinned ? "pin_list" : "tab_list", index: tab.index, expand: "n"};
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

		if (browserId == "F") {
			// append ids to firefox tabs
			qtabs.forEach(function(Tab){
				AppendTabTTId(Tab.id);
			});
			qtabs.forEach(function(Tab){
				tabs_to_save.push({id: Tab.id, ttid: tabs[tabId].ttid, parent: tabs[Tab.id].parent, index: tabs[Tab.id].index, expand: tabs[Tab.id].expand});
			});
		} else {
			// create new hashes
			qtabs.forEach(function(Tab){
				ChromeHashURL(Tab);
			});
			qtabs.forEach(function(Tab){
				tabs_to_save.push({id: Tab.id, hash: tabs[Tab.id].hash, parent: tabs[Tab.id].parent, index: tabs[Tab.id].index, expand: tabs[Tab.id].expand});
			});
		}
		localStorage["t_count"] = JSON.stringify(qtabs.length);
		localStorage["tabs"] = JSON.stringify(tabs_to_save);
		for (var t = 0; t < 9999; t++){
			if (localStorage.getItem("t"+t) !== null){
				localStorage.removeItem("t"+t);
			}
		}
		window.location.reload();
	});
}
