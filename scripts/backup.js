// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function ExportGroup(filename) {
	let GroupToSave = [0,[]];
	GroupToSave[0] = bggroups[active_group];
	let lastId = parseInt($("#"+active_group+" .tab").last()[0].id);

	$("#"+active_group+" .tab").each(function() {
		chrome.tabs.get(parseInt(this.id), function(tab) {
			GroupToSave[1].push([tab.id, ($("#"+tab.id).parent(".group")[0] ? $("#"+tab.id).parent()[0].id : $("#"+tab.id).parent().parent(".tab")[0].id), $("#"+tab.id).index(), ($("#"+tab.id).is(".n") ? "n" : ($("#"+tab.id).is(".c") ? "c" : "o")), tab.url]);
			if (tab.id == lastId) {
				SaveFile(filename, GroupToSave);
			}
		});
	})
}

function ImportGroup() {
	let file = document.getElementById("file_import_group");
	let fr = new FileReader();
	if (file.files[0] == undefined) return;
	fr.readAsText(file.files[0]);
	fr.onload = function() {
		let data = fr.result;
		file.remove();
		let LoadedGroup = JSON.parse(data);
		let RefsTabs = {};
		let newTabs = {};
		let lastId = LoadedGroup[1][LoadedGroup[1].length-1][0];
		let NewGroupId = AddNewGroup({name: LoadedGroup[0].name, font: LoadedGroup[0].font});
		SetActiveGroup(NewGroupId, false, false);
		LoadedGroup[1].forEach(function(LTab){
			chrome.tabs.create({url: LTab[4]}, function(tab) {
				RefsTabs[LTab[0]] = tab.id;
				newTabs[tab.id] = {i: LTab[2]};
				if (LTab[0] == lastId) {
					setTimeout(function() {
						LoadedGroup[1].forEach(function(LTab){
							$("#"+NewGroupId).append($("#"+LTab[0]));
						});
					}, 2000);
					setTimeout(function() {
						LoadedGroup[1].forEach(function(LTab){
							if ($("#"+RefsTabs[LTab[1]])[0] && $("#"+LTab[0])[0]) {
								$("#ch"+RefsTabs[LTab[1]]).append($("#"+LTab[0]));
							}
						});
						LoadedGroup[1].forEach(function(LTab){
							$("#"+LTab[0]).addClass(LTab[3]);
						});
						chrome.tabs.query({currentWindow: true}, function(tabs) {
							RearrangeTreeTabs(tabs, newTabs, true);
							RefreshExpandStates();
							RefreshGUI();
						});
					}, 4000);
				}	
				LTab[0] = tab.id;
			});
		});
	}	 
}

function ExportTabs(filename) {
	chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {
		chrome.runtime.sendMessage({command: "get_browser_tabs"}, function(response) {
			let tabs = Object.assign({}, response);
			chrome.runtime.sendMessage({command: "get_windows"}, function(response) {
				let windows = Object.assign({}, response);
				let WindowsToSave = [];
				w.forEach(function(CWin){
					if (windows[CWin.id] != undefined && windows[CWin.id].group_bar != undefined && windows[CWin.id].active_shelf != undefined && windows[CWin.id].active_group != undefined && windows[CWin.id].groups != undefined && windows[CWin.id].folders != undefined) {
						WindowsToSave.push([[], CWin.id, CWin.tabs[0].url, CWin.tabs[CWin.tabs.length-1].url, windows[CWin.id].group_bar, windows[CWin.id].group_bar, windows[CWin.id].active_shelf, windows[CWin.id].active_group, windows[CWin.id].groups, windows[CWin.id].folders, 0]);
					}
				
					CWin.tabs.forEach(function(CTab){
						if (tabs[CTab.id] != undefined && tabs[CTab.id].parent != undefined && tabs[CTab.id].index != undefined && tabs[CTab.id].expand != undefined) {
							WindowsToSave[WindowsToSave.length-1][0].push([CTab.id, CTab.url, tabs[CTab.id].parent, tabs[CTab.id].index, tabs[CTab.id].expand]);
						}
					});
				});
				SaveFile(filename, WindowsToSave);
			});
		});
	});
}


function ImportTabs() {
	let file = document.getElementById("file_import_backup");
	let fr = new FileReader();
	if (file.files[0] == undefined) return;
	fr.readAsText(file.files[file.files.length-1]);
	fr.onload = function() {
		let data = fr.result;
		file.remove();
		chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {

			//make global variables
			LoadedWindows = JSON.parse(data);
			RefsTabs = {};
			TotalTabsCount = 0;
			
			LoadedWindows.forEach(function(LWin){
				TotalTabsCount += LWin[0].length;
			});

			LoadedWindows.forEach(function(LWin){
				chrome.windows.create({}, function(new_window) {
					LWin[1] = new_window.id;
					LWin[2] = "";
					LWin[3] = "";
				
					setTimeout(function() {
						chrome.runtime.sendMessage({command: "save_groups", groups: LWin[8], windowId: new_window.id});
					}, 1000);

					LWin[0].forEach(function(LTab){
						chrome.tabs.create({url: LTab[1], pinned: (LTab[2] == "pin_list" ? true : false), windowId: new_window.id}, function(tab) {
							RefsTabs[LTab[0]] = tab.id;
							LTab[0] = tab.id;
							LTab[1] = "";
							TotalTabsCount--;
							
							if (TotalTabsCount < 2) {
								setTimeout(function() {
									chrome.runtime.sendMessage({command: "get_windows"}, function(response) {
										let windows = Object.assign({}, response);

										LoadedWindows.forEach(function(LWin){
											LWin[0].forEach(function(LTab){
												schedule_update_data -= 2;
												chrome.runtime.sendMessage({command: "update_tab", tabId: LTab[0], tab: {parent: (RefsTabs[LTab[2]] ? RefsTabs[LTab[2]] : LTab[2]), index: LTab[3], expand: LTab[4]}});
											});				
										});				
										
										setTimeout(function() {
											chrome.runtime.sendMessage({command: "reload_sidebar"});
											location.reload();
										}, 3000);
									});
									chrome.tabs.remove(new_window.tabs[0].id, null);
								}, 1000);
							}							
						});
					});
				});
			});
		});
	}	 
}

