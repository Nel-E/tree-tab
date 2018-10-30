// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// BACKGROUND VARIABLES
let b = {
    debug: [],
    running: false,
    schedule_save: -999,
    windows: {},
    tabs: {},
    tt_ids: {},
    EmptyTabs: [],
    newTabUrl: browserId == "F" ? "about:newtab" : "chrome://startpage/"
};

////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////    START BACKGROUND SCRIPT   /////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


document.addEventListener("DOMContentLoaded", function() {
    if (browserId == "F") {
        setTimeout(function() {
            StartBackgroundListeners();
            QuantumStart(0);
        }, 500);
    } else {
        StartBackgroundListeners();
        ChromiumLoadTabs(0);
    }
});

////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////    BACKGROUND FUNCTIONS    /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function pushlog(log) {
    b.debug.push(log);
    if (b.debug.length > 100) {
        b.debug.splice(0, 1);
    }
    console.log(log);
    b.schedule_save++;
}

function ReplaceParents(oldTabId, newTabId) {
    for (let tabId in b.tabs) {
        if (b.tabs[tabId].parent == oldTabId) {
            b.tabs[tabId].parent = newTabId;
        }
    }
}

async function DiscardTab(tabId) {
    let DiscardTimeout = 0;
    let Discard = setInterval(function() {
        chrome.tabs.get(tabId, function(tab) {
            if ((tab.favIconUrl != undefined && tab.favIconUrl != "" && tab.title != undefined && tab.title != "") || tab.status == "complete" || tab.audible) {
                chrome.tabs.discard(tab.id);
                clearInterval(Discard);
            }
            if (DiscardTimeout > 300) {
                clearInterval(Discard);
            }
        });
        DiscardTimeout++;
    }, 2000);
}

async function DiscardWindow(windowId) {
    let DiscardTimeout = 0;
    let DiscardedTabs = 0;
    let Discard = setInterval(function() {
        chrome.windows.get(windowId, { populate: true }, function(w) {
            for (let i = 0; i < w.tabs.length; i++) {
                if (w.tabs[i].discarded == false && w.tabs[i].active == false) {
                    if ((w.tabs[i].favIconUrl != undefined && w.tabs[i].favIconUrl != "" && w.tabs[i].title != undefined && w.tabs[i].title != "") || w.tabs[i].status == "complete" || tab.audible) {
                        chrome.tabs.discard(w.tabs[i].id);
                        DiscardedTabs++;
                    }
                }
            }
            if (DiscardedTabs == w.tabs.length) {
                clearInterval(Discard);
            }
        });
        if (DiscardTimeout > 300) {
            clearInterval(Discard);
        }
        DiscardTimeout++;
    }, 5000);
}

function GetTabGroupId(tabId, windowId) {
    let groupId = "tab_list";
    if (tabId == undefined || windowId == undefined || b.windows[windowId] == undefined || b.tabs[tabId] == undefined) {
        return groupId;
    }
    let parent = b.tabs[tabId].parent;
    while (parent) {
        if (isNaN(parent) == false && b.tabs[parent]) {
            parent = b.tabs[parent].parent;
        } else {
            if (parent.match("tab_list|g_|f_") == null && b.tabs[parent]) {
                parent = b.tabs[parent].parent;
            } else {
                if (parent.match("f_") != null && b.windows[windowId].folders[parent]) {
                    parent = b.windows[windowId].folders[parent].parent;
                } else {
                    if (parent.match("pin_list|tab_list|g_") != null) {
                        groupId = parent;
                        parent = false;
                    } else {
                        parent = false;
                    }
                }
            }
        }
    }
    return groupId;
}

function GetTabParents(tabId, windowId) {
    let Parents = [];
    if (tabId == undefined) {
        return Parents;
    }
    if (b.tabs[tabId] == undefined) {
        return Parents;
    }
    let parent = b.tabs[tabId].parent;
    let escape = 9999;
    while (escape > 0 && (b.tabs[parent] != undefined || b.windows[windowId].folders[parent])) {
        if (b.tabs[parent]) {
            Parents.push(parent);
            parent = b.tabs[parent].parent;
        } else {
            if (b.windows[windowId].folders[parent]) {
                Parents.push(parent);
                parent = b.windows[windowId].folders[parent].parent;
            }
        }
        escape--;
    }
    return Parents;
}

function GetChildren(TTObj, parentId) { // TTObj is b.tabs or b.windows[winId].folders
    let Children = [];
    for (let Id in TTObj) {
        if (TTObj[Id].parent == parentId) {
            // Children.push(parseInt(Id));
            Children.push(Id);
        }
    }
    // for (let i = 0; i < Children.length-1; i++) {
    // for (let j = i+1; j < Children.length; j++) {
    // if (TTObj[Children[i]].index > TTObj[Children[j]].index) {
    // let swap = Children[i];
    // Children[i] = Children[j];
    // Children[j] = swap;
    // }
    // }
    // }
    return Children;
}

function ShiftChildrenIndexes(TabsIdsArray, OpenerIndex, folderIdsArray, windowId) {
    for (let i = 0; i < TabsIdsArray.length; i++) { // shift indexes of siblings tabs
        if (b.tabs[TabsIdsArray[i]].index > OpenerIndex) {
            b.tabs[TabsIdsArray[i]].index += 1;
        }
    }
    for (let i = 0; i < folderIdsArray.length; i++) { // shift indexes of siblings folders
        if (b.windows[windowId].folders[folderIdsArray[i]].index > OpenerIndex) {
            b.windows[windowId].folders[folderIdsArray[i]].index += 1;
        }
    }
}

function UnshiftChildrenIndexes(TabsIdsArray, ClosedIndex, folderIdsArray, windowId) {
    for (let i = 0; i < TabsIdsArray.length; i++) { // shift indexes of siblings tabs
        if (b.tabs[TabsIdsArray[i]].index > ClosedIndex) {
            b.tabs[TabsIdsArray[i]].index -= 1;
        }
    }
    for (let i = 0; i < folderIdsArray.length; i++) { // shift indexes of siblings folders
        if (b.windows[windowId].folders[folderIdsArray[i]].index > ClosedIndex) {
            b.windows[windowId].folders[folderIdsArray[i]].index -= 1;
        }
    }
}

function AppendTabToGroupOnRegexMatch(tabId, windowId, url) {
    let TabGroupId = GetTabGroupId(tabId, windowId);
    for (let i = 0; i < opt.tab_group_regexes.length; i++) {
        let regexPair = opt.tab_group_regexes[i];
        if (url.match(regexPair[0])) {
            let groupId = FindGroupIdByName(regexPair[1], b.windows[windowId].groups);
            let groupName = regexPair[1];
            if (groupId === null) { // no group
                let newGroupID = "";
                while (newGroupID == "") {
                    newGroupID = "g_" + GenerateRandomID();
                    for (let wId in b.windows) {
                        for (let gId in b.windows[wId].groups) {
                            if (gId == newGroupID) {
                                newGroupID = "";
                            }
                        }
                    }
                }
                groupId = newGroupID;
                b.windows[windowId].groups[groupId] = { id: groupId, index: 999, active_tab: 0, prev_active_tab: 0, name: groupName, font: "" };
                chrome.runtime.sendMessage({ command: "append_group", groupId: groupId, group_name: groupName, font_color: "", windowId: windowId });
            }
            if (TabGroupId != groupId && groupId != null) {
                b.tabs[tabId].parent = groupId;
                setTimeout(function() {
                    chrome.runtime.sendMessage({ command: "append_tab_to_group", tabId: tabId, groupId: groupId, windowId: windowId });
                }, 100);
            }
            break;
        }
    }
    return b.tabs[tabId].parent;
}

