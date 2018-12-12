const Utils = {
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
                                    let Tab = document.getElementById(tabs[i].id);
                                    if (Tab && p[i] == Tab.parentNode.parentNode.id) ok++;
                                }
                                if (ok < tabs.length * 0.5) {
                                    if (opt.debug) Utils.log("emergency reload");
                                    chrome.storage.local.set({emergency_reload: true});
                                    chrome.runtime.sendMessage({command: "reload"});
                                    // chrome.runtime.sendMessage({command: "reload_sidebar"});
                                    location.reload();
                                } else {
                                    if (opt.debug) Utils.log("f: RecheckFirefox, ok");
                                }
                            }
                        }
                    );
                }
            }
        });
    },
    log: function(log) {
        chrome.runtime.sendMessage({command: "debug", log: log});
    }
}