// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********          REFRESH GUI          ***************

function SetTRefreshEvents() {
	$(window).on("resize", function(event) {
		RefreshGUI();
	});

	// click on media icon
	$(document).on("mousedown", ".tab_mediaicon", function(event) {
		event.stopPropagation();
		if (event.button == 0 && $(this).parent().parent().is(".audible, .muted")) {
			chrome.tabs.get(parseInt(this.parentNode.parentNode.id), function(tab) {
				if (tab) {
					chrome.tabs.update(tab.id, {muted:!tab.mutedInfo.muted});
				}
			});
		}
	});
}

function RefreshGUI() {
	if ($("#toolbar").children().length > 0) {
		$("#toolbar").css({ "height": "", "width": "", "display": "", "padding": "", "border": "" });
		if ($(".button").is(".on")) {
			$("#toolbar").css({ "height": 53 });
		} else {
			$("#toolbar").css({ "height": 26 });
		}
	} else {
		$("#toolbar").css({ "height": 0, "width": "0px", "display": "none", "padding": "0", "border": "none" });
	}
	
	if ($("#pin_list").children().length > 0) {
		$("#pin_list").css({ "top": $("#toolbar")[0].getBoundingClientRect().height, "height": "", "width":"", "display": "", "padding": "", "border": "" });
	} else {
		$("#pin_list").css({ "height": "0px", "width": "0px", "display": "none", "padding": "0", "border": "none" });
	}

	$("#toolbar_groups").css({ "top": $("#toolbar").outerHeight() + $("#pin_list")[0].getBoundingClientRect().height, "height": $(window).height() - $("#toolbar").outerHeight() - $("#pin_list")[0].getBoundingClientRect().height});
	
	$(".group_title").each(function(){
		$(this)[0].innerText = (bggroups[(this.id).substr(4)] ? bggroups[(this.id).substr(4)].name : caption_noname_group) + " (" + $("#" + (this.id).substr(4) ).children().length + ")";
	});
	$("#_gtetab_list")[0].innerText = caption_ungrouped_group + " (" + $("#tab_list").children().length + ")";
	
	$(".group_button").each(function(){
		$(this).css({ "height": $(this).children(0).innerWidth() });
	});

	$("#groups").css({ "top": $("#toolbar")[0].getBoundingClientRect().height + $("#pin_list")[0].getBoundingClientRect().height, "left": $("#toolbar_groups").outerWidth(), "height": $(window).height() - $("#pin_list")[0].getBoundingClientRect().height - $("#toolbar").outerHeight(), "width": $(window).width() - $("#toolbar_groups").outerWidth() });
}

// set discarded class
function RefreshDiscarded(tabId) {
	if ($("#" + tabId).length > 0) {
		chrome.tabs.get(parseInt(tabId), function(tab) {
			if (tab) {
				if (tab.discarded) {
					$("#" + tabId).addClass("discarded");
				} else {
					$("#" + tabId).removeClass("discarded");
				}
			}
		});
	}
}

// set discarded class
function SetAttentionIcon(tabId) {
	if ($("#" + tabId).length > 0) {
		$("#" + tabId).addClass("attention");
	}
}

// change media icon
function RefreshMediaIcon(tabId) {
	if ($("#" + tabId).length > 0) {
		chrome.tabs.get(parseInt(tabId), function(tab) {
			if (tab) {
				if (tab.mutedInfo.muted) {
					$("#" + tabId).removeClass("audible").addClass("muted");
				}
				if (!tab.mutedInfo.muted && tab.audible) {
					$("#" + tabId).removeClass("muted").addClass("audible");
				}
				if (!tab.mutedInfo.muted && !tab.audible) {
					$("#" + tabId).removeClass("audible").removeClass("muted");
				}
			}
		});
	}
}


// Vivaldi does not have changeInfo.audible listener, this is my own implementation, hopefully this will not affect performance too much
function VivaldiRefreshMediaIcons() {
	chrome.tabs.query({currentWindow: true}, function(tabs) {
		$(".audible, .muted").removeClass("audible").removeClass("muted");
		let tc = tabs.length;
		for (var ti = 0; ti < tc; ti++) {
			if (tabs[ti].audible) {
				$("#" + tabs[ti].id).addClass("audible");
			}
			if (tabs[ti].mutedInfo.muted) {
				$("#" + tabs[ti].id).addClass("muted");
			}
		}
	});
	setTimeout(function() {
		VivaldiRefreshMediaIcons();
	}, 1400);
}


function GetFaviconAndTitle(tabId) {
	if ($("#" + tabId)[0]) {
		chrome.tabs.get(parseInt(tabId), function(tab) {
			if (tab){
				var title = tab.title ? tab.title : tab.url;
				if (tab.status == "complete") {
					$("#" + tabId).removeClass("loading");
					// change title
					$("#tab_title" + tab.id)[0].textContent = title;
					$("#tab_header" + tab.id).attr("title", title);
					
					// compatibility with various Tab suspender extensions
					if (tab.favIconUrl != undefined && tab.favIconUrl.match("data:image/png;base64") != null) {
						$("#tab_header" + tab.id).css({ "background-image": "url(" + tab.favIconUrl + ")" });
					} else {
						// case for internal pages, favicons don't have access, but can be loaded from url
						if (tab.url.match("opera://|vivaldi://|browser://|chrome://|chrome-extension://|about:") != null) {
							$("#tab_header" + tab.id).css({ "background-image": "url(chrome://favicon/" + tab.url + ")" });
						} else {
							// change favicon
							var img = new Image();
							img.src = tab.favIconUrl;
							img.onload = function() {
								$("#tab_header" + tab.id).css({ "background-image": "url(" + tab.favIconUrl + ")" });
							};
							img.onerror = function() {
								$("#tab_header" + tab.id).css({ "background-image": "url(chrome://favicon/" + tab.url + ")" });
							}
						}
					}
				}
				if (tab.status == "loading") {
					$("#tab_header" + tab.id).css({ "background-image": "" });
					$("#" + tabId).addClass("loading");
					title = tab.title ? tab.title : caption_loading;
					$("#tab_title" + tab.id)[0].textContent = title;
					$("#tab_header" + tab.id).attr("title", title);
					setTimeout(function() {
						if ($("#" + tabId)[0]) GetFaviconAndTitle(tabId);
					}, 1000);
				}
			}
		});
	}
}

// refresh open closed trees states
function RefreshExpandStates() {
	$(".children").each(function() {
		if ($(this).children().length > 0) {
			$(this).parent().removeClass("n");
			if ($(this).parent().is(":not(.o, .c)")) {
				$(this).parent().addClass("o");
			}
		} else {
			$(this).parent().removeClass("o").removeClass("c").addClass("n");
		}
	});
}