function FindGroupIdByName(name, groups) {
    for (let groupId in groups) {
        if (!groups.hasOwnProperty(groupId)) {
            continue;
        }
        if (groups[groupId].name === name) {
            return groupId;
        }
    }
    return null;
}

////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////    QUANTUM    //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////


function QuantumStart(retry) {
    chrome.windows.getAll({ windowTypes: ["normal"], populate: true }, function(w) {
        if (w[0].tabs.length == 1 && (w[0].tabs[0].url == "about:blank" || w[0].tabs[0].url == "about:sessionrestore")) {
            setTimeout(function() {
                QuantumStart(retry + 1);
            }, 2000);
        } else {
            QuantumLoadTabs(0);
            if (retry > 0) {
                chrome.runtime.sendMessage({ command: "reload_sidebar" });
            }
            setTimeout(function() {
                b.schedule_save = 0;
            }, 2000);
        }
    });
}

function QuantumLoadTabs(retry) {
    chrome.tabs.query({}, function(all_tabs) {
        
        for (let all_tabs_index = 0; all_tabs_index < all_tabs.length; all_tabs_index++) {
            Promise.resolve(browser.sessions.getWindowValue(all_tabs[all_tabs_index].id, "TTdata")).then(function(TData) {
                b.tt_ids[TData.ttid] = tabId;
            });
        }
        chrome.windows.getAll({ windowTypes: ["normal"], populate: true }, function(w) {
            chrome.storage.local.get(null, function(storage) {
                // LOAD PREFERENCES
                GetCurrentPreferences(storage);

                // CACHED COUNTS AND STUFF
                let tabs_matched = 0;
                let tabs_count = 0;
                for (let wIndex = 0; wIndex < w.length; wIndex++) {
                    tabs_count += w[wIndex].tabs.length;
                }
                let lastWinId = w[w.length - 1].id;
                let lastTabId = w[w.length - 1].tabs[w[w.length - 1].tabs.length - 1].id;
                let WinCount = w.length;

                if (opt.debug == true) {
                    if (storage.debug_log != undefined) {
                        b.debug = storage.debug_log;
                    }
                    if (retry == 0) {
                        pushlog("TreeTabs background start");
                    }
                }

                for (let wIndex = 0; wIndex < WinCount; wIndex++) {
                    let winIndex = wIndex;
                    let winId = w[winIndex].id;
                    let tabsCount = w[winIndex].tabs.length;

                    // LOAD TTID FROM FIREFOX GET WINDOW VALUE
                    let win = Promise.resolve(browser.sessions.getWindowValue(winId, "TTdata")).then(function(WindowData) {
                        if (opt.skip_load == false && WindowData != undefined) {
                            b.windows[winId] = Object.assign({}, WindowData);
                        } else {
                            QuantumAppendWinTTId(winId);
                        }

                        for (let tIndex = 0; tIndex < tabsCount; tIndex++) {
                            let tab = w[winIndex].tabs[tIndex];
                            let tabIndex = tIndex;
                            let tabId = w[winIndex].tabs[tabIndex].id;
                            let tabPinned = w[winIndex].tabs[tabIndex].pinned;

                            if (tab.active) {
                                b.windows[winId].activeTabId = tabId;
                            }

                            // LOAD TTID FROM FIREFOX GET TAB VALUE
                            let tt_tab = Promise.resolve(browser.sessions.getTabValue(tabId, "TTdata")).then(function(TabData) {
                                if (opt.skip_load == false && TabData != undefined) {
                                    b.tabs[tabId] = Object.assign({}, TabData);
                                    tabs_matched++;

                                    if (TabData.parent_ttid != undefined && TabData.parent_ttid != "") { // legacy
                                        b.tabs[tabId].parent = TabData.parent_ttid; // legacy
                                        delete b.tabs[tabId].parent_ttid; // legacy
                                    } // legacy

                                } else {
                                    QuantumAppendTabTTId(tab);
                                }
                                // IF ON LAST TAB AND LAST WINDOW, START MATCHING LOADED DATA
                                if (tabId == lastTabId && winId == lastWinId) {

                                    // OK, DONE, NOW REPLACE OLD PARENTS IDS WITH THIS SESSION IDS
                                    for (let ThisSessonTabId in b.tabs) {
                                        if (b.tt_ids[b.tabs[ThisSessonTabId].parent] != undefined) {
                                            b.tabs[ThisSessonTabId].parent = b.tt_ids[b.tabs[ThisSessonTabId].parent]; // is tab
                                        } else {
                                            b.tabs[ThisSessonTabId].parent = b.tabs[ThisSessonTabId].parent; // is not tab
                                        }
                                    }

                                    // OK, SAME THING FOR ACTIVE TABS IN GROUPS
                                    for (let ThisSessonWinId in b.windows) {
                                        for (let group in b.windows[ThisSessonWinId].groups) {
                                            if (b.tt_ids[b.windows[ThisSessonWinId].groups[group].active_tab] != undefined) {
                                                b.windows[ThisSessonWinId].groups[group].active_tab = b.tt_ids[b.windows[ThisSessonWinId].groups[group].active_tab];
                                            }
                                            if (b.tt_ids[b.windows[ThisSessonWinId].groups[group].prev_active_tab] != undefined) {
                                                b.windows[ThisSessonWinId].groups[group].prev_active_tab = b.tt_ids[b.windows[ThisSessonWinId].groups[group].prev_active_tab];
                                            }
                                        }
                                    }

                                    if (opt.debug) { pushlog("QuantumLoadTabs, retry: " + retry);
                                        pushlog("Current windows count is: " + w.length);
                                        pushlog("Current tabs count is: " + tabs_count);
                                        pushlog("Matching tabs: " + tabs_matched);
                                        pushlog("Current windows:");
                                        pushlog(w); }

                                    // will try to find tabs for 3 times
                                    if (opt.skip_load == true || retry > 2 || (tabs_matched > tabs_count * 0.5)) {
                                        b.running = true;
                                        QuantumAutoSaveData();
                                        QuantumStartListeners();
                                        delete DefaultToolbar;
                                        delete DefaultTheme;
                                        delete DefaultPreferences;
                                        delete DefaultMenu;
                                    } else {
                                        if (opt.debug) {
                                            pushlog("Attempt " + retry + " failed, matched tabs was below 50%");
                                        }
                                        setTimeout(function() {
                                            QuantumLoadTabs(retry + 1);
                                        }, 2000);
                                    }
                                }
                            });
                        }
                    });
                }
            });
        });
    });
}

