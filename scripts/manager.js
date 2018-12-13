function Manager_OpenManagerWindow() {
    DOM_HideRenameDialogs();
    if (opt.debug) Utils_log("f: Manager_OpenManagerWindow");
    chrome.storage.local.get(null, function(storage) {
        DOM_SetStyle(document.getElementById("manager_window"), {display: "block", top: "", left: ""});
        let GroupList = document.getElementById("manager_window_groups_list");
        while (GroupList.hasChildNodes()) {
            GroupList.removeChild(GroupList.firstChild);
        }
        let SessionsList = document.getElementById("manager_window_sessions_list");
        while (SessionsList.hasChildNodes()) {
            SessionsList.removeChild(SessionsList.firstChild);
        }
        if (storage.hibernated_groups != undefined) {
            for (let hibernated_group of storage.hibernated_groups) {
                Manager_AddGroupToManagerList(hibernated_group);
            }
        }
        if (storage.saved_sessions != undefined) {
            for (let saved_session of storage.saved_sessions) {
                Manager_AddSessionToManagerList(saved_session);
            }
        }
        Manager_ReAddSessionAutomaticToManagerList(storage);
    });
}

function Manager_AddGroupToManagerList(hibernated_group) {
    let HibernatedGroupRow = DOM_New("li", document.getElementById("manager_window_groups_list"), {className: "hibernated_group_row"});
    let DeleteGroupIcon = DOM_New("div", HibernatedGroupRow, {className: "manager_window_list_button delete_hibernated_group", title: chrome.i18n.getMessage("manager_window_delete_icon")});
    DeleteGroupIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let hib_group = this.parentNode;
            let HibernategGroupIndex = Array.from(hib_group.parentNode.children).indexOf(hib_group);
            chrome.storage.local.get(null, function(storage) {
                let hibernated_groups = storage.hibernated_groups;
                hibernated_groups.splice(HibernategGroupIndex, 1);
                chrome.storage.local.set({hibernated_groups: hibernated_groups});
                hib_group.parentNode.removeChild(hib_group);
                DOM_RefreshGUI();
            });
        }
    }
    let ExportGroupIcon = DOM_New("div", HibernatedGroupRow, {className: "manager_window_list_button export_hibernated_group", title: chrome.i18n.getMessage("manager_window_savetofile_icon")});
    ExportGroupIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
            chrome.storage.local.get(null, function(storage) {
                let filename = storage.hibernated_groups[HibernategGroupIndex].group.name == "" ? labels.noname_group : storage.hibernated_groups[HibernategGroupIndex].group.name;
                File_SaveFile(filename, "tt_group", storage.hibernated_groups[HibernategGroupIndex]);
            });
        }
    }
    let LoadGroupIcon = DOM_New("div", HibernatedGroupRow, {className: "manager_window_list_button load_hibernated_group", title: chrome.i18n.getMessage("manager_window_load_icon")});
    LoadGroupIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
            chrome.storage.local.get(null, function(storage) {
                Manager_RecreateGroup(storage.hibernated_groups[HibernategGroupIndex]);
            });
        }
    }
    let name = DOM_New("div", HibernatedGroupRow, {className: "manager_window_group_name text_input", contentEditable: true, textContent: hibernated_group.group.name});
    name.onkeydown = function(event) {
        return event.which != 13;
    }
    name.oninput = function(event) {
        let hib_group_name = this.textContent;
        let hib_group = this.parentNode;
        let HibernategGroupIndex = Array.from(hib_group.parentNode.children).indexOf(hib_group);
        chrome.storage.local.get(null, function(storage) {
            let hibernated_groups = storage.hibernated_groups;
            hibernated_groups[HibernategGroupIndex].group.name = hib_group_name;
            chrome.storage.local.set({hibernated_groups: hibernated_groups});
        });
    }
    DOM_New("div", HibernatedGroupRow, {className: "manager_window_group_name", textContent: " - (" + hibernated_group.tabs.length + ")"});
    DOM_RefreshGUI();
}

