// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


// sort tabs main function
function SortTabs(){
	if ($(".tab").find(":visible:first")[0]){
		chrome.tabs.query({windowId: vt.windowId}, function(tabs){
			tabs.sort(function(tab_a, tab_b){
				return SplitUrl(tab_a).localeCompare(     SplitUrl(tab_b)      );
			});
			var first_tabId;
			if ($(".selected:visible")[0]){
				first_tabId = parseInt($(".selected:visible")[0].id);
			} else {
				first_tabId = parseInt($(".tab").find(":visible:first")[0].parentNode.id);
			}
			chrome.tabs.get(first_tabId, function(tab){
				var new_index = tab.index;
				tabs.forEach(function(Tab){
					// sort selected when more than 1 tab is selected
					if (($(".selected:visible").length > 1 && $("#"+Tab.id).is(":visible") && !Tab.pinned && $("#"+Tab.id).is(".selected")) || ($(".selected:visible").length < 2 && $("#"+Tab.id).is(":visible") && !Tab.pinned)){
						chrome.tabs.move(Tab.id, {"index": new_index});
						new_index++;
					}
				});
			});
			if (bg.opt.scroll_to_active){
				setTimeout(function(){
					ScrollTabList($(".active:visible")[0].id);
				},1000);
			}
		}); 
	}
}

// sort tabs sub function
function SplitUrl(tab){
	var tmp_url = new URL(tab.url);
	if (tmp_url.protocol != "http:"){
		tmp_url.protocol == "http:";
	}
	var url_parts = [];
	if (tab.pinned){
		url_parts.push("#"+tab.index);
	} else {
		url_parts.push("~");
	}
	var parts = tmp_url.host.split(".");
	parts.reverse();
	if (parts.length > 1){
		parts = parts.slice(1);
	}
	parts.join(".");
	url_parts.push(parts);
	url_parts.push(tab.title.toLowerCase());
	return url_parts.join(" ! ");
}


// bookmark main function
function BookmarkTabs(tabs_array, FolderName){
	var rootId;
	var vertical_tabs_folderId;
	chrome.bookmarks.getRootByName("bookmarks_bar", function(tree){
		rootId = tree.id;
		chrome.bookmarks.search("VerticalTabs", function(list){
			for (var elem in list) {
				if (list[elem].parentId == rootId){
					vertical_tabs_folderId = list[elem].id;
					break;
				}
			}
			if (vertical_tabs_folderId == undefined){
				chrome.bookmarks.create({parentId: rootId, title: "VerticalTabs"}, function(vertical_tabs_new){
					vertical_tabs_folderId = vertical_tabs_new.id;
				});
			}
			chrome.bookmarks.search(FolderName, function(list){
				for (var elem in list) {
					if (list[elem].parentId == vertical_tabs_folderId){
						SlowlyBookmarkTabs(tabs_array, list[elem].id);
						return;
					}
				}
				chrome.bookmarks.create({parentId: vertical_tabs_folderId, title: FolderName}, function(active_group_folderId_new){
					SlowlyBookmarkTabs(tabs_array, active_group_folderId_new.id);
				});
			});
		});
	});
}

// bookmark sub function
function SlowlyBookmarkTabs(tabs_array, group_folderId){
	if (tabs_array.length > 0){
		chrome.tabs.get(tabs_array[0], function(tab){
			chrome.bookmarks.search({url: tab.url}, function(list){
				tabs_array.splice(0, 1);
				setTimeout(function(){
					SlowlyBookmarkTabs(tabs_array, group_folderId);
				},10);
				for (var elem in list){
					if (list[elem].parentId == group_folderId){
						bookmarkId = list[elem].id;
						return;
					}
				}
				chrome.bookmarks.create({parentId: group_folderId, title: tab.title, url: tab.url});
			});
		});
	}
}