// save every second if there is anything to save obviously
async function QuantumAutoSaveData() {
    setInterval(function() {
        if (b.schedule_save > 1) {
            b.schedule_save = 1;
        }
        if (b.running && b.schedule_save > 0 && Object.keys(b.tabs).length > 1) {
            chrome.windows.getAll({ windowTypes: ['normal'], populate: true }, function(w) {
                let WinCount = w.length;
                for (let wIndex = 0; wIndex < WinCount; wIndex++) {
                    let winId = w[wIndex].id;
                    if (b.windows[winId] != undefined && b.windows[winId].ttid != undefined && b.windows[winId].group_bar != undefined && b.windows[winId].search_filter != undefined && b.windows[winId].active_shelf != undefined && b.windows[winId].active_group != undefined && b.windows[winId].groups != undefined && b.windows[winId].folders != undefined) {
                        let windowData = Object.assign({}, b.windows[winId]);
                        for (let groupId in b.windows[winId].groups) {
                            if (b.tabs[b.windows[winId].groups[groupId].active_tab]) {
                                windowData.groups[groupId].active_tab = b.tabs[b.windows[winId].groups[groupId].active_tab].ttid;
                            }
                            if (b.tabs[b.windows[winId].groups[groupId].prev_active_tab]) {
                                windowData.groups[groupId].prev_active_tab = b.tabs[b.windows[winId].groups[groupId].prev_active_tab].ttid;
                            }
                        }
                        // browser.sessions.setWindowValue(winId, "TTdata", b.windows[winId]);
                        browser.sessions.setWindowValue(winId, "TTdata", windowData);
                   }
                    let TabsCount = w[wIndex].tabs.length;
                    for (let tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
                        let tabId = w[wIndex].tabs[tabIndex].id;
                        if (b.tabs[tabId] != undefined && b.tabs[tabId].ttid != undefined && b.tabs[tabId].parent != undefined && b.tabs[tabId].index != undefined && b.tabs[tabId].expand != undefined) {
                            browser.sessions.setTabValue(tabId, "TTdata", { ttid: b.tabs[tabId].ttid, parent: (b.tabs[b.tabs[tabId].parent] ? b.tabs[b.tabs[tabId].parent].ttid : b.tabs[tabId].parent), index: b.tabs[tabId].index, expand: b.tabs[tabId].expand });
                        }
                    }
                }
                b.schedule_save--;
            });
        }
        if (opt.debug == true) { chrome.storage.local.set({ debug_log: b.debug }); }
    }, 1000);
}

function QuantumGenerateNewWindowID() {
    let newID = "";
    while (newID == "") {
        newID = "w_" + GenerateRandomID();
        for (let wId in b.windows) {
            if (wId == newID) {
                newID = "";
            }
        }
    }
    return newID;
}

function QuantumGenerateNewTabID() {
    let newID = "";
    while (newID == "") {
        newID = "t_" + GenerateRandomID();
        for (let tId in b.tabs) {
            if (tId == newID) {
                newID = "";
            }
        }
    }
    return newID;
}

function QuantumAppendTabTTId(tab) {
    let NewTTTabId = QuantumGenerateNewTabID();
    if (b.tabs[tab.id] != undefined) {
        b.tabs[tab.id].ttid = NewTTTabId;
    } else {
        b.tabs[tab.id] = { ttid: NewTTTabId, parent: (b.windows[tab.windowId] ? b.windows[tab.windowId].active_group : "tab_list"), index: tab.index, expand: "" };
    }
    b.tt_ids[NewTTTabId] = tab.id;
    return NewTTTabId;
}

function QuantumAppendWinTTId(windowId) {
    let NewTTWindowId = QuantumGenerateNewWindowID();
    if (b.windows[windowId] != undefined) {
        b.windows[windowId].ttid = NewTTWindowId;
    } else {
        b.windows[windowId] = { activeTabId: 0, ttid: NewTTWindowId, group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: { tab_list: { id: "tab_list", index: 0, active_tab: 0, prev_active_tab: 0, name: labels.ungrouped_group, font: "" } }, folders: {} };
    }
}

// function GetTabIdFromTTid(ttid) {
// for (let tabId in b.tabs) {
// if (b.tabs[tabId].ttid == ttid) {
// return tabId;
// }
// }
// }



