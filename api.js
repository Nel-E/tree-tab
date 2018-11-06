// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/


// FOLD UP TO LEVEL 3 FOR EASIER USE
const D = document;
const TT = {
    Tabs: {
        ttTab: class {
            constructor(p) {
                this.id = p.tab.id;
                this.pinned = p.tab.pinned;
                if (D.getElementById(p.tab.id) != null && tt.tabs[p.tab.id]) {
                    tt.tabs[p.tab.id].GetFaviconAndTitle(p.addCounter);
                    return;
                }
                let ClassList = p.tab.pinned ? "pin" : "tab";
                if (p.tab.discarded) ClassList += " discarded";
                if (p.tab.attention) ClassList += " attention";
                if (p.AdditionalClass) ClassList += " " + p.AdditionalClass;
                if (p.ExpandState) ClassList += " " + p.ExpandState;
                let DIV_Tab = TT.DOM.New("div", undefined, {id: p.tab.id, className: ClassList});
                let DIV_header = TT.DOM.New("div", DIV_Tab, {id: ("tab_header_" + p.tab.id), className: (opt.always_show_close && !opt.never_show_close) ? "tab_header close_show" : "tab_header", draggable: (!p.SkipSetEvents ? true : false)});
                let DIV_expand = TT.DOM.New("div", DIV_header, {id: ("exp_" + p.tab.id), className: "expand"});
                let DIV_counter = TT.DOM.New("div", DIV_header, {id: ("tab_counter_" + p.tab.id), className: "tab_counter"});
                TT.DOM.New("div", DIV_counter, {id: ("counter_number_" + p.tab.id), className: "counter_number"});
                let DIV_title = TT.DOM.New("div", DIV_header, {id: ("tab_title_" + p.tab.id), className: "tab_title"});
                let DIV_close_button = TT.DOM.New("div", DIV_header, {id: ("close_" + p.tab.id), className: (opt.never_show_close ? "close hidden" : "close")});
                TT.DOM.New("div", DIV_close_button, {id: ("close_img_" + p.tab.id), className: (opt.never_show_close ? "close_img hidden" : "close_img")});
                let DIV_audio_indicator = TT.DOM.New("div", DIV_header, {id: ("tab_mediaicon_" + p.tab.id), className: "tab_mediaicon"});
                let DIV_children = TT.DOM.New("div", DIV_Tab, {id: ("°" + p.tab.id), className: "children"});
                TT.DOM.New("div", DIV_Tab, {id: ("drag_indicator_" + p.tab.id), className: "drag_indicator"});
                if (!p.SkipSetEvents) {
                    DIV_children.onclick = function(event) {
                        if (event.target == this && event.which == 1) TT.DOM.Deselect();
                    }
                    DIV_children.onmousedown = function(event) {
                        if (event.target == this) {
                            if (event.which == 2 && event.target == this) {
                                event.stopImmediatePropagation();
                                TT.Groups.ActionClickGroup(this.parentNode, opt.midclick_group);
                            }
                            if (event.which == 3) TT.Menu.ShowFGlobalMenu(event);
                        }
                    }
                    DIV_children.ondblclick = function(event) {
                        if (event.target == this) TT.Groups.ActionClickGroup(this.parentNode, opt.dbclick_group);
                    }
                    DIV_expand.onmousedown = function(event) {
                        if (tt.DOMmenu.style.top != "-1000px") TT.Menu.HideMenus();
                        if (event.which == 1 && !event.shiftKey && !event.ctrlKey) TT.DOM.EventExpandBox(this.parentNode.parentNode);
                    }
                    DIV_expand.onmouseenter = function(event) {
                        this.classList.add("hover");
                    }
                    DIV_expand.onmouseleave = function(event) {
                        this.classList.remove("hover");
                    }
                    if (!opt.never_show_close) {
                        DIV_close_button.onmousedown = function(event) {
                            event.stopImmediatePropagation();
                            if (event.which != 3) TT.Tabs.CloseTabs([parseInt(this.parentNode.parentNode.id)]);
                        }
                        DIV_close_button.onmouseenter = function(event) {
                            this.classList.add("close_hover");
                        }
                        DIV_close_button.onmouseleave = function(event) {
                            this.classList.remove("close_hover");
                        }
                    }
                    DIV_header.onclick = function(event) {
                        event.stopImmediatePropagation();
                        if (tt.DOMmenu.style.top != "-1000px") {
                            TT.Menu.HideMenus();
                        } else {
                            if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target.classList.contains("tab_header")) {
                                TT.DOM.Deselect();
                                chrome.tabs.update(parseInt(this.parentNode.id), {active: true});
                            }
                        }
                    }
                    DIV_header.ondblclick = function(event) {
                        if (event.target.classList && event.target.classList.contains("tab_header")) TT.Tabs.ActionClickTab(this.parentNode, opt.dbclick_tab);
                    }
                    DIV_header.onmousedown = function(event) {
                        if (browserId == "V") {
                            chrome.windows.getCurrent({populate: false}, function(window) {
                                if (tt.CurrentWindowId != window.id && window.focused) location.reload();
                            });
                        }
                        event.stopImmediatePropagation();
                        if (event.which == 1) TT.DOM.Select(event, this.parentNode);
                        if (event.which == 2) {
                            event.preventDefault();
                            TT.Tabs.ActionClickTab(this.parentNode, opt.midclick_tab);
                        }
                        if (event.which == 3) TT.Menu.ShowTabMenu(this.parentNode, event);
                    }
                    DIV_header.onmouseover = function(event) {
                        this.classList.add("tab_header_hover");
                        if (opt.never_show_close == false && opt.always_show_close == false) this.classList.add("close_show");
                    }
                    DIV_header.onmouseleave = function(event) {
                        this.classList.remove("tab_header_hover");
                        if (opt.never_show_close == false && opt.always_show_close == false) this.classList.remove("close_show");
                    }
                    DIV_header.ondragstart = function(event) { // DRAG START
                        event.stopPropagation();
                        event.dataTransfer.setDragImage(D.getElementById("DragImage"), 0, 0);
                        event.dataTransfer.setData("text", "");
                        event.dataTransfer.setData("SourceWindowId", tt.CurrentWindowId);
                        TT.DOM.CleanUpDragAndDrop();
                        tt.Dragging = true;
                        tt.DraggingGroup = false;
                        let Nodes = [];
                        if (this.parentNode.classList.contains("selected")) {
                            TT.DOM.FreezeSelection(false);
                        } else {
                            TT.DOM.FreezeSelection(true);
                            TT.DOM.SetClasses(this.parentNode, ["selected_temporarly", "selected"], [], []);
                        }
                        TT.DOM.RemoveHeadersHoverClass();
                        D.querySelectorAll(".selected, .selected .tab, .selected .folder").forEach(function(s) {
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
                            D.querySelectorAll(".dragged_tree .tab, .dragged_tree .folder").forEach(function(s) {
                                let parents = TT.DOM.GetParentsByClass(s.parentNode, "dragged_tree");
                                if (parents.length > tt.DragTreeDepth) tt.DragTreeDepth = parents.length;
                            });
                        } else {
                            tt.DragTreeDepth = -1;
                        }
                        let Parents = TT.DOM.GetAllParents(this.parentNode);
                        Parents.forEach(function(s) {
                            if (s.classList && (s.classList.contains("tab") || s.classList.contains("folder"))) s.classList.add("dragged_parents");
                        });
                        event.dataTransfer.setData("Nodes", JSON.stringify(Nodes));
                        event.dataTransfer.setData("NodesTypes", JSON.stringify({DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder}));
                        chrome.runtime.sendMessage({command: "drag_start", DragTreeDepth: tt.DragTreeDepth, DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder});
                    }
                    DIV_header.ondragenter = function(event) {
                        this.classList.remove("tab_header_hover");
                    }
                    DIV_header.ondragleave = function(event) {
                        TT.DOM.RemoveHighlight();
                    }
                    DIV_header.ondragover = function(event) {
                        if (tt.DraggingGroup == false && (tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder) && this.parentNode.classList.contains("dragged_tree") == false) {
                            if (this.parentNode.classList.contains("pin")) {
                                if (this.parentNode.classList.contains("before") == false && event.layerX < this.clientWidth / 2) {
                                    TT.DOM.RemoveHighlight();
                                    TT.DOM.SetClasses(this.parentNode, ["before", "highlighted_drop_target"], ["after"], []);
                                }
                                if (this.parentNode.classList.contains("after") == false && event.layerX >= this.clientWidth / 2) {
                                    TT.DOM.RemoveHighlight();
                                    TT.DOM.SetClasses(this.parentNode, ["after", "highlighted_drop_target"], ["before"], []);
                                }
                            }
                            if (this.parentNode.classList.contains("tab")) {
                                let TabDepth = TT.Tabs.GetTabDepthInTree(this);
                                let PDepth = TabDepth + tt.DragTreeDepth;
                                let PIsGroup = this.parentNode.parentNode.parentNode.classList.contains("group");
                                // let PIsTab = this.parentNode.parentNode.parentNode.classList.contains("tab");
                                let PIsFolder = this.parentNode.parentNode.parentNode.classList.contains("folder");
                                let PIsDraggedParents = this.parentNode.classList.contains("dragged_parents");
                                if ((PIsFolder == tt.DraggingFolder || tt.DraggingFolder == false || PIsGroup == true) && this.parentNode.classList.contains("before") == false && event.layerY < this.clientHeight / 3 && (PDepth <= opt.max_tree_depth + 1 || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false || PIsDraggedParents == true)) {
                                    TT.DOM.RemoveHighlight();
                                    TT.DOM.SetClasses(this.parentNode, ["before", "highlighted_drop_target"], ["inside", "after"], []);
                                }
                                if (tt.DraggingFolder == false && this.parentNode.classList.contains("inside") == false && event.layerY > this.clientHeight / 3 && event.layerY <= 2 * (this.clientHeight / 3) && (PDepth <= opt.max_tree_depth || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false || PIsDraggedParents == true)) {
                                    TT.DOM.RemoveHighlight();
                                    TT.DOM.SetClasses(this.parentNode, ["inside", "highlighted_drop_target"], ["before", "after"], []);
                                }
                                if ((PIsFolder == tt.DraggingFolder || tt.DraggingFolder == false || PIsGroup == true) && this.parentNode.classList.contains("after") == false && this.parentNode.classList.contains("o") == false && event.layerY > 2 * (this.clientHeight / 3) && (PDepth <= opt.max_tree_depth + 1 || opt.max_tree_depth < 0 || opt.max_tree_drag_drop == false || PIsDraggedParents == true)) {
                                    TT.DOM.RemoveHighlight();
                                    TT.DOM.SetClasses(this.parentNode, ["after", "highlighted_drop_target"], ["before", "inside"], []);
                                }
                            }
                        }
                        if (opt.open_tree_on_hover && tt.DragOverId != this.id) {
                            if (this.parentNode.classList.contains("c") && this.parentNode.classList.contains("dragged_tree") == false) {
                                clearTimeout(tt.DragOverTimer);
                                tt.DragOverId = this.id;
                                let This = this;
                                tt.DragOverTimer = setTimeout(function() {
                                    if (tt.DragOverId == This.id) TT.DOM.SetClasses(This.parentNode, ["o"], ["c"], []);
                                }, 1500);
                            }
                        }
                    }
                    DIV_header.ondragend = function(event) {
                        if (opt.open_tree_on_hover) {
                            clearTimeout(tt.DragOverTimer);
                            tt.DragOverId = "";
                        }
                        setTimeout(function() {TT.DOM.CleanUpDragAndDrop();}, 300);
                        setTimeout(function() {chrome.runtime.sendMessage({command: "drag_end"});}, 500);
                    }
                    DIV_audio_indicator.onmousedown = function(event) {
                        event.stopImmediatePropagation();
                        if (event.which == 1 && (this.parentNode.parentNode.classList.contains("audible") || this.parentNode.parentNode.classList.contains("muted"))) {
                            chrome.tabs.get(parseInt(this.parentNode.parentNode.id), function(tab) {
                                if (tab) chrome.tabs.update(tab.id, {muted: !tab.mutedInfo.muted});
                            });
                        }
                    }
                }
                let parent;
                if (p.tab.pinned == true) {
                    parent = D.getElementById("pin_list");
                } else {
                    if (p.ParentId == false || p.ParentId == undefined || p.ParentId == "pin_list") {
                        parent = D.getElementById("°" + tt.active_group);
                    } else {
                        parent = D.getElementById(p.ParentId);
                        if (parent == null || parent.classList.contains("pin") || parent.parentNode.classList.contains("pin")) {
                            parent = D.getElementById("°" + tt.active_group);
                        } else {
                            parent = D.getElementById("°" + p.ParentId);
                            if (parent.children.length == 0) TT.DOM.SetClasses(parent.parentNode, ["o"], ["c"], []);
                        }
                    }
                }
                if (p.Append == true && parent) parent.appendChild(DIV_Tab);
                if ((p.Append == false || p.Append == undefined) && parent) {parent.prepend(DIV_Tab);}
                if (p.InsertAfterId) {
                    let After = D.getElementById(p.InsertAfterId);
                    if (After != null) {
                        if ((p.tab.pinned && After.classList.contains("pin")) || (p.tab.pinned == false && (After.classList.contains("tab") || After.classList.contains("folder")))) {
                            TT.DOM.InsterAfterNode(DIV_Tab, After);
                        } else {
                            parent.appendChild(DIV_Tab);
                        }
                    } else {
                        parent.appendChild(DIV_Tab);
                    }
                }
                this.Node = DIV_Tab;
                this.title = DIV_title;
                if (!p.SkipFavicon) this.GetFaviconAndTitle(p.addCounter);
                if (!p.SkipMediaIcon) this.RefreshMediaIcon(p.tab.id);
                if (p.RefreshDiscarded) this.RefreshDiscarded();
                if (p.tab.active && !p.SkipSetActive) TT.Tabs.SetActiveTab(p.tab.id);
                if (p.Scroll) this.ScrollToTab();
            }
            RemoveTab() {
                if (opt.debug) TT.Debug.log("f: RemoveTab, tabId: " + this.id);
                if (this.Node != null) {
                    this.Node.parentNode.removeChild(this.Node);
                    if (tt.tabs[this.id]) delete tt.tabs[this.id];
                }
            }
            ScrollToTab() {
                let Tab = this.Node;
                let P = D.getElementById("pin_list");
                let G = D.getElementById(tt.active_group);
                if (Tab != null) {
                    if (Tab.classList.contains("pin")) {
                        if (Tab.getBoundingClientRect().left - P.getBoundingClientRect().left < 0) {
                            P.scrollLeft = P.scrollLeft + Tab.getBoundingClientRect().left - P.getBoundingClientRect().left - 2;
                        } else {
                            if (Tab.getBoundingClientRect().left - P.getBoundingClientRect().left > G.getBoundingClientRect().width - D.querySelector(".tab_header").getBoundingClientRect().width) {
                                P.scrollLeft = P.scrollLeft + Tab.getBoundingClientRect().left - P.getBoundingClientRect().left - P.getBoundingClientRect().width + D.querySelector(".tab_header").getBoundingClientRect().width + 2;
                            }
                        }
                    } else if (Tab.classList.contains("tab") && D.querySelector("#" + tt.active_group + " [id='" + this.id + "']") != null) {
                        let Parents = TT.DOM.GetParentsByClass(Tab, "c");
                        if (Parents.length > 0) {
                            Parents.forEach(function(s) {
                                TT.DOM.SetClasses(s, ["o"], ["c"], []);
                            });
                        }
                        if (Tab.getBoundingClientRect().top - G.getBoundingClientRect().top < 0) {
                            G.scrollTop = G.scrollTop + Tab.getBoundingClientRect().top - G.getBoundingClientRect().top - 2;
                        } else {
                            if (Tab.getBoundingClientRect().top - G.getBoundingClientRect().top > G.getBoundingClientRect().height - D.querySelector(".tab_header").getBoundingClientRect().height) {
                                G.scrollTop = G.scrollTop + Tab.getBoundingClientRect().top - G.getBoundingClientRect().top - G.getBoundingClientRect().height + D.querySelector(".tab_header").getBoundingClientRect().height + 10;
                            }
                        }
                    }
                }
            }
            SetTabClass(pin) {
                let GroupList = D.getElementById("°" + tt.active_group);
                let Tab = this.Node;
                if (Tab != null) {
                    if (pin) {
                        if (Tab.parentNode.id != "pin_list") D.getElementById("pin_list").appendChild(Tab);
                        TT.DOM.SetClasses(Tab, ["pin"], ["tab", "o", "c"], []);
                        if (Tab.childNodes[1].childNodes.length > 0) { // flatten out children
                            let tabs = D.querySelectorAll("#°" + Tab.id + " .pin, #°" + Tab.id + " .tab");
                            for (let i = tabs.length - 1; i >= 0; i--) {
                                TT.DOM.SetClasses(tabs[i], ["pin"], ["tab", "o", "c"], []);
                                TT.DOM.InsterAfterNode(tabs[i], Tab);
                                chrome.tabs.update(parseInt(tabs[i].id), {pinned: true});
                            }
                            let folders = D.querySelectorAll("#°" + Tab.id + " .folder");
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
                        TT.DOM.SetClasses(Tab, ["tab"], ["pin", "attention"], []);
                        TT.DOM.RefreshExpandStates();
                        chrome.tabs.update(parseInt(Tab.id), {pinned: false});
                    }
                    TT.DOM.RefreshGUI();
                }
            }
            DuplicateTab() {
                let OriginalTabNode = this.Node;
                chrome.tabs.duplicate(parseInt(this.id), function(tab) {
                    let DupRetry = setInterval(function() {
                        let DupTab = D.getElementById(tab.id);
                        if (DupTab != null && OriginalTabNode != null) {
                            if (browserId == "F" && tab.pinned) TT.DOM.SetClasses(DupTab, ["pin"], ["tab"], []);
                            TT.DOM.InsterAfterNode(DupTab, OriginalTabNode);
                            TT.DOM.RefreshExpandStates();
                            tt.schedule_update_data++;
                            TT.DOM.RefreshCounters();
                            clearInterval(DupRetry);
                        }
                    }, 10);
                    setTimeout(function() {
                        if (DupRetry) clearInterval(DupRetry);
                    }, 500);
                });
            }
            GetFaviconAndTitle(addCounter) {
                let t = D.getElementById(this.id);
                let tTitle = this.title;
                if (t != null) {
                    chrome.tabs.get(parseInt(t.id), async function(tab) {
                        if (tab) {
                            let title = tab.title ? tab.title : tab.url;
                            let tHeader = t.childNodes[0];
                            if (tab.status == "complete" || tab.discarded) {
                                t.classList.remove("loading");
                                tTitle.textContent = title;
                                tHeader.title = title;
                                if (opt.show_counter_tabs_hints) tHeader.setAttribute("tabTitle", title);
                                let Img = new Image();
                                let CachedFavicon = browserId == "F" ? await browser.sessions.getTabValue(tab.id, "CachedFaviconUrl") : "chrome://favicon/" + tab.url;
                                let TryCases = [tab.favIconUrl, CachedFavicon, "./theme/icon_empty.svg"];
                                TT.Tabs.LoadFavicon(tab.id, Img, TryCases, tHeader, 0);
                            }
                            if (tab.status == "loading" && tab.discarded == false) {
                                title = tab.title ? tab.title : labels.loading;
                                t.classList.add("loading");
                                tHeader.style.backgroundImage = "";
                                tHeader.title = labels.loading;
                                if (opt.show_counter_tabs_hints) tHeader.setAttribute("tabTitle", labels.loading);
                                tTitle.textContent = labels.loading;
                                setTimeout(function() {
                                    if (D.getElementById(tab.id) != null && tt.tabs[tab.id]) tt.tabs[tab.id].GetFaviconAndTitle(addCounter);
                                }, 1000);
                            }
                            if (addCounter && (opt.show_counter_tabs || opt.show_counter_tabs_hints)) tt.tabs[t.id].RefreshTabCounter();
                        }
                    });
                }
            }
            RefreshDiscarded() { // set discarded class
                let t = D.getElementById(this.id);
                if (t != null) {
                    chrome.tabs.get(parseInt(t.id), function(tab) {
                        if (tab) {
                            if (tab.discarded) {
                                TT.DOM.SetClasses(t, ["discarded"], ["audible", "muted"], []);
                            } else {
                                t.classList.remove("discarded");
                            }
                        }
                    });
                }
            }
            SetAttentionIcon() { // set attention class
                let t = D.getElementById(this.id);
                if (t != null) t.classList.add("attention");
            }
            RefreshMediaIcon() { // change media icon
                let t = D.getElementById(this.id);
                if (t != null) {
                    chrome.tabs.get(parseInt(t.id), function(tab) {
                        if (tab) {
                            if (tab.mutedInfo.muted && !tab.discarded) TT.DOM.SetClasses(t, ["muted"], ["audible"], []);
                            if (!tab.mutedInfo.muted && tab.audible && !tab.discarded) TT.DOM.SetClasses(t, ["audible"], ["muted"], []);
                            if ((!tab.mutedInfo.muted && !tab.audible) || tab.discarded) TT.DOM.SetClasses(t, [], ["audible", "muted"], []);
                        }
                    });
                }
            }
            RefreshTabCounter() {
                let t = D.getElementById(this.id);
                if (t != null && t.childNodes[0]) {
                    let title = t.childNodes[0].getAttribute("tabTitle");
                    if (t != null && title != null) {
                        if (t.classList.contains("o") || t.classList.contains("c")) {
                            if (opt.show_counter_tabs) t.childNodes[0].childNodes[1].childNodes[0].textContent = D.querySelectorAll("[id='" + t.id + "'] .tab").length;
                            if (opt.show_counter_tabs_hints) t.childNodes[0].title = (D.querySelectorAll("[id='" + t.id + "'] .tab").length + " • ") + title;
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
                    if (browserId == "F") browser.sessions.setTabValue(tabId, "CachedFaviconUrl", TryUrls[i]); // cache Firefox favicon - solution for bug with empty favicons in unloaded tabs
                };
                Img.onerror = function() {
                    if (i < TryUrls.length) TT.Tabs.LoadFavicon(tabId, Img, TryUrls, TabHeaderNode, (i + 1));
                }
            }
        },
        SaveTabs: async function() {
            setInterval(function() {
                if (tt.schedule_update_data > 1) tt.schedule_update_data = 1;
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
                    if (opt.debug) TT.Debug.log("f: RearrangeBrowserTabs");
                    chrome.tabs.query({currentWindow: true}, function(tabs) {
                        let ttTabIds = Array.prototype.map.call(D.querySelectorAll(".pin, .tab"), function(s) {return parseInt(s.id);});
                        let tabIds = Array.prototype.map.call(tabs, function(t) {return t.id;});
                        TT.Tabs.RearrangeBrowserTabsLoop(ttTabIds, tabIds, ttTabIds.length - 1);
                    });
                }
            }, 1000);
        },
        RearrangeBrowserTabsLoop: async function(ttTabIds, tabIds, tabIndex) {
            if (opt.debug) TT.Debug.log("f: RearrangeBrowserTabsLoop");
            if (tabIndex >= 0 && tt.schedule_rearrange_tabs == 0) {
                if (ttTabIds[tabIndex] != tabIds[tabIndex]) chrome.tabs.move(ttTabIds[tabIndex], {index: tabIndex});
                setTimeout(function() {
                    TT.Tabs.RearrangeBrowserTabsLoop(ttTabIds, tabIds, (tabIndex - 1));
                }, 0);
            }
        },
        RearrangeTree: function(TTtabs, TTfolders, show_finish_in_status) {
            TT.Manager.ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_rearranging_tabs")});
            D.querySelectorAll(".pin, .tab, .folder").forEach(function(Node) {
                let Sibling = Node.nextElementSibling;
                if (Sibling) {
                    let NodeIndex = TTtabs[Node.id] ? TTtabs[Node.id].index : (TTfolders[Node.id] ? TTfolders[Node.id].index : undefined);
                    while (Sibling && NodeIndex) {
                        let SiblingIndex = TTtabs[Sibling.id] ? TTtabs[Sibling.id].index : (TTfolders[Sibling.id] ? TTfolders[Sibling.id].index : 0);
                        if (NodeIndex > SiblingIndex) TT.DOM.InsterAfterNode(Node, Sibling);
                        Sibling = Sibling.nextElementSibling ? Sibling.nextElementSibling : false;
                    }
                }
                if (show_finish_in_status) TT.Manager.ShowStatusBar({show: true, spinner: false, message: chrome.i18n.getMessage("status_bar_rearranging_finished"), hideTimeout: 1000});
            });
        },
        Detach: function(Nodes, NodesTypes, Group) {
            if (opt.debug) TT.Debug.log("f: Detach");
            let folderNodes = {};
            let TabsIds = [];
            for (let i = 0; i < Nodes.length; i++) {
                if (Nodes[i].NodeClass == "folder") folderNodes[Nodes[i].id] = {id: Nodes[i].id, parent: (Nodes[i].parent).substr(1), name: Nodes[i].name, index: Nodes[i].index, expand: Nodes[i].expand};
                if (Nodes[i].NodeClass == "pin") TabsIds.push(parseInt(Nodes[i].id));
                if (Nodes[i].NodeClass == "tab") TabsIds.push(parseInt(Nodes[i].id));
            }
            chrome.windows.get(tt.CurrentWindowId, {populate : true}, function(window) {
                if (window.tabs.length == 1) return;
                if (TabsIds.length == window.tabs.length) {
                    if (opt.debug) TT.Debug.log("You are trying to detach all tabs! Skipping!");
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
                            setTimeout(function() {TT.Groups.GroupRemove(Group.id, false);}, 2000);
                        }
                        chrome.runtime.sendMessage({command: "save_folders", folders: folderNodes, windowId: new_window.id});
                        for (let i = 0; i < Nodes.length; i++) {
                            if (Nodes[i].NodeClass == "pin") {
                                chrome.tabs.update(parseInt(Nodes[i].id), {pinned: true});
                                chrome.runtime.sendMessage({command: "update_tab", tabId: Nodes[i].id, tab: {parent: "pin_list"}});
                            }
                            if (Nodes[i].NodeClass == "tab") chrome.runtime.sendMessage({command: "update_tab", tabId: Nodes[i].id, tab: {parent: (Nodes[i].parent).substr(1)}});
                            if (Nodes[i].NodeClass == "folder") TT.Folders.RemoveFolder(Nodes[i].id);
                        }
                        if (TabsIds.length > 1) {
                            TabsIds.splice(0, 1);
                            chrome.tabs.move(TabsIds, {windowId: new_window.id, index:-1}, function(MovedTabs) {
                                for (let i = 0; i < Nodes.length; i++) {
                                    if (Nodes[i].NodeClass == "pin") {chrome.tabs.update(parseInt(Nodes[i].id), {pinned: true});}
                                    if (Nodes[i].NodeClass == "folder") {TT.Folders.RemoveFolder(Nodes[i].id);}
                                }
                                let Stop = 500;
                                let DetachNodes = setInterval(function() {
                                    Stop--;
                                    let all_moved = true;
                                    for (let i = 0; i < Nodes.length; i++) {
                                        if (D.getElementById(Nodes[i].id) != null) all_moved = false;
                                        if (Nodes[i].NodeClass == "pin") chrome.runtime.sendMessage({command: "update_tab", tabId: Nodes[i].id, tab: {parent: "pin_list"}});
                                        if (Nodes[i].NodeClass == "tab") chrome.runtime.sendMessage({command: "update_tab", tabId: Nodes[i].id, tab: {parent: (Nodes[i].parent).substr(1)}});
                                    }
                                    if (all_moved || Stop < 0) {
                                        setTimeout(function() {
                                            clearInterval(DetachNodes);
                                        }, 300);}
                                }, 100);
                            });
                        }
                    });
                });
            });
        },
        DiscardTabs: function(tabsIds) {
            let delay = 100;
            let tabNode = D.getElementById(tabsIds[0]);
            if (tabNode == null || tabNode.classList.contains("discarded") || tabNode.classList.contains("active_tab")) {
                delay = 5;
            } else {
                chrome.tabs.discard(tabsIds[0]);
            }
            tabsIds.splice(0, 1);
            if (tabsIds.length > 0) {
                setTimeout(function() {
                    TT.Tabs.DiscardTabs(tabsIds);
                }, delay);
            }
        },
        FindTab: function(input) { // find and select tabs
            let ButtonFilterClear = D.getElementById("button_filter_clear");
            D.querySelectorAll(".filtered, .highlighted_search").forEach(function(s) {
                TT.DOM.SetClasses(s, [], ["selected", "selected_last", "filtered", "highlighted_search"], []);
            })
            if (input.length == 0) {
                D.getElementById("filter_box").value = "";
                ButtonFilterClear.style.opacity = "0"; ButtonFilterClear.title = "";
                return;
            } else {
                ButtonFilterClear.style.opacity = "1"; ButtonFilterClear.title = labels.clear_filter;
            }
            tt.SearchIndex = 0;
            let FilterType = D.getElementById("button_filter_type");
            let searchUrl = FilterType.classList.contains("url");
            let searchTitle = FilterType.classList.contains("title");
            let query = {windowId: tt.CurrentWindowId, pinned: false};
            if (input == "*audible") query = {windowId: tt.CurrentWindowId, discarded: false, audible: true, muted: false, pinned: false};
            if (input == "*muted") query = {windowId: tt.CurrentWindowId, discarded: false, muted: true, pinned: false};
            if (input == "*unloaded") query = {windowId: tt.CurrentWindowId, discarded: true, pinned: false};
            if (input == "*loaded") query = {windowId: tt.CurrentWindowId, discarded: false, pinned: false};
            chrome.tabs.query(query, function(tabs) {
                tabs.forEach(function(Tab) {
                    let t = D.getElementById(Tab.id);
                    if (input == "*audible" || input == "*muted" || input == "*unloaded" || input == "*loaded") {
                        TT.DOM.SetClasses(t, ["filtered", "selected"], [], []);
                    } else {
                        if (searchUrl) {
                            if (Tab.url.toLowerCase().match(input.toLowerCase())) TT.DOM.SetClasses(t, ["filtered", "selected"], [], []);
                        }
                        if (searchTitle) {
                            if (Tab.title.toLowerCase().match(input.toLowerCase())) TT.DOM.SetClasses(t, ["filtered", "selected"], [], []);
                        }
                    }
                });
            });
        },
        CloseTabs: function(tabsIds) {
            if (opt.debug) TT.Debug.log("f: TT.Tabs.CloseTabs, tabsIds are: " + JSON.stringify(tabsIds));
            tabsIds.forEach(function(tabId) {
                let t = D.getElementById(tabId);
                if (t != null) t.classList.add("will_be_closed");
            });
            let activeTab = D.querySelector(".pin.active_tab, #" + tt.active_group + " .tab.active_tab");
            if (activeTab != null && tabsIds.indexOf(parseInt(activeTab.id)) != -1) TT.Tabs.SwitchActiveTabBeforeClose(tt.active_group);
            setTimeout(function() {
                tabsIds.forEach(function(tabId) {
                    let t = D.getElementById(tabId);
                    if (t != null && t.classList.contains("pin") && opt.allow_pin_close) {
                        t.parentNode.removeChild(t);
                        chrome.tabs.update(tabId, {pinned: false});
                        chrome.runtime.sendMessage({command: "update_tab", tabId: tabId, tab: {parent: "pin_list"}});
                    }
                    if (tabId == tabsIds[tabsIds.length - 1]) {
                        setTimeout(function() {chrome.tabs.remove(tabsIds, null);}, 10);
                        TT.DOM.RefreshGUI();
                    }
                });
            }, 200);
        },
        OpenNewTab: function(pin, parentId) {
            if (pin) {
                chrome.tabs.create({pinned: true}, function(tab) {
                    if (parentId) {
                        if (parentId) {
                            let parent = D.getElementById("#pin_list");
                            if (parent != null && tt.tabs[tab.id]) parent.appendChild(tt.tabs[tab.id].Node);
                            tt.schedule_update_data++;
                        }
                        tt.schedule_update_data++;
                    }
                });
            } else {
                chrome.tabs.create({}, function(tab) {
                    if (parentId) {
                        let parent = D.getElementById("#°"+parentId);
                        if (parent != null && tt.tabs[tab.id]) parent.appendChild(tt.tabs[tab.id].Node);
                        tt.schedule_update_data++;
                    }
                    if (opt.move_tabs_on_url_change == "from_empty") chrome.runtime.sendMessage({command: "remove_tab_from_empty_tabs", tabId: tab.id});
                });
            }
        },
        GetTabDepthInTree: function(Node) {
            let Depth = 0;
            let ParentNode = Node;
            if (ParentNode == null) return Parents;
            let Stop = false;
            while (!Stop && ParentNode.parentNode != null) {
                if (ParentNode.parentNode.classList != undefined) {
                    if (ParentNode.parentNode.classList.contains("tab")) Depth++;
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
            if (bgOption == "new_tab") TT.Tabs.OpenNewTab(TabNode.classList.contains("pin"), TabNode.id);
            if (bgOption == "expand_collapse") TT.DOM.EventExpandBox(TabNode);
            if (bgOption == "close_tab") {
                if ((TabNode.classList.contains("pin") && opt.allow_pin_close) || TabNode.classList.contains("tab")) TT.Tabs.CloseTabs([parseInt(TabNode.id)]);
            }
            if (bgOption == "undo_close_tab") {
                chrome.sessions.getRecentlyClosed(null, function(sessions) {
                    if (sessions.length > 0) chrome.sessions.restore(null, function(restored) {});
                });
            }
            if (bgOption == "reload_tab") {chrome.tabs.reload(parseInt(TabNode.id));}
            if (bgOption == "unload_tab") {
                if (TabNode.classList.contains("active_tab")) {
                    TT.Tabs.SwitchActiveTabBeforeClose(tt.active_group);
                    setTimeout(function() {TT.Tabs.DiscardTabs([parseInt(TabNode.id)]);}, 500);
                } else {
                    TT.Tabs.DiscardTabs([parseInt(TabNode.id)]);
                }
            }
            if (bgOption == "activate_previous_active" && TabNode.classList.contains("active_tab")) {
                let PrevActiveTabId = parseInt(tt.groups[tt.active_group].prev_active_tab);
                if (isNaN(PrevActiveTabId) == false) chrome.tabs.update(PrevActiveTabId, {active: true});
            }
        },
        SetActiveTab: function(tabId, switchToGroup) {
            if (opt.debug) TT.Debug.log("f: SetActiveTab, tabId: " + tabId);
            let Tab = D.getElementById(tabId);
            if (Tab != null) {
                let TabGroup = TT.DOM.GetParentsByClass(Tab, "group");
                if (TabGroup.length) {
                    if (Tab.classList.contains("tab")) TT.Groups.SetActiveTabInGroup(TabGroup[0].id, tabId);
                    if (switchToGroup) TT.Groups.SetActiveGroup(TabGroup[0].id, false, false); // not going to scroll, because mostly it's going to change to a new active in group AFTER switch, so we are not going to scroll to previous active tab
                }
                D.querySelectorAll(".selected").forEach(function(s) {
                    s.classList.remove("selected");
                });
                D.querySelectorAll(".pin, #" + tt.active_group + " .tab").forEach(function(s) {
                    TT.DOM.SetClasses(s, [], ["active_tab", "selected", "selected_last", "selected_frozen", "selected_temporarly", "tab_header_hover"], []);
                });
                TT.DOM.RemoveHighlight();
                TT.DOM.SetClasses(Tab, ["active_tab"], ["attention"], []);
                if (tt.tabs[tabId]) tt.tabs[tabId].ScrollToTab();
            }
        },
        SwitchActiveTabBeforeClose: function(ActiveGroupId) {
            if (opt.debug) TT.Debug.log("f: SwitchActiveTabBeforeClose");
            let activeGroup = D.getElementById(ActiveGroupId);
            if (D.querySelectorAll("#" + ActiveGroupId + " .tab:not(.will_be_closed)").length <= 1 && D.querySelector(".pin.active_tab") == null) { // CHECK IF CLOSING LAST TAB IN ACTIVE GROUP
                let pins = D.querySelectorAll(".pin");
                if (pins.length > 0) { // IF THERE ARE ANY PINNED TABS, ACTIVATE IT
                    if (opt.debug) TT.Debug.log("available pin, switching to: " + pins[pins.length - 1].id);
                    chrome.tabs.update(parseInt(pins[pins.length - 1].id), {active: true});
                    return;
                } else { // NO OTHER CHOICE BUT TO SEEK IN ANOTHER GROUP
                    if (opt.after_closing_active_tab == "above" || opt.after_closing_active_tab == "above_seek_in_parent") {
                        if (activeGroup.previousSibling != null) {
                            if (D.querySelectorAll("#" + activeGroup.previousSibling.id + " .tab").length > 0) {
                                TT.Groups.SetActiveGroup(activeGroup.previousSibling.id, true, true);
                            } else {
                                TT.Tabs.SwitchActiveTabBeforeClose(activeGroup.previousSibling.id);
                                return;
                            }
                        } else {
                            TT.Groups.SetActiveGroup("tab_list", true, true);
                        }
                    } else {
                        if (activeGroup.nextSibling != null) {
                            if (D.querySelectorAll("#" + activeGroup.nextSibling.id + " .tab").length > 0) {
                                TT.Groups.SetActiveGroup(activeGroup.nextSibling.id, true, true);
                            } else {
                                TT.Tabs.SwitchActiveTabBeforeClose(activeGroup.nextSibling.id);
                                return;
                            }
                        } else {
                            TT.Groups.SetActiveGroup("tab_list", true, true);
                        }
                    }
                }
            } else {
                if (opt.debug) TT.Debug.log("available tabs in current group, switching option is: " + opt.after_closing_active_tab);
                if (opt.after_closing_active_tab == "above") TT.Tabs.ActivatePrevTab(true);
                if (opt.after_closing_active_tab == "below") TT.Tabs.ActivateNextTab(true);
                if (opt.after_closing_active_tab == "above_seek_in_parent") TT.Tabs.ActivatePrevTabSameLevel();
                if (opt.after_closing_active_tab == "below_seek_in_parent") TT.Tabs.ActivateNextTabSameLevel();
            }
        },
        ActivateNextTabSameLevel: function() {
            let activeTab = D.querySelector("#" + tt.active_group + " .tab.active_tab") != null ? D.querySelector("#" + tt.active_group + " .tab.active_tab") : D.querySelector(".pin.active_tab");
            if (activeTab == null) return;
            let NewActiveId;
            let Node = activeTab;
            if (activeTab.classList.contains("tab")) {
                if (opt.promote_children && activeTab.childNodes[1].firstChild != null && activeTab.childNodes[1].firstChild.classList.contains("tab") && activeTab.childNodes[1].firstChild.classList.contains("will_be_closed") == false) NewActiveId = activeTab.childNodes[1].firstChild.id;
            }
            if (NewActiveId == undefined) {
                while (NewActiveId == undefined && Node.nextSibling != null && Node.classList != undefined) {
                    if ((Node.nextSibling.classList.contains("pin") || Node.nextSibling.classList.contains("tab")) && Node.nextSibling.classList.contains("will_be_closed") == false) NewActiveId = Node.nextSibling.id;
                    Node = Node.nextSibling;
                }
            }
            if (NewActiveId == undefined) {
                while (NewActiveId == undefined && Node.previousSibling != null && Node.classList != undefined) {
                    if ((Node.previousSibling.classList.contains("pin") || Node.previousSibling.classList.contains("tab")) && Node.previousSibling.classList.contains("will_be_closed") == false) NewActiveId = Node.previousSibling.id;
                    Node = Node.previousSibling;
                }
            }
            if (NewActiveId == undefined) {TT.Tabs.ActivatePrevTab();}
            if (NewActiveId != undefined) {
                let tabId = parseInt(NewActiveId);
                if (isNaN(tabId) == false) chrome.tabs.update(tabId, {active: true});
            }
        },
        ActivatePrevTabSameLevel: function() {
            let activeTab = D.querySelector("#" + tt.active_group + " .tab.active_tab") != null ? D.querySelector("#" + tt.active_group + " .tab.active_tab") : D.querySelector(".pin.active_tab");
            if (activeTab == null) return;
            let NewActiveId;
            let Node = activeTab;
            if (activeTab.classList.contains("tab")) {
                if (opt.promote_children && activeTab.childNodes[1].firstChild != null && activeTab.childNodes[1].firstChild.classList.contains("tab") && activeTab.childNodes[1].firstChild.classList.contains("will_be_closed") == false) NewActiveId = activeTab.childNodes[1].firstChild.id;
            }
            if (NewActiveId == undefined) {
                while (NewActiveId == undefined && Node.previousSibling != null && Node.classList != undefined) {
                    if ((Node.previousSibling.classList.contains("pin") || Node.previousSibling.classList.contains("tab")) && Node.previousSibling.classList.contains("will_be_closed") == false) NewActiveId = Node.previousSibling.id;
                    Node = Node.previousSibling;
                }
            }
            if (NewActiveId == undefined) {
                while (NewActiveId == undefined && Node.nextSibling != null && Node.classList != undefined) {
                    if ((Node.nextSibling.classList.contains("pin") || Node.nextSibling.classList.contains("tab")) && Node.nextSibling.classList.contains("will_be_closed") == false) NewActiveId = Node.nextSibling.id;
                    Node = Node.nextSibling;
                }
            }
            if (NewActiveId == undefined) TT.Tabs.ActivateNextTab();
            if (NewActiveId != undefined) {
                let tabId = parseInt(NewActiveId);
                if (isNaN(tabId) == false) chrome.tabs.update(tabId, {active: true});
            }
        },
        ActivateNextTab: function(allow_loop) {
            let activeTab = D.querySelector("#" + tt.active_group + " .tab.active_tab") != null ? D.querySelector("#" + tt.active_group + " .tab.active_tab") : D.querySelector(".pin.active_tab");
            if (activeTab == null) return;
            let NewActiveId;
            let Node = activeTab;
            let parents = TT.DOM.GetAllParents(activeTab);
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
                let RestartLoopFromPin = D.querySelector(".pin");
                let RestartLoopFromTab = D.querySelector("#°" + tt.active_group + " .tab");
                if (activeTab.classList.contains("pin")) {
                    if (RestartLoopFromTab != null) {
                        NewActiveId = RestartLoopFromTab.id;
                    } else {
                        if (RestartLoopFromPin != null) NewActiveId = RestartLoopFromPin.id;
                    }
                }
                if (activeTab.classList.contains("tab")) {
                    if (RestartLoopFromPin != null) {
                        NewActiveId = RestartLoopFromPin.id;
                    } else {
                        if (RestartLoopFromTab != null) NewActiveId = RestartLoopFromTab.id;
                    }
                }
            }
            if (NewActiveId != undefined) {
                let tabId = parseInt(NewActiveId);
                if (isNaN(tabId) == false) chrome.tabs.update(tabId, {active: true});
            }
        },
        ActivatePrevTab: function(allow_loop) {
            let activeTab = D.querySelector("#" + tt.active_group + " .tab.active_tab") != null ? D.querySelector("#" + tt.active_group + " .tab.active_tab") : D.querySelector(".pin.active_tab");
            if (activeTab == null) return;
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
                let RestartLoopFromPin = D.querySelector(".pin:last-child");
                let RestartLoopFromTab = D.querySelectorAll("#°" + tt.active_group + " .tab");
                if (activeTab.classList.contains("pin")) {
                    if (RestartLoopFromTab.length > 0) {
                        NewActiveId = RestartLoopFromTab[RestartLoopFromTab.length - 1].id;
                    } else {
                        if (RestartLoopFromPin != null) NewActiveId = RestartLoopFromPin.id;
                    }
                }
                if (activeTab.classList.contains("tab")) {
                    if (RestartLoopFromPin != null) {
                        NewActiveId = RestartLoopFromPin.id;
                    } else {
                        if (RestartLoopFromTab != null) NewActiveId = RestartLoopFromTab[RestartLoopFromTab.length - 1].id;
                    }
                }
            }
            if (NewActiveId != undefined) {
                let tabId = parseInt(NewActiveId);
                if (isNaN(tabId) == false) chrome.tabs.update(tabId, {active: true});
            }
        }
    },
    Folders: {
        AddNewFolder: function(p) { // folderId: string, ParentId: string, Name: string, Index: int, ExpandState: ("o","c"), AdditionalClass: string, SetEvents: bool
            let newId = p.folderId ? p.folderId : TT.Folders.GenerateNewFolderID();
            tt.folders[newId] = {id: newId, parent: (p.ParentId ? p.ParentId : ""), index: (p.Index ? p.Index : 0), name: (p.Name ? p.Name : labels.noname_group), expand: (p.ExpandState ? p.ExpandState : "")};
            TT.Folders.AppendFolder({folderId: newId, Name: tt.folders[newId].name, InsertAfterId: p.InsertAfterId, ParentId: p.ParentId, ExpandState: p.ExpandState, SkipSetEvents: p.SkipSetEvents, AdditionalClass: p.AdditionalClass});
            TT.Folders.SaveFolders();
            TT.DOM.RefreshCounters();
            TT.DOM.RefreshExpandStates();
            return newId;
        },
        AppendFolder: function(p) { // folderId: string, ParentId: string, Name: string, ExpandState: ("o","c"), AdditionalClass: string, SetEvents: bool
            let ClassList = "folder";
            if (p.ExpandState) ClassList += " " + p.ExpandState;
            if (p.AdditionalClass != undefined) ClassList += " " + p.AdditionalClass;
            if (D.getElementById(p.folderId) == null) {
                let DIV_folder = TT.DOM.New("div", undefined, {id: p.folderId, className: ClassList});
                let DIV_header = TT.DOM.New("div", DIV_folder, {id: ("folder_header_" + p.folderId), className: ((opt.always_show_close && !opt.never_show_close) ? "folder_header close_show" : "folder_header"), draggable: (!p.SkipSetEvents ? true : false)});
                let DIV_expand = TT.DOM.New("div", DIV_header, {id: ("folder_expand_" + p.folderId), className: "folder_icon"});
                let DIV_counter = TT.DOM.New("div", DIV_header, {id: ("folder_counter_" + p.folderId), className: "folder_counter"});
                TT.DOM.New("div", DIV_counter, {id: ("folder_counter_number_" + p.folderId), className: "counter_number"});
                TT.DOM.New("div", DIV_header, {id: ("folder_title_" + p.folderId), className: "folder_title", textContent: p.Name});
                let DIV_children = TT.DOM.New("div", DIV_folder, {id: ("°" + p.folderId), className: "children"});
                TT.DOM.New("div", DIV_folder, {id: (p.folderId + "_drag_indicator"), className: "drag_indicator"});
                let DIV_close_button = TT.DOM.New("div", DIV_header, {id: ("close" + p.folderId), className : (opt.never_show_close ? "close hidden" : "close")});
                TT.DOM.New("div", DIV_close_button, {id: ("close_img" + p.folderId), className: (opt.never_show_close ? "close_img hidden" : "close_img")});
                if (!p.SkipSetEvents) {
                    DIV_children.ondblclick = function(event) {
                        if (event.target == this) TT.Groups.ActionClickGroup(this.parentNode, opt.dbclick_group);
                    }
                    DIV_children.onclick = function(event) {
                        if (event.target == this && event.which == 1) TT.DOM.Deselect();
                    }
                    DIV_children.onmousedown = function(event) {
                        event.stopImmediatePropagation();
                        if (event.target == this) {
                            if (event.which == 2 && event.target == this) TT.Groups.ActionClickGroup(this.parentNode, opt.midclick_group);
                            if (event.which == 3) TT.Menu.ShowFGlobalMenu(event);
                        }
                    }
                    if (!opt.never_show_close) {
                        DIV_close_button.onmousedown = function(event) {
                            event.stopImmediatePropagation();
                            if (event.which != 3) TT.Folders.RemoveFolder(this.parentNode.parentNode.id);
                        }
                        DIV_close_button.onmouseenter = function(event) {
                            this.classList.add("close_hover");
                        }
                        DIV_close_button.onmouseleave = function(event) {
                            this.classList.remove("close_hover");
                        }
                    }
                    DIV_header.onclick = function(event) {
                        if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target.classList.contains("folder_header")) TT.DOM.Deselect();
                    }
                    DIV_header.onmousedown = function(event) {
                        event.stopImmediatePropagation();
                        if (tt.DOMmenu.style.top != "-1000px") TT.Menu.HideMenus();
                        if (event.which == 1) TT.DOM.Select(event, this.parentNode);
                        if (event.which == 2) {
                            event.preventDefault();
                            TT.Folders.ActionClickFolder(this.parentNode, opt.midclick_folder);
                        }
                        if (event.which == 3) TT.Menu.ShowFolderMenu(this.parentNode, event); // SHOW FOLDER MENU
                    }
                    DIV_header.ondblclick = function(event) { // edit folder
                        if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target.classList.contains("folder_header")) TT.Folders.ActionClickFolder(this.parentNode, opt.dbclick_folder);
                    }
                    DIV_header.ondragstart = function(event) { // DRAG START
                        event.stopPropagation();
                        event.dataTransfer.setDragImage(D.getElementById("DragImage"), 0, 0);
                        event.dataTransfer.setData("text", "");
                        event.dataTransfer.setData("SourceWindowId", tt.CurrentWindowId);
                        TT.DOM.CleanUpDragAndDrop();
                        tt.Dragging = true;
                        tt.DraggingGroup = false;
                        tt.DragTreeDepth = -1;
                        let Nodes = [];
                        if (this.parentNode.classList.contains("selected")) {
                            TT.DOM.FreezeSelection(false);
                        } else {
                            TT.DOM.FreezeSelection(true);
                            TT.DOM.SetClasses(this.parentNode, ["selected_temporarly", "selected"], [], []);
                        }
                        TT.DOM.RemoveHeadersHoverClass();
                        D.querySelectorAll(".selected, .selected .tab, .selected .folder").forEach(function(s) {
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
                        let DraggedFolderParents = TT.DOM.GetParentsByClass(this.parentNode, "folder");
                        DraggedFolderParents.forEach(function(s) {
                            s.classList.add("dragged_parents");
                        });
                        event.dataTransfer.setData("Nodes", JSON.stringify(Nodes));
                        event.dataTransfer.setData("NodesTypes", JSON.stringify({DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder}));
                        chrome.runtime.sendMessage({command: "drag_start", DragTreeDepth: tt.DragTreeDepth, DraggingGroup: tt.DraggingGroup, DraggingPin: tt.DraggingPin, DraggingTab: tt.DraggingTab, DraggingFolder: tt.DraggingFolder});
                    }
                    DIV_header.ondragenter = function(event) {
                        this.classList.remove("folder_header_hover");
                    }
                    DIV_header.ondragend = function(event) {
                        if (opt.open_tree_on_hover) {
                            clearTimeout(tt.DragOverTimer);
                            tt.DragOverId = "";
                        }
                        setTimeout(function() {TT.DOM.CleanUpDragAndDrop();}, 300);
                        setTimeout(function() {chrome.runtime.sendMessage({command: "drag_end"});}, 500);
                    }
                    DIV_header.onmouseover = function(event) {
                        this.classList.add("folder_header_hover");
                        if (opt.never_show_close == false && opt.always_show_close == false) this.classList.add("close_show");
                    }
                    DIV_header.onmouseleave = function(event) {
                        this.classList.remove("folder_header_hover");
                        if (opt.never_show_close == false && opt.always_show_close == false) this.classList.remove("close_show");
                    }
                    DIV_header.ondragleave = function(event) {
                        TT.DOM.RemoveHighlight();
                    }
                    DIV_header.ondragover = function(event) {
                        if (tt.DraggingGroup == false && (tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder) && this.parentNode.classList.contains("dragged_tree") == false) {
                            if (this.parentNode.classList.contains("before") == false && event.layerY < this.clientHeight / 3) {
                                TT.DOM.RemoveHighlight();
                                TT.DOM.SetClasses(this.parentNode, ["before", "highlighted_drop_target"], ["inside", "after"], []);
                            }
                            if (this.parentNode.classList.contains("inside") == false && event.layerY > this.clientHeight / 3 && event.layerY <= 2 * (this.clientHeight / 3)) {
                                TT.DOM.RemoveHighlight();
                                TT.DOM.SetClasses(this.parentNode, ["inside", "highlighted_drop_target"], ["before", "after"], []);
                            }
                            if (this.parentNode.classList.contains("after") == false && this.parentNode.classList.contains("o") == false && event.layerY > 2 * (this.clientHeight / 3)) {
                                TT.DOM.RemoveHighlight();
                                TT.DOM.SetClasses(this.parentNode, ["after", "highlighted_drop_target"], ["inside", "before"], []);
                            }
                        }
                        if (opt.open_tree_on_hover && tt.DragOverId != this.id) {
                            if (this.parentNode.classList.contains("c") && this.parentNode.classList.contains("dragged_tree") == false) {
                                clearTimeout(tt.DragOverTimer);
                                tt.DragOverId = this.id;
                                let This = this;
                                tt.DragOverTimer = setTimeout(function() {
                                    if (tt.DragOverId == This.id) TT.DOM.SetClasses(This.parentNode, ["o"], ["c"], []);
                                }, 1500);
                            }
                        }
                    }
                    DIV_expand.onmousedown = function(event) {
                        event.stopPropagation();
                        if (tt.DOMmenu.style.top != "-1000px") TT.Menu.HideMenus();
                        if (event.which == 1 && !event.shiftKey && !event.ctrlKey && event.target == this) { // EXPAND/COLLAPSE FOLDER
                            event.stopPropagation();
                            TT.DOM.EventExpandBox(this.parentNode.parentNode);
                            TT.DOM.RefreshExpandStates();
                            TT.DOM.RefreshCounters();
                        }
                    }
                }
                if (p.ParentId == "pin_list" || p.ParentId == "" || p.ParentId == undefined || D.getElementById("°" + p.ParentId) == null) {
                    D.getElementById("°" + tt.active_group).appendChild(DIV_folder);
                } else {
                    D.getElementById("°" + p.ParentId).appendChild(DIV_folder);
                }
                if (p.InsertAfterId) {
                    let After = D.getElementById(p.InsertAfterId);
                    if (After != null) TT.DOM.InsterAfterNode(DIV_folder, After);
                }
            }
        },
        GenerateNewFolderID: function() {
            let newID = "";
            while (newID == "") {
                newID = "f_" + GenerateRandomID();
                if (D.getElementById(newID) != null) newID = "";
            }
            return newID;
        },
        PreAppendFolders: function(Folders) {
            for (let folderId in Folders) {TT.Folders.AppendFolder({folderId: folderId, Name: Folders[folderId].name, ParentId: "tab_list", ExpandState: Folders[folderId].expand});}
        },
        AppendFolders: function(Folders) {
            for (let folderId in Folders) {
                let f = D.getElementById(folderId);
                let parent = D.getElementById("°" + Folders[folderId].parent);
                if (f != null && parent != null && Folders[folderId].parent != f.parentNode.parentNode.id && parent.parentNode.classList.contains("pin") == false) parent.appendChild(f);
            }
        },
        SaveFolders: function() {
            D.querySelectorAll(".folder").forEach(function(s) {
                tt.folders[s.id].parent = s.parentNode.parentNode.id;
                tt.folders[s.id].index = Array.from(s.parentNode.children).indexOf(s);
                tt.folders[s.id].expand = (s.classList.contains("c") ? "c" : (s.classList.contains("o") ? "o" : ""));
            });
            chrome.runtime.sendMessage({command: "save_folders", folders: tt.folders, windowId: tt.CurrentWindowId});
        },
        RemoveFolder: function(FolderId) {
            if (opt.debug) TT.Debug.log("f: RemoveFolder, folderId " + FolderId);
            let folder = D.getElementById(FolderId);
            if (folder != null) {
                if (opt.promote_children == true) {
                    if (opt.promote_children_in_first_child == true && folder.childNodes[1].childNodes.length > 1) {
                        TT.DOM.PromoteChildrenToFirstChild(folder);
                    } else {
                        let Children = folder.childNodes[1];
                        while (Children.lastChild) {
                            TT.DOM.InsterAfterNode(Children.lastChild, folder);
                        }
                    }
                } else {
                    D.querySelectorAll("#" + FolderId + " .tab").forEach(function(s) {
                        chrome.tabs.remove(parseInt(s.id), null);
                    });
                    D.querySelectorAll("#" + FolderId + " .folder").forEach(function(s) {
                        delete tt.folders[s.id];
                    });
                }
                folder.parentNode.removeChild(folder);
                delete tt.folders[FolderId];
                TT.DOM.RefreshExpandStates();
                chrome.runtime.sendMessage({command: "save_folders", folders: tt.folders, windowId: tt.CurrentWindowId});
            }
        },
        ShowRenameFolderDialog: function(FolderId) { // Rename folder popup
            if (opt.debug) TT.Debug.log("f: ShowRenameFolderDialog, folderId " + FolderId);
            TT.DOM.HideRenameDialogs();
            if (tt.folders[FolderId]) {
                let name = D.getElementById("folder_edit_name");
                name.value = tt.folders[FolderId].name;
                let folderEditDialog = D.getElementById("folder_edit");
                folderEditDialog.setAttribute("FolderId", FolderId);
                TT.DOM.SetStyle(folderEditDialog, {display: "block", left: "", top: D.getElementById("toolbar").getBoundingClientRect().height + D.getElementById("pin_list").getBoundingClientRect().height + 8 + "px"});
                setTimeout(function() {D.getElementById("folder_edit_name").select();}, 5);
            }
        },
        FolderRenameConfirm: function() { // when pressed OK in folder popup
            let name = D.getElementById("folder_edit_name");
            let FolderId = D.getElementById("folder_edit").getAttribute("FolderId");
            tt.folders[FolderId].name = name.value;
            D.getElementById(FolderId + "_folder_title").textContent = name.value;
            TT.DOM.HideRenameDialogs();
            if (opt.debug) TT.Debug.log("f: FolderRenameConfirm, folderId " + FolderId + ", name: " + name.value);
            chrome.runtime.sendMessage({command: "save_folders", folders: tt.folders, windowId: tt.CurrentWindowId});
            TT.DOM.RefreshCounters();
        },
        ActionClickFolder: function(FolderNode, bgOption) {
            if (opt.debug) TT.Debug.log("f: ActionClickFolder, folderId " + FolderNode.id + ", bgOption: " + bgOption);
            if (bgOption == "rename_folder") TT.Folders.ShowRenameFolderDialog(FolderNode.id);
            if (bgOption == "new_folder") {
                let FolderId = TT.Folders.AddNewFolder({ParentId: FolderNode.id});
                TT.Folders.ShowRenameFolderDialog(FolderId);
            }
            if (bgOption == "new_tab") TT.Tabs.OpenNewTab(false, FolderNode.id);
            if (bgOption == "expand_collapse") TT.DOM.EventExpandBox(FolderNode);
            if (bgOption == "close_folder") TT.Folders.RemoveFolder(FolderNode.id);
            if (bgOption == "unload_folder") {
                let tabsArr = [];
                D.querySelectorAll("#" + FolderNode.id + " .tab").forEach(function(s) {
                    tabsArr.push(parseInt(s.id));
                });
                TT.Tabs.DiscardTabs(tabsArr);
            }
        }
    },
    Groups: {
        AddNewGroup: function(Name, FontColor) {
            let newId = TT.Groups.GenerateNewGroupID();
            tt.groups[newId] = {id: newId, index: 0, active_tab: 0, prev_active_tab: 0, name: (Name ? Name : labels.noname_group), font: (FontColor ? FontColor : "")};
            if (opt.debug) TT.Debug.log("f: AddNewGroup, groupId: " + newId + ", Name: " + Name + ", FontColor: " + FontColor);
            TT.Groups.AppendGroupToList(newId, tt.groups[newId].name, tt.groups[newId].font, true);
            TT.Groups.UpdateBgGroupsOrder();
            return newId;
        },
        SaveGroups: function() {
            chrome.runtime.sendMessage({command: "save_groups", groups: tt.groups, windowId: tt.CurrentWindowId});
        },
        AppendGroups: function(Groups) {
            TT.Groups.AppendGroupToList("tab_list", labels.ungrouped_group, "", true);
            for (var group in Groups) {
                TT.Groups.AppendGroupToList(Groups[group].id, Groups[group].name, Groups[group].font, true);
                if (D.querySelectorAll(".group").length == Object.keys(Groups).length) {
                    TT.Groups.RearrangeGroupsButtons();
                    setTimeout(function() {TT.Groups.RearrangeGroupsLists();}, 50);
                }
            }
        },
        RearrangeGroupsButtons: function(first_loop) {
            D.querySelectorAll(".group_button").forEach(function(s) {
                let groupId = (s.id).substr(1);
                if (tt.groups[groupId]) {
                    if (s.parentNode.childNodes[tt.groups[groupId].index] != undefined) {
                        let Ind = Array.from(s.parentNode.children).indexOf(s);
                        if (Ind > tt.groups[groupId].index) {
                            TT.DOM.InsterBeforeNode(s, s.parentNode.childNodes[tt.groups[groupId].index]);
                        } else {
                            TT.DOM.InsterAfterNode(s, s.parentNode.childNodes[tt.groups[groupId].index]);
                        }
                        let newInd = Array.from(s.parentNode.children).indexOf(s);
                        if (newInd != tt.groups[groupId].index && first_loop) TT.Groups.RearrangeGroupsButtons(false);
                    }
                }
            });
        },
        RearrangeGroupsLists: function() {
            if (opt.debug) TT.Debug.log("f: RearrangeGroupsLists");
            let activegroup = D.getElementById(tt.active_group);
            let scroll = activegroup.scrollTop;
            let groups = D.getElementById("groups");
            D.querySelectorAll(".group_button").forEach(function(s) {
                let group = D.getElementById((s.id).substr(1));
                if (group != null) groups.appendChild(group);
            });
            activegroup.scrollTop = scroll;
        },
        UpdateBgGroupsOrder: function() {
            D.querySelectorAll(".group_button").forEach(function(s) {
                if (tt.groups[(s.id).substr(1)]) tt.groups[(s.id).substr(1)].index = Array.from(s.parentNode.children).indexOf(s);
            });
            TT.Groups.SaveGroups();
        },
        AppendGroupToList: function(groupId, group_name, font_color, SetEvents) {
            if (D.getElementById(groupId) == null) {
                let grp = TT.DOM.New("div", D.getElementById("groups"), {id: groupId, className: "group"}, {display: "none"});
                TT.DOM.New("div", grp, {id: ("°" + groupId), className: "children"});
                if (SetEvents) {
                    grp.onclick = function(event) {
                        if (event.which == 1 && event.target == this && event.clientX < (this.childNodes[0].getBoundingClientRect().width + this.getBoundingClientRect().left)) TT.DOM.Deselect();
                    }
                    grp.onmousedown = function(event) {
                        event.stopImmediatePropagation();
                        if (event.which == 1 && event.target == this && event.clientX < (this.childNodes[0].getBoundingClientRect().width + this.getBoundingClientRect().left)) {
                            TT.Menu.HideMenus();
                            return false;
                        }
                        if (event.which == 2) {
                            event.preventDefault();
                            TT.Groups.ActionClickGroup(this, opt.midclick_group);
                        }
                        if (event.which == 3 && event.target.id == this.id) TT.Menu.ShowFGlobalMenu(event);
                        if (browserId == "V") {
                            chrome.windows.getCurrent({populate: false}, function(window) {
                                if (tt.CurrentWindowId != window.id && window.focused) location.reload();
                            });
                        }
                    }
                    grp.ondragover = function(event) {
                            if (event.target.id == this.id && (tt.DraggingGroup || tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder)) {
                                TT.DOM.RemoveHighlight();
                                this.classList.add("highlighted_drop_target");
                            }
                        }
                    grp.ondblclick = function(event) {
                        if (event.target.id == this.id) TT.Groups.ActionClickGroup(this, opt.dbclick_group);
                    }
                    if (opt.switch_with_scroll) TT.DOM.BindTabsSwitchingToMouseWheel(groupId);
                }
            }
            if (D.getElementById("_" + groupId) == null) {
                let gbn = TT.DOM.New("div", D.getElementById("group_list"), {id: ("_" + groupId), className: "group_button", draggable: (SetEvents ? true : false)});
                TT.DOM.New("span", gbn, {id: ("_gte" + groupId), className: "group_title", textContent: group_name}, {color: (font_color != "" ? ("#" + font_color) : (window.getComputedStyle(D.getElementById("body"), null).getPropertyValue("--group_list_default_font_color")))});
                TT.DOM.New("div", gbn, {id: ("di" + groupId), className: "drag_indicator"});
                if (SetEvents) {
                    gbn.onclick = function(event) {
                        TT.Groups.SetActiveGroup(this.id.substr(1), true, true);
                    }
                    gbn.onmousedown = function(event) {
                        if (event.which == 3) TT.Menu.ShowFGroupMenu(D.getElementById(this.id.substr(1)), event);
                    }
                    gbn.ondblclick = function(event) {
                        if (event.which == 1 && this.id != "_tab_list") TT.Groups.ShowGroupEditWindow((this.id).substr(1));
                    }
                    gbn.ondragstart = function(event) { // DRAG START
                        event.stopPropagation();
                        event.dataTransfer.setDragImage(D.getElementById("DragImage"), 0, 0);
                        event.dataTransfer.setData("text", "");
                        event.dataTransfer.setData("SourceWindowId", tt.CurrentWindowId);
                        TT.DOM.CleanUpDragAndDrop();
                        tt.Dragging = true;
                        tt.DraggingGroup = true;
                        tt.DragTreeDepth = -1;
                        let groupId = this.id.substr(1);
                        let Group = Object.assign({}, tt.groups[groupId]);
                        let Nodes = [];
                        D.querySelectorAll("#" + groupId + " .tab, #" + groupId + " .folder").forEach(function(s) {
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
                            TT.DOM.RemoveHighlight();
                            TT.DOM.SetClasses(this, ["inside", "highlighted_drop_target"], ["before", "after"], []);
                        }
                        if (this.classList.contains("before") == false && event.layerY < this.clientHeight / 2 && tt.DraggingGroup) {
                            TT.DOM.RemoveHighlight();
                            TT.DOM.SetClasses(this, ["before", "highlighted_drop_target"], ["inside", "after"], []);
                        }
                        if (this.classList.contains("after") == false && event.layerY > this.clientHeight / 2 && tt.DraggingGroup) {
                            TT.DOM.RemoveHighlight();
                            TT.DOM.SetClasses(this, ["after", "highlighted_drop_target"], ["inside", "before"], []);
                        }
                    }
                    gbn.ondragenter = function(event) {
                        if (opt.open_tree_on_hover) {
                            if (this.classList.contains("active") == false && (tt.DraggingGroup || tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder)) {
                                clearTimeout(tt.DragOverTimer);
                                let This = this;
                                tt.DragOverTimer = setTimeout(function() {TT.Groups.SetActiveGroup(This.id.substr(1), false, false);}, 1500);
                            }
                        }
                    }
                    TT.DOM.RefreshGUI();
                }
            }
        },
        GenerateNewGroupID: function() {
            let newID = "";
            while (newID == "") {
                newID = "g_" + GenerateRandomID();
                if (D.getElementById(newID) != null) newID = "";
            }
            return newID;
        },
        GroupRemove: function(groupId, close_tabs) { // remove group, delete tabs if close_tabs is true
            if (close_tabs) {
                let tabIds = Array.prototype.map.call(D.querySelectorAll("#" + groupId + " .tab"), function(s) {return parseInt(s.id);});
                TT.Tabs.CloseTabs(tabIds);
                D.querySelectorAll("#" + groupId + " .folder").forEach(function(s) {
                    TT.Folders.RemoveFolder(s.id);
                });
            } else {
                let TabList = D.getElementById("°tab_list");
                let GroupList = D.getElementById("°" + groupId);
                if (TabList != null && GroupList != null) {
                    while (GroupList.firstChild) {
                        TabList.appendChild(GroupList.firstChild);
                    }
                }
                TT.DOM.RefreshExpandStates();
                TT.DOM.RefreshCounters();
            }
            if (groupId != "tab_list") {
                delete tt.groups[groupId];
                let active_tab_is_pin = D.querySelector(".pin.active_tab");
                if (groupId == tt.active_group && active_tab_is_pin == null) {
                    if (D.getElementById("_" + groupId).previousSibling) {
                        TT.Groups.SetActiveGroup((D.getElementById("_" + groupId).previousSibling.id).substr(1), true, true);
                    } else {
                        if (D.getElementById("_" + groupId).nextSibling) {
                            TT.Groups.SetActiveGroup((D.getElementById("_" + groupId).nextSibling.id).substr(1), true, true);
                        } else {
                            TT.Groups.SetActiveGroup("tab_list", true, true);
                        }
                    }
                }
                let group = D.getElementById(groupId);
                if (group != null) group.parentNode.removeChild(group);
                let groupButton = D.getElementById("_" + groupId);
                if (groupButton != null) groupButton.parentNode.removeChild(groupButton);
            }
            TT.Groups.SaveGroups();
            tt.schedule_update_data++;
        },
        KeepOnlyOneActiveTabInGroup: function() {
            let active_tabs = D.querySelectorAll("#" + tt.active_group + " .active_tab");
            if (active_tabs.length > 1) {
                chrome.tabs.query({currentWindow: true, active: true}, function(activeTab) {
                    TT.Tabs.SetActiveTab(activeTab[0].id, false);
                });
            }
        },
        SetActiveGroup: function(groupId, switch_to_active_in_group, scroll_to_active) {
            if (opt.debug) TT.Debug.log("f: SetActiveGroup, groupId: " + groupId + ", switch_to_active_in_group: " + switch_to_active_in_group + ", scroll_to_active: " + scroll_to_active);
            let group = D.getElementById(groupId);
            if (group != null) {
                tt.active_group = groupId;
                D.querySelectorAll(".group_button").forEach(function(s) {
                    s.classList.remove("active_group");
                });
                D.getElementById("_" + groupId).classList.add("active_group");
                D.querySelectorAll(".group").forEach(function(s) {
                    s.style.display = "none";
                });
                group.style.display = "";
                TT.DOM.RefreshGUI();
                TT.DOM.HideRenameDialogs()
                let activeTab = D.querySelector("#" + groupId + " .active_tab");
                if (activeTab != null) {
                    if (switch_to_active_in_group) chrome.tabs.update(parseInt(activeTab.id), {active: true});
                    if (scroll_to_active && tt.tabs[activeTab.id]) tt.tabs[activeTab.id].ScrollToTab();
                    TT.Groups.KeepOnlyOneActiveTabInGroup();
                }
                if (groupId == "tab_list") {
                    D.querySelectorAll("#button_remove_group, #button_edit_group").forEach(function(s) {
                        s.classList.add("disabled");
                    });
                } else {
                    D.querySelectorAll("#button_remove_group, #button_edit_group").forEach(function(s) {
                        s.classList.remove("disabled");
                    });
                }
                chrome.runtime.sendMessage({command: "set_active_group", active_group: groupId, windowId: tt.CurrentWindowId});
                TT.DOM.RefreshExpandStates();
                TT.DOM.RefreshCounters();
                if (browserId == "F" && opt.hide_other_groups_tabs_firefox) {
                    let HideTabIds = Array.prototype.map.call(D.querySelectorAll(".group:not([id='" + groupId + "']) .tab"), function(s) {
                        return parseInt(s.id);
                    });
                    let ShowTabIds = Array.prototype.map.call(D.querySelectorAll("#" + groupId + " .tab"), function(s) {
                        return parseInt(s.id);
                    });
                    browser.tabs.hide(HideTabIds);
                    browser.tabs.show(ShowTabIds);
                }
            }
        },
        SetActiveTabInGroup: function(groupId, tabId) {
            if (D.querySelector("#" + groupId + " [id='" + tabId + "']") != null && tt.groups[groupId] != undefined) {
                if (groupId != tt.active_group) TT.Groups.SetActiveGroup(groupId, false, true);
                if (tt.groups[groupId]) {
                    tt.groups[groupId].prev_active_tab = tt.groups[groupId].active_tab;
                    tt.groups[groupId].active_tab = parseInt(tabId);
                }
                TT.Groups.SaveGroups();
            }
        },
        ShowGroupEditWindow: function(groupId) { // Edit group popup
            TT.DOM.HideRenameDialogs();
            if (tt.groups[groupId]) {
                let name = D.getElementById("group_edit_name");
                name.value = tt.groups[groupId].name;
                let groupEditDialog = D.getElementById("group_edit");
                groupEditDialog.setAttribute("groupId", groupId);
                TT.DOM.SetStyle(groupEditDialog, {display: "block", left: "", top: D.getElementById("toolbar").getBoundingClientRect().height + D.getElementById("pin_list").getBoundingClientRect().height + 8 + "px"});
                let DefaultGroupButtonFontColor = window.getComputedStyle(D.getElementById("body"), null).getPropertyValue("--group_list_default_font_color");
                let GroupEditFont = D.getElementById("group_edit_font");
                GroupEditFont.style.backgroundColor = (tt.groups[groupId].font == "" ? DefaultGroupButtonFontColor : "#" + tt.groups[groupId].font);
                setTimeout(function() {D.getElementById("group_edit_name").select();}, 5);
            }
        },
        GroupEditConfirm: function() { // when pressed OK in group popup
            let groupId = D.getElementById("group_edit").getAttribute("groupId");
            if (tt.groups[groupId]) {
                let GroupEditName = D.getElementById("group_edit_name");
                tt.groups[groupId].name = GroupEditName.value;
                let GroupEditFont = D.getElementById("group_edit_font");
                let DefaultGroupButtonFontColor = window.getComputedStyle(D.getElementById("body"), null).getPropertyValue("--group_list_default_font_color");
                let ThisGroupButtonFontColor = TT.Utils.RGBtoHex(GroupEditFont.style.backgroundColor);
                if ("#" + ThisGroupButtonFontColor != DefaultGroupButtonFontColor) {
                    tt.groups[groupId].font = ThisGroupButtonFontColor;
                    D.getElementById("_gte" + groupId).style.color = "#" + ThisGroupButtonFontColor;
                }
                TT.DOM.HideRenameDialogs();
                TT.DOM.RefreshGUI();
                TT.Groups.SaveGroups();
            }
        },
        RestoreStateOfGroupsToolbar: function() {
            chrome.runtime.sendMessage({command: "get_group_bar", windowId: tt.CurrentWindowId}, function(response) {
                let toolbarGroups = D.getElementById("toolbar_groups");
                if (response == true) {
                    TT.DOM.SetStyle(toolbarGroups, {display: "inline-block", width: "19px", borderRight: "1px solid var(--group_list_borders)"});
                    toolbarGroups.classList.remove("hidden");
                } else {
                    TT.DOM.SetStyle(toolbarGroups, {display: "none", width: "0px", borderRight: "none"});
                    toolbarGroups.classList.add("hidden");
                }
            });
        },
        GroupsToolbarToggle: function() {
            let toolbarGroups = D.getElementById("toolbar_groups");
            toolbarGroups.classList.toggle("hidden");
            if (toolbarGroups.classList.contains("hidden")) {
                TT.DOM.SetStyle(toolbarGroups, {display: "none", width: "0px", borderRight: "none"});
                chrome.runtime.sendMessage({command: "set_group_bar", group_bar: false, windowId: tt.CurrentWindowId});
            } else {
                TT.DOM.SetStyle(toolbarGroups, {display: "inline-block", width: "19px", borderRight: "1px solid var(--group_list_borders)"});
                chrome.runtime.sendMessage({command: "set_group_bar", group_bar: true, windowId: tt.CurrentWindowId});
            }
            TT.DOM.RefreshGUI();
        },
        ActionClickGroup: function(Node, bgOption) {
            if (bgOption == "new_tab") {
                if (Node.id == "pin_list") {TT.Tabs.OpenNewTab(true, undefined);}
                if (Node.classList.contains("tab") || Node.classList.contains("folder") || Node.classList.contains("group")) {TT.Tabs.OpenNewTab(false, Node.id);}
            }
            if (bgOption == "activate_previous_active") {
                chrome.tabs.update(parseInt(tt.groups[tt.active_group].prev_active_tab), {active: true});
            }
            if (bgOption == "undo_close_tab") {
                chrome.sessions.getRecentlyClosed(null, function(sessions) {
                    if (sessions.length > 0) chrome.sessions.restore(null, function(restored) {});
                });
            }
        },
        SetActiveTabInEachGroup: function() { // SET ACTIVE TAB FOR EACH GROUP
            chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
                if (tabs.length) {
                    TT.Tabs.SetActiveTab(tabs[0].id);
                    chrome.runtime.sendMessage({command: "get_active_group", windowId: tt.CurrentWindowId}, function(response) {
                        if (response) {
                            TT.Groups.SetActiveGroup(response, false, true);
                            for (var group in tt.groups) {
                                let ActiveInGroup = D.querySelector("#" + group + " [id='" + tt.groups[group].active_tab + "']");
                                if (ActiveInGroup != null) ActiveInGroup.classList.add("active_tab");
                            }
                            if (tabs[0].pinned) {
                                let ActiveTabinActiveGroup = D.querySelectorAll("#" + tt.active_group + " .active_tab");
                                if (ActiveTabinActiveGroup != null) {
                                    ActiveTabinActiveGroup.forEach(function(s) {
                                        s.classList.remove("active_tab");
                                    });
                                }
                            }
                        } else {
                            TT.Groups.SetActiveGroup("tab_list", false, true);
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
                                        if (t_ref[p_tt[i]]) p[i] = t_ref[p_tt[i]];
                                    }
                                    for (i = 0; i < p.length; i++) {
                                        let Tab = D.getElementById(tabs[i].id);
                                        if (Tab && p[i] == Tab.parentNode.parentNode.id) ok++;
                                    }
                                    if (ok < tabs.length * 0.5) {
                                        if (opt.debug) TT.Debug.log("emergency reload");
                                        chrome.storage.local.set({emergency_reload: true});
                                        chrome.runtime.sendMessage({command: "reload"});
                                        // chrome.runtime.sendMessage({command: "reload_sidebar"});
                                        location.reload();
                                    } else {
                                        if (opt.debug) TT.Debug.log("f: RecheckFirefox, ok");
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
                        TT.Utils.Bookmark(rootNode);
                        return;
                    } else {
                        let Tabs = D.querySelectorAll("#°" + rootNode.id + " .tab");
                        if (rootNode.classList.contains("tab")) {
                            if (Tabs.length > 0) {
                                chrome.tabs.get(parseInt(rootNode.id), function(tab) {
                                    if (tab) {
                                        chrome.bookmarks.create({parentId: TreeTabsId, title: tab.title}, function(root) {
                                            D.querySelectorAll("[id='" + rootNode.id + "'], [id='" + rootNode.id + "'] .tab").forEach(function(s) {
                                                chrome.tabs.get(parseInt(s.id), function(tab) {
                                                    if (tab) chrome.bookmarks.create({parentId: root.id, title: tab.title, url: tab.url});
                                                });
                                            });
                                        });
                                    }
                                });
                            } else {
                                chrome.tabs.get(parseInt(rootNode.id), function(tab) {
                                    if (tab) chrome.bookmarks.create({parentId: TreeTabsId, title: tab.title, url: tab.url});
                                });
                            }
                        }
                        if (rootNode.classList.contains("folder") || rootNode.classList.contains("group")) {
                            let rootName = labels.noname_group;
                            if (rootNode.classList.contains("folder") && tt.folders[rootNode.id]) rootName = tt.folders[rootNode.id].name;
                            if (rootNode.classList.contains("group") && tt.groups[rootNode.id]) rootName = tt.groups[rootNode.id].name;
                            chrome.bookmarks.create({parentId: TreeTabsId, title: rootName}, function(root) {
                                let folders = D.querySelectorAll("#°" + rootNode.id + " .folder");
                                let Nodes = {};
                                folders.forEach(function(f) {
                                    if (tt.folders[f.id]) {
                                        chrome.bookmarks.create({parentId: root.id, title: tt.folders[f.id].name}, function(Bkfolder) {
                                            Nodes[f.id] = {ttid: f.id, id: Bkfolder.id, ttparent: tt.folders[f.id].parent, parent: root.id};
                                            if (Object.keys(Nodes).length == folders.length) {
                                                for (var elem in Nodes) {
                                                    if (Nodes[Nodes[elem].ttparent]) Nodes[Nodes[elem].ttid].parent = Nodes[Nodes[elem].ttparent].id;
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
                                            if (tab) chrome.bookmarks.create({parentId: (Nodes[t.parentNode.parentNode.id] ? Nodes[t.parentNode.parentNode.id].id : root.id), title: tab.title, url: tab.url});
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
            if (opt.debug) TT.Debug.log("f: SetEvents, adding global events.");
            let PinList = D.getElementById("pin_list");
            if (!opt.switch_with_scroll) {
                PinList.onmousewheel = function(event) {
                    let pinList = D.getElementById("pin_list");
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
            D.getElementById("body").addEventListener('contextmenu', function(event) {
                if (event.target.classList.contains("text_input") == false) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                }
            }, false);
            D.body.onresize = function(event) {
                TT.DOM.RefreshGUI();
            }
            D.body.onmousedown = function(event) {
                if (event.which == 2) event.preventDefault();
                if (event.which == 1 && event.target.classList.contains("menu_item") == false) TT.Menu.HideMenus();
                event.stopImmediatePropagation();
                if (event.which == 1) TT.DOM.RemoveHeadersHoverClass();
            }
            D.getElementById("folder_edit_confirm").onmousedown = function(event) {
                if (event.which == 1) TT.Folders.FolderRenameConfirm();
            }
            D.getElementById("folder_edit_discard").onmousedown = function(event) {
                if (event.which == 1) TT.DOM.HideRenameDialogs();
            }
            D.getElementById("group_edit_confirm").onmousedown = function(event) {
                if (event.which == 1) TT.Groups.GroupEditConfirm();
            }
            D.getElementById("group_edit_discard").onmousedown = function(event) {
                if (event.which == 1) TT.DOM.HideRenameDialogs();
            }
            D.getElementById("folder_edit_name").onkeydown = function(event) {
                if (event.keyCode == 13) TT.Folders.FolderRenameConfirm();
                if (event.which == 27) TT.DOM.HideRenameDialogs();
            }
            D.getElementById("group_edit_name").onkeydown = function(event) {
                if (event.keyCode == 13) TT.Groups.GroupEditConfirm();
                if (event.which == 27) TT.DOM.HideRenameDialogs();
            }
            PinList.onclick = function(event) {
                if (event.which == 1 && event.target == this) {
                    if (opt.pin_list_multi_row || (opt.pin_list_multi_row == false && event.clientY < (this.childNodes[0].getBoundingClientRect().height + this.getBoundingClientRect().top))) TT.DOM.Deselect();
                }
            }
            PinList.onmousedown = function(event) {
                if (event.which == 1 && event.target == this) {
                    if (opt.pin_list_multi_row || (opt.pin_list_multi_row == false && event.clientY < (this.childNodes[0].getBoundingClientRect().height + this.getBoundingClientRect().top))) TT.Menu.HideMenus();
                }
                if (event.which == 2 && event.target == this) TT.Groups.ActionClickGroup(this, opt.midclick_group);
                if (event.which == 3 && event.target == this) TT.Menu.ShowFGlobalMenu(event);
            }
            PinList.ondragover = function(event) {
                if (event.target.id == "pin_list" && tt.DraggingGroup == false && (tt.DraggingPin || tt.DraggingTab || tt.DraggingFolder) && this.classList.contains("highlighted_drop_target") == false) {
                    TT.DOM.RemoveHighlight();
                    this.classList.add("highlighted_drop_target");
                }
            }
            PinList.ondblclick = function(event) {
                if (event.target == this) TT.Groups.ActionClickGroup(this, opt.dbclick_group);
            }
            D.getElementById("group_edit_font").onclick = function(event) {
                if (event.which == 1) {
                    event.stopPropagation();
                    let ColorPicker = D.getElementById("color_picker");
                    ColorPicker.setAttribute("PickColor", this.id);
                    ColorPicker.value = "#" + TT.Utils.RGBtoHex(this.style.backgroundColor);
                    ColorPicker.focus();
                    ColorPicker.click();
                }
            }
            D.getElementById("color_picker").oninput = function(event) {
                D.getElementById(this.getAttribute("PickColor")).style.backgroundColor = this.value;
            }
            D.getElementById("group_list").ondragleave = function(event) {
                if (opt.open_tree_on_hover) {
                    clearTimeout(tt.DragOverTimer);
                    tt.DragOverId = "";
                }
            }
            D.body.onkeydown = function(event) {
                if (event.ctrlKey && event.which == 65) { // ctrl+a to select all
                    if (D.querySelector(".pin>.tab_header_hover") != null) {
                        D.querySelectorAll(".pin").forEach(function(s) {
                            s.classList.add("selected");
                        });
                    }
                    if (D.querySelectorAll("#" + tt.active_group + " .tab>.tab_header_hover, #" + tt.active_group + " .folder>.folder_header_hover").length > 0) {
                        let rootId = D.querySelectorAll("#" + tt.active_group + " .tab>.tab_header_hover, #" + tt.active_group + " .folder>.folder_header_hover")[0].parentNode.parentNode.parentNode.id;
                        D.querySelectorAll("#°" + rootId + ">.folder, #°" + rootId + ">.tab").forEach(function(s) {
                            s.classList.add("selected");
                        });
                    }
                }
                if (event.ctrlKey && event.which == 73) { // ctrl+i to invert selection
                    if (D.querySelector(".pin>.tab_header_hover") != null) {
                        D.querySelectorAll(".pin").forEach(function(s) {
                            s.classList.toggle("selected");
                        });
                    }
                    if (D.querySelectorAll("#" + tt.active_group + " .tab>.tab_header_hover, #" + tt.active_group + " .folder>.folder_header_hover").length > 0) {
                        let rootId = D.querySelectorAll("#" + tt.active_group + " .tab>.tab_header_hover, #" + tt.active_group + " .folder>.folder_header_hover")[0].parentNode.parentNode.parentNode.id;
                        D.querySelectorAll("#°" + rootId + ">.folder, #°" + rootId + ">.tab").forEach(function(s) {
                            s.classList.toggle("selected");
                        });
                    }
                }
                if (event.which == 27) TT.DOM.Deselect(); // esc to unselect tabs and folders
                if (event.altKey && event.which == 71) TT.Groups.GroupsToolbarToggle(); // alt+g to toggle group bar
                if (event.which == 192 || event.which == 70) { // new folder
                    if (tt.pressed_keys.indexOf(event.which) == -1) tt.pressed_keys.push(event.which);
                    if (tt.pressed_keys.indexOf(192) != -1 && tt.pressed_keys.indexOf(70) != -1) {
                        let FolderId = TT.Folders.AddNewFolder({});
                        TT.Folders.ShowRenameFolderDialog(FolderId);
                    }
                }
                TT.DOM.RefreshGUI();
            }

            D.body.onkeyup = function(event) {
                if (tt.pressed_keys.indexOf(event.which) != -1) tt.pressed_keys.splice(tt.pressed_keys.indexOf(event.which), 1);
            }
            D.body.ondragover = function(event) {
                if (opt.debug) TT.Debug.log("drag over: " + event.target.id);
                event.preventDefault();
            }
            D.ondrop = function(event) {
                if (opt.debug) TT.Debug.log("dropped on window: " + tt.CurrentWindowId);
                let Nodes = event.dataTransfer.getData("Nodes") ? JSON.parse(event.dataTransfer.getData("Nodes")) : [];
                let NodesTypes = event.dataTransfer.getData("NodesTypes") ? JSON.parse(event.dataTransfer.getData("NodesTypes")) : {DraggingGroup: false, DraggingPin: false, DraggingTab: false, DraggingFolder: false};
                let Group = event.dataTransfer.getData("Group") ? JSON.parse(event.dataTransfer.getData("Group")) : {};
                let SourceWindowId = event.dataTransfer.getData("SourceWindowId") ? JSON.parse(event.dataTransfer.getData("SourceWindowId")) : 0;
                let target = D.querySelector(".highlighted_drop_target");
                let where = target ? (target.classList.contains("before") ? "before" : (target.classList.contains("after") ? "after" : "inside")) : "";
                let ActiveGroup = D.getElementById(tt.active_group);
                let Scroll = ActiveGroup.scrollTop;
                clearTimeout(tt.DragOverTimer);
                tt.DragOverId = "";
                tt.Dragging = false;
                chrome.runtime.sendMessage({command: "drag_end"});
                event.preventDefault();
                if (SourceWindowId == tt.CurrentWindowId) {
                    TT.DOM.DropToTarget({NodesTypes: NodesTypes, Nodes: Nodes, TargetNode: target, where: where, Group: Group, Scroll: Scroll});
                } else {
                    TT.DOM.FreezeSelection();
                    if (NodesTypes.DraggingGroup) {
                        tt.groups[Group.id] = Object.assign({}, Group);
                        TT.Groups.AppendGroupToList(Group.id, Group.name, Group.font, true);
                    }
                    let TabsIds = [];
                    for (let i = 0; i < Nodes.length; i++) {
                        if (Nodes[i].NodeClass == "folder") {
                            TT.Folders.AddNewFolder({folderId: Nodes[i].id, ParentId: Nodes[i].parent, Name: Nodes[i].name, Index: Nodes[i].index, ExpandState: Nodes[i].expand});
                            chrome.runtime.sendMessage({command: "remove_folder", folderId: Nodes[i].id});
                        }
                        if (Nodes[i].NodeClass == "pin") {
                            chrome.tabs.update(parseInt(Nodes[i].id), {pinned: false});
                            TabsIds.push(parseInt(Nodes[i].id));
                        }
                        if (Nodes[i].NodeClass == "tab") TabsIds.push(parseInt(Nodes[i].id));
                    }
                    chrome.tabs.move(TabsIds, {windowId: tt.CurrentWindowId, index: -1}, function(MovedTab) {
                        let Stop = 500;
                        let DropNodes = setInterval(function() {
                            Stop--;
                            let all_ok = true;
                            for (let i = 0; i < Nodes.length; i++) {
                                if (D.getElementById(Nodes[i].id) == null) all_ok = false;
                            }
                            TT.DOM.DropToTarget({NodesTypes: NodesTypes, Nodes: Nodes, TargetNode: target, where: where, Group: Group, Scroll: Scroll});
                            if (NodesTypes.DraggingGroup) chrome.runtime.sendMessage({command: "remove_group", groupId: Group.id});
                            if (all_ok || Stop < 0) {
                                setTimeout(function() {
                                    clearInterval(DropNodes);
                                }, 300);
                            }
                        }, 100);
                    });
                }
            }
            D.ondragleave = function(event) {
                if (opt.debug) TT.Debug.log("global dragleave");
                TT.DOM.RemoveHighlight();
                if (opt.open_tree_on_hover) {
                    clearTimeout(tt.DragOverTimer);
                    tt.DragOverId = "";
                }
            }
            D.ondragend = function(event) {
                if (opt.debug) TT.Debug.log("drag_end");
                let Nodes = event.dataTransfer.getData("Nodes") ? JSON.parse(event.dataTransfer.getData("Nodes")) : [];
                let NodesTypes = event.dataTransfer.getData("NodesTypes") ? JSON.parse(event.dataTransfer.getData("NodesTypes")) : {DraggingGroup: false, DraggingPin: false, DraggingTab: false, DraggingFolder: false};
                let Group = event.dataTransfer.getData("Group") ? JSON.parse(event.dataTransfer.getData("Group")) : {};
                setTimeout(function() {
                    if (tt.Dragging && ((browserId == "F" && ( event.screenX < event.view.mozInnerScreenX || event.screenX > (event.view.mozInnerScreenX + window.innerWidth) || event.screenY < event.view.mozInnerScreenY || event.screenY > (event.view.mozInnerScreenY + window.innerHeight))) || (browserId != "F" && (event.pageX < 0 || event.pageX > window.outerWidth || event.pageY < 0 || event.pageY > window.outerHeight)))) TT.Tabs.Detach(Nodes, NodesTypes, Group);
                    TT.DOM.CleanUpDragAndDrop();
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
            if (opt.debug) {TT.Debug.log("f: BindTabsSwitchingToMouseWheel, binding tabs switch to group: " + Id);}
            D.getElementById(Id).onwheel = function(event) {
                event.preventDefault();
                let prev = event.deltaY < 0;
                if (prev) {
                    TT.Tabs.ActivatePrevTab(true);
                } else {
                    TT.Tabs.ActivateNextTab(true);
                }
            }
        },
        InsertDropToTarget: function(p) {
            if (p.AppendToTarget) {
                for (let i = 0; i < p.Nodes.length; i++) {
                    let Node = D.getElementById(p.Nodes[i].id);
                    if (Node != null) {
                        if (p.Nodes[i].selected) {
                            TT.DOM.AppendToNode(Node, p.TargetNode);
                            Node.classList.add("selected");
                            if (p.Nodes[i].temporary) Node.classList.add("selected_temporarly");
                        } else {
                            if (Node.parentNode.id != p.Nodes[i].parent) TT.DOM.AppendToNode(Node, D.getElementById(p.Nodes[i].parent));
                        }
                    }
                }
            }
            if (p.BeforeTarget) {
                for (i = 0; i < p.Nodes.length; i++) {
                    let Node = D.getElementById(p.Nodes[i].id);
                    if (Node != null) {
                        if (p.Nodes[i].selected) {
                            TT.DOM.InsterBeforeNode(Node, p.TargetNode);
                            Node.classList.add("selected");
                            if (p.Nodes[i].temporary) Node.classList.add("selected_temporarly");
                        } else {
                            if (Node.parentNode.id != p.Nodes[i].parent) TT.DOM.AppendToNode(Node, D.getElementById(p.Nodes[i].parent));
                        }
                    }
                }
            }
            if (p.AfterTarget) {
                let i = p.after ? (p.Nodes.length - 1) : 0;
                for (i = p.Nodes.length - 1; i >= 0; i--) {
                    let Node = D.getElementById(p.Nodes[i].id);
                    if (Node != null) {
                        if (p.Nodes[i].selected) {
                            TT.DOM.InsterAfterNode(Node, p.TargetNode);
                            Node.classList.add("selected");
                            if (p.Nodes[i].temporary) Node.classList.add("selected_temporarly");
                        } else {
                            if (Node.parentNode.id != p.Nodes[i].parent) TT.DOM.AppendToNode(Node, D.getElementById(p.Nodes[i].parent));
                        }
                    }
                }
            }
        },
        New: function(type, parent, parameters, style) {
            let NewElement = D.createElement(type);
            for (param in parameters) {
                NewElement[param] = parameters[param];
            }
            for (param in style) {
                NewElement.style[param] = style[param];
            }
            if (parent) parent.appendChild(NewElement);
            return NewElement;
        },
        SetStyle: async function(node, style) {
            for (param in style) {
                node.style[param] = style[param];
            }
        },
        SetClasses: function(node, add, remove, toggle) {
            let Ind = 0;
            for (Ind = 0; Ind < add.length; Ind++) {
                node.classList.add(add[Ind]);
            }
            for (Ind = 0; Ind < remove.length; Ind++) {
                node.classList.remove(remove[Ind]);
            }
            for (Ind = 0; Ind < toggle.length; Ind++) {
                node.classList.toggle(toggle[Ind]);
            }
        },
        DropToTarget: function(p) { // Class: ("group", "tab", "folder"), DraggedTabNode: TabId, TargetNode: query node, TabsIdsSelected: arr of selected tabIds, TabsIds: arr of tabIds, TabsIdsParents: arr of parent tabIds, Folders: object with folders objects, FoldersSelected: arr of selected folders ids, Group: groupId, Scroll: bool
            if (p.TargetNode != null) {
                let pinTabs = false;
                if (p.NodesTypes.DraggingPin || p.NodesTypes.DraggingTab || p.NodesTypes.DraggingFolder) {
                    if (p.TargetNode.classList.contains("pin") || p.TargetNode.classList.contains("tab") || p.TargetNode.classList.contains("folder")) {
                        if (p.TargetNode.classList.contains("pin")) pinTabs = true;
                        if (p.where == "inside") TT.DOM.InsertDropToTarget({TargetNode: p.TargetNode.childNodes[1], AppendToTarget: true, Nodes: p.Nodes}); // PINS NEVER HAVE INSIDE, SO WILL BE IGNORED
                        if (p.where == "before") TT.DOM.InsertDropToTarget({TargetNode: p.TargetNode, BeforeTarget: true, Nodes: p.Nodes});
                        if (p.where == "after") TT.DOM.InsertDropToTarget({TargetNode: p.TargetNode, AfterTarget: true, Nodes: p.Nodes});
                    }
                    if (p.TargetNode.id == "pin_list") {
                        TT.DOM.InsertDropToTarget({TargetNode: p.TargetNode, AppendToTarget: true, Nodes: p.Nodes});
                        pinTabs = true;
                    }
                    if (p.TargetNode.classList.contains("group")) TT.DOM.InsertDropToTarget({TargetNode: p.TargetNode.childNodes[0], AppendToTarget: true, Nodes: p.Nodes});
                    if (p.TargetNode.classList.contains("group_button")) {
                        let group = D.getElementById("°" + p.TargetNode.id.substr(1));
                        TT.DOM.InsertDropToTarget({TargetNode: group, Nodes: p.Nodes, AppendToTarget: true});
                    }
                    setTimeout(function() {TT.Folders.SaveFolders();}, 600);
                }
                if (p.NodesTypes.DraggingGroup) {
                    if (p.where == "before") TT.DOM.InsterBeforeNode(D.getElementById("_" + p.Group.id), p.TargetNode);
                    if (p.where == "after") TT.DOM.InsterAfterNode(D.getElementById("_" + p.Group.id), p.TargetNode);
                    TT.Groups.UpdateBgGroupsOrder();
                    TT.Groups.RearrangeGroupsLists();
                }
                for (i = 0; i < p.Nodes.length; i++) {
                    if (p.Nodes[i].NodeClass == "pin" || p.Nodes[i].NodeClass == "tab") {
                        if (tt.tabs[p.Nodes[i].id]) {
                            if (tt.tabs[p.Nodes[i].id].Node.classList.contains("pin") != pinTabs) {
                                tt.tabs[p.Nodes[i].id].SetTabClass(pinTabs);
                                tt.tabs[p.Nodes[i].id].pinned = pinTabs;
                                chrome.tabs.update(parseInt(p.Nodes[i].id), {pinned: pinTabs});
                            }
                        }
                    }
                }
                if (opt.syncro_tabbar_tabs_order) {
                    let tabIds = Array.prototype.map.call(D.querySelectorAll(".pin, .tab"), function(s) {return parseInt(s.id);});
                    for (i = 0; i < p.Nodes.length; i++) {
                        if (p.Nodes[i].NodeClass == "pin" || p.Nodes[i].NodeClass == "tab") chrome.tabs.move(parseInt(p.Nodes[i].id), {index: tabIds.indexOf(parseInt(p.Nodes[i].id))});
                    }
                    setTimeout(function() {tt.schedule_rearrange_tabs++;}, 500);
                }
            }
            TT.Groups.KeepOnlyOneActiveTabInGroup();
            TT.DOM.RefreshExpandStates();
            TT.DOM.RefreshCounters();
            setTimeout(function() {
                TT.DOM.RemoveHighlight();
            }, 100);
            setTimeout(function() {
                if (opt.syncro_tabbar_groups_tabs_order) tt.schedule_rearrange_tabs++;
                // TT.DOM.RefreshExpandStates();
                // TT.DOM.RefreshCounters();
                tt.schedule_update_data++;
                TT.DOM.RefreshGUI();
                TT.DOM.CleanUpDragAndDrop();
                if (opt.debug) TT.Debug.log("DropToTarget END");
            }, 500);
        },
        AppendToNode: function(Node, AppendNode) {
            if (Node != null && AppendNode != null) AppendNode.appendChild(Node);
        },
        InsterBeforeNode: function(Node, BeforeNode) {
            if (Node != null && BeforeNode != null) BeforeNode.parentNode.insertBefore(Node, BeforeNode);
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
            if (ParentNode == null) return Parents;
            while (ParentNode.parentNode != null) {
                if (ParentNode.parentNode.classList != undefined && ParentNode.parentNode.classList.contains(Class)) Parents.push(ParentNode.parentNode);
                ParentNode = ParentNode.parentNode;
            }
            return Parents;
        },
        GetParentsBy2Classes: function(Node, ClassA, ClassB) {
            let Parents = [];
            let ParentNode = Node;
            while (ParentNode.parentNode != null) {
                if (ParentNode.parentNode.classList != undefined && ParentNode.parentNode.classList.contains(ClassA) && ParentNode.parentNode.classList.contains(ClassB)) Parents.push(ParentNode.parentNode);
                ParentNode = ParentNode.parentNode;
            }
            return Parents;
        },
        HideRenameDialogs: function() {
            D.querySelectorAll(".edit_dialog").forEach(function(s) {
                TT.DOM.SetStyle(s, {display: "none", top: "-500px", left: "-500px"});
            });
        },
        EventExpandBox: function(Node) {
            if (Node.classList.contains("o")) {
                Node.classList.remove("o"); Node.classList.add("c");
                if (Node.classList.contains("tab")) chrome.runtime.sendMessage({command: "update_tab", tabId: parseInt(Node.id), tab: {expand: "c"}});
                if (Node.classList.contains("folder")) TT.Folders.SaveFolders();
            } else {
                if (Node.classList.contains("c")) {
                    if (opt.collapse_other_trees) {
                        let thisTreeTabs = TT.DOM.GetParentsByClass(Node.childNodes[0], "tab"); // start from tab's first child, instead of tab, important to include clicked tab as well
                        let thisTreeFolders = TT.DOM.GetParentsByClass(Node.childNodes[0], "folder");
                        D.querySelectorAll("#" + tt.active_group + " .o.tab").forEach(function(s) {
                            TT.DOM.SetClasses(s, ["c"], ["o"], []);
                            chrome.runtime.sendMessage({command: "update_tab", tabId: parseInt(s.id), tab: {expand: "c"}});
                        });
        
                        D.querySelectorAll("#" + tt.active_group + " .o.folder").forEach(function(s) {
                            TT.DOM.SetClasses(s, ["c"], ["o"], []);
                        });
                        thisTreeTabs.forEach(function(s) {
                            TT.DOM.SetClasses(s, ["o"], ["c"], []);
                            chrome.runtime.sendMessage({command: "update_tab", tabId: parseInt(s.id), tab: {expand: "o"}});
                        });
                        thisTreeFolders.forEach(function(s) {
                            s.classList.remove("c"); s.classList.add("o");
                        });
                        TT.Folders.SaveFolders();
                        if (Node.classList.contains("tab") && tt.tabs[Node.id]) tt.tabs[Node.id].ScrollToTab();
                    } else {
                        TT.DOM.SetClasses(Node, ["o"], ["c"], []);
                        if (Node.classList.contains("tab")) chrome.runtime.sendMessage({command: "update_tab", tabId: parseInt(Node.id), tab: {expand: "o"}});
                        if (Node.classList.contains("folder")) TT.Folders.SaveFolders();
                    }
                }
            }
        },
        Select: function(event, TabNode) {
            if (event.shiftKey) { // SET SELECTION WITH SHIFT
                let LastSelected = D.querySelector("#" + tt.active_group + " .selected.selected_last");
                if (LastSelected == null) LastSelected = D.querySelector(".pin.active_tab, #" + tt.active_group + " .tab.active_tab");
                if (LastSelected != null && TabNode.parentNode.id == LastSelected.parentNode.id) {
                    if (!event.ctrlKey) {
                        D.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
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
                        if (i == toIndex && event.ctrlKey) LastSelected.parentNode.childNodes[i].classList.add("selected_last");
                    }
                }
            }
            if (event.ctrlKey && !event.shiftKey) { // TOGGLE SELECTION WITH CTRL
                TabNode.classList.toggle("selected");
                if (TabNode.classList.contains("selected")) {
                    D.querySelectorAll(".selected_last").forEach(function(s) {
                        s.classList.remove("selected_last");
                    });
                    TabNode.classList.add("selected_last");
                } else {
                    TabNode.classList.remove("selected_last");
                }
            }
        },
        Deselect: function() {
            D.querySelectorAll("#pin_list .selected").forEach(function(s) {
                s.classList.remove("selected");
            });
            D.querySelectorAll("#" + tt.active_group + " .selected").forEach(function(s) {
                s.classList.remove("selected");
            });
        },
        FreezeSelection: function(all) {
            if (all) {
                D.querySelectorAll(".selected").forEach(function(s) {
                    TT.DOM.SetClasses(s, ["selected_frozen"], ["selected", "selected_last"], []);
                });
            } else {
                D.querySelectorAll(".group:not(#" + tt.active_group + ") .selected").forEach(function(s) {
                    TT.DOM.SetClasses(s, ["selected_frozen"], ["selected", "selected_last"], []);
                });
            }
        },
        CleanUpDragAndDrop: function() {
            if (opt.debug) TT.Debug.log("f: CleanUpDragAndDrop, unfreezing and removing temporary classes...");
            D.querySelectorAll(".selected_frozen").forEach(function(s) {
                TT.DOM.SetClasses(s, ["selected"], ["selected_frozen"], []);
                // s.classList.add("selected"); s.classList.remove("selected_frozen");
            });
            D.querySelectorAll(".selected_temporarly").forEach(function(s) {
                TT.DOM.SetClasses(s, [], ["selected", "selected_frozen"], []);
                // s.classList.remove("selected"); s.classList.remove("selected_temporarly");
            });
            D.querySelectorAll(".tab_header_hover").forEach(function(s) {
                s.classList.remove("tab_header_hover");
            });
            D.querySelectorAll(".folder_header_hover").forEach(function(s) {
                s.classList.remove("folder_header_hover");
            });
            D.querySelectorAll(".dragged_tree").forEach(function(s) {
                s.classList.remove("dragged_tree");
            });
            D.querySelectorAll(".dragged_parents").forEach(function(s) {
                s.classList.remove("dragged_parents");
            });
            if (opt.debug) TT.Debug.log("f: removing DraggingParams...");
            tt.DragTreeDepth = 0;
            tt.DraggingGroup = false;
            tt.DraggingTab = false;
            tt.DraggingFolder = false;
            tt.DraggingPin = false;
            tt.DragOverId = "";
        },
        RemoveHighlight: function() {
            D.querySelectorAll(".highlighted_drop_target").forEach(function(s) {
                TT.DOM.SetClasses(s, [], ["before", "after", "inside", "highlighted_drop_target"], []);
            });
        },
        RemoveHeadersHoverClass: function() {
            D.querySelectorAll(".folder_header_hover, .tab_header_hover").forEach(function(s) {
                TT.DOM.SetClasses(s, [], ["folder_header_hover", "tab_header_hover"], []);
            });
        },
        Loadi18n: function() {
            D.querySelectorAll(".button, .manager_window_toolbar_button").forEach(function(s) { // toolbar labels
                s.title = chrome.i18n.getMessage(s.id);
            });
            D.querySelectorAll(".menu_item, .edit_dialog_button, #manager_window_header_title, .manager_window_label").forEach(function(s) { // menu labels and edit group dialog labels
                s.textContent = chrome.i18n.getMessage(s.id);
            });
        },
        RefreshExpandStates: async function() { // refresh open closed trees states
            D.querySelectorAll("#" + tt.active_group + " .folder, #" + tt.active_group + " .tab").forEach(function(s) {
                if (s.childNodes[1].children.length == 0) {
                    s.classList.remove("o"); s.classList.remove("c");
                } else {
                    if (s.classList.contains("o") == false && s.classList.contains("c") == false) s.classList.add("o");
                }
            });
            D.querySelectorAll(".pin").forEach(function(s) {
                s.classList.remove("o"); s.classList.remove("c");
            });
        },
        RefreshCounters: async function() {
            if (opt.show_counter_tabs || opt.show_counter_tabs_hints) {
                D.querySelectorAll("#" + tt.active_group + " .o.tab, #" + tt.active_group + " .c.tab").forEach(function(s) {
                    if (opt.show_counter_tabs) s.childNodes[0].childNodes[1].childNodes[0].textContent = D.querySelectorAll("[id='" + s.id + "'] .tab").length;
                    if (opt.show_counter_tabs_hints) {
                        let title = s.childNodes[0].getAttribute("tabTitle");
                        s.childNodes[0].title = (D.querySelectorAll("[id='" + s.id + "'] .tab").length + " • ") + title;
                    }
                });
                D.querySelectorAll("#" + tt.active_group + " .folder").forEach(function(s) {
                    if (opt.show_counter_tabs && tt.folders[s.id]) s.childNodes[0].childNodes[1].childNodes[0].textContent = D.querySelectorAll("[id='" + s.id + "'] .tab").length;
                    if (opt.show_counter_tabs_hints && tt.folders[s.id]) s.childNodes[0].title = (D.querySelectorAll("[id='" + s.id + "'] .tab").length + " • ") + tt.folders[s.id].name;
                });
            }
        },
        RefreshGUI: async function() {
            let toolbar = D.getElementById("toolbar");
            let toolbarHeight = 27;
            if (toolbar.children.length > 0) {
                TT.DOM.SetStyle(toolbar, {height: "", width: "", display: "", border: "", padding: ""});
                if (D.querySelector(".on.button") != null) {
                    toolbar.style.height = "53px";
                    toolbarHeight = 54;
                } else {
                    toolbar.style.height = "26px";
                }
            } else {
                TT.DOM.SetStyle(toolbar, {height: "0px", width: "0px", display: "none", border: "none", padding: "0"});
                toolbar.style.height = "0px";
                toolbarHeight = 0;
            }
            let group_list = D.getElementById("group_list");
            group_list.style.width = D.body.clientWidth + 50 + "px";
            let pin_list = D.getElementById("pin_list");
            if (pin_list.children.length > 0) {
                TT.DOM.SetStyle(pin_list, {top: toolbarHeight + "px", height: "", width: "", display: "", border: "", padding: ""});
            } else {
                TT.DOM.SetStyle(pin_list, {top: "0px", height: "0px", width: "0px", display: "none", border: "none", padding: "0"});
            }
            let pin_listHeight = pin_list.getBoundingClientRect().height;
            let toolbar_groups = D.getElementById("toolbar_groups");
            TT.DOM.SetStyle(toolbar_groups, {top: toolbarHeight + pin_listHeight + "px", height: D.body.clientHeight - toolbarHeight - pin_listHeight + "px"});
            let toolbar_groupsWidth = toolbar_groups.getBoundingClientRect().width;
            if (opt.show_counter_groups) {
                D.querySelectorAll(".group").forEach(function(s) {
                    let groupLabel = D.getElementById("_gte" + s.id);
                    if (groupLabel) groupLabel.textContent = (tt.groups[s.id] ? tt.groups[s.id].name : labels.noname_group) + " (" + D.querySelectorAll("#" + s.id + " .tab").length + ")";
                });
            } else {
                D.querySelectorAll(".group").forEach(function(s) {
                    let groupLabel = D.getElementById("_gte" + s.id);
                    if (groupLabel) groupLabel.textContent = tt.groups[s.id] ? tt.groups[s.id].name : labels.noname_group;
                });
            }
            D.querySelectorAll(".group_button").forEach(function(s) {
                s.style.height = s.firstChild.getBoundingClientRect().height + "px";
            });
            let groups = D.getElementById("groups");
            let groupsHeight = D.body.clientHeight - toolbarHeight - pin_listHeight;
            let groupsWidth = D.body.clientWidth - toolbar_groupsWidth - 1;
            TT.DOM.SetStyle(groups, {top: toolbarHeight + pin_listHeight + "px", left: toolbar_groupsWidth + "px", height: groupsHeight + "px", width: groupsWidth + "px"});
            let PanelList = D.querySelector(".mw_pan_on>.manager_window_list");
            let PanelListHeight = 3 + PanelList.children.length * 18;
            let ManagerWindowPanelButtons = D.querySelector(".mw_pan_on>.manager_window_panel_buttons");
            let ManagerWindowPanelButtonsHeight = ManagerWindowPanelButtons.clientHeight;
            let MaxAllowedHeight = D.body.clientHeight - 140;
            if (PanelListHeight + ManagerWindowPanelButtonsHeight < MaxAllowedHeight) {
                PanelList.style.height = PanelListHeight + "px";
            } else {
                PanelList.style.height = MaxAllowedHeight - ManagerWindowPanelButtonsHeight + "px";
            }
            let ManagerWindow = D.getElementById("manager_window");
            ManagerWindow.style.height = PanelList.clientHeight + ManagerWindowPanelButtonsHeight + 56 + "px";
        },
        VivaldiRefreshMediaIcons: function() { // Vivaldi does not have changeInfo.audible listener, this is my own implementation, hopefully this will not affect performance too much
            setInterval(function() {
                chrome.tabs.query({currentWindow: true, audible: true, discarded: false}, function(tabs) {
                    D.querySelectorAll(".audible, .muted").forEach(function(s) {
                        s.classList.remove("audible"); s.classList.remove("muted");
                    });
                    let tc = tabs.length;
                    for (var ti = 0; ti < tc; ti++) {
                        if (tabs[ti].audible) D.getElementById(tabs[ti].id).classList.add("audible");
                        if (tabs[ti].mutedInfo.muted) D.getElementById(tabs[ti].id).classList.add("muted");
                    }
                });
            }, 2000);
        }
    },
    Manager: {
        OpenManagerWindow: function() {
            TT.DOM.HideRenameDialogs();
            if (opt.debug) TT.Debug.log("f: TT.Manager.OpenManagerWindow");
            chrome.storage.local.get(null, function(storage) {
                TT.DOM.SetStyle(D.getElementById("manager_window"), {display: "block", top: "", left: ""});
                let GroupList = D.getElementById("manager_window_groups_list");
                while (GroupList.hasChildNodes()) {
                    GroupList.removeChild(GroupList.firstChild);
                }
                let SessionsList = D.getElementById("manager_window_sessions_list");
                while (SessionsList.hasChildNodes()) {
                    SessionsList.removeChild(SessionsList.firstChild);
                }
                if (storage.hibernated_groups != undefined) {
                    storage.hibernated_groups.forEach(function(hibernated_group) {
                        TT.Manager.AddGroupToManagerList(hibernated_group);
                    });
                }
                if (storage.saved_sessions != undefined) {
                    (storage.saved_sessions).forEach(function(saved_session) {
                        TT.Manager.AddSessionToManagerList(saved_session);
                    });
                }
                TT.Manager.ReAddSessionAutomaticToManagerList(storage);
            });
        },
        AddGroupToManagerList: function(hibernated_group) {
            let HibernatedGroupRow = TT.DOM.New("li", D.getElementById("manager_window_groups_list"), {className: "hibernated_group_row"});
            let DeleteGroupIcon = TT.DOM.New("div", HibernatedGroupRow, {className: "manager_window_list_button delete_hibernated_group", title: chrome.i18n.getMessage("manager_window_delete_icon")});
            DeleteGroupIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let hib_group = this.parentNode;
                    let HibernategGroupIndex = Array.from(hib_group.parentNode.children).indexOf(hib_group);
                    chrome.storage.local.get(null, function(storage) {
                        let hibernated_groups = storage.hibernated_groups;
                        hibernated_groups.splice(HibernategGroupIndex, 1);
                        chrome.storage.local.set({hibernated_groups: hibernated_groups});
                        hib_group.parentNode.removeChild(hib_group);
                        TT.DOM.RefreshGUI();
                    });
                }
            }
            let ExportGroupIcon = TT.DOM.New("div", HibernatedGroupRow, {className: "manager_window_list_button export_hibernated_group", title: chrome.i18n.getMessage("manager_window_savetofile_icon")});
            ExportGroupIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
                    chrome.storage.local.get(null, function(storage) {
                        let filename = storage.hibernated_groups[HibernategGroupIndex].group.name == "" ? labels.noname_group : storage.hibernated_groups[HibernategGroupIndex].group.name;
                        TT.File.SaveFile(filename, "tt_group", storage.hibernated_groups[HibernategGroupIndex]);
                    });
                }
            }
            let LoadGroupIcon = TT.DOM.New("div", HibernatedGroupRow, {className: "manager_window_list_button load_hibernated_group", title: chrome.i18n.getMessage("manager_window_load_icon")});
            LoadGroupIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let HibernategGroupIndex = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);
                    chrome.storage.local.get(null, function(storage) {
                        TT.Manager.RecreateGroup(storage.hibernated_groups[HibernategGroupIndex]);
                    });
                }
            }
            let name = TT.DOM.New("div", HibernatedGroupRow, {className: "manager_window_group_name text_input", contentEditable: true, textContent: hibernated_group.group.name});
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
            TT.DOM.New("div", HibernatedGroupRow, {className: "manager_window_group_name", textContent: " - (" + hibernated_group.tabs.length + ")"});
            TT.DOM.RefreshGUI();
        },
        AddSessionToManagerList: function(saved_session) {
            let SavedSessionRow = TT.DOM.New("li", D.getElementById("manager_window_sessions_list"), {className: "saved_session_row"});
            let DeleteSessionIcon = TT.DOM.New("div", SavedSessionRow, {className: "manager_window_list_button delete_saved_session", title: chrome.i18n.getMessage("manager_window_delete_icon")});
            DeleteSessionIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let saved_session = this.parentNode;
                    let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
                    chrome.storage.local.get(null, function(storage) {
                        let S_Sessions = storage.saved_sessions;
                        S_Sessions.splice(SessionIndex, 1);
                        chrome.storage.local.set({saved_sessions: S_Sessions});
                        saved_session.parentNode.removeChild(saved_session);
                        TT.DOM.RefreshGUI();
                    });
                }
            }
            let ExportSessionIcon = TT.DOM.New("div", SavedSessionRow, {className: "manager_window_list_button export_saved_session", title: chrome.i18n.getMessage("manager_window_savetofile_icon")});
            ExportSessionIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let saved_session = this.parentNode;
                    let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
                    chrome.storage.local.get(null, function(storage) {
                        let filename = storage.saved_sessions[SessionIndex].name == "" ? labels.noname_group : storage.saved_sessions[SessionIndex].name;
                        TT.File.SaveFile(filename, "tt_session", storage.saved_sessions[SessionIndex].session);
                    });
                }
            }
            let LoadSessionIcon = TT.DOM.New("div", SavedSessionRow, {className: "manager_window_list_button load_saved_session", title: chrome.i18n.getMessage("manager_window_load_icon")});
            LoadSessionIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let saved_session = this.parentNode;
                    let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
                    chrome.storage.local.get(null, function(storage) {
                        let S_Sessions = storage.saved_sessions;
                        TT.Manager.RecreateSession(S_Sessions[SessionIndex].session);
                    });
                }
            }
            let MergeSessionIcon = TT.DOM.New("div", SavedSessionRow, {className: "manager_window_list_button merge_saved_session", title: chrome.i18n.getMessage("manager_window_merge_icon")});
            MergeSessionIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let saved_session = this.parentNode;
                    let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
                    chrome.storage.local.get(null, function(storage) {
                        let S_Sessions = storage.saved_sessions;
                        TT.Manager.ImportMergeTabs(S_Sessions[SessionIndex].session);
                    });
                }
            }
            let name = TT.DOM.New("div", SavedSessionRow, {className: "manager_window_session_name", contentEditable: true, textContent: saved_session.name});
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
            TT.DOM.RefreshGUI();
        },
        ReAddSessionAutomaticToManagerList: function(storage) {
            let SessionsAutomaticList = D.getElementById("manager_window_autosessions_list");
            while (SessionsAutomaticList.hasChildNodes()) {
                SessionsAutomaticList.removeChild(SessionsAutomaticList.firstChild);
            }
            if (storage.saved_sessions_automatic != undefined) {
                (storage.saved_sessions_automatic).forEach(function(saved_sessions_automatic) {
                    TT.Manager.AddSessionAutomaticToManagerList(saved_sessions_automatic);
                });
            }
            TT.DOM.RefreshGUI();
        },
        AddSessionAutomaticToManagerList: function(saved_session) {
            let SavedSessionRow = TT.DOM.New("li", D.getElementById("manager_window_autosessions_list"), {className: "saved_session_row"});
            let LoadSessionIcon = TT.DOM.New("div", SavedSessionRow, {className: "manager_window_list_button load_saved_session", title: chrome.i18n.getMessage("manager_window_load_icon")});
            LoadSessionIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let saved_session = this.parentNode;
                    let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
                    chrome.storage.local.get(null, function(storage) {
                        let S_Sessions = storage.saved_sessions_automatic;
                        TT.Manager.RecreateSession(S_Sessions[SessionIndex].session);
                    });
                }
            }
            let MergeSessionIcon = TT.DOM.New("div", SavedSessionRow, {className: "manager_window_list_button merge_saved_session", title: chrome.i18n.getMessage("manager_window_merge_icon")});
            MergeSessionIcon.onmousedown = function(event) {
                if (event.which == 1) {
                    let saved_session = this.parentNode;
                    let SessionIndex = Array.from(saved_session.parentNode.children).indexOf(saved_session);
                    chrome.storage.local.get(null, function(storage) {
                        let S_Sessions = storage.saved_sessions_automatic;
                        TT.Manager.ImportMergeTabs(S_Sessions[SessionIndex].session);
                    });
                }
            }
            TT.DOM.New("div", SavedSessionRow, {className: "manager_window_session_name", textContent: saved_session.name});
            TT.DOM.RefreshGUI();
        },
        SetManagerEvents: function () {
            D.getElementById("manager_window_close").onmousedown = function(event) {
                if (event.which == 1) TT.DOM.HideRenameDialogs();
            }
            D.querySelectorAll(".manager_window_toolbar_button").forEach(function(s) {
                s.onmousedown = function(event) {
                    if (event.which == 1) {
                        D.querySelectorAll(".manager_window_panel").forEach(function(s) {
                            s.classList.remove("mw_pan_on");
                        });
                        D.getElementById((this.id).replace("button", "panel")).classList.add("mw_pan_on");
                        D.querySelectorAll(".mw_on").forEach(function(s) {
                            s.classList.remove("mw_on");
                        });
                        this.classList.add("mw_on");
                        TT.DOM.RefreshGUI();
                    }
                }
            });
            D.getElementById("manager_window_button_import_group").onmousedown = function(event) {
                if (event.which == 1) {
                    let inputFile = TT.File.ShowOpenFileDialog(".tt_group");
                    inputFile.onchange = function(event) {
                        TT.Manager.ImportGroup(false, true);
                    }
                }
            }
            D.getElementById("manager_window_button_hibernate_group").onmousedown = function(event) {
                if (event.which == 1) {
                    TT.Manager.ExportGroup(tt.active_group, false, true);
                    setTimeout(function() {TT.Groups.GroupRemove(tt.active_group, true);}, 100);
                    setTimeout(function() {TT.Manager.OpenManagerWindow();}, 150);
                }
            }
            D.getElementById("manager_window_button_save_current_session").onmousedown = function(event) {
                if (event.which == 1) {
                    let d = new Date();
                    TT.Manager.ExportSession((d.toLocaleString().replace(/\//g, ".").replace(/:/g, "꞉")), false, true, false);
                }
            }
            D.getElementById("manager_window_button_import_session").onmousedown = function(event) {
                if (event.which == 1) {
                    let inputFile = TT.File.ShowOpenFileDialog(".tt_session");
                    inputFile.onchange = function(event) {
                        TT.Manager.ImportSession(false, true, false);
                    }
                }
            }
            let autosessions_save_max_to_keep = D.getElementById("manager_window_autosessions_maximum_saves");
            autosessions_save_max_to_keep.value = opt.autosave_max_to_keep;
            autosessions_save_max_to_keep.oninput = function(event) {
                opt.autosave_max_to_keep = parseInt(this.value);
                TT.Preferences.SavePreferences(opt);
            }
            let autosessions_save_timer = D.getElementById("manager_window_autosessions_save_timer");
            autosessions_save_timer.value = opt.autosave_interval;
            autosessions_save_timer.oninput = function(event) {
                opt.autosave_interval = parseInt(this.value);
                TT.Preferences.SavePreferences(opt);
                clearInterval(tt.AutoSaveSession);
                TT.Manager.StartAutoSaveSession();
            }
        },
        ExportGroup: function(groupId, filename, save_to_manager) {
            let GroupToSave = {group: tt.groups[groupId], folders: {}, tabs: [], favicons: []};
            D.querySelectorAll("#" + groupId + " .folder").forEach(function(s) {
                if (tt.folders[s.id]) GroupToSave.folders[s.id] = tt.folders[s.id];
            });
            let Tabs = D.querySelectorAll("#" + groupId + " .tab");
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
                            if (filename) TT.File.SaveFile(filename, "tt_group", GroupToSave);
                            if (save_to_manager) TT.Manager.AddGroupToStorage(GroupToSave, true);
                            if (opt.debug) TT.Debug.log("f: ExportGroup, filename: " + filename + ", groupId: " + groupId + ", save_to_manager: " + save_to_manager);
                        }
                    });
                });
            } else {
                if (filename) TT.File.SaveFile(filename, "tt_group", GroupToSave);
                if (save_to_manager) TT.Manager.AddGroupToStorage(GroupToSave, true);
                if (opt.debug) TT.Debug.log("f: ExportGroup, filename: " + filename + ", groupId: " + groupId + ", save_to_manager: " + save_to_manager);
            }
        },
        ImportGroup: function(recreate_group, save_to_manager) {
            let file = D.getElementById("file_import");
            let fr = new FileReader();
            if (file.files[0] == undefined) return;
            fr.readAsText(file.files[0]);
            fr.onload = function() {
                let data = fr.result;
                let group = JSON.parse(data);
                file.parentNode.removeChild(file);
                if (recreate_group) TT.Manager.RecreateGroup(group);
                if (save_to_manager) TT.Manager.AddGroupToStorage(group, true);
                if (opt.debug) TT.Debug.log("f: ImportGroup, recreate_group: " + recreate_group + ", save_to_manager: " + save_to_manager);
            }
        },
        RecreateGroup: function(LoadedGroup) {
            if (opt.debug) TT.Debug.log("f: RecreateGroup");
            let RefFolders = {};
            let NewFolders = {};
            let RefTabs = {};
            let NewTabs = [];
            let NewGroupId = TT.Groups.AddNewGroup(LoadedGroup.group.name, LoadedGroup.group.font);
            for (var folder in LoadedGroup.folders) {
                let newId = TT.Folders.AddNewFolder({parent: NewGroupId, name: LoadedGroup.folders[folder].name, expand: LoadedGroup.folders[folder].expand});
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
                            let LastTab = D.getElementById(NewTabs[NewTabs.length - 1].id);
                            if (LastTab != null || GiveUp < 0) {
                                TT.Manager.RecreateTreeStructure({}, NewFolders, NewTabs);
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
                    if (add_to_manager) TT.Manager.AddGroupToManagerList(group);
                } else {
                    let hibernated_groups = storage["hibernated_groups"];
                    hibernated_groups.push(group);
                    chrome.storage.local.set({hibernated_groups: hibernated_groups});
                    if (add_to_manager) TT.Manager.AddGroupToManagerList(group);
                }
                if (opt.debug) TT.Debug.log("f: AddGroupToStorage, add_to_manager: " + add_to_manager);
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
                        if (save_to_file) TT.File.SaveFile(name, "tt_session", ExportWindows);
                        if (save_to_manager) TT.Manager.AddSessionToStorage(ExportWindows, name, true);
                        if (save_to_autosave_manager) TT.Manager.AddAutosaveSessionToStorage(ExportWindows, name);
                    });
                });
            });
        },
        ImportSession: function(recreate_session, save_to_manager, merge_session) {
            let file = D.getElementById("file_import");
            let fr = new FileReader();
            if (file.files[0] == undefined) return;
            fr.readAsText(file.files[file.files.length - 1]);
            fr.onload = function() {
                let data = fr.result;
                file.parentNode.removeChild(file);
                let LoadedSession = JSON.parse(data);
                if (recreate_session) TT.Manager.RecreateSession(LoadedSession);
                if (merge_session) TT.Manager.ImportMergeTabs(LoadedSession);
                if (save_to_manager) TT.Manager.AddSessionToStorage(LoadedSession, (file.files[file.files.length - 1].name).replace(".tt_session", ""), true);
            }
        },
        AddSessionToStorage: function(session, name, add_to_manager) {
            chrome.storage.local.get(null, function(storage) {
                if (storage.saved_sessions == undefined) {
                    let saved_sessions = [];
                    saved_sessions.push({name: name, session: session});
                    chrome.storage.local.set({saved_sessions: saved_sessions});
                    if (add_to_manager) TT.Manager.AddSessionToManagerList(saved_sessions[saved_sessions.length - 1]);
                } else {
                    let saved_sessions = storage.saved_sessions;
                    saved_sessions.push({name: name, session: session});
                    chrome.storage.local.set({saved_sessions: saved_sessions});
                    if (add_to_manager) TT.Manager.AddSessionToManagerList(saved_sessions[saved_sessions.length - 1]);
                }
                if (opt.debug) TT.Debug.log("f: AddSessionToStorage, name: " + name + ", add_to_manager: " + add_to_manager);
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
                    if (s[opt.autosave_max_to_keep]) s.splice(opt.autosave_max_to_keep, (s.length - opt.autosave_max_to_keep));
                    chrome.storage.local.set({saved_sessions_automatic: s});
                }
                if (opt.debug) TT.Debug.log("f: AddAutosaveSessionToStorage, name: " + name);
            });
        },
        RecreateSession: function(LoadedWindows) {
            if (opt.debug) TT.Debug.log("f: RecreateSession");
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
        },
        ImportMergeTabs: function(LoadedWindows) {
            if (opt.debug) TT.Debug.log("f: ImportMergeTabs");
            let RefTabs = {};
            for (let LWI = 0; LWI < LoadedWindows.length; LWI++) { // clear previous window ids
                LoadedWindows[LWI].id = "";
            }
            TT.Manager.ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_loaded_tree_structure")});
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
                            if (opt.debug) TT.Debug.log("f: ImportMergeTabs, tabsMatch: " + tabsMatch);
                            if (tabsMatch > LoadedWindows[LWI].tabs.length * 0.6) {
                                LoadedWindows[LWI].id = cw[CWI].id;
                                break;
                            }
                        }
                    }
                }
                LoadedWindows.forEach(function(w) {
                    if (w.id == "") { // missing window, lets make one
                        if (opt.debug) TT.Debug.log("f: ImportMergeTabs, missing window");
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
                                if (w.id == tt.CurrentWindowId) TT.Manager.RecreateTreeStructure(w.groups, w.folders, []);
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
                                    //         TT.Manager.ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_finding_ref_tabs")});
                                    //         for (let tInd = 0; tInd < NewTabs.length; tInd++) {
                                    //             if (RefTabs[NewTabs[tInd].parent] != undefined) {
                                    //                 NewTabs[tInd].parent = RefTabs[NewTabs[tInd].parent];
                                    //             }
                                    //         }
                                    //     }, 1000);
                                    // }
                                });
                                setTimeout(function() {
                                    TT.Manager.ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_finding_ref_tabs")});
                                    for (let tInd = 0; tInd < NewTabs.length; tInd++) {
                                        if (RefTabs[NewTabs[tInd].parent] != undefined) NewTabs[tInd].parent = RefTabs[NewTabs[tInd].parent];
                                    }
                                }, 2000);
                                setTimeout(function() {
                                    for (let tInd = 0; tInd < NewTabs.length; tInd++) {
                                        chrome.runtime.sendMessage({command: "update_tab", tabId: NewTabs[tInd].id, tab: {index: NewTabs[tInd].index, expand: NewTabs[tInd].expand, parent: NewTabs[tInd].parent}});
                                    }
                                    TT.Manager.ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_finding_other_windows")});
                                    if (w.id == tt.CurrentWindowId) {
                                        TT.Manager.RecreateTreeStructure(w.groups, w.folders, NewTabs);
                                    } else {
                                        chrome.runtime.sendMessage({command: "remote_update", groups: w.groups, folders: w.folders, tabs: NewTabs, windowId: w.id});
                                    }
                                    TT.Manager.ShowStatusBar({show: true, spinner: false, message: chrome.i18n.getMessage("status_bar_all_done"), hideTimeout: 2000});
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
                    if (opt.debug) TT.Debug.log("f: AutoSaveSession, loop time is: " + opt.autosave_interval);
                    let d = new Date();
                    let newName = d.toLocaleString().replace(/\//g, ".").replace(/:/g, "꞉");
                    TT.Manager.ExportSession(newName, false, false, true);
                    TT.Manager.ShowStatusBar({show: true, spinner: false, message: chrome.i18n.getMessage("status_bar_autosave") + newName, hideTimeout: 1500});
                    if (D.getElementById("manager_window").style.top != "-500px") chrome.storage.local.get(null, function(storage) {TT.Manager.ReAddSessionAutomaticToManagerList(storage);});
                }, opt.autosave_interval * 60000);
            }
        },
        RecreateTreeStructure: function(groups, folders, tabs) { // groups and folders are in object, just like tt.groups and tt.folders, but tabs are in array of treetabs objects
            if (opt.debug) TT.Debug.log("f: RecreateTreeStructure");
            TT.Manager.ShowStatusBar({show: true, spinner: true, message: chrome.i18n.getMessage("status_bar_quick_check_recreate_structure"), hideTimeout: 3000});
            if (groups && Object.keys(groups).length > 0) {
                for (var group in groups) {
                    tt.groups[groups[group].id] = Object.assign({}, groups[group]);
                }
                TT.Groups.AppendGroups(tt.groups);
            }
            if (folders && Object.keys(folders).length > 0) {
                for (var folder in folders) {
                    tt.folders[folders[folder].id] = Object.assign({}, folders[folder]);
                }
                TT.Folders.PreAppendFolders(tt.folders);
                TT.Folders.AppendFolders(tt.folders);
            }
            let ttTabs = {};
            tabs.forEach(function(Tab) {
                if (Tab.parent == "pin_list") chrome.tabs.update(Tab.id, {pinned: true});
                if (Tab.parent != "") {
                    let AttemptNr = 20;
                    var Attempt = setInterval(function() {
                        AttemptNr--;
                        let tb = D.getElementById(Tab.id);
                        let tbp = D.getElementById("°" + Tab.parent);
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
                    TT.Tabs.RearrangeTree(ttTabs, folders, false);
                    clearInterval(SortAttempt);
                    TT.Groups.UpdateBgGroupsOrder();
                    setTimeout(function() {
                        TT.DOM.RefreshExpandStates();
                        TT.DOM.RefreshCounters();
                        tt.schedule_update_data++;
                        TT.Folders.SaveFolders();
                    }, 3000);
               }
            }, 500);
        },
        ShowStatusBar: function(p) { // show, spinner, message
            let status_bar = D.getElementById("status_bar");
            let busy_spinner = D.getElementById("busy_spinner");
            let status_message = D.getElementById("status_message");
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
                let SeparatorDIV = TT.DOM.New("div", tt.DOMmenu, {id: MenuItem[0], className: "separator"});
                let MenuLI = TT.DOM.New("li", tt.DOMmenu, {id: MenuItem[1], className: "menu_item"});
                this.id = MenuLI.id;
                this.Menu = MenuLI;
                this.Separator = SeparatorDIV;
                if (this.id == "menu_new_pin") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("pin")) {
                                TT.Tabs.OpenNewTab(true, tt.menuItemNode.id);
                            } else {
                                TT.Tabs.OpenNewTab(true, undefined);
                            }
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_new_tab") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("folder")) {
                                TT.Tabs.OpenNewTab(false, tt.menuItemNode.id);
                            } else {
                                if (tt.menuItemNode.classList.contains("pin")) {
                                    TT.Tabs.OpenNewTab(true, tt.menuItemNode.id);
                                } else {
                                    if (tt.menuItemNode.classList.contains("tab")) {
                                        TT.Tabs.OpenNewTab(false, tt.menuItemNode.id);
                                    } else {
                                        TT.Tabs.OpenNewTab(false, tt.active_group);
                                    }
                                }
                            }
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_unpin_tab" || this.id == "menu_pin_tab") {
                    this.Menu.onmousedown = function(event) {
                        event.stopPropagation();
                        if (event.which == 1) {
                            if (tt.menuItemNode.classList.contains("selected")) {
                                D.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {pinned: (tt.menuItemNode.classList.contains("tab"))});
                                });
                            } else {
                                chrome.tabs.update(parseInt(tt.menuItemNode.id), {pinned: (tt.menuItemNode.classList.contains("tab"))});
                            }
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_duplicate_tab") {
                    this.Menu.onmousedown = function(event) {
                        event.stopPropagation();
                        if (event.which == 1) {
                            if (tt.menuItemNode.classList.contains("selected")) {
                                D.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                                    tt.tabs[s.id].DuplicateTab();
                                });
                            } else {
                                tt.tabs[tt.menuItemNode.id].DuplicateTab();
                            }
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_detach_tab") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TT.DOM.FreezeSelection(false);
                            let Nodes = [];
                            let NodesTypes = {DraggingPin: false, DraggingTab: false, DraggingFolder: false};
                            let query;
                            if (tt.menuItemNode.classList.contains("selected")) {
                                query = D.querySelectorAll(".selected, .selected .tab, .selected .folder");
                            } else {
                                query = D.querySelectorAll("[id='"+  tt.menuItemNode.id + "'], [id='"+  tt.menuItemNode.id + "'] .tab, [id='"+  tt.menuItemNode.id + "'] .folder");
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
                            TT.Tabs.Detach(Nodes, NodesTypes, {});
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_reload_tab") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("selected")) {
                                D.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                                    chrome.tabs.reload(parseInt(s.id));
                                });
                            } else {
                                chrome.tabs.reload(parseInt(tt.menuItemNode.id));
                            }
                            TT.Menu.HideMenus();
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
                                    D.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                                        tabsArr.push(parseInt(s.id));
                                        if (s.childNodes[2].childNodes.length > 0) {
                                            D.querySelectorAll("#" + s.childNodes[2].id + " .tab").forEach(function(t) {
                                                tabsArr.push(parseInt(t.id));
                                            });
                                        }
                                    });
                                    TT.Tabs.DiscardTabs(tabsArr);
                                } else {
                                    TT.Tabs.DiscardTabs([parseInt(tt.menuItemNode.id)]);
                                }
                            }
                            if (tt.menuItemNode.classList.contains("folder")) {
                                let tabsArr = [];
                                D.querySelectorAll("#" + tt.menuItemNode.id + " .tab").forEach(function(s) {
                                    tabsArr.push(parseInt(s.id));
                                });
                                TT.Tabs.DiscardTabs(tabsArr);
                            }
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_close") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("selected")) {
                                let tabsArr = [];
                                D.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                                    tabsArr.push(parseInt(s.id));
                                    if (s.childNodes[2].childNodes.length > 0) {
                                        D.querySelectorAll("#" + s.childNodes[2].id + " .tab").forEach(function(t) {
                                            tabsArr.push(parseInt(t.id));
                                        });
                                    }
                                });
                                TT.Tabs.CloseTabs(tabsArr);
                            } else {
                                TT.Tabs.CloseTabs([parseInt(tt.menuItemNode.id)]);
                            }
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_mute_tab") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("pin") || tt.menuItemNode.classList.contains("tab")) {
                                if (tt.menuItemNode.classList.contains("selected")) {
                                    D.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                                        chrome.tabs.update(parseInt(s.id), {muted: true});
                                    });
                                } else {
                                    chrome.tabs.update(parseInt(tt.menuItemNode.id), {muted: true});
                                }
                            }
                            if (tt.menuItemNode.classList.contains("folder")) {
                                D.querySelectorAll("#" + tt.menuItemNode.id + " .tab").forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {muted: true});
                                });
                            }
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_mute_tree") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            D.querySelectorAll("[id='" + tt.menuItemNode.id + "'], [id='" + tt.menuItemNode.id + "'] .tab").forEach(function(s) {
                                chrome.tabs.update(parseInt(s.id), {muted: true});
                            });
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_unmute_tab") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("pin") || tt.menuItemNode.classList.contains("tab")) {
                                if (tt.menuItemNode.classList.contains("selected")) {
                                    D.querySelectorAll(".pin.selected, #" + tt.active_group + " .selected").forEach(function(s) {
                                        chrome.tabs.update(parseInt(s.id), {muted: false});
                                    });
                                } else {
                                    chrome.tabs.update(parseInt(tt.menuItemNode.id), {muted: false});
                                }
                            }
                            if (tt.menuItemNode.classList.contains("folder")) {
                                D.querySelectorAll("#" + tt.menuItemNode.id + " .tab").forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {muted: false});
                                });
                            }
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_unmute_tree") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            D.querySelectorAll("[id='" + tt.menuItemNode.id + "'], [id='" + tt.menuItemNode.id + "'] .tab").forEach(function(s) {
                                chrome.tabs.update(parseInt(s.id), {muted: false});
                            });
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_mute_other") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("selected")) {
                                D.querySelectorAll(".pin:not(.selected), #" + tt.active_group + " .tab:not(.selected)").forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {muted: true});
                                });
                            } else {
                                D.querySelectorAll(".pin:not([id='" + tt.menuItemNode.id + "']), #" + tt.active_group + " .tab:not([id='" + tt.menuItemNode.id + "'])").forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {muted: true});
                                });
                            }
        
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_unmute_other") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("selected")) {
                                D.querySelectorAll(".pin:not(.selected), #" + tt.active_group + " .tab:not(.selected)").forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {muted: false});
                                });
                            } else {
                                D.querySelectorAll(".pin:not([id='" + tt.menuItemNode.id + "']), #" + tt.active_group + " .tab:not([id='" + tt.menuItemNode.id + "'])").forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {muted: false});
                                });
                            }
                            TT.Menu.HideMenus();
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
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_new_folder") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("tab")) {
                                let FolderId = TT.Folders.AddNewFolder({ParentId: tt.menuItemNode.parentNode.parentNode.id, InsertAfterId: tt.menuItemNode.id});
                                TT.Folders.ShowRenameFolderDialog(FolderId);
                            } else {
                                if (tt.menuItemNode.classList.contains("folder")) {
                                    let FolderId = TT.Folders.AddNewFolder({ParentId: tt.menuItemNode.id});
                                    TT.Folders.ShowRenameFolderDialog(FolderId);
                                } else {
                                    let FolderId = TT.Folders.AddNewFolder({});
                                    TT.Folders.ShowRenameFolderDialog(FolderId);
                                }
                            }
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_expand_tree") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            D.querySelectorAll("[id='" + tt.menuItemNode.id + "'], [id='" + tt.menuItemNode.id + "'] .folder.c, [id='" + tt.menuItemNode.id + "'] .tab.c").forEach(function(s) {
                                TT.DOM.SetClasses(s, ["o"], ["c"], []);
                            });
                            tt.schedule_update_data++;
                            TT.Menu.HideMenus();
                            TT.Folders.SaveFolders();
                        }
                    }
                }
                if (this.id == "menu_collapse_tree") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            D.querySelectorAll("[id='" + tt.menuItemNode.id + "'], [id='" + tt.menuItemNode.id + "'] .folder.c, [id='" + tt.menuItemNode.id + "'] .tab.c").forEach(function(s) {
                                TT.DOM.SetClasses(s, ["c"], ["o"], []);
                            });
                            tt.schedule_update_data++;
                            TT.Menu.HideMenus();
                            TT.Folders.SaveFolders();
                        }
                    }
                }
                if (this.id == "menu_expand_all") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            D.querySelectorAll("#" + tt.active_group + " .folder.c, #" + tt.active_group + " .tab.c").forEach(function(s) {
                                TT.DOM.SetClasses(s, ["o"], ["c"], []);
                            });
                            tt.schedule_update_data++;
                            TT.Menu.HideMenus();
                            TT.Folders.SaveFolders();
                        }
                    }
                }
                if (this.id == "menu_collapse_all") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            D.querySelectorAll("#" + tt.active_group + " .folder.o, #" + tt.active_group + " .tab.o").forEach(function(s) {
                                TT.DOM.SetClasses(s, ["c"], ["o"], []);
                            });
                            tt.schedule_update_data++;
                            TT.Menu.HideMenus();
                            TT.Folders.SaveFolders();
                        }
                    }
                }
                if (this.id == "menu_close_tree") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
        
                            let tabsArr = [];
                            D.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab, [id='" + tt.menuItemNode.id + "']").forEach(function(s) {
                                tabsArr.push(parseInt(s.id));
                                if (s.childNodes[2].childNodes.length > 0) {
                                    D.querySelectorAll("#" + s.childNodes[2].id + " .tab").forEach(function(t) {
                                        tabsArr.push(parseInt(t.id));
                                    });
                                }
                            });
                            TT.Tabs.CloseTabs(tabsArr);
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_rename_folder") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TT.Folders.ShowRenameFolderDialog(tt.menuItemNode.id);
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_delete_folder") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            if (tt.menuItemNode.classList.contains("selected")) {
                                D.querySelectorAll("#" + tt.menuItemNode.id + "  .selected, #" + tt.menuItemNode.id).forEach(function(s) {
                                    TT.Folders.RemoveFolder(s.id);
                                });
                            } else {
                                TT.Folders.RemoveFolder(tt.menuItemNode.id);
                            }
                            TT.Menu.HideMenus();
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
                                if (tt.menuItemNode.classList.contains("pin")) query = ".pin:not(.selected)";
                                if (tt.menuItemNode.classList.contains("tab")) query = "#" + tt.active_group + " .tab:not(.selected)";
                                // D.querySelectorAll(".pin:not(.selected), #"+tt.active_group+" .tab:not(.selected)").forEach(function(s) {
                                D.querySelectorAll(query).forEach(function(s) {
                                    let children = D.querySelectorAll("[id='" + s.id + "'] .selected");
                                    if (children.length == 0 || opt.promote_children) tabsArr.push(parseInt(s.id));
                                });
                                TT.Tabs.CloseTabs(tabsArr);
                            } else {
                                if (tt.menuItemNode.classList.contains("pin")) query = ".pin:not([id='" + tt.menuItemNode.id + "'])";
                                if (tt.menuItemNode.classList.contains("tab")) {
                                    query = "#°" + tt.active_group + " .tab:not([id='" + tt.menuItemNode.id + "'])";
                                    D.getElementById("°" + tt.active_group).appendChild(tt.menuItemNode);
                                }
                                D.querySelectorAll(query).forEach(function(s) {
                                    tabsArr.push(parseInt(s.id));
                                });
                                TT.Tabs.CloseTabs(tabsArr);
                            }
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_bookmark_tree") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TT.Utils.Bookmark(tt.menuItemNode);
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_rename_group") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TT.Groups.ShowGroupEditWindow(tt.menuItemNode.id);
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_delete_group") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TT.Groups.GroupRemove(tt.menuItemNode.id, false);
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_delete_group_tabs_close") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TT.Groups.GroupRemove(tt.menuItemNode.id, true);
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_groups_unload") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            let tabsArr = [];
                            D.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab").forEach(function(s) {
                                tabsArr.push(parseInt(s.id));
                            });
                            TT.Tabs.DiscardTabs(tabsArr);
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_group_tabs_close") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            let tabsArr = [];
                            D.querySelectorAll("[id='" + tt.menuItemNode.id + "'] .tab").forEach(function(s) {
                                tabsArr.push(parseInt(s.id));
                            });
                            TT.Tabs.CloseTabs(tabsArr);
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_manager_window") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TT.Manager.OpenManagerWindow();
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_groups_hibernate") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TT.Manager.ExportGroup(tt.menuItemNode.id, false, true);
                            TT.Menu.HideMenus();
                            setTimeout(function() {TT.Groups.GroupRemove(tt.menuItemNode.id, true);}, 100);
                        }
                    }
                }
                if (this.id == "menu_bookmark_group") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            Bookmark(tt.menuItemNode);
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_new_group") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            TT.Groups.AddNewGroup();
                            TT.Menu.HideMenus();
                        }
                    }
                }
                if (this.id == "menu_treetabs_settings") {
                    this.Menu.onmousedown = function(event) {
                        if (event.which == 1) {
                            event.stopPropagation();
                            chrome.tabs.create({"url": "options/options.html"});
                            TT.Menu.HideMenus();
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
            TT.DOM.SetStyle(tt.menu[DefaultMenu.all_entries[0][1]].Menu.parentNode, {display: "none", top: "-1000px", left: "-1000px"});
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
            let x = event.pageX >= (D.body.clientWidth - tt.DOMmenu.getBoundingClientRect().width - 5) ? (D.body.clientWidth - tt.DOMmenu.getBoundingClientRect().width - 5) : (event.pageX - 5);
            let y = event.pageY >= (D.body.clientHeight - tt.DOMmenu.getBoundingClientRect().height - 16) ? (D.body.clientHeight - tt.DOMmenu.getBoundingClientRect().height - 16) : (event.pageY - 16);
            TT.DOM.SetStyle(tt.DOMmenu, {display: "block", top: y + "px", left: x + "px"});
        },
        ShowTabMenu: function(TabNode, event) {
            tt.menuItemNode = TabNode;
            if (TabNode.classList.contains("pin")) {
                TT.Menu.ShowMenu(DefaultMenu.pin, event);
                if (opt.allow_pin_close) tt.menu["menu_close"].MenuShow();
            }
            if (TabNode.classList.contains("tab")) {
                TT.Menu.ShowMenu(DefaultMenu.tab, event);
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
            if (!TabNode.classList.contains("discarded")) tt.menu["menu_unload"].MenuShow();
        },
        ShowFolderMenu: function(FolderNode, event) {
            tt.menuItemNode = FolderNode;
            TT.Menu.ShowMenu(DefaultMenu.folder, event);
            if (FolderNode.classList.contains("o")) tt.menu["menu_collapse_tree"].MenuShow();
            if (FolderNode.classList.contains("c")) tt.menu["menu_expand_tree"].MenuShow();
            if (D.querySelectorAll("#" + FolderNode.id + " .tab").length == 0) {
                tt.menu["menu_detach_tab"].SeparatorShow();
                tt.menu["menu_detach_tab"].MenuShow();
            }
        },
        ShowFGlobalMenu: function(event) {
            tt.menuItemNode = event.target;
            TT.Menu.ShowMenu(DefaultMenu.global, event);
        },
        ShowFGroupMenu: function(GroupNode, event) {
            tt.menuItemNode = GroupNode;
            TT.Menu.ShowMenu(DefaultMenu.group, event);
            if (tt.menuItemNode.id == "tab_list") {
                tt.menu["menu_groups_hibernate"].MenuHide();
                tt.menu["menu_rename_group"].MenuHide();
                tt.menu["menu_delete_group"].MenuHide();
                tt.menu["menu_delete_group_tabs_close"].MenuHide();
            }
        },
        CreateMenu: function() {
            tt.DOMmenu = D.getElementById("main_menu");
            DefaultMenu.all_entries.forEach(function(MenuItem) {
                tt.menu[MenuItem[1]] = new TT.Menu.ttMenu(MenuItem);
            });
        }
    },
    Toolbar: {
        RestoreToolbarSearchFilter: function() { // RESTORE LAST USED SEARCH TYPE (URL OR TITLE) IN TOOLBAR SEARCH
            chrome.runtime.sendMessage({command: "get_search_filter", windowId: tt.CurrentWindowId}, function(response) {
                if (response == "url") {
                    TT.DOM.SetClasses(D.getElementById("button_filter_type"), ["url"], ["title"], []);
                } else {
                    TT.DOM.SetClasses(D.getElementById("button_filter_type"), ["title"], ["url"], []);
                }
            });
        },
        RestoreToolbarShelf: function() { // RESTORE LAST ACTIVE SHELF (SEARCH, TOOLS, GROUPS, SESSION OR FOLDER) IN TOOLBAR
            chrome.runtime.sendMessage({command: "get_active_shelf", windowId: tt.CurrentWindowId}, function(response) {
                let filterBox = D.getElementById("filter_box");
                filterBox.setAttribute("placeholder", labels.searchbox);
                filterBox.style.opacity = "1";
                D.querySelectorAll(".on").forEach(function(s) {
                    s.classList.remove("on");
                });
                D.querySelectorAll(".toolbar_shelf").forEach(function(s) {
                    s.classList.add("hidden");
                });
                if (response == "search" && D.getElementById("button_search") != null) {
                    D.getElementById("toolbar_search").classList.remove("hidden");
                    D.getElementById("button_search").classList.add("on");
                }
                if (response == "tools" && D.getElementById("button_tools") != null) {
                    D.getElementById("toolbar_shelf_tools").classList.remove("hidden");
                    D.getElementById("button_tools").classList.add("on");
                }
                if (response == "groups" && D.getElementById("button_groups") != null) {
                    D.getElementById("toolbar_shelf_groups").classList.remove("hidden");
                    D.getElementById("button_groups").classList.add("on");
                }
                if (response == "backup" && D.getElementById("button_backup") != null) {
                    D.getElementById("toolbar_shelf_backup").classList.remove("hidden");
                    D.getElementById("button_backup").classList.add("on");
                }
                if (response == "folders" && D.getElementById("button_folders") != null) {
                    D.getElementById("toolbar_shelf_folders").classList.remove("hidden");
                    D.getElementById("button_folders").classList.add("on");
                }
                if (browserId != "F") {
                    chrome.storage.local.get(null, function(storage) {
                        let bak1 = storage["windows_BAK1"] ? storage["windows_BAK1"] : [];
                        let bak2 = storage["windows_BAK2"] ? storage["windows_BAK2"] : [];
                        let bak3 = storage["windows_BAK3"] ? storage["windows_BAK3"] : [];
                        if (bak1.length && D.getElementById("#button_load_bak1") != null) {
                            D.getElementById("button_load_bak1").classList.remove("disabled");
                        } else {
                            D.getElementById("button_load_bak1").classList.add("disabled");
                        }
                        if (bak2.length && D.getElementById("#button_load_bak2") != null) {
                            D.getElementById("button_load_bak2").classList.remove("disabled");
                        } else {
                            D.getElementById("button_load_bak2").classList.add("disabled");
                        }
                        if (bak3.length && D.getElementById("#button_load_bak3") != null) {
                            D.getElementById("button_load_bak3").classList.remove("disabled");
                        } else {
                            D.getElementById("button_load_bak3").classList.add("disabled");
                        }
                    });
                }
                TT.DOM.RefreshGUI();
            });
        },
        ShelfToggle: function(mousebutton, button, toolbarId, SendMessage, SidebarRefreshGUI, OptionsRefreshGUI) { // FUNCTION TO TOGGLE SHELFS AND SAVE IT
            if (mousebutton == 1) {
                if (button.classList.contains("on")) {
                    D.querySelectorAll(".on").forEach(function(s) {
                        s.classList.remove("on");
                    });
                    D.querySelectorAll(".toolbar_shelf").forEach(function(s) {
                        s.classList.add("hidden");
                    });
                    chrome.runtime.sendMessage({command: "set_active_shelf", active_shelf: "", windowId: tt.CurrentWindowId});
                } else {
                    D.querySelectorAll(".toolbar_shelf:not(#" + toolbarId + ")").forEach(function(s) {
                        s.classList.add("hidden");
                    });
                    D.getElementById(toolbarId).classList.remove("hidden");
                    chrome.runtime.sendMessage({command: "set_active_shelf", active_shelf: SendMessage, windowId: tt.CurrentWindowId});
                    D.querySelectorAll(".on:not(#" + button.id + ")").forEach(function(s) {
                        s.classList.remove("on");
                    });
                    button.classList.add("on");
                }
                if (SidebarRefreshGUI) TT.DOM.RefreshGUI();
                if (OptionsRefreshGUI) RefreshGUI();
            }
        },
        RemoveToolbar: function() {
            let toolbar = D.getElementById("toolbar");
            while (toolbar.hasChildNodes()) {
                toolbar.removeChild(toolbar.firstChild);
            }
        },
        RecreateToolbar: function(NewToolbar) {
            let toolbar = D.getElementById("toolbar");
            for (var shelf in NewToolbar) {
                let NewShelf = TT.DOM.New("div", toolbar, {id: shelf, className: "toolbar_shelf"});
                NewToolbar[shelf].forEach(function(button) {
                    let Newbutton = TT.DOM.New("div", NewShelf, {id: button, className: "button"});
                    TT.DOM.New("div", Newbutton, {className: "button_img"});
                });
            }
            let toolbar_main = D.getElementById("toolbar_main");
            let SearchShelf = D.getElementById("toolbar_search");
            if (toolbar_main != null && SearchShelf != null) {
                toolbar_main.classList.remove("toolbar_shelf");
                let SearchBox = TT.DOM.New("div", SearchShelf, {id: "toolbar_search_input_box"});
                TT.DOM.New("input", SearchBox, {id: "filter_box", className: "text_input", type: "text", placeholder: labels.searchbox});
                TT.DOM.New("div", SearchBox, {id: "button_filter_clear", type: "reset"}, {opacity: "0", position: "absolute"});
                let SearchButtons = TT.DOM.New("div", SearchShelf, {id: "toolbar_search_buttons"});
                TT.DOM.AppendToNode(D.getElementById("button_filter_type"), SearchButtons);
                TT.DOM.AppendToNode(D.getElementById("filter_search_go_prev"), SearchButtons);
                TT.DOM.AppendToNode(D.getElementById("filter_search_go_next"), SearchButtons);
                TT.DOM.Loadi18n();
            }
        },
        RecreateToolbarUnusedButtons: function(buttonsIds) { // OPTIONS PAGE
            let unused_buttons = D.getElementById("toolbar_unused_buttons");
            buttonsIds.forEach(function(button) {
                let Newbutton = TT.DOM.New("div", unused_buttons, {id: button, className: "button"});
                TT.DOM.New("div", Newbutton, {className: "button_img"});
            });
        },
        SaveToolbar: function() { // OPTIONS PAGE
            let unused_buttons = [];
            let toolbar = {};
            let u = D.querySelectorAll("#toolbar_unused_buttons .button");
            u.forEach(function(b) {
                unused_buttons.push(b.id);
            });
            let t = D.getElementById("toolbar");
            t.childNodes.forEach(function(s) {
                toolbar[s.id] = [];
                let t = D.querySelectorAll("#" + s.id + " .button").forEach(function(b) {
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
        
            let ClearSearch = D.getElementById("button_filter_clear");
            let FilterBox = D.getElementById("filter_box");
        
            if (ClearSearch != null && FilterBox != null) {
                if (CleanPreviousBindings) {
                    FilterBox.removeEventListener("oninput", function() {});
                    ClearSearch.removeEventListener("onmousedown", function() {});
                }
                if (BindButtons) {
                    // FILTER ON INPUT
                    FilterBox.oninput = function(event) {
                        TT.Tabs.FindTab(this.value);
                    }
                    // CLEAR FILTER BUTTON
                    ClearSearch.onmousedown = function(event) {
                        if (event.which == 1) {
                            this.style.opacity = "0";
                            this.setAttribute("title", "");
                            TT.Tabs.FindTab("");
                        }
                    }
                }
            }
        
            D.querySelectorAll(".button").forEach(function(s) {
                if (CleanPreviousBindings) {
                    s.removeEventListener("onmousedown", function() {});
                    s.removeEventListener("onclick", function() {});
                    s.removeEventListener("click", function() {});
                }
                if (BindToolbarShelfToggleButtons) {
                    if (s.id == "button_search") {
                        s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                            if (event.which == 1) TT.Toolbar.ShelfToggle(event.which, this, "toolbar_search", "search", SidebarRefreshGUI, OptionsRefreshGUI);
                        });
                    }
                    if (s.id == "button_tools") {
                        s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                            if (event.which == 1) TT.Toolbar.ShelfToggle(event.which, this, "toolbar_shelf_tools", "tools", SidebarRefreshGUI, OptionsRefreshGUI);
                        });
                    }
                    if (s.id == "button_groups") {
                        s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                            if (event.which == 1) TT.Toolbar.ShelfToggle(event.which, this, "toolbar_shelf_groups", "groups", SidebarRefreshGUI, OptionsRefreshGUI);
                        });
                    }
                    if (s.id == "button_backup") {
                        s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                            if (event.which == 1) TT.Toolbar.ShelfToggle(event.which, this, "toolbar_shelf_backup", "backup", SidebarRefreshGUI, OptionsRefreshGUI);
                        });
                    }
                    if (s.id == "button_folders") {
                        s.addEventListener(ToolbarShelfToggleClickType, function(event) {
                            if (event.which == 1) TT.Toolbar.ShelfToggle(event.which, this, "toolbar_shelf_folders", "folders", SidebarRefreshGUI, OptionsRefreshGUI);
                        });
                    }
                }
                if (BindButtons) {
                    if (s.id == "button_new") { // NEW TAB
                        s.onclick = function(event) {
                            if (event.which == 1) {
                                if (opt.append_tab_from_toolbar == "group_root") TT.Tabs.OpenNewTab(false, tt.active_group);
                                if (opt.append_tab_from_toolbar == "as_regular_orphan") TT.Tabs.OpenNewTab(false, (D.querySelectorAll("#" + tt.active_group + " .tab").length == 0 ? tt.active_group : undefined));
                            }
                        }
                        s.onmousedown = function(event) {
                            if (event.which == 2) { // DUPLICATE TAB
                                event.preventDefault();
                                let activeTab = D.querySelector("#" + tt.active_group + " .active_tab") != null ? D.querySelector("#" + tt.active_group + " .active_tab") : D.querySelector(".pin.active_tab") != null ? D.querySelector(".pin.active_tab") : null;
                                if (activeTab != null && tt.tabs[activeTab.id]) tt.tabs[activeTab.id].DuplicateTab();
                            }
                            if (event.which == 3) { // SCROLL TO TAB
                                chrome.tabs.query({currentWindow: true, active: true}, function(activeTab) {
                                    if (activeTab[0].pinned && opt.pin_list_multi_row == false && tt.tabs[activeTab[0].id]) tt.tabs[activeTab[0].id].ScrollToTab();
                                    if (activeTab[0].pinned == false) {
                                        let Tab = D.getElementById(activeTab[0].id);
                                        let groupId = TT.DOM.GetParentsByClass(Tab, "group")[0].id;
                                        TT.Groups.SetActiveGroup(groupId, true, true);
                                    }
                                });
                            }
                        }
                    }
                    if (s.id == "button_pin") { // PIN TAB
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let Tabs = D.querySelectorAll(".pin.active_tab, .pin.selected, #" + tt.active_group + " .active_tab, #" + tt.active_group + " .selected");
                                Tabs.forEach(function(s) {
                                    chrome.tabs.update(parseInt(s.id), {pinned: Tabs[0].classList.contains("tab")});
                                })
                            }
                        }
                    }
                    if (s.id == "button_options") { // VERTICAL TABS OPTIONS
                        s.onmousedown = function(event) {
                            if (event.which == 1) chrome.tabs.create({url: "options/options.html"});
                        }
                    }
                    if (s.id == "button_undo") { // UNDO CLOSE
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                chrome.sessions.getRecentlyClosed(null, function(sessions) {
                                    if (sessions.length > 0) chrome.sessions.restore(null, function(restored) {});
                                });
                            }
                        }
                    }
                    if (s.id == "button_detach" || s.id == "button_move") { // MOVE TAB TO NEW WINDOW (DETACH), move is legacy name of detach button
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                TT.DOM.FreezeSelection(false);
                                let Nodes = [];
                                let NodesTypes = {DraggingPin: false, DraggingTab: false, DraggingFolder: false};
                                let query;
                                if (D.querySelectorAll(".selected").length > 0) {
                                   query = D.querySelectorAll(".selected, .selected .tab, .selected .folder");
                                } else {
                                    query = D.querySelectorAll(".active_tab");
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
                                TT.Tabs.Detach(Nodes, NodesTypes, {});
                            }
                        }
                    }
                    if (s.id == "filter_search_go_prev") { // GO TO PREVIOUS SEARCH RESULT
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let filtered = D.querySelectorAll("#" + tt.active_group + " .tab.filtered");
                                if (filtered.length > 0) {
                                    D.querySelectorAll(".highlighted_search").forEach(function(s) {
                                        s.classList.remove("highlighted_search");
                                    });
                                    if (tt.SearchIndex == 0) {
                                        tt.SearchIndex = filtered.length - 1;
                                    } else {
                                        tt.SearchIndex--;
                                    }
                                    filtered[tt.SearchIndex].classList.add("highlighted_search");
                                    if (tt.tabs[filtered[tt.SearchIndex].id]) tt.tabs[filtered[tt.SearchIndex].id].ScrollToTab();
                                }
                            }
                        }
                    }
                    if (s.id == "filter_search_go_next") { // GO TO NEXT SEARCH RESULT
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let filtered = D.querySelectorAll("#" + tt.active_group + " .tab.filtered");
                                if (filtered.length > 0) {
                                    D.querySelectorAll(".highlighted_search").forEach(function(s) {
                                        s.classList.remove("highlighted_search");
                                    });
                                    if (tt.SearchIndex == filtered.length - 1) {
                                        tt.SearchIndex = 0;
                                    } else {
                                        tt.SearchIndex++;
                                    }
                                    filtered[tt.SearchIndex].classList.add("highlighted_search");
                                    if (tt.tabs[filtered[tt.SearchIndex].id]) tt.tabs[filtered[tt.SearchIndex].id].ScrollToTab();
                                }
                            }
                        }
                    }
                    if (s.id == "button_groups_toolbar_hide") {  // SHOW/HIDE GROUPS TOOLBAR
                        s.onmousedown = function(event) {
                            if (event.which == 1) TT.Groups.GroupsToolbarToggle();
                        }
                    }
                    if (s.id == "button_manager_window") { // SHOW GROUP MANAGER
                        s.onmousedown = function(event) {
                            if (event.which == 1 && D.getElementById("manager_window").style.top == "-500px") {
                                TT.Manager.OpenManagerWindow();
                            } else {
                                TT.DOM.HideRenameDialogs();
                            }
                        }
                    }
                    if (s.id == "button_new_group") { // NEW GROUP
                        s.onmousedown = function(event) {
                            if (event.which == 1) TT.Groups.AddNewGroup();
                        }
                    }
                    if (s.id == "button_remove_group") { // REMOVE GROUP
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                if (tt.active_group != "tab_list") TT.Groups.GroupRemove(tt.active_group, event.shiftKey);
                            }
                        }
                    }
                    if (s.id == "button_edit_group") { // EDIT GROUP
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                if (tt.active_group != "tab_list") TT.Groups.ShowGroupEditWindow(tt.active_group);
                            }
                        }
                    }
                    if (s.id == "button_export_group") { // EXPORT GROUP
                        s.onmousedown = function(event) {
                            if (event.which == 1) TT.Manager.ExportGroup(tt.active_group, tt.groups[tt.active_group].name, false);
                        }
                    }
                    if (s.id == "button_import_group") { // IMPORT GROUP
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let inputFile = TT.File.ShowOpenFileDialog(".tt_group");
                                inputFile.onchange = function(event) {
                                    TT.Manager.ImportGroup(true, false);
                                }
                            }
                        }
                    }
                    if (s.id == "button_new_folder") { // NEW FOLDER
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let FolderId = TT.Folders.AddNewFolder({});
                                TT.Folders.ShowRenameFolderDialog(FolderId);
                            }
                        }
                    }
                    if (s.id == "button_edit_folder") { // RENAME FOLDER
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                if (D.querySelectorAll("#" + tt.active_group + " .selected").length > 0) TT.Folders.ShowRenameFolderDialog(D.querySelectorAll("#" + tt.active_group + " .selected")[0].id);
                            }
                        }
                    }
                    if (s.id == "button_remove_folder") { // REMOVE FOLDERS
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                D.querySelectorAll("#" + tt.active_group + " .selected").forEach(function(s) {
                                    TT.Folders.RemoveFolder(s.id);
                                });
                            }
                        }
                    }
                    if (s.id == "button_unload" || s.id == "button_discard") { // DISCARD TABS
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                if (D.querySelectorAll(".pin.selected:not(.active_tab), #" + tt.active_group + " .selected:not(.active_tab)").length > 0) {
                                    TT.Tabs.DiscardTabs(
                                        Array.prototype.map.call(D.querySelectorAll(".pin:not(.active_tab), #" + tt.active_group + " .selected:not(.active_tab)"), function(s) {
                                            return parseInt(s.id);
                                        })
                                    );
                                } else {
                                    TT.Tabs.DiscardTabs(
                                        Array.prototype.map.call(D.querySelectorAll(".pin:not(.active_tab), .tab:not(.active_tab)"), function(s) {
                                            return parseInt(s.id);
                                        })
                                    );
                                }
                            }
                        }
                    }
                    if (s.id == "button_import_bak") { // IMPORT BACKUP
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let inputFile = TT.File.ShowOpenFileDialog(".tt_session");
                                inputFile.onchange = function(event) {
                                    TT.Manager.ImportSession(true, false, false);
                                }
                            }
                        }
                    }
                    if (s.id == "button_export_bak") { // EXPORT BACKUP
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let d = new Date();
                                TT.Manager.ExportSession((d.toLocaleString().replace(/\//g, ".").replace(/:/g, "꞉")), true, false, false);
                            }
                        }
                    }
                    if (s.id == "button_import_merge_bak") { // MERGE BACKUP
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                let inputFile = TT.File.ShowOpenFileDialog(".tt_session");
                                inputFile.onchange = function(event) {
                                    TT.Manager.ImportSession(false, false, true);
                                    // TT.Manager.ImportMergeTabs();
                                }
                            }
                        }
                    }
                    if (s.id == "button_filter_type") { // CHANGE FILTERING TYPE
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                if (this.classList.contains("url")) {
                                    TT.DOM.SetClasses(this, ["title"], ["url"], []);
                                    chrome.runtime.sendMessage({command: "set_search_filter", search_filter: "title", windowId: tt.CurrentWindowId});
                                } else {
                                    TT.DOM.SetClasses(this, ["url"], ["title"], []);
                                    chrome.runtime.sendMessage({command: "set_search_filter", search_filter: "url", windowId: tt.CurrentWindowId});
                                }
                                TT.Tabs.FindTab(D.getElementById("filter_box").value);
                            }
                        }
                    }
                    if (s.id == "button_reboot") { // EMERGENCY RELOAD
                        s.onmousedown = function(event) {
                            if (event.which == 1) {
                                chrome.runtime.sendMessage({command: "reload"});
                                chrome.runtime.sendMessage({command: "reload_sidebar"});
                                location.reload();
                            }
                        }
                    }
                    if (browserId != "F") {
                        if (s.id == "button_bookmarks") { // BOOKMARKS
                            s.onmousedown = function(event) {
                                if (event.which == 1) chrome.tabs.create({url: "chrome://bookmarks/"});
                            }
                        }
                        if (s.id == "button_downloads") { // DOWNLOADS
                            s.onmousedown = function(event) {
                                if (event.which == 1) chrome.tabs.create({url: "chrome://downloads/"});
                            }
                        }
                        if (s.id == "button_history") { // HISTORY
                            s.onmousedown = function(event) {
                                if (event.which == 1) chrome.tabs.create({url: "chrome://history/"});
                            }
                        }
                        if (s.id == "button_extensions") { // EXTENSIONS
                            s.onmousedown = function(event) {
                                if (event.which == 1) chrome.tabs.create({url: "chrome://extensions"});
                            }
                        }
                        if (s.id == "button_settings") { // SETTINGS
                            s.onmousedown = function(event) {
                                if (event.which == 1) chrome.tabs.create({url: "chrome://settings/"});
                            }
                        }
                        if (s.id == "button_load_bak1" || s.id == "button_load_bak2" || s.id == "button_load_bak3") { // LOAD BACKUPS
                            s.onmousedown = function(event) {
                                if (event.which == 1 && this.classList.contains("disabled") == false) {
                                    let BakN = (this.id).substr(15);
                                    chrome.storage.local.get(null, function(storage) {
                                        if (Object.keys(storage["windows_BAK" + BakN]).length > 0) chrome.storage.local.set({"windows": storage["windows_BAK" + BakN]});
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
            plist = D.getElementById("pin_list");
            if (opt.pin_list_multi_row) {
                plist.style.whiteSpace = "normal";
                plist.style.overflowX = "hidden";
            } else {
                plist.style.whiteSpace = "";
                plist.style.overflowX = "";
            }
            TT.DOM.RefreshGUI();
        },
        ApplyTheme: function(theme) {
            TT.Groups.RestoreStateOfGroupsToolbar();
            TT.Theme.ApplySizeSet(theme["TabsSizeSetNumber"]);
            TT.Theme.ApplyColorsSet(theme["ColorsSet"]);
            TT.Theme.ApplyTabsMargins(theme["TabsMargins"]);
            TT.Theme.ApplyBlinking();
            TT.DOM.RefreshGUI();
             // for some reason (top) text position is different in chromium !?
            // if (browserId != "F") {
            //     D.styleSheets[D.styleSheets.length-1].insertRule(".tab_title, .folder_title { margin-top: 1px; }", D.styleSheets[D.styleSheets.length-1].cssRules.length);
            // }
           for (var groupId in tt.groups) {
                let groupTitle = D.getElementById("_gte" + groupId);
                if (groupTitle != null && tt.groups[groupId].font == "") groupTitle.style.color = "";
            }
            TT.DOM.Loadi18n();
        },
        // theme colors is an object with css variables (but without --), for example; {"button_background": "#f2f2f2", "filter_box_border": "#cccccc"}
        ApplyColorsSet: function(ThemeColors) {
            let css_variables = "";
            for (let css_variable in ThemeColors) {
                css_variables = css_variables + "--" + css_variable + ":" + ThemeColors[css_variable] + ";";
            }
            for (let si = 0; si < D.styleSheets.length; si++) {
                if (D.styleSheets[si].ownerNode.id == "theme_colors") {
                    D.styleSheets[si].deleteRule(D.styleSheets[si].cssRules.length - 1);
                    D.styleSheets[si].insertRule("body { " + css_variables + " }", D.styleSheets[si].cssRules.length);
                }
            }
        },
        ApplySizeSet: function(size) {
            for (let si = 0; si < D.styleSheets.length; si++) {
                if ((D.styleSheets[si].ownerNode.id).match("sizes_preset") != null) {
                    if (D.styleSheets[si].ownerNode.id == "sizes_preset_" + size) {
                        D.styleSheets.item(si).disabled = false;
                    } else {
                        D.styleSheets.item(si).disabled = true;
                    }
                }
            }
        },
        ApplyTabsMargins: function(size) {
            for (let si = 0; si < D.styleSheets.length; si++) {
                if ((D.styleSheets[si].ownerNode.id).match("tabs_margin") != null) {
                    if (D.styleSheets[si].ownerNode.id == "tabs_margin_" + size) {
                        D.styleSheets.item(si).disabled = false;
                    } else {
                        D.styleSheets.item(si).disabled = true;
                    }
                }
            }
        },
        ApplyBlinking: function() {
            for (let si = 0; si < D.styleSheets.length; si++) {
                if ((D.styleSheets[si].ownerNode.id).match("blinking_pins") != null) {
                    if (opt.pin_attention_blinking) {
                        D.styleSheets.item(si).disabled = false;
                    } else {
                        D.styleSheets.item(si).disabled = true;
                    }
                }
                if ((D.styleSheets[si].ownerNode.id).match("blinking_audio") != null) {
                    if (opt.audio_blinking) {
                        D.styleSheets.item(si).disabled = false;
                    } else {
                        D.styleSheets.item(si).disabled = true;
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
                let correctedTheme = TT.Theme.CheckTheme(theme);
                if (correctedTheme.theme_version < 4 && storage["preferences"].show_toolbar == undefined) {
                    opt.show_toolbar = correctedTheme.ToolbarShow;
                    TT.Preferences.SavePreferences(opt);
                }
                return correctedTheme;
            } else {
                return DefaultTheme;
            }
        },
        // OPTIONS PAGE
        LoadTheme: function(ThemeId, reloadInSidebar) {
            D.querySelectorAll(".theme_buttons").forEach(function(s) {
                s.disabled = true;
            });
            chrome.storage.local.set({current_theme: ThemeId}, function() {
                chrome.storage.local.get(null, function(storage) {
                    SelectedTheme = Object.assign({}, TT.Theme.GetCurrentTheme(storage));
                    setTimeout(function() {
                        D.getElementById("new_theme_name").value = SelectedTheme.theme_name;
                        setTimeout(function() {
                            RemoveToolbarEditEvents();
                            TT.Theme.ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
                            TT.Theme.ApplyColorsSet(SelectedTheme["ColorsSet"]);
                            D.getElementById("_gtetab_list").style.color = "";
                            D.getElementById("_gtetab_list2").style.color = "";
                            if (SelectedTheme["TabsMargins"]) {
                                D.getElementById("tabs_margin_spacing")[SelectedTheme["TabsMargins"]].checked = true;
                                TT.Theme.ApplyTabsMargins(SelectedTheme["TabsMargins"]);
                            } else {
                                D.getElementById("tabs_margin_spacing")["2"].checked = true;
                            }
                            if (reloadInSidebar) chrome.runtime.sendMessage({command: "reload_theme", ThemeId: ThemeId, theme: SelectedTheme});
                            D.querySelectorAll(".theme_buttons").forEach(function(s) {
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
            let ThemeList = D.getElementById("theme_list");
            let ThemeNameBox = D.getElementById("new_theme_name");
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
            TT.DOM.New("option", ThemeList, {value: ThemeId, text: NewName});
            ThemeList.selectedIndex = ThemeList.options.length - 1;
            TT.Theme.SaveTheme(ThemeId);
            setTimeout(function() {TT.Theme.LoadTheme(ThemeId, true);}, 50);
            chrome.storage.local.set({current_theme: ThemeId});
            RefreshFields();
        },
        DeleteSelectedTheme: function() {
            chrome.storage.local.get(null, function(storage) {
                let LSthemes = storage.themes ? Object.assign({}, storage.themes) : {};
                let ThemeList = D.getElementById("theme_list");
                themes.splice(ThemeList.selectedIndex, 1);
                if (LSthemes[current_theme]) delete LSthemes[current_theme];
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
                TT.Theme.LoadTheme(current_theme, true);
                RefreshFields();
            });
        },
        RenameSelectedTheme: function() {
            let ThemeList = D.getElementById("theme_list");
            let ThemeNameBox = D.getElementById("new_theme_name");
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
            if (theme["TabsMargins"] == undefined) theme["TabsMargins"] = "2";
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
                if (theme["ColorsSet"]["button_background"]) theme["ColorsSet"]["button_shelf_background"] = theme["ColorsSet"]["button_background"];
                if (theme["ColorsSet"]["button_hover_background"]) theme["ColorsSet"]["button_shelf_hover_background"] = theme["ColorsSet"]["button_hover_background"];
                if (theme["ColorsSet"]["button_border"]) theme["ColorsSet"]["button_shelf_border"] = theme["ColorsSet"]["button_border"];
                if (theme["ColorsSet"]["button_hover_border"]) theme["ColorsSet"]["button_shelf_hover_border"] = theme["ColorsSet"]["button_hover_border"];
                if (theme["ColorsSet"]["button_icons_hover"]) theme["ColorsSet"]["button_shelf_icons_hover"] = theme["ColorsSet"]["button_icons_hover"];
                if (theme["ColorsSet"]["expand_hover_background"]) theme["ColorsSet"]["folder_icon_hover"] = theme["ColorsSet"]["expand_hover_background"];
                if (theme["ColorsSet"]["expand_closed_background"]) theme["ColorsSet"]["folder_icon_closed"] = theme["ColorsSet"]["expand_closed_background"];
                if (theme["ColorsSet"]["expand_open_background"]) theme["ColorsSet"]["folder_icon_open"] = theme["ColorsSet"]["expand_open_background"];
            }
            return theme;
        },
        ImportTheme: function() {
            var file = D.getElementById("file_import");
            var fr = new FileReader();
            if (file.files[0] == undefined) return;
            fr.readAsText(file.files[0]);
            fr.onload = function() {
                var data = fr.result;
                file.parentNode.removeChild(file);
                var themeObj = JSON.parse(data);
                if (themeObj.theme_version > DefaultTheme["theme_version"]) alert(chrome.i18n.getMessage("options_loaded_theme_newer_version"));
                if (themeObj.theme_version < DefaultTheme["theme_version"]) alert(chrome.i18n.getMessage("options_loaded_theme_older_version"));
                if (themeObj.theme_version <= DefaultTheme["theme_version"]) {
                    let ThemeList = D.getElementById("theme_list");
                    let ThemeId = GenerateRandomID() + GenerateRandomID();
                    let correctedTheme = TT.Theme.CheckTheme(themeObj);
                    SelectedTheme = Object.assign({}, DefaultTheme);
                    for (var val in correctedTheme.ColorsSet) {
                        SelectedTheme["ColorsSet"][val] = correctedTheme.ColorsSet[val];
                    }
                    SelectedTheme["TabsSizeSetNumber"] = correctedTheme.TabsSizeSetNumber;
                    SelectedTheme["TabsMargins"] = correctedTheme["TabsMargins"];
                    SelectedTheme["theme_version"] = DefaultTheme["theme_version"];
                    SelectedTheme["theme_name"] = correctedTheme.theme_name;
                    themes.push(ThemeId);
                    TT.Theme.SaveTheme(ThemeId);
                    let theme_name = TT.DOM.New("option", undefined, {value: ThemeId, text: SelectedTheme["theme_name"]});
                    ThemeList.add(theme_name);
                    ThemeList.selectedIndex = ThemeList.options.length - 1;
                    current_theme = ThemeId;
                    D.createElement("new_theme_name").value = ThemeId;
                    setTimeout(function() {TT.Theme.LoadTheme(ThemeId, true);}, 500);
                    RefreshFields();
                    DefaultTheme["ColorsSet"] = {};
                    chrome.storage.local.set({current_theme: ThemeId});
                }
            }
        }
    },
    Preferences: {
        SavePreferences: function(options) {
            chrome.storage.local.set({preferences: options});
            chrome.runtime.sendMessage({command: "reload_options", opt: options});
        },
        LoadDefaultPreferences: function() {
            opt = Object.assign({}, DefaultPreferences);
        }
    },
    File: {
        ShowOpenFileDialog: function(extension) {
            let inp = TT.DOM.New("input", D.getElementById("body"), {id: "file_import", type: "file", accept: extension}, {display: "none"});
            inp.click();
            return inp;
        },
        SaveFile: function(filename, extension, data) {
            let file = new File([JSON.stringify(data)], filename + "." + extension, {type: "text/" + extension + ";charset=utf-8"});
            let savelink = TT.DOM.New("a", D.getElementById("body"), {href:URL.createObjectURL(file), fileSize: file.size, target: "_blank", type: "file", download: (filename + "." + extension)}, {display: "none"});
            savelink.click();
            setTimeout(function() {savelink.parentNode.removeChild(savelink);}, 60000);
        }
    },
    Browser: {
        StartSidebarListeners: function() {
            if (browserId == "F") {
                browser.browserAction.onClicked.addListener(function(tab) {
                    if (tab.windowId == tt.CurrentWindowId) browser.sidebarAction.close();
                });
            }
            chrome.commands.onCommand.addListener(function(command) {
                if (command == "close_tree") {
                    chrome.windows.getCurrent({populate: false}, function(window) {
                        if (window.id == tt.CurrentWindowId && window.focused) {
                            chrome.tabs.query({windowId: tt.CurrentWindowId, active: true}, function(tabs) {
                                let tabsArr = [];
                                D.querySelectorAll("[id='" + tabs[0].id + "'] .tab, [id='" + tabs[0].id + "']").forEach(function(s) {
                                    tabsArr.push(parseInt(s.id));
                                    if (s.childNodes[2].childNodes.length > 0) {
                                        D.querySelectorAll("#" + s.childNodes[2].id + " .tab").forEach(function(t) {
                                            tabsArr.push(parseInt(t.id));
                                        });
                                    }
                                });
                                TT.Tabs.CloseTabs(tabsArr);
                            });
                        }
                    });
                }
            });
            chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
                if (message.command == "backup_available") {
                    if (opt.debug) TT.Debug.log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
                    let BAKbutton = D.getElementById("button_load_bak" + message.bak);
                    if (BAKbutton != null) BAKbutton.classList.remove("disabled");
                    return;
                }
                if (message.command == "drag_start") {
                    if (opt.debug) TT.Debug.log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
                    TT.DOM.CleanUpDragAndDrop();
                    tt.DragTreeDepth = message.DragTreeDepth;
                    tt.DraggingGroup = message.DraggingGroup;
                    tt.DraggingPin = message.DraggingPin;
                    tt.DraggingTab = message.DraggingTab;
                    tt.DraggingFolder = message.DraggingFolder;
                    return;
                }
                if (message.command == "drag_end") {
                    if (opt.debug) TT.Debug.log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
                    tt.Dragging = false;
                    TT.DOM.CleanUpDragAndDrop();
                    TT.DOM.RemoveHighlight();
                    return;
                }
                if (message.command == "remove_folder") {
                    if (opt.debug) TT.Debug.log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command + " folderId: " + message.folderId);
                    TT.Folders.RemoveFolder(message.folderId);
                    return;
                }
                if (message.command == "remove_group") {
                    if (opt.debug) TT.Debug.log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command + " groupId: " + message.groupId);
                    setTimeout(function() {TT.Groups.GroupRemove(message.groupId, false);}, 2000);
                    return;
                }
                if (message.command == "reload_sidebar") {
                    if (opt.debug) TT.Debug.log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
                    window.location.reload();
                    return;
                }
                if (message.command == "reload_options") {
                    if (opt.debug) TT.Debug.log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
                    opt = Object.assign({}, message.opt);
                    setTimeout(function() {
                        TT.Theme.RestorePinListRowSettings();
                    }, 100);
                    return;
                }
                if (message.command == "reload_toolbar") {
                    if (opt.debug) TT.Debug.log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
                    opt = Object.assign({}, message.opt);
                    if (opt.show_toolbar) {
                        TT.Toolbar.RemoveToolbar();
                        TT.Toolbar.RecreateToolbar(message.toolbar);
                        TT.Toolbar.SetToolbarEvents(false, true, true, "mousedown", true);
                        TT.Toolbar.RestoreToolbarShelf();
                        TT.Toolbar.RestoreToolbarSearchFilter();
                    } else {
                        TT.Toolbar.RemoveToolbar();
                    }
                    TT.DOM.RefreshGUI();
                    return;
                }
                if (message.command == "reload_theme") {
                    if (opt.debug) TT.Debug.log("message to sidebar " + tt.CurrentWindowId + ": message: " + message.command);
                    TT.Theme.RestorePinListRowSettings();
                    TT.Theme.ApplyTheme(message.theme);
                    return;
                }
                if (message.windowId == tt.CurrentWindowId) {
                    // if (message.command == "append_group") {
                    //     if (tt.groups[message.groupId] == undefined) {
                    //         tt.groups[message.groupId] = {id: message.groupId, index: Object.keys(tt.groups).length, active_tab: 0, prev_active_tab: 0, name: message.group_name, font: message.font_color};
                    //         TT.Groups.AppendGroupToList(message.groupId, message.group_name, message.font_color, true);
                    //     }
                    //     return;
                    // }

                    // if (message.command == "append_tab_to_group") {
                    //     let Group = D.getElementById("ct" + message.groupId);
                    //     let Tab = D.getElementById(message.tabId);
                    //     if (Group && Tab) {
                    //         Group.appendChild(Tab);
                    //         TT.Groups.SetActiveGroup(message.groupId, false, true);
                    //     }
                    //     return;
                    // }

                    if (message.command == "tab_created") {
                        if (message.InsertAfterId && D.querySelectorAll("#" + tt.active_group + " .tab").length == 0) {
                            message.InsertAfterId = undefined;
                            message.ParentId = tt.active_group;
                        }
                        tt.tabs[message.tabId] = new TT.Tabs.ttTab({tab: message.tab, ParentId: message.ParentId, InsertAfterId: message.InsertAfterId, Append: message.Append, Scroll: true});
                        TT.DOM.RefreshExpandStates();
                        setTimeout(function() {
                            TT.DOM.RefreshCounters();
                            TT.DOM.RefreshGUI();
                        }, 50);
                        if (opt.syncro_tabbar_tabs_order) {
                            let tabIds = Array.prototype.map.call(D.querySelectorAll(".pin, .tab"), function(s) {return parseInt(s.id);});
                            chrome.tabs.move(message.tab.id, {index: tabIds.indexOf(message.tab.id)});
                        }
                        setTimeout(function() {tt.schedule_update_data++;}, 2000);
                        return;
                    }
                    if (message.command == "tab_attached") {
                        if (opt.debug) TT.Debug.log("chrome event: " + message.command + ", tabId: " + message.tabId + ", tab is pinned: " + message.tab.pinned + ", ParentId: " + message.ParentId);
                        tt.tabs[message.tabId] = new TT.Tabs.ttTab({tab: message.tab, ParentId: message.ParentId, Append: true, SkipSetActive: false, SkipMediaIcon: false});
                        TT.DOM.RefreshGUI();
                        return;
                    }
                    if (message.command == "tab_detached") {
                        if (opt.debug) TT.Debug.log("chrome event: " + message.command + ", tabId: " + message.tabId);
                        let Tab = D.getElementById(message.tabId);
                        if (Tab != null && tt.tabs[message.tabId]) {
                            let ctDetachedParent = Tab.childNodes[1];
                            if (opt.promote_children_in_first_child == true && Tab.childNodes[1].childNodes.length > 1) {
                                TT.DOM.PromoteChildrenToFirstChild(Tab);
                            } else {
                                while (ctDetachedParent.firstChild) {
                                    ctDetachedParent.parentNode.parentNode.insertBefore(ctDetachedParent.firstChild, ctDetachedParent.parentNode);
                                }
                            }
                        }
                        tt.tabs[message.tabId].RemoveTab();
                        setTimeout(function() {tt.schedule_update_data++;}, 300);
                        TT.DOM.RefreshGUI();
                        return;
                    }
                    if (message.command == "tab_removed") {
                        if (opt.debug) {TT.Debug.log("chrome event: " + message.command + ", tabId: " + message.tabId);}
                        let mTab = D.getElementById(message.tabId);
                        if (mTab != null && tt.tabs[message.tabId]) {
                            let ctParent = mTab.childNodes[1];
                            if (opt.debug) TT.Debug.log("tab_removed, promote children: " + opt.promote_children);
                            if (opt.promote_children == true) {
                                if (opt.promote_children_in_first_child == true && mTab.childNodes[1].childNodes.length > 1) {
                                    TT.DOM.PromoteChildrenToFirstChild(mTab);
                                } else {
                                    while (ctParent.firstChild) {
                                        ctParent.parentNode.parentNode.insertBefore(ctParent.firstChild, ctParent.parentNode);
                                    }
                                }
                            } else {
                                D.querySelectorAll("[id='" + message.tabId + "'] .tab").forEach(function(s) {
                                    chrome.tabs.remove(parseInt(s.id));
                                });
                                D.querySelectorAll("[id='" + message.tabId + "'] .folder").forEach(function(s) {
                                    TT.Folders.RemoveFolder(s.id);
                                });
                            }
                            tt.tabs[message.tabId].RemoveTab();
                            TT.DOM.RefreshExpandStates();
                            setTimeout(function() {tt.schedule_update_data++;}, 300);
                            TT.DOM.RefreshGUI();
                            TT.DOM.RefreshCounters();
                        }
                        return;
                    }
                    if (message.command == "tab_activated") {
                        if (opt.debug) TT.Debug.log("chrome event: " + message.command + ", tabId: " + message.tabId);
                        TT.Tabs.SetActiveTab(message.tabId, true);
                        return;
                    }
                    if (message.command == "tab_attention") {
                        if (opt.debug) TT.Debug.log("chrome event: " + message.command + ", tabId: " + message.tabId);
                        if (tt.tabs[message.tabId]) tt.tabs[message.tabId].SetAttentionIcon();
                        return;
                    }
                    if (message.command == "tab_updated") {
                        if (opt.debug) TT.Debug.log("chrome event: " + message.command + ", tabId: " + message.tabId);
                        if (tt.tabs[message.tabId]) {
                            if (message.changeInfo.favIconUrl != undefined || message.changeInfo.url != undefined) {
                                if (browserId == "F" && message.changeInfo.favIconUrl == "") browser.sessions.setTabValue(message.tabId, "CachedFaviconUrl", "");
                                setTimeout(function() {
                                    if (tt.tabs[message.tabId]) tt.tabs[message.tabId].GetFaviconAndTitle(true);
                                }, 100);
                            }
                            if (message.changeInfo.title != undefined) {
                                setTimeout(function() {
                                    if (tt.tabs[message.tabId]) tt.tabs[message.tabId].GetFaviconAndTitle(true);
                                }, 1000);
                            }
                            if (message.changeInfo.audible != undefined || message.changeInfo.mutedInfo != undefined) tt.tabs[message.tabId].RefreshMediaIcon();
                            if (message.changeInfo.discarded != undefined) tt.tabs[message.tabId].RefreshDiscarded();
                            if (message.changeInfo.pinned != undefined) {
                                let updateTab = D.getElementById(message.tabId);
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
                                TT.DOM.RefreshExpandStates();
                            }
                        }
                        return;
                    }
                    // if (message.command == "set_active_group") {
                    // TT.Groups.SetActiveGroup(message.groupId, false, false);
                    // return;
                    // }
                    if (message.command == "remote_update") {
                        if (opt.debug) {
                            TT.Debug.log("chrome event: " + message.command + ", tabId: " + message.tabId);
                            TT.Debug.log(message);
                        }
                        TT.Manager.RecreateTreeStructure(message.groups, message.folders, message.tabs);
                        sendResponse(true);
                        tt.schedule_update_data++;
                        return;
                    }
                    if (message.command == "switch_active_tab") {
                        TT.Tabs.SwitchActiveTabBeforeClose(tt.active_group);
                        return;
                    }
                }
            });
        }
    },
    Debug: {
        log: function(log) {
            chrome.runtime.sendMessage({command: "debug", log: log});
        }
    }
};