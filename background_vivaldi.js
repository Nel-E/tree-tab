// VIVALDI
function VivaldiLegacyAddWindowData(win) {
    b.windows[win.id] = { activeTabId: 0, group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: { tab_list: { id: "tab_list", index: 0, active_tab: 0, prev_active_tab: 0, name: labels.ungrouped_group, font: "" } }, folders: {} };
}
function VivaldiLegacyHashURL(tab) {
    if (b.tabs[tab.id] == undefined) { b.tabs[tab.id] = { hash: 0, parent: tab.pinned ? "pin_list" : (b.windows[tab.windowId] ? b.windows[tab.windowId].active_group : "tab_list"), index: (Object.keys(b.tabs).length + 1), expand: "n" }; }
    let hash = 0;
    for (let charIndex = 0; charIndex < tab.url.length; charIndex++) {
        hash += tab.url.charCodeAt(charIndex);
    }
    b.tabs[tab.id].hash = hash;
}

function VivaldiStart() {
    chrome.windows.getAll({ windowTypes: ['normal'], populate: true }, function(w) {
        chrome.storage.local.get(null, function(storage) {
            // LOAD PREFERENCES
            Preferences_GetCurrentPreferences(storage);
            
            // LEGACY START TO CONVERT DATA
            if ((storage.data_version == undefined && storage.tabs != undefined) || storage.data_version < 2) {
                b.safe_mode = true;
                let refTabs = {};
                let refWins = {};
                let tabs_matched = 0;
                let LoadedWindows = storage.windows ? storage.windows : [];
                let LoadedTabs = storage.tabs ? storage.tabs : [];
                let CurrentTabsCount = 0;
                for (let win of w) {
                    CurrentTabsCount += win.tabs.length;
                }
                for (let win of w) {
                    let url1 = win.tabs[0].url;
                    let url2 = win.tabs[win.tabs.length - 1].url;
                    VivaldiLegacyAddWindowData(win);
                    if (opt.skip_load == false) {
                        for (let loadedWin of LoadedWindows) {
                            if ((loadedWin.url1 == url1 || loadedWin.url2 == url2) && refWins[loadedWin.id] == undefined) {
                                refWins[loadedWin.id] = win.id;
                                if (loadedWin.group_bar) b.windows[win.id].group_bar = loadedWin.group_bar;
                                if (loadedWin.search_filter) b.windows[win.id].search_filter = loadedWin.search_filter;
                                if (loadedWin.active_shelf) b.windows[win.id].active_shelf = loadedWin.active_shelf;
                                if (loadedWin.active_group) b.windows[win.id].active_group = loadedWin.active_group;
                                if (Object.keys(loadedWin.groups).length > 0) b.windows[win.id].groups = Object.assign({}, loadedWin.groups);
                                if (Object.keys(loadedWin.folders).length > 0) b.windows[win.id].folders = Object.assign({}, loadedWin.folders);
                                break;
                            }
                        }
                    }
                }
                for (let win of w) {
                    for (let tab of win.tabs) {
                        VivaldiLegacyHashURL(tab);
                        if (tab.active) b.windows[win.id].activeTabId = tab.id;
                    }
                }
                if (opt.skip_load == false && LoadedTabs.length > 0) {
                    for (let win of w) {
                        for (tab of win.tabs) {
                            for (let loadedTab of LoadedTabs) {
                                if (loadedTab.hash == b.tabs[tab.id].hash && refTabs[loadedTab.id] == undefined) {
                                    refTabs[loadedTab.id] = tab.id;
                                    if (loadedTab.parent) b.tabs[tab.id].parent = loadedTab.parent;
                                    if (loadedTab.index) b.tabs[tab.id].index = loadedTab.index;
                                    if (loadedTab.expand) b.tabs[tab.id].expand = loadedTab.expand;
                                    tabs_matched++;
                                    break;
                                }
                            }
                        }
                    }
                    for (let tabId in b.tabs) {
                        if (refTabs[b.tabs[tabId].parent] != undefined) b.tabs[tabId].parent = refTabs[b.tabs[tabId].parent];
                    }
                    for (let windowId in b.windows) {
                        for (let group in b.windows[windowId].groups) {
                            if (refTabs[b.windows[windowId].groups[group].active_tab]) b.windows[windowId].groups[group].active_tab = refTabs[b.windows[windowId].groups[group].active_tab];
                            if (refTabs[b.windows[windowId].groups[group].prev_active_tab]) b.windows[windowId].groups[group].prev_active_tab = refTabs[b.windows[windowId].groups[group].prev_active_tab];
                        }
                    }
                }
                for (let win of w) {
                    if (b.windows[win.id]) b.windows[win.id].ttid = JSON.parse(win.extData).ext_id;
                    for (let tab of win.tabs) {
                        if (b.tabs[tab.id]) b.tabs[tab.id].ttid = JSON.parse(tab.extData).ext_id;
                    }
                }
                let Windows = {};
                let Tabs = {};
                for (let win of w) {
                    if (b.windows[win.id] != undefined && b.windows[win.id].ttid != undefined && b.windows[win.id].group_bar != undefined && b.windows[win.id].search_filter != undefined && b.windows[win.id].active_shelf != undefined && b.windows[win.id].active_group != undefined && b.windows[win.id].groups != undefined && b.windows[win.id].folders != undefined) {
                        Windows[b.windows[win.id].ttid] = { ttid: b.windows[win.id].ttid, group_bar: b.windows[win.id].group_bar, search_filter: b.windows[win.id].search_filter, active_shelf: b.windows[win.id].active_shelf, active_group: b.windows[win.id].active_group, groups: b.windows[win.id].groups, folders: b.windows[win.id].folders };
                        for (let groupId in b.windows[win.id].groups) {
                            if (b.tabs[b.windows[win.id].groups[groupId].active_tab]) Windows[b.windows[win.id].ttid].groups[groupId].active_tab = b.tabs[b.windows[win.id].groups[groupId].active_tab].ttid;
                            if (b.tabs[b.windows[win.id].groups[groupId].prev_active_tab]) Windows[b.windows[win.id].ttid].groups[groupId].prev_active_tab = b.tabs[b.windows[win.id].groups[groupId].prev_active_tab].ttid;
                        }
                    }
                    for (let tab of win.tabs) {
                        if (b.tabs[tab.id] != undefined && b.tabs[tab.id].ttid != undefined && b.tabs[tab.id].parent != undefined && b.tabs[tab.id].index != undefined && b.tabs[tab.id].expand != undefined) {
                            Tabs[b.tabs[tab.id].ttid] = { ttid: b.tabs[tab.id].ttid, parent: (b.tabs[b.tabs[tab.id].parent] ? b.tabs[b.tabs[tab.id].parent].ttid : b.tabs[tab.id].parent), index: b.tabs[tab.id].index, expand: b.tabs[tab.id].expand };
                        }
                    }
                }
                chrome.storage.local.set({ data_version: 2, windows: Windows, tabs: Tabs });
                chrome.storage.local.remove("t_count");
                chrome.storage.local.remove("w_count");
                chrome.runtime.sendMessage({command: "reload_sidebar"});
                window.location.reload();
            }
            
            if (storage.data_version == undefined || storage.data_version == 2) {
                // load tabs and windows from storage
                let refTabs = {};
                let tabs_matched = 0;
                let LoadedWindows = storage.windows ? storage.windows : {};
                let LoadedTabs = storage.tabs ? storage.tabs : {};
                
                // load debug log
                if (opt.debug == true) {
                    if (storage.debug_log != undefined) b.debug = storage.debug_log;
                }
                
                // add data
                for (let win of w) {
                    VivaldiAddWindowData(win);
                    for (let tab of win.tabs) {
                        VivaldiAddTabData(tab);
                    }
                }
                
                // if not skipping loading data
                if (opt.skip_load == false) {
                    
                    for (let win of w) {
                        if (LoadedWindows[b.windows[win.id].ttid] != undefined) {
                            b.windows[win.id] = Object.assign({}, LoadedWindows[b.windows[win.id].ttid]);
                        }
                        for (let tab of win.tabs) {
                            if (LoadedTabs[b.tabs[tab.id].ttid] != undefined) {
                                b.tabs[tab.id] = Object.assign({}, LoadedTabs[b.tabs[tab.id].ttid]);
                                refTabs[b.tabs[tab.id].ttid] = tab.id;
                                tabs_matched++;
                            } else {
                                if (LoadedTabs["_"+tab.index+"_"+b.windows[win.id].ttid] != undefined) {
                                    b.tabs[tab.id] = Object.assign({}, LoadedTabs["_"+tab.index+"_"+b.windows[win.id].ttid]);
                                    refTabs["_"+tab.index+"_"+b.windows[win.id].ttid] = tab.id;
                                    tabs_matched++;
                                }
                            }
                            if (tab.active) b.windows[tab.windowId].activeTabId = tab.id;
                        }
                    }
                    
                    // replace ttids to browser tabIds for parents
                    for (let tabId in b.tabs) {
                        if (refTabs[b.tabs[tabId].parent] != undefined) {
                            b.tabs[tabId].parent = refTabs[b.tabs[tabId].parent];
                        }
                    }
                    
                    // replace ttids to browser tabIds, but of active tabs in groups
                    for (let winId in b.windows) {
                        for (let group in b.windows[winId].groups) {
                            if (refTabs[b.windows[winId].groups[group].active_tab] != undefined) {
                                b.windows[winId].groups[group].active_tab = refTabs[b.windows[winId].groups[group].active_tab];
                            }
                            if (refTabs[b.windows[winId].groups[group].prev_active_tab] != undefined) {
                                b.windows[winId].groups[group].prev_active_tab = refTabs[b.windows[winId].groups[group].prev_active_tab];
                            }
                        }
                    }

                    if (tabs_matched < LoadedTabs.length*0.5) {
                        b.safe_mode = true;
                        SafeModeCheck();
                        if (opt.debug) pushlog("started in safe mode");
                        if (storage.recovered_BAK) {
                                chrome.storage.local.set({ tabs: storage["tabs_BAK"+storage.recovered_BAK] });
                                chrome.storage.local.set({ windows: storage["windows_BAK"+storage.recovered_BAK] });
                            if (storage.recovered_BAK == 3) {
                                chrome.storage.local.remove("recovered_BAK");
                            } else {
                                chrome.storage.local.set({ recovered_BAK: (storage.recovered_BAK+1) });
                            }
                        } else {
                            chrome.storage.local.set({ recovered_BAK: 1 });
                        }
                    } else {
                        chrome.storage.local.remove("recovered_BAK");
                    }

                    if (opt.debug) pushlog("VivaldiStart, Current windows count is: " + w.length + "Saved windows count is: " + LoadedWindows.length + "Loaded tabs count is: " + LoadedTabs.length + "Matching tabs: " + tabs_matched);
            
                }
            }
            
            b.bg_running = true;
            VivaldiAutoSaveData(0, 1000);
            VivaldiAutoSaveData(1, 300000);
            VivaldiAutoSaveData(2, 600000);
            VivaldiAutoSaveData(3, 1800000);
            VivaldiStartListeners();
            delete DefaultToolbar;
            delete DefaultTheme;
            delete DefaultPreferences;
            delete DefaultMenu;
            chrome.runtime.sendMessage({ command: "bg_started" });
        });
    });
}