////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////    CHROMIUM    /////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function ChromiumLoadTabs(retry) {
    chrome.windows.getAll({ windowTypes: ['normal'], populate: true }, function(w) {
        chrome.storage.local.get(null, function(storage) {
            // LOAD PREFERENCES
            GetCurrentPreferences(storage);

            // load tabs and windows from storage
            let refTabs = {};
            let tabs_matched = 0;
            let w_count = storage.w_count ? storage.w_count : 0;
            let t_count = storage.t_count ? storage.t_count : 0;
            let LoadedWindows = storage.windows ? storage.windows : [];
            let LoadedTabs = storage.tabs ? storage.tabs : [];
            let CurrentTabsCount = 0;
            for (let wIndex = 0; wIndex < w.length; wIndex++) {
                CurrentTabsCount += w[wIndex].tabs.length;
            }

            let bak = (1 + retry) <= 3 ? (1 + retry) : 3;

            if (opt.skip_load == false) {
                // if loaded tabs mismatch by 50%, then try to load back
                if (LoadedTabs.length < t_count * 0.5) {
                    LoadedTabs = storage["tabs_BAK" + bak] ? storage["tabs_BAK" + bak] : [];
                }
                // if loaded windows mismatch, then try to load back
                if (LoadedWindows.length < w_count) {
                    LoadedWindows = storage["windows_BAK" + bak] ? storage["windows_BAK" + bak] : [];
                }
            } else {
                tabs_matched = CurrentTabsCount;
            }

            if (opt.debug == true) {
                if (storage.debug_log != undefined) {
                    b.debug = storage.debug_log;
                }
                if (retry == 0) {
                    pushlog("TreeTabs background start");
                }
            }

            // CACHED COUNTS
            let WinCount = w.length;
            let LoadedWinCount = LoadedWindows.length;
            let LoadedTabsCount = LoadedTabs.length;

            for (let wIndex = 0; wIndex < WinCount; wIndex++) {
                if (w[wIndex].tabs[0].url != "chrome://videopopout/") { // this is for opera for their extra video popup, which is weirdly queried as a "normal" window
                    let winId = w[wIndex].id;
                    let url1 = w[wIndex].tabs[0].url;
                    let url2 = w[wIndex].tabs[w[wIndex].tabs.length - 1].url;
                    ChromiumAddWindowData(winId);

                    if (opt.skip_load == false) {
                        for (let LwIndex = 0; LwIndex < LoadedWinCount; LwIndex++) {
                            if (LoadedWindows[LwIndex].url1 == url1 || LoadedWindows[LwIndex].url2 == url2) {
                                if (LoadedWindows[LwIndex].group_bar) { b.windows[winId].group_bar = LoadedWindows[LwIndex].group_bar; }
                                if (LoadedWindows[LwIndex].search_filter) { b.windows[winId].search_filter = LoadedWindows[LwIndex].search_filter; }
                                if (LoadedWindows[LwIndex].active_shelf) { b.windows[winId].active_shelf = LoadedWindows[LwIndex].active_shelf; }
                                if (LoadedWindows[LwIndex].active_group) { b.windows[winId].active_group = LoadedWindows[LwIndex].active_group; }
                                if (Object.keys(LoadedWindows[LwIndex].groups).length > 0) { b.windows[winId].groups = Object.assign({}, LoadedWindows[LwIndex].groups); }
                                if (Object.keys(LoadedWindows[LwIndex].folders).length > 0) { b.windows[winId].folders = Object.assign({}, LoadedWindows[LwIndex].folders); }
                                LoadedWindows[LwIndex].url1 = "";
                                LoadedWindows[LwIndex].url2 = "";
                                break;
                            }
                        }
                    }
                }
            }

            // add new hashes for current tabs
            for (let wIndex = 0; wIndex < WinCount; wIndex++) {
                let TabsCount = w[wIndex].tabs.length;
                for (let tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
                    ChromiumHashURL(w[wIndex].tabs[tabIndex]);

                    if (w[wIndex].tabs[tabIndex].active) {
                        b.windows[w[wIndex].id].activeTabId = w[wIndex].tabs[tabIndex].id;
                    }

                }
            }

            // compare saved tabs from storage to current session tabs, but can be skipped if set in options
            if (opt.skip_load == false && LoadedTabs.length > 0) {
                for (let wIndex = 0; wIndex < WinCount; wIndex++) {
                    let TabsCount = w[wIndex].tabs.length;
                    for (let tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
                        for (let LtabIndex = 0; LtabIndex < LoadedTabsCount; LtabIndex++) {
                            let tabId = w[wIndex].tabs[tabIndex].id;
                            if (LoadedTabs[LtabIndex].hash == b.tabs[tabId].hash && refTabs[LoadedTabs[LtabIndex].id] == undefined) {
                                refTabs[LoadedTabs[LtabIndex].id] = tabId;
                                if (LoadedTabs[LtabIndex].parent) { b.tabs[tabId].parent = LoadedTabs[LtabIndex].parent; }
                                if (LoadedTabs[LtabIndex].index) { b.tabs[tabId].index = LoadedTabs[LtabIndex].index; }
                                if (LoadedTabs[LtabIndex].expand) { b.tabs[tabId].expand = LoadedTabs[LtabIndex].expand; }
                                LoadedTabs[LtabIndex].hash = undefined;
                                tabs_matched++;
                                break;
                            }
                        }
                    }
                }
                // replace parents tabIds for new ones, for that purpose refTabs was made before
                for (let tabId in b.tabs) {
                    if (refTabs[b.tabs[tabId].parent] != undefined) {
                        b.tabs[tabId].parent = refTabs[b.tabs[tabId].parent];
                    }
                }
                // replace active tab ids for each group using refTabs
                for (let windowId in b.windows) {
                    for (let group in b.windows[windowId].groups) {
                        if (refTabs[b.windows[windowId].groups[group].active_tab]) {
                            b.windows[windowId].groups[group].active_tab = refTabs[b.windows[windowId].groups[group].active_tab];
                        }
                        if (refTabs[b.windows[windowId].groups[group].prev_active_tab]) {
                            b.windows[windowId].groups[group].prev_active_tab = refTabs[b.windows[windowId].groups[group].prev_active_tab];
                        }
                    }
                }
            }

            if (opt.debug) {
                pushlog("ChromiumLoadTabs, retry: " + retry);
                pushlog("Current windows count is: " + w.length);
                pushlog("Saved windows count is: " + LoadedWindows.length);
                pushlog("Current tabs count is: " + CurrentTabsCount);
                pushlog("Loaded tabs count is: " + LoadedTabsCount);
                pushlog("Matching tabs: " + tabs_matched);
                pushlog("Current windows:");
                pushlog(w);
            }

            // will loop trying to find tabs
            if (opt.skip_load || retry >= 5 || (tabs_matched > t_count * 0.5)) {
                b.running = true;
                ChromiumAutoSaveData(0, 1000);
                ChromiumAutoSaveData(1, 300000);
                ChromiumAutoSaveData(2, 600000);
                ChromiumAutoSaveData(3, 1800000);
                ChromiumStartListeners();
                delete DefaultToolbar;
                delete DefaultTheme;
                delete DefaultPreferences;
                delete DefaultMenu;
                b.schedule_save = -1; // 2 operations must be made to start saving data
            } else {
                if (opt.debug) {
                    pushlog("Attempt " + retry + " failed, matched tabs was below 50%");
                }
                setTimeout(function() {
                    ChromiumLoadTabs(retry + 1);
                }, 5000);
            }
        });
    });
}

async function ChromiumAutoSaveData(BAK, LoopTimer) {
    setInterval(function() {
        if (b.schedule_save > 1 || BAK > 0) {
            b.schedule_save = 1;
        }
        if (b.running && b.schedule_save > 0 && Object.keys(b.tabs).length > 1) {
            chrome.windows.getAll({ windowTypes: ['normal'], populate: true }, function(w) {
                let WinCount = w.length;
                let t_count = 0;
                let counter = 0;
                let Windows = [];
                let Tabs = [];
                for (let wIndex = 0; wIndex < WinCount; wIndex++) {
                    t_count += w[wIndex].tabs.length;
                }
                for (let wIndex = 0; wIndex < WinCount; wIndex++) {
                    let winId = w[wIndex].id;
                    if (b.windows[winId] != undefined && b.windows[winId].group_bar != undefined && b.windows[winId].search_filter != undefined && b.windows[winId].active_shelf != undefined && b.windows[winId].active_group != undefined && b.windows[winId].groups != undefined && b.windows[winId].folders != undefined) {
                        Windows.push({ url1: w[wIndex].tabs[0].url, url2: w[wIndex].tabs[w[wIndex].tabs.length - 1].url, group_bar: b.windows[winId].group_bar, search_filter: b.windows[winId].search_filter, active_shelf: b.windows[winId].active_shelf, active_group: b.windows[winId].active_group, groups: b.windows[winId].groups, folders: b.windows[winId].folders });
                    }
                    let TabsCount = w[wIndex].tabs.length;
                    for (let tabIndex = 0; tabIndex < TabsCount; tabIndex++) {
                        let tabId = w[wIndex].tabs[tabIndex].id;
                        if (b.tabs[tabId] != undefined && b.tabs[tabId].hash != undefined && b.tabs[tabId].parent != undefined && b.tabs[tabId].index != undefined && b.tabs[tabId].expand != undefined) {
                            Tabs.push({ id: tabId, hash: b.tabs[tabId].hash, parent: b.tabs[tabId].parent, index: b.tabs[tabId].index, expand: b.tabs[tabId].expand });
                            counter++;
                        }
                    }
                    if (counter == t_count) {
                        chrome.storage.local.set({ t_count: t_count });
                        chrome.storage.local.set({ w_count: WinCount });
                        if (BAK == 0) { chrome.storage.local.set({ windows: Windows });
                            chrome.storage.local.set({ tabs: Tabs }); }
                        if (BAK == 1) { chrome.storage.local.set({ windows_BAK1: Windows });
                            chrome.storage.local.set({ tabs_BAK1: Tabs });
                            chrome.runtime.sendMessage({ command: "backup_available", bak: 1 }); }
                        if (BAK == 2) { chrome.storage.local.set({ windows_BAK2: Windows });
                            chrome.storage.local.set({ tabs_BAK2: Tabs });
                            chrome.runtime.sendMessage({ command: "backup_available", bak: 2 }); }
                        if (BAK == 3) { chrome.storage.local.set({ windows_BAK3: Windows });
                            chrome.storage.local.set({ tabs_BAK3: Tabs });
                            chrome.runtime.sendMessage({ command: "backup_available", bak: 3 }); }
                    }
                }
                b.schedule_save--;
            });
        }
        if (opt.debug == true) { chrome.storage.local.set({ debug_log: b.debug }); }
    }, LoopTimer);
}

