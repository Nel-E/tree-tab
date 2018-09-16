// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

function SwitchActiveTabBeforeClose(ActiveGroupId) {
	if (opt.debug) {
		log("f: SwitchActiveTabBeforeClose");
	}
	let activeGroup = document.getElementById(ActiveGroupId);
	
	if (document.querySelectorAll("#"+ActiveGroupId+" .tab").length < 2 && document.querySelector(".pin.active_tab") == null) { // CHECK IF CLOSING LAST TAB IN ACTIVE GROUP
		
		let pins = document.querySelectorAll(".pin");
		
		if (pins.length > 0) { // IF THERE ARE ANY PINNED TABS, ACTIVATE IT
			if (opt.debug) {
				log("available pin, switching to: "+pins[pins.length-1].id);
			}
			chrome.tabs.update(parseInt(pins[pins.length-1].id), {active: true});
			return;
		} else { // NO OTHER CHOICE BUT TO SEEK IN ANOTHER GROUP
			
			if (opt.after_closing_active_tab == "above" || opt.after_closing_active_tab == "above_seek_in_parent") {
				if (activeGroup.previousSibling != null) {
					if (document.querySelectorAll("#"+activeGroup.previousSibling.id+" .tab").length > 0) {
						SetActiveGroup(activeGroup.previousSibling.id, true, true);
					} else {
						SwitchActiveTabBeforeClose(activeGroup.previousSibling.id);
						return;
					}
				} else {
					SetActiveGroup("tab_list", true, true);
				}
			} else {
				if (activeGroup.nextSibling != null) {
					if (document.querySelectorAll("#"+activeGroup.nextSibling.id+" .tab").length > 0) {
						SetActiveGroup(activeGroup.nextSibling.id, true, true);
					} else {
						SwitchActiveTabBeforeClose(activeGroup.nextSibling.id);
						return;
					}
				} else {
					SetActiveGroup("tab_list", true, true);
				}
			}
		}
	} else {
		
		if (opt.debug) {
			log("available tabs in current group, switching option is: "+opt.after_closing_active_tab);
		}
		
		if (opt.after_closing_active_tab == "above") {
			ActivatePrevTab(true);
		}
		if (opt.after_closing_active_tab == "below") {
			ActivateNextTab(true);
		}
		if (opt.after_closing_active_tab == "above_seek_in_parent") {
			ActivatePrevTabBeforeClose();
		}
		if (opt.after_closing_active_tab == "below_seek_in_parent") {
			ActivateNextTabBeforeClose();
		}
	}
}


function ActivateNextTabBeforeClose() {
	let activePin = document.querySelector(".pin.active_tab");
	if (activePin != null) {
		if (activePin.nextSibling != null) {
			chrome.tabs.update(parseInt(activePin.nextSibling.id), { active: true });
		} else {
			if (activePin.previousSibling != null) {
				chrome.tabs.update(parseInt(activePin.previousSibling.id), { active: true });
			}
		}
	}
	
	let will_be_closed = document.querySelectorAll("#"+tt.active_group+" .will_be_closed");
	let activeTab = will_be_closed.length > 0 ? will_be_closed[will_be_closed.length-1] : document.querySelector("#"+tt.active_group+" .tab.active_tab");
	
	if (activeTab != null && document.querySelectorAll("#"+tt.active_group+" .tab:not(.will_be_closed)").length > 1) {
		if (opt.promote_children && activeTab.childNodes[1].firstChild != null) {
			chrome.tabs.update(parseInt(activeTab.childNodes[1].firstChild.id), { active: true });
		} else {
			if (activeTab.nextSibling != null) {
				chrome.tabs.update(parseInt(activeTab.nextSibling.id), { active: true });
			} else {
				if (activeTab.previousSibling != null) {
					chrome.tabs.update(parseInt(activeTab.previousSibling.id), { active: true });
				} else {
					if (activeTab.parentNode.parentNode.classList.contains("tab")) {
						chrome.tabs.update(parseInt(activeTab.parentNode.parentNode.id), { active: true });
					} else {
						ActivatePrevTab();
					}
				}
			}
		}
	}
}

function ActivatePrevTabBeforeClose() {
	let activePin = document.querySelector(".pin.active_tab");
	if (activePin != null) {
		if (activePin.previousSibling != null) {
			chrome.tabs.update(parseInt(activePin.previousSibling.id), { active: true });
		} else {
			if (activePin.nextSibling != null) {
				chrome.tabs.update(parseInt(activePin.nextSibling.id), { active: true });
			}
		}
	}

	let will_be_closed = document.querySelectorAll("#"+tt.active_group+" .will_be_closed");
	let activeTab = will_be_closed.length > 0 ? will_be_closed[0] : document.querySelector("#"+tt.active_group+" .tab.active_tab");

	if (activeTab != null && document.querySelectorAll("#"+tt.active_group+" .tab:not(.will_be_closed)").length > 1) {
		if (opt.promote_children && activeTab.childNodes[1].firstChild != null) {
			chrome.tabs.update(parseInt(activeTab.childNodes[1].firstChild.id), { active: true });
		} else {
			if (activeTab.previousSibling != null) {
				chrome.tabs.update(parseInt(activeTab.previousSibling.id), { active: true });
			} else {
				if (activeTab.nextSibling != null) {
					chrome.tabs.update(parseInt(activeTab.nextSibling.id), { active: true });
				} else {
					if (activeTab.parentNode.parentNode.classList.contains("tab")) {
						chrome.tabs.update(parseInt(activeTab.parentNode.parentNode.id), { active: true });
					} else {
						ActivateNextTab();
					}
				}
			}
		}
	}		
}


