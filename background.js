// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

var opt = { 
	"skip_load": false, "new_open_below": false, "pin_list_multi_row": false, "close_with_MMB": true,
	"always_show_close": false, "allow_pin_close": false,
	"append_child_tab": "bottom", "append_child_tab_after_limit": "after",
	"append_orphan_tab": "bottom", "after_closing_active_tab": "below", "close_other_trees": false,
	"promote_children": true, "open_tree_on_hover": true, "max_tree_depth": -1, "never_show_close": false,
	"faster_scroll": false, "switch_with_scroll": false, "syncro_tabbar_tabs_order": true
};
var opt_toolbar = {
	"active_toolbar_tool": "", "filter_type": "url"
};

var	hold = true,
	started = false,
	schedule_save = 0,

	tabs = {},
	groups = {},

	dt = {tabsIds: [], DropBeforeTabId: 0, DropAfterTabId: 0, DropToTabId: 0, CameFromWindowId: 0, DroppedToWindowId: 0},
	
	caption_clear_filter = chrome.i18n.getMessage("caption_clear_filter"),
	caption_loading = chrome.i18n.getMessage("caption_loading"),
	caption_searchbox = chrome.i18n.getMessage("caption_searchbox");
	
function Start() {
	started = true;

	// open options to set defaults
	if (localStorage.getItem("themeDefault") === null) {
		chrome.tabs.create({url: "options.html" });
	}

	// all variables needed to load data
	var	loaded_options = {}, loaded_opt_toolbar = {};
	
	// set loaded options
	if (localStorage.getItem("current_options") !== null) {
		loaded_options = JSON.parse(localStorage["current_options"]);
	}
	for (var parameter in opt) {
		if (loaded_options[parameter] != undefined && opt[parameter] != undefined) {
			opt[parameter] = loaded_options[parameter];
		}
	}

	// toolbar shelfs options (search url-title and which shelf is active)
	if (localStorage.getItem("current_toolbar_options") !== null) {
		loaded_opt_toolbar = JSON.parse(localStorage["current_toolbar_options"]);
	}
	for (var parameter in opt_toolbar) {
		if (loaded_opt_toolbar[parameter] != undefined && opt_toolbar[parameter] != undefined) {
			opt_toolbar[parameter] = loaded_opt_toolbar[parameter];
		}
	}

	// LOAD GROUPS
	if (localStorage.getItem("groups") !== null) {
		groups = JSON.parse(localStorage["groups"]);
	}
// localStorage.clear();

	LoadTabs(0);
}	
	
	
	
function LoadTabs(retry) {

	chrome.tabs.query({windowType: "normal"}, function(qtabs) {
		
		// SessionStore.setTabValue(qtabs[0], "test", "x");
		
		
		// will loop forever if session restore tab is found
		if (navigator.userAgent.match("Firefox") !== null) {
			// "experiments.tabstrip" this goes in permissions in manifest, maybe in future it will be implemented
			// browser.tabstrip.setTabsVisible(false);
			var halt = false;
			for (var t = 0; t < qtabs.length; t++) {
				if (qtabs[t].url.match("sessionrestore")) {
					halt = true;
					chrome.tabs.update(qtabs[t].id, { active: true });
					break;
				}
			}
			if (halt) {
				setTimeout(function() {LoadTabs(retry);}, 2000);
				return;
			}
		}

// console.log("loading tabs");
		// create current tabs object
		qtabs.forEach(function(Tab) {
			HashTab(Tab);
		});
		
		
		var reference_tabs = {};
		var tabs_matched = 0;
		var t_count = localStorage.getItem("t_count") !== null ? JSON.parse(localStorage["t_count"]) : 0;
		var LoadedTabs = localStorage.getItem("tabs") !== null ? JSON.parse(localStorage["tabs"]) : [];
		
		// if loaded tabs is under 50%, then try to load back
		if (LoadedTabs.length < t_count && localStorage.getItem("tabs_BAK") !== null) {
			LoadedTabs =  JSON.parse(localStorage["tabs_BAK"]);
		}
			
		

		// qtabs.forEach(function(Tab) {
			// console.log(tabs[Tab.id]);
		// });
		
		// compare saved tabs from storage to current session tabs, but can be skipped if set in options
		if (opt.skip_load == false && LoadedTabs.length > 0) {
			
			// match loaded tabs
			qtabs.forEach(function(Tab) {
				for (var t = 0; t < LoadedTabs.length; t++) {
					if (LoadedTabs[t][1] === tabs[Tab.id].h && reference_tabs[LoadedTabs[t][0]] == undefined) {
						reference_tabs[LoadedTabs[t][0]] = Tab.id;
						tabs[Tab.id].p = LoadedTabs[t][2];
						tabs[Tab.id].n = LoadedTabs[t][3];
						tabs[Tab.id].o = LoadedTabs[t][4];
						tabs_matched++;
						LoadedTabs.splice(t, 1);
						break;
					}
				}
			});
			
			// replace parents tabIds to new ones, for that purpose reference_tabs was made before
			for (var tabId in tabs) {
				if (reference_tabs[tabs[tabId].p] != undefined) {
					tabs[tabId].p = reference_tabs[tabs[tabId].p];
				}
			}
		}

		// replace active tab ids for each group using reference_tabs
		for (var group in groups) {
			if (reference_tabs[groups[group].activetab]) {
				groups[group].activetab = reference_tabs[groups[group].activetab];
			}
		}

		// will try to find tabs for 3 times
		if (opt.skip_load == true || retry > 3 || tabs_matched >= t_count || localStorage.getItem("themeDefault") === null) {
			schedule_save++;
			hold = false;
			StartChromeListeners();
			PeriodicCheck();
			AutoSaveData();
		} else {
			setTimeout(function() {LoadTabs(retry+1);}, 2000);
		}
	});
}