function ChromiumAddWindowData(winId) {
    b.windows[winId] = { activeTabId: 0, group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: { tab_list: { id: "tab_list", index: 0, active_tab: 0, prev_active_tab: 0, name: labels.ungrouped_group, font: "" } }, folders: {} };
}

function ChromiumHashURL(tab) {
    if (b.tabs[tab.id] == undefined) { b.tabs[tab.id] = { hash: 0, parent: tab.pinned ? "pin_list" : (b.windows[tab.windowId] ? b.windows[tab.windowId].active_group : "tab_list"), index: (Object.keys(b.tabs).length + 1), expand: "n" }; }
    let hash = 0;
    for (let charIndex = 0; charIndex < tab.url.length; charIndex++) {
        hash += tab.url.charCodeAt(charIndex);
    }
    b.tabs[tab.id].hash = hash;
}

////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////      LISTENERS   ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function StartBackgroundListeners() {
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.command == "reload") {
            window.location.reload();
            return;
        }
        if (message.command == "reload_options") {
            opt = Object.assign({}, message.opt);
            return;
        }
        if (message.command == "get_windows") {
            sendResponse(b.windows);
            return;
        }
        if (message.command == "get_folders") {
            if (b.windows[message.windowId]) {
                sendResponse(b.windows[message.windowId].folders);
            }
            return;
        }
        if (message.command == "save_folders") {
            if (b.windows[message.windowId]) {
                b.windows[message.windowId].folders = Object.assign({}, message.folders);
                b.schedule_save++;
            }
            return;
        }
        if (message.command == "get_groups") {
            if (b.windows[message.windowId]) {
                sendResponse(b.windows[message.windowId].groups);
            }
            return;
        }
        // if (message.command == "save_groups" && browserId == "F") {
            // if (b.windows[message.windowId]) {
                // b.windows[message.windowId].groups = Object.assign({}, message.groups);
                // for (let group in b.windows[message.windowId].groups) {
                    // if (b.tabs[b.windows[message.windowId].groups[group].active_tab]) {
                        // b.windows[message.windowId].groups[group].active_tab_ttid = b.tabs[b.windows[message.windowId].groups[group].active_tab].ttid;
                    // }
                    // if (b.tabs[b.windows[message.windowId].groups[group].prev_active_tab]) {
                        // b.windows[message.windowId].groups[group].prev_active_tab_ttid = b.tabs[b.windows[message.windowId].groups[group].prev_active_tab].ttid;
                    // }
                // }
                // b.schedule_save++;
            // }
            // return;
        // }
        // if (message.command == "save_groups" && browserId != "F") {
        if (message.command == "save_groups") {
            if (b.windows[message.windowId]) {
                b.windows[message.windowId].groups = Object.assign({}, message.groups);
                b.schedule_save++;
            }
            return;
        }
        if (message.command == "set_active_group") {
            if (b.windows[message.windowId]) {
                b.windows[message.windowId].active_group = message.active_group;
                b.schedule_save++;
            }
            return;
        }
        if (message.command == "get_active_group") {
            if (b.windows[message.windowId]) {
                sendResponse(b.windows[message.windowId].active_group);
            }
            return;
        }
        if (message.command == "set_search_filter") {
            if (b.windows[message.windowId]) {
                b.windows[message.windowId].search_filter = message.search_filter;
                b.schedule_save++;
            }
            return;
        }
        if (message.command == "get_search_filter") {
            if (b.windows[message.windowId]) {
                sendResponse(b.windows[message.windowId].search_filter);
            }
            return;
        }
        if (message.command == "set_active_shelf") {
            if (b.windows[message.windowId]) {
                b.windows[message.windowId].active_shelf = message.active_shelf;
                b.schedule_save++;
            }
            return;
        }
        if (message.command == "get_active_shelf") {
            if (b.windows[message.windowId]) {
                sendResponse(b.windows[message.windowId].active_shelf);
            }
            return;
        }
        if (message.command == "set_group_bar") {
            if (b.windows[message.windowId]) {
                b.windows[message.windowId].group_bar = message.group_bar;
                b.schedule_save++;
            }
            return;
        }
        if (message.command == "get_group_bar") {
            if (b.windows[message.windowId]) {
                sendResponse(b.windows[message.windowId].group_bar);
            }
            return;
        }
        if (message.command == "get_browser_tabs") {
            sendResponse(b.tabs);
            return;
        }
        if (message.command == "is_bg_ready") {
            sendResponse(b.running);
            return;
        }
        if (message.command == "update_tab" && browserId == "F") {
            if (b.tabs[message.tabId]) {
                if (message.tab.index) {
                    b.tabs[message.tabId].index = message.tab.index;
                }
                if (message.tab.expand) {
                    b.tabs[message.tabId].expand = message.tab.expand;
                }
                if (message.tab.parent) {
                    b.tabs[message.tabId].parent = message.tab.parent;
                }
                b.schedule_save++;
            } else {
                chrome.tabs.get(parseInt(message.tabId), function(tab) {
                    QuantumAppendTabTTId(tab)
                    b.schedule_save++;
                });
            }
            return;
        }
        if (message.command == "update_tab" && browserId != "F") {
            if (b.tabs[message.tabId]) {
                if (message.tab.index) {
                    b.tabs[message.tabId].index = message.tab.index;
                }
                if (message.tab.expand) {
                    b.tabs[message.tabId].expand = message.tab.expand;
                }
                if (message.tab.parent) {
                    b.tabs[message.tabId].parent = message.tab.parent;
                }
                b.schedule_save++;
            } else {
                chrome.tabs.get(parseInt(message.tabId), function(tab) {
                    ChromiumHashURL(tab);
                    b.schedule_save++;
                });
                b.tabs[tabId] = { hash: 0, parent: message.tab.parent, index: message.tab.index, expand: message.tab.expand };
                b.schedule_save++;
            }
            return;
        }
        if (message.command == "update_all_tabs") {
            for (let i = 0; i < message.pins.length; i++) {
                if (b.tabs[message.pins[i].id]) {
                    b.tabs[message.pins[i].id].parent = "pin_list";
                    b.tabs[message.pins[i].id].expand = "";
                    b.tabs[message.pins[i].id].index = message.pins[i].index;
                } else {
                    if (browserId != "F") {
                        chrome.tabs.get(parseInt(message.pins[i].id), function(tab) {
                            QuantumAppendTabTTId(tab);
                            b.schedule_save++;
                        });
                    } else {
                        chrome.tabs.get(parseInt(message.pins[i].id), function(tab) {
                            ChromiumHashURL(tab);
                            b.schedule_save++;
                        });
                    }
                }
            }
            for (let j = 0; j < message.tabs.length; j++) {
                if (b.tabs[message.tabs[j].id]) {
                    b.tabs[message.tabs[j].id].parent = message.tabs[j].parent;
                    b.tabs[message.tabs[j].id].expand = message.tabs[j].expand;
                    b.tabs[message.tabs[j].id].index = message.tabs[j].index;
                }
            }
            b.schedule_save++;
            return;
        }
        if (message.command == "discard_tab") {
            DiscardTab(message.tabId);
            return;
        }
        if (message.command == "discard_window") {
            DiscardWindow(message.windowId);
            return;
        }
        if (message.command == "remove_tab_from_empty_tabs") {
            setTimeout(function() {
                if (b.EmptyTabs.indexOf(message.tabId) != -1) {
                    b.EmptyTabs.splice(b.EmptyTabs.indexOf(message.tabId), 1);
                }
            }, 100);
            return;
        }
        if (message.command == "debug") {
            pushlog(message.log);
            return;
        }
    });
}