async function VivaldiAutoSaveData(BAK, LoopTimer) {
    setInterval(function() {
        if (b.schedule_save > 1 || BAK > 0) {
            b.schedule_save = 1;
        }
        if (b.bg_running && b.schedule_save > 0 && Object.keys(b.tabs).length > 1) {
            chrome.windows.getAll({ windowTypes: ['normal'], populate: true }, function(w) {
                let Windows = {};
                let Tabs = {};
                for (let win of w) {
                    if (b.windows[win.id] != undefined) {
                        if (b.windows[win.id].ttid != undefined && b.windows[win.id].group_bar != undefined && b.windows[win.id].search_filter != undefined && b.windows[win.id].active_shelf != undefined && b.windows[win.id].active_group != undefined && b.windows[win.id].groups != undefined && b.windows[win.id].folders != undefined) {
                            Windows[b.windows[win.id].ttid] = { ttid: b.windows[win.id].ttid, group_bar: b.windows[win.id].group_bar, search_filter: b.windows[win.id].search_filter, active_shelf: b.windows[win.id].active_shelf, active_group: b.windows[win.id].active_group, groups: b.windows[win.id].groups, folders: b.windows[win.id].folders };
                            for (let groupId in b.windows[win.id].groups) {
                                if (b.tabs[b.windows[win.id].groups[groupId].active_tab]) Windows[b.windows[win.id].ttid].groups[groupId].active_tab = b.tabs[b.windows[win.id].groups[groupId].active_tab].ttid;
                                if (b.tabs[b.windows[win.id].groups[groupId].prev_active_tab]) Windows[b.windows[win.id].ttid].groups[groupId].prev_active_tab = b.tabs[b.windows[win.id].groups[groupId].prev_active_tab].ttid;
                            }
                        }
                    } else {
                        VivaldiAddWindowData(win);
                        b.schedule_save++;
                    }
                    for (let tab of win.tabs) {
                        if (b.tabs[tab.id] != undefined) {
                            if (b.tabs[tab.id].ttid != undefined && b.tabs[tab.id].parent != undefined && b.tabs[tab.id].index != undefined && b.tabs[tab.id].expand != undefined) {
                                Tabs[b.tabs[tab.id].ttid] = { ttid: b.tabs[tab.id].ttid, parent: (b.tabs[b.tabs[tab.id].parent] ? b.tabs[b.tabs[tab.id].parent].ttid : b.tabs[tab.id].parent), index: b.tabs[tab.id].index, expand: b.tabs[tab.id].expand };
                            }
                        } else {
                            VivaldiAddTabData(tab);
                        }
                    }
                }
                chrome.storage.local.set((BAK == 0 ? { windows: Windows, tabs: Tabs } : (BAK == 1 ? { windows_BAK1: Windows, tabs_BAK1: Tabs } : (BAK == 2 ? { windows_BAK2: Windows, tabs_BAK2: Tabs } : { windows_BAK3: Windows, tabs_BAK3: Tabs }))));
                b.schedule_save--;
            });
        }
        if (opt.debug == true) chrome.storage.local.set({ debug_log: b.debug });
    }, LoopTimer);
}


