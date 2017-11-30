// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

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