function QuantumStartListeners() {
    browser.browserAction.onClicked.addListener(function() {
        browser.sidebarAction.setPanel({ panel: (browser.extension.getURL("/sidebar.html")) });
        browser.sidebarAction.open();
    });
    chrome.tabs.onCreated.addListener(function(tab) {
        if (b.windows[tab.windowId] == undefined) {
            QuantumAppendWinTTId(tab.windowId);
        }
        let prevActiveTabId = b.windows[tab.windowId].activeTabId;
        let t = Promise.resolve(browser.sessions.getTabValue(tab.id, "TTdata")).then(function(TabData) {
            if (TabData != undefined) {
                b.tabs[tab.id] = Object.assign({}, TabData);
                let originalParent = b.tt_ids[TabData.parent] ? b.tt_ids[TabData.parent] : TabData.parent;
                let AfterId = undefined;
                let append = undefined;
                if (originalParent) {
                    let originalParentChildren = GetChildren(b.tabs, originalParent);
                    if (TabData.index > 0 && TabData.index < originalParentChildren.length) {
                        for (let i = TabData.index + 1; i < originalParentChildren.length; i++) { // shift next siblings indexes
                            b.tabs[originalParentChildren[i]].index += 1;
                        }
                        AfterId = originalParentChildren[TabData.index];
                    }
                    if (TabData.index == 0) {
                        append = false;
                    }
                    if (TabData.index > originalParentChildren.length) {
                        append = true;
                    }
                }
                chrome.runtime.sendMessage({ command: "tab_created", windowId: tab.windowId, tabId: tab.id, tab: tab, ParentId: originalParent, InsertAfterId: AfterId, Append: append });
            } else {
                QuantumAppendTabTTId(tab);
                chrome.tabs.get(tab.id, function(NewTab) { // get tab again as reported tab's url is empty! Also for some reason firefox sends tab with "active == false" even if tab is active (THIS IS POSSIBLY A NEW BUG IN FF 60!)
                    if (NewTab) {
                        OnMessageTabCreated(NewTab, prevActiveTabId);
                    }
                });
            }
        });
    });
    chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
        let oldId = tabId;
        chrome.tabs.get(oldId, function(tab) {
            ReplaceParents(oldId, tab.id);
            chrome.runtime.sendMessage({ command: "tab_attached", windowId: attachInfo.newWindowId, tab: tab, tabId: tab.id, ParentId: b.tabs[tab.id].parent });
            b.schedule_save++;
        });
    });

    chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
        chrome.runtime.sendMessage({ command: "tab_detached", windowId: detachInfo.oldWindowId, tabId: tabId });
    });

    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
        // if (b.windows[removeInfo.windowId].activeTabId == tabId) {
        // chrome.runtime.sendMessage({command: "switch_active_tab", windowId: removeInfo.windowId, tabId: tabId});
        // }
        let SiblingTabs = GetChildren(b.tabs, b.tabs[tabId].parent);
        let SiblingFolders = GetChildren(b.windows[removeInfo.windowId].folders, b.tabs[tabId].parent);
        UnshiftChildrenIndexes(SiblingTabs, b.tabs[tabId].index, SiblingFolders, removeInfo.windowId);
        if (b.EmptyTabs.indexOf(tabId) != -1) {
            b.EmptyTabs.splice(b.EmptyTabs.indexOf(tabId), 1);
        }
        setTimeout(function() {
            chrome.runtime.sendMessage({ command: "tab_removed", windowId: removeInfo.windowId, tabId: tabId });
        }, 5);
        delete b.tabs[tabId];
        b.schedule_save++;
    });
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo.pinned == true) {
            if (b.tabs[tabId]) {
                b.tabs[tabId].parent = "pin_list";
                b.schedule_save++;
            }
        }
        if (changeInfo.pinned == false) {
            if (b.tabs[tabId]) {
                b.tabs[tabId].parent = "tab_list";
                b.schedule_save++;
            }
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

    chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
        chrome.tabs.get(addedTabId, function(tab) {
            if (addedTabId == removedTabId) {
                chrome.runtime.sendMessage({ command: "tab_updated", windowId: tab.windowId, tab: tab, tabId: tab.id, changeInfo: { status: tab.status, url: tab.url, title: tab.title, audible: tab.audible, mutedInfo: tab.mutedInfo } });
            } else {
                if (b.tabs[removedTabId]) {
                    b.tabs[addedTabId] = b.tabs[removedTabId];
                }
                ReplaceParents(tabId, tab.id);
                chrome.runtime.sendMessage({ command: "tab_removed", windowId: tab.windowId, tabId: removedTabId });
                chrome.runtime.sendMessage({ command: "tab_attached", windowId: tab.windowId, tab: tab, tabId: addedTabId, ParentId: b.tabs[addedTabId].parent });
                // delete ttid[b.tabs[removedTabId].ttid];
                // delete b.tabs[removedTabId];
            }
            setTimeout(function() {
                QuantumAppendTabTTId(tab);
                b.schedule_save++;
            }, 100);

        });
    });
    chrome.tabs.onActivated.addListener(function(activeInfo) {
        if (b.windows[activeInfo.windowId]) {
            b.windows[activeInfo.windowId].activeTabId = activeInfo.tabId;
        }
        chrome.runtime.sendMessage({ command: "tab_activated", windowId: activeInfo.windowId, tabId: activeInfo.tabId });
        b.schedule_save++;
    });
    chrome.windows.onCreated.addListener(function(window) {
        let win = Promise.resolve(browser.sessions.getWindowValue(window.id, "TTdata")).then(function(WindowData) {
            if (WindowData != undefined) {
                b.windows[window.id] = Object.assign({}, WindowData);
            } else {
                QuantumAppendWinTTId(window.id);
            }
            b.schedule_save++;
        });
    });
    chrome.windows.onRemoved.addListener(function(windowId) {
        delete b.windows[windowId];
        b.schedule_save++;
    });
    // chrome.sessions.onChanged.addListener(function(session) {
    // chrome.windows.getAll({windowTypes: ['normal'], populate: false}, function(w) {
    // chrome.tabs.query({}, function(t) {
    // for (let wiInd = 0; wiInd < w.length; wiInd++) {
    // if (b.windows[w[wiInd].id] == undefined) {
    // chrome.runtime.sendMessage({command: "reload_sidebar"});
    // window.location.reload();
    // }
    // }
    // for (let tbInd = 0; tbInd < t.length; tbInd++) {
    // if (b.tabs[t[tbInd].id] == undefined) {
    // chrome.runtime.sendMessage({command: "reload_sidebar"});
    // window.location.reload();
    // }
    // }
    // });
    // });
    // });
}


function ChromiumStartListeners() { // start all listeners
    chrome.tabs.onCreated.addListener(function(tab) {
        if (b.windows[tab.windowId] == undefined) {
            ChromiumAddWindowData(tab.windowId);
        }
        let prevActiveTabId = b.windows[tab.windowId].activeTabId;
        ChromiumHashURL(tab);
        OnMessageTabCreated(tab, prevActiveTabId);
    });
    chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
        let SiblingTabs = GetChildren(b.tabs, b.tabs[tabId].parent);
        let SiblingFolders = GetChildren(b.windows[removeInfo.windowId].folders, b.tabs[tabId].parent);
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
        if (b.tabs[tabId] == undefined || changeInfo.url != undefined) {
            ChromiumHashURL(tab);
        }
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
                    ChromiumHashURL(tab);
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
        b.schedule_save++;
    });
    chrome.windows.onCreated.addListener(function(window) {
        ChromiumAddWindowData(window.id);
        // b.windows[window.id] = {group_bar: opt.groups_toolbar_default, search_filter: "url", active_shelf: "", active_group: "tab_list", groups: {tab_list: {id: "tab_list", index: 0, active_tab: 0, prev_active_tab: 0, name: labels.ungrouped_group, font: ""}}, folders: {}};
        b.schedule_save++;
    });
    chrome.windows.onRemoved.addListener(function(windowId) {
        delete b.windows[windowId];
        b.schedule_save++;
    });
    chrome.runtime.onSuspend.addListener(function() {
        b.running = false;
    });
}



////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////    NEW TAB    //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////