function VivaldiAddWindowData(win) {
    let extData =  JSON.parse(win.extData);
    if (b.windows[win.id] == undefined) b.windows[win.id] = { ttid: (win.extData.match("ext_id") != null ? JSON.parse(win.extData).ext_id : win.index), activeTabId: 0, group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: { tab_list: { id: "tab_list", index: 0, active_tab: 0, prev_active_tab: 0, name: labels.ungrouped_group, font: "" } }, folders: {} };
    return b.windows[win.id].ttid;
}

function VivaldiAddTabData(tab) {
    if (b.tabs[tab.id] == undefined) {
        b.tabs[tab.id] = { ttid: "_", parent: tab.pinned ? "pin_list" : (b.windows[tab.windowId] ? b.windows[tab.windowId].active_group : "tab_list"), index: (Object.keys(b.tabs).length + 1), expand: "n" };
    }
    if (tab.extData.match("ext_id") != null) {
        b.tabs[tab.id].ttid = JSON.parse(tab.extData).ext_id;
        b.schedule_save++;
    } else {
        b.tabs[tab.id].ttid = "_"+tab.index+"_"+b.windows[tab.windowId].ttid;
        b.schedule_save++;
    }
    return b.tabs[tab.id].ttid;
}

function VivaldiStartListeners() { // start all listeners
    chrome.tabs.onCreated.addListener(function(tab) {
        // VivaldiAddWindowData(tab.windowId);
        // let extData = tab.extData.match("ext_id") != null ? JSON.parse(tab.extData).ext_id : false;
        // if (extData) {
            // for (let tabId in b.tabs) {
                // if (extData === b.tabs[tabId].ttid) {
                    // b.tabs[tab.id] = b.tabs[tabId];
                    // delete b.tabs[tabId];
                    // break;
                // }
            // }
        // }
        let prevActiveTabId = b.windows[tab.windowId].activeTabId;
        VivaldiAddTabData(tab);
        OnMessageTabCreated(tab, prevActiveTabId);
    });
    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
        let SiblingTabs = b.tabs[tabId] ? GetChildren(b.tabs, b.tabs[tabId].parent) : [];
        let SiblingFolders = b.tabs[tabId] ? GetChildren(b.windows[removeInfo.windowId].folders, b.tabs[tabId].parent) : [];
        UnshiftChildrenIndexes(SiblingTabs, b.tabs[tabId].index, SiblingFolders, removeInfo.windowId);
        if (b.EmptyTabs.indexOf(tabId) != -1) {
            b.EmptyTabs.splice(b.EmptyTabs.indexOf(tabId), 1);
        }
        setTimeout(function() { chrome.runtime.sendMessage({ command: "tab_removed", windowId: removeInfo.windowId, tabId: tabId }); }, 5);
        delete b.tabs[tabId];
        b.schedule_save++;
    });
    chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
        chrome.tabs.get(tabId, function(tab) {
            chrome.runtime.sendMessage({ command: "tab_attached", windowId: attachInfo.newWindowId, tab: tab, tabId: tabId, ParentId: b.tabs[tabId].parent });
        });
        b.schedule_save++;
    });
    chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
        chrome.runtime.sendMessage({ command: "tab_detached", windowId: detachInfo.oldWindowId, tabId: tabId });
        b.schedule_save++;
    });
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo.pinned != undefined) {
            if (changeInfo.pinned == true) {
                b.tabs[tabId].parent = "pin_list";
            }
            if (changeInfo.pinned == false) {
                b.tabs[tabId].parent = "tab_list";
            }
            b.schedule_save++;
        }
        if (changeInfo.url != undefined) { // if set to append when url changes and matches pre-set group
            if (tab.pinned == false) {
                if (opt.move_tabs_on_url_change == "always" || ((opt.move_tabs_on_url_change == "from_empty" || opt.move_tabs_on_url_change == "from_empty_b") && b.EmptyTabs.indexOf(tabId) != -1)) {
                    AppendTabToGroupOnRegexMatch(tabId, tab.windowId, changeInfo.url);
                }
            }
            if (changeInfo.url != b.newTabUrl && b.EmptyTabs.indexOf(tabId) != -1) {
                b.EmptyTabs.splice(b.EmptyTabs.indexOf(tabId), 1);
            }
        }
        if (changeInfo.title != undefined && !tab.active) {
            chrome.runtime.sendMessage({ command: "tab_attention", windowId: tab.windowId, tabId: tabId });
        }
        chrome.runtime.sendMessage({ command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tabId, changeInfo: changeInfo });
    });
    chrome.tabs.onMoved.addListener(function(tabId, moveInfo) {
        b.schedule_save++;
    });
    chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
        chrome.tabs.get(addedTabId, function(tab) {
            if (addedTabId == removedTabId) {
                chrome.runtime.sendMessage({ command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tab.id, changeInfo: { status: tab.status, url: tab.url, title: tab.title, audible: tab.audible, mutedInfo: tab.mutedInfo } });
            } else {
                ReplaceParents(tabId, tab.id);
                if (b.tabs[removedTabId]) {
                    b.tabs[addedTabId] = b.tabs[removedTabId];
                } else {
                    VivaldiAddTabData(tab);
                }
                chrome.runtime.sendMessage({ command: "tab_removed", windowId: tab.windowId, tabId: removedTabId });
                chrome.runtime.sendMessage({ command: "tab_attached", windowId: tab.windowId, tab: tab, tabId: addedTabId });
                delete b.tabs[removedTabId];
            }
            b.schedule_save++;
        });
    });
    chrome.tabs.onActivated.addListener(function(activeInfo) {
        if (b.windows[activeInfo.windowId]) {
            b.windows[activeInfo.windowId].activeTabId = activeInfo.tabId;
        }
        chrome.runtime.sendMessage({ command: "tab_activated", windowId: activeInfo.windowId, tabId: activeInfo.tabId });
        setTimeout(function() {chrome.tabs.query({windowId: activeInfo.windowId}, function(tabs) {for (let tab of tabs) {if ((b.tabs[tab.id].ttid).startsWith("_") || tab.id === activeInfo.tabId) VivaldiAddTabData(tab);}});}, 500);
        b.schedule_save++;
    });
    chrome.windows.onCreated.addListener(function(window) {
        VivaldiAddWindowData(window);
        b.schedule_save++;
    });
    chrome.windows.onRemoved.addListener(function(windowId) {
        delete b.windows[windowId];
        b.schedule_save++;
    });
    chrome.runtime.onSuspend.addListener(function() {
        b.bg_running = false;
    });
}