function ImportMergeTabs() {
	let file = document.getElementById("file_import_merge_backup");
	let fr = new FileReader();
	if (file.files[0] == undefined) return;
	fr.readAsText(file.files[0]);
	fr.onload = function() {
		let data = fr.result;
		file.remove();
			
		//make global variables
		LoadedWindows = JSON.parse(data);
		RefsTabs = {};
		RefsWins = {};
		TotalTabsCount = 0;
		LoadedWindows.forEach(function(LWin){
			TotalTabsCount += LWin[0].length;
		});

		chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(w) {
			w.forEach(function(CWin){ // loop Current Windows (CWin)
				LoadedWindows.forEach(function(LWin){ // loop Loaded Windows (LWin)
					CWin.tabs.forEach(function(CTab){ // loop Tabs of each Current Window
						schedule_update_data -= 2;
						for (let LWinTabInd = 0; LWinTabInd < LWin[0].length; LWinTabInd++) { // loop Tabs of each Loaded Window
							if (CTab.url == LWin[0][LWinTabInd][1]) {
								// TabsMatched++;
								RefsTabs[LWin[0][LWinTabInd][0]] = CTab.id;
								LWin[0][LWinTabInd][0] = CTab.id;
								LWin[0][LWinTabInd][1] = "";
								LWin[10]++;
								TotalTabsCount--;
								break;
							}
						}
					});
					if (CWin.tabs[0].url == LWin[2] && CWin.tabs[CWin.tabs.length-1].url == LWin[3] && LWin[10] > LWin[0].length*0.5) {
						RefsWins[LWin[1]] = CWin.id;
						LWin[1] = CWin.id;
						LWin[2] = "";
						LWin[3] = "";
					}
				});
			});

			LoadedWindows.forEach(function(LWin){
				if (LWin[2] != "" && LWin[3] != "") { // missing window, lets make one
					chrome.windows.create({}, function(new_window) {
						RefsWins[LWin[1]] = new_window.id;
						LWin[1] = new_window.id;
					
						LWin[2] = "";
						LWin[3] = "";
					
						LWin[0].forEach(function(LTab){
							if (LTab[1] != "") { // missing tab of missing window, lets make one
								chrome.tabs.create({url: LTab[1], windowId: new_window.id}, function(tab) {
									
									// chrome.tabs.executeScript(tab.id, {code: "setTimeout(function() { window.stop(); }, 5000);", runAt: "document_start"}, function(){});
									
									RefsTabs[LTab[0]] = tab.id;
									LTab[0] = tab.id;
									LTab[1] = "";
									TotalTabsCount--;
								});
								
							}
						});
						chrome.tabs.remove(new_window.tabs[0].id, null);
					});
				} else {
					LWin[0].forEach(function(LTab){
						if (LTab[1] != "") { // missing tab, lets make one
							chrome.tabs.create({url: LTab[1], windowId: LWin[1]}, function(tab) {
								RefsTabs[LTab[0]] = tab.id;
								LTab[0] = tab.id;
								LTab[1] = "";
								TotalTabsCount--;
								
								if (TotalTabsCount < 2) {
									setTimeout(function() {
										chrome.runtime.sendMessage({command: "get_windows"}, function(response) {
											let windows = Object.assign({}, response);

											LoadedWindows.forEach(function(LWin){
												for (let lGroup in LWin[8]) {
													if (windows[LWin[1]] && windows[LWin[1]].groups[lGroup] == undefined) {
														windows[LWin[1]].groups[lGroup] = Object.assign({}, LWin[8][lGroup]);
														chrome.runtime.sendMessage({command: "save_groups", groups: windows[LWin[1]].groups, windowId: LWin[1]});
													}
												}
												
												LWin[0].forEach(function(LTab){
													schedule_update_data -= 2;
													chrome.runtime.sendMessage({command: "update_tab", tabId: LTab[0], tab: {parent: (RefsTabs[LTab[2]] ? RefsTabs[LTab[2]] : LTab[2]), index: LTab[3], expand: LTab[4]}});
												});
											});
											
											setTimeout(function() {
												chrome.runtime.sendMessage({command: "reload_sidebar"});
												location.reload();
											}, 1000);
										});
									}, 1000);
								}
							});
						}
					});
				}
			});
		});
	}	 
}