// async function OnMessageTabCreated(NewTab, activeTabId) {
function OnMessageTabCreated(NewTab, activeTabId) {
    let ParentId;
    let AfterId;
    let append;

    if (b.windows[NewTab.windowId] && NewTab.active) {
        b.windows[NewTab.windowId].groups[b.windows[NewTab.windowId].active_group].active_tab = NewTab.id;
    }

    if (NewTab.url == b.newTabUrl) {
        b.EmptyTabs.push(NewTab.id);
    }

    if (NewTab.pinned) {
        let PinTabs = GetChildren(b.tabs, "pin_list");
        b.tabs[NewTab.id].parent = "pin_list";
        if (opt.append_pinned_tab == "after") {
            if (NewTab.openerTabId && b.tabs[NewTab.openerTabId]) { // has opener tab case
                ShiftChildrenIndexes(PinTabs, b.tabs[NewTab.openerTabId].index, [], NewTab.windowId);
                b.tabs[NewTab.id].index = NewTab.index;
                AfterId = NewTab.openerTabId;
            } else {
                if (b.tabs[activeTabId]) { // after active case
                    ShiftChildrenIndexes(PinTabs, b.tabs[activeTabId].index, [], NewTab.windowId);
                    AfterId = activeTabId;
                }
            }
        }
        if (opt.append_pinned_tab == "first") { // as first
            ShiftChildrenIndexes(PinTabs, -1, [], NewTab.windowId);
            b.tabs[NewTab.id].index = 0;
            append = false;
        }
        if (opt.append_pinned_tab == "last") { // as last
            b.tabs[NewTab.id].index = PinTabs.length;
            append = true;
        }
    } else {

        if (opt.append_orphan_tab == "as_child" && opt.orphaned_tabs_to_ungrouped == false) {
            NewTab.openerTabId = activeTabId;
        }
        if (NewTab.openerTabId) { // child case
            let OpenerSiblingTabs = GetChildren(b.tabs, b.tabs[NewTab.openerTabId].parent);
            let OpenerSiblingFolders = GetChildren(b.windows[NewTab.windowId].folders, b.tabs[NewTab.openerTabId].parent);
            if (opt.append_child_tab == "after") { // place tabs flat without automatic tree
                b.tabs[NewTab.id].parent = b.tabs[NewTab.openerTabId].parent;
                ShiftChildrenIndexes(OpenerSiblingTabs, b.tabs[NewTab.openerTabId].index, OpenerSiblingFolders, NewTab.windowId);
                b.tabs[NewTab.id].index = b.tabs[NewTab.openerTabId].index + 1;
                AfterId = NewTab.openerTabId;
            } else {
                if (opt.max_tree_depth == 0) { // place tabs flat if limit is set to 0
                    b.tabs[NewTab.id].parent = b.tabs[NewTab.openerTabId].parent;
                    if (opt.append_child_tab_after_limit == "after") { // max tree depth, place tab after parent
                        ShiftChildrenIndexes(OpenerSiblingTabs, b.tabs[NewTab.openerTabId].index, OpenerSiblingFolders, NewTab.windowId);
                        b.tabs[NewTab.id].index = b.tabs[NewTab.openerTabId].index + 1;
                        AfterId = NewTab.openerTabId;
                    }

                    if (opt.append_child_tab_after_limit == "top" && opt.append_child_tab != "after") { // max tree depth, place tab on top (above parent)
                        ShiftChildrenIndexes(OpenerSiblingTabs, -1, OpenerSiblingFolders, NewTab.windowId);
                        b.tabs[NewTab.id].index = 0;
                        ParentId = b.tabs[NewTab.id].parent;
                        append = false;
                    }
                    if (opt.append_child_tab_after_limit == "bottom" && opt.append_child_tab != "after") { // max tree depth, place tab on bottom (below parent)
                        b.tabs[NewTab.id].index = OpenerSiblingTabs.length + OpenerSiblingFolders.length;
                        ParentId = b.tabs[NewTab.id].parent;
                        append = true;
                    }

                } else {

                    let Parents = GetTabParents(NewTab.openerTabId, NewTab.windowId);
                    let OpenerChildren = GetChildren(b.tabs, NewTab.openerTabId);
                    if (opt.max_tree_depth < 0 || (opt.max_tree_depth > 0 && Parents.length < opt.max_tree_depth)) { // append to tree on top and bottom
                        b.tabs[NewTab.id].parent = NewTab.openerTabId;
                        if (opt.append_child_tab == "top") { // place child tab at the top (reverse hierarchy)
                            ShiftChildrenIndexes(OpenerSiblingTabs, -1, OpenerSiblingFolders, NewTab.windowId);
                            b.tabs[NewTab.id].index = 0;
                            ParentId = b.tabs[NewTab.id].parent;
                        }

                        if (opt.append_child_tab == "bottom") { // place child tab at the bottom
                            b.tabs[NewTab.id].index = OpenerSiblingTabs.length + OpenerSiblingFolders.length;
                            ParentId = b.tabs[NewTab.id].parent;
                            append = true;
                        }

                    } else {

                        if (opt.max_tree_depth > 0 && Parents.length >= opt.max_tree_depth) { // if reached depth limit of the tree
                            b.tabs[NewTab.id].parent = b.tabs[NewTab.openerTabId].parent;
                            if (opt.append_child_tab_after_limit == "after") { // tab will append after opener
                                ShiftChildrenIndexes(OpenerSiblingTabs, b.tabs[NewTab.openerTabId].index, OpenerSiblingFolders, NewTab.windowId);
                                b.tabs[NewTab.id].index = b.tabs[NewTab.openerTabId].index + 1;
                                AfterId = NewTab.openerTabId;
                            }
                            if (opt.append_child_tab_after_limit == "top") { // tab will append on top
                                ShiftChildrenIndexes(OpenerSiblingTabs, -1, OpenerSiblingFolders, NewTab.windowId);
                                b.tabs[NewTab.id].index = 0;
                                ParentId = b.tabs[NewTab.id].parent;
                            }
                            if (opt.append_child_tab_after_limit == "bottom") { // tab will append on bottom
                                b.tabs[NewTab.id].index = OpenerSiblingTabs.length + OpenerSiblingFolders.length;
                                ParentId = b.tabs[NewTab.id].parent;
                                append = true;
                            }
                        }
                    }
                }
            }

        } else { // ORPHAN TAB

            if (opt.orphaned_tabs_to_ungrouped == true) { // if set to append orphan tabs to ungrouped group
                let TabListTabs = GetChildren(b.tabs, "tab_list");
                let TabListFolders = GetChildren(b.windows[NewTab.windowId].folders, "tab_list");
                b.tabs[NewTab.id].index = TabListTabs.length + TabListFolders.length;
                ParentId = "tab_list";
                append = true;
            } else {


                if (opt.append_orphan_tab == "after_active" || opt.append_orphan_tab == "active_parent_top" || opt.append_orphan_tab == "active_parent_bottom") {

                    if (b.windows[NewTab.windowId] && b.windows[NewTab.windowId].activeTabId) {
                        if (b.tabs[activeTabId]) {
                            let ActiveTabSiblings = GetChildren(b.tabs, b.tabs[activeTabId].parent);
                            let ActiveTabSiblingFolders = GetChildren(b.windows[NewTab.windowId].folders, b.tabs[activeTabId].parent);
                            b.tabs[NewTab.id].parent = b.tabs[activeTabId].parent;
                            if (opt.append_orphan_tab == "after_active") {
                                ShiftChildrenIndexes(ActiveTabSiblings, b.tabs[activeTabId].index, ActiveTabSiblingFolders, NewTab.windowId);
                                b.tabs[NewTab.id].index = b.tabs[activeTabId].index + 1;
                                AfterId = activeTabId;
                            }
                            if (opt.append_orphan_tab == "active_parent_top") {
                                ShiftChildrenIndexes(ActiveTabSiblings, -1, ActiveTabSiblingFolders, NewTab.windowId);
                                b.tabs[NewTab.id].index = 0;
                                ParentId = b.tabs[NewTab.id].parent;
                            }
                            if (opt.append_orphan_tab == "active_parent_bottom") {
                                b.tabs[NewTab.id].index = ActiveTabSiblings.length + ActiveTabSiblingFolders.length;
                                ParentId = b.tabs[NewTab.id].parent;
                                append = true;
                            }

                        } else { // FAIL, no active tab!
                            let ActiveGroupTabs = GetChildren(b.tabs, b.windows[NewTab.windowId].active_group);
                            let ActiveGroupFolders = GetChildren(b.windows[NewTab.windowId].folders, b.windows[NewTab.windowId].active_group);
                            b.tabs[NewTab.id].parent = b.windows[NewTab.windowId].active_group;
                            b.tabs[NewTab.id].index = ActiveGroupTabs.length + ActiveGroupFolders.length;
                            ParentId = b.windows[NewTab.windowId].active_group;
                        }
                    } else {
                        b.tabs[NewTab.id].parent = "tab_list";
                        b.tabs[NewTab.id].index = NewTab.index;
                        ParentId = "tab_list";
                    }
                }

                if (opt.append_orphan_tab == "top") {
                    let ActiveGroupTabs = GetChildren(b.tabs, b.windows[NewTab.windowId].active_group);
                    let ActiveGroupFolders = GetChildren(b.windows[NewTab.windowId].folders, b.tabs[activeTabId].parent);
                    b.tabs[NewTab.id].parent = b.windows[NewTab.windowId].active_group;
                    ShiftChildrenIndexes(ActiveGroupTabs, -1, ActiveGroupFolders, NewTab.windowId);
                    b.tabs[NewTab.id].index = 0;
                    ParentId = b.windows[NewTab.windowId].active_group;
                }

                if (opt.append_orphan_tab == "bottom") {
                    let ActiveGroupTabs = GetChildren(b.tabs, b.windows[NewTab.windowId].active_group);
                    let ActiveGroupFolders = GetChildren(b.windows[NewTab.windowId].folders, b.tabs[activeTabId].parent);
                    b.tabs[NewTab.id].parent = b.windows[NewTab.windowId].active_group;
                    b.tabs[NewTab.id].index = ActiveGroupTabs.length + ActiveGroupFolders.length;
                    ParentId = b.windows[NewTab.windowId].active_group;
                    append = true;
                }
            }
        }

        if (opt.move_tabs_on_url_change === "all_new" && NewTab.pinned == false) {
            setTimeout(function() {
                chrome.tabs.get(NewTab.id, function(CheckTabsUrl) {
                    AppendTabToGroupOnRegexMatch(CheckTabsUrl.id, CheckTabsUrl.windowId, CheckTabsUrl.url);
                });
            }, 100);
        }
    }
    setTimeout(function() {
        b.schedule_save++;
    }, 500);

    chrome.runtime.sendMessage({ command: "tab_created", windowId: NewTab.windowId, tabId: NewTab.id, tab: NewTab, ParentId: ParentId, InsertAfterId: AfterId, Append: append });
}