function ActivateNextTab(allow_loop) {
	let activeTab = document.querySelector("#"+tt.active_group+" .tab.active_tab") != null ? document.querySelector("#"+tt.active_group+" .tab.active_tab") : document.querySelector(".pin.active_tab");
	if (activeTab == null) {
		return;
	}
	let NewActiveId;
	let Node = activeTab;
	let parents = GetAllParents(activeTab);
	while (Node != null && Node.classList != undefined) {
		if (parents.indexOf(Node) == -1 && Node != activeTab && (Node.classList.contains("pin") || Node.classList.contains("tab")) && Node.classList.contains("will_be_closed") == false) {
			NewActiveId = Node.id;
			Node = null;
		} else {
			if (parents.indexOf(Node) == -1 && Node.childNodes[1] && Node.childNodes[1].classList.contains("children") && Node.childNodes[1].childNodes.length > 0 && Node.classList.contains("c") == false) { // GO TO CHILDREN
				Node = Node.childNodes[1].firstChild;
			}	else {
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
		let RestartLoopFromTab = document.querySelector("#°"+tt.active_group+" .tab");
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
			chrome.tabs.update(tabId, { active: true });
		}
	}	
}

function ActivatePrevTab(allow_reverse) {
	
	
	
	let activeTab = document.querySelector("#"+tt.active_group+" .tab.active_tab") != null ? document.querySelector("#"+tt.active_group+" .tab.active_tab") : document.querySelector(".pin.active_tab");
	if (activeTab == null) {
		return;
	}
	let NewActiveId;
	let Node = activeTab;
	
	
	let quit = 100;
	
	
	// let parents = GetAllParents(activeTab);
	while (quit > 0 && Node != null && Node.classList != undefined) {
		quit--;
				console.log(Node);
		if (Node != activeTab && (Node.classList.contains("pin") || Node.classList.contains("tab")) && Node.classList.contains("will_be_closed") == false) {
			NewActiveId = Node.id;
			Node = null;
				console.log(Node);
		} else {
			
			if (Node.previousSibling) { // GO TO PREV SIBLING
			


				Node = Node.previousSibling;
			
			
			
				
				// if (Node.childNodes[1] && Node.childNodes[1].classList.contains("children") && Node.childNodes[1].childNodes.length > 0) { // GO TO CHILDREN
					let quit2 = 10000;
					
					
					// let parents = GetAllParents(activeTab);
					while (quit2 > 0 && Node != null && Node.classList != undefined && Node.childNodes[1] && Node.childNodes[1].classList.contains("children") && Node.childNodes[1].childNodes.length > 0 && Node.classList.contains("c") == false) {
						console.log(quit2);
						quit2--;
						Node = Node.childNodes[1].lastChild;
						console.log(Node);
					}
					
					
					
				// }

				// else {
					// console.log("prev sibling");
					// Node = Node.previousSibling;
					// console.log(Node);
				// }
				
			} else { // GO UP TO PARENT
				Node = Node.parentNode.parentNode;
			}
			
			
			
				// if (Node.childNodes[1] && Node.childNodes[1].classList.contains("children") && Node.childNodes[1].childNodes.length > 0) { // GO TO CHILDREN
					// Node = Node.childNodes[1].lastChild;
					// console.log(Node);
				// }	else {
					// if (Node.nextSibling) { // GO TO NEXT SIBLING
						// Node = Node.nextSibling;
					// } else { // GO UP TO PARENT
						// Node = Node.parentNode.parentNode;
					// }
				// }
			
			
			
			
			
			
		}
	}
	// if (allow_loop && NewActiveId == undefined) {
		// let RestartLoopFromPin = document.querySelector(".pin");
		// let RestartLoopFromTab = document.querySelector("#°"+tt.active_group+" .tab");
		// if (activeTab.classList.contains("pin")) {
			// if (RestartLoopFromTab != null) {
				// NewActiveId = RestartLoopFromTab.id;
			// } else {
				// if (RestartLoopFromPin != null) {
					// NewActiveId = RestartLoopFromPin.id;
				// }
			// }
		// }
		// if (activeTab.classList.contains("tab")) {
			// if (RestartLoopFromPin != null) {
				// NewActiveId = RestartLoopFromPin.id;
			// } else {
				// if (RestartLoopFromTab != null) {
					// NewActiveId = RestartLoopFromTab.id;
				// }
			// }
		// }
	// }
	if (NewActiveId != undefined) {
		let tabId = parseInt(NewActiveId);
		if (isNaN(tabId) == false) {
			chrome.tabs.update(tabId, { active: true });
		}
	}	
	

}