// once a minute checking for missing tabs
async function PeriodicCheck() {
	setTimeout(function() {
		PeriodicCheck();
		if (!hold) {
			chrome.tabs.query({windowType: "normal"}, function(qtabs) {
				qtabs.forEach(function(Tab) {
					if (tabs[Tab.id] == undefined) {
						HashTab(Tab);
						setTimeout(function() {chrome.runtime.sendMessage({command: "recheck_tabs"});},300);
						setTimeout(function() {schedule_save++;},600);
					}
				});
			});
		}
	},60000);
}

// save every 2 seconds if there is anything to save obviously
async function AutoSaveData() {
	setTimeout(function() {
		AutoSaveData();
		if (schedule_save > 0) {
			schedule_save = 1;
		}
		if (!hold && schedule_save > 0 && Object.keys(tabs).length > 1) {
			chrome.tabs.query({windowType: "normal"}, function(qtabs) {
				localStorage["t_count"] = qtabs.length*0.5;
				var data = [];
				qtabs.forEach(function(Tab){
					if (tabs[Tab.id] != undefined && tabs[Tab.id].h != undefined && tabs[Tab.id].p != undefined && tabs[Tab.id].n != undefined && tabs[Tab.id].o != undefined){
						data.push([Tab.id, tabs[Tab.id].h, tabs[Tab.id].p, tabs[Tab.id].n, tabs[Tab.id].o]);
					}
					if (data.length == qtabs.length){
						if (localStorage.getItem("tabs") !== null){
							localStorage["tabs_BAK"] = JSON.parse(localStorage["tabs"]);
						}
						localStorage["tabs"] = JSON.stringify(data);
					}
				});
				schedule_save--;
			});
		}
	}, 500);
}

function SaveOptions() {
	localStorage["current_options"] = JSON.stringify(opt);
}
function SaveToolbarOptions() {
	localStorage["current_toolbar_options"] = JSON.stringify(opt_toolbar);
}

// async function HashTab(tab) {
	// if (tabs[tab.id] == undefined) {
		// tabs[tab.id] = {h: 0, p: tab.pinned ? "pin_list" : "tab_list", n: tab.index, o: "n"};
	// }
	// if (tab.url.length !== 0) {
		// var hash = tab.url.slice(0, -4);
		// hash = hash.replace(/\W+|http|https|www|com|html|20|utf|(.)(?=.*\1)/gi, "");
		// hash = hash.substr(-4);
		// tabs[tab.id].h = hash;
	// }