function Manager_AddSessionToManagerList(saved_session) {
    let SavedSessionRow = DOM_New("li", document.getElementById("manager_window_sessions_list"), {className: "saved_session_row"});
    let DeleteSessionIcon = DOM_New("div", SavedSessionRow, {className: "manager_window_list_button delete_saved_session", title: chrome.i18n.getMessage("manager_window_delete_icon")});
    DeleteSessionIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let saved_session = this.parentNode;
            let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
            chrome.storage.local.get(null, function(storage) {
                let S_Sessions = storage.saved_sessions;
                S_Sessions.splice(SessionIndex, 1);
                chrome.storage.local.set({saved_sessions: S_Sessions});
                saved_session.parentNode.removeChild(saved_session);
                DOM_RefreshGUI();
            });
        }
    }
    let ExportSessionIcon = DOM_New("div", SavedSessionRow, {className: "manager_window_list_button export_saved_session", title: chrome.i18n.getMessage("manager_window_savetofile_icon")});
    ExportSessionIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let saved_session = this.parentNode;
            let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
            chrome.storage.local.get(null, function(storage) {
                let filename = storage.saved_sessions[SessionIndex].name == "" ? labels.noname_group : storage.saved_sessions[SessionIndex].name;
                File_SaveFile(filename, "tt_session", storage.saved_sessions[SessionIndex].session);
            });
        }
    }
    let LoadSessionIcon = DOM_New("div", SavedSessionRow, {className: "manager_window_list_button load_saved_session", title: chrome.i18n.getMessage("manager_window_load_icon")});
    LoadSessionIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let saved_session = this.parentNode;
            let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
            chrome.storage.local.get(null, function(storage) {
                let S_Sessions = storage.saved_sessions;
                Manager_RecreateSession(S_Sessions[SessionIndex].session);
            });
        }
    }
    let MergeSessionIcon = DOM_New("div", SavedSessionRow, {className: "manager_window_list_button merge_saved_session", title: chrome.i18n.getMessage("manager_window_merge_icon")});
    MergeSessionIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let saved_session = this.parentNode;
            let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
            chrome.storage.local.get(null, function(storage) {
                let S_Sessions = storage.saved_sessions;
                Manager_ImportMergeTabs(S_Sessions[SessionIndex].session);
            });
        }
    }
    let name = DOM_New("div", SavedSessionRow, {className: "manager_window_session_name", contentEditable: true, textContent: saved_session.name});
    name.onkeydown = function(event) {
        return event.which != 13;
    }
    name.oninput = function(event) {
        let session_name = this.textContent;
        let s = this.parentNode;
        let SessionIndex = Array.from(s.parentNode.children).indexOf(s);
        chrome.storage.local.get(null, function(storage) {
            let S_Sessions = storage.saved_sessions;
            S_Sessions[SessionIndex].name = session_name;
            chrome.storage.local.set({saved_sessions: S_Sessions});
        });
    }
    DOM_RefreshGUI();
}

function Manager_ReAddSessionAutomaticToManagerList(storage) {
    let SessionsAutomaticList = document.getElementById("manager_window_autosessions_list");
    while (SessionsAutomaticList.hasChildNodes()) {
        SessionsAutomaticList.removeChild(SessionsAutomaticList.firstChild);
    }
    if (storage.saved_sessions_automatic != undefined) {
        for (let saved_sessions_automatic of storage.saved_sessions_automatic) {
            Manager_AddSessionAutomaticToManagerList(saved_sessions_automatic);
        }
    }
    DOM_RefreshGUI();
}

function Manager_AddSessionAutomaticToManagerList(saved_session) {
    let SavedSessionRow = DOM_New("li", document.getElementById("manager_window_autosessions_list"), {className: "saved_session_row"});
    let LoadSessionIcon = DOM_New("div", SavedSessionRow, {className: "manager_window_list_button load_saved_session", title: chrome.i18n.getMessage("manager_window_load_icon")});
    LoadSessionIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let saved_session = this.parentNode;
            let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
            chrome.storage.local.get(null, function(storage) {
                let S_Sessions = storage.saved_sessions_automatic;
                Manager_RecreateSession(S_Sessions[SessionIndex].session);
            });
        }
    }
    let MergeSessionIcon = DOM_New("div", SavedSessionRow, {className: "manager_window_list_button merge_saved_session", title: chrome.i18n.getMessage("manager_window_merge_icon")});
    MergeSessionIcon.onmousedown = function(event) {
        if (event.which == 1) {
            let saved_session = this.parentNode;
            let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
            chrome.storage.local.get(null, function(storage) {
                let S_Sessions = storage.saved_sessions_automatic;
                Manager_ImportMergeTabs(S_Sessions[SessionIndex].session);
            });
        }
    }
    DOM_New("div", SavedSessionRow, {className: "manager_window_session_name", textContent: saved_session.name});
    DOM_RefreshGUI();
}

function Manager_SetManagerEvents() {
    document.getElementById("manager_window_close").onmousedown = function(event) {
        if (event.which == 1) DOM_HideRenameDialogs();
    }
    let query = document.querySelectorAll(".manager_window_toolbar_button");
    for (let s of query) {
        s.onmousedown = function(event) {
            if (event.which == 1) {
                let window_panels = document.querySelectorAll(".manager_window_panel");
                for (let s of window_panels) {
                    s.classList.remove("mw_pan_on");
                }
                document.getElementById((this.id).replace("button", "panel")).classList.add("mw_pan_on");
                let panel_on = document.querySelectorAll(".mw_on");
                for (let s of panel_on) {
                    s.classList.remove("mw_on");
                }
                this.classList.add("mw_on");
                DOM_RefreshGUI();
            }
        }
    }
    document.getElementById("manager_window_button_import_group").onmousedown = function(event) {
        if (event.which == 1) {
            let inputFile = File_ShowOpenFileDialog(".tt_group");
            inputFile.onchange = function(event) {
                Manager_ImportGroup(false, true);
            }
        }
    }
    document.getElementById("manager_window_button_hibernate_group").onmousedown = function(event) {
        if (event.which == 1) {
            Manager_ExportGroup(tt.active_group, false, true);
            setTimeout(function() {Groups_GroupRemove(tt.active_group, true);}, 100);
            setTimeout(function() {Manager_OpenManagerWindow();}, 150);
        }
    }
    document.getElementById("manager_window_button_save_current_session").onmousedown = function(event) {
        if (event.which == 1) {
            let d = new Date();
            Manager_ExportSession((d.toLocaleString().replace(/\//g, ".").replace(/:/g, "꞉")), false, true, false);
        }
    }
    document.getElementById("manager_window_button_import_session").onmousedown = function(event) {
        if (event.which == 1) {
            let inputFile = File_ShowOpenFileDialog(".tt_session");
            inputFile.onchange = function(event) {
                Manager_ImportSession(false, true, false);
            }
        }
    }
    let autosessions_save_max_to_keep = document.getElementById("manager_window_autosessions_maximum_saves");
    autosessions_save_max_to_keep.value = opt.autosave_max_to_keep;
    autosessions_save_max_to_keep.oninput = function(event) {
        opt.autosave_max_to_keep = parseInt(this.value);
        Preferences_SavePreferences(opt);
    }
    let autosessions_save_timer = document.getElementById("manager_window_autosessions_save_timer");
    autosessions_save_timer.value = opt.autosave_interval;
    autosessions_save_timer.oninput = function(event) {
        opt.autosave_interval = parseInt(this.value);
        Preferences_SavePreferences(opt);
        clearInterval(tt.AutoSaveSession);
        Manager_StartAutoSaveSession();
    }
}

function Manager_ExportGroup(groupId, filename, save_to_manager) {
    let GroupToSave = {group: tt.groups[groupId], folders: {}, tabs: [], favicons: []};
    let query = document.querySelectorAll("#" + groupId + " .folder");
    for (let s of query) {
        if (tt.folders[s.id]) GroupToSave.folders[s.id] = tt.folders[s.id];
    }
    let Tabs = document.querySelectorAll("#" + groupId + " .tab");
    if (Tabs.length > 0) {
        let lastId = parseInt(Tabs[Tabs.length - 1].id);
        for (let s of Tabs) {
            chrome.tabs.get(parseInt(s.id), async function(tab) {
                if ((tab.url).startsWith("www") || (tab.url).startsWith("http") || (tab.url).startsWith("ftp") || (tab.url).startsWith("file")) {
                    let favicon = (browserId == "F" ? await browser.sessions.getTabValue(tab.id, "CachedFaviconUrl") : tab.favIconUrl);
                    let favicon_index = GroupToSave.favicons.indexOf(favicon);
                    if (favicon_index == -1) {
                        GroupToSave.favicons.push(favicon);
                        favicon_index = GroupToSave.favicons.length;
                    }
                    (GroupToSave.tabs).push({id: tab.id,parent: s.parentNode.parentNode.id,index: Array.from(s.parentNode.children).indexOf(s), expand: (s.classList.contains("c") ? "c" : (s.classList.contains("o") ? "o" : "")), url: tab.url, title: tab.title, favicon: favicon_index});
                }
                if (tab.id == lastId) {
                    if (filename) File_SaveFile(filename, "tt_group", GroupToSave);
                    if (save_to_manager) Manager_AddGroupToStorage(GroupToSave, true);
                    if (opt.debug) Utils_log("f: ExportGroup, filename: " + filename + ", groupId: " + groupId + ", save_to_manager: " + save_to_manager);
                }
            });
        }
    } else {
        if (filename) File_SaveFile(filename, "tt_group", GroupToSave);
        if (save_to_manager) Manager_AddGroupToStorage(GroupToSave, true);
        if (opt.debug) Utils_log("f: ExportGroup, filename: " + filename + ", groupId: " + groupId + ", save_to_manager: " + save_to_manager);
    }
}

function Manager_ImportGroup(recreate_group, save_to_manager) {
    let file = document.getElementById("file_import");
    let fr = new FileReader();
    if (file.files[0] == undefined) return;
    fr.readAsText(file.files[0]);
    fr.onload = function() {
        let data = fr.result;
        let group = JSON.parse(data);
        file.parentNode.removeChild(file);
        if (recreate_group) Manager_RecreateGroup(group);
        if (save_to_manager) Manager_AddGroupToStorage(group, true);
        if (opt.debug) Utils_log("f: ImportGroup, recreate_group: " + recreate_group + ", save_to_manager: " + save_to_manager);
    }
}

function Manager_RecreateGroup(LoadedGroup) {
    if (opt.debug) Utils_log("f: RecreateGroup");
    let RefFolders = {};
    let NewFolders = {};
    let RefTabs = {};
    let NewTabs = [];
    let NewGroupId = Groups_AddNewGroup(LoadedGroup.group.name, LoadedGroup.group.font);
    for (var folder in LoadedGroup.folders) {
        let newId = Folders_AddNewFolder({parent: NewGroupId, name: LoadedGroup.folders[folder].name, expand: LoadedGroup.folders[folder].expand});
        RefFolders[folder] = newId;
        NewFolders[newId] = {id: newId, parent: (((LoadedGroup.folders[folder].parent).startsWith("g_") || (LoadedGroup.folders[folder].parent == "tab_list")) ? NewGroupId : LoadedGroup.folders[folder].parent), index: LoadedGroup.folders[folder].index, name: LoadedGroup.folders[folder].name, expand: LoadedGroup.folders[folder].expand};
    }
    for (var new_folder in NewFolders) {
        if ((NewFolders[new_folder].parent).startsWith("f_") && RefFolders[NewFolders[new_folder].parent]) NewFolders[new_folder].parent = RefFolders[NewFolders[new_folder].parent];
    }
    (LoadedGroup.tabs).forEach(function(Tab) {
        let params;
        if (browserId == "F") {
            params = {active: false, windowId: tt.CurrentWindowId, url: Tab.url, discarded: true, title: Tab.title};
        } else {
            params = {active: false, windowId: tt.CurrentWindowId, url: Tab.url};
        }
        chrome.tabs.create(params, function(new_tab) {
            if (browserId == "F") browser.sessions.setTabValue(new_tab.id, "CachedFaviconUrl", Tab.favicon);
            RefTabs[Tab.id] = new_tab.id;
            Tab.id = new_tab.id;
            if ((Tab.parent).startsWith("g_") || Tab.parent == "tab_list") Tab.parent = NewGroupId;
            if ((Tab.parent).startsWith("f_") && RefFolders[Tab.parent]) Tab.parent = RefFolders[Tab.parent];
            NewTabs.push(Tab);
            if (browserId != "O" && browserId != "F") chrome.runtime.sendMessage({command: "discard_tab", tabId: new_tab.id});
            if (NewTabs.length == LoadedGroup.tabs.length - 1) {
                NewTabs.forEach(function(LTab) {
                    if (RefTabs[LTab.parent]) LTab.parent = RefTabs[LTab.parent];
                });
                let GiveUp = 3000; // gives up after: 300*3000/1000/60 = 15 minutes
                let RecreateTreeS = setInterval(function() {
                    GiveUp--;
                    let LastTab = document.getElementById(NewTabs[NewTabs.length - 1].id);
                    if (LastTab != null || GiveUp < 0) {
                        Manager_RecreateTreeStructure({}, NewFolders, NewTabs);
                        clearInterval(RecreateTreeS);
                    }
                }, 300);
            }
        });
    });
}

function Manager_AddGroupToStorage(group, add_to_manager) {
    chrome.storage.local.get(null, function(storage) {
        if (storage["hibernated_groups"] == undefined) {
            let hibernated_groups = [];
            hibernated_groups.push(group);
            chrome.storage.local.set({hibernated_groups: hibernated_groups});
            if (add_to_manager) Manager_AddGroupToManagerList(group);
        } else {
            let hibernated_groups = storage["hibernated_groups"];
            hibernated_groups.push(group);
            chrome.storage.local.set({hibernated_groups: hibernated_groups});
            if (add_to_manager) Manager_AddGroupToManagerList(group);
        }
        if (opt.debug) Utils_log("f: AddGroupToStorage, add_to_manager: " + add_to_manager);
    });
}

function Manager_ExportSession(name, save_to_file, save_to_manager, save_to_autosave_manager) {
    chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(win) {
        chrome.runtime.sendMessage({command: "get_browser_tabs"}, function(t) {
            let tabs = Object.assign({}, t);
            chrome.runtime.sendMessage({command: "get_windows"}, function(w) {
                let windows = Object.assign({}, w);
                let ExportWindows = [];
                win.forEach(function(CWin) {
                    if (CWin.tabs.length > 0) {
                        windows[CWin.id]["id"] = CWin.id;
                        windows[CWin.id]["tabs"] = [];
                        windows[CWin.id]["favicons"] = [];
                        CWin.tabs.forEach(async function(CTab) {
                            if ((CTab.url).startsWith("www") || (CTab.url).startsWith("http") || (CTab.url).startsWith("ftp")) {
                                let favicon = (browserId == "F" ? await browser.sessions.getTabValue(CTab.id, "CachedFaviconUrl") : CTab.favIconUrl);
                                let favicon_index = windows[CWin.id].favicons.indexOf(favicon);
                                if (favicon_index == -1) {
                                    windows[CWin.id].favicons.push(favicon);
                                    favicon_index = windows[CWin.id].favicons.length;
                                }
                                windows[CWin.id]["tabs"].push({id: CTab.id, url: CTab.url, parent: tabs[CTab.id].parent, index: tabs[CTab.id].index, expand: tabs[CTab.id].expand, title: CTab.title, favicon: favicon_index});
                            }
                        });
                        ExportWindows.push(windows[CWin.id]);
                    }
                });
                if (save_to_file) File_SaveFile(name, "tt_session", ExportWindows);
                if (save_to_manager) Manager_AddSessionToStorage(ExportWindows, name, true);
                if (save_to_autosave_manager) Manager_AddAutosaveSessionToStorage(ExportWindows, name);
            });
        });
    });
}

function Manager_ImportSession(recreate_session, save_to_manager, merge_session) {
    let file = document.getElementById("file_import");
    let fr = new FileReader();
    if (file.files[0] == undefined) return;
    fr.readAsText(file.files[file.files.length - 1]);
    fr.onload = function() {
        let data = fr.result;
        file.parentNode.removeChild(file);
        let LoadedSession = JSON.parse(data);
        if (recreate_session) Manager_RecreateSession(LoadedSession);
        if (merge_session) Manager_ImportMergeTabs(LoadedSession);
        if (save_to_manager) Manager_AddSessionToStorage(LoadedSession, (file.files[file.files.length - 1].name).replace(".tt_session", ""), true);
    }
}

function Manager_AddSessionToStorage(session, name, add_to_manager) {
    chrome.storage.local.get(null, function(storage) {
        if (storage.saved_sessions == undefined) {
            let saved_sessions = [];
            saved_sessions.push({name: name, session: session});
            chrome.storage.local.set({saved_sessions: saved_sessions});
            if (add_to_manager) Manager_AddSessionToManagerList(saved_sessions[saved_sessions.length - 1]);
        } else {
            let saved_sessions = storage.saved_sessions;
            saved_sessions.push({name: name, session: session});
            chrome.storage.local.set({saved_sessions: saved_sessions});
            if (add_to_manager) Manager_AddSessionToManagerList(saved_sessions[saved_sessions.length - 1]);
        }
        if (opt.debug) Utils_log("f: AddSessionToStorage, name: " + name + ", add_to_manager: " + add_to_manager);
    });
}

function Manager_AddAutosaveSessionToStorage(session, name) {
    chrome.storage.local.get(null, function(storage) {
        if (storage.saved_sessions_automatic == undefined) {
            let s = [];
            s.push({name: name, session: session});
            chrome.storage.local.set({saved_sessions_automatic: s});
        } else {
            let s = storage.saved_sessions_automatic;
            s.unshift({name: name, session: session});
            if (s[opt.autosave_max_to_keep]) s.splice(opt.autosave_max_to_keep, (s.length - opt.autosave_max_to_keep));
            chrome.storage.local.set({saved_sessions_automatic: s});
        }
        if (opt.debug) Utils_log("f: AddAutosaveSessionToStorage, name: " + name);
    });
}

function Manager_RecreateSession(LoadedWindows) {
    if (opt.debug) Utils_log("f: RecreateSession");
    let RefTabs = {};
    LoadedWindows.forEach(function(LWin) {
        let NewTabs = [];
        let urls = [];
        for (let Tab of LWin.tabs) {
            urls.push(Tab.url);
            NewTabs.push(Tab);
        }
        chrome.windows.create({url: urls[0]}, function(new_window) {
            chrome.runtime.sendMessage({command: "save_groups", windowId: new_window.id, groups: LWin.groups});
            chrome.runtime.sendMessage({command: "save_folders", windowId: new_window.id, folders: LWin.folders});
            (LWin.tabs).forEach(function(Tab) {
                if (Tab.id != LWin.tabs[0].id) { // skip first tab
                    let params;
                    if (browserId == "F") {
                        params = {active: false, windowId: new_window.id, url: Tab.url, discarded: true, title: Tab.title};
                    } else {
                        params = {active: false, windowId: new_window.id, url: Tab.url};
                    }
                    chrome.tabs.create(params, function(new_tab) {
                        if (browserId == "F") browser.sessions.setTabValue(new_tab.id, "CachedFaviconUrl", LWin.favicons[Tab.favicon]);
                        if (Tab.id == LWin.tabs[LWin.tabs.length - 1].id) { // last tab
                            chrome.windows.get(new_window.id, {populate: true}, function(new_window_with_new_tabs) {
                                for (let tInd = 0; tInd < new_window_with_new_tabs.tabs.length; tInd++) {
                                    RefTabs[NewTabs[tInd].id] = new_window_with_new_tabs.tabs[tInd].id;
                                    NewTabs[tInd].id = new_window_with_new_tabs.tabs[tInd].id;
                                }
                                for (let tInd = 0; tInd < new_window_with_new_tabs.tabs.length; tInd++) {
                                    if (RefTabs[NewTabs[tInd].parent] != undefined) NewTabs[tInd].parent = RefTabs[NewTabs[tInd].parent];
                                }
                                for (let tInd = 0; tInd < new_window_with_new_tabs.tabs.length; tInd++) {
                                    if (NewTabs[tInd].parent == "pin_list") chrome.tabs.update(new_window_with_new_tabs.tabs[tInd].id, {pinned: true});
                                    chrome.runtime.sendMessage({command: "update_tab", tabId: new_window_with_new_tabs.tabs[tInd].id, tab: {index: NewTabs[tInd].index, expand: NewTabs[tInd].expand, parent: NewTabs[tInd].parent}});
                                    if (browserId != "O" && browserId != "F") chrome.runtime.sendMessage({command: "discard_tab", tabId: new_window_with_new_tabs.tabs[tInd].id});
                                }
                            });
                        }
                    });
                }
            });
        });
    });
}

function Manager_ImportMergeTabs(LoadedWindows) {
    if (opt.debug) Utils_log("f: ImportMergeTabs");
    let RefTabs = {};
    for (let LWI = 0; LWI < LoadedWindows.length; LWI++) { // clear previous window ids
        LoadedWindows[LWI].id = "";
    }
    Manager_ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_loaded_tree_structure")});
    chrome.windows.getAll({windowTypes: ['normal'], populate: true}, function(cw) {
        for (let CWI = 0; CWI < cw.length; CWI++) { // Current Windows
            for (let LWI = 0; LWI < LoadedWindows.length; LWI++) { // Loaded Windows
                if (LoadedWindows[LWI].id == "") {
                    let tabsMatch = 0;
                    for (let CTI = 0; CTI < cw[CWI].tabs.length; CTI++) { // loop Tabs of CWI Window
                        for (let LTI = 0; LTI < LoadedWindows[LWI].tabs.length; LTI++) { // loop Tabs of Loaded Window
                            if (cw[CWI].tabs[CTI].url == LoadedWindows[LWI].tabs[LTI].url) {
                                RefTabs[LoadedWindows[LWI].tabs[LTI].id] = cw[CWI].tabs[CTI].id;
                                LoadedWindows[LWI].tabs[LTI].id = cw[CWI].tabs[CTI].id;
                                LoadedWindows[LWI].tabs[LTI].url = "";
                                tabsMatch++;
                                break;
                            }
                        }
                    }
                    if (opt.debug) Utils_log("f: ImportMergeTabs, tabsMatch: " + tabsMatch);
                    if (tabsMatch > LoadedWindows[LWI].tabs.length * 0.6) {
                        LoadedWindows[LWI].id = cw[CWI].id;
                        break;
                    }
                }
            }
        }
        LoadedWindows.forEach(function(w) {
            if (w.id == "") { // missing window, lets make one
                if (opt.debug) Utils_log("f: ImportMergeTabs, missing window");
                let NewTabs = [];
                let urls = [];
                (w.tabs).forEach(function(Tab) {
                    urls.push(Tab.url);
                    NewTabs.push(Tab);
                });
                chrome.windows.create({url: urls[0]}, function(new_window) {
                    chrome.runtime.sendMessage({command: "save_groups", windowId: new_window.id, groups: LWin.groups});
                    chrome.runtime.sendMessage({command: "save_folders", windowId: new_window.id, folders: LWin.folders});
                    (w.tabs).forEach(function(Tab) {
                        if (Tab.id != LWin.tabs[0].id) { // skip first tab
                            let params;
                            if (browserId == "F") {
                                params = {active: false, windowId: new_window.id, url: Tab.url, discarded: true, title: Tab.title};
                            } else {
                                params = {active: false, windowId: new_window.id, url: Tab.url};
                            }
                            chrome.tabs.create(params, function(new_tab) {
                                if (browserId == "F") browser.sessions.setTabValue(new_tab.id, "CachedFaviconUrl", w.favicons[Tab.favicon]);
                                if (Tab.id == LWin.tabs[LWin.tabs.length - 1].id) { // last tab
                                    chrome.windows.get(new_window.id, {populate: true}, function(new_window_with_new_tabs) {
                                        for (let tInd = 0; tInd < new_window_with_new_tabs.tabs.length; tInd++) {
                                            RefTabs[NewTabs[tInd].id] = new_window_with_new_tabs.tabs[tInd].id;
                                            NewTabs[tInd].id = new_window_with_new_tabs.tabs[tInd].id;
                                        }
                                        for (let tInd = 0; tInd < new_window_with_new_tabs.tabs.length; tInd++) {
                                            if (RefTabs[NewTabs[tInd].parent] != undefined) NewTabs[tInd].parent = RefTabs[NewTabs[tInd].parent];
                                        }
                                        for (let tInd = 0; tInd < new_window_with_new_tabs.tabs.length; tInd++) {
                                            if (NewTabs[tInd].parent == "pin_list") chrome.tabs.update(new_window_with_new_tabs.tabs[tInd].id, {pinned: true});
                                            chrome.runtime.sendMessage({command: "update_tab", tabId: new_window_with_new_tabs.tabs[tInd].id, tab: {index: NewTabs[tInd].index, expand: NewTabs[tInd].expand, parent: NewTabs[tInd].parent}});
                                            if (browserId != "O" && browserId != "F") chrome.runtime.sendMessage({command: "discard_tab", tabId: new_window_with_new_tabs.tabs[tInd].id});
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            } else { // window exists, lets add missing tabs
                let NewTabs = [];
                let RefTabs = {};
                chrome.runtime.sendMessage({command: "get_folders", windowId: w.id}, function(f) {
                    chrome.runtime.sendMessage({command: "get_groups", windowId: w.id}, function(g) {
                        if (Object.keys(w.groups).length > 0) {
                            for (var group in w.groups) {
                                if (group != "" && group != "undefined" && w.groups[group] != undefined) g[w.groups[group].id] = Object.assign({}, w.groups[group]);
                            }
                        }
                        if (Object.keys(w.folders).length > 0) {
                            for (var folder in w.folders) {
                                if (folder != "" && folder != "undefined" && w.folders[folder] != undefined) w.folders[w.folders[folder].id] = Object.assign({}, w.folders[folder]);
                            }
                        }
                        if (Object.keys(g).length > 0) {
                            for (var groupId in g) {
                                w.groups[groupId] = Object.assign({}, g[groupId]);
                            }
                        }
                        if (Object.keys(f).length > 0) {
                            for (var folderId in f) {
                                w.folders[folderId] = Object.assign({}, f[folderId]);
                            }
                        }
                        chrome.runtime.sendMessage({command: "save_groups", windowId: w.id, groups: g});
                        chrome.runtime.sendMessage({command: "save_folders", windowId: w.id, folders: f});
                        chrome.runtime.sendMessage({command: "remote_update", groups: w.groups, folders: w.folders, tabs: [], windowId: w.id});
                        if (w.id == tt.CurrentWindowId) Manager_RecreateTreeStructure(w.groups, w.folders, []);
                        (w.tabs).forEach(function(Tab) {
                            // let LastTabId = w.tabs[w.tabs.length - 1].id;
                            // let OriginalTabId = Tab.id;
                            if (Tab.url != "") { // missing tab, lets make one
                                let params;
                                if (browserId == "F") {
                                    params = {active: false, windowId: w.id, url: Tab.url, discarded: true, title: Tab.title};
                                } else {
                                    params = {active: false, windowId: w.id, url: Tab.url};
                                }
                                chrome.tabs.create(params, function(tab) {
                                    if (browserId == "F") browser.sessions.setTabValue(tab.id, "CachedFaviconUrl", w.favicons[Tab.favicon]);
                                    if (Tab.parent == "pin_list") chrome.tabs.update(tab.id, {pinned: true});
                                    RefTabs[Tab.id] = tab.id;
                                    Tab.id = tab.id;
                                    NewTabs.push(Tab);
                                    chrome.runtime.sendMessage({command: "update_tab", tabId: tab.id, tab: {index: Tab.index, expand: Tab.expand, parent: Tab.parent}});
                                });
                            } else {
                                NewTabs.push(Tab);
                            }
                            // if (OriginalTabId == LastTabId) { // loop is on last tab
                            //     setTimeout(function() {
                            //         Manager_ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_finding_ref_tabs")});
                            //         for (let tInd = 0; tInd < NewTabs.length; tInd++) {
                            //             if (RefTabs[NewTabs[tInd].parent] != undefined) {
                            //                 NewTabs[tInd].parent = RefTabs[NewTabs[tInd].parent];
                            //             }
                            //         }
                            //     }, 1000);
                            // }
                        });
                        setTimeout(function() {
                            Manager_ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_finding_ref_tabs")});
                            for (let tInd = 0; tInd < NewTabs.length; tInd++) {
                                if (RefTabs[NewTabs[tInd].parent] != undefined) NewTabs[tInd].parent = RefTabs[NewTabs[tInd].parent];
                            }
                        }, 2000);
                        setTimeout(function() {
                            for (let NewTab of NewTabs) {
                                chrome.runtime.sendMessage({command: "update_tab", tabId: NewTab.id, tab: {index: NewTab.index, expand: NewTab.expand, parent: NewTab.parent}});
                            }
                            Manager_ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_finding_other_windows")});
                            if (w.id == tt.CurrentWindowId) {
                                Manager_RecreateTreeStructure(w.groups, w.folders, NewTabs);
                            } else {
                                chrome.runtime.sendMessage({command: "remote_update", groups: w.groups, folders: w.folders, tabs: NewTabs, windowId: w.id});
                            }
                            Manager_ShowStatusBar({show: true, spinner: false, message: chrome.i18n.getMessage("status_bar_all_done"), hideTimeout: 2000});
                        }, 6000);
                    });
                });
            }
        });
    });
}

function Manager_StartAutoSaveSession() {
    if (opt.autosave_interval > 0 && opt.autosave_max_to_keep > 0) {
        tt.AutoSaveSession = setInterval(function() {
            if (opt.debug) Utils_log("f: AutoSaveSession, loop time is: " + opt.autosave_interval);
            let d = new Date();
            let newName = d.toLocaleString().replace(/\//g, ".").replace(/:/g, "꞉");
            Manager_ExportSession(newName, false, false, true);
            Manager_ShowStatusBar({show: true, spinner: false, message: chrome.i18n.getMessage("status_bar_autosave") + newName, hideTimeout: 1500});
            if (document.getElementById("manager_window").style.top != "-500px") chrome.storage.local.get(null, function(storage) {Manager_ReAddSessionAutomaticToManagerList(storage);});
        }, opt.autosave_interval * 60000);
    }
}

function Manager_RecreateTreeStructure(groups, folders, tabs) { // groups and folders are in object, just like tt.groups and tt.folders, but tabs are in array of treetabs objects
    if (opt.debug) Utils_log("f: RecreateTreeStructure");
    Manager_ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_quick_check_recreate_structure"), hideTimeout: 3000});
    if (groups && Object.keys(groups).length > 0) {
        for (var group in groups) {
            tt.groups[groups[group].id] = Object.assign({}, groups[group]);
        }
        Groups_AppendGroups(tt.groups);
    }
    if (folders && Object.keys(folders).length > 0) {
        for (var folder in folders) {
            tt.folders[folders[folder].id] = Object.assign({}, folders[folder]);
        }
        Folders_PreAppendFolders(tt.folders);
        Folders_AppendFolders(tt.folders);
    }
    let ttTabs = {};
    tabs.forEach(function(Tab) {
        if (Tab.parent == "pin_list") chrome.tabs.update(Tab.id, {pinned: true});
        if (Tab.parent != "") {
            let AttemptNr = 20;
            var Attempt = setInterval(function() {
                AttemptNr--;
                let tb = document.getElementById(Tab.id);
                let tbp = document.getElementById("°" + Tab.parent);
                if (tb != null && tbp != null) {
                    tbp.appendChild(tb);
                    if (Tab.expand != "") tb.classList.add(Tab.expand);
                    ttTabs[Tab.id] = {index: Tab.index, parent: Tab.parent, expand: Tab.expand};
                }
                if (AttemptNr < 0 || (tb != null && tbp != null)) clearInterval(Attempt);
            }, 500);
        }
    });
    let SortAttemptNr = 20;
    var SortAttempt = setInterval(function() {
        SortAttemptNr--;
        if (SortAttemptNr < 0 || Object.keys(ttTabs).length == tabs.length || tabs.length == 0) {
            Tabs_RearrangeTree(ttTabs, folders, false);
            clearInterval(SortAttempt);
            Groups_UpdateBgGroupsOrder();
            setTimeout(function() {
                DOM_RefreshExpandStates();
                DOM_RefreshCounters();
                tt.schedule_update_data++;
                Folders_SaveFolders();
            }, 3000);
       }
    }, 500);
}

function Manager_ShowStatusBar(p) { // show, spinner, message
    let status_bar = document.getElementById("status_bar");
    let busy_spinner = document.getElementById("busy_spinner");
    let status_message = document.getElementById("status_message");
    if (p.show) {
        status_bar.style.display = "block";
        status_message.textContent = p.message;
        if (p.spinner) {
            busy_spinner.style.opacity = "1";
        } else {
            busy_spinner.style.opacity = "0";
        }
    } else {
        busy_spinner.style.opacity = "0";
        status_message.textContent = "";
        status_bar.style.display = "none";
    }
    if (p.hideTimeout) {
        setTimeout(function() {
            busy_spinner.style.opacity = "0";
            status_message.textContent = "";
            status_bar.style.display = "none";
        }, p.hideTimeout);
    }
}