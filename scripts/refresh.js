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
		$(this)[0].innerText = (bggroups[(this.id).substr(4)] ? bggroups[(this.id).substr(4)].name : caption_noname_group) + (opt.show_counter_groups ? " (" + $("#" + (this.id).substr(4) +" .tab").length + ")" : "");
	});
	
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
	setInterval(function() {
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
	}, 1400);
}

function GetFaviconAndTitle(tabId, addCounter) {
	if ($("#" + tabId)[0]) {
		chrome.tabs.get(parseInt(tabId), function(tab) {
			if (tab){
				let title = tab.title ? tab.title : tab.url;
				if (tab.status == "complete") {
					$("#" + tabId).removeClass("loading");
					// change title
					$("#tab_title" + tab.id)[0].textContent = title;
					$("#tab_header" + tab.id).attr("title", title);
					$("#"+tabId).data("title", title);
					
					// compatibility with various Tab suspender extensions
					if (tab.favIconUrl != undefined && tab.favIconUrl.match("data:image/png;base64") != null) {
						$("#tab_header" + tab.id).css({ "background-image": "url(" + tab.favIconUrl + ")" });
					} else {
						// case for internal pages, favicons don't have access, but can be loaded from url
						if (tab.url.match("opera://|vivaldi://|browser://|chrome://|chrome-extension://") != null) {
							$("#tab_header" + tab.id).css({ "background-image": "url(chrome://favicon/" + tab.url + ")" });
						} else {
							// change favicon
							var img = new Image();
							img.src = tab.favIconUrl;
							img.onload = function() {
								$("#tab_header" + tab.id).css({ "background-image": "url(" + tab.favIconUrl + ")" });
							};
							img.onerror = function() {
								$("#tab_header" + tab.id).css({ "background-image": ((tab.url == "" || browserId == "F") ? "url(./theme/icon_empty.svg)" : ("url(chrome://favicon/" + tab.url + ")")) });
								// $("#tab_header" + tab.id).css({ "background-image": "url(" + tab.url + ")" });
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
					$("#"+tabId).data("title", title);
					setTimeout(function() {
						if ($("#" + tabId)[0]) GetFaviconAndTitle(tabId, addCounter);
					}, 1000);
				}
				if (addCounter && (opt.show_counter_tabs || opt.show_counter_tabs_hints)) {
					RefreshTabCounter(tabId);
				}
		
			}
		});
	}
}

// refresh open closed trees states
function RefreshExpandStates() {
	$(".folder:visible").each(function() {
		if ($("#ch"+this.id).children().length == 0 && $("#cf"+this.id).children().length == 0) {
			$(this).removeClass("o").removeClass("c").addClass("n");
		} else {
			if ($(this).is(":not(.o, .c)")) {
				$(this).addClass("o").removeClass("n");
			}
		}
	});

	$(".tab:visible").each(function() {
		if ($("#ch"+this.id).children().length == 0) {
			$(this).removeClass("o").removeClass("c").addClass("n");
		} else {
			if ($(this).is(":not(.o, .c)")) {
				$(this).addClass("o").removeClass("n");
			}
		}
	});
}

function RefreshCounters() {
	if (opt.show_counter_tabs || opt.show_counter_tabs_hints) {
		$(".tab.n:visible").each(function() {
			if ($("#tab_title"+this.id)[0]) {
				$("#tab_title"+this.id)[0].textContent = $(this).data("title");
				$("#tab_header"+this.id).attr("title", $(this).data("title"));
			}
		});
		$(".tab.c:visible, .tab.o:visible").each(function() {
			if (opt.show_counter_tabs) {
				$("#tab_title"+this.id)[0].textContent = ("("+$("#"+this.id+" .tab").length+") ") + $(this).data("title");
			}
			if (opt.show_counter_tabs_hints) {
				$("#tab_header"+this.id).attr("title", ("("+$("#"+this.id+" .tab").length+") ") + $(this).data("title"));
			}
		});
		$(".folder:visible").each(function() {
			if (opt.show_counter_tabs) {
				$("#folder_title"+this.id)[0].textContent = ("("+$("#"+this.id+" .tab").length+") ") + bgfolders[this.id].name;
			}
			if (opt.show_counter_tabs_hints) {
				$("#folder_header"+this.id).attr("title", ("("+$("#"+this.id+" .tab").length+") ") + bgfolders[this.id].name);
			}
		});
	}
}

function RefreshTabCounter(tabId) {
	if (opt.show_counter_tabs || opt.show_counter_tabs_hints) {
		if ($("#"+tabId).data("title")) {
			if (opt.show_counter_tabs) {
				if ($(".c#"+tabId+", .o#"+tabId)[0]) {
					$("#tab_title"+tabId)[0].textContent = ("("+$("#ch"+tabId+" .tab").length+") ") + $("#"+tabId).data("title");
				} else {
					$("#tab_title"+tabId)[0].textContent = $("#"+tabId).data("title");
				}
			}
			if (opt.show_counter_tabs_hints) {
				if ($(".c#"+tabId+", .o#"+tabId)[0]) {
					$("#tab_header"+tabId).attr("title", ("("+$("#ch"+tabId+" .tab").length+") ") + $("#"+tabId).data("title"));
				} else {
					$("#tab_header"+tabId).attr("title", $("#"+tabId).data("title"));
				}
			}
		}
	}
}