// }
function HashTab(tab){
	if (tabs[tab.id] == undefined) {
		tabs[tab.id] = {h: 0, p: tab.pinned ? "pin_list" : "tab_list", n: tab.index, o: "n"};
	}
	var hash = 0;
	


	
	// if (tab.url.length === 0){
		// return 0;
	// }


	var u = tab.url.replace(/opera|chrome|vivaldi|http|https|www|com|html|jpg|gif|pdf|[<\>\+\-\(\)\.\,\;\:\~\/\|\?\@\!\"\'\£\$\%\&\^\#\=\*\[\]]?/gi, "");
	// u = u.replace(/\http|https|www|com|html|20|utf|/gi, "");


	for (var i = 0; i < u.length; i++){
	// for (var i = 0; i < tab.url.length; i++){
	// for (var i = 1; i < 5; i++){
		// hash = (hash << 8)-hash;
		// hash = hash << 8;
		// hash = hash+tab.url.charCodeAt(i);
		hash = hash+u.charCodeAt(i);
		
		
		
		// hash = hash+""+u.charCodeAt(u.length-i);
		
		
		// hash = hash.substring(0, 4);
		// hash |= 0;
	}
	// hash = hash.replace(/-/gi, "");
	
	// hash = hash.slice(0, -6);
	// console.log(hash);
	
	tabs[tab.id].h = hash;
	// tabs[tab.id].h = u;
}

// start all listeners
function StartChromeListeners() {
	chrome.tabs.onCreated.addListener(function(tab) {
		HashTab(tab); chrome.runtime.sendMessage({command: "tab_created", windowId: tab.windowId, tab: tab, tabId: tab.id}); schedule_save++;
	});
	chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
		chrome.tabs.get(tabId, function(tab) {if (tabs[tabId] == undefined) {HashTab(tab);} chrome.runtime.sendMessage({command: "tab_attached", windowId: attachInfo.newWindowId, tab: tab, tabId: tabId}); schedule_save++;});
	});
	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		chrome.runtime.sendMessage({command: "tab_removed", windowId: removeInfo.windowId, tabId: tabId}); delete tabs[tabId]; schedule_save++;
	});
	chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
		if (tabs[tabId] == undefined) {HashTab(tab);} chrome.runtime.sendMessage({command: "tab_removed", windowId: detachInfo.oldWindowId, tabId: tabId}); schedule_save++;
	});
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (tabs[tabId] == undefined || changeInfo.url != undefined) {HashTab(tab);} if (changeInfo.pinned != undefined) {tabs[tabId].p = (tab.pinned == true ? "pin_list" : "tab_list");}
		chrome.runtime.sendMessage({command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tabId, changeInfo: changeInfo}); if (changeInfo.url != undefined || changeInfo.pinned != undefined) {schedule_save++;}
	});
	chrome.tabs.onMoved.addListener(function(tabId, moveInfo) {
		if (tabs[tabId] == undefined) {HashTab(tab);} schedule_save++;
	});
	chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
		chrome.tabs.get(addedTabId, function(tab) {
			if (addedTabId == removedTabId) {
				chrome.runtime.sendMessage({command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tab.id, changeInfo: {status: tab.status, url: tab.url, title: tab.title, audible: tab.audible, mutedInfo: tab.mutedInfo}});
			} else {
				if (tabs[removedTabId]) {tabs[addedTabId] = tabs[removedTabId];} else {HashTab(tab);} chrome.runtime.sendMessage({command: "tab_removed", windowId: tab.windowId, tabId: removedTabId});
				chrome.runtime.sendMessage({command: "tab_attached", windowId: tab.windowId, tab: tab, tabId: addedTabId}); delete tabs[removedTabId];
			}
			schedule_save++;
		});
	});
	chrome.tabs.onActivated.addListener(function(activeInfo) {
		chrome.runtime.sendMessage({command: "tab_activated", windowId: activeInfo.windowId, tabId: activeInfo.tabId});
	});
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.command) {
		case "background_start":
			if (!started) {Start();}
		break;
		case "reload":
			window.location.reload();
		break;
		case "options_save":
			SaveOptions();
		break;
		case "groups_save":
			localStorage["groups"] = JSON.stringify(groups);
		break;
		case "toolbar_options_save":
			SaveToolbarOptions();
		break;
	}
});
function log(m) {
	console.log(m);
}
chrome.runtime.onStartup.addListener(function() {
	Start();
});

if (navigator.userAgent.match("Firefox") === null) {
	chrome.runtime.onSuspend.addListener(function() {
		hold = true;
	});
}

