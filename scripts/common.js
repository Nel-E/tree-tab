// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function HideRenameDialogs() {
	document.querySelectorAll(".edit_dialog").forEach(function(s) {
		s.style.display = "none";
		s.style.top = "-500px";
		s.style.left = "-500px";
	});
}

function EventExpandBox(Node) {
	if (Node.classList.contains("o")) {
		Node.classList.remove("o");
		Node.classList.add("c");
		
		if (Node.classList.contains("tab")) {
			chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(Node.id), tab: { expand: "c" } });
		}
		
		if (Node.classList.contains("folder")) {
			SaveFolders();
		}
		
	} else {
		if (Node.classList.contains("c")) {
			if (opt.collapse_other_trees) {
				let thisTreeTabs = GetParentsByClass(Node.childNodes[0], "tab"); // start from tab's first child, instead of tab, important to include clicked tab as well
				let thisTreeFolders = GetParentsByClass(Node.childNodes[0], "folder"); 
				document.querySelectorAll("#"+tt.active_group+" .o.tab").forEach(function(s) {
					s.classList.remove("o");
					s.classList.add("c");
					chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(s.id), tab: { expand: "c" } });
				});
				
				document.querySelectorAll("#"+tt.active_group+" .o.folder").forEach(function(s) {
					s.classList.remove("o");
					s.classList.add("c");
				});
				thisTreeTabs.forEach(function(s) {
					s.classList.remove("c");
					s.classList.add("o");
					chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(s.id), tab: { expand: "o" } });
				});
				thisTreeFolders.forEach(function(s) {
					s.classList.remove("c");
					s.classList.add("o");
				});
				SaveFolders();
				if (Node.classList.contains("tab")) {
					ScrollToTab(Node.id);
				}
			} else {
				Node.classList.remove("c");
				Node.classList.add("o");
				
				if (Node.classList.contains("tab")) {
					chrome.runtime.sendMessage({ command: "update_tab", tabId: parseInt(Node.id), tab: { expand: "o" } });
				}
				
				if (Node.classList.contains("folder")) {
					SaveFolders();
				}
				
			}
		}
	}
}

function GetSelectedFolders() {
	
	if (opt.debug) {
		log("f: GetSelectedFolders");
	}
	
	let res = {Folders: {}, FoldersSelected: [], TabsIds: [], TabsIdsParents: []};
	document.querySelectorAll("#"+tt.active_group+" .selected").forEach(function(s) {
		res.FoldersSelected.push(s.id);
		res.Folders[s.id] = Object.assign({}, tt.folders[s.id]);
		let Fchildren = document.querySelectorAll("#cf"+s.id+" .folder");
		Fchildren.forEach(function(fc) {
			res.Folders[fc.id] = Object.assign({}, tt.folders[fc.id]);
		});
		let Tchildren = document.querySelectorAll("#ct"+s.id+" .tab");
		Tchildren.forEach(function(tc) {
			res.TabsIds.push(parseInt(tc.id));
			res.TabsIdsParents.push(tc.parentNode.id);
		});
	});
	return res;
}

function GetSelectedTabs() {
	let res = {TabsIds: [], TabsIdsParents: [], TabsIdsSelected: []};
	document.querySelectorAll(".pin.selected, #"+tt.active_group+" .selected").forEach(function(s) {
		res.TabsIds.push(parseInt(s.id));
		res.TabsIdsParents.push(s.parentNode.id);
		res.TabsIdsSelected.push(parseInt(s.id));
		let Tchildren = document.querySelectorAll("#ct"+s.id+" .tab");
		Tchildren.forEach(function(tc) {
			res.TabsIds.push(parseInt(tc.id));
			res.TabsIdsParents.push(tc.parentNode.id);
		});
	});
	return res;
}

