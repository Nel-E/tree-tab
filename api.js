// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


// FOLD UP TO LEVEL 3 FOR EASIER USE

var TreeTabs = {
    Tabs: {
        ttTab: class {
            constructor(p) {
                this.id = p.tab.id;
                this.pinned = p.tab.pinned;
                // this.discarded = p.tab.discarded;
                this.Node = null;

                if (document.getElementById(p.tab.id) != null && tt.tabs[p.tab.id]) {
                    tt.tabs[p.tab.id].GetFaviconAndTitle(p.addCounter);
                    return;
                }
                let ClassList = p.tab.pinned ? "pin" : "tab";
                if (p.tab.discarded) {
                    ClassList += " discarded";
                }
                if (p.tab.attention) {
                    ClassList += " attention";
                }
                if (p.AdditionalClass) {
                    ClassList += " " + p.AdditionalClass;
                }
                if (p.ExpandState) {
                    ClassList += " " + p.ExpandState;
                }
                let DIVT = document.createElement("div");                DIVT.className = ClassList;                                                                                        DIVT.id = p.tab.id;
                let DIVT_header = document.createElement("div");         DIVT_header.className = (opt.always_show_close && !opt.never_show_close) ? "tab_header close_show" : "tab_header"; DIVT_header.id = "tab_header" + p.tab.id;  DIVT_header.draggable = !p.SkipSetEvents ? true : false; DIVT.appendChild(DIVT_header);
                let DIVT_expand = document.createElement("div");         DIVT_expand.className = "expand";                 DIVT_expand.id = "exp" + p.tab.id;                               DIVT_header.appendChild(DIVT_expand);
                let DIVT_counter = document.createElement("div");        DIVT_counter.className = "tab_counter";           DIVT_counter.id = "tab_counter" + p.tab.id;                      DIVT_header.appendChild(DIVT_counter);
                let DIVT_counter_number = document.createElement("div"); DIVT_counter_number.className = "counter_number"; DIVT_counter_number.id = "counter_number" + p.tab.id;            DIVT_counter.appendChild(DIVT_counter_number);
                let DIVT_title = document.createElement("div");          DIVT_title.className = "tab_title";               DIVT_title.id = "tab_title" + p.tab.id;                          DIVT_header.appendChild(DIVT_title);
                let DIVT_close_button = document.createElement("div");   DIVT_close_button.className = "close";            DIVT_close_button.id = "close" + p.tab.id;                       DIVT_header.appendChild(DIVT_close_button);
                let DIVT_close_image = document.createElement("div");    DIVT_close_image.className = "close_img";         DIVT_close_image.id = "close_img" + p.tab.id;                    DIVT_close_button.appendChild(DIVT_close_image);
                if (opt.never_show_close) {
                    DIVT_close_button.classList.add("hidden"); DIVT_close_image.classList.add("hidden");
                }
                let DIVT_audio_indicator = document.createElement("div"); DIVT_audio_indicator.className = "tab_mediaicon"; DIVT_audio_indicator.id = "tab_mediaicon" + p.tab.id;  DIVT_header.appendChild(DIVT_audio_indicator);
                let DIVT_children = document.createElement("div");        DIVT_children.className = "children";             DIVT_children.id = "°" + p.tab.id;                     DIVT.appendChild(DIVT_children);
                let DIVT_drop_indicator = document.createElement("div");  DIVT_drop_indicator.className = "drag_indicator"; DIVT_drop_indicator.id = "_drag_indicator" + p.tab.id; DIVT.appendChild(DIVT_drop_indicator);
                if (!p.SkipSetEvents) {
                    DIVT_children.onclick = function(event) {
                        if (event.target == this && event.which == 1) {
                            TreeTabs.DOM.Deselect();
                        }
                    }
                    DIVT_children.onmousedown = function(event) {
                        if (event.target == this) {
                            if (event.which == 2 && event.target == this) {
                                event.stopImmediatePropagation();
                                TreeTabs.Groups.ActionClickGroup(this.parentNode, opt.midclick_group);
                            }
                            if (event.which == 3) {
                                TreeTabs.Menu.ShowFGlobalMenu(event);
                            }
                        }
                    }
                    DIVT_children.ondblclick = function(event) {
                        if (event.target == this) {
                            TreeTabs.Groups.ActionClickGroup(this.parentNode, opt.dbclick_group);
                        }
                    }
                    DIVT_expand.onmousedown = function(event) {
                        if (document.getElementById("main_menu").style.top != "-1000px") {
                            TreeTabs.Menu.HideMenus();
                        }
                        if (event.which == 1 && !event.shiftKey && !event.ctrlKey) {
                            TreeTabs.DOM.EventExpandBox(this.parentNode.parentNode);
                        }
                    }
                    DIVT_expand.onmouseenter = function(event) {
                        this.classList.add("hover");
                    }
                    DIVT_expand.onmouseleave = function(event) {
                        this.classList.remove("hover");
                    }
                    if (!opt.never_show_close) {
                        DIVT_close_button.onmousedown = function(event) {
                            event.stopImmediatePropagation();
                            if (event.which != 3) {
                                TreeTabs.Tabs.CloseTabs([parseInt(this.parentNode.parentNode.id)]);
                            }
                        }
                        DIVT_close_button.onmouseenter = function(event) {
                            this.classList.add("close_hover");
                        }
                        DIVT_close_button.onmouseleave = function(event) {
                            this.classList.remove("close_hover");
                        }
                    }
                    DIVT_header.onclick = function(event) {
                        event.stopImmediatePropagation();
                        if (document.getElementById("main_menu").style.top != "-1000px") {
                            TreeTabs.Menu.HideMenus();
                        } else {
                            if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target.classList.contains("tab_header")) {
                                TreeTabs.DOM.Deselect();
                                chrome.tabs.update(parseInt(this.parentNode.id), {active: true});
                            }
                        }
                    }
                    DIVT_header.ondblclick = function(event) {
                        if (event.target.classList && event.target.classList.contains("tab_header")) {
                            TreeTabs.Tabs.ActionClickTab(this.parentNode, opt.dbclick_tab);
                        }
                    }
                    DIVT_header.onmousedown = function(event) {
                        if (browserId == "V") {
                            chrome.windows.getCurrent({populate: false}, function(window) {
                                if (tt.CurrentWindowId != window.id && window.focused) {
                                    location.reload();
                                }
                            });
                        }
                        event.stopImmediatePropagation();
                        if (event.which == 1) {
                            TreeTabs.DOM.Select(event, this.parentNode);
                        }
                        if (event.which == 2) {
                            event.preventDefault();
                            TreeTabs.Tabs.ActionClickTab(this.parentNode, opt.midclick_tab);
                        }
                        if (event.which == 3) {
                            TreeTabs.Menu.ShowTabMenu(this.parentNode, event);
                        }
                    }
                    DIVT_header.onmouseover = function(event) {
                        this.classList.add("tab_header_hover");
                        if (opt.never_show_close == false && opt.always_show_close == false) {
                            this.classList.add("close_show");
                        }
                    }
                    DIVT_header.onmouseleave = function(event) {
                        this.classList.remove("tab_header_hover");
                        if (opt.never_show_close == false && opt.always_show_close == false) {
                            this.classList.remove("close_show");
                        }
                    }
                    DIVT_header.ondragstart = function(event) { // DRAG START
                        event.stopPropagation();
                        event.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
                        event.dataTransfer.setData("text", "");
                        event.dataTransfer.setData("SourceWindowId", tt.CurrentWindowId);
                        TreeTabs.DOM.CleanUpDragAndDrop();
                        tt.Dragging = true;
                        tt.DraggingGroup = false;
                        let Nodes = [];
                        if (this.parentNode.classList.contains("selected")) {
                            TreeTabs.DOM.FreezeSelection(false);
                        } else {
                            TreeTabs.DOM.FreezeSelection(true);
                            this.parentNode.classList.add("selected_temporarly");
                            this.parentNode.classList.add("selected");
                        }
                        TreeTabs.DOM.RemoveHeadersHoverClass();
                        document.querySelectorAll(".selected, .selected .tab, .selected .folder").forEach(function(s) {
                            s.classList.add("dragged_tree");
                            if (s.classList.contains("pin")) {
                                tt.DraggingPin = true;
                                Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "pin"});
                            }
                            if (s.classList.contains("tab")) {
                                tt.DraggingTab = true;
                                Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "tab"});
                            }
                            if (s.classList.contains("folder")) {
                                tt.DraggingFolder = true;
                                Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "folder", index: (tt.folders[s.id] ? tt.folders[s.id].index : 0), name: (tt.folders[s.id] ? tt.folders[s.id].name : labels.noname_group), expand: (tt.folders[s.id] ? tt.folders[s.id].expand : "")});
                            }
                        });
                        if (opt.max_tree_drag_drop && opt.max_tree_depth >= 0) {
                            document.querySelectorAll(".dragged_tree .tab, .dragged_tree .folder").forEach(function(s) {
                                let parents = TreeTabs.DOM.GetParentsByClass(s.parentNode, "dragged_tree");
                                if (parents.length > tt.DragTreeDepth) {
                                    tt.DragTreeDepth = parents.length;
                                }
                            });
                        } else {
                            tt.DragTreeDepth = -1;
                        }
                        let Parents = TreeTabs.DOM.GetAllParents(this.parentNode);
                        Parents.forEach(function(s) {
                            if (s.classList && (s.classList.contains("tab") || s.classList.contains("folder"))) {
                                s.classList.add("dragged_parents");
                            }
                        });
                        event.dataTransfer.setData("Nodes", JSON.stringify(Nodes));
                        event.dataTransfer.setData("NodesTypes", JSON.stringify({DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder}));
                        chrome.runtime.sendMessage({command: "drag_start", DragTreeDepth: tt.DragTreeDepth, DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder});
                    }
                    DIVT_header.ondragenter = function(event) {
                        this.classList.remove("tab_header_hover");
                    }
                    DIVT_header.ondragleave = function(event) {
                        TreeTabs.DOM.RemoveHighlight();
                    }
                    DIVT_header.ondragover = function(event) {
                        if (tt.DraggingGroup == false && (tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder) && this.parentNode.classList.contains("dragged_tree") == false) {
                            if (this.parentNode.classList.contains("pin")) {
                                if (this.parentNode.classList.contains("before") == false && event.layerX < this.clientWidth / 2) {
                                    TreeTabs.DOM.RemoveHighlight();
                                    this.parentNode.classList.remove("after"); this.parentNode.classList.add("before"); this.parentNode.classList.add("highlighted_drop_target");
                                }
                                if (this.parentNode.classList.contains("after") == false && event.layerX >= this.clientWidth / 2) {
                                    TreeTabs.DOM.RemoveHighlight();
                                    this.parentNode.classList.remove("before"); this.parentNode.classList.add("after"); this.parentNode.classList.add("highlighted_drop_target");
                                }
                            }
                            if (this.parentNode.classList.contains("tab")) {
                                let TabDepth = TreeTabs.Tabs.GetTabDepthInTree(this);
                                let PDepth = TabDepth + tt.DragTreeDepth;
                                let PIsGroup = this.parentNode.parentNode.parentNode.classList.contains("group");
                                // let PIsTab = this.parentNode.parentNode.parentNode.classList.contains("tab");
                                let PIsFolder = this.parentNode.parentNode.parentNode.classList.contains("folder");
                                let PIsDraggedParents = this.parentNode.classList.contains("dragged_parents");
                                if ((PIsFolder == tt.DraggingFolder || tt.DraggingFolder == false || PIsGroup == true) && this.parentNode.classList.contains("before") == false && event.layerY < this.clientHeight / 3 && (PDepth <= opt.max_tree_depth + 1 || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false || PIsDraggedParents == true)) {
                                    TreeTabs.DOM.RemoveHighlight();
                                    this.parentNode.classList.remove("inside"); this.parentNode.classList.remove("after"); this.parentNode.classList.add("before"); this.parentNode.classList.add("highlighted_drop_target");
                                }
                                if (tt.DraggingFolder == false && this.parentNode.classList.contains("inside") == false && event.layerY > this.clientHeight / 3 && event.layerY <= 2 * (this.clientHeight / 3) && (PDepth <= opt.max_tree_depth || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false || PIsDraggedParents == true)) {
                                    TreeTabs.DOM.RemoveHighlight();
                                    this.parentNode.classList.remove("before"); this.parentNode.classList.remove("after"); this.parentNode.classList.add("inside"); this.parentNode.classList.add("highlighted_drop_target");
                                }
                                if ((PIsFolder == tt.DraggingFolder || tt.DraggingFolder == false || PIsGroup == true) && this.parentNode.classList.contains("after") == false && this.parentNode.classList.contains("o") == false && event.layerY > 2 * (this.clientHeight / 3) && (PDepth <= opt.max_tree_depth + 1 || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false || PIsDraggedParents == true)) {
                                    TreeTabs.DOM.RemoveHighlight();
                                    this.parentNode.classList.remove("inside"); this.parentNode.classList.remove("before"); this.parentNode.classList.add("after"); this.parentNode.classList.add("highlighted_drop_target");
                                }
                            }
                        }
                        if (opt.open_tree_on_hover && tt.DragOverId != this.id) {
                            if (this.parentNode.classList.contains("c") && this.parentNode.classList.contains("dragged_tree") == false) {
                                clearTimeout(tt.DragOverTimer);
                                tt.DragOverId = this.id;
                                let This = this;
                                tt.DragOverTimer = setTimeout(function() {
                                    if (tt.DragOverId == This.id) {
                                        This.parentNode.classList.add("o"); This.parentNode.classList.remove("c");
                                    }
                                }, 1500);
                            }
                        }
                    }
                    DIVT_header.ondragend = function(event) {
                        if (opt.open_tree_on_hover) {
                            clearTimeout(tt.DragOverTimer);
                            tt.DragOverId = "";
                        }
                        setTimeout(function() {TreeTabs.DOM.CleanUpDragAndDrop();}, 300);
                        setTimeout(function() {chrome.runtime.sendMessage({command: "drag_end"});}, 500);
                    }
                    DIVT_audio_indicator.onmousedown = function(event) {
                        event.stopImmediatePropagation();
                        if (event.which == 1 && (this.parentNode.parentNode.classList.contains("audible") || this.parentNode.parentNode.classList.contains("muted"))) {
                            chrome.tabs.get(parseInt(this.parentNode.parentNode.id), function(tab) {
                                if (tab) {
                                    chrome.tabs.update(tab.id, {muted: !tab.mutedInfo.muted});
                                }
                            });
                        }
                    }
                }
                let parent;
                if (p.tab.pinned == true) {
                    parent = document.getElementById("pin_list");
                } else {
                    if (p.ParentId == false || p.ParentId == undefined || p.ParentId == "pin_list") {
                        parent = document.getElementById("°" + tt.active_group);
                    } else {
                        parent = document.getElementById(p.ParentId);
                        if (parent == null || parent.classList.contains("pin") || parent.parentNode.classList.contains("pin")) {
                            parent = document.getElementById("°" + tt.active_group);
                        } else {
                            parent = document.getElementById("°" + p.ParentId);
                            if (parent.children.length == 0) {
                                parent.parentNode.classList.add("o"); parent.parentNode.classList.remove("c");
                            }
                        }
                    }
                }
                if (p.Append == true && parent) {
                    parent.appendChild(DIVT);
                }
                if ((p.Append == false || p.Append == undefined) && parent) {
                    parent.prepend(DIVT);
                }

                if (p.InsertAfterId) {
                    let After = document.getElementById(p.InsertAfterId);
                    if (After != null) {
                        if ((p.tab.pinned && After.classList.contains("pin")) || (p.tab.pinned == false && (After.classList.contains("tab") || After.classList.contains("folder")))) {
                            TreeTabs.DOM.InsterAfterNode(DIVT, After);
                        } else {
                            parent.appendChild(DIVT);
                        }
                    } else {
                        parent.appendChild(DIVT);
                    }
                }
                this.Node = DIVT;
                if (!p.SkipFavicon) {
                    this.GetFaviconAndTitle(p.addCounter);
                }
                if (!p.SkipMediaIcon) {
                    this.RefreshMediaIcon(p.tab.id);
                }
                if (p.RefreshDiscarded) {
                    this.RefreshDiscarded();
                }
                if (p.tab.active && !p.SkipSetActive) {
                    TreeTabs.Tabs.SetActiveTab(p.tab.id);
                }
                if (p.Scroll) {
                    this.ScrollToTab();
                }
            }
            RemoveTab() {
                if (opt.debug) {
                    log("f: RemoveTab, tabId: " + this.id);
                }
                if (this.Node != null) {
                    this.Node.parentNode.removeChild(this.Node);
                    if (tt.tabs[this.id]) {
                        delete tt.tabs[this.id];
                    }
                }
            }
            ScrollToTab() {
                let Tab = this.Node;
                if (Tab != null) {
                    if (Tab.classList.contains("pin")) {
                        if (Tab.getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().left < 0) {
                            document.getElementById("pin_list").scrollLeft = document.getElementById("pin_list").scrollLeft + Tab.getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().left - 2;
                        } else {
                            if (Tab.getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().left > document.getElementById(tt.active_group).getBoundingClientRect().width - document.querySelector(".tab_header").getBoundingClientRect().width) {
                                document.getElementById("pin_list").scrollLeft = document.getElementById("pin_list").scrollLeft + Tab.getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().left - document.getElementById("pin_list").getBoundingClientRect().width + document.querySelector(".tab_header").getBoundingClientRect().width + 2;
                            }
                        }
                    }
                    if (Tab.classList.contains("tab") && document.querySelector("#" + tt.active_group + " [id='" + this.id + "']") != null) {
                        let Parents = TreeTabs.DOM.GetParentsByClass(Tab, "c");
                        if (Parents.length > 0) {
                            Parents.forEach(function(s) {s.classList.remove("c"); s.classList.add("o");});
                        }
                        if (Tab.getBoundingClientRect().top - document.getElementById(tt.active_group).getBoundingClientRect().top < 0) {
                            document.getElementById(tt.active_group).scrollTop = document.getElementById(tt.active_group).scrollTop + Tab.getBoundingClientRect().top - document.getElementById(tt.active_group).getBoundingClientRect().top - 2;
                        } else {
                            if (Tab.getBoundingClientRect().top - document.getElementById(tt.active_group).getBoundingClientRect().top > document.getElementById(tt.active_group).getBoundingClientRect().height - document.querySelector(".tab_header").getBoundingClientRect().height) {
                                document.getElementById(tt.active_group).scrollTop = document.getElementById(tt.active_group).scrollTop + Tab.getBoundingClientRect().top - document.getElementById(tt.active_group).getBoundingClientRect().top - document.getElementById(tt.active_group).getBoundingClientRect().height + document.querySelector(".tab_header").getBoundingClientRect().height + 10;
                            }
                        }
                    }
                }
            }
            SetTabClass(pin) {
                let GroupList = document.getElementById("°" + tt.active_group);
                let Tab = this.Node;
                if (Tab != null) {
                    if (pin) {
                        if (Tab.parentNode.id != "pin_list") {
                            document.getElementById("pin_list").appendChild(Tab);
                        }
                        Tab.classList.remove("tab"); Tab.classList.remove("o"); Tab.classList.remove("c"); Tab.classList.add("pin");
                        if (Tab.childNodes[1].childNodes.length > 0) { // flatten out children
                            let tabs = document.querySelectorAll("#°" + Tab.id + " .pin, #°" + Tab.id + " .tab");
                            for (let i = tabs.length - 1; i >= 0; i--) {
                                tabs[i].classList.remove("tab"); tabs[i].classList.remove("o"); tabs[i].classList.remove("c"); tabs[i].classList.add("pin");
                                TreeTabs.DOM.InsterAfterNode(tabs[i], Tab);
                                chrome.tabs.update(parseInt(tabs[i].id), {pinned: true});
                            }
                            let folders = document.querySelectorAll("#°" + Tab.id + " .folder");
                            for (let i = folders.length - 1; i >= 0; i--) {
                                GroupList.prepend(folders[i]);
                            }
                        }
                        chrome.tabs.update(parseInt(Tab.id), {pinned: true});
                    } else {
                        if (Tab.parentNode.id == "pin_list") { // if coming from pin_list
                            if (GroupList.childNodes.length > 0) {
                                GroupList.insertBefore(Tab, GroupList.childNodes[0]);
                            } else {
                                GroupList.appendChild(Tab);
                            }
                        }
                        Tab.classList.remove("pin"); Tab.classList.remove("attention"); Tab.classList.add("tab");
                        TreeTabs.DOM.RefreshExpandStates();
                        chrome.tabs.update(parseInt(Tab.id), {pinned: false});
                    }
                    TreeTabs.DOM.RefreshGUI();
                }
            }
            DuplicateTab() {
                let OriginalTabNode = this.Node;
                chrome.tabs.duplicate(parseInt(this.id), function(tab) {
                    let DupRetry = setInterval(function() {
                        let DupTab = document.getElementById(tab.id);
                        if (DupTab != null && OriginalTabNode != null) {
                            if (browserId == "F" && tab.pinned) {
                                DupTab.classList.remove("tab");
                                DupTab.classList.add("pin");
                            }
                            TreeTabs.DOM.InsterAfterNode(DupTab, OriginalTabNode);
                            TreeTabs.DOM.RefreshExpandStates();
                            tt.schedule_update_data++;
                            TreeTabs.DOM.RefreshCounters();
                            clearInterval(DupRetry);
                        }
                    }, 10);
                    setTimeout(function() {
                        if (DupRetry) {
                            clearInterval(DupRetry);
                        }
                    }, 500);
                });
            }
            GetFaviconAndTitle(addCounter) {
                let t = document.getElementById(this.id);
                if (t != null) {
                    chrome.tabs.get(parseInt(t.id), async function(tab) {
                        if (tab) {
                            let title = tab.title ? tab.title : tab.url;
                            let tHeader = t.childNodes[0];
                            let tTitle = t.childNodes[0].childNodes[2];
                            if (tab.status == "complete" || tab.discarded) {
                                t.classList.remove("loading");
                                tTitle.textContent = title;
                                tHeader.title = title;
                                if (opt.show_counter_tabs_hints) {
                                    tHeader.setAttribute("tabTitle", title);
                                }
                                let Img = new Image();
                                let CachedFavicon = browserId == "F" ? await browser.sessions.getTabValue(tab.id, "CachedFaviconUrl") : "chrome://favicon/" + tab.url;
                                let TryCases = [tab.favIconUrl, CachedFavicon, "./theme/icon_empty.svg"];
                                TreeTabs.Tabs.LoadFavicon(tab.id, Img, TryCases, tHeader, 0);
                            }
                            if (tab.status == "loading" && tab.discarded == false) {
                                title = tab.title ? tab.title : labels.loading;
                                t.classList.add("loading");
                                tHeader.style.backgroundImage = "";
                                tHeader.title = labels.loading;
                                if (opt.show_counter_tabs_hints) {
                                    tHeader.setAttribute("tabTitle", labels.loading);
                                }
                                tTitle.textContent = labels.loading;
                                setTimeout(function() {
                                    if (document.getElementById(tab.id) != null) {
                                        tt.tabs[tab.id].GetFaviconAndTitle(addCounter);
                                    }
                                }, 1000);
                            }
                            if (addCounter && (opt.show_counter_tabs || opt.show_counter_tabs_hints)) {
                                tt.tabs[t.id].RefreshTabCounter();
                            }
                        }
                    });
                }
            }
            RefreshDiscarded() { // set discarded class
                let t = document.getElementById(this.id);
                if (t != null) {
                    chrome.tabs.get(parseInt(t.id), function(tab) {
                        if (tab) {
                            if (tab.discarded) {
                                t.classList.add("discarded"); t.classList.remove("audible"); t.classList.remove("muted");
                            } else {
                                t.classList.remove("discarded");
                            }
                        }
                    });
                }
            }
            SetAttentionIcon() { // set attention class
                let t = document.getElementById(this.id);
                if (t != null) {
                    t.classList.add("attention");
                }
            }
            RefreshMediaIcon() { // change media icon
                let t = document.getElementById(this.id);
                if (t != null) {
                    chrome.tabs.get(parseInt(t.id), function(tab) {
                        if (tab) {
                            if (tab.mutedInfo.muted && !tab.discarded) {
                                t.classList.remove("audible"); t.classList.add("muted");
                            }
                            if (!tab.mutedInfo.muted && tab.audible && !tab.discarded) {
                                t.classList.remove("muted"); t.classList.add("audible");
                            }
                            if ((!tab.mutedInfo.muted && !tab.audible) || tab.discarded) {
                                t.classList.remove("audible"); t.classList.remove("muted");
                            }
                        }
                    });
                }
            }
            RefreshTabCounter() {
                let t = document.getElementById(this.id);
                if (t != null && t.childNodes[0]) {
                    let title = t.childNodes[0].getAttribute("tabTitle");
                    if (t != null && title != null) {
                        if (t.classList.contains("o") || t.classList.contains("c")) {
                            if (opt.show_counter_tabs) {
                                t.childNodes[0].childNodes[1].childNodes[0].textContent = document.querySelectorAll("[id='" + t.id + "'] .tab").length;
                            }
                            if (opt.show_counter_tabs_hints) {
                                t.childNodes[0].title = (document.querySelectorAll("[id='" + t.id + "'] .tab").length + " • ") + title;
                            }
                        } else {
                            t.childNodes[0].title = title;
                        }
                    }
                }
            }
        },
        LoadFavicon: async function(tabId, Img, TryUrls, TabHeaderNode, i) {
            if (TabHeaderNode) {
                Img.src = TryUrls[i];
                Img.onload = function() {
                    TabHeaderNode.style.backgroundImage = "url(" + TryUrls[i] + ")";
                    if (browserId == "F") { // cache Firefox favicon - solution for bug with empty favicons in unloaded tabs
                        // if (TryUrls[i].startsWith("data") == false) {
                        browser.sessions.setTabValue(tabId, "CachedFaviconUrl", TryUrls[i]);
                        // }
                    }
                };
                Img.onerror = function() {
                    if (i < TryUrls.length) {
                        TreeTabs.Tabs.LoadFavicon(tabId, Img, TryUrls, TabHeaderNode, (i + 1));
                    }
                }
            }
        },
        SaveTabs: async function() {
            setInterval(function() {
                if (tt.schedule_update_data > 1) {
                    tt.schedule_update_data = 1;
                }
                if (tt.schedule_update_data > 0) {
                    let pins_data = [];
                    let tabs_data = [];
                    for (let tabId in tt.tabs) {
                        if (tt.tabs[tabId].Node != null && tt.tabs[tabId].Node.parentNode != null) {
                            if (tt.tabs[tabId].pinned) {
                                pins_data.push({id: tabId, parent: "pin_list", index: Array.from(tt.tabs[tabId].Node.parentNode.children).indexOf(tt.tabs[tabId].Node), expand: ""});
                            } else {
                                tabs_data.push({id: tabId, parent: tt.tabs[tabId].Node.parentNode.parentNode.id, index: Array.from(tt.tabs[tabId].Node.parentNode.children).indexOf(tt.tabs[tabId].Node), expand: (tt.tabs[tabId].Node.classList.contains("c") ? "c" : (tt.tabs[tabId].Node.classList.contains("o") ? "o" : ""))});
                            }
                        }
                    }
                    chrome.runtime.sendMessage({command: "update_all_tabs", pins: pins_data, tabs: tabs_data});
                    tt.schedule_update_data--;
                }
            }, 1000);
        },
        RearrangeBrowserTabs: async function() {
            setInterval(function() {
                if (tt.schedule_rearrange_tabs > 0) {
                    tt.schedule_rearrange_tabs--;
                    if (opt.debug) {
                        log("f: RearrangeBrowserTabs");
                    }
                    chrome.tabs.query({currentWindow: true}, function(tabs) {
                        let ttTabIds = Array.prototype.map.call(document.querySelectorAll(".pin, .tab"), function(s) {return parseInt(s.id);});
                        let tabIds = Array.prototype.map.call(tabs, function(t) {return t.id;});
                        TreeTabs.Tabs.RearrangeBrowserTabsLoop(ttTabIds, tabIds, ttTabIds.length - 1);
                    });
                }
            }, 1000);
        },
        RearrangeBrowserTabsLoop: async function(ttTabIds, tabIds, tabIndex) {
            if (opt.debug) {
                log("f: RearrangeBrowserTabsLoop");
            }
            if (tabIndex >= 0 && tt.schedule_rearrange_tabs == 0) {
                if (ttTabIds[tabIndex] != tabIds[tabIndex]) {
                    chrome.tabs.move(ttTabIds[tabIndex], {index: tabIndex});
                }
                setTimeout(function() {TreeTabs.Tabs.RearrangeBrowserTabsLoop(ttTabIds, tabIds, (tabIndex - 1));}, 0);
            }
        },
        RearrangeTree: function(TTtabs, TTfolders, show_finish_in_status) {
            TreeTabs.Manager.ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_rearranging_tabs")});
            document.querySelectorAll(".pin, .tab, .folder").forEach(function(Node) {
                let Sibling = Node.nextElementSibling;
                if (Sibling) {
                    let NodeIndex = TTtabs[Node.id] ? TTtabs[Node.id].index : (TTfolders[Node.id] ? TTfolders[Node.id].index : undefined);
                    while (Sibling && NodeIndex) {
                        let SiblingIndex = TTtabs[Sibling.id] ? TTtabs[Sibling.id].index : (TTfolders[Sibling.id] ? TTfolders[Sibling.id].index : 0);
                        if (NodeIndex > SiblingIndex) {
                            TreeTabs.DOM.InsterAfterNode(Node, Sibling);
                        }
                        Sibling = Sibling.nextElementSibling ? Sibling.nextElementSibling : false;
                    }
                }
                if (show_finish_in_status) {
                    TreeTabs.Manager.ShowStatusBar({show: true, spinner: false, message: chrome.i18n.getMessage("status_bar_rearranging_finished"), hideTimeout: 1000});
                }
            });
        },
        Detach: function(Nodes, NodesTypes, Group) {
            if (opt.debug) {
                log("f: Detach");
            }
            let folderNodes = {};
            let TabsIds = [];
            for (let i = 0; i < Nodes.length; i++) {
                if (Nodes[i].NodeClass == "folder") {
                    folderNodes[Nodes[i].id] = {id: Nodes[i].id, parent: (Nodes[i].parent).substr(1), name: Nodes[i].name, index: Nodes[i].index, expand: Nodes[i].expand};
                }
                if (Nodes[i].NodeClass == "pin") {
                    TabsIds.push(parseInt(Nodes[i].id));
                }
                if (Nodes[i].NodeClass == "tab") {
                    TabsIds.push(parseInt(Nodes[i].id));
                }
            }
            chrome.windows.get(tt.CurrentWindowId, {populate : true}, function(window) {
                if (window.tabs.length == 1) {
                    return;
                }
                if (TabsIds.length == window.tabs.length) {
                    if (opt.debug) {
                        log("You are trying to detach all tabs! Skipping!");
                    }
                    return;
                }
                let params = TabsIds.length > 0 ? {tabId: TabsIds[0], state: window.state} : {state: window.state};
                chrome.windows.create(params, function(new_window) {
                    chrome.tabs.update(new_window.tabs[0].id, {active: true});
					chrome.runtime.sendMessage({command: "get_groups", windowId: new_window.id}, function(g) {
                        if (NodesTypes.DraggingGroup) {
                            let GroupsToDetach = Object.assign({}, g); // if there will be a multi groups selection, below I will need for each group loop
                            GroupsToDetach[Group.id] = Group;
                            chrome.runtime.sendMessage({command: "save_groups", groups: GroupsToDetach, windowId: new_window.id});
                            setTimeout(function() {TreeTabs.Groups.GroupRemove(Group.id, false);}, 2000);
                        }
                        chrome.runtime.sendMessage({command: "save_folders", folders: folderNodes, windowId: new_window.id});
                        for (let i = 0; i < Nodes.length; i++) {
                            if (Nodes[i].NodeClass == "pin") {
                                chrome.tabs.update(parseInt(Nodes[i].id), {pinned: true});
                                chrome.runtime.sendMessage({command: "update_tab", tabId: Nodes[i].id, tab: {parent: "pin_list"}});
                            }
                            if (Nodes[i].NodeClass == "tab") {
                                chrome.runtime.sendMessage({command: "update_tab", tabId: Nodes[i].id, tab: {parent: (Nodes[i].parent).substr(1)}});
                            }
                            if (Nodes[i].NodeClass == "folder") {
                                TreeTabs.Folders.RemoveFolder(Nodes[i].id);
                            }
                        }
                        if (TabsIds.length > 1) {
                            TabsIds.splice(0, 1);
                            chrome.tabs.move(TabsIds, {windowId: new_window.id, index:-1}, function(MovedTabs) {
                                for (let i = 0; i < Nodes.length; i++) {
                                    if (Nodes[i].NodeClass == "pin") {
                                        chrome.tabs.update(parseInt(Nodes[i].id), {pinned: true});
                                    }
                                    if (Nodes[i].NodeClass == "folder") {
                                        TreeTabs.Folders.RemoveFolder(Nodes[i].id);
                                    }
                                }
                                let Stop = 500;
                                let DetachNodes = setInterval(function() {
                                    Stop--;
                                    let all_moved = true;
                                    for (let i = 0; i < Nodes.length; i++) {
                                        if (document.getElementById(Nodes[i].id) != null) {
                                            all_moved = false;
                                        }
                                        if (Nodes[i].NodeClass == "pin") {
                                            chrome.runtime.sendMessage({command: "update_tab", tabId: Nodes[i].id, tab: {parent: "pin_list"}});
                                        }
                                        if (Nodes[i].NodeClass == "tab") {
                                            chrome.runtime.sendMessage({command: "update_tab", tabId: Nodes[i].id, tab: {parent: (Nodes[i].parent).substr(1)}});
                                        }
                                    }
                                    if (all_moved || Stop < 0) {
                                        setTimeout(function() {clearInterval(DetachNodes);}, 300);
                                    }
                                }, 100);
                            });
                        }
                    });
                });
            });
        },
        DiscardTabs: function(tabsIds) {
            let delay = 100;
            let tabNode = document.getElementById(tabsIds[0]);
            if (tabNode == null || tabNode.classList.contains("discarded") || tabNode.classList.contains("active_tab")) {
                delay = 5;
            } else {
                chrome.tabs.discard(tabsIds[0]);
            }
            tabsIds.splice(0, 1);
            if (tabsIds.length > 0) {
                setTimeout(function() {TreeTabs.Tabs.DiscardTabs(tabsIds);}, delay);
            }
        },
        FindTab: function(input) { // find and select tabs
            let ButtonFilterClear = document.getElementById("button_filter_clear");
            document.querySelectorAll(".filtered, .highlighted_search").forEach(function(s) {
                s.classList.remove("filtered"); s.classList.remove("selected"); s.classList.remove("selected_last"); s.classList.remove("highlighted_search");
            })
            if (input.length == 0) {
                document.getElementById("filter_box").value = "";
                ButtonFilterClear.style.opacity = "0"; ButtonFilterClear.title = "";
                return;
            } else {
                ButtonFilterClear.style.opacity = "1"; ButtonFilterClear.title = labels.clear_filter;
            }
            tt.SearchIndex = 0;
            let FilterType = document.getElementById("button_filter_type");
            let searchUrl = FilterType.classList.contains("url");
            let searchTitle = FilterType.classList.contains("title");
            let query = {windowId: tt.CurrentWindowId, pinned: false};
            if (input == "*audible") {
                query = {windowId: tt.CurrentWindowId, discarded: false, audible: true, muted: false, pinned: false};
            }
            if (input == "*muted") {
                query = {windowId: tt.CurrentWindowId, discarded: false, muted: true, pinned: false};
            }
            if (input == "*unloaded") {
                query = {windowId: tt.CurrentWindowId, discarded: true, pinned: false};
            }
            if (input == "*loaded") {
                query = {windowId: tt.CurrentWindowId, discarded: false, pinned: false};
            }
            chrome.tabs.query(query, function(tabs) {
                tabs.forEach(function(Tab) {
                    let t = document.getElementById(Tab.id);
                    if (input == "*audible" || input == "*muted" || input == "*unloaded" || input == "*loaded") {
                        t.classList.add("filtered"); t.classList.add("selected");
                    } else {
                        if (searchUrl) {
                            if (Tab.url.toLowerCase().match(input.toLowerCase())) {
                                t.classList.add("filtered"); t.classList.add("selected");
                            }
                        }
                        if (searchTitle) {
                            if (Tab.title.toLowerCase().match(input.toLowerCase())) {
                                t.classList.add("filtered"); t.classList.add("selected");
                            }
                        }
                    }
                });
            });
        },
        CloseTabs: function(tabsIds) {
            if (opt.debug) {
                log("f: TreeTabs.Tabs.CloseTabs, tabsIds are: " + JSON.stringify(tabsIds));
            }
            tabsIds.forEach(function(tabId) {
                let t = document.getElementById(tabId);
                if (t != null) {
                    t.classList.add("will_be_closed");
                }
            });
            let activeTab = document.querySelector(".pin.active_tab, #" + tt.active_group + " .tab.active_tab");
            if (activeTab != null && tabsIds.indexOf(parseInt(activeTab.id)) != -1) {
                TreeTabs.Tabs.SwitchActiveTabBeforeClose(tt.active_group);
            }
            setTimeout(function() {
                tabsIds.forEach(function(tabId) {
                    let t = document.getElementById(tabId);
                    if (t != null && t.classList.contains("pin") && opt.allow_pin_close) {
                        t.parentNode.removeChild(t);
                        chrome.tabs.update(tabId, {pinned: false});
                        chrome.runtime.sendMessage({command: "update_tab", tabId: tabId, tab: {parent: "pin_list"}});
                    }
                    if (tabId == tabsIds[tabsIds.length - 1]) {
                        setTimeout(function() {chrome.tabs.remove(tabsIds, null);}, 10);
                        TreeTabs.DOM.RefreshGUI();
                    }
                });
            }, 200);
        },
        OpenNewTab: function(pin, parentId) {
            if (pin) {
                chrome.tabs.create({pinned: true}, function(tab) {
                    if (parentId) {
                        if (parentId) {
                            let parent = document.getElementById("#pin_list");
                            if (parent != null && tt.tabs[tab.id]) {
                                parent.appendChild(tt.tabs[tab.id].Node);
                            }
                            tt.schedule_update_data++;
                        }
                        tt.schedule_update_data++;
                    }
                });
            } else {
                chrome.tabs.create({}, function(tab) {
                    if (parentId) {
                        let parent = document.getElementById("#°"+parentId);
                        if (parent != null && tt.tabs[tab.id]) {
                            parent.appendChild(tt.tabs[tab.id].Node);
                        }
                        tt.schedule_update_data++;
                    }
                    if (opt.move_tabs_on_url_change == "from_empty") {
                        chrome.runtime.sendMessage({command: "remove_tab_from_empty_tabs", tabId: tab.id});
                    }
                });
            }
        },
        GetTabDepthInTree: function(Node) {
            let Depth = 0;
            let ParentNode = Node;
            if (ParentNode == null) {
                return Parents;
            }
            let Stop = false;
            while (!Stop && ParentNode.parentNode != null) {
                if (ParentNode.parentNode.classList != undefined) {
                    if (ParentNode.parentNode.classList.contains("tab")) {
                        Depth++;
                    }
                    if (ParentNode.parentNode.classList.contains("folder") || ParentNode.parentNode.classList.contains("group")) {
                        Stop = true;
                    } else {
                        ParentNode = ParentNode.parentNode;
                    }
                } else {
                    Stop = true;
                }
            }
            return Depth;
        },
        ActionClickTab: function(TabNode, bgOption) {
            if (bgOption == "new_tab") {
                TreeTabs.Tabs.OpenNewTab(TabNode.classList.contains("pin"), TabNode.id);
            }
            if (bgOption == "expand_collapse") {
                TreeTabs.DOM.EventExpandBox(TabNode);
            }
            if (bgOption == "close_tab") {
                if ((TabNode.classList.contains("pin") && opt.allow_pin_close) || TabNode.classList.contains("tab")) {
                    TreeTabs.Tabs.CloseTabs([parseInt(TabNode.id)]);
                }
            }
            if (bgOption == "undo_close_tab") {
                chrome.sessions.getRecentlyClosed(null, function(sessions) {
                    if (sessions.length > 0) {
                        chrome.sessions.restore(null, function(restored) {});
                    }
                });
            }
            if (bgOption == "reload_tab") {
                chrome.tabs.reload(parseInt(TabNode.id));
            }
            if (bgOption == "unload_tab") {
                if (TabNode.classList.contains("active_tab")) {
                    TreeTabs.Tabs.SwitchActiveTabBeforeClose(tt.active_group);
                    setTimeout(function() {TreeTabs.Tabs.DiscardTabs([parseInt(TabNode.id)]);}, 500);
                } else {
                    TreeTabs.Tabs.DiscardTabs([parseInt(TabNode.id)]);
                }
            }
            if (bgOption == "activate_previous_active" && TabNode.classList.contains("active_tab")) {
                let PrevActiveTabId = parseInt(tt.groups[tt.active_group].prev_active_tab);
                if (isNaN(PrevActiveTabId) == false) {
                    chrome.tabs.update(PrevActiveTabId, {active: true});
                }
            }
        },
        SetActiveTab: function(tabId, switchToGroup) {
            if (opt.debug) {
                log("f: SetActiveTab, tabId: " + tabId);
            }
            let Tab = document.getElementById(tabId);
            if (Tab != null) {
                let TabGroup = TreeTabs.DOM.GetParentsByClass(Tab, "group");
                if (TabGroup.length) {
                    if (Tab.classList.contains("tab")) {
                        TreeTabs.Groups.SetActiveTabInGroup(TabGroup[0].id, tabId);
                    }
                    if (switchToGroup) {
                        TreeTabs.Groups.SetActiveGroup(TabGroup[0].id, false, false); // not going to scroll, because mostly it's going to change to a new active in group AFTER switch, so we are not going to scroll to previous active tab
                    }
                }
                document.querySelectorAll(".selected").forEach(function(s) {
                    s.classList.remove("selected");
                });
                document.querySelectorAll(".pin, #" + tt.active_group + " .tab").forEach(function(s) {
                    s.classList.remove("active_tab"); s.classList.remove("selected"); s.classList.remove("selected_last"); s.classList.remove("selected_frozen"); s.classList.remove("selected_temporarly"); s.classList.remove("tab_header_hover");
                });
                TreeTabs.DOM.RemoveHighlight();
                Tab.classList.remove("attention"); Tab.classList.add("active_tab");
                if (tt.tabs[tabId]) {
                    tt.tabs[tabId].ScrollToTab();
                }
            }
        },
        SwitchActiveTabBeforeClose: function(ActiveGroupId) {
            if (opt.debug) {
                log("f: SwitchActiveTabBeforeClose");
            }
            let activeGroup = document.getElementById(ActiveGroupId);
            if (document.querySelectorAll("#" + ActiveGroupId + " .tab:not(.will_be_closed)").length <= 1 && document.querySelector(".pin.active_tab") == null) { // CHECK IF CLOSING LAST TAB IN ACTIVE GROUP
                let pins = document.querySelectorAll(".pin");
                if (pins.length > 0) { // IF THERE ARE ANY PINNED TABS, ACTIVATE IT
                    if (opt.debug) {
                        log("available pin, switching to: " + pins[pins.length - 1].id);
                    }
                    chrome.tabs.update(parseInt(pins[pins.length - 1].id), {active: true});
                    return;
                } else { // NO OTHER CHOICE BUT TO SEEK IN ANOTHER GROUP
                    if (opt.after_closing_active_tab == "above" || opt.after_closing_active_tab == "above_seek_in_parent") {
                        if (activeGroup.previousSibling != null) {
                            if (document.querySelectorAll("#" + activeGroup.previousSibling.id + " .tab").length > 0) {
                                TreeTabs.Groups.SetActiveGroup(activeGroup.previousSibling.id, true, true);
                            } else {
                                TreeTabs.Tabs.SwitchActiveTabBeforeClose(activeGroup.previousSibling.id);
                                return;
                            }
                        } else {
                            TreeTabs.Groups.SetActiveGroup("tab_list", true, true);
                        }
                    } else {
                        if (activeGroup.nextSibling != null) {
                            if (document.querySelectorAll("#" + activeGroup.nextSibling.id + " .tab").length > 0) {
                                TreeTabs.Groups.SetActiveGroup(activeGroup.nextSibling.id, true, true);
                            } else {
                                TreeTabs.Tabs.SwitchActiveTabBeforeClose(activeGroup.nextSibling.id);
                                return;
                            }
                        } else {
                            TreeTabs.Groups.SetActiveGroup("tab_list", true, true);
                        }
                    }
                }
            } else {
                if (opt.debug) {
                    log("available tabs in current group, switching option is: " + opt.after_closing_active_tab);
                }
                if (opt.after_closing_active_tab == "above") {
                    TreeTabs.Tabs.ActivatePrevTab(true);
                }
                if (opt.after_closing_active_tab == "below") {
                    TreeTabs.Tabs.ActivateNextTab(true);
                }
                if (opt.after_closing_active_tab == "above_seek_in_parent") {
                    TreeTabs.Tabs.ActivatePrevTabSameLevel();
                }
                if (opt.after_closing_active_tab == "below_seek_in_parent") {
                    TreeTabs.Tabs.ActivateNextTabSameLevel();
                }
            }
        },
        ActivateNextTabSameLevel: function() {
            let activeTab = document.querySelector("#" + tt.active_group + " .tab.active_tab") != null ? document.querySelector("#" + tt.active_group + " .tab.active_tab") : document.querySelector(".pin.active_tab");
            if (activeTab == null) {
                return;
            }
            let NewActiveId;
            let Node = activeTab;
            if (activeTab.classList.contains("tab")) {
                if (opt.promote_children && activeTab.childNodes[1].firstChild != null && activeTab.childNodes[1].firstChild.classList.contains("tab") && activeTab.childNodes[1].firstChild.classList.contains("will_be_closed") == false) {
                    NewActiveId = activeTab.childNodes[1].firstChild.id;
                }
            }
            if (NewActiveId == undefined) {
                while (NewActiveId == undefined && Node.nextSibling != null && Node.classList != undefined) {
                    if ((Node.nextSibling.classList.contains("pin") || Node.nextSibling.classList.contains("tab")) && Node.nextSibling.classList.contains("will_be_closed") == false) {
                        NewActiveId = Node.nextSibling.id;
                    }
                    Node = Node.nextSibling;
                }
            }
            if (NewActiveId == undefined) {
                while (NewActiveId == undefined && Node.previousSibling != null && Node.classList != undefined) {
                    if ((Node.previousSibling.classList.contains("pin") || Node.previousSibling.classList.contains("tab")) && Node.previousSibling.classList.contains("will_be_closed") == false) {
                        NewActiveId = Node.previousSibling.id;
                    }
                    Node = Node.previousSibling;
                }
            }
            if (NewActiveId == undefined) {
                TreeTabs.Tabs.ActivatePrevTab();
            }
            if (NewActiveId != undefined) {
                let tabId = parseInt(NewActiveId);
                if (isNaN(tabId) == false) {
                    chrome.tabs.update(tabId, {active: true});
                }
            }
        },
        ActivatePrevTabSameLevel: function() {
            let activeTab = document.querySelector("#" + tt.active_group + " .tab.active_tab") != null ? document.querySelector("#" + tt.active_group + " .tab.active_tab") : document.querySelector(".pin.active_tab");
            if (activeTab == null) {
                return;
            }
            let NewActiveId;
            let Node = activeTab;
            if (activeTab.classList.contains("tab")) {
                if (opt.promote_children && activeTab.childNodes[1].firstChild != null && activeTab.childNodes[1].firstChild.classList.contains("tab") && activeTab.childNodes[1].firstChild.classList.contains("will_be_closed") == false) {
                    NewActiveId = activeTab.childNodes[1].firstChild.id;
                }
            }
            if (NewActiveId == undefined) {
                while (NewActiveId == undefined && Node.previousSibling != null && Node.classList != undefined) {
                    if ((Node.previousSibling.classList.contains("pin") || Node.previousSibling.classList.contains("tab")) && Node.previousSibling.classList.contains("will_be_closed") == false) {
                        NewActiveId = Node.previousSibling.id;
                    }
                    Node = Node.previousSibling;
                }
            }
            if (NewActiveId == undefined) {
                while (NewActiveId == undefined && Node.nextSibling != null && Node.classList != undefined) {
                    if ((Node.nextSibling.classList.contains("pin") || Node.nextSibling.classList.contains("tab")) && Node.nextSibling.classList.contains("will_be_closed") == false) {
                        NewActiveId = Node.nextSibling.id;
                    }
                    Node = Node.nextSibling;
                }
            }
            if (NewActiveId == undefined) {
                TreeTabs.Tabs.ActivateNextTab();
            }
            if (NewActiveId != undefined) {
                let tabId = parseInt(NewActiveId);
                if (isNaN(tabId) == false) {
                    chrome.tabs.update(tabId, {active: true});
                }
            }
        },
        ActivateNextTab: function(allow_loop) {
            let activeTab = document.querySelector("#" + tt.active_group + " .tab.active_tab") != null ? document.querySelector("#" + tt.active_group + " .tab.active_tab") : document.querySelector(".pin.active_tab");
            if (activeTab == null) {
                return;
            }
            let NewActiveId;
            let Node = activeTab;
            let parents = TreeTabs.DOM.GetAllParents(activeTab);
            while (Node != null && Node.classList != undefined) {
                if (parents.indexOf(Node) == -1 && Node != activeTab && (Node.classList.contains("pin") || Node.classList.contains("tab")) && Node.classList.contains("will_be_closed") == false) {
                    NewActiveId = Node.id;
                    Node = null;
                } else {
                    if (parents.indexOf(Node) == -1 && Node.childNodes[1] && Node.childNodes[1].classList.contains("children") && Node.childNodes[1].childNodes.length > 0 && Node.classList.contains("c") == false) { // GO TO CHILDREN
                        Node = Node.childNodes[1].firstChild;
                    } else {
                        if (Node.nextSibling) { // GO TO NEXT SIBLING
                            Node = Node.nextSibling;
                        } else { // GO UP TO PARENT
                            Node = Node.parentNode.parentNode;
                        }
                    }
                }
            }
            if (allow_loop && NewActiveId == undefined) {
                let RestartLoopFromPin = document.querySelector(".pin");
                let RestartLoopFromTab = document.querySelector("#°" + tt.active_group + " .tab");
                if (activeTab.classList.contains("pin")) {
                    if (RestartLoopFromTab != null) {
                        NewActiveId = RestartLoopFromTab.id;
                    } else {
                        if (RestartLoopFromPin != null) {
                            NewActiveId = RestartLoopFromPin.id;
                        }
                    }
                }
                if (activeTab.classList.contains("tab")) {
                    if (RestartLoopFromPin != null) {
                        NewActiveId = RestartLoopFromPin.id;
                    } else {
                        if (RestartLoopFromTab != null) {
                            NewActiveId = RestartLoopFromTab.id;
                        }
                    }
                }
            }
            if (NewActiveId != undefined) {
                let tabId = parseInt(NewActiveId);
                if (isNaN(tabId) == false) {
                    chrome.tabs.update(tabId, {active: true});
                }
            }
        },
        ActivatePrevTab: function(allow_loop) {
            let activeTab = document.querySelector("#" + tt.active_group + " .tab.active_tab") != null ? document.querySelector("#" + tt.active_group + " .tab.active_tab") : document.querySelector(".pin.active_tab");
            if (activeTab == null) {
                return;
            }
            let NewActiveId;
            let Node = activeTab;
            while (Node != null && Node.classList != undefined) {
                if (Node != activeTab && (Node.classList.contains("pin") || Node.classList.contains("tab")) && Node.classList.contains("will_be_closed") == false) {
                    NewActiveId = Node.id;
                    Node = null;
                } else {
                    if (Node.previousSibling) { // GO TO PREV SIBLING
                        Node = Node.previousSibling;
                        while (Node != null && Node.classList != undefined && Node.childNodes[1] && Node.childNodes[1].classList.contains("children") && Node.childNodes[1].childNodes.length > 0 && Node.classList.contains("c") == false) {
                            Node = Node.childNodes[1].lastChild;
                        }
                    } else { // GO UP TO PARENT
                        Node = Node.parentNode.parentNode;
                    }
                }
            }
            if (allow_loop && NewActiveId == undefined) {
                let RestartLoopFromPin = document.querySelector(".pin:last-child");
                let RestartLoopFromTab = document.querySelectorAll("#°" + tt.active_group + " .tab");
                if (activeTab.classList.contains("pin")) {
                    if (RestartLoopFromTab.length > 0) {
                        NewActiveId = RestartLoopFromTab[RestartLoopFromTab.length - 1].id;
                    } else {
                        if (RestartLoopFromPin != null) {
                            NewActiveId = RestartLoopFromPin.id;
                        }
                    }
                }
                if (activeTab.classList.contains("tab")) {
                    if (RestartLoopFromPin != null) {
                        NewActiveId = RestartLoopFromPin.id;
                    } else {
                        if (RestartLoopFromTab != null) {
                            NewActiveId = RestartLoopFromTab[RestartLoopFromTab.length - 1].id;
                        }
                    }
                }
            }
            if (NewActiveId != undefined) {
                let tabId = parseInt(NewActiveId);
                if (isNaN(tabId) == false) {
                    chrome.tabs.update(tabId, {active: true});
                }
            }
        }
    },
    Folders: {
        // ttFolder: class {
        //     constructor(p) {
        //         this.id = p.tab.id;
        //     }
        // },
        AddNewFolder: function(p) { // folderId: string, ParentId: string, Name: string, Index: int, ExpandState: ("o","c"), AdditionalClass: string, SetEvents: bool
            let newId = p.folderId ? p.folderId : TreeTabs.Folders.GenerateNewFolderID();
            tt.folders[newId] = {id: newId, parent: (p.ParentId ? p.ParentId : ""), index: (p.Index ? p.Index : 0), name: (p.Name ? p.Name : labels.noname_group), expand: (p.ExpandState ? p.ExpandState : "")};
            TreeTabs.Folders.AppendFolder({folderId: newId, Name: tt.folders[newId].name, InsertAfterId: p.InsertAfterId, ParentId: p.ParentId, ExpandState: p.ExpandState, SkipSetEvents: p.SkipSetEvents, AdditionalClass: p.AdditionalClass});
            TreeTabs.Folders.SaveFolders();
            TreeTabs.DOM.RefreshCounters();
            TreeTabs.DOM.RefreshExpandStates();
            return newId;
        },
        AppendFolder: function(p) { // folderId: string, ParentId: string, Name: string, ExpandState: ("o","c"), AdditionalClass: string, SetEvents: bool
            let ClassList = "folder";
            if (p.ExpandState) {
                ClassList += " " + p.ExpandState;
            }
            if (p.AdditionalClass != undefined) {
                ClassList += " " + p.AdditionalClass;
            }
            if (document.getElementById(p.folderId) == null) {
                let DIVF = document.createElement("div");                        DIVF.className = ClassList;                        DIVF.id = p.folderId;
                let DIVF_header = document.createElement("div");                 DIVF_header.className = (opt.always_show_close && !opt.never_show_close) ? "folder_header close_show" : "folder_header";  DIVF_header.id = p.folderId + "_folder_header";  DIVF_header.draggable = !p.SkipSetEvents ? true : false;  DIVF.appendChild(DIVF_header);
                let DIVF_expand = document.createElement("div");                 DIVF_expand.className = "folder_icon";             DIVF_expand.id = p.folderId + "_folder_expand";                        DIVF_header.appendChild(DIVF_expand);
                let DIVF_counter = document.createElement("div");                DIVF_counter.className = "folder_counter";         DIVF_counter.id = p.folderId + "_folder_counter";                      DIVF_header.appendChild(DIVF_counter);
                let DIVF_counter_number = document.createElement("div");         DIVF_counter_number.className = "counter_number";  DIVF_counter_number.id = p.folderId + "_folder_counter_number";        DIVF_counter.appendChild(DIVF_counter_number);
                let DIVF_title = document.createElement("div");                  DIVF_title.className = "folder_title";             DIVF_title.id = p.folderId + "_folder_title";                          DIVF_title.textContent = p.Name;                 DIVF_header.appendChild(DIVF_title);
                let DIVF_children = document.createElement("div");               DIVF_children.className = "children";              DIVF_children.id = "°" + p.folderId;                                   DIVF.appendChild(DIVF_children);
                let DIVF_drop_indicator = document.createElement("div");         DIVF_drop_indicator.className = "drag_indicator";  DIVF_drop_indicator.id = p.folderId + "_drag_indicator";               DIVF.appendChild(DIVF_drop_indicator);
                let DIVF_close_button = document.createElement("div");           DIVF_close_button.className = "close";             DIVF_close_button.id = "close" + p.folderId;                           DIVF_header.appendChild(DIVF_close_button);
                let DIVF_close_image = document.createElement("div");            DIVF_close_image.className = "close_img";          DIVF_close_image.id = "close_img" + p.folderId;                        DIVF_close_button.appendChild(DIVF_close_image);
                if (opt.never_show_close) {
                    DIVF_close_button.classList.add("hidden"); DIVF_close_image.classList.add("hidden");
                }
                if (!p.SkipSetEvents) {
                    DIVF_children.ondblclick = function(event) {
                        if (event.target == this) {
                            TreeTabs.Groups.ActionClickGroup(this.parentNode, opt.dbclick_group);
                        }
                    }
                    DIVF_children.onclick = function(event) {
                        if (event.target == this && event.which == 1) {
                            TreeTabs.DOM.Deselect();
                        }
                    }
                    DIVF_children.onmousedown = function(event) {
                        event.stopImmediatePropagation();
                        if (event.target == this) {
                            if (event.which == 2 && event.target == this) {
                                TreeTabs.Groups.ActionClickGroup(this.parentNode, opt.midclick_group);
                            }
                            if (event.which == 3) {
                                TreeTabs.Menu.ShowFGlobalMenu(event);
                            }
                        }
                    }
                    if (!opt.never_show_close) {
                        DIVF_close_button.onmousedown = function(event) {
                            event.stopImmediatePropagation();
                            if (event.which != 3) {
                                TreeTabs.Folders.RemoveFolder(this.parentNode.parentNode.id);
                            }
                        }
                        DIVF_close_button.onmouseenter = function(event) {
                            this.classList.add("close_hover");
                        }
                        DIVF_close_button.onmouseleave = function(event) {
                            this.classList.remove("close_hover");
                        }
                    }
                    DIVF_header.onclick = function(event) {
                        if (event.which == 1 && !event.shiftKey) { // SELECT FOLDER
                            if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target.classList.contains("folder_header")) {
                                TreeTabs.DOM.Deselect();
                            }
                        }
                    }
                    DIVF_header.onmousedown = function(event) {
                        event.stopImmediatePropagation();
                        if (document.getElementById("main_menu").style.top != "-1000px") {
                            TreeTabs.Menu.HideMenus();
                        }
                        if (event.which == 1) {
                            TreeTabs.DOM.Select(event, this.parentNode);
                        }
                        if (event.which == 2) {
                            event.preventDefault();
                            TreeTabs.Folders.ActionClickFolder(this.parentNode, opt.midclick_folder);
                        }
        
                        if (event.which == 3) { // SHOW FOLDER MENU
                            TreeTabs.Menu.ShowFolderMenu(this.parentNode, event);
                        }
                    }
                    DIVF_header.ondblclick = function(event) { // edit folder
                        if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target.classList.contains("folder_header")) {
                            TreeTabs.Folders.ActionClickFolder(this.parentNode, opt.dbclick_folder);
                        }
                    }
                    DIVF_header.ondragstart = function(event) { // DRAG START
                        event.stopPropagation();
                        event.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
                        event.dataTransfer.setData("text", "");
                        event.dataTransfer.setData("SourceWindowId", tt.CurrentWindowId);
                        TreeTabs.DOM.CleanUpDragAndDrop();
                        tt.Dragging = true;
                        tt.DraggingGroup = false;
                        tt.DragTreeDepth = -1;
                        let Nodes = [];
                        if (this.parentNode.classList.contains("selected")) {
                            TreeTabs.DOM.FreezeSelection(false);
                        } else {
                            TreeTabs.DOM.FreezeSelection(true);
                            this.parentNode.classList.add("selected_temporarly"); this.parentNode.classList.add("selected");
                        }
                        TreeTabs.DOM.RemoveHeadersHoverClass();
                        document.querySelectorAll(".selected, .selected .tab, .selected .folder").forEach(function(s) {
                            s.classList.add("dragged_tree");
                            if (s.classList.contains("pin")) {
                                tt.DraggingPin = true;
                                Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "pin"});
                            }
                            if (s.classList.contains("tab")) {
                                tt.DraggingTab = true;
                                Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "tab"});
                            }
                            if (s.classList.contains("folder")) {
                                tt.DraggingFolder = true;
                                Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "folder", index: (tt.folders[s.id] ? tt.folders[s.id].index : 0), name: (tt.folders[s.id] ? tt.folders[s.id].name : labels.noname_group), expand: (tt.folders[s.id] ? tt.folders[s.id].expand : "")});
                            }
                        });
                        let DraggedFolderParents = TreeTabs.DOM.GetParentsByClass(this.parentNode, "folder");
                        DraggedFolderParents.forEach(function(s) {
                            s.classList.add("dragged_parents");
                        });
                        event.dataTransfer.setData("Nodes", JSON.stringify(Nodes));
                        event.dataTransfer.setData("NodesTypes", JSON.stringify({DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder}));
                        chrome.runtime.sendMessage({command: "drag_start", DragTreeDepth: tt.DragTreeDepth, DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder});
                    }
                    DIVF_header.ondragenter = function(event) {
                        this.classList.remove("folder_header_hover");
                    }
                    DIVF_header.ondragend = function(event) {
                        if (opt.open_tree_on_hover) {
                            clearTimeout(tt.DragOverTimer);
                            tt.DragOverId = "";
                        }
                        setTimeout(function() {TreeTabs.DOM.CleanUpDragAndDrop();}, 300);
                        setTimeout(function() {chrome.runtime.sendMessage({command: "drag_end"});}, 500);
                    }
                    DIVF_header.onmouseover = function(event) {
                        this.classList.add("folder_header_hover");
                        if (opt.never_show_close == false && opt.always_show_close == false) {
                            this.classList.add("close_show");
                        }
                    }
                    DIVF_header.onmouseleave = function(event) {
                        this.classList.remove("folder_header_hover");
                        if (opt.never_show_close == false && opt.always_show_close == false) {
                            this.classList.remove("close_show");
                        }
                    }
                    DIVF_header.ondragleave = function(event) {
                        TreeTabs.DOM.RemoveHighlight();
                    }
                    DIVF_header.ondragover = function(event) {
                        if (tt.DraggingGroup == false && (tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder) && this.parentNode.classList.contains("dragged_tree") == false) {
                            if (this.parentNode.classList.contains("before") == false && event.layerY < this.clientHeight / 3) {
                                TreeTabs.DOM.RemoveHighlight();
                                this.parentNode.classList.remove("inside"); this.parentNode.classList.remove("after"); this.parentNode.classList.add("before"); this.parentNode.classList.add("highlighted_drop_target");
                            }
                            if (this.parentNode.classList.contains("inside") == false && event.layerY > this.clientHeight / 3 && event.layerY <= 2 * (this.clientHeight / 3)) {
                                TreeTabs.DOM.RemoveHighlight();
                                this.parentNode.classList.remove("before"); this.parentNode.classList.remove("after"); this.parentNode.classList.add("inside"); this.parentNode.classList.add("highlighted_drop_target");
                            }
                            if (this.parentNode.classList.contains("after") == false && this.parentNode.classList.contains("o") == false && event.layerY > 2 * (this.clientHeight / 3)) {
                                TreeTabs.DOM.RemoveHighlight();
                                this.parentNode.classList.remove("inside"); this.parentNode.classList.remove("before"); this.parentNode.classList.add("after"); this.parentNode.classList.add("highlighted_drop_target");
                            }
                        }
                        if (opt.open_tree_on_hover && tt.DragOverId != this.id) {
                            if (this.parentNode.classList.contains("c") && this.parentNode.classList.contains("dragged_tree") == false) {
                                clearTimeout(tt.DragOverTimer);
                                tt.DragOverId = this.id;
                                let This = this;
                                tt.DragOverTimer = setTimeout(function() {
                                    if (tt.DragOverId == This.id) {
                                        This.parentNode.classList.add("o"); This.parentNode.classList.remove("c");
                                    }
                                }, 1500);
                            }
                        }
                    }
                    DIVF_expand.onmousedown = function(event) {
                        event.stopPropagation();
                        if (document.getElementById("main_menu").style.top != "-1000px") {
                            TreeTabs.Menu.HideMenus();
                        }
                        if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target == this) { // EXPAND/COLLAPSE FOLDER
                            event.stopPropagation();
                            TreeTabs.DOM.EventExpandBox(this.parentNode.parentNode);
                            TreeTabs.DOM.RefreshExpandStates();
                            TreeTabs.DOM.RefreshCounters();
                        }
                    }
                }
                if (p.ParentId == "pin_list" || p.ParentId == "" || p.ParentId == undefined || document.getElementById("°" + p.ParentId) == null) {
                    document.getElementById("°" + tt.active_group).appendChild(DIVF);
                } else {
                    document.getElementById("°" + p.ParentId).appendChild(DIVF);
                }
                if (p.InsertAfterId) {
                    let After = document.getElementById(p.InsertAfterId);
                    if (After != null) {
                        TreeTabs.DOM.InsterAfterNode(DIVF, After);
                    }
                }
        
            }
        },
        GenerateNewFolderID: function() {
            let newID = "";
            while (newID == "") {
                newID = "f_" + GenerateRandomID();
                if (document.getElementById(newID) != null) {
                    newID = "";
                }
            }
            return newID;
        },
        PreAppendFolders: function(Folders) {
            for (let folderId in Folders) {
                TreeTabs.Folders.AppendFolder({folderId: folderId, Name: Folders[folderId].name, ParentId: "tab_list", ExpandState: Folders[folderId].expand});
            }
        },
        AppendFolders: function(Folders) {
            for (let folderId in Folders) {
                let f = document.getElementById(folderId);
                let parent = document.getElementById("°" + Folders[folderId].parent);
                if (f != null && parent != null && Folders[folderId].parent != f.parentNode.parentNode.id && parent.parentNode.classList.contains("pin") == false) {
                    parent.appendChild(f);
                }
            }
        },
        SaveFolders: function() {
            document.querySelectorAll(".folder").forEach(function(s) {
                tt.folders[s.id].parent = s.parentNode.parentNode.id;
                tt.folders[s.id].index = Array.from(s.parentNode.children).indexOf(s);
                tt.folders[s.id].expand = (s.classList.contains("c") ? "c" : (s.classList.contains("o") ? "o" : ""));
            });
            chrome.runtime.sendMessage({command: "save_folders", folders: tt.folders, windowId: tt.CurrentWindowId});
        },
        RemoveFolder: function(FolderId) {
            if (opt.debug) {
                log("f: RemoveFolder, folderId " + FolderId);
            }
            let folder = document.getElementById(FolderId);
            if (folder != null) {
                if (opt.promote_children == true) {
                    if (opt.promote_children_in_first_child == true && folder.childNodes[1].childNodes.length > 1) {
                        TreeTabs.DOM.PromoteChildrenToFirstChild(folder);
                    } else {
                        let Children = folder.childNodes[1];
                        while (Children.lastChild) {
                            TreeTabs.DOM.InsterAfterNode(Children.lastChild, folder);
                        }
                    }
                } else {
                    document.querySelectorAll("#" + FolderId + " .tab").forEach(function(s) {
                        chrome.tabs.remove(parseInt(s.id), null);
                    });
                    document.querySelectorAll("#" + FolderId + " .folder").forEach(function(s) {
                        delete tt.folders[s.id];
                    });
                }
                folder.parentNode.removeChild(folder);
                delete tt.folders[FolderId];
                TreeTabs.DOM.RefreshExpandStates();
                chrome.runtime.sendMessage({command: "save_folders", folders: tt.folders, windowId: tt.CurrentWindowId});
            }
        },
        ShowRenameFolderDialog: function(FolderId) { // Rename folder popup
            if (opt.debug) {
                log("f: ShowRenameFolderDialog, folderId " + FolderId);
            }
            TreeTabs.DOM.HideRenameDialogs();
            if (tt.folders[FolderId]) {
                let name = document.getElementById("folder_edit_name");
                name.value = tt.folders[FolderId].name;
                let folderEditDialog = document.getElementById("folder_edit");
                folderEditDialog.setAttribute("FolderId", FolderId);
                folderEditDialog.style.display = "block";
                folderEditDialog.style.top = document.getElementById("toolbar").getBoundingClientRect().height + document.getElementById("pin_list").getBoundingClientRect().height + 8 + "px";
                folderEditDialog.style.left = "";
                setTimeout(function() {document.getElementById("folder_edit_name").select();}, 5);
            }
        },
        FolderRenameConfirm: function() { // when pressed OK in folder popup
            let name = document.getElementById("folder_edit_name");
            let FolderId = document.getElementById("folder_edit").getAttribute("FolderId");
            tt.folders[FolderId].name = name.value;
            document.getElementById(FolderId + "_folder_title").textContent = name.value;
            TreeTabs.DOM.HideRenameDialogs();
            if (opt.debug) {
                log("f: FolderRenameConfirm, folderId " + FolderId + ", name: " + name.value);
            }
            chrome.runtime.sendMessage({command: "save_folders", folders: tt.folders, windowId: tt.CurrentWindowId});
            TreeTabs.DOM.RefreshCounters();
        },
        ActionClickFolder: function(FolderNode, bgOption) {
            if (opt.debug) {
                log("f: ActionClickFolder, folderId " + FolderNode.id + ", bgOption: " + bgOption);
            }
            if (bgOption == "rename_folder") {
                TreeTabs.Folders.ShowRenameFolderDialog(FolderNode.id);
            }
            if (bgOption == "new_folder") {
                let FolderId = TreeTabs.Folders.AddNewFolder({ParentId: FolderNode.id});
                TreeTabs.Folders.ShowRenameFolderDialog(FolderId);
            }
            if (bgOption == "new_tab") {
                TreeTabs.Tabs.OpenNewTab(false, FolderNode.id);
            }
            if (bgOption == "expand_collapse") {
                TreeTabs.DOM.EventExpandBox(FolderNode);
            }
            if (bgOption == "close_folder") {
                TreeTabs.Folders.RemoveFolder(FolderNode.id);
            }
            if (bgOption == "unload_folder") {
                let tabsArr = [];
                document.querySelectorAll("#" + FolderNode.id + " .tab").forEach(function(s) {
                    tabsArr.push(parseInt(s.id));
                });
                TreeTabs.Tabs.DiscardTabs(tabsArr);
            }
        }
    },
    Groups: {
        // ttGroup: class {
            // constructor() {
            // }
        // },
        AddNewGroup: function(Name, FontColor) {
            let newId = TreeTabs.Groups.GenerateNewGroupID();
            tt.groups[newId] = {id: newId, index: 0, active_tab: 0, prev_active_tab: 0, name: (Name ? Name : labels.noname_group), font: (FontColor ? FontColor : "")};
            if (opt.debug) {
                log("f: AddNewGroup, groupId: " + newId + ", Name: " + Name + ", FontColor: " + FontColor);
            }
            TreeTabs.Groups.AppendGroupToList(newId, tt.groups[newId].name, tt.groups[newId].font, true);
            TreeTabs.Groups.UpdateBgGroupsOrder();
            return newId;
        },
        SaveGroups: function() {
            chrome.runtime.sendMessage({command: "save_groups", groups: tt.groups, windowId: tt.CurrentWindowId});
        },
        AppendGroups: function(Groups) {
            TreeTabs.Groups.AppendGroupToList("tab_list", labels.ungrouped_group, "", true);
            for (var group in Groups) {
                TreeTabs.Groups.AppendGroupToList(Groups[group].id, Groups[group].name, Groups[group].font, true);
                if (document.querySelectorAll(".group").length == Object.keys(Groups).length) {
                    TreeTabs.Groups.RearrangeGroupsButtons();
                    setTimeout(function() {TreeTabs.Groups.RearrangeGroupsLists();}, 50);
                }
            }
        },
        RearrangeGroupsButtons: function(first_loop) {
            document.querySelectorAll(".group_button").forEach(function(s) {
                let groupId = (s.id).substr(1);
                if (tt.groups[groupId]) {
                    if (s.parentNode.childNodes[tt.groups[groupId].index] != undefined) {
                        let Ind = Array.from(s.parentNode.children).indexOf(s);
                        if (Ind > tt.groups[groupId].index) {
                            TreeTabs.DOM.InsterBeforeNode(s, s.parentNode.childNodes[tt.groups[groupId].index]);
                        } else {
                            TreeTabs.DOM.InsterAfterNode(s, s.parentNode.childNodes[tt.groups[groupId].index]);
                        }
                        let newInd = Array.from(s.parentNode.children).indexOf(s);
                        if (newInd != tt.groups[groupId].index && first_loop) {
                            TreeTabs.Groups.RearrangeGroupsButtons(false);
                        }
                    }
                }
            });
        },
        RearrangeGroupsLists: function() {
            if (opt.debug) {
                log("f: RearrangeGroupsLists");
            }
            let activegroup = document.getElementById(tt.active_group);
            let scroll = activegroup.scrollTop;
            let groups = document.getElementById("groups");
            document.querySelectorAll(".group_button").forEach(function(s) {
                let group = document.getElementById((s.id).substr(1));
                if (group != null) {
                    groups.appendChild(group);
                }
            });
            activegroup.scrollTop = scroll;
        },
        UpdateBgGroupsOrder: function() {
            document.querySelectorAll(".group_button").forEach(function(s) {
                if (tt.groups[(s.id).substr(1)]) {
                    tt.groups[(s.id).substr(1)].index = Array.from(s.parentNode.children).indexOf(s);
                }
            });
            TreeTabs.Groups.SaveGroups();
        },
        AppendGroupToList: function(groupId, group_name, font_color, SetEvents) {
            if (document.getElementById(groupId) == null) {
                let grp = document.createElement("div");       grp.className = "group";       grp.id = groupId;         grp.style.display = "none";     document.getElementById("groups").appendChild(grp);
                let grr = document.createElement("div");       grr.className = "children";    grr.id = "°" + groupId;   grp.appendChild(grr);
                if (SetEvents) {
                    grp.onclick = function(event) {
                        if (event.which == 1 && event.target == this && event.clientX < (this.childNodes[0].getBoundingClientRect().width + this.getBoundingClientRect().left)) {
                            TreeTabs.DOM.Deselect();
                        }
                    }
                    grp.onmousedown = function(event) {
                        event.stopImmediatePropagation();
                        if (event.which == 1 && event.target == this && event.clientX < (this.childNodes[0].getBoundingClientRect().width + this.getBoundingClientRect().left)) {
                            TreeTabs.Menu.HideMenus();
                            return false;
                        }
                        if (event.which == 2) {
                            event.preventDefault();
                            TreeTabs.Groups.ActionClickGroup(this, opt.midclick_group);
                        }
                        if (event.which == 3 && event.target.id == this.id) {
                            TreeTabs.Menu.ShowFGlobalMenu(event);
                        }
                        if (browserId == "V") {
                            chrome.windows.getCurrent({
                                populate: false
                            }, function(window) {
                                if (tt.CurrentWindowId != window.id && window.focused) {
                                    location.reload();
                                }
                            });
                        }
                    }
                    grp.ondragover = function(event) {
                            if (event.target.id == this.id && (tt.DraggingGroup || tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder)) {
                                TreeTabs.DOM.RemoveHighlight();
                                this.classList.add("highlighted_drop_target");
                            }
                        }
                    grp.ondblclick = function(event) {
                        if (event.target.id == this.id) {
                            TreeTabs.Groups.ActionClickGroup(this, opt.dbclick_group);
                        }
                    }
                    if (opt.switch_with_scroll) {
                        TreeTabs.DOM.BindTabsSwitchingToMouseWheel(groupId);
                    }
                }
            }
            if (document.getElementById("_" + groupId) == null) {
                let gbn = document.createElement("div");          gbn.className = "group_button";      gbn.draggable = SetEvents ? true : false;   gbn.id = "_" + groupId;         document.getElementById("group_list").appendChild(gbn);
                let gte = document.createElement("span");         gte.className = "group_title";       gte.id = "_gte" + groupId;                  gte.textContent = group_name;   gte.style.color = font_color != "" ? ("#" + font_color) : (window.getComputedStyle(document.getElementById("body"), null).getPropertyValue("--group_list_default_font_color"));     gbn.appendChild(gte);
                var di = document.createElement("div");           di.className = "drag_indicator";     di.id = "di" + groupId;                     gbn.appendChild(di);
                if (SetEvents) {
                    gbn.onclick = function(event) {
                        TreeTabs.Groups.SetActiveGroup(this.id.substr(1), true, true);
                    }
                    gbn.onmousedown = function(event) {
                        if (event.which == 3) {
                            TreeTabs.Menu.ShowFGroupMenu(document.getElementById(this.id.substr(1)), event);
                        }
                    }
                    gbn.ondblclick = function(event) {
                        if (event.which == 1 && this.id != "_tab_list") {
                            TreeTabs.Groups.ShowGroupEditWindow((this.id).substr(1));
                        }
                    }
                    gbn.ondragstart = function(event) { // DRAG START
                        event.stopPropagation();
                        event.dataTransfer.setDragImage(document.getElementById("DragImage"), 0, 0);
                        event.dataTransfer.setData("text", "");
                        event.dataTransfer.setData("SourceWindowId", tt.CurrentWindowId);
                        TreeTabs.DOM.CleanUpDragAndDrop();
                        tt.Dragging = true;
                        tt.DraggingGroup = true;
                        tt.DragTreeDepth = -1;
                        let groupId = this.id.substr(1);
                        let Group = Object.assign({}, tt.groups[groupId]);
                        let Nodes = [];
                        document.querySelectorAll("#" + groupId + " .tab, #" + groupId + " .folder").forEach(function(s) {
                            // if (s.classList.contains("pin")) {
                            //     tt.DraggingPin = true;
                            //     Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "pin"});
                            // }
                            // if (s.classList.contains("tab")) {
                            //     tt.DraggingTab = true;
                            //     Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "tab"});
                            // }
                            // if (s.classList.contains("folder")) {
                            //     tt.DraggingFolder = true;
                            //     Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "folder", index: (tt.folders[s.id] ? tt.folders[s.id].index : 0), name: (tt.folders[s.id] ? tt.folders[s.id].name : labels.noname_group), expand: (tt.folders[s.id] ? tt.folders[s.id].expand : "")});
                            // }
                            if (s.classList.contains("tab")) {
                                tt.DraggingTab = true;
                                Nodes.push({id: s.id, parent: s.parentNode.id, selected: false, temporary: false, NodeClass: "tab"});
                            }
                            if (s.classList.contains("folder")) {
                                tt.DraggingFolder = true;
                                Nodes.push({id: s.id, parent: s.parentNode.id, selected: false, temporary: false, NodeClass: "folder", index: (tt.folders[s.id] ? tt.folders[s.id].index : 0), name: (tt.folders[s.id] ? tt.folders[s.id].name : labels.noname_group), expand: (tt.folders[s.id] ? tt.folders[s.id].expand : "")});
                            }
                        });
                        event.dataTransfer.setData("Group", JSON.stringify(Group));
                        event.dataTransfer.setData("Nodes", JSON.stringify(Nodes));
                        event.dataTransfer.setData("NodesTypes", JSON.stringify({DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder}));
                        chrome.runtime.sendMessage({command: "drag_start", DragTreeDepth: tt.DragTreeDepth, DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder});
                    }
                    gbn.ondragover = function(event) {
                        if (this.classList.contains("inside") == false && tt.DraggingGroup == false && (tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder)) {
                            TreeTabs.DOM.RemoveHighlight(); this.classList.remove("before"); this.classList.remove("after"); this.classList.add("inside"); this.classList.add("highlighted_drop_target");
                        }
            
                        if (this.classList.contains("before") == false && event.layerY < this.clientHeight / 2 && tt.DraggingGroup) {
                            TreeTabs.DOM.RemoveHighlight(); this.classList.add("before"); this.classList.remove("after"); this.classList.remove("inside"); this.classList.add("highlighted_drop_target");
                        }
                        if (this.classList.contains("after") == false && event.layerY > this.clientHeight / 2 && tt.DraggingGroup) {
                            TreeTabs.DOM.RemoveHighlight(); this.classList.remove("before"); this.classList.add("after"); this.classList.remove("inside"); this.classList.add("highlighted_drop_target");
                        }
                    }
                    gbn.ondragenter = function(event) {
                        if (opt.open_tree_on_hover) {
                            if (this.classList.contains("active") == false && (tt.DraggingGroup || tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder)) {
                                clearTimeout(tt.DragOverTimer);
                                let This = this;
                                tt.DragOverTimer = setTimeout(function() {TreeTabs.Groups.SetActiveGroup(This.id.substr(1), false, false);}, 1500);
                            }
                        }
                    }
                    TreeTabs.DOM.RefreshGUI();
                }
            }
        },
        GenerateNewGroupID: function() {
            let newID = "";
            while (newID == "") {
                newID = "g_" + GenerateRandomID();
                if (document.getElementById(newID) != null) {
                    newID = "";
                }
            }
            return newID;
        },
        GroupRemove: function(groupId, close_tabs) { // remove group, delete tabs if close_tabs is true
            if (close_tabs) {
                let tabIds = Array.prototype.map.call(document.querySelectorAll("#" + groupId + " .tab"), function(s) {return parseInt(s.id);});
                TreeTabs.Tabs.CloseTabs(tabIds);
                document.querySelectorAll("#" + groupId + " .folder").forEach(function(s) {
                    TreeTabs.Folders.RemoveFolder(s.id);
                });
            } else {
                let TabList = document.getElementById("°tab_list");
                let GroupList = document.getElementById("°" + groupId);
                if (TabList != null && GroupList != null) {
                    while (GroupList.firstChild) {
                        TabList.appendChild(GroupList.firstChild);
                    }
                }
                TreeTabs.DOM.RefreshExpandStates();
                TreeTabs.DOM.RefreshCounters();
            }
            if (groupId != "tab_list") {
                delete tt.groups[groupId];
                let active_tab_is_pin = document.querySelector(".pin.active_tab");
                if (groupId == tt.active_group && active_tab_is_pin == null) {
                    if (document.getElementById("_" + groupId).previousSibling) {
                        TreeTabs.Groups.SetActiveGroup((document.getElementById("_" + groupId).previousSibling.id).substr(1), true, true);
                    } else {
                        if (document.getElementById("_" + groupId).nextSibling) {
                            TreeTabs.Groups.SetActiveGroup((document.getElementById("_" + groupId).nextSibling.id).substr(1), true, true);
                        } else {
                            TreeTabs.Groups.SetActiveGroup("tab_list", true, true);
                        }
                    }
                }
                let group = document.getElementById(groupId);
                if (group != null) {
                    group.parentNode.removeChild(group);
                }
                let groupButton = document.getElementById("_" + groupId);
                if (groupButton != null) {
                    groupButton.parentNode.removeChild(groupButton);
                }
            }
            TreeTabs.Groups.SaveGroups();
            tt.schedule_update_data++;
        },
        KeepOnlyOneActiveTabInGroup: function() {
            let active_tabs = document.querySelectorAll("#" + tt.active_group + " .active_tab");
            if (active_tabs.length > 1) {
                chrome.tabs.query({currentWindow: true, active: true}, function(activeTab) {
                    TreeTabs.Tabs.SetActiveTab(activeTab[0].id, false);
                });
            }
        },
        SetActiveGroup: function(groupId, switch_to_active_in_group, scroll_to_active) {
            if (opt.debug) {
                log("f: SetActiveGroup, groupId: " + groupId + ", switch_to_active_in_group: " + switch_to_active_in_group + ", scroll_to_active: " + scroll_to_active);
            }
            let group = document.getElementById(groupId);
            if (group != null) {
                tt.active_group = groupId;
                document.querySelectorAll(".group_button").forEach(function(s) {
                    s.classList.remove("active_group");
                });
                document.getElementById("_" + groupId).classList.add("active_group");
                document.querySelectorAll(".group").forEach(function(s) {
                    s.style.display = "none";
                });
                group.style.display = "";
                TreeTabs.DOM.RefreshGUI();
                TreeTabs.DOM.HideRenameDialogs()
                let activeTab = document.querySelector("#" + groupId + " .active_tab");
                if (activeTab != null) {
                    if (switch_to_active_in_group) {
                        chrome.tabs.update(parseInt(activeTab.id), {active: true});
                    }
                    if (scroll_to_active && tt.tabs[activeTab.id]) {
                        tt.tabs[activeTab.id].ScrollToTab();
                    }
                    TreeTabs.Groups.KeepOnlyOneActiveTabInGroup();
                }
                if (groupId == "tab_list") {
                    document.querySelectorAll("#button_remove_group, #button_edit_group").forEach(function(s) {
                        s.classList.add("disabled");
                    });
                } else {
                    document.querySelectorAll("#button_remove_group, #button_edit_group").forEach(function(s) {
                        s.classList.remove("disabled");
                    });
                }
                chrome.runtime.sendMessage({command: "set_active_group", active_group: groupId, windowId: tt.CurrentWindowId});
                TreeTabs.DOM.RefreshExpandStates();
                TreeTabs.DOM.RefreshCounters();
                if (browserId == "F" && opt.hide_other_groups_tabs_firefox) {
                    let HideTabIds = Array.prototype.map.call(document.querySelectorAll(".group:not([id='" + groupId + "']) .tab"), function(s) {
                        return parseInt(s.id);
                    });
                    let ShowTabIds = Array.prototype.map.call(document.querySelectorAll("#" + groupId + " .tab"), function(s) {
                        return parseInt(s.id);
                    });
                    browser.tabs.hide(HideTabIds);
                    browser.tabs.show(ShowTabIds);
                }
            }
        },
        SetActiveTabInGroup: function(groupId, tabId) {
            if (document.querySelector("#" + groupId + " [id='" + tabId + "']") != null && tt.groups[groupId] != undefined) {
                if (groupId != tt.active_group) {
                    TreeTabs.Groups.SetActiveGroup(groupId, false, true);
                }
                if (tt.groups[groupId]) {
                    tt.groups[groupId].prev_active_tab = tt.groups[groupId].active_tab;
                    tt.groups[groupId].active_tab = parseInt(tabId);
                }
                TreeTabs.Groups.SaveGroups();
            }
        },
        ShowGroupEditWindow: function(groupId) { // Edit group popup
            TreeTabs.DOM.HideRenameDialogs();
            if (tt.groups[groupId]) {
                let name = document.getElementById("group_edit_name");
                name.value = tt.groups[groupId].name;
                let groupEditDialog = document.getElementById("group_edit");
                groupEditDialog.setAttribute("groupId", groupId);
                groupEditDialog.style.display = "block";
                groupEditDialog.style.top = document.getElementById("toolbar").getBoundingClientRect().height + document.getElementById("pin_list").getBoundingClientRect().height + 8 + "px";
                groupEditDialog.style.left = "";
                let DefaultGroupButtonFontColor = window.getComputedStyle(document.getElementById("body"), null).getPropertyValue("--group_list_default_font_color");
                let GroupEditFont = document.getElementById("group_edit_font");
                GroupEditFont.style.backgroundColor = (tt.groups[groupId].font == "" ? DefaultGroupButtonFontColor : "#" + tt.groups[groupId].font);
                setTimeout(function() {document.getElementById("group_edit_name").select();}, 5);
            }
        },
        GroupEditConfirm: function() { // when pressed OK in group popup
            let groupId = document.getElementById("group_edit").getAttribute("groupId");
            if (tt.groups[groupId]) {
                let GroupEditName = document.getElementById("group_edit_name");
                tt.groups[groupId].name = GroupEditName.value;
                let GroupEditFont = document.getElementById("group_edit_font");
                let DefaultGroupButtonFontColor = window.getComputedStyle(document.getElementById("body"), null).getPropertyValue("--group_list_default_font_color");
                let ThisGroupButtonFontColor = TreeTabs.Utils.RGBtoHex(GroupEditFont.style.backgroundColor);
                if ("#" + ThisGroupButtonFontColor != DefaultGroupButtonFontColor) {
                    tt.groups[groupId].font = ThisGroupButtonFontColor;
                    document.getElementById("_gte" + groupId).style.color = "#" + ThisGroupButtonFontColor;
                }
                TreeTabs.DOM.HideRenameDialogs();
                TreeTabs.DOM.RefreshGUI();
                TreeTabs.Groups.SaveGroups();
            }
        },
        RestoreStateOfGroupsToolbar: function() {
            chrome.runtime.sendMessage({command: "get_group_bar", windowId: tt.CurrentWindowId}, function(response) {
                let toolbarGroups = document.getElementById("toolbar_groups");
                if (response == true) {
                    toolbarGroups.style.display = "inline-block";
                    toolbarGroups.style.width = "19px";
                    toolbarGroups.style.borderRight = "1px solid var(--group_list_borders)";
                    toolbarGroups.classList.remove("hidden");
                } else {
                    toolbarGroups.style.display = "none";
                    toolbarGroups.style.width = "0px";
                    toolbarGroups.style.borderRight = "none";
                    toolbarGroups.classList.add("hidden");
                }
            });
        },
        GroupsToolbarToggle: function() {
            let toolbarGroups = document.getElementById("toolbar_groups");
            toolbarGroups.classList.toggle("hidden");
            if (toolbarGroups.classList.contains("hidden")) {
                toolbarGroups.style.display = "none";
                toolbarGroups.style.width = "0px";
                toolbarGroups.style.borderRight = "none";
                chrome.runtime.sendMessage({command: "set_group_bar", group_bar: false, windowId: tt.CurrentWindowId});
            } else {
                toolbarGroups.style.display = "inline-block";
                toolbarGroups.style.width = "19px";
                toolbarGroups.style.borderRight = "1px solid var(--group_list_borders)";
                chrome.runtime.sendMessage({command: "set_group_bar", group_bar: true, windowId: tt.CurrentWindowId});
            }
            TreeTabs.DOM.RefreshGUI();
        },
        ActionClickGroup: function(Node, bgOption) {
            if (bgOption == "new_tab") {
                if (Node.id == "pin_list") {
                    TreeTabs.Tabs.OpenNewTab(true, undefined);
                }
                if (Node.classList.contains("tab") || Node.classList.contains("folder") || Node.classList.contains("group")) {
                    TreeTabs.Tabs.OpenNewTab(false, Node.id);
                }
            }
            if (bgOption == "activate_previous_active") {
                chrome.tabs.update(parseInt(tt.groups[tt.active_group].prev_active_tab), {active: true});
            }
            if (bgOption == "undo_close_tab") {
                chrome.sessions.getRecentlyClosed(null, function(sessions) {
                    if (sessions.length > 0) {
                        chrome.sessions.restore(null, function(restored) {});
                    }
                });
            }
        },
        SetActiveTabInEachGroup: function() { // SET ACTIVE TAB FOR EACH GROUP
            chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
                if (tabs.length) {
                    TreeTabs.Tabs.SetActiveTab(tabs[0].id);
                    chrome.runtime.sendMessage({command: "get_active_group", windowId: tt.CurrentWindowId}, function(response) {
                        if (response) {
                            TreeTabs.Groups.SetActiveGroup(response, false, true);
                            for (var group in tt.groups) {
                                let ActiveInGroup = document.querySelector("#" + group + " [id='" + tt.groups[group].active_tab + "']");
                                if (ActiveInGroup != null) {
                                    ActiveInGroup.classList.add("active_tab");
                                }
                            }
                            if (tabs[0].pinned) {
                                let ActiveTabinActiveGroup = document.querySelectorAll("#" + tt.active_group + " .active_tab");
                                if (ActiveTabinActiveGroup != null) {
                                    ActiveTabinActiveGroup.forEach(function(s) {
                                        s.classList.remove("active_tab");
                                    });
                                }
                            }
                        } else {
                            TreeTabs.Groups.SetActiveGroup("tab_list", false, true);
                        }
                    });
                }
            });
        }
    },
    Utils: {
        RGBtoHex: function(color) { // color in format "rgb(r,g,b)" or simply "r,g,b" (can have spaces, but must contain "," between values)
            color = color.replace(/[rgb(]|\)|\s/g, "");
            color = color.split(",");
            return color.map(function(v) {return ("0" + Math.min(Math.max(parseInt(v), 0), 255).toString(16)).slice(-2);}).join("");
        },
        HexToRGB: function(hex, alpha) {
            hex = hex.replace('#', '');
            let r = parseInt(hex.length == 3 ? hex.slice(0, 1).repeat(2) : hex.slice(0, 2), 16);
            let g = parseInt(hex.length == 3 ? hex.slice(1, 2).repeat(2) : hex.slice(2, 4), 16);
            let b = parseInt(hex.length == 3 ? hex.slice(2, 3).repeat(2) : hex.slice(4, 6), 16);
            if (alpha) {
                return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
            } else {
                return 'rgb(' + r + ', ' + g + ', ' + b + ')';
            }
        },
        RecheckFirefox: function() {
            chrome.tabs.query({pinned: false, currentWindow: true}, function(tabs) {
                if (tabs.length > 1) {
                    let last_tabId = tabs[tabs.length - 1].id;
                    let p = [];
                    let p_tt = [];
                    let t_ref = {};
                    let t_ind = 0;
                    let ok = 0;
                    let ti = 0;
                    let tc = tabs.length;
                    for (ti = 0; ti < tc; ti++) {
                        let tabId = tabs[ti].id;
                        p.push("");
                        p_tt.push("");
                        let t = Promise.resolve(browser.sessions.getTabValue(tabId, "TTdata")).then(
                            function(TabData) {
                                if (TabData != undefined) {
                                    t_ref[TabData.ttid] = tabs[t_ind].id;
                                    p_tt[t_ind] = TabData.parent_ttid;
                                    p[t_ind] = TabData.parent;
                                }
                                t_ind++;
                                if (tabId == last_tabId) {
                                    let i = 0;
                                    for (i = 0; i < p.length; i++) {
                                        if (t_ref[p_tt[i]]) {
                                            p[i] = t_ref[p_tt[i]];
                                        }
                                    }
                                    for (i = 0; i < p.length; i++) {
                                        let Tab = document.getElementById(tabs[i].id);
                                        if (Tab && p[i] == Tab.parentNode.parentNode.id) {
                                            ok++;
                                        }
                                    }
                                    if (ok < tabs.length * 0.5) {
                                        if (opt.debug) {
                                            log("emergency reload");
                                        }
                                        chrome.storage.local.set({emergency_reload: true});
                                        chrome.runtime.sendMessage({command: "reload"});
                                        // chrome.runtime.sendMessage({command: "reload_sidebar"});
                                        location.reload();
                                    } else {
                                        if (opt.debug) {
                                            log("f: RecheckFirefox, ok");
                                        }
                                    }
                                }
                            }
                        );
                    }
                }
            });
        },
        Bookmark: function(rootNode) {
            let ToolbarId = browserId == "F" ? "toolbar_____" : "1";
            chrome.bookmarks.get(ToolbarId, function(list) {
                chrome.bookmarks.search("TreeTabs", function(list) {
                    let TreeTabsId;
                    for (var elem in list) {
                        if (list[elem].parentId == ToolbarId) {
                            TreeTabsId = list[elem].id;
                            break;
                        }
                    }
                    if (TreeTabsId == undefined) {
                        chrome.bookmarks.create({parentId: ToolbarId, title: "TreeTabs"}, function(TreeTabsNew) {
                            TreeTabsId = TreeTabsNew.id;
                        });
                        TreeTabs.Utils.Bookmark(rootNode);
                        return;
                    } else {
                        let Tabs = document.querySelectorAll("#°" + rootNode.id + " .tab");
                        if (rootNode.classList.contains("tab")) {
                            if (Tabs.length > 0) {
                                chrome.tabs.get(parseInt(rootNode.id), function(tab) {
                                    if (tab) {
                                        chrome.bookmarks.create({parentId: TreeTabsId, title: tab.title}, function(root) {
                                            document.querySelectorAll("[id='" + rootNode.id + "'], [id='" + rootNode.id + "'] .tab").forEach(function(s) {
                                                chrome.tabs.get(parseInt(s.id), function(tab) {
                                                    if (tab) {
                                                        chrome.bookmarks.create({parentId: root.id, title: tab.title, url: tab.url});
                                                    }
                                                });
                                            });
                                        });
                                    }
                                });
                            } else {
                                chrome.tabs.get(parseInt(rootNode.id), function(tab) {
                                    if (tab) {
                                        chrome.bookmarks.create({parentId: TreeTabsId, title: tab.title, url: tab.url});
                                    }
                                });
                            }
                        }
                        if (rootNode.classList.contains("folder") || rootNode.classList.contains("group")) {
                            let rootName = labels.noname_group;
                            if (rootNode.classList.contains("folder") && tt.folders[rootNode.id]) {
                                rootName = tt.folders[rootNode.id].name;
                            }
                            if (rootNode.classList.contains("group") && tt.groups[rootNode.id]) {
                                rootName = tt.groups[rootNode.id].name;
                            }
                            chrome.bookmarks.create({parentId: TreeTabsId, title: rootName}, function(root) {
                                let folders = document.querySelectorAll("#°" + rootNode.id + " .folder");
                                let Nodes = {};
                                folders.forEach(function(f) {
                                    if (tt.folders[f.id]) {
                                        chrome.bookmarks.create({parentId: root.id, title: tt.folders[f.id].name}, function(Bkfolder) {
                                            Nodes[f.id] = {ttid: f.id, id: Bkfolder.id, ttparent: tt.folders[f.id].parent, parent: root.id};
                                            if (Object.keys(Nodes).length == folders.length) {
                                                for (var elem in Nodes) {
                                                    if (Nodes[Nodes[elem].ttparent]) {
                                                        Nodes[Nodes[elem].ttid].parent = Nodes[Nodes[elem].ttparent].id;
                                                    }
                                                }
                                                for (var elem in Nodes) {
                                                    chrome.bookmarks.move(Nodes[elem].id, {parentId: Nodes[elem].parent}, function(BkFinalfolder) {});
                                                }
                                            }
                                        });
                                    }
                                });
                                setTimeout(function() {
                                    Array.from(Tabs).reverse().forEach(function(t) {
                                        chrome.tabs.get(parseInt(t.id), function(tab) {
                                            if (tab) {
                                                chrome.bookmarks.create({parentId: (Nodes[t.parentNode.parentNode.id] ? Nodes[t.parentNode.parentNode.id].id : root.id), title: tab.title, url: tab.url});
                                            }
                                        });
                                    });
                                }, 3000);
                            });
                        }
                    }
                });
            });
        }
    },
    DOM: {
        SetEvents: function() {
            if (opt.debug) {
                log("f: SetEvents, adding global events.");
            }
            let PinList = document.getElementById("pin_list");
            if (!opt.switch_with_scroll) {
                PinList.onmousewheel = function(event) {
                    let pinList = document.getElementById("pin_list");
                    let direction = (event.wheelDelta > 0 || event.detail < 0) ? -1 : 1;
                    let speed = 0.1;
                    for (let t = 1; t < 40; t++) {
                        setTimeout(function() {
                            if (t < 30) {
                                speed = speed + 0.1; // accelerate
                            } else {
                                speed = speed - 0.3; // decelerate
                            }
                            pinList.scrollLeft = pinList.scrollLeft + (direction * speed);
                        }, t);
                    }
                }
            }
            window.addEventListener('contextmenu', function(event) {
                if (event.target.classList.contains("text_input") == false) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                }
            }, false);
            // window.addEventListener('dragover', function(event) {
            //     console.log('drag_over');
            // }, false);
            document.getElementById("body").addEventListener('contextmenu', function(event) {
                if (event.target.classList.contains("text_input") == false) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                }
            }, false);
            document.body.onresize = function(event) {
                TreeTabs.DOM.RefreshGUI();
            }
            document.body.onmousedown = function(event) {
                if (event.which == 2) {
                    event.preventDefault();
                }
                if (event.which == 1 && event.target.classList.contains("menu_item") == false) {
                    TreeTabs.Menu.HideMenus();
                }
                event.stopImmediatePropagation();
                if (event.which == 1) {
                    TreeTabs.DOM.RemoveHeadersHoverClass();
                }
            }
            document.getElementById("folder_edit_confirm").onmousedown = function(event) {
                if (event.which == 1) {
                    TreeTabs.Folders.FolderRenameConfirm();
                }
            }
            document.getElementById("folder_edit_discard").onmousedown = function(event) {
                if (event.which == 1) {
                    TreeTabs.DOM.HideRenameDialogs();
                }
            }
            document.getElementById("group_edit_confirm").onmousedown = function(event) {
                    if (event.which == 1) {
                        TreeTabs.Groups.GroupEditConfirm();
                    }
                }
            document.getElementById("group_edit_discard").onmousedown = function(event) {
                if (event.which == 1) {
                    TreeTabs.DOM.HideRenameDialogs();
                }
            }
            document.getElementById("folder_edit_name").onkeydown = function(event) {
                if (event.keyCode == 13) {
                    TreeTabs.Folders.FolderRenameConfirm();
                }
                if (event.which == 27) {
                    TreeTabs.DOM.HideRenameDialogs();
                }
            }
            document.getElementById("group_edit_name").onkeydown = function(event) {
                if (event.keyCode == 13) {
                    TreeTabs.Groups.GroupEditConfirm();
                }
                if (event.which == 27) {
                    TreeTabs.DOM.HideRenameDialogs();
                }
            }
            PinList.onclick = function(event) {
                if (event.which == 1 && event.target == this) {
                    if (opt.pin_list_multi_row || (opt.pin_list_multi_row == false && event.clientY < (this.childNodes[0].getBoundingClientRect().height + this.getBoundingClientRect().top))) {
                        TreeTabs.DOM.Deselect();
                    }
                }
            }
            PinList.onmousedown = function(event) {
                if (event.which == 1 && event.target == this) {
                    if (opt.pin_list_multi_row || (opt.pin_list_multi_row == false && event.clientY < (this.childNodes[0].getBoundingClientRect().height + this.getBoundingClientRect().top))) {
                        TreeTabs.Menu.HideMenus();
                    }
                }

                if (event.which == 2 && event.target == this) {
                    TreeTabs.Groups.ActionClickGroup(this, opt.midclick_group);
                }
                if (event.which == 3 && event.target == this) {
                    TreeTabs.Menu.ShowFGlobalMenu(event);
                }
            }
            PinList.ondragover = function(event) {
                if (event.target.id == "pin_list" && tt.DraggingGroup == false && (tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder) && this.classList.contains("highlighted_drop_target") == false) {
                    TreeTabs.DOM.RemoveHighlight();
                    this.classList.add("highlighted_drop_target");
                }
            }
            PinList.ondblclick = function(event) {
                if (event.target == this) {
                    TreeTabs.Groups.ActionClickGroup(this, opt.dbclick_group);
                }
            }
            document.getElementById("group_edit_font").onclick = function(event) {
                if (event.which == 1) {
                    event.stopPropagation();
                    let ColorPicker = document.getElementById("color_picker");
                    ColorPicker.setAttribute("PickColor", this.id);
                    ColorPicker.value = "#" + TreeTabs.Utils.RGBtoHex(this.style.backgroundColor);
                    ColorPicker.focus();
                    ColorPicker.click();
                }
            }
            document.getElementById("color_picker").oninput = function(event) {
                document.getElementById(this.getAttribute("PickColor")).style.backgroundColor = this.value;
            }
            document.getElementById("group_list").ondragleave = function(event) {
                if (opt.open_tree_on_hover) {
                    clearTimeout(tt.DragOverTimer);
                    tt.DragOverId = "";
                }
            }
            document.body.onkeydown = function(event) {
                // ctrl+a to select all
                if (event.ctrlKey && event.which == 65) {
                    if (document.querySelector(".pin>.tab_header_hover") != null) {
                        document.querySelectorAll(".pin").forEach(function(s) {
                            s.classList.add("selected");
                        });
                    }
                    if (document.querySelectorAll("#" + tt.active_group + " .tab>.tab_header_hover, #" + tt.active_group + " .folder>.folder_header_hover").length > 0) {
                        let rootId = document.querySelectorAll("#" + tt.active_group + " .tab>.tab_header_hover, #" + tt.active_group + " .folder>.folder_header_hover")[0].parentNode.parentNode.parentNode.id;
                        document.querySelectorAll("#°" + rootId + ">.folder, #°" + rootId + ">.tab").forEach(function(s) {
                            s.classList.add("selected");
                        });
                    }
                }
                // ctrl+i to invert selection
                if (event.ctrlKey && event.which == 73) {
                    if (document.querySelector(".pin>.tab_header_hover") != null) {
                        document.querySelectorAll(".pin").forEach(function(s) {
                            s.classList.toggle("selected");
                        });
                    }
                    if (document.querySelectorAll("#" + tt.active_group + " .tab>.tab_header_hover, #" + tt.active_group + " .folder>.folder_header_hover").length > 0) {
                        let rootId = document.querySelectorAll("#" + tt.active_group + " .tab>.tab_header_hover, #" + tt.active_group + " .folder>.folder_header_hover")[0].parentNode.parentNode.parentNode.id;
                        document.querySelectorAll("#°" + rootId + ">.folder, #°" + rootId + ">.tab").forEach(function(s) {
                            s.classList.toggle("selected");
                        });
                    }
                }
                // esc to unselect tabs and folders
                if (event.which == 27) {
                    TreeTabs.DOM.Deselect();
                }
                // alt+g to toggle group bar
                if (event.altKey && event.which == 71) {
                    TreeTabs.Groups.GroupsToolbarToggle();
                }
                // new folder
                if (event.which == 192 || event.which == 70) {
                    if (tt.pressed_keys.indexOf(event.which) == -1) {
                        tt.pressed_keys.push(event.which);
                    }

                    if (tt.pressed_keys.indexOf(192) != -1 && tt.pressed_keys.indexOf(70) != -1) {
                        let FolderId = TreeTabs.Folders.AddNewFolder({});
                        TreeTabs.Folders.ShowRenameFolderDialog(FolderId);
                    }
                }
                TreeTabs.DOM.RefreshGUI();
            }

            document.body.onkeyup = function(event) {
                if (tt.pressed_keys.indexOf(event.which) != -1) {
                    tt.pressed_keys.splice(tt.pressed_keys.indexOf(event.which), 1);
                }
            }
            document.body.ondragover = function(event) {
                if (opt.debug) {
                    log("drag over: " + event.target.id);
                }
                event.preventDefault();
            }
            document.ondrop = function(event) {
                if (opt.debug) {
                    log("dropped on window: " + tt.CurrentWindowId);
                }
                let Nodes = event.dataTransfer.getData("Nodes") ? JSON.parse(event.dataTransfer.getData("Nodes")) : [];
                let NodesTypes = event.dataTransfer.getData("NodesTypes") ? JSON.parse(event.dataTransfer.getData("NodesTypes")) : {DraggingGroup: false, DraggingPin: false, DraggingTab: false, DraggingFolder: false};
                let Group = event.dataTransfer.getData("Group") ? JSON.parse(event.dataTransfer.getData("Group")) : {};
                let SourceWindowId = event.dataTransfer.getData("SourceWindowId") ? JSON.parse(event.dataTransfer.getData("SourceWindowId")) : 0;
                let target = document.querySelector(".highlighted_drop_target");
                let where = target ? (target.classList.contains("before") ? "before" : (target.classList.contains("after") ? "after" : "inside")) : "";
                let ActiveGroup = document.getElementById(tt.active_group);
                let Scroll = ActiveGroup.scrollTop;
                clearTimeout(tt.DragOverTimer);
                tt.DragOverId = "";
                tt.Dragging = false;
                chrome.runtime.sendMessage({command: "drag_end"});
                event.preventDefault();
                if (SourceWindowId == tt.CurrentWindowId) {
                    TreeTabs.DOM.DropToTarget({NodesTypes: NodesTypes, Nodes: Nodes, TargetNode: target, where: where, Group: Group, Scroll: Scroll});
                } else {
                    TreeTabs.DOM.FreezeSelection();
                    if (NodesTypes.DraggingGroup) {
                        tt.groups[Group.id] = Object.assign({}, Group);
                        TreeTabs.Groups.AppendGroupToList(Group.id, Group.name, Group.font, true);
                    }
                    let TabsIds = [];
                    for (let i = 0; i < Nodes.length; i++) {
                        if (Nodes[i].NodeClass == "folder") {
                            TreeTabs.Folders.AddNewFolder({folderId: Nodes[i].id, ParentId: Nodes[i].parent, Name: Nodes[i].name, Index: Nodes[i].index, ExpandState: Nodes[i].expand});
                            chrome.runtime.sendMessage({command: "remove_folder", folderId: Nodes[i].id});
                        }
                        if (Nodes[i].NodeClass == "pin") {
                            chrome.tabs.update(parseInt(Nodes[i].id), {pinned: false});
                            TabsIds.push(parseInt(Nodes[i].id));
                        }
                        if (Nodes[i].NodeClass == "tab") {
                            TabsIds.push(parseInt(Nodes[i].id));
                        }
                    }
                    chrome.tabs.move(TabsIds, {windowId: tt.CurrentWindowId, index: -1}, function(MovedTab) {
                        let Stop = 500;
                        let DropNodes = setInterval(function() {
                            Stop--;
                            let all_ok = true;
                            for (let i = 0; i < Nodes.length; i++) {
                                if (document.getElementById(Nodes[i].id) == null) {
                                    all_ok = false;
                                }
                            }
                            TreeTabs.DOM.DropToTarget({NodesTypes: NodesTypes, Nodes: Nodes, TargetNode: target, where: where, Group: Group, Scroll: Scroll});
                            if (NodesTypes.DraggingGroup) {
                                chrome.runtime.sendMessage({command: "remove_group", groupId: Group.id});
                            }
                            if (all_ok || Stop < 0) {
                                setTimeout(function() {clearInterval(DropNodes);}, 300);
                            }
                        }, 100);
                    });
                }
            }
            document.ondragleave = function(event) {
                if (opt.debug) {
                    log("global dragleave");
                }
                TreeTabs.DOM.RemoveHighlight();
                if (opt.open_tree_on_hover) {
                    clearTimeout(tt.DragOverTimer);
                    tt.DragOverId = "";
                }
            }
            document.ondragend = function(event) {
                if (opt.debug) {
                    log("drag_end");
                }
                let Nodes = event.dataTransfer.getData("Nodes") ? JSON.parse(event.dataTransfer.getData("Nodes")) : [];
                let NodesTypes = event.dataTransfer.getData("NodesTypes") ? JSON.parse(event.dataTransfer.getData("NodesTypes")) : {DraggingGroup: false, DraggingPin: false, DraggingTab: false, DraggingFolder: false};
                let Group = event.dataTransfer.getData("Group") ? JSON.parse(event.dataTransfer.getData("Group")) : {};
                setTimeout(function() {
                    if (tt.Dragging && ((browserId == "F" && ( event.screenX < event.view.mozInnerScreenX || event.screenX > (event.view.mozInnerScreenX + window.innerWidth) || event.screenY < event.view.mozInnerScreenY || event.screenY > (event.view.mozInnerScreenY + window.innerHeight))) || (browserId != "F" && (event.pageX < 0 || event.pageX > window.outerWidth || event.pageY < 0 || event.pageY > window.outerHeight)))) {
                        TreeTabs.Tabs.Detach(Nodes, NodesTypes, Group);
                    }
                    TreeTabs.DOM.CleanUpDragAndDrop();
                    tt.Dragging = false;
                    chrome.runtime.sendMessage({command: "drag_end"});
                }, 300);
                if (opt.open_tree_on_hover) {
                    clearTimeout(tt.DragOverTimer);
                    tt.DragOverId = "";
                }
            }
        },
        BindTabsSwitchingToMouseWheel: function(Id) {
            if (opt.debug) {
                log("f: BindTabsSwitchingToMouseWheel, binding tabs switch to group: " + Id);
            }
            document.getElementById(Id).onwheel = function(event) {
                event.preventDefault();
                let prev = event.deltaY < 0;
                if (prev) {
                    TreeTabs.Tabs.ActivatePrevTab(true);
                } else {
                    TreeTabs.Tabs.ActivateNextTab(true);
                }
            }
        },
        InsertDropToTarget: function(p) {
            if (p.AppendToTarget) {
                for (let i = 0; i < p.Nodes.length; i++) {
                    let Node = document.getElementById(p.Nodes[i].id);
                    if (Node != null) {
                        if (p.Nodes[i].selected) {
                            TreeTabs.DOM.AppendToNode(Node, p.TargetNode);
                            Node.classList.add("selected");
                            if (p.Nodes[i].temporary) {
                                Node.classList.add("selected_temporarly");
                            }
                        } else {
                            if (Node.parentNode.id != p.Nodes[i].parent) {
                                TreeTabs.DOM.AppendToNode(Node, document.getElementById(p.Nodes[i].parent));
                            }
                        }
                    }
                }
            }
            if (p.BeforeTarget) {
                for (i = 0; i < p.Nodes.length; i++) {
                    let Node = document.getElementById(p.Nodes[i].id);
                    if (Node != null) {
                        if (p.Nodes[i].selected) {
                            TreeTabs.DOM.InsterBeforeNode(Node, p.TargetNode);
                            Node.classList.add("selected");
                            if (p.Nodes[i].temporary) {
                                Node.classList.add("selected_temporarly");
                            }
                        } else {
                            if (Node.parentNode.id != p.Nodes[i].parent) {
                                TreeTabs.DOM.AppendToNode(Node, document.getElementById(p.Nodes[i].parent));
                            }
                        }
                    }
                }
            }
            if (p.AfterTarget) {
                let i = p.after ? (p.Nodes.length - 1) : 0;
                for (i = p.Nodes.length - 1; i >= 0; i--) {
                    let Node = document.getElementById(p.Nodes[i].id);
                    if (Node != null) {
                        if (p.Nodes[i].selected) {
                            TreeTabs.DOM.InsterAfterNode(Node, p.TargetNode);
                            Node.classList.add("selected");
                            if (p.Nodes[i].temporary) {
                                Node.classList.add("selected_temporarly");
                            }
                        } else {
                            if (Node.parentNode.id != p.Nodes[i].parent) {
                                TreeTabs.DOM.AppendToNode(Node, document.getElementById(p.Nodes[i].parent));
                            }
                        }
                    }
                }
            }
        },
        DropToTarget: function(p) { // Class: ("group", "tab", "folder"), DraggedTabNode: TabId, TargetNode: query node, TabsIdsSelected: arr of selected tabIds, TabsIds: arr of tabIds, TabsIdsParents: arr of parent tabIds, Folders: object with folders objects, FoldersSelected: arr of selected folders ids, Group: groupId, Scroll: bool
            if (p.TargetNode != null) {
                let pinTabs = false;
                if (p.NodesTypes.DraggingPin || p.NodesTypes.DraggingTab || p.NodesTypes.DraggingFolder) {
                    if (p.TargetNode.classList.contains("pin") || p.TargetNode.classList.contains("tab") || p.TargetNode.classList.contains("folder")) {


                        if (p.TargetNode.classList.contains("pin")) {
                            pinTabs = true;
                        }
                        if (p.where == "inside") { // PINS NEVER HAVE INSIDE, SO WILL BE IGNORED
                            TreeTabs.DOM.InsertDropToTarget({TargetNode: p.TargetNode.childNodes[1], AppendToTarget: true, Nodes: p.Nodes});
                        }
                        if (p.where == "before") {
                            TreeTabs.DOM.InsertDropToTarget({TargetNode: p.TargetNode, BeforeTarget: true, Nodes: p.Nodes});
                        }
                        if (p.where == "after") {
                            TreeTabs.DOM.InsertDropToTarget({TargetNode: p.TargetNode, AfterTarget: true, Nodes: p.Nodes});
                        }
                    }
                    if (p.TargetNode.id == "pin_list") {
                        TreeTabs.DOM.InsertDropToTarget({TargetNode: p.TargetNode, AppendToTarget: true, Nodes: p.Nodes});
                        pinTabs = true;
                    }
                    if (p.TargetNode.classList.contains("group")) {
                        TreeTabs.DOM.InsertDropToTarget({TargetNode: p.TargetNode.childNodes[0], AppendToTarget: true, Nodes: p.Nodes});
                    }

                    if (p.TargetNode.classList.contains("group_button")) {
                        let group = document.getElementById("°" + p.TargetNode.id.substr(1));
                        TreeTabs.DOM.InsertDropToTarget({TargetNode: group, Nodes: p.Nodes, AppendToTarget: true});
                    }
                    setTimeout(function() {TreeTabs.Folders.SaveFolders();}, 600);
                }
                if (p.NodesTypes.DraggingGroup) {
                    if (p.where == "before") {
                        TreeTabs.DOM.InsterBeforeNode(document.getElementById("_" + p.Group.id), p.TargetNode);
                    }
                    if (p.where == "after") {
                        TreeTabs.DOM.InsterAfterNode(document.getElementById("_" + p.Group.id), p.TargetNode);
                    }
                    TreeTabs.Groups.UpdateBgGroupsOrder();
                    TreeTabs.Groups.RearrangeGroupsLists();
                }
                for (i = 0; i < p.Nodes.length; i++) {
                    if (p.Nodes[i].NodeClass == "pin" || p.Nodes[i].NodeClass == "tab") {
                        if (tt.tabs[p.Nodes[i].id]) {
                            tt.tabs[p.Nodes[i].id].SetTabClass(pinTabs);
                            tt.tabs[p.Nodes[i].id].pinned = pinTabs;
                        }
                        chrome.tabs.update(parseInt(p.Nodes[i].id), {pinned: pinTabs});
                    }
                }
                if (opt.syncro_tabbar_tabs_order) {
                    let tabIds = Array.prototype.map.call(document.querySelectorAll(".pin, .tab"), function(s) {return parseInt(s.id);});
                    for (i = 0; i < p.Nodes.length; i++) {
                        if (p.Nodes[i].NodeClass == "pin" || p.Nodes[i].NodeClass == "tab") {
                            chrome.tabs.move(parseInt(p.Nodes[i].id), {index: tabIds.indexOf(parseInt(p.Nodes[i].id))});
                        }
                    }
                    setTimeout(function() {tt.schedule_rearrange_tabs++;}, 500);
                }
            }
            TreeTabs.Groups.KeepOnlyOneActiveTabInGroup();
            TreeTabs.DOM.RefreshExpandStates();
            TreeTabs.DOM.RefreshCounters();
            setTimeout(function() {TreeTabs.DOM.RemoveHighlight();}, 100);
            setTimeout(function() {
                if (opt.syncro_tabbar_groups_tabs_order) {
                    tt.schedule_rearrange_tabs++;
                }
                // TreeTabs.DOM.RefreshExpandStates();
                // TreeTabs.DOM.RefreshCounters();
                tt.schedule_update_data++;
                TreeTabs.DOM.RefreshGUI();
                TreeTabs.DOM.CleanUpDragAndDrop();
                if (opt.debug) {
                    log("DropToTarget END");
                }
            }, 500);
        },
        AppendToNode: function(Node, AppendNode) {
            if (Node != null && AppendNode != null) {
                AppendNode.appendChild(Node);
            }
        },
        InsterBeforeNode: function(Node, BeforeNode) {
            if (Node != null && BeforeNode != null) {
                BeforeNode.parentNode.insertBefore(Node, BeforeNode);
            }
        },
        InsterAfterNode: function(Node, AfterNode) {
            if (Node != null && AfterNode != null) {
                if (AfterNode.nextSibling != null) {
                    AfterNode.parentNode.insertBefore(Node, AfterNode.nextSibling);
                } else {
                    AfterNode.parentNode.appendChild(Node);
                }
            }
        },
        PromoteChildrenToFirstChild: function(Node) {
            let NewParent = Node.childNodes[1].firstChild.childNodes[1];
            Node.childNodes[1].parentNode.parentNode.insertBefore(Node.childNodes[1].firstChild, Node.childNodes[1].parentNode);
            while (Node.childNodes[1].firstChild) {
                NewParent.appendChild(Node.childNodes[1].firstChild);
            }
        },
        GetAllParents: function(Node) {
            let Parents = [];
            let ParentNode = Node.parentNode;
            while (ParentNode.parentNode != null) {
                Parents.push(ParentNode.parentNode);
                ParentNode = ParentNode.parentNode;
            }
            return Parents;
        },
        GetParentsByClass: function(Node, Class) {
            let Parents = [];
            let ParentNode = Node;
            if (ParentNode == null) {
                return Parents;
            }
            while (ParentNode.parentNode != null) {
                if (ParentNode.parentNode.classList != undefined && ParentNode.parentNode.classList.contains(Class)) {
                    Parents.push(ParentNode.parentNode);
                }
                ParentNode = ParentNode.parentNode;
            }
            return Parents;
        },
        GetParentsBy2Classes: function(Node, ClassA, ClassB) {
            let Parents = [];
            let ParentNode = Node;
            while (ParentNode.parentNode != null) {
                if (ParentNode.parentNode.classList != undefined && ParentNode.parentNode.classList.contains(ClassA) && ParentNode.parentNode.classList.contains(ClassB)) {
                    Parents.push(ParentNode.parentNode);
                }
                ParentNode = ParentNode.parentNode;
            }
            return Parents;
        },
        HideRenameDialogs: function() {
            document.querySelectorAll(".edit_dialog").forEach(function(s) {s.style.display = "none"; s.style.top = "-500px"; s.style.left = "-500px";});
        },
        EventExpandBox: function(Node) {
            if (Node.classList.contains("o")) {
                Node.classList.remove("o"); Node.classList.add("c");
                if (Node.classList.contains("tab")) {
                    chrome.runtime.sendMessage({command: "update_tab", tabId: parseInt(Node.id), tab: {expand: "c"}});
                }
                if (Node.classList.contains("folder")) {
                    TreeTabs.Folders.SaveFolders();
                }
            } else {
                if (Node.classList.contains("c")) {
                    if (opt.collapse_other_trees) {
                        let thisTreeTabs = TreeTabs.DOM.GetParentsByClass(Node.childNodes[0], "tab"); // start from tab's first child, instead of tab, important to include clicked tab as well
                        let thisTreeFolders = TreeTabs.DOM.GetParentsByClass(Node.childNodes[0], "folder");
                        document.querySelectorAll("#" + tt.active_group + " .o.tab").forEach(function(s) {
                            s.classList.remove("o"); s.classList.add("c");
                            chrome.runtime.sendMessage({command: "update_tab", tabId: parseInt(s.id), tab: {expand: "c"}});
                        });
        
                        document.querySelectorAll("#" + tt.active_group + " .o.folder").forEach(function(s) {
                            s.classList.remove("o"); s.classList.add("c");
                        });
                        thisTreeTabs.forEach(function(s) {
                            s.classList.remove("c"); s.classList.add("o");
                            chrome.runtime.sendMessage({command: "update_tab", tabId: parseInt(s.id), tab: {expand: "o"}});
                        });
                        thisTreeFolders.forEach(function(s) {
                            s.classList.remove("c"); s.classList.add("o");
                        });
                        TreeTabs.Folders.SaveFolders();
                        if (Node.classList.contains("tab") && tt.tabs[Node.id]) {
                            tt.tabs[Node.id].ScrollToTab();
                        }
                    } else {
                        Node.classList.remove("c"); Node.classList.add("o");
                        if (Node.classList.contains("tab")) {
                            chrome.runtime.sendMessage({command: "update_tab", tabId: parseInt(Node.id), tab: {expand: "o"}});
                        }
                        if (Node.classList.contains("folder")) {
                            TreeTabs.Folders.SaveFolders();
                        }
                    }
                }
            }
        },
        Select: function(event, TabNode) {
            if (event.shiftKey) { // SET SELECTION WITH SHIFT
                let LastSelected = document.querySelector("#" + tt.active_group + " .selected.selected_last");
                if (LastSelected == null) {
                    LastSelected = document.querySelector(".pin.active_tab, #" + tt.active_group + " .tab.active_tab");
                }
                if (LastSelected != null && TabNode.parentNode.id == LastSelected.parentNode.id) {
                    if (!event.ctrlKey) {
                        document.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                            s.classList.remove("selected_frozen"); s.classList.remove("selected_temporarly"); s.classList.remove("selected"); s.classList.remove("selected_last");
                        });
                    }
                    let ChildrenArray = Array.from(TabNode.parentNode.children);
                    let activeTabIndex = ChildrenArray.indexOf(LastSelected);
                    let thisTabIndex = ChildrenArray.indexOf(TabNode);
                    let fromIndex = thisTabIndex >= activeTabIndex ? activeTabIndex : thisTabIndex;
                    let toIndex = thisTabIndex >= activeTabIndex ? thisTabIndex : activeTabIndex;
                    for (let i = fromIndex; i <= toIndex; i++) {
                        LastSelected.parentNode.childNodes[i].classList.add("selected");
                        if (i == toIndex && event.ctrlKey) {
                            LastSelected.parentNode.childNodes[i].classList.add("selected_last");
                        }
                    }
                }
            }
            if (event.ctrlKey && !event.shiftKey) { // TOGGLE SELECTION WITH CTRL
                TabNode.classList.toggle("selected");
                if (TabNode.classList.contains("selected")) {
                    document.querySelectorAll(".selected_last").forEach(function(s) {
                        s.classList.remove("selected_last");
                    });
                    TabNode.classList.add("selected_last");
                } else {
                    TabNode.classList.remove("selected_last");
                }
            }
        },
        Deselect: function() {
            document.querySelectorAll("#pin_list .selected").forEach(function(s) {
                s.classList.remove("selected");
            });
            document.querySelectorAll("#" + tt.active_group + " .selected").forEach(function(s) {
                s.classList.remove("selected");
            });
        },
        FreezeSelection: function(all) {
            if (all) {
                document.querySelectorAll(".selected").forEach(function(s) {
                    s.classList.add("selected_frozen"); s.classList.remove("selected"); s.classList.remove("selected_last");
                });
            } else {
                document.querySelectorAll(".group:not(#" + tt.active_group + ") .selected").forEach(function(s) {
                    s.classList.add("selected_frozen"); s.classList.remove("selected"); s.classList.remove("selected_last");
                });
            }
        },
        CleanUpDragAndDrop: function() {
            if (opt.debug) {
                log("f: CleanUpDragAndDrop, unfreezing and removing temporary classes...");
            }
            document.querySelectorAll(".selected_frozen").forEach(function(s) {
                s.classList.add("selected"); s.classList.remove("selected_frozen");
            });
            document.querySelectorAll(".selected_temporarly").forEach(function(s) {
                s.classList.remove("selected"); s.classList.remove("selected_temporarly");
            });
            document.querySelectorAll(".tab_header_hover").forEach(function(s) {
                s.classList.remove("tab_header_hover");
            });
            document.querySelectorAll(".folder_header_hover").forEach(function(s) {
                s.classList.remove("folder_header_hover");
            });
            document.querySelectorAll(".dragged_tree").forEach(function(s) {
                s.classList.remove("dragged_tree");
            });
            document.querySelectorAll(".dragged_parents").forEach(function(s) {
                s.classList.remove("dragged_parents");
            });
            if (opt.debug) {
                log("f: removing DraggingParams...");
            }
            tt.DragTreeDepth = 0;
            tt.DraggingGroup = false;
            tt.DraggingTab = false;
            tt.DraggingFolder = false;
            tt.DraggingPin = false;
            tt.DragOverId = "";
        },
        RemoveHighlight: function() {
            document.querySelectorAll(".highlighted_drop_target").forEach(function(s) {
                s.classList.remove("before"); s.classList.remove("after"); s.classList.remove("inside"); s.classList.remove("highlighted_drop_target");
            });
        },
        RemoveHeadersHoverClass: function() {
            document.querySelectorAll(".folder_header_hover, .tab_header_hover").forEach(function(s) {
                s.classList.remove("folder_header_hover"); s.classList.remove("tab_header_hover");
            });
        },
        Loadi18n: function() {
            // toolbar labels
            document.querySelectorAll(".button, .manager_window_toolbar_button").forEach(function(s) {
                s.title = chrome.i18n.getMessage(s.id);
            });
            // menu labels and edit group dialog labels
            document.querySelectorAll(".menu_item, .edit_dialog_button, #manager_window_header_title, .manager_window_label").forEach(function(s) {
                s.textContent = chrome.i18n.getMessage(s.id);
            });
        },
        RefreshExpandStates: async function() { // refresh open closed trees states
            document.querySelectorAll("#" + tt.active_group + " .folder, #" + tt.active_group + " .tab").forEach(function(s) {
                if (s.childNodes[1].children.length == 0) {
                    s.classList.remove("o"); s.classList.remove("c");
                } else {
                    if (s.classList.contains("o") == false && s.classList.contains("c") == false) {
                        s.classList.add("o");
                    }
                }
            });
            document.querySelectorAll(".pin").forEach(function(s) {
                s.classList.remove("o"); s.classList.remove("c");
            });
        },
        RefreshCounters: async function() {
            if (opt.show_counter_tabs || opt.show_counter_tabs_hints) {
                document.querySelectorAll("#" + tt.active_group + " .o.tab, #" + tt.active_group + " .c.tab").forEach(function(s) {
                    if (opt.show_counter_tabs) {
                        s.childNodes[0].childNodes[1].childNodes[0].textContent = document.querySelectorAll("[id='" + s.id + "'] .tab").length;
                    }
                    if (opt.show_counter_tabs_hints) {
                        let title = s.childNodes[0].getAttribute("tabTitle");
                        s.childNodes[0].title = (document.querySelectorAll("[id='" + s.id + "'] .tab").length + " • ") + title;
                    }
                });
                document.querySelectorAll("#" + tt.active_group + " .folder").forEach(function(s) {
                    if (opt.show_counter_tabs && tt.folders[s.id]) {
                        s.childNodes[0].childNodes[1].childNodes[0].textContent = document.querySelectorAll("[id='" + s.id + "'] .tab").length;
                    }
                    if (opt.show_counter_tabs_hints && tt.folders[s.id]) {
                        s.childNodes[0].title = (document.querySelectorAll("[id='" + s.id + "'] .tab").length + " • ") + tt.folders[s.id].name;
                    }
                });
            }
        },
        RefreshGUI: async function() {
            let toolbar = document.getElementById("toolbar");
            let toolbarHeight = 27;
            if (toolbar.children.length > 0) {
                toolbar.style.height = "";
                toolbar.style.width = "";
                toolbar.style.display = "";
                toolbar.style.border = "";
                toolbar.style.padding = "";
                if (document.querySelector(".on.button") != null) {
                    toolbar.style.height = "53px";
                    toolbarHeight = 54;
                } else {
                    toolbar.style.height = "26px";
                }
            } else {
                toolbar.style.height = "0px";
                toolbarHeight = 0;
                toolbar.style.width = "0px";
                toolbar.style.display = "none";
                toolbar.style.border = "none";
                toolbar.style.padding = "0";
            }
            let group_list = document.getElementById("group_list");
            group_list.style.width = document.body.clientWidth + 50 + "px";
            let pin_list = document.getElementById("pin_list");
            if (pin_list.children.length > 0) {
                pin_list.style.top = toolbarHeight + "px";
                pin_list.style.height = "";
                pin_list.style.width = "";
                pin_list.style.display = "";
                pin_list.style.border = "";
                pin_list.style.padding = "";
            } else {
                pin_list.style.top = "0px";
                pin_list.style.height = "0px";
                pin_list.style.width = "0px";
                pin_list.style.display = "none";
                pin_list.style.border = "none";
                pin_list.style.padding = "0";
            }
            let pin_listHeight = pin_list.getBoundingClientRect().height;
            let toolbar_groups = document.getElementById("toolbar_groups");
            toolbar_groups.style.top = toolbarHeight + pin_listHeight + "px";
            toolbar_groups.style.height = document.body.clientHeight - toolbarHeight - pin_listHeight + "px";
            let toolbar_groupsWidth = toolbar_groups.getBoundingClientRect().width;
            if (opt.show_counter_groups) {
                document.querySelectorAll(".group").forEach(function(s) {
                    let groupLabel = document.getElementById("_gte" + s.id);
                    if (groupLabel) {
                        groupLabel.textContent = (tt.groups[s.id] ? tt.groups[s.id].name : labels.noname_group) + " (" + document.querySelectorAll("#" + s.id + " .tab").length + ")";
                    }
                });
            } else {
                document.querySelectorAll(".group").forEach(function(s) {
                    let groupLabel = document.getElementById("_gte" + s.id);
                    if (groupLabel) {
                        groupLabel.textContent = tt.groups[s.id] ? tt.groups[s.id].name : labels.noname_group;
                    }
                });
            }
            document.querySelectorAll(".group_button").forEach(function(s) {
                s.style.height = s.firstChild.getBoundingClientRect().height + "px";
            });
            let groups = document.getElementById("groups");
            let groupsHeight = document.body.clientHeight - toolbarHeight - pin_listHeight;
            let groupsWidth = document.body.clientWidth - toolbar_groupsWidth - 1;
            groups.style.top = toolbarHeight + pin_listHeight + "px";
            groups.style.left = toolbar_groupsWidth + "px";
            groups.style.height = groupsHeight + "px";
            groups.style.width = groupsWidth + "px";
            let PanelList = document.querySelector(".mw_pan_on>.manager_window_list");
            let PanelListHeight = 3 + PanelList.children.length * 18;
            let ManagerWindowPanelButtons = document.querySelector(".mw_pan_on>.manager_window_panel_buttons");
            let ManagerWindowPanelButtonsHeight = ManagerWindowPanelButtons.clientHeight;
            let MaxAllowedHeight = document.body.clientHeight - 140;
            if (PanelListHeight + ManagerWindowPanelButtonsHeight < MaxAllowedHeight) {
                PanelList.style.height = PanelListHeight + "px";
            } else {
                PanelList.style.height = MaxAllowedHeight - ManagerWindowPanelButtonsHeight + "px";
            }
            let ManagerWindow = document.getElementById("manager_window");
            ManagerWindow.style.height = PanelList.clientHeight + ManagerWindowPanelButtonsHeight + 56 + "px";
        },
        VivaldiRefreshMediaIcons: function() { // Vivaldi does not have changeInfo.audible listener, this is my own implementation, hopefully this will not affect performance too much
            setInterval(function() {
                chrome.tabs.query({currentWindow: true, audible: true, discarded: false}, function(tabs) {
                    document.querySelectorAll(".audible, .muted").forEach(function(s) {
                        s.classList.remove("audible"); s.classList.remove("muted");
                    });
                    let tc = tabs.length;
                    for (var ti = 0; ti < tc; ti++) {
                        if (tabs[ti].audible) {
                            document.getElementById(tabs[ti].id).classList.add("audible");
                        }
                        if (tabs[ti].mutedInfo.muted) {
                            document.getElementById(tabs[ti].id).classList.add("muted");
                        }
                    }
                });
            }, 2000);
        }
    },
    Manager: {
        OpenManagerWindow: function() {
            TreeTabs.DOM.HideRenameDialogs();
            if (opt.debug) {
                log("f: TreeTabs.Manager.OpenManagerWindow");
            }
            chrome.storage.local.get(null, function(storage) {
                let ManagerWindow = document.getElementById("manager_window");
                ManagerWindow.style.display = "block";
                // ManagerWindow.style.top = document.getElementById("toolbar").getBoundingClientRect().height - 13 + "px";
                ManagerWindow.style.top = "";
                ManagerWindow.style.left = "";
                let GroupList = document.getElementById("manager_window_groups_list");
                while (GroupList.hasChildNodes()) {
                    GroupList.removeChild(GroupList.firstChild);
                }
                let SessionsList = document.getElementById("manager_window_sessions_list");
                while (SessionsList.hasChildNodes()) {
                    SessionsList.removeChild(SessionsList.firstChild);
                }
                if (storage.hibernated_groups != undefined) {
                    storage.hibernated_groups.forEach(function(hibernated_group) {
                        TreeTabs.Manager.AddGroupToManagerList(hibernated_group);
                    });
                }
                if (storage.saved_sessions != undefined) {
                    (storage.saved_sessions).forEach(function(saved_session) {
                        TreeTabs.Manager.AddSessionToManagerList(saved_session);
                    });
                }
                TreeTabs.Manager.ReAddSessionAutomaticToManagerList(storage);
            });
        },
        AddGroupToManagerList: function(hibernated_group) {
            let GroupList = document.getElementById("manager_window_groups_list");
            let HibernatedGroupRow = document.createElement("li");
            HibernatedGroupRow.classList = "hibernated_group_row"
            GroupList.appendChild(HibernatedGroupRow);
            let DeleteGroupIcon = document.createElement("div");
            DeleteGroupIcon.classList = "manager_window_list_button delete_hibernated_group";
            DeleteGroupIcon.title = chrome.i18n.getMessage("manager_window_delete_icon");
            DeleteGroupIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let hib_group = this.parentNode;
                    let HibernategGroupIndex = Array.from(hib_group.parentNode.children).indexOf(hib_group);
                    chrome.storage.local.get(null, function(storage) {
                        let hibernated_groups = storage.hibernated_groups;
                        hibernated_groups.splice(HibernategGroupIndex, 1);
                        chrome.storage.local.set({hibernated_groups: hibernated_groups});
                        hib_group.parentNode.removeChild(hib_group);
                        TreeTabs.DOM.RefreshGUI();
                    });
                }
            }
            HibernatedGroupRow.appendChild(DeleteGroupIcon);
            let ExportGroupIcon = document.createElement("div");
            ExportGroupIcon.classList = "manager_window_list_button export_hibernated_group";
            ExportGroupIcon.title = chrome.i18n.getMessage("manager_window_savetofile_icon");
            ExportGroupIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
                    chrome.storage.local.get(null, function(storage) {
                        let filename = storage.hibernated_groups[HibernategGroupIndex].group.name == "" ? labels.noname_group : storage.hibernated_groups[HibernategGroupIndex].group.name;
                        TreeTabs.File.SaveFile(filename, "tt_group", storage.hibernated_groups[HibernategGroupIndex]);
                    });
                }
            }
            HibernatedGroupRow.appendChild(ExportGroupIcon);
            let LoadGroupIcon = document.createElement("div");
            LoadGroupIcon.classList = "manager_window_list_button load_hibernated_group";
            LoadGroupIcon.title = chrome.i18n.getMessage("manager_window_load_icon");
            LoadGroupIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
                    chrome.storage.local.get(null, function(storage) {
                        TreeTabs.Manager.RecreateGroup(storage.hibernated_groups[HibernategGroupIndex]);
                    });
                }
            }
            HibernatedGroupRow.appendChild(LoadGroupIcon);
            let name = document.createElement("div");
            name.contentEditable = true;
            name.textContent = hibernated_group.group.name;
            name.classList = "manager_window_group_name text_input";
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
            HibernatedGroupRow.appendChild(name);
            let tabsCounter = document.createElement("div");
            tabsCounter.textContent = " - (" + hibernated_group.tabs.length + ")";
            tabsCounter.classList = "manager_window_group_name";
            HibernatedGroupRow.appendChild(tabsCounter);
            TreeTabs.DOM.RefreshGUI();
        },
        AddSessionToManagerList: function(saved_session) {
            let SessionsList = document.getElementById("manager_window_sessions_list");
            let SavedSessionRow = document.createElement("li");
            SavedSessionRow.classList = "saved_session_row"
            SessionsList.appendChild(SavedSessionRow);
            let DeleteSessionIcon = document.createElement("div");
            DeleteSessionIcon.classList = "manager_window_list_button delete_saved_session";
            DeleteSessionIcon.title = chrome.i18n.getMessage("manager_window_delete_icon");
            DeleteSessionIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let saved_session = this.parentNode;
                    let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
                    chrome.storage.local.get(null, function(storage) {
                        let S_Sessions = storage.saved_sessions;
                        S_Sessions.splice(SessionIndex, 1);
                        chrome.storage.local.set({saved_sessions: S_Sessions});
                        saved_session.parentNode.removeChild(saved_session);
                        TreeTabs.DOM.RefreshGUI();
                    });
                }
            }
            SavedSessionRow.appendChild(DeleteSessionIcon);
            let ExportSessionIcon = document.createElement("div");
            ExportSessionIcon.classList = "manager_window_list_button export_saved_session";
            ExportSessionIcon.title = chrome.i18n.getMessage("manager_window_savetofile_icon");
            ExportSessionIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let saved_session = this.parentNode;
                    let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
                    chrome.storage.local.get(null, function(storage) {
                        let filename = storage.saved_sessions[SessionIndex].name == "" ? labels.noname_group : storage.saved_sessions[SessionIndex].name;
                        TreeTabs.File.SaveFile(filename, "tt_session", storage.saved_sessions[SessionIndex].session);
                    });
                }
            }
            SavedSessionRow.appendChild(ExportSessionIcon);
            let LoadSessionIcon = document.createElement("div");
            LoadSessionIcon.classList = "manager_window_list_button load_saved_session";
            LoadSessionIcon.title = chrome.i18n.getMessage("manager_window_load_icon");
            LoadSessionIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let saved_session = this.parentNode;
                    let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
                    chrome.storage.local.get(null, function(storage) {
                        let S_Sessions = storage.saved_sessions;
                        TreeTabs.Manager.RecreateSession(S_Sessions[SessionIndex].session);
                    });
                }
            }
            SavedSessionRow.appendChild(LoadSessionIcon);
            let MergeSessionIcon = document.createElement("div");
            MergeSessionIcon.classList = "manager_window_list_button merge_saved_session";
            MergeSessionIcon.title = chrome.i18n.getMessage("manager_window_merge_icon");
            MergeSessionIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let saved_session = this.parentNode;
                    let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
                    chrome.storage.local.get(null, function(storage) {
                        let S_Sessions = storage.saved_sessions;
                        TreeTabs.Manager.ImportMergeTabs(S_Sessions[SessionIndex].session);
                    });
                }
            }
            SavedSessionRow.appendChild(MergeSessionIcon);
            let name = document.createElement("div");
            name.contentEditable = true;
            name.textContent = saved_session.name;
            name.classList = "manager_window_session_name";
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
            SavedSessionRow.appendChild(name);
            TreeTabs.DOM.RefreshGUI();
        },
        ReAddSessionAutomaticToManagerList: function(storage) {
            let SessionsAutomaticList = document.getElementById("manager_window_autosessions_list");
            while (SessionsAutomaticList.hasChildNodes()) {
                SessionsAutomaticList.removeChild(SessionsAutomaticList.firstChild);
            }
            if (storage.saved_sessions_automatic != undefined) {
                (storage.saved_sessions_automatic).forEach(function(saved_sessions_automatic) {
                    TreeTabs.Manager.AddSessionAutomaticToManagerList(saved_sessions_automatic);
                });
            }
            TreeTabs.DOM.RefreshGUI();
        },
        AddSessionAutomaticToManagerList: function(saved_session) {
            let SessionsList = document.getElementById("manager_window_autosessions_list");
            let SavedSessionRow = document.createElement("li");
            SavedSessionRow.classList = "saved_session_row"
            SessionsList.appendChild(SavedSessionRow);
            let LoadSessionIcon = document.createElement("div");
            LoadSessionIcon.classList = "manager_window_list_button load_saved_session";
            LoadSessionIcon.title = chrome.i18n.getMessage("manager_window_load_icon");
            LoadSessionIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let saved_session = this.parentNode;
                    let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
                    chrome.storage.local.get(null, function(storage) {
                        let S_Sessions = storage.saved_sessions_automatic;
                        TreeTabs.Manager.RecreateSession(S_Sessions[SessionIndex].session);
                    });
                }
            }
            SavedSessionRow.appendChild(LoadSessionIcon);
            let MergeSessionIcon = document.createElement("div");
            MergeSessionIcon.classList = "manager_window_list_button merge_saved_session";
            MergeSessionIcon.title = chrome.i18n.getMessage("manager_window_merge_icon");
            MergeSessionIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let saved_session = this.parentNode;
                    let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
                    chrome.storage.local.get(null, function(storage) {
                        let S_Sessions = storage.saved_sessions_automatic;
                        TreeTabs.Manager.ImportMergeTabs(S_Sessions[SessionIndex].session);
                    });
                }
            }
            SavedSessionRow.appendChild(MergeSessionIcon);
            let name = document.createElement("div");
            name.textContent = saved_session.name;
            name.classList = "manager_window_session_name";
            SavedSessionRow.appendChild(name);
            TreeTabs.DOM.RefreshGUI();
        },
        SetManagerEvents: function () {
            document.getElementById("manager_window_close").onmousedown = function(event) {
                if (event.which == 1) {
                    TreeTabs.DOM.HideRenameDialogs();
                }
            }
            document.querySelectorAll(".manager_window_toolbar_button").forEach(function(s) {
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        document.querySelectorAll(".manager_window_panel").forEach(function(s) {
                            s.classList.remove("mw_pan_on");
                        });
                        document.getElementById((this.id).replace("button", "panel")).classList.add("mw_pan_on");
                        document.querySelectorAll(".mw_on").forEach(function(s) {
                            s.classList.remove("mw_on");
                        });
                        this.classList.add("mw_on");
                        TreeTabs.DOM.RefreshGUI();
                    }
                }
            });
            document.getElementById("manager_window_button_import_group").onmousedown = function(event) {
                if (event.which == 1) {
                    let inputFile = TreeTabs.File.ShowOpenFileDialog(".tt_group");
                    inputFile.onchange = function(event) {
                        TreeTabs.Manager.ImportGroup(false, true);
                    }
                }
            }
            document.getElementById("manager_window_button_hibernate_group").onmousedown = function(event) {
                if (event.which == 1) {
                    TreeTabs.Manager.ExportGroup(tt.active_group, false, true);
                    setTimeout(function() {
                        TreeTabs.Groups.GroupRemove(tt.active_group, true);
                    }, 100);
                    setTimeout(function() {
                        TreeTabs.Manager.OpenManagerWindow();
                    }, 150);
                }
            }
            document.getElementById("manager_window_button_save_current_session").onmousedown = function(event) {
                if (event.which == 1) {
                    let d = new Date();
                    TreeTabs.Manager.ExportSession((d.toLocaleString().replace(/\//g, ".").replace(/:/g, "꞉")), false, true, false);
                }
            }
            document.getElementById("manager_window_button_import_session").onmousedown = function(event) {
                if (event.which == 1) {
                    let inputFile = TreeTabs.File.ShowOpenFileDialog(".tt_session");
                    inputFile.onchange = function(event) {
                        TreeTabs.Manager.ImportSession(false, true, false);
                    }
                }
            }
            let autosessions_save_max_to_keep = document.getElementById("manager_window_autosessions_maximum_saves");
            autosessions_save_max_to_keep.value = opt.autosave_max_to_keep;
            autosessions_save_max_to_keep.oninput = function(event) {
                opt.autosave_max_to_keep = parseInt(this.value);
                TreeTabs.Preferences.SavePreferences(opt);
            }
            let autosessions_save_timer = document.getElementById("manager_window_autosessions_save_timer");
            autosessions_save_timer.value = opt.autosave_interval;
            autosessions_save_timer.oninput = function(event) {
                opt.autosave_interval = parseInt(this.value);
                TreeTabs.Preferences.SavePreferences(opt);
                clearInterval(tt.AutoSaveSession);
                TreeTabs.Manager.StartAutoSaveSession();
            }
        },
        ExportGroup: function(groupId, filename, save_to_manager) {
            let GroupToSave = {group: tt.groups[groupId], folders: {}, tabs: [], favicons: []};
            document.querySelectorAll("#" + groupId + " .folder").forEach(function(s) {
                if (tt.folders[s.id]) {
                    GroupToSave.folders[s.id] = tt.folders[s.id];
                }
            });
            let Tabs = document.querySelectorAll("#" + groupId + " .tab");
            if (Tabs.length > 0) {
                let lastId = parseInt(Tabs[Tabs.length - 1].id);
                Tabs.forEach(function(s) {
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
                            if (filename) {
                                TreeTabs.File.SaveFile(filename, "tt_group", GroupToSave);
                            }
                            if (save_to_manager) {
                                TreeTabs.Manager.AddGroupToStorage(GroupToSave, true);
                            }
                            if (opt.debug) {
                                log("f: ExportGroup, filename: " + filename + ", groupId: " + groupId + ", save_to_manager: " + save_to_manager);
                            }
                        }
                    });
                });
            } else {
                if (filename) {
                    TreeTabs.File.SaveFile(filename, "tt_group", GroupToSave);
                }
                if (save_to_manager) {
                    TreeTabs.Manager.AddGroupToStorage(GroupToSave, true);
                }
                if (opt.debug) {
                    log("f: ExportGroup, filename: " + filename + ", groupId: " + groupId + ", save_to_manager: " + save_to_manager);
                }
            }
        },
        ImportGroup: function(recreate_group, save_to_manager) {
            let file = document.getElementById("file_import");
            let fr = new FileReader();
            if (file.files[0] == undefined) return;
            fr.readAsText(file.files[0]);
            fr.onload = function() {
                let data = fr.result;
                let group = JSON.parse(data);
                file.parentNode.removeChild(file);
                if (recreate_group) {
                    TreeTabs.Manager.RecreateGroup(group);
                }
                if (save_to_manager) {
                    TreeTabs.Manager.AddGroupToStorage(group, true);
                }
                if (opt.debug) {
                    log("f: ImportGroup, recreate_group: " + recreate_group + ", save_to_manager: " + save_to_manager);
                }
            }
        },
        RecreateGroup: function(LoadedGroup) {
            if (opt.debug) {
                log("f: RecreateGroup");
            }
            let RefFolders = {};
            let NewFolders = {};
            let RefTabs = {};
            let NewTabs = [];
            let NewGroupId = TreeTabs.Groups.AddNewGroup(LoadedGroup.group.name, LoadedGroup.group.font);
            for (var folder in LoadedGroup.folders) {
                let newId = TreeTabs.Folders.AddNewFolder({parent: NewGroupId, name: LoadedGroup.folders[folder].name, expand: LoadedGroup.folders[folder].expand});
                RefFolders[folder] = newId;
                NewFolders[newId] = {id: newId, parent: ((LoadedGroup.folders[folder].parent).startsWith("g_") ? NewGroupId : LoadedGroup.folders[folder].parent), index: LoadedGroup.folders[folder].index, name: LoadedGroup.folders[folder].name, expand: LoadedGroup.folders[folder].expand};
            }
            for (var new_folder in NewFolders) {
                if ((NewFolders[new_folder].parent).startsWith("f_") && RefFolders[NewFolders[new_folder].parent]) {
                    NewFolders[new_folder].parent = RefFolders[NewFolders[new_folder].parent];
                }
            }
            (LoadedGroup.tabs).forEach(function(Tab) {
                let params;
                if (browserId == "F") {
                    params = {active: false, windowId: tt.CurrentWindowId, url: Tab.url, discarded: true, title: Tab.title};
                } else {
                    params = {active: false, windowId: CurrentWindowId, url: Tab.url};
                }
                chrome.tabs.create(params, function(new_tab) {
                    browser.sessions.setTabValue(new_tab.id, "CachedFaviconUrl", Tab.favicon);
                    RefTabs[Tab.id] = new_tab.id;
                    Tab.id = new_tab.id;
                    if ((Tab.parent).startsWith("g_")) {
                        Tab.parent = NewGroupId;
                    }
                    if ((Tab.parent).startsWith("f_") && RefFolders[Tab.parent]) {
                        Tab.parent = RefFolders[Tab.parent];
                    }
                    NewTabs.push(Tab);
                    if (browserId != "O" && browserId != "F") {
                        chrome.runtime.sendMessage({command: "discard_tab", tabId: new_tab.id});
                    }
                    if (NewTabs.length == LoadedGroup.tabs.length - 1) {
                        NewTabs.forEach(function(LTab) {
                            if (RefTabs[LTab.parent]) {
                                LTab.parent = RefTabs[LTab.parent];
                            }
                        });
                        let GiveUp = 3000; // gives up after: 300*3000/1000/60 = 15 minutes
                        let RecreateTreeS = setInterval(function() {
                            GiveUp--;
                            let LastTab = document.getElementById(NewTabs[NewTabs.length - 1].id);
                            if (LastTab != null || GiveUp < 0) {
                                TreeTabs.Manager.RecreateTreeStructure({}, NewFolders, NewTabs);
                                clearInterval(RecreateTreeS);
                            }
                        }, 300);
                    }
                });
            });
        },
        AddGroupToStorage: function(group, add_to_manager) {
            chrome.storage.local.get(null, function(storage) {
                if (storage["hibernated_groups"] == undefined) {
                    let hibernated_groups = [];
                    hibernated_groups.push(group);
                    chrome.storage.local.set({hibernated_groups: hibernated_groups});
                    if (add_to_manager) {
                        TreeTabs.Manager.AddGroupToManagerList(group);
                    }
                } else {
                    let hibernated_groups = storage["hibernated_groups"];
                    hibernated_groups.push(group);
                    chrome.storage.local.set({hibernated_groups: hibernated_groups});
                    if (add_to_manager) {
                        TreeTabs.Manager.AddGroupToManagerList(group);
                    }
                }
                if (opt.debug) {
                    log("f: AddGroupToStorage, add_to_manager: " + add_to_manager);
                }
            });
        },
        ExportSession: function(name, save_to_file, save_to_manager, save_to_autosave_manager) {
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
                        if (save_to_file) {
                            TreeTabs.File.SaveFile(name, "tt_session", ExportWindows);
                        }
                        if (save_to_manager) {
                            TreeTabs.Manager.AddSessionToStorage(ExportWindows, name, true);
                        }
                        if (save_to_autosave_manager) {
                            TreeTabs.Manager.AddAutosaveSessionToStorage(ExportWindows, name)
                        }
                    });
                });
            });
        },
        ImportSession: function(recreate_session, save_to_manager, merge_session) {
            let file = document.getElementById("file_import");
            let fr = new FileReader();
            if (file.files[0] == undefined) return;
            fr.readAsText(file.files[file.files.length - 1]);
            fr.onload = function() {
                let data = fr.result;
                file.parentNode.removeChild(file);
                let LoadedSession = JSON.parse(data);
                if (recreate_session) {
                    TreeTabs.Manager.RecreateSession(LoadedSession);
                }
                if (merge_session) {
                    TreeTabs.Manager.ImportMergeTabs(LoadedSession);
                }
                if (save_to_manager) {
                    TreeTabs.Manager.AddSessionToStorage(LoadedSession, (file.files[file.files.length - 1].name).replace(".tt_session", ""), true);
                }
            }
        },
        AddSessionToStorage: function(session, name, add_to_manager) {
            chrome.storage.local.get(null, function(storage) {
                if (storage.saved_sessions == undefined) {
                    let saved_sessions = [];
                    saved_sessions.push({name: name, session: session});
                    chrome.storage.local.set({saved_sessions: saved_sessions});
                    if (add_to_manager) {
                        TreeTabs.Manager.AddSessionToManagerList(saved_sessions[saved_sessions.length - 1]);
                    }
                } else {
                    let saved_sessions = storage.saved_sessions;
                    saved_sessions.push({name: name, session: session});
                    chrome.storage.local.set({saved_sessions: saved_sessions});
                    if (add_to_manager) {
                        TreeTabs.Manager.AddSessionToManagerList(saved_sessions[saved_sessions.length - 1]);
                    }
                }
                if (opt.debug) {
                    log("f: AddSessionToStorage, name: " + name + ", add_to_manager: " + add_to_manager);
                }
            });

        },
        AddAutosaveSessionToStorage: function(session, name) {
            chrome.storage.local.get(null, function(storage) {
                if (storage.saved_sessions_automatic == undefined) {
                    let s = [];
                    s.push({name: name, session: session});
                    chrome.storage.local.set({saved_sessions_automatic: s});
                } else {
                    let s = storage.saved_sessions_automatic;
                    s.unshift({name: name, session: session});
                    if (s[opt.autosave_max_to_keep]) {
                        s.splice(opt.autosave_max_to_keep, (s.length - opt.autosave_max_to_keep));
                    }
                    chrome.storage.local.set({saved_sessions_automatic: s});
                }
                if (opt.debug) {
                    log("f: AddAutosaveSessionToStorage, name: " + name);
                }
            });
        },
        RecreateSession: function(LoadedWindows) {
            if (opt.debug) {
                log("f: RecreateSession");
            }
            let RefTabs = {};
            LoadedWindows.forEach(function(LWin) {
                let NewTabs = [];
                let urls = [];
                (LWin.tabs).forEach(function(Tab) {
                    urls.push(Tab.url);
                    NewTabs.push(Tab);
                });
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
                                if (browserId == "F") {
                                    browser.sessions.setTabValue(new_tab.id, "CachedFaviconUrl", LWin.favicons[Tab.favicon]);
                                }
                                if (Tab.id == LWin.tabs[LWin.tabs.length - 1].id) { // last tab
                                    chrome.windows.get(new_window.id, {populate: true}, function(new_window_with_new_tabs) {
                                        for (let tInd = 0; tInd < new_window_with_new_tabs.tabs.length; tInd++) {
                                            RefTabs[NewTabs[tInd].id] = new_window_with_new_tabs.tabs[tInd].id;
                                            NewTabs[tInd].id = new_window_with_new_tabs.tabs[tInd].id;
                                        }
                                        for (let tInd = 0; tInd < new_window_with_new_tabs.tabs.length; tInd++) {
                                            if (RefTabs[NewTabs[tInd].parent] != undefined) {
                                                NewTabs[tInd].parent = RefTabs[NewTabs[tInd].parent];
                                            }
                                        }
                                        for (let tInd = 0; tInd < new_window_with_new_tabs.tabs.length; tInd++) {
                                            if (NewTabs[tInd].parent == "pin_list") {
                                                chrome.tabs.update(new_window_with_new_tabs.tabs[tInd].id, {pinned: true});
                                            }
                                            chrome.runtime.sendMessage({command: "update_tab", tabId: new_window_with_new_tabs.tabs[tInd].id, tab: {index: NewTabs[tInd].index, expand: NewTabs[tInd].expand, parent: NewTabs[tInd].parent}});
                                            if (browserId != "O" && browserId != "F") {
                                                chrome.runtime.sendMessage({command: "discard_tab", tabId: new_window_with_new_tabs.tabs[tInd].id});
                                            }
                                        }
                                        // if (browserId != "O") {
                                        // setTimeout(function() {
                                        // chrome.runtime.sendMessage({command: "discard_window", windowId: new_window_with_new_tabs.id});
                                        // }, urls.length * 300);
                                        // }
                                    });
                                }
                            });
                        }
                    });
                });
            });
        },
        ImportMergeTabs: function(LoadedWindows) {
            if (opt.debug) {
                log("f: ImportMergeTabs");
            }
            let RefTabs = {};
            for (let LWI = 0; LWI < LoadedWindows.length; LWI++) { // clear previous window ids
                LoadedWindows[LWI].id = "";
            }
            TreeTabs.Manager.ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_loaded_tree_structure")});
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
                            if (opt.debug) {
                                log("f: ImportMergeTabs, tabsMatch: " + tabsMatch);
                            }
                            if (tabsMatch > LoadedWindows[LWI].tabs.length * 0.6) {
                                LoadedWindows[LWI].id = cw[CWI].id;
                                break;
                            }
                        }
                    }
                }
                LoadedWindows.forEach(function(w) {
                    if (w.id == "") { // missing window, lets make one
                        if (opt.debug) {
                            log("f: ImportMergeTabs, missing window");
                        }
                        let NewTabs = [];
                        let urls = [];
                        (w.tabs).forEach(function(Tab) {urls.push(Tab.url); NewTabs.push(Tab);});
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
                                        if (browserId == "F") {
                                            browser.sessions.setTabValue(new_tab.id, "CachedFaviconUrl", w.favicons[Tab.favicon]);
                                        }
                                        if (Tab.id == LWin.tabs[LWin.tabs.length - 1].id) { // last tab
                                            chrome.windows.get(new_window.id, {populate: true}, function(new_window_with_new_tabs) {
                                                for (let tInd = 0; tInd < new_window_with_new_tabs.tabs.length; tInd++) {
                                                    RefTabs[NewTabs[tInd].id] = new_window_with_new_tabs.tabs[tInd].id;
                                                    NewTabs[tInd].id = new_window_with_new_tabs.tabs[tInd].id;
                                                }
                                                for (let tInd = 0; tInd < new_window_with_new_tabs.tabs.length; tInd++) {
                                                    if (RefTabs[NewTabs[tInd].parent] != undefined) {
                                                        NewTabs[tInd].parent = RefTabs[NewTabs[tInd].parent];
                                                    }
                                                }
                                                for (let tInd = 0; tInd < new_window_with_new_tabs.tabs.length; tInd++) {
                                                    if (NewTabs[tInd].parent == "pin_list") {
                                                        chrome.tabs.update(new_window_with_new_tabs.tabs[tInd].id, {pinned: true});
                                                    }
                                                    chrome.runtime.sendMessage({command: "update_tab", tabId: new_window_with_new_tabs.tabs[tInd].id, tab: {index: NewTabs[tInd].index, expand: NewTabs[tInd].expand, parent: NewTabs[tInd].parent}});
                                                    if (browserId != "O" && browserId != "F") {
                                                        chrome.runtime.sendMessage({command: "discard_tab", tabId: new_window_with_new_tabs.tabs[tInd].id});
                                                    }
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
                                        if (group != "" && group != "undefined" && w.groups[group] != undefined) {
                                            g[w.groups[group].id] = Object.assign({}, w.groups[group]);
                                        }
                                    }
                                }
                                if (Object.keys(w.folders).length > 0) {
                                    for (var folder in w.folders) {
                                        if (folder != "" && folder != "undefined" && w.folders[folder] != undefined) {
                                            w.folders[w.folders[folder].id] = Object.assign({}, w.folders[folder]);
                                        }
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
                                if (w.id == tt.CurrentWindowId) {
                                    TreeTabs.Manager.RecreateTreeStructure(w.groups, w.folders, []);
                                }
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
                                            if (browserId == "F") {
                                                browser.sessions.setTabValue(tab.id, "CachedFaviconUrl", w.favicons[Tab.favicon]);
                                            }
                                            if (Tab.parent == "pin_list") {
                                                chrome.tabs.update(tab.id, {pinned: true});
                                            }
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
                                    //         TreeTabs.Manager.ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_finding_ref_tabs")});
                                    //         for (let tInd = 0; tInd < NewTabs.length; tInd++) {
                                    //             if (RefTabs[NewTabs[tInd].parent] != undefined) {
                                    //                 NewTabs[tInd].parent = RefTabs[NewTabs[tInd].parent];
                                    //             }
                                    //         }
                                    //     }, 1000);
                                    // }
                                });
                                setTimeout(function() {
                                    TreeTabs.Manager.ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_finding_ref_tabs")});
                                    for (let tInd = 0; tInd < NewTabs.length; tInd++) {
                                        if (RefTabs[NewTabs[tInd].parent] != undefined) {
                                            NewTabs[tInd].parent = RefTabs[NewTabs[tInd].parent];
                                        }
                                    }
                                }, 2000);
                                setTimeout(function() {
                                    for (let tInd = 0; tInd < NewTabs.length; tInd++) {
                                        chrome.runtime.sendMessage({command: "update_tab", tabId: NewTabs[tInd].id, tab: {index: NewTabs[tInd].index, expand: NewTabs[tInd].expand, parent: NewTabs[tInd].parent}});
                                    }
                                    TreeTabs.Manager.ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_finding_other_windows")});
                                    if (w.id == tt.CurrentWindowId) {
                                        TreeTabs.Manager.RecreateTreeStructure(w.groups, w.folders, NewTabs);
                                    } else {
                                        chrome.runtime.sendMessage({command: "remote_update", groups: w.groups, folders: w.folders, tabs: NewTabs, windowId: w.id});
                                    }
                                    TreeTabs.Manager.ShowStatusBar({show: true, spinner: false, message: chrome.i18n.getMessage("status_bar_all_done"), hideTimeout: 2000});
                                }, 6000);
                            });
                        });
                    }
                });
            });
        },
        StartAutoSaveSession: function() {
            if (opt.autosave_interval > 0 && opt.autosave_max_to_keep > 0) {
                tt.AutoSaveSession = setInterval(function() {
                    if (opt.debug) {
                        log("f: AutoSaveSession, loop time is: " + opt.autosave_interval);
                    }
                    let d = new Date();
                    let newName = d.toLocaleString().replace(/\//g, ".").replace(/:/g, "꞉");
                    TreeTabs.Manager.ExportSession(newName, false, false, true);
                    TreeTabs.Manager.ShowStatusBar({show: true, spinner: false, message: chrome.i18n.getMessage("status_bar_autosave") + newName, hideTimeout: 1500});
                    if (document.getElementById("manager_window").style.top != "-500px") {
                        chrome.storage.local.get(null, function(storage) {TreeTabs.Manager.ReAddSessionAutomaticToManagerList(storage);});
                    }
                }, opt.autosave_interval * 60000);
            }
        },
        RecreateTreeStructure: function(groups, folders, tabs) { // groups and folders are in object, just like tt.groups and tt.folders, but tabs are in array of treetabs objects
            if (opt.debug) {
                log("f: RecreateTreeStructure");
            }
            TreeTabs.Manager.ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_quick_check_recreate_structure"), hideTimeout: 3000});
            if (groups && Object.keys(groups).length > 0) {
                for (var group in groups) {
                    tt.groups[groups[group].id] = Object.assign({}, groups[group]);
                }
                TreeTabs.Groups.AppendGroups(tt.groups);
            }
            if (folders && Object.keys(folders).length > 0) {
                for (var folder in folders) {
                    tt.folders[folders[folder].id] = Object.assign({}, folders[folder]);
                }
                TreeTabs.Folders.PreAppendFolders(tt.folders);
                TreeTabs.Folders.AppendFolders(tt.folders);
            }
            let ttTabs = {};
            tabs.forEach(function(Tab) {
                if (Tab.parent == "pin_list") {
                    chrome.tabs.update(Tab.id, {pinned: true});
                }
                if (Tab.parent != "") {
                    let AttemptNr = 20;
                    var Attempt = setInterval(function() {
                        AttemptNr--;
                        let tb = document.getElementById(Tab.id);
                        let tbp = document.getElementById("°" + Tab.parent);
                        if (tb != null && tbp != null) {
                            tbp.appendChild(tb);
                            if (Tab.expand != "") {
                                tb.classList.add(Tab.expand);
                            }
                            ttTabs[Tab.id] = {index: Tab.index, parent: Tab.parent, expand: Tab.expand};
                        }
                        if (AttemptNr < 0 || (tb != null && tbp != null)) {
                            clearInterval(Attempt);
                        }
                    }, 500);
                }
            });
            let SortAttemptNr = 20;
            var SortAttempt = setInterval(function() {
                SortAttemptNr--;
                if (SortAttemptNr < 0 || Object.keys(ttTabs).length == tabs.length || tabs.length == 0) {
                    TreeTabs.Tabs.RearrangeTree(ttTabs, folders, false);
                    clearInterval(SortAttempt);
                    TreeTabs.Groups.UpdateBgGroupsOrder();
                    setTimeout(function() {
                        TreeTabs.DOM.RefreshExpandStates();
                        TreeTabs.DOM.RefreshCounters();
                        tt.schedule_update_data++;
                        TreeTabs.Folders.SaveFolders();
                    }, 3000);
               }
            }, 500);
        },
        ShowStatusBar: function(p) { // show, spinner, message
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
    },
    Menu: {
        ttMenu: class {
            constructor(MenuItem) {
                let SeparatorDIV = document.createElement("div");         SeparatorDIV.className = "separator";         SeparatorDIV.id = MenuItem[0];    tt.DOMmenu.appendChild(SeparatorDIV);
                let MenuLI = document.createElement("li");                MenuLI.className = "menu_item";               MenuLI.id = MenuItem[1];          tt.DOMmenu.appendChild(MenuLI);
                this.id = MenuLI.id;
                this.Menu = MenuLI;
                this.Separator = SeparatorDIV;
                if (this.id == "menu_new_pin") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("pin")) {
                                TreeTabs.Tabs.OpenNewTab(true, tt.menuItemNode.id);
                            } else {
                                TreeTabs.Tabs.OpenNewTab(true, undefined);
                            }
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_new_tab") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("folder")) {
                                TreeTabs.Tabs.OpenNewTab(false, tt.menuItemNode.id);
                            } else {
                                if (tt.menuItemNode.classList.contains("pin")) {
                                    TreeTabs.Tabs.OpenNewTab(true, tt.menuItemNode.id);
                                } else {
                                    if (tt.menuItemNode.classList.contains("tab")) {
                                        TreeTabs.Tabs.OpenNewTab(false, tt.menuItemNode.id);
                                    } else {
                                        TreeTabs.Tabs.OpenNewTab(false, tt.active_group);
                                    }
                                }
                            }
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_unpin_tab" || this.id == "menu_pin_tab") {
                    this.Menu.onmousedown = function(event) {
                        event.stopPropagation();
                        if (event.which == 1) {
                            if (tt.menuItemNode.classList.contains("selected")) {
                                document.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {pinned: (tt.menuItemNode.classList.contains("tab"))});
                                });
                            } else {
                                chrome.tabs.update(parseInt(tt.menuItemNode.id), {pinned: (tt.menuItemNode.classList.contains("tab"))});
                            }
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_duplicate_tab") {
                    this.Menu.onmousedown = function(event) {
                        event.stopPropagation();
                        if (event.which == 1) {
                            if (tt.menuItemNode.classList.contains("selected")) {
                                document.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                                    tt.tabs[s.id].DuplicateTab();
                                    // DuplicateTab(s);
                                });
                            } else {
                                tt.tabs[tt.menuItemNode.id].DuplicateTab();
                                // DuplicateTab(tt.menuItemNode);
                            }
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_detach_tab") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TreeTabs.DOM.FreezeSelection(false);
                            let Nodes = [];
                            let NodesTypes = {DraggingPin: false, DraggingTab: false, DraggingFolder: false};
                            let query;
                            if (tt.menuItemNode.classList.contains("selected")) {
                                query = document.querySelectorAll(".selected, .selected .tab, .selected .folder");
                            } else {
                                query = document.querySelectorAll("[id='"+  tt.menuItemNode.id + "'], [id='"+  tt.menuItemNode.id + "'] .tab, [id='"+  tt.menuItemNode.id + "'] .folder");
                            }
                            query.forEach(function(s) {
                                if (s.classList.contains("pin")) {
                                    NodesTypes.DraggingPin = true;
                                    Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "pin"});
                                }
                                if (s.classList.contains("tab")) {
                                    NodesTypes.DraggingTab = true;
                                    Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "tab"});
                                }
                                if (s.classList.contains("folder")) {
                                    NodesTypes.DraggingFolder = true;
                                    Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "folder", index: (tt.folders[s.id] ? tt.folders[s.id].index : 0), name: (tt.folders[s.id] ? tt.folders[s.id].name : labels.noname_group), expand: (tt.folders[s.id] ? tt.folders[s.id].expand : "")});
                                }
                            });
                            TreeTabs.Tabs.Detach(Nodes, NodesTypes, {});
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_reload_tab") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("selected")) {
                                document.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                                    chrome.tabs.reload(parseInt(s.id));
                                });
                            } else {
                                chrome.tabs.reload(parseInt(tt.menuItemNode.id));
                            }
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_unload") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("pin") || tt.menuItemNode.classList.contains("tab")) {
                                if (tt.menuItemNode.classList.contains("selected")) {
                                    let tabsArr = [];
                                    document.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                                        tabsArr.push(parseInt(s.id));
                                        if (s.childNodes[2].childNodes.length > 0) {
                                            document.querySelectorAll("#" + s.childNodes[2].id + " .tab").forEach(function(t) {
                                                tabsArr.push(parseInt(t.id));
                                            });
                                        }
                                    });
                                    TreeTabs.Tabs.DiscardTabs(tabsArr);
                                } else {
                                    TreeTabs.Tabs.DiscardTabs([parseInt(tt.menuItemNode.id)]);
                                }
                            }
                            if (tt.menuItemNode.classList.contains("folder")) {
                                let tabsArr = [];
                                document.querySelectorAll("#" + tt.menuItemNode.id + " .tab").forEach(function(s) {
                                    tabsArr.push(parseInt(s.id));
                                });
                                TreeTabs.Tabs.DiscardTabs(tabsArr);
                            }
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_close") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("selected")) {
                                let tabsArr = [];
                                document.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                                    tabsArr.push(parseInt(s.id));
                                    if (s.childNodes[2].childNodes.length > 0) {
                                        document.querySelectorAll("#" + s.childNodes[2].id + " .tab").forEach(function(t) {
                                            tabsArr.push(parseInt(t.id));
                                        });
                                    }
                                });
                                TreeTabs.Tabs.CloseTabs(tabsArr);
                            } else {
                                TreeTabs.Tabs.CloseTabs([parseInt(tt.menuItemNode.id)]);
                            }
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_mute_tab") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("pin") || tt.menuItemNode.classList.contains("tab")) {
                                if (tt.menuItemNode.classList.contains("selected")) {
                                    document.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                                        chrome.tabs.update(parseInt(s.id), {muted: true});
                                    });
                                } else {
                                    chrome.tabs.update(parseInt(tt.menuItemNode.id), {muted: true});
                                }
                            }
                            if (tt.menuItemNode.classList.contains("folder")) {
                                document.querySelectorAll("#" + tt.menuItemNode.id + " .tab").forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {muted: true});
                                });
                            }
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_mute_tree") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            document.querySelectorAll("[id='" + tt.menuItemNode.id + "'], [id='" + tt.menuItemNode.id + "'] .tab").forEach(function(s) {
                                chrome.tabs.update(parseInt(s.id), {muted: true});
                            });
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_unmute_tab") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("pin") || tt.menuItemNode.classList.contains("tab")) {
                                if (tt.menuItemNode.classList.contains("selected")) {
                                    document.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                                        chrome.tabs.update(parseInt(s.id), {muted: false});
                                    });
                                } else {
                                    chrome.tabs.update(parseInt(tt.menuItemNode.id), {muted: false});
                                }
                            }
                            if (tt.menuItemNode.classList.contains("folder")) {
                                document.querySelectorAll("#" + tt.menuItemNode.id + " .tab").forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {muted: false});
                                });
                            }
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_unmute_tree") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            document.querySelectorAll("[id='" + tt.menuItemNode.id + "'], [id='" + tt.menuItemNode.id + "'] .tab").forEach(function(s) {
                                chrome.tabs.update(parseInt(s.id), {muted: false});
                            });
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
        
                if (this.id == "menu_mute_other") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("selected")) {
                                document.querySelectorAll(".pin:not(.selected), #" + tt.active_group + " .tab:not(.selected)").forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {muted: true});
                                });
                            } else {
                                document.querySelectorAll(".pin:not([id='" + tt.menuItemNode.id + "']), #" + tt.active_group + " .tab:not([id='" + tt.menuItemNode.id + "'])").forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {muted: true});
                                });
                            }
        
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
        
                if (this.id == "menu_unmute_other") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("selected")) {
                                document.querySelectorAll(".pin:not(.selected), #" + tt.active_group + " .tab:not(.selected)").forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {muted: false});
                                });
                            } else {
                                document.querySelectorAll(".pin:not([id='" + tt.menuItemNode.id + "']), #" + tt.active_group + " .tab:not([id='" + tt.menuItemNode.id + "'])").forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {muted: false});
                                });
                            }
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_undo_close_tab") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            chrome.sessions.getRecentlyClosed(null, function(sessions) {
                                if (sessions.length > 0) {
                                    chrome.sessions.restore(null, function() {});
                                }
                            });
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
        
                if (this.id == "menu_new_folder") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("tab")) {
                                let FolderId = TreeTabs.Folders.AddNewFolder({ParentId: tt.menuItemNode.parentNode.parentNode.id, InsertAfterId: tt.menuItemNode.id});
                                TreeTabs.Folders.ShowRenameFolderDialog(FolderId);
                            } else {
                                if (tt.menuItemNode.classList.contains("folder")) {
                                    let FolderId = TreeTabs.Folders.AddNewFolder({ParentId: tt.menuItemNode.id});
                                    TreeTabs.Folders.ShowRenameFolderDialog(FolderId);
                                } else {
                                    let FolderId = TreeTabs.Folders.AddNewFolder({});
                                    TreeTabs.Folders.ShowRenameFolderDialog(FolderId);
                                }
                            }
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
        
                if (this.id == "menu_expand_tree") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            document.querySelectorAll("[id='" + tt.menuItemNode.id + "'], [id='" + tt.menuItemNode.id + "'] .folder.c, [id='" + tt.menuItemNode.id + "'] .tab.c").forEach(function(s) {
                                s.classList.add("o");
                                s.classList.remove("c");
                            });
        
                            tt.schedule_update_data++;
                            TreeTabs.Menu.HideMenus();
                            TreeTabs.Folders.SaveFolders();
                        }
                    }
                }
        
                if (this.id == "menu_collapse_tree") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            document.querySelectorAll("[id='" + tt.menuItemNode.id + "'], [id='" + tt.menuItemNode.id + "'] .folder.c, [id='" + tt.menuItemNode.id + "'] .tab.c").forEach(function(s) {
                                s.classList.add("c");
                                s.classList.remove("o");
                            });
                            tt.schedule_update_data++;
                            TreeTabs.Menu.HideMenus();
                            TreeTabs.Folders.SaveFolders();
                        }
                    }
                }
        
                if (this.id == "menu_expand_all") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            document.querySelectorAll("#" + tt.active_group + " .folder.c, #" + tt.active_group + " .tab.c").forEach(function(s) {
                                s.classList.add("o");
                                s.classList.remove("c");
                            });
                            tt.schedule_update_data++;
                            TreeTabs.Menu.HideMenus();
                            TreeTabs.Folders.SaveFolders();
                        }
                    }
                }
        
                if (this.id == "menu_collapse_all") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            document.querySelectorAll("#" + tt.active_group + " .folder.o, #" + tt.active_group + " .tab.o").forEach(function(s) {
                                s.classList.add("c");
                                s.classList.remove("o");
                            });
                            tt.schedule_update_data++;
                            TreeTabs.Menu.HideMenus();
                            TreeTabs.Folders.SaveFolders();
                        }
                    }
                }
                if (this.id == "menu_close_tree") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
        
                            let tabsArr = [];
                            document.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab, [id='" + tt.menuItemNode.id + "']").forEach(function(s) {
                                tabsArr.push(parseInt(s.id));
                                if (s.childNodes[2].childNodes.length > 0) {
                                    document.querySelectorAll("#" + s.childNodes[2].id + " .tab").forEach(function(t) {
                                        tabsArr.push(parseInt(t.id));
                                    });
                                }
                            });
                            TreeTabs.Tabs.CloseTabs(tabsArr);
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_rename_folder") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TreeTabs.Folders.ShowRenameFolderDialog(tt.menuItemNode.id);
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
        
                if (this.id == "menu_delete_folder") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("selected")) {
                                document.querySelectorAll("#" + tt.menuItemNode.id + "  .selected, #" + tt.menuItemNode.id).forEach(function(s) {
                                    TreeTabs.Folders.RemoveFolder(s.id);
                                });
                            } else {
                                TreeTabs.Folders.RemoveFolder(tt.menuItemNode.id);
                            }
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_close_other") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            let tabsArr = [];
                            let query = "";
                            if (tt.menuItemNode.classList.contains("selected")) {
                                if (tt.menuItemNode.classList.contains("pin")) {
                                    query = ".pin:not(.selected)";
                                }
                                if (tt.menuItemNode.classList.contains("tab")) {
                                    query = "#" + tt.active_group + " .tab:not(.selected)";
                                }
                                // document.querySelectorAll(".pin:not(.selected), #"+tt.active_group+" .tab:not(.selected)").forEach(function(s) {
                                document.querySelectorAll(query).forEach(function(s) {
                                    let children = document.querySelectorAll("[id='" + s.id + "'] .selected");
                                    if (children.length == 0 || opt.promote_children) {
                                        tabsArr.push(parseInt(s.id));
                                    }
                                });
                                TreeTabs.Tabs.CloseTabs(tabsArr);
                            } else {
                                if (tt.menuItemNode.classList.contains("pin")) {
                                    query = ".pin:not([id='" + tt.menuItemNode.id + "'])";
                                }
                                if (tt.menuItemNode.classList.contains("tab")) {
                                    query = "#°" + tt.active_group + " .tab:not([id='" + tt.menuItemNode.id + "'])";
                                    document.getElementById("°" + tt.active_group).appendChild(tt.menuItemNode);
                                }
                                document.querySelectorAll(query).forEach(function(s) {
                                    tabsArr.push(parseInt(s.id));
                                });
        
                                TreeTabs.Tabs.CloseTabs(tabsArr);
                            }
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_bookmark_tree") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TreeTabs.Utils.Bookmark(tt.menuItemNode);
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
        
                if (this.id == "menu_rename_group") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TreeTabs.Groups.ShowGroupEditWindow(tt.menuItemNode.id);
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_delete_group") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TreeTabs.Groups.GroupRemove(tt.menuItemNode.id, false);
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
        
                if (this.id == "menu_delete_group_tabs_close") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TreeTabs.Groups.GroupRemove(tt.menuItemNode.id, true);
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
        
                if (this.id == "menu_groups_unload") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            let tabsArr = [];
                            document.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab").forEach(function(s) {
                                tabsArr.push(parseInt(s.id));
                            });
                            TreeTabs.Tabs.DiscardTabs(tabsArr);
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_group_tabs_close") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            let tabsArr = [];
                            document.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab").forEach(function(s) {
                                tabsArr.push(parseInt(s.id));
                            });
                            TreeTabs.Tabs.CloseTabs(tabsArr);
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_manager_window") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TreeTabs.Manager.OpenManagerWindow();
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_groups_hibernate") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TreeTabs.Manager.ExportGroup(tt.menuItemNode.id, false, true);
                            TreeTabs.Menu.HideMenus();
                            setTimeout(function() {TreeTabs.Groups.GroupRemove(tt.menuItemNode.id, true);}, 100);
                        }
                    }
                }
        
        
                if (this.id == "menu_bookmark_group") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            Bookmark(tt.menuItemNode);
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
                if (this.id == "menu_new_group") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TreeTabs.Groups.AddNewGroup();
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }
        
        
                if (this.id == "menu_treetabs_settings") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            chrome.tabs.create({"url": "options/options.html"});
                            TreeTabs.Menu.HideMenus();
                        }
                    }
                }

            }
            MenuHide() {
                this.Menu.style.display = "none";
            }
            MenuShow() {
                this.Menu.style.display = "";
            }
            SeparatorHide() {
                this.Separator.style.display = "none";
            }
            SeparatorShow() {
                this.Separator.style.display = "";
            }
        },
        HideMenus: function() {
            DefaultMenu.all_entries.forEach(function(MenuItem) {
                tt.menu[MenuItem[1]].MenuHide();
                tt.menu[MenuItem[1]].SeparatorHide();
            });
            tt.menu[DefaultMenu.all_entries[0][1]].Menu.parentNode.style.top = "-1000px";
            tt.menu[DefaultMenu.all_entries[0][1]].Menu.parentNode.style.left = "-1000px";
            tt.menu[DefaultMenu.all_entries[0][1]].Menu.parentNode.style.display = "none";
        },
        ShowMenu: function(MenuItems, event, ) {
            for (i = 0; i < DefaultMenu.all_entries.length; i++) {
                if (MenuItems[i][1]) {
                    tt.menu[DefaultMenu.all_entries[i][1]].MenuShow();
                } else {
                    tt.menu[DefaultMenu.all_entries[i][1]].MenuHide();
                }
                if (MenuItems[i][0]) {
                    tt.menu[DefaultMenu.all_entries[i][1]].SeparatorShow();
                } else {
                    tt.menu[DefaultMenu.all_entries[i][1]].SeparatorHide();
                }
            }
            tt.DOMmenu.style.display = "block";
            let x = event.pageX >= (document.body.clientWidth - tt.DOMmenu.getBoundingClientRect().width - 5) ? (document.body.clientWidth - tt.DOMmenu.getBoundingClientRect().width - 5) : (event.pageX - 5);
            let y = event.pageY >= (document.body.clientHeight - tt.DOMmenu.getBoundingClientRect().height - 16) ? (document.body.clientHeight - tt.DOMmenu.getBoundingClientRect().height - 16) : (event.pageY - 16);
            tt.DOMmenu.style.top = y + "px";
            tt.DOMmenu.style.left = x + "px";
        },
        ShowTabMenu: function(TabNode, event) {
            tt.menuItemNode = TabNode;
            if (TabNode.classList.contains("pin")) {
                TreeTabs.Menu.ShowMenu(DefaultMenu.pin, event);
                if (opt.allow_pin_close) {
                    tt.menu["menu_close"].MenuShow();
                }
            }
            if (TabNode.classList.contains("tab")) {
                TreeTabs.Menu.ShowMenu(DefaultMenu.tab, event);
                if (TabNode.classList.contains("o")) {
                    tt.menu["menu_collapse_tree"].SeparatorShow();
                    tt.menu["menu_collapse_tree"].MenuShow();
                }
                if (TabNode.classList.contains("c")) {
                    tt.menu["menu_expand_tree"].SeparatorShow();
                    tt.menu["menu_expand_tree"].MenuShow();
                }
                if (TabNode.classList.contains("c") || TabNode.classList.contains("o")) {
                    tt.menu["menu_close_tree"].MenuShow();
                    tt.menu["menu_mute_tree"].SeparatorShow();
                    tt.menu["menu_mute_tree"].MenuShow();
                    tt.menu["menu_unmute_tree"].MenuShow();
                }
            }
            if (TabNode.classList.contains("muted")) {
                tt.menu["menu_unmute_tab"].MenuShow();
            } else {
                tt.menu["menu_mute_tab"].MenuShow();
            }
            if (!TabNode.classList.contains("discarded")) {
                tt.menu["menu_unload"].MenuShow();
            }
        },
        ShowFolderMenu: function(FolderNode, event) {
            tt.menuItemNode = FolderNode;
            TreeTabs.Menu.ShowMenu(DefaultMenu.folder, event);
            if (FolderNode.classList.contains("o")) {
                tt.menu["menu_collapse_tree"].MenuShow();
            }
            if (FolderNode.classList.contains("c")) {
                tt.menu["menu_expand_tree"].MenuShow();
            }
            if (document.querySelectorAll("#" + FolderNode.id + " .tab").length == 0) {
                tt.menu["menu_detach_tab"].SeparatorShow();
                tt.menu["menu_detach_tab"].MenuShow();
            }
        },
        ShowFGlobalMenu: function(event) {
            tt.menuItemNode = event.target;
            TreeTabs.Menu.ShowMenu(DefaultMenu.global, event);
        },
        ShowFGroupMenu: function(GroupNode, event) {
            tt.menuItemNode = GroupNode;
            TreeTabs.Menu.ShowMenu(DefaultMenu.group, event);
            if (tt.menuItemNode.id == "tab_list") {
                tt.menu["menu_groups_hibernate"].MenuHide();
                tt.menu["menu_rename_group"].MenuHide();
                tt.menu["menu_delete_group"].MenuHide();
                tt.menu["menu_delete_group_tabs_close"].MenuHide();
            }
        },
        CreateMenu: function() {
            tt.DOMmenu = document.getElementById("main_menu");
            DefaultMenu.all_entries.forEach(function(MenuItem) {
                tt.menu[MenuItem[1]] = new TreeTabs.Menu.ttMenu(MenuItem);
            });
        }
    },
    Toolbar: {
        RestoreToolbarSearchFilter: function() { // RESTORE LAST USED SEARCH TYPE (URL OR TITLE) IN TOOLBAR SEARCH
            chrome.runtime.sendMessage({command: "get_search_filter", windowId: tt.CurrentWindowId}, function(response) {
                let ButtonFilter = document.getElementById("button_filter_type");
                if (response == "url") {
                    ButtonFilter.classList.add("url");
                    ButtonFilter.classList.remove("title");
                } else {
                    ButtonFilter.classList.add("title");
                    ButtonFilter.classList.remove("url");
                }
            });
        },
        RestoreToolbarShelf: function() { // RESTORE LAST ACTIVE SHELF (SEARCH, TOOLS, GROUPS, SESSION OR FOLDER) IN TOOLBAR
            chrome.runtime.sendMessage({command: "get_active_shelf", windowId: tt.CurrentWindowId}, function(response) {
                let filterBox = document.getElementById("filter_box");
                filterBox.setAttribute("placeholder", labels.searchbox);
                filterBox.style.opacity = "1";
                document.querySelectorAll(".on").forEach(function(s) {
                    s.classList.remove("on");
                });
                document.querySelectorAll(".toolbar_shelf").forEach(function(s) {
                    s.classList.add("hidden");
                });
                if (response == "search" && document.getElementById("button_search") != null) {
                    document.getElementById("toolbar_search").classList.remove("hidden");
                    document.getElementById("button_search").classList.add("on");
                }
                if (response == "tools" && document.getElementById("button_tools") != null) {
                    document.getElementById("toolbar_shelf_tools").classList.remove("hidden");
                    document.getElementById("button_tools").classList.add("on");
                }
                if (response == "groups" && document.getElementById("button_groups") != null) {
                    document.getElementById("toolbar_shelf_groups").classList.remove("hidden");
                    document.getElementById("button_groups").classList.add("on");
                }
                if (response == "backup" && document.getElementById("button_backup") != null) {
                    document.getElementById("toolbar_shelf_backup").classList.remove("hidden");
                    document.getElementById("button_backup").classList.add("on");
                }
                if (response == "folders" && document.getElementById("button_folders") != null) {
                    document.getElementById("toolbar_shelf_folders").classList.remove("hidden");
                    document.getElementById("button_folders").classList.add("on");
                }
                if (browserId != "F") {
                    chrome.storage.local.get(null, function(storage) {
                        let bak1 = storage["windows_BAK1"] ? storage["windows_BAK1"] : [];
                        let bak2 = storage["windows_BAK2"] ? storage["windows_BAK2"] : [];
                        let bak3 = storage["windows_BAK3"] ? storage["windows_BAK3"] : [];
                        if (bak1.length && document.getElementById("#button_load_bak1") != null) {
                            document.getElementById("button_load_bak1").classList.remove("disabled");
                        } else {
                            document.getElementById("button_load_bak1").classList.add("disabled");
                        }
                        if (bak2.length && document.getElementById("#button_load_bak2") != null) {
                            document.getElementById("button_load_bak2").classList.remove("disabled");
                        } else {
                            document.getElementById("button_load_bak2").classList.add("disabled");
                        }
                        if (bak3.length && document.getElementById("#button_load_bak3") != null) {
                            document.getElementById("button_load_bak3").classList.remove("disabled");
                        } else {
                            document.getElementById("button_load_bak3").classList.add("disabled");
                        }
                    });
                }
                TreeTabs.DOM.RefreshGUI();
            });
        },
        ShelfToggle: function(mousebutton, button, toolbarId, SendMessage, SidebarRefreshGUI, OptionsRefreshGUI) { // FUNCTION TO TOGGLE SHELFS AND SAVE IT
            if (mousebutton == 1) {
                if (button.classList.contains("on")) {
                    document.querySelectorAll(".on").forEach(function(s) {
                        s.classList.remove("on");
                    });
                    document.querySelectorAll(".toolbar_shelf").forEach(function(s) {
                        s.classList.add("hidden");
                    });
                    chrome.runtime.sendMessage({command: "set_active_shelf", active_shelf: "", windowId: tt.CurrentWindowId});
                } else {
                    document.querySelectorAll(".toolbar_shelf:not(#" + toolbarId + ")").forEach(function(s) {
                        s.classList.add("hidden");
                    });
                    document.getElementById(toolbarId).classList.remove("hidden");
                    chrome.runtime.sendMessage({command: "set_active_shelf", active_shelf: SendMessage, windowId: tt.CurrentWindowId});
                    document.querySelectorAll(".on:not(#" + button.id + ")").forEach(function(s) {
                        s.classList.remove("on");
                    });
                    button.classList.add("on");
                }
                if (SidebarRefreshGUI) {
                    TreeTabs.DOM.RefreshGUI();
                }
                if (OptionsRefreshGUI) {
                    RefreshGUI();
                }
            }
        },
        RemoveToolbar: function() {
            let toolbar = document.getElementById("toolbar");
            while (toolbar.hasChildNodes()) {
                toolbar.removeChild(toolbar.firstChild);
            }
        },
        RecreateToolbar: function(NewToolbar) {
            let toolbar = document.getElementById("toolbar");
            for (var shelf in NewToolbar) {
                let NewShelf = document.createElement("div");
                NewShelf.id = shelf;
                NewShelf.classList = "toolbar_shelf";
                toolbar.appendChild(NewShelf);
                NewToolbar[shelf].forEach(function(button) {
                    let Newbutton = document.createElement("div");
                    Newbutton.id = button;
                    Newbutton.classList = "button";
                    NewShelf.appendChild(Newbutton);
                    let NewbuttonIMG = document.createElement("div");
                    NewbuttonIMG.classList = "button_img";
                    Newbutton.appendChild(NewbuttonIMG);
                });
            }
            let toolbar_main = document.getElementById("toolbar_main");
            let SearchShelf = document.getElementById("toolbar_search");
            if (toolbar_main != null && SearchShelf != null) {
                toolbar_main.classList.remove("toolbar_shelf");
                let SearchBox = document.createElement("div");
                SearchBox.id = "toolbar_search_input_box";
                SearchShelf.appendChild(SearchBox);
                let SearchInput = document.createElement("input");
                SearchInput.classList = "text_input";
                SearchInput.id = "filter_box";
                SearchInput.type = "text";
                SearchInput.placeholder = labels.searchbox;
                SearchBox.appendChild(SearchInput);
                let ClearX = document.createElement("div");
                ClearX.id = "button_filter_clear";
                ClearX.type = "reset";
                ClearX.style.opacity = "0";
                ClearX.style.position = "absolute";
                SearchBox.appendChild(ClearX);
                let SearchButtons = document.createElement("div");
                SearchButtons.id = "toolbar_search_buttons";
                SearchShelf.appendChild(SearchButtons);
                let FilterType = document.getElementById("button_filter_type");
                SearchButtons.appendChild(FilterType);
                let GoPrev = document.getElementById("filter_search_go_prev");
                SearchButtons.appendChild(GoPrev);
                let GoNext = document.getElementById("filter_search_go_next");
                SearchButtons.appendChild(GoNext);
                TreeTabs.DOM.Loadi18n();
            }
        },
        RecreateToolbarUnusedButtons: function(buttonsIds) { // OPTIONS PAGE
            let unused_buttons = document.getElementById("toolbar_unused_buttons");
            buttonsIds.forEach(function(button) {
                let Newbutton = document.createElement("div");
                Newbutton.id = button;
                Newbutton.classList = "button";
                unused_buttons.appendChild(Newbutton);
                let NewbuttonIMG = document.createElement("div");
                NewbuttonIMG.classList = "button_img";
                Newbutton.appendChild(NewbuttonIMG);
            });
        },
        SaveToolbar: function() { // OPTIONS PAGE
            let unused_buttons = [];
            let toolbar = {};
            let u = document.querySelectorAll("#toolbar_unused_buttons .button");
            u.forEach(function(b) {
                unused_buttons.push(b.id);
            });
            let t = document.getElementById("toolbar");
            t.childNodes.forEach(function(s) {
                toolbar[s.id] = [];
                let t = document.querySelectorAll("#" + s.id + " .button").forEach(function(b) {
                    toolbar[s.id].push(b.id);
                });
            });
            chrome.storage.local.set({toolbar: toolbar});
            chrome.storage.local.set({unused_buttons: unused_buttons});
            setTimeout(function() {chrome.runtime.sendMessage({command: "reload_toolbar", toolbar: toolbar, opt: opt});}, 50);
        },
        // ASSIGN MOUSE EVENTS FOR TOOLBAR BUTTONS, (Buttons AND BindToolbarShelfToggleButtons), PARAMETERS DECIDE IF BUTTONS ARE CLICKABLE
        // IN OPTIONS PAGE - TOOLBAR BUTTONS SAMPLES, MUST NOT CALL FUNCTIONS ON CLICKS, BUT STILL SHELFS BUTTONS MUST TOGGLE AND MOREOVER ON CLICK AND NOT ON MOUSEDOWN THIS IS WHERE ToolbarShelfToggleClickType="Click" IS NECESSARY
        SetToolbarEvents: function(CleanPreviousBindings, BindButtons, BindToolbarShelfToggleButtons, ToolbarShelfToggleClickType, SidebarRefreshGUI, OptionsRefreshGUI) {
        
            let ClearSearch = document.getElementById("button_filter_clear");
            let FilterBox = document.getElementById("filter_box");
        
            if (ClearSearch != null && FilterBox != null) {
                if (CleanPreviousBindings) {
                    FilterBox.removeEventListener("oninput", function() {});
                    ClearSearch.removeEventListener("onmousedown", function() {});
                }
                if (BindButtons) {
                    // FILTER ON INPUT
                    FilterBox.oninput = function(event) {
                            TreeTabs.Tabs.FindTab(this.value);
                        }
                    // CLEAR FILTER BUTTON
                    ClearSearch.onmousedown = function(event) {
                        if (event.which == 1) {
                            this.style.opacity = "0";
                            this.style.opacity = "0";
                            this.setAttribute("title", "");
                            TreeTabs.Tabs.FindTab("");
                        }
                    }
                }
            }
        
            document.querySelectorAll(".button").forEach(function(s) {
        
                if (CleanPreviousBindings) {
                    s.removeEventListener("onmousedown", function() {});
                    s.removeEventListener("onclick", function() {});
                    s.removeEventListener("click", function() {});
                }
        
                if (BindToolbarShelfToggleButtons) {
                    if (s.id == "button_search") {
                        s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                            if (event.which == 1) {
                                TreeTabs.Toolbar.ShelfToggle(event.which, this, "toolbar_search", "search", SidebarRefreshGUI, OptionsRefreshGUI);
                            }
                        });
                    }
                    if (s.id == "button_tools") {
                        s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                            if (event.which == 1) {
                                TreeTabs.Toolbar.ShelfToggle(event.which, this, "toolbar_shelf_tools", "tools", SidebarRefreshGUI, OptionsRefreshGUI);
                            }
                        });
                    }
                    if (s.id == "button_groups") {
                        s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                            if (event.which == 1) {
                                TreeTabs.Toolbar.ShelfToggle(event.which, this, "toolbar_shelf_groups", "groups", SidebarRefreshGUI, OptionsRefreshGUI);
                            }
                        });
                    }
                    if (s.id == "button_backup") {
                        s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                            if (event.which == 1) {
                                TreeTabs.Toolbar.ShelfToggle(event.which, this, "toolbar_shelf_backup", "backup", SidebarRefreshGUI, OptionsRefreshGUI);
                            }
                        });
                    }
                    if (s.id == "button_folders") {
                        s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                            if (event.which == 1) {
                                TreeTabs.Toolbar.ShelfToggle(event.which, this, "toolbar_shelf_folders", "folders", SidebarRefreshGUI, OptionsRefreshGUI);
                            }
                        });
                    }
                }
        
                if (BindButtons) {
                    // NEW TAB
                    if (s.id == "button_new") {
                        s.onclick = function(event) {
                            if (event.which == 1) {
                                if (opt.append_tab_from_toolbar == "group_root") {
                                    TreeTabs.Tabs.OpenNewTab(false, tt.active_group);
                                }
                                if (opt.append_tab_from_toolbar == "as_regular_orphan") {
                                    TreeTabs.Tabs.OpenNewTab(false, (document.querySelectorAll("#" + tt.active_group + " .tab").length == 0 ? tt.active_group : undefined));
                                }
                            }
                        }
                        s.onmousedown = function(event) {
                            // DUPLICATE TAB
                            if (event.which == 2) {
                                event.preventDefault();
                                let activeTab = document.querySelector("#" + tt.active_group + " .active_tab") != null ? document.querySelector("#" + tt.active_group + " .active_tab") : document.querySelector(".pin.active_tab") != null ? document.querySelector(".pin.active_tab") : null;
                                if (activeTab != null && tt.tabs[activeTab.id]) {
                                    tt.tabs[activeTab.id].DuplicateTab();
                                }
                            }
                            // SCROLL TO TAB
                            if (event.which == 3) {
                                chrome.tabs.query({
                                    currentWindow: true,
                                    active: true
                                }, function(activeTab) {
                                    if (activeTab[0].pinned && opt.pin_list_multi_row == false && tt.tabs[activeTab[0].id]) {
                                        tt.tabs[activeTab[0].id].ScrollToTab();
                                    }
                                    if (activeTab[0].pinned == false) {
                                        let Tab = document.getElementById(activeTab[0].id);
                                        let groupId = TreeTabs.DOM.GetParentsByClass(Tab, "group")[0].id;
                                        TreeTabs.Groups.SetActiveGroup(groupId, true, true);
                                    }
                                });
                            }
                        }
                    }
                    // PIN TAB
                    if (s.id == "button_pin") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let Tabs = document.querySelectorAll(".pin.active_tab, .pin.selected, #" + tt.active_group + " .active_tab, #" + tt.active_group + " .selected");
                                Tabs.forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {pinned: Tabs[0].classList.contains("tab")});
                                })
                            }
                        }
                    }
                    // VERTICAL TABS OPTIONS
                    if (s.id == "button_options") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                chrome.tabs.create({url: "options/options.html"});
                            }
                        }
                    }
        
                    // UNDO CLOSE
                    if (s.id == "button_undo") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                chrome.sessions.getRecentlyClosed(null, function(sessions) {
                                    if (sessions.length > 0) {
                                        chrome.sessions.restore(null, function(restored) {});
                                    }
                                });
                            }
                        }
                    }
        
                    // MOVE TAB TO NEW WINDOW (DETACH)
                    if (s.id == "button_detach" || s.id == "button_move") { // move is legacy name of detach button
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                TreeTabs.DOM.FreezeSelection(false);
                                let Nodes = [];
                                let NodesTypes = {DraggingPin: false, DraggingTab: false, DraggingFolder: false};
                                let query;
                                if (document.querySelectorAll(".selected").length > 0) {
                                   query = document.querySelectorAll(".selected, .selected .tab, .selected .folder");
                                } else {
                                    query = document.querySelectorAll(".active_tab");
                                }
                                query.forEach(function(s) {
                                    if (s.classList.contains("pin")) {
                                        NodesTypes.DraggingPin = true;
                                        Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "pin"});
                                    }
                                    if (s.classList.contains("tab")) {
                                        NodesTypes.DraggingTab = true;
                                        Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "tab"});
                                    }
                                    if (s.classList.contains("folder")) {
                                        NodesTypes.DraggingFolder = true;
                                        Nodes.push({id: s.id, parent: s.parentNode.id, selected: s.classList.contains("selected"), temporary: s.classList.contains("selected_temporarly"), NodeClass: "folder", index: (tt.folders[s.id] ? tt.folders[s.id].index : 0), name: (tt.folders[s.id] ? tt.folders[s.id].name : labels.noname_group), expand: (tt.folders[s.id] ? tt.folders[s.id].expand : "")});
                                    }
                                });
                                TreeTabs.Tabs.Detach(Nodes, NodesTypes, {});
                            }
                        }
                    }
        
                    // GO TO PREVIOUS SEARCH RESULT
                    if (s.id == "filter_search_go_prev") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let filtered = document.querySelectorAll("#" + tt.active_group + " .tab.filtered");
                                if (filtered.length > 0) {
                                    document.querySelectorAll(".highlighted_search").forEach(function(s) {
                                        s.classList.remove("highlighted_search");
                                    });
                                    if (tt.SearchIndex == 0) {
                                        tt.SearchIndex = filtered.length - 1;
                                    } else {
                                        tt.SearchIndex--;
                                    }
                                    filtered[tt.SearchIndex].classList.add("highlighted_search");
                                    if (tt.tabs[filtered[tt.SearchIndex].id]) {
                                        tt.tabs[filtered[tt.SearchIndex].id].ScrollToTab();
                                    }
                                }
                            }
                        }
                    }
        
                    // GO TO NEXT SEARCH RESULT
                    if (s.id == "filter_search_go_next") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let filtered = document.querySelectorAll("#" + tt.active_group + " .tab.filtered");
                                if (filtered.length > 0) {
                                    document.querySelectorAll(".highlighted_search").forEach(function(s) {
                                        s.classList.remove("highlighted_search");
                                    });
                                    if (tt.SearchIndex == filtered.length - 1) {
                                        tt.SearchIndex = 0;
                                    } else {
                                        tt.SearchIndex++;
                                    }
                                    filtered[tt.SearchIndex].classList.add("highlighted_search");
                                    if (tt.tabs[filtered[tt.SearchIndex].id]) {
                                        tt.tabs[filtered[tt.SearchIndex].id].ScrollToTab();
                                    }
                                }
                            }
                        }
                    }
        
                    // SHOW/HIDE GROUPS TOOLBAR
                    if (s.id == "button_groups_toolbar_hide") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                TreeTabs.Groups.GroupsToolbarToggle();
                            }
                        }
                    }
        
                    // SHOW GROUP MANAGER
                    if (s.id == "button_manager_window") {
                        s.onmousedown = function(event) {
                            if (event.which == 1 && document.getElementById("manager_window").style.top == "-500px") {
                                TreeTabs.Manager.OpenManagerWindow();
                            } else {
                                TreeTabs.DOM.HideRenameDialogs();
                            }
                        }
                    }
                    // NEW GROUP
                    if (s.id == "button_new_group") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                TreeTabs.Groups.AddNewGroup();
                            }
                        }
                    }
        
                    // REMOVE GROUP
                    if (s.id == "button_remove_group") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                if (tt.active_group != "tab_list") {
                                    TreeTabs.Groups.GroupRemove(tt.active_group, event.shiftKey);
                                }
                            }
                        }
                    }
        
        
        
                    // EDIT GROUP
                    if (s.id == "button_edit_group") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                if (tt.active_group != "tab_list") {
                                    TreeTabs.Groups.ShowGroupEditWindow(tt.active_group);
                                }
                            }
                        }
                    }
        
                    // EXPORT GROUP
                    if (s.id == "button_export_group") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                TreeTabs.Manager.ExportGroup(tt.active_group, tt.groups[tt.active_group].name, false);
                            }
                        }
                    }
        
                    // IMPORT GROUP
                    if (s.id == "button_import_group") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let inputFile = TreeTabs.File.ShowOpenFileDialog(".tt_group");
                                inputFile.onchange = function(event) {
                                    TreeTabs.Manager.ImportGroup(true, false);
                                }
                            }
                        }
                    }
        
                    // NEW FOLDER
                    if (s.id == "button_new_folder") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let FolderId = TreeTabs.Folders.AddNewFolder({});
                                TreeTabs.Folders.ShowRenameFolderDialog(FolderId);
                            }
                        }
                    }
        
                    // RENAME FOLDER
                    if (s.id == "button_edit_folder") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                if (document.querySelectorAll("#" + tt.active_group + " .selected").length > 0) {
                                    TreeTabs.Folders.ShowRenameFolderDialog(document.querySelectorAll("#" + tt.active_group + " .selected")[0].id);
                                }
                            }
                        }
                    }
                    // REMOVE FOLDERS
                    if (s.id == "button_remove_folder") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                document.querySelectorAll("#" + tt.active_group + " .selected").forEach(function(s) {
                                    TreeTabs.Folders.RemoveFolder(s.id);
                                });
                            }
                        }
                    }
                    // DISCARD TABS
                    if (s.id == "button_unload" || s.id == "button_discard") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                if (document.querySelectorAll(".pin.selected:not(.active_tab), #" + tt.active_group + " .selected:not(.active_tab)").length > 0) {
                                    TreeTabs.Tabs.DiscardTabs(
                                        Array.prototype.map.call(document.querySelectorAll(".pin:not(.active_tab), #" + tt.active_group + " .selected:not(.active_tab)"), function(s) {
                                            return parseInt(s.id);
                                        })
                                    );
                                } else {
                                    TreeTabs.Tabs.DiscardTabs(
                                        Array.prototype.map.call(document.querySelectorAll(".pin:not(.active_tab), .tab:not(.active_tab)"), function(s) {
                                            return parseInt(s.id);
                                        })
                                    );
                                }
                            }
                        }
                    }
                    // IMPORT BACKUP
                    if (s.id == "button_import_bak") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let inputFile = TreeTabs.File.ShowOpenFileDialog(".tt_session");
                                inputFile.onchange = function(event) {
                                    TreeTabs.Manager.ImportSession(true, false, false);
                                }
                            }
                        }
                    }
                    // EXPORT BACKUP
                    if (s.id == "button_export_bak") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let d = new Date();
                                TreeTabs.Manager.ExportSession((d.toLocaleString().replace(/\//g, ".").replace(/:/g, "꞉")), true, false, false);
                            }
                        }
                    }
                    // MERGE BACKUP
                    if (s.id == "button_import_merge_bak") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let inputFile = TreeTabs.File.ShowOpenFileDialog(".tt_session");
                                inputFile.onchange = function(event) {
                                    TreeTabs.Manager.ImportSession(false, false, true);
                                    // TreeTabs.Manager.ImportMergeTabs();
                                }
                            }
                        }
                    }
        
                    // CHANGE FILTERING TYPE
                    if (s.id == "button_filter_type") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                if (this.classList.contains("url")) {
                                    this.classList.remove("url");
                                    this.classList.add("title");
                                    chrome.runtime.sendMessage({command: "set_search_filter", search_filter: "title", windowId: tt.CurrentWindowId});
                                } else {
                                    this.classList.remove("title");
                                    this.classList.add("url");
                                    chrome.runtime.sendMessage({command: "set_search_filter", search_filter: "url", windowId: tt.CurrentWindowId});
                                }
                                TreeTabs.Tabs.FindTab(document.getElementById("filter_box").value);
                            }
                        }
                    }
        
                    // EMERGENCY RELOAD
                    if (s.id == "button_reboot") {
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                chrome.runtime.sendMessage({command: "reload"});
                                chrome.runtime.sendMessage({command: "reload_sidebar"});
                                location.reload();
                            }
                        }
                    }
        
                    // SORT TABS
                    // if (s.id == "button_sort") {
                    // s.onmousedown = function(event) {
                    // if (event.which == 1) {
                    // SortTabs();
                    // }
                    // }
                    // }
                    // REPEAT SEARCH
                    // if (s.id == "repeat_search") {
                    // s.onmousedown = function(event) {
                    // if (event.which == 1) {
                    // TreeTabs.Tabs.FindTab(document.getElementById("filter_box").value);
                    // }
                    // }
                    // }
        
        
                    if (browserId != "F") {
                        // BOOKMARKS
                        if (s.id == "button_bookmarks") {
                            s.onmousedown = function(event) {
                                if (event.which == 1) {
                                    chrome.tabs.create({url: "chrome://bookmarks/"});
                                }
                            }
                        }
        
                        // DOWNLOADS
                        if (s.id == "button_downloads") {
                            s.onmousedown = function(event) {
                                if (event.which == 1) {
                                    chrome.tabs.create({url: "chrome://downloads/"});
                                }
                            }
                        }
        
                        // HISTORY
                        if (s.id == "button_history") {
                            s.onmousedown = function(event) {
                                if (event.which == 1) {
                                    chrome.tabs.create({url: "chrome://history/"});
                                }
                            }
                        }
        
                        // EXTENSIONS
                        if (s.id == "button_extensions") {
                            s.onmousedown = function(event) {
                                if (event.which == 1) {
                                    chrome.tabs.create({url: "chrome://extensions"});
                                }
                            }
                        }
        
                        // SETTINGS
                        if (s.id == "button_settings") {
                            s.onmousedown = function(event) {
                                if (event.which == 1) {
                                    chrome.tabs.create({url: "chrome://settings/"});
                                }
                            }
                        }
        
                        // LOAD BACKUPS
                        if (s.id == "button_load_bak1" || s.id == "button_load_bak2" || s.id == "button_load_bak3") {
                            s.onmousedown = function(event) {
                                if (event.which == 1 && this.classList.contains("disabled") == false) {
                                    let BakN = (this.id).substr(15);
                                    chrome.storage.local.get(null, function(storage) {
                                        if (Object.keys(storage["windows_BAK" + BakN]).length > 0) {
                                            chrome.storage.local.set({"windows": storage["windows_BAK" + BakN]});
                                        }
                                        if (Object.keys(storage["tabs_BAK" + BakN]).length > 0) {
                                            chrome.storage.local.set({"tabs": storage["tabs_BAK" + BakN]});
                                            alert("Loaded backup");
                                        }
                                        chrome.runtime.sendMessage({command: "reload"});
                                        chrome.runtime.sendMessage({command: "reload_sidebar"});
                                        location.reload();
                                    });
                                }
                            }
                        }
                    }
                }
            });
        }
    },
    Theme: {
        RestorePinListRowSettings: function() {
            plist = document.getElementById("pin_list");
            if (opt.pin_list_multi_row) {
                plist.style.whiteSpace = "normal";
                plist.style.overflowX = "hidden";
            } else {
                plist.style.whiteSpace = "";
                plist.style.overflowX = "";
            }
            TreeTabs.DOM.RefreshGUI();
        },
        ApplyTheme: function(theme) {
            TreeTabs.Groups.RestoreStateOfGroupsToolbar();
            TreeTabs.Theme.ApplySizeSet(theme["TabsSizeSetNumber"]);
            TreeTabs.Theme.ApplyColorsSet(theme["ColorsSet"]);
            TreeTabs.Theme.ApplyTabsMargins(theme["TabsMargins"]);
            TreeTabs.Theme.ApplyBlinking();
            TreeTabs.DOM.RefreshGUI();
            for (var groupId in tt.groups) {
                let groupTitle = document.getElementById("_gte" + groupId);
                if (groupTitle != null && tt.groups[groupId].font == "") {
                    groupTitle.style.color = "";
                }
            }
            TreeTabs.DOM.Loadi18n();
        },
        // theme colors is an object with css variables (but without --), for example; {"button_background": "#f2f2f2", "filter_box_border": "#cccccc"}
        ApplyColorsSet: function(ThemeColors) {
            let css_variables = "";
            for (let css_variable in ThemeColors) {
                css_variables = css_variables + "--" + css_variable + ":" + ThemeColors[css_variable] + ";";
            }
            for (let si = 0; si < document.styleSheets.length; si++) {
                if (document.styleSheets[si].ownerNode.id == "theme_colors") {
                    document.styleSheets[si].deleteRule(document.styleSheets[si].cssRules.length - 1);
                    document.styleSheets[si].insertRule("body { " + css_variables + " }", document.styleSheets[si].cssRules.length);
                }
            }
        },
        ApplySizeSet: function(size) {
            for (let si = 0; si < document.styleSheets.length; si++) {
                if ((document.styleSheets[si].ownerNode.id).match("sizes_preset") != null) {
                    if (document.styleSheets[si].ownerNode.id == "sizes_preset_" + size) {
                        document.styleSheets.item(si).disabled = false;
                    } else {
                        document.styleSheets.item(si).disabled = true;
                    }
                }
            }
            // if (browserId == "F") {
            // for some reason top position for various things is different in firefox?????
            // if (size > 1) {
            // document.styleSheets[document.styleSheets.length-1].insertRule(".tab_header>.tab_title { margin-top: -1px; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
            // } else {
            // document.styleSheets[document.styleSheets.length-1].insertRule(".tab_header>.tab_title { margin-top: 0px; }", document.styleSheets[document.styleSheets.length-1].cssRules.length);
            // }
            // }
        },
        ApplyTabsMargins: function(size) {
            for (let si = 0; si < document.styleSheets.length; si++) {
                if ((document.styleSheets[si].ownerNode.id).match("tabs_margin") != null) {
                    if (document.styleSheets[si].ownerNode.id == "tabs_margin_" + size) {
                        document.styleSheets.item(si).disabled = false;
                    } else {
                        document.styleSheets.item(si).disabled = true;
                    }
                }
            }
        },
        ApplyBlinking: function() {
            for (let si = 0; si < document.styleSheets.length; si++) {
                if ((document.styleSheets[si].ownerNode.id).match("blinking_pins") != null) {
                    if (opt.pin_attention_blinking) {
                        document.styleSheets.item(si).disabled = false;
                    } else {
                        document.styleSheets.item(si).disabled = true;
                    }
                }
                if ((document.styleSheets[si].ownerNode.id).match("blinking_audio") != null) {
                    if (opt.audio_blinking) {
                        document.styleSheets.item(si).disabled = false;
                    } else {
                        document.styleSheets.item(si).disabled = true;
                    }
                }
            }
        },
        GetCurrentToolbar: function(storage) {
            if (storage["toolbar"]) {
                return storage["toolbar"];
            } else {
                return DefaultToolbar;
            }
        },
        GetCurrentTheme: function(storage) {
            if (storage["current_theme"] && storage["themes"] && storage["themes"][storage["current_theme"]]) {
                let theme = storage["themes"][storage["current_theme"]];
                let correctedTheme = TreeTabs.Theme.CheckTheme(theme);
                if (correctedTheme.theme_version < 4 && storage["preferences"].show_toolbar == undefined) {
                    opt.show_toolbar = correctedTheme.ToolbarShow;
                    TreeTabs.Preferences.SavePreferences(opt);
                }
                return correctedTheme;
            } else {
                return DefaultTheme;
            }
        },
        // OPTIONS PAGE
        LoadTheme: function(ThemeId, reloadInSidebar) {
            document.querySelectorAll(".theme_buttons").forEach(function(s) {
                s.disabled = true;
            });
            chrome.storage.local.set({current_theme: ThemeId}, function() {
                chrome.storage.local.get(null, function(storage) {
                    SelectedTheme = Object.assign({}, TreeTabs.Theme.GetCurrentTheme(storage));
                    setTimeout(function() {
                        document.getElementById("new_theme_name").value = SelectedTheme.theme_name;
                        setTimeout(function() {
                            RemoveToolbarEditEvents();
                            TreeTabs.Theme.ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
                            TreeTabs.Theme.ApplyColorsSet(SelectedTheme["ColorsSet"]);
                            document.getElementById("_gtetab_list").style.color = "";
                            document.getElementById("_gtetab_list2").style.color = "";
                            if (SelectedTheme["TabsMargins"]) {
                                document.getElementById("tabs_margin_spacing")[SelectedTheme["TabsMargins"]].checked = true;
                                TreeTabs.Theme.ApplyTabsMargins(SelectedTheme["TabsMargins"]);
                            } else {
                                document.getElementById("tabs_margin_spacing")["2"].checked = true;
                            }
                            if (reloadInSidebar) {
                                chrome.runtime.sendMessage({command: "reload_theme", ThemeId: ThemeId, theme: SelectedTheme});
                            }
                            document.querySelectorAll(".theme_buttons").forEach(function(s) {
                                s.disabled = false;
                            });
                        }, 200);
                    }, 200);
                });
            });
        },
        SaveTheme: function(ThemeId) {
            chrome.storage.local.get(null, function(storage) {
                SelectedTheme.theme_version = DefaultTheme.theme_version;
                let LSthemes = storage.themes ? Object.assign({}, storage.themes) : {};
                LSthemes[ThemeId] = Object.assign({}, SelectedTheme);
                chrome.storage.local.set({themes: LSthemes});
                chrome.runtime.sendMessage({command: "reload_theme", ThemeId: ThemeId, theme: SelectedTheme});
                return SelectedTheme;
            });
        },
        AddNewTheme: function() {
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
            ThemeNameBox.value = NewName;
            SelectedTheme["theme_name"] = NewName;
            themes.push(ThemeId);
            let ThemeNameOption = document.createElement("option");
            ThemeNameOption.value = ThemeId;
            ThemeNameOption.text = NewName;
            ThemeList.add(ThemeNameOption);
            ThemeList.selectedIndex = ThemeList.options.length - 1;
            TreeTabs.Theme.SaveTheme(ThemeId);
            setTimeout(function() {TreeTabs.Theme.LoadTheme(ThemeId, true);}, 50);
            chrome.storage.local.set({current_theme: ThemeId});
            RefreshFields();
        },
        DeleteSelectedTheme: function() {
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
                    setTimeout(function() {chrome.runtime.sendMessage({command: "reload_theme", themeName: "", theme: SelectedTheme});}, 500);
                }
                TreeTabs.Theme.LoadTheme(current_theme, true);
                RefreshFields();
            });
        },
        RenameSelectedTheme: function() {
            let ThemeList = document.getElementById("theme_list");
            let ThemeNameBox = document.getElementById("new_theme_name");
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
        },
        CheckTheme: function(theme) {
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
        },
        ImportTheme: function() {
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
                    let correctedTheme = TreeTabs.Theme.CheckTheme(themeObj);
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
                    TreeTabs.Theme.SaveTheme(ThemeId);
                    var theme_name = document.createElement("option");
                    theme_name.value = ThemeId;
                    theme_name.text = SelectedTheme["theme_name"];
                    ThemeList.add(theme_name);
                    ThemeList.selectedIndex = ThemeList.options.length - 1;
                    current_theme = ThemeId;
                    document.createElement("new_theme_name").value = ThemeId;
                    setTimeout(function() {TreeTabs.Theme.LoadTheme(ThemeId, true);}, 500);
                    RefreshFields();
                    DefaultTheme["ColorsSet"] = {};
                    chrome.storage.local.set({current_theme: ThemeId});
                }
            }
        }
    },
    Preferences: {
        SavePreferences: function(options) {
            chrome.storage.local.set({
                preferences: options
            });
            chrome.runtime.sendMessage({
                command: "reload_options",
                opt: options
            });
        },
        LoadDefaultPreferences: function() {
            opt = Object.assign({}, DefaultPreferences);
        }
    },
    File: {
        ShowOpenFileDialog: function(extension) {
            let body = document.getElementById("body");
            let inp = document.createElement("input");
            inp.id = "file_import";
            inp.type = "file";
            inp.accept = extension;
            inp.style.display = "none";
            body.appendChild(inp);
            inp.click();
            return inp;
        },
        SaveFile: function(filename, extension, data) {
            let file = new File([JSON.stringify(data)], filename + "." + extension, {type: "text/" + extension + ";charset=utf-8"});
            let body = document.getElementById("body");
            let savelink = document.createElement("a");
            savelink.href = URL.createObjectURL(file);
            savelink.fileSize = file.size;
            savelink.target = "_blank";
            savelink.style.display = "none";
            savelink.type = "file";
            savelink.download = filename + "." + extension;
            body.appendChild(savelink);
            setTimeout(function() {
                savelink.click();
                setTimeout(function() {
                    savelink.parentNode.removeChild(savelink);
                }, 60000);
            }, 10);
        }
    },
    Browser: {
        StartSidebarListeners: function() {
            if (browserId == "F") {
                browser.browserAction.onClicked.addListener(function(tab) {
                    if (tab.windowId == tt.CurrentWindowId) {
                        browser.sidebarAction.close();
                    }
                });
            }
            chrome.commands.onCommand.addListener(function(command) {
                if (command == "close_tree") {
                    chrome.windows.getCurrent({populate: false}, function(window) {
                        if (window.id == tt.CurrentWindowId && window.focused) {
                            chrome.tabs.query({windowId: tt.CurrentWindowId, active: true}, function(tabs) {
                                let tabsArr = [];
                                document.querySelectorAll("[id='" + tabs[0].id + "'] .tab, [id='" + tabs[0].id + "']").forEach(function(s) {
                                    tabsArr.push(parseInt(s.id));
                                    if (s.childNodes[2].childNodes.length > 0) {
                                        document.querySelectorAll("#" + s.childNodes[2].id + " .tab").forEach(function(t) {tabsArr.push(parseInt(t.id));});
                                    }
                                });
                                TreeTabs.Tabs.CloseTabs(tabsArr);
                            });
                        }
                    });
                }
            });
            chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
                if (message.command == "backup_available") {
                    if (opt.debug) {
                        log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
                    }
                    let BAKbutton = document.getElementById("button_load_bak" + message.bak);
                    if (BAKbutton != null) {
                        BAKbutton.classList.remove("disabled");
                    }
                    return;
                }
                if (message.command == "drag_start") {
                    if (opt.debug) {
                        log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
                    }
                    TreeTabs.DOM.CleanUpDragAndDrop();
                    tt.DragTreeDepth = message.DragTreeDepth;
                    tt.DraggingGroup = message.DraggingGroup;
                    tt.DraggingPin = message.DraggingPin;
                    tt.DraggingTab = message.DraggingTab;
                    tt.DraggingFolder = message.DraggingFolder;
                    return;
                }
                if (message.command == "drag_end") {
                    if (opt.debug) {
                        log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
                    }
                    tt.Dragging = false;
                    TreeTabs.DOM.CleanUpDragAndDrop();
                    TreeTabs.DOM.RemoveHighlight();
                    return;
                }
                if (message.command == "remove_folder") {
                    if (opt.debug) {
                        log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command + " folderId: " + message.folderId);
                    }
                    TreeTabs.Folders.RemoveFolder(message.folderId);
                    return;
                }
                if (message.command == "remove_group") {
                    if (opt.debug) {
                        log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command + " groupId: " + message.groupId);
                    }
                    setTimeout(function() {TreeTabs.Groups.GroupRemove(message.groupId, false);}, 2000);
                    return;
                }
                if (message.command == "reload_sidebar") {
                    if (opt.debug) {
                        log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
                    }
                    window.location.reload();
                    return;
                }
                if (message.command == "reload_options") {
                    if (opt.debug) {
                        log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
                    }
                    opt = Object.assign({}, message.opt);
                    setTimeout(function() {TreeTabs.Theme.RestorePinListRowSettings();}, 100);
                    return;
                }
                if (message.command == "reload_toolbar") {
                    if (opt.debug) {
                        log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
                    }
                    opt = Object.assign({}, message.opt);

                    if (opt.show_toolbar) {
                        TreeTabs.Toolbar.RemoveToolbar();
                        TreeTabs.Toolbar.RecreateToolbar(message.toolbar);
                        TreeTabs.Toolbar.SetToolbarEvents(false, true, true, "mousedown", true);
                        TreeTabs.Toolbar.RestoreToolbarShelf();
                        TreeTabs.Toolbar.RestoreToolbarSearchFilter();
                    } else {
                        TreeTabs.Toolbar.RemoveToolbar();
                    }
                    TreeTabs.DOM.RefreshGUI();
                    return;
                }
                if (message.command == "reload_theme") {
                    if (opt.debug) {
                        log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
                    }
                    TreeTabs.Theme.RestorePinListRowSettings();
                    TreeTabs.Theme.ApplyTheme(message.theme);
                    return;
                }
                if (message.windowId == tt.CurrentWindowId) {
                    // if (message.command == "append_group") {
                    //     if (tt.groups[message.groupId] == undefined) {
                    //         tt.groups[message.groupId] = {id: message.groupId, index: Object.keys(tt.groups).length, active_tab: 0, prev_active_tab: 0, name: message.group_name, font: message.font_color};
                    //         TreeTabs.Groups.AppendGroupToList(message.groupId, message.group_name, message.font_color, true);
                    //     }
                    //     return;
                    // }

                    // if (message.command == "append_tab_to_group") {
                    //     let Group = document.getElementById("ct" + message.groupId);
                    //     let Tab = document.getElementById(message.tabId);
                    //     if (Group && Tab) {
                    //         Group.appendChild(Tab);
                    //         TreeTabs.Groups.SetActiveGroup(message.groupId, false, true);
                    //     }
                    //     return;
                    // }

                    if (message.command == "tab_created") {
                        if (message.InsertAfterId && document.querySelectorAll("#" + tt.active_group + " .tab").length == 0) {
                            message.InsertAfterId = undefined;
                            message.ParentId = tt.active_group;
                        }
                        tt.tabs[message.tabId] = new TreeTabs.Tabs.ttTab({tab: message.tab, ParentId: message.ParentId, InsertAfterId: message.InsertAfterId, Append: message.Append, Scroll: true});
                        TreeTabs.DOM.RefreshExpandStates();
                        setTimeout(function() {
                            TreeTabs.DOM.RefreshCounters();
                            TreeTabs.DOM.RefreshGUI();
                        }, 50);

                        if (opt.syncro_tabbar_tabs_order) {
                            let tabIds = Array.prototype.map.call(document.querySelectorAll(".pin, .tab"), function(s) {return parseInt(s.id);});
                            chrome.tabs.move(message.tab.id, {index: tabIds.indexOf(message.tab.id)});
                        }
                        setTimeout(function() {tt.schedule_update_data++;}, 2000);
                        return;
                    }
                    if (message.command == "tab_attached") {
                        if (opt.debug) {
                            log("chrome event: " + message.command + ", tabId: " + message.tabId + ", tab is pinned: " + message.tab.pinned + ", ParentId: " + message.ParentId);
                        }
                        tt.tabs[message.tabId] = new TreeTabs.Tabs.ttTab({tab: message.tab, ParentId: message.ParentId, Append: true, SkipSetActive: false, SkipMediaIcon: false});
                        TreeTabs.DOM.RefreshGUI();
                        return;
                    }
                    if (message.command == "tab_detached") {
                        if (opt.debug) {
                            log("chrome event: " + message.command + ", tabId: " + message.tabId);
                        }
                        let Tab = document.getElementById(message.tabId);
                        if (Tab != null && tt.tabs[message.tabId]) {
                            let ctDetachedParent = Tab.childNodes[1];
                            if (opt.promote_children_in_first_child == true && Tab.childNodes[1].childNodes.length > 1) {
                                TreeTabs.DOM.PromoteChildrenToFirstChild(Tab);
                            } else {
                                while (ctDetachedParent.firstChild) {
                                    ctDetachedParent.parentNode.parentNode.insertBefore(ctDetachedParent.firstChild, ctDetachedParent.parentNode);
                                }
                            }
                        }
                        tt.tabs[message.tabId].RemoveTab();
                        setTimeout(function() {tt.schedule_update_data++;}, 300);
                        TreeTabs.DOM.RefreshGUI();
                        return;
                    }
                    if (message.command == "tab_removed") {
                        if (opt.debug) {
                            log("chrome event: " + message.command + ", tabId: " + message.tabId);
                        }
                        let mTab = document.getElementById(message.tabId);
                        if (mTab != null && tt.tabs[message.tabId]) {
                            let ctParent = mTab.childNodes[1];
                            if (opt.debug) {
                                log("tab_removed, promote children: " + opt.promote_children);
                            }
                            if (opt.promote_children == true) {
                                if (opt.promote_children_in_first_child == true && mTab.childNodes[1].childNodes.length > 1) {
                                    TreeTabs.DOM.PromoteChildrenToFirstChild(mTab);
                                } else {
                                    while (ctParent.firstChild) {
                                        ctParent.parentNode.parentNode.insertBefore(ctParent.firstChild, ctParent.parentNode);
                                    }
                                }
                            } else {
                                document.querySelectorAll("[id='" + message.tabId + "'] .tab").forEach(function(s) {
                                    chrome.tabs.remove(parseInt(s.id));
                                });
                                document.querySelectorAll("[id='" + message.tabId + "'] .folder").forEach(function(s) {
                                    TreeTabs.Folders.RemoveFolder(s.id);
                                });
                            }
                            tt.tabs[message.tabId].RemoveTab();
                            TreeTabs.DOM.RefreshExpandStates();
                            setTimeout(function() {tt.schedule_update_data++;}, 300);
                            TreeTabs.DOM.RefreshGUI();
                            TreeTabs.DOM.RefreshCounters();
                        }
                        return;
                    }
                    if (message.command == "tab_activated") {
                        if (opt.debug) {
                            log("chrome event: " + message.command + ", tabId: " + message.tabId);
                        }
                        TreeTabs.Tabs.SetActiveTab(message.tabId, true);
                        return;
                    }
                    if (message.command == "tab_attention") {
                        if (opt.debug) {
                            log("chrome event: " + message.command + ", tabId: " + message.tabId);
                        }
                        if (tt.tabs[message.tabId]) {
                            tt.tabs[message.tabId].SetAttentionIcon();
                        }
                        return;
                    }
                    if (message.command == "tab_updated") {
                        if (opt.debug) {
                            log("chrome event: " + message.command + ", tabId: " + message.tabId);
                        }
                        if (tt.tabs[message.tabId]) {
                            if (message.changeInfo.favIconUrl != undefined || message.changeInfo.url != undefined) {
                                if (browserId == "F" && message.changeInfo.favIconUrl == "") {
                                    browser.sessions.setTabValue(message.tabId, "CachedFaviconUrl", "");
                                }
                                setTimeout(function() {
                                    if (tt.tabs[message.tabId]) {
                                        tt.tabs[message.tabId].GetFaviconAndTitle(true);
                                    }
                                }, 100);
                            }
                            if (message.changeInfo.title != undefined) {
                                setTimeout(function() {
                                    if (tt.tabs[message.tabId]) {
                                        tt.tabs[message.tabId].GetFaviconAndTitle(true);
                                    }
                                }, 1000);
                            }
                            if (message.changeInfo.audible != undefined || message.changeInfo.mutedInfo != undefined) {
                                tt.tabs[message.tabId].RefreshMediaIcon();
                            }
                            if (message.changeInfo.discarded != undefined) {
                                tt.tabs[message.tabId].RefreshDiscarded();
                            }
                            if (message.changeInfo.pinned != undefined) {
                                let updateTab = document.getElementById(message.tabId);
                                if (updateTab != null) {
                                    if (message.tab.pinned && updateTab.classList.contains("pin") == false) {
                                        tt.tabs[message.tabId].SetTabClass(true);
                                        tt.tabs[message.tabId].pinned = true;
                                        tt.schedule_update_data++;
                                    }
                                    if (!message.tab.pinned && updateTab.classList.contains("tab") == false) {
                                        tt.tabs[message.tabId].SetTabClass(false);
                                        tt.tabs[message.tabId].pinned = false;
                                        tt.schedule_update_data++;
                                    }
                                }
                                TreeTabs.DOM.RefreshExpandStates();
                            }
                        }
                        return;
                    }
                    // if (message.command == "set_active_group") {
                    // TreeTabs.Groups.SetActiveGroup(message.groupId, false, false);
                    // return;
                    // }
                    if (message.command == "remote_update") {
                        if (opt.debug) {
                            log("chrome event: " + message.command + ", tabId: " + message.tabId);
                            log(message);
                        }
                        TreeTabs.Manager.RecreateTreeStructure(message.groups, message.folders, message.tabs);
                        sendResponse(true);
                        tt.schedule_update_data++;
                        return;
                    }
                    if (message.command == "switch_active_tab") {
                        TreeTabs.Tabs.SwitchActiveTabBeforeClose(tt.active_group);
                        return;
                    }
                }
            });
        }
    },
    Debug: {
        log: function(log) {
            if (opt.debug) {
                chrome.runtime.sendMessage({command: "debug", log: log});
            }
        }
    }
};