function Select(event, TabNode) {
	if (event.shiftKey) { // SET SELECTION WITH SHIFT
		let LastSelected = document.querySelector("#"+tt.active_group+" .selected.selected_last");
		if (LastSelected == null) {
			LastSelected = document.querySelector(".pin.active_tab, #"+tt.active_group+" .tab.active_tab");
		}
		if (LastSelected != null && TabNode.parentNode.id == LastSelected.parentNode.id) {

			if (!event.ctrlKey) {
				document.querySelectorAll(".pin.selected, #"+tt.active_group+" .selected").forEach(function(s) {
					s.classList.remove("selected_frozen");
					s.classList.remove("selected_temporarly");
					s.classList.remove("selected");
					s.classList.remove("selected_last");
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
}

function Deselect() {
	document.querySelectorAll("#"+tt.active_group+" .selected").forEach(function(s) {
		s.classList.remove("selected");
	});
}

function FreezeSelection(all) {
	if (all) {
		document.querySelectorAll(".selected").forEach(function(s) {
			s.classList.add("selected_frozen");
			s.classList.remove("selected");
			s.classList.remove("selected_last");
		});
	} else {
		document.querySelectorAll(".group:not(#"+tt.active_group+") .selected").forEach(function(s) {
			s.classList.add("selected_frozen");
			s.classList.remove("selected");
			s.classList.remove("selected_last");
		});
	}
}

function CleanUpDragClasses() {
	if (opt.debug) {
		log("f: CleanUpDragClasses, unfreezing and removing temporary classes...");
	}
	document.querySelectorAll(".selected_frozen").forEach(function(s) {
		s.classList.add("selected");
		s.classList.remove("selected_frozen");
	});
	document.querySelectorAll(".selected_temporarly").forEach(function(s) {
		s.classList.remove("selected");
		s.classList.remove("selected_temporarly");
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
	// document.querySelectorAll(".dragged_parents").forEach(function(s) {
		// s.classList.remove("dragged_parents");
	// });
}

function RemoveHighlight() {
	document.querySelectorAll(".highlighted_drop_target").forEach(function(s) {
		s.classList.remove("before");
		s.classList.remove("after");
		s.classList.remove("inside");
		s.classList.remove("highlighted_drop_target");
	});
}

function RemoveHeadersHoverClass() {
	document.querySelectorAll(".folder_header_hover, .tab_header_hover").forEach(function(s) {
		s.classList.remove("folder_header_hover");
		s.classList.remove("tab_header_hover");
	});
}

function EmptyDragAndDrop() {
	if (opt.debug) {
		log("f: EmptyDragAndDrop and removing DragNodeClass...");
	}
	tt.DragNodeClass = "";
	tt.DragTreeDepth = 0;
	
	tt.DraggingTab = false;
	tt.DraggingFolder = false;
	tt.DraggingPin = false;
	
}

function DragOverTreeNodeBAAAAAAAAAAAAAAAK(Node, NodeClass, event) {
	if (tt.DragNodeClass == "tree" && Node.parentNode.classList.contains("dragged_tree") == false) {
		if (Node.parentNode.classList.contains("pin")) {
			if (Node.parentNode.classList.contains("before") == false && event.layerX < Node.clientWidth/2) {
				RemoveHighlight();
				Node.parentNode.classList.remove("after");
				Node.parentNode.classList.add("before");
				Node.parentNode.classList.add("highlighted_drop_target");
			}
			if (Node.parentNode.classList.contains("after") == false && event.layerX >= Node.clientWidth/2) {
				RemoveHighlight();
				Node.parentNode.classList.remove("before");
				Node.parentNode.classList.add("after");
				Node.parentNode.classList.add("highlighted_drop_target");
			}
		} else {
			let PDepth = (GetParentsByClass(Node, NodeClass)).length + tt.DragTreeDepth;
			let PIsGroup = Node.parentNode.parentNode.parentNode.classList.contains("group");
			let PIsDraggedParents = Node.parentNode.classList.contains("dragged_parents");
			if (Node.parentNode.classList.contains("before") == false && event.layerY < Node.clientHeight/3 && (PDepth <= opt.max_tree_depth+1 || opt.max_tree_depth < 0 || PIsGroup || PIsDraggedParents || opt.max_tree_drag_drop == false)) {
				RemoveHighlight();
				Node.parentNode.classList.remove("inside");
				Node.parentNode.classList.remove("after");
				Node.parentNode.classList.add("before");
				Node.parentNode.classList.add("highlighted_drop_target");
			}
			
			
			if (Node.parentNode.classList.contains("inside") == false && event.layerY > Node.clientHeight/3 && event.layerY <= 2*(Node.clientHeight/3) && (PDepth <= opt.max_tree_depth || opt.max_tree_depth < 0 || PIsDraggedParents || opt.max_tree_drag_drop == false)) {
				RemoveHighlight();
				Node.parentNode.classList.remove("before");
				Node.parentNode.classList.remove("after");
				Node.parentNode.classList.add("inside");
				Node.parentNode.classList.add("highlighted_drop_target");
			}
			
			
			if (Node.parentNode.classList.contains("after") == false && Node.parentNode.classList.contains("o") == false && event.layerY > 2*(Node.clientHeight/3) && (PDepth <= opt.max_tree_depth+1 || opt.max_tree_depth < 0 || PIsGroup || PIsDraggedParents || opt.max_tree_drag_drop == false)) {
				RemoveHighlight();
				Node.parentNode.classList.remove("inside");
				Node.parentNode.classList.remove("before");
				Node.parentNode.classList.add("after");
				Node.parentNode.classList.add("highlighted_drop_target");
			}
			
			
			
		}
	}
}

