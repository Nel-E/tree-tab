// Copyright (c) 2017 kroppy. All rights reserved.
// Use of this source code is governed by a Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0) license
// that can be found at https://creativecommons.org/licenses/by-nc-nd/4.0/

// **********      OPTIONS       ***************

var current_theme = "";
var themes = [];
var SelectedTheme = Object.assign({}, DefaultTheme);
var dragged_button = { id: "" };
let tt = {
    CurrentWindowId: 0,
    active_group: "tab_list",
    tabs: {},
    groups: {},
    folders: {}
};

// options for all drop down menus
let DropDownList = ["dbclick_folder", "midclick_folder", "midclick_tab", "dbclick_group", "midclick_group", "dbclick_tab", "append_pinned_tab", "append_child_tab", "append_child_tab_after_limit", "append_orphan_tab", "append_tab_from_toolbar", "after_closing_active_tab", "move_tabs_on_url_change"];

D.addEventListener("DOMContentLoaded", function() {
    D.title = "Tree Tabs";
    chrome.storage.local.get(null, function(storage) {

        TT.Groups.AppendGroupToList("tab_list", labels.ungrouped_group, "", false);
        TT.Groups.AppendGroupToList("tab_list2", labels.noname_group, "", false);
        AppendSampleTabs();

        GetCurrentPreferences(storage);

        if (storage["themes"]) {
            for (var themeName in storage["themes"]) {
                themes.push(themeName);
            }
        }
        if (storage["current_theme"]) {
            current_theme = storage["current_theme"];
            TT.Theme.LoadTheme(storage["current_theme"]);
        }


        if (storage["unused_buttons"]) {
            TT.Toolbar.RecreateToolbarUnusedButtons(storage["unused_buttons"]);
        }

        TT.Toolbar.RecreateToolbar(TT.Theme.GetCurrentToolbar(storage));
        TT.Toolbar.SetToolbarEvents(false, false, true, "click", false, true);
        AddEditToolbarEditEvents();


        GetOptions(storage);
        RefreshFields();
        SetEvents();


        setTimeout(function() {
            D.querySelectorAll(".on").forEach(function(s) {
                s.classList.remove("on");
            });
            RefreshGUI();
        }, 100);
    });
});

function SetRegexes() {
    let regexes = D.getElementById('tab_group_regexes');
    opt.tab_group_regexes = [];
    for (let child of regexes.children) {
        var regex = child.children[0].value.trim();
        var groupName = child.children[1].value.trim();
        if (regex !== "" && groupName !== "") {
            opt.tab_group_regexes.push([regex, groupName]);
        }
    }
    TT.Preferences.SavePreferences(opt);
}

function AddRegexPair() {
    let regexes = D.getElementById('tab_group_regexes');
    let outer = D.createElement("div");

    let input = D.createElement("input");
    input.type = "text";
    input.style.width = '200px';
    input.onchange = SetRegexes;
    input.onkeyup = SetRegexes;
    outer.appendChild(input);

    input = D.createElement("input");
    input.type = "text";
    input.style.width = '200px';
    input.onchange = SetRegexes;
    input.onkeyup = SetRegexes;
    outer.appendChild(input);

    let deleteButton = D.createElement("input");
    deleteButton.type = "button";
    deleteButton.style.width = '75px';
    deleteButton.className = "set_button theme_buttons";
    deleteButton.value = chrome.i18n.getMessage("options_Remove_button");
    deleteButton.onclick = function() { regexes.removeChild(outer); }
    outer.appendChild(deleteButton);

    regexes.appendChild(outer);
    return outer;
}

// document events
function GetOptions(storage) {
    // get language labels
    D.querySelectorAll(".label, .set_button, .bg_opt_drop_down_menu, .hint_explanation").forEach(function(s) {
        s.textContent = chrome.i18n.getMessage(s.id);
    });

    // get language for menu labels
    D.querySelectorAll(".menu_item").forEach(function(s) {
        s.textContent = chrome.i18n.getMessage("options_example_menu_item");
    });

    // get checkboxes from saved states
    D.querySelectorAll(".opt_checkbox").forEach(function(s) {
        s.checked = opt[s.id];
        if (s.checked) {
            if (s.id == "never_show_close") {
                D.getElementById("always_show_close").disabled = true;
            }
        } else {
            if (s.id == "promote_children") {
                D.getElementById("promote_children_in_first_child").disabled = true;
            }
        }
    });

    // get language labels
    D.querySelectorAll(".pick_col, #close_x, #close_hover_x, .options_button_minus, .options_button_plus, .tabs_margin_spacing").forEach(function(s) {
        s.title = chrome.i18n.getMessage(s.id);
    });


    // get options for all drop down menus (loop through all drop down items that are in DropDownList array)
    for (let i = 0; i < DropDownList.length; i++) {
        let DropDownOption = D.getElementById(DropDownList[i]);
        for (let j = 0; j < DropDownOption.options.length; j++) {
            if (DropDownOption.options[j].value == opt[DropDownList[i]]) {
                DropDownOption.selectedIndex = j;
                break;
            }
        }
        RefreshFields();
    }

    for (let i = 0; i < opt.tab_group_regexes.length; i++) {
        let regexPair = opt.tab_group_regexes[i];
        let outer = AddRegexPair();
        outer.children[0].value = regexPair[0];
        outer.children[1].value = regexPair[1]
    }

    // get options for tabs tree depth option
    D.getElementById("max_tree_depth").value = opt.max_tree_depth;


    // append themes to dropdown menu
    let ThemeList = D.getElementById("theme_list");
    for (var i = 0; i < themes.length; i++) {
        let theme_name = D.createElement("option");
        theme_name.value = themes[i];
        theme_name.text = storage.themes[themes[i]].theme_name;
        ThemeList.add(theme_name);
    }
    // select current theme in dropdown list
    for (var i = 0; i < ThemeList.options.length; i++) {
        if (ThemeList.options[i].value == current_theme) {
            ThemeList.selectedIndex = i;
            break;
        }
    }
}

function RemovePreview() {
    D.querySelectorAll(".hover_blinking").forEach(function(s) { s.classList.remove("hover_blinking"); });
    D.querySelectorAll(".hover_border_blinking").forEach(function(s) { s.classList.remove("hover_border_blinking"); });
    D.querySelectorAll(".red_preview").forEach(function(s) {
        s.style.backgroundColor = "";
        s.style.border = "";
        s.style.borderBottom = "";
        s.style.borderRight = "";
        s.style.color = "";
        s.style.animation = "";
        s.style.fontWeight = "";
        s.style.fontStyle = "";
        // s.style.zIndex = "";
        s.classList.remove("red_preview");
    });
}



function AddRedStylePreview(Id, style, value, removePreview) {
    if (removePreview) RemovePreview();
    let d = D.getElementById(Id);
    d.classList.add("red_preview");
    d.style[style] = value;
}

function AddBlueBackgroundPreview(Id, removePreview) {
    if (removePreview) RemovePreview();
    D.getElementById(Id).classList.add("hover_blinking");
}

function AddBlueBorderPreview(Id, removePreview) {
    if (removePreview) RemovePreview();
    D.getElementById(Id).classList.add("hover_border_blinking");
}


// document events
function SetEvents() {
    // --------------------------------DONATIONS-----------------------------------------------------------------------------

    D.getElementById("donate_paypal").onclick = function(event) {
        if (event.which == 1) {
            chrome.tabs.create({ url: "https://www.paypal.me/KarolJagiello/1" });
        }
    }
    D.getElementById("donate_litecoin").onclick = function(event) {
        if (event.which == 1) {
            copyStringToClipboard("LdQ1ZH1CgSneBbmmVBFrg5BFDFHZMa6h76");
            alert(chrome.i18n.getMessage("options_copied_wallet_address"));
        }
    }
    D.getElementById("donate_bitcoin").onclick = function(event) {
        if (event.which == 1) {
            copyStringToClipboard("19Z8w1RJEcBQpKSdiWa3UTBuKRJUkr96nJ");
            alert(chrome.i18n.getMessage("options_copied_wallet_address"));
        }
    }
    D.getElementById("donate_ethereum").onclick = function(event) {
        if (event.which == 1) {
            copyStringToClipboard("0x70B05eAD03bF08220d5aF4E1E868C351bfe145D6");
            alert(chrome.i18n.getMessage("options_copied_wallet_address"));
        }
    }

    // --------------------------------COPY VIVALDI LINK----------------------------------------------------------------------	

    D.getElementById("copy_vivaldi_url_for_web_panel").onclick = function(event) {
        if (event.which == 1) {
            copyStringToClipboard(chrome.runtime.getURL("sidebar.html"));
            alert(chrome.i18n.getMessage("options_vivaldi_copied_url"));
        }
    }

    // --------------------------------ADD RED AND BLUE PREVIEWS---------------------------------------------------------------
    // D.body.onmousedown = function(event) {
    // if (event.which == 1 && (event.target.id || event.target.classList)) {
    // console.log(event.target);
    // }
    // }


    D.querySelectorAll("#scrollbar_thumb_hover, #options_tab_list_scrollbar_height_up, #options_tab_list_scrollbar_height_down, #options_tab_list_scrollbar_width_up, #options_tab_list_scrollbar_width_down, .pick_col, .font_weight_normal, .font_weight_bold, .font_style_normal, .font_style_italic, #filter_box_font").forEach(function(s) {
        s.onmouseleave = function(event) {
            RemovePreview();
        }
    });

    // toolbar buttons
    D.getElementById("button_background").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_plus", "backgroundColor", "red", true);
    }
    D.getElementById("button_hover_background").onmouseenter = function(event) {
        AddBlueBackgroundPreview("button_theme_plus", true);
    }

    D.getElementById("button_on_background").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_search", "backgroundColor", "red", true);
    }

    D.getElementById("button_icons").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_plus_img", "backgroundColor", "red", true);
    }
    D.getElementById("button_icons_hover").onmouseenter = function(event) {
        AddBlueBackgroundPreview("button_theme_plus_img", true);
    }
    D.getElementById("button_on_icons").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_search_img", "backgroundColor", "red", true);
    }

    D.getElementById("button_border").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_plus", "border", "1px solid red", true);
    }
    D.getElementById("button_hover_border").onmouseenter = function(event) {
        AddBlueBorderPreview("button_theme_plus", true);
    }


    // search box
    D.getElementById("filter_box_font").onmouseenter = function(event) {
        AddRedStylePreview("filter_box_theme", "color", "red", true);
    }
    D.getElementById("filter_box_background").onmouseenter = function(event) {
        AddRedStylePreview("filter_box_theme", "backgroundColor", "red", true);
    }
    D.getElementById("filter_box_border").onmouseenter = function(event) {
        AddRedStylePreview("filter_box_theme", "border", "1px solid red", true);
    }
    D.getElementById("filter_clear_icon").onmouseenter = function(event) {
        AddRedStylePreview("button_filter_clear_theme", "backgroundColor", "red", true);
    }

    // toolbar background
    D.getElementById("toolbar_background").onmouseenter = function(event) {
        AddRedStylePreview("toolbar_main_theme", "backgroundColor", "red", true);
    }

    // shelf toolbar background
    D.getElementById("toolbar_shelf_background").onmouseenter = function(event) {
        AddRedStylePreview("toolbar_search_input_box_theme", "backgroundColor", "red", true);
    }

    // toolbar's border
    D.getElementById("toolbar_border_bottom").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_search", "border", "1px solid red", true);
        AddRedStylePreview("toolbar_main_theme", "borderBottom", "1px solid red");
        AddRedStylePreview("toolbar_theme", "borderBottom", "1px solid red");
    }

    // shelf toolbar buttons
    D.getElementById("button_shelf_background").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_pen", "backgroundColor", "red", true);
    }
    D.getElementById("button_shelf_hover_background").onmouseenter = function(event) {
        AddBlueBackgroundPreview("button_theme_pen", true);
    }
    D.getElementById("button_shelf_icons").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_pen_img", "backgroundColor", "red", true);
    }
    D.getElementById("button_shelf_icons_hover").onmouseenter = function(event) {
        AddBlueBackgroundPreview("button_theme_pen_img", true);
    }
    D.getElementById("button_shelf_border").onmouseenter = function(event) {
        AddRedStylePreview("button_theme_pen", "border", "1px solid red", true);
    }
    D.getElementById("button_shelf_hover_border").onmouseenter = function(event) {
        AddBlueBorderPreview("button_theme_pen", true);
    }

    // pinned tab attention_background
    D.getElementById("attention_background").onmouseenter = function(event) {
        AddRedStylePreview("tab_header_10", "backgroundColor", "red", true);
        D.getElementById("tab_header_10").style.animation = "none";
    }

    // pinned tab attention_border
    D.getElementById("attention_border").onmouseenter = function(event) {
        AddRedStylePreview("tab_header_10", "border", "1px solid red", true);
        D.getElementById("tab_header_10").style.animation = "none";
    }

    // pin_list border bottom
    D.getElementById("pin_list_border_bottom").onmouseenter = function(event) {
        AddRedStylePreview("pin_list", "borderBottom", "1px solid red", true);
    }

    // pin_list background
    D.getElementById("pin_list_background").onmouseenter = function(event) {
        AddRedStylePreview("pin_list", "backgroundColor", "red", true);
    }


    // tab row font_color
    D.querySelectorAll(".tab_col.font_color").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "color", "red", true);
        }
    });

    // tab row font not bold
    D.querySelectorAll(".tab_col.font_weight_normal").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "color", "red", true);
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "fontWeight", "normal", false);
        }
    });

    // tab row font bold
    D.querySelectorAll(".tab_col.font_weight_bold").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "color", "red", true);
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "fontWeight", "bold", false);
        }
    });

    // tab row font style normal
    D.querySelectorAll(".tab_col.font_style_normal").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "color", "red", true);
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "fontStyle", "normal", false);
        }
    });
    // tab row font style italic
    D.querySelectorAll(".tab_col.font_style_italic").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "color", "red", true);
            AddRedStylePreview("tab_title_" + this.parentNode.id.substr(1), "fontStyle", "italic", false);
        }
    });


    // tab border
    D.querySelectorAll(".tab_col.color_border").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("tab_header_" + this.parentNode.id.substr(1), "border", "1px solid red", true);
        }
    });

    // tab background
    D.querySelectorAll(".tab_col.color_bucket").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("tab_header_" + this.parentNode.id.substr(1), "backgroundColor", "red", true);
        }
    });

    // scrollbars hover
    D.getElementById("scrollbar_thumb_hover").onmouseenter = function(event) {
        AddBlueBackgroundPreview("group_scrollbar_thumb", true);
        AddBlueBackgroundPreview("pin_list_scrollbar_thumb");
    }

    // scrollbars thumb
    D.getElementById("scrollbar_thumb").onmouseenter = function(event) {
        AddRedStylePreview("group_scrollbar_thumb", "backgroundColor", "red", true);
        AddRedStylePreview("pin_list_scrollbar_thumb", "backgroundColor", "red");
    }


    // scrollbars track
    D.getElementById("scrollbar_track").onmouseenter = function(event) {
        AddRedStylePreview("group_scrollbar", "backgroundColor", "red", true);
        AddRedStylePreview("pin_list_scrollbar", "backgroundColor", "red");
    }


    // tab_list scrollbars
    D.querySelectorAll("#options_tab_list_scrollbar_width_up, #options_tab_list_scrollbar_width_down").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("group_scrollbar", "backgroundColor", "red", true);
            AddRedStylePreview("group_scrollbar_thumb", "backgroundColor", "red");
        }
    });

    // pin_list scrollbars
    D.querySelectorAll("#options_tab_list_scrollbar_height_up, #options_tab_list_scrollbar_height_down").forEach(function(s) {
        s.onmouseenter = function(event) {
            AddRedStylePreview("pin_list_scrollbar", "backgroundColor", "red", true);
            AddRedStylePreview("pin_list_scrollbar_thumb", "backgroundColor", "red");
        }
    });



    // folder icon open
    D.getElementById("folder_icon_open").onmouseenter = function(event) {
            AddRedStylePreview("folder_expand_f_folder1", "backgroundColor", "red", true);
        }
        // folder icon closed
    D.getElementById("folder_icon_closed").onmouseenter = function(event) {
            AddRedStylePreview("folder_expand_f_folder2", "backgroundColor", "red", true);
        }
        // folder icon hover
    D.getElementById("folder_icon_hover").onmouseenter = function(event) {
        AddBlueBackgroundPreview("folder_expand_f_folder3", true);
    }


    // tab expand closed
    D.getElementById("expand_closed_background").onmouseenter = function(event) {
            AddRedStylePreview("exp_14", "backgroundColor", "red", true);
        }
        // tab expand hover
    D.getElementById("expand_hover_background").onmouseenter = function(event) {
            AddBlueBackgroundPreview("exp_16", true);
        }
        // tab expand open
    D.getElementById("expand_open_background").onmouseenter = function(event) {
        AddRedStylePreview("exp_5", "backgroundColor", "red", true);
    }





    // drag indicator
    D.getElementById("drag_indicator").onmouseenter = function(event) {
        AddRedStylePreview("drag_indicator_19", "borderBottom", "1px solid red", true);
    }


    // close x
    D.getElementById("close_x").onmouseenter = function(event) {
            AddRedStylePreview("close_img_11", "backgroundColor", "red", true);
        }
        // close x hover
    D.getElementById("close_hover_x").onmouseenter = function(event) {
            AddBlueBackgroundPreview("close_img_13", true);
        }
        // close border hover
    D.getElementById("close_hover_border").onmouseenter = function(event) {
            AddBlueBorderPreview("close_13", true);
        }
        // close border hover
    D.getElementById("close_hover_background").onmouseenter = function(event) {
        AddBlueBackgroundPreview("close_13", true);
    }




    // group button hover
    D.getElementById("group_list_button_hover_background").onmouseenter = function(event) {
            AddBlueBackgroundPreview("_tab_list2", true);
        }
        // group buttons borders
    D.getElementById("group_list_borders").onmouseenter = function(event) {
            AddRedStylePreview("toolbar_groups_block", "borderRight", "1px solid red", true);
            AddRedStylePreview("_tab_list", "border", "1px solid red");
        }
        // group buttons font
    D.getElementById("group_list_default_font_color").onmouseenter = function(event) {
            AddRedStylePreview("_gtetab_list", "color", "red", true);
            AddRedStylePreview("_gtetab_list2", "color", "red");
        }
        // group list background
    D.getElementById("group_list_background").onmouseenter = function(event) {
            AddRedStylePreview("toolbar_groups_block", "backgroundColor", "red", true);
        }
        // tab_list background
    D.getElementById("tab_list_background").onmouseenter = function(event) {
        AddRedStylePreview("tab_list", "backgroundColor", "red", true);
        AddRedStylePreview("_tab_list", "backgroundColor", "red");
    }





    // menu hover border
    D.getElementById("tabs_menu_hover_border").onmouseenter = function(event) {
            AddRedStylePreview("menu_hover_sample", "border", "1px solid red", true);
        }
        // menu hover background
    D.getElementById("tabs_menu_hover_background").onmouseenter = function(event) {
        AddRedStylePreview("menu_hover_sample", "backgroundColor", "red", true);
    }

    // menu separator
    D.getElementById("tabs_menu_separator").onmouseenter = function(event) {
        AddRedStylePreview("menu_separator1", "backgroundColor", "red", true);
        AddRedStylePreview("menu_separator2", "backgroundColor", "red");
    }

    // menu font
    D.getElementById("tabs_menu_font").onmouseenter = function(event) {
        AddRedStylePreview("menu_hover_sample", "color", "red", true);
        AddRedStylePreview("menu_sample1", "color", "red");
        AddRedStylePreview("menu_sample2", "color", "red");
    }


    // menu border
    D.getElementById("tabs_menu_border").onmouseenter = function(event) {
        AddRedStylePreview("tabs_menu", "border", "1px solid red", true);
    }

    // menu background
    D.getElementById("tabs_menu_background").onmouseenter = function(event) {
        AddRedStylePreview("tabs_menu", "backgroundColor", "red", true);
    }



    // --------------------------------------COLOR PICKER---------------------------------------------------------------------	

    // change fonts weight && style
    D.querySelectorAll(".font_weight_normal, .font_weight_bold, .font_style_normal, .font_style_italic").forEach(function(s) {
        s.onmousedown = function(event) {
            event.stopPropagation();
            // if this.classList.contains("font_weight_normal") || this.classList.contains("font_style_normal")
            let FontStyle = "normal";
            if (this.classList.contains("font_weight_bold")) {
                FontStyle = "bold";
            }
            if (this.classList.contains("font_style_italic")) {
                FontStyle = "italic";
            }
            SelectedTheme["ColorsSet"][this.id] = FontStyle;
            TT.Theme.ApplyColorsSet(SelectedTheme["ColorsSet"]);
            TT.Theme.SaveTheme(D.getElementById("theme_list").value);
        }
    });

    // show color picker
    D.querySelectorAll(".pick_col").forEach(function(s) {
        s.onclick = function(event) {
            if (event.which == 1) {
                RemovePreview();
                event.stopPropagation();
                let bod = D.getElementById("body");
                let color = window.getComputedStyle(bod, null).getPropertyValue("--" + this.id);
                let ColorPicker = D.getElementById("color_picker");
                ColorPicker.setAttribute("PickColor", this.id);
                ColorPicker.value = color.replace(" ", "");
                ColorPicker.click();
            }
        }
    });

    D.getElementById("color_picker").oninput = function(event) {
        let ColorPicker = D.getElementById("color_picker");
        SelectedTheme["ColorsSet"][this.getAttribute("PickColor")] = ColorPicker.value;
        TT.Theme.ApplyColorsSet(SelectedTheme["ColorsSet"]);
        // TT.Theme.SaveTheme(D.getElementById("theme_list").value);
    }
    D.getElementById("color_picker").onchange = function(event) {
        TT.Theme.SaveTheme(D.getElementById("theme_list").value);
    }


    // ----------------------------------EVENTS FOR CHECKBOXES AND DROPDOWN MENUS---------------------------------------------	

    // set checkbox options on/off and save
    D.querySelectorAll(".bg_opt").forEach(function(s) {
        s.onclick = function(event) {
            if (event.which == 1) {
                opt[this.id] = this.checked ? true : false;
                if (this.checked) {
                    if (this.id == "never_show_close") {
                        D.getElementById("always_show_close").disabled = true;
                    }
                    if (this.id == "promote_children") {
                        D.getElementById("promote_children_in_first_child").disabled = false;
                    }
                } else {
                    if (this.id == "never_show_close") {
                        D.getElementById("always_show_close").disabled = false;
                    }
                    if (this.id == "promote_children") {
                        D.getElementById("promote_children_in_first_child").disabled = true;
                    }
                }
                TT.Preferences.SavePreferences(opt);
                if (this.id == "show_toolbar") {
                    TT.Toolbar.SaveToolbar();
                    RefreshFields();


                    // setTimeout(function() {
                    // chrome.runtime.sendMessage({command: "reload_toolbar", toolbar: toolbar, opt: opt});
                    // }, 300);
                }
            }
        }
    });


    // options that need reload
    D.onclick = function(event) {
        if (event.which == 1) {
            if (event.target.id == "syncro_tabbar_tabs_order" || event.target.id == "allow_pin_close" || event.target.id == "switch_with_scroll" || event.target.id == "always_show_close" || event.target.id == "never_show_close" || event.target.id == "hide_other_groups_tabs_firefox" ||
                event.target.id == "collapse_other_trees" || event.target.id == "show_counter_tabs" || event.target.id == "show_counter_tabs_hints" || event.target.id == "syncro_tabbar_tabs_order" || event.target.id == "syncro_tabbar_groups_tabs_order" || event.target.id == "groups_toolbar_default") {
                setTimeout(function() {
                    chrome.runtime.sendMessage({ command: "reload_sidebar" });
                }, 50);
            }
            if (event.target.id == "groups_toolbar_default") {
                chrome.runtime.sendMessage({ command: "reload" });
                setTimeout(function() {
                    location.reload();
                }, 300);
            }
        }
    }

    // set dropdown menu options
    for (let i = 0; i < DropDownList.length; i++) {
        D.getElementById(DropDownList[i]).onchange = function(event) {
            opt[this.id] = this.value;
            RefreshFields();
            setTimeout(function() {
                TT.Preferences.SavePreferences(opt);
                // chrome.runtime.sendMessage({command: "reload_sidebar"});
            }, 50);
        }
    }

    // set tabs tree depth option
    D.getElementById("max_tree_depth").oninput = function(event) {
        opt.max_tree_depth = parseInt(this.value);
        setTimeout(function() {
            TT.Preferences.SavePreferences(opt);
        }, 50);
    }

    // set toolbar on/off and show/hide all toolbar options
    // D.getElementById("show_toolbar").onclick = function(event) {if (event.which == 1) {
    // SelectedTheme.ToolbarShow = this.checked ? true : false;
    // RefreshFields();
    // TT.Theme.SaveTheme(D.getElementById("theme_list").value);
    // }}


    // ------------------------------OTHER-----------------------------------------------------------------------------------	

    // block system dragging
    D.ondrop = function(event) {
        event.preventDefault();
    }
    D.ondragover = function(event) {
        event.preventDefault();
    }

    // ------------------------------ADD REGEX FILTER-------------------------------------------------------------------------	

    D.getElementById("add_tab_group_regex").onclick = AddRegexPair;

    // ----------------------------RESET TOOLBAR BUTTON-----------------------------------------------------------------------	

    D.getElementById("options_reset_toolbar_button").onclick = function(event) {
        if (event.which == 1) {

            TT.Toolbar.SetToolbarEvents(true, false, false, "", false, false);
            RemoveToolbarEditEvents();


            let unused_buttons = D.getElementById("toolbar_unused_buttons");
            while (unused_buttons.hasChildNodes()) {
                unused_buttons.removeChild(unused_buttons.firstChild);
            }

            TT.Toolbar.RemoveToolbar();
            TT.Toolbar.RecreateToolbar(DefaultToolbar);
            TT.Toolbar.SetToolbarEvents(false, false, true, "click", false, true);
            AddEditToolbarEditEvents();

            TT.Toolbar.SaveToolbar();


        }
    }


    // --------------------------------------THEME BUTTONS--------------------------------------------------------------------	


    // add new theme preset button
    D.getElementById("options_add_theme_button").onclick = function(event) {
        if (event.which == 1) {
            TT.Theme.AddNewTheme();
        }
    }

    // remove theme preset button
    D.getElementById("options_remove_theme_button").onclick = function(event) {
        if (event.which == 1) {
            TT.Theme.DeleteSelectedTheme();
        }
    }

    // select theme from list
    D.getElementById("theme_list").onchange = function(event) {
        TT.Theme.LoadTheme(this.value, true);
        chrome.storage.local.set({ current_theme: this.value });
    }

    // import theme preset button
    D.getElementById("options_import_theme_button").onclick = function(event) {
        if (event.which == 1) {
            let inputFile = TT.File.ShowOpenFileDialog(".tt_theme");
            inputFile.onchange = function(event) {
                TT.Theme.ImportTheme();
            }
        }
    }

    // export theme preset button
    D.getElementById("options_export_theme_button").onclick = function(event) {
        if (event.which == 1) {
            let ThemeList = D.getElementById("theme_list");
            if (ThemeList.options.length == 0) {
                alert(chrome.i18n.getMessage("options_no_theme_to_export"));
            } else {
                TT.File.SaveFile(ThemeList.options[ThemeList.selectedIndex].text, "tt_theme", SelectedTheme);
            }
        }
    }

    // rename theme preset button
    D.getElementById("options_rename_theme_button").onclick = function(event) {
            if (event.which == 1) {
                TT.Theme.RenameSelectedTheme();
            }
        }
        // get themes
    D.getElementById("options_share_theme_link").onclick = function(event) {
        if (event.which == 1) {
            chrome.tabs.create({ url: "https://drive.google.com/drive/folders/0B3jXQpRtOfvSelFrTEVHZEx3Nms?usp=sharing" });
        }
    }


    // -------------------------------INDENTATION ADJUSTMENT------------------------------------------------------------------	

    // change tabs size preset(down)
    D.getElementById("options_tabs_indentation_down").onmousedown = function(event) {
        let bod = D.getElementById("body");
        var indentation = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--children_padding_left")).replace("p", "").replace("x", ""));
        if (indentation > 0) {
            indentation--;
            SelectedTheme["ColorsSet"]["children_padding_left"] = indentation + "px";
            TT.Theme.ApplyColorsSet(SelectedTheme["ColorsSet"]);
            TT.Theme.SaveTheme(D.getElementById("theme_list").value);
        }
    }

    // change tabs size preset(up)
    D.getElementById("options_tabs_indentation_up").onmousedown = function(event) {
        let bod = D.getElementById("body");
        var indentation = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--children_padding_left")).replace("p", "").replace("x", ""));
        if (indentation < 50) {
            indentation++;
            SelectedTheme["ColorsSet"]["children_padding_left"] = indentation + "px";
            TT.Theme.ApplyColorsSet(SelectedTheme["ColorsSet"]);
            TT.Theme.SaveTheme(D.getElementById("theme_list").value);
        }
    }


    // --------------------------TABS ROUNDNESS ADJUSTMENT--------------------------------------------------------------------	

    // change tabs roundness preset(down)
    D.getElementById("options_tabs_roundness_down").onmousedown = function(event) {
        let bod = D.getElementById("body");
        var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--tab_header_border_radius").replace("p", "").replace("x", "")));
        if (border_radius > 0) {
            border_radius--;
            SelectedTheme["ColorsSet"]["tab_header_border_radius"] = border_radius + "px";
            TT.Theme.ApplyColorsSet(SelectedTheme["ColorsSet"]);
            TT.Theme.SaveTheme(D.getElementById("theme_list").value);
        }
    }

    // change tabs roundness preset(up)
    D.getElementById("options_tabs_roundness_up").onmousedown = function(event) {
        let bod = D.getElementById("body");
        var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--tab_header_border_radius")).replace("p", "").replace("x", ""));
        if (border_radius < 25) {
            border_radius++;
            SelectedTheme["ColorsSet"]["tab_header_border_radius"] = border_radius + "px";
            TT.Theme.ApplyColorsSet(SelectedTheme["ColorsSet"]);
            TT.Theme.SaveTheme(D.getElementById("theme_list").value);
        }
    }

    // -------------------------------SIZE ADJUSTMENT-------------------------------------------------------------------------	

    // set tabs margins
    D.getElementById("tabs_margin_spacing").onchange = function(event) {
        let size = "0";
        if (this[1].checked) {
            size = "1";
        } else {
            if (this[2].checked) {
                size = "2";
            }
        }
        SelectedTheme["TabsMargins"] = size;
        TT.Theme.ApplyTabsMargins(size);
        TT.Theme.SaveTheme(D.getElementById("theme_list").value);
    }


    // change tabs size preset(down)
    D.getElementById("options_tabs_size_down").onmousedown = function(event) {
        if (SelectedTheme["TabsSizeSetNumber"] > 0) {
            SelectedTheme["TabsSizeSetNumber"]--;
            TT.Theme.ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
            TT.Theme.SaveTheme(D.getElementById("theme_list").value);
        }
    }

    // change tabs size preset(up)
    D.getElementById("options_tabs_size_up").onmousedown = function(event) {
        if (SelectedTheme["TabsSizeSetNumber"] < 4) {
            SelectedTheme["TabsSizeSetNumber"]++;
            TT.Theme.ApplySizeSet(SelectedTheme["TabsSizeSetNumber"]);
            TT.Theme.SaveTheme(D.getElementById("theme_list").value);
        }
    }


    // -------------------------------TABS SCROLLBAR SIZE ADJUSTMENT----------------------------------------------------------	

    // change tab list scrollbar preset(down)
    D.getElementById("options_tab_list_scrollbar_width_down").onmousedown = function(event) {
        let bod = D.getElementById("body");
        var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_width").replace("p", "").replace("x", "")));
        if (border_radius > 0) {
            border_radius--;
            SelectedTheme["ColorsSet"]["scrollbar_width"] = border_radius + "px";
            TT.Theme.ApplyColorsSet(SelectedTheme["ColorsSet"]);
            TT.Theme.SaveTheme(D.getElementById("theme_list").value);
        }
    }

    // change tab list scrollbar preset(up)
    D.getElementById("options_tab_list_scrollbar_width_up").onmousedown = function(event) {
        let bod = D.getElementById("body");
        var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_width")).replace("p", "").replace("x", ""));
        if (border_radius < 20) {
            border_radius++;
            SelectedTheme["ColorsSet"]["scrollbar_width"] = border_radius + "px";
            TT.Theme.ApplyColorsSet(SelectedTheme["ColorsSet"]);
            TT.Theme.SaveTheme(D.getElementById("theme_list").value);
        }
    }

    // change pin list scrollbar preset(down)
    D.getElementById("options_tab_list_scrollbar_height_down").onmousedown = function(event) {
        let bod = D.getElementById("body");
        var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_height").replace("p", "").replace("x", "")));
        if (border_radius > 0) {
            border_radius--;
            SelectedTheme["ColorsSet"]["scrollbar_height"] = border_radius + "px";
            TT.Theme.ApplyColorsSet(SelectedTheme["ColorsSet"]);
            TT.Theme.SaveTheme(D.getElementById("theme_list").value);
        }
    }

    // change pin list scrollbar preset(up)
    D.getElementById("options_tab_list_scrollbar_height_up").onmousedown = function(event) {
        let bod = D.getElementById("body");
        var border_radius = parseInt((window.getComputedStyle(bod, null).getPropertyValue("--scrollbar_height")).replace("p", "").replace("x", ""));
        if (border_radius < 20) {
            border_radius++;
            SelectedTheme["ColorsSet"]["scrollbar_height"] = border_radius + "px";
            TT.Theme.ApplyColorsSet(SelectedTheme["ColorsSet"]);
            TT.Theme.SaveTheme(D.getElementById("theme_list").value);
        }
    }



    // ----------------------EXPORT DEBUG LOG---------------------------------------------------------------------------------	
    D.getElementById("options_export_debug").onclick = function(event) {
        if (event.which == 1) {
            chrome.storage.local.get(null, function(storage) {
                TT.File.SaveFile("TreeTabs", "log", storage.debug_log);
            });
        }
    }

    // ----------------------IMPORT DEBUG LOG----------------------------------------------------------------------------	
    D.getElementById("options_print_debug").onclick = function(event) {
        if (event.which == 1) {
            let inputFile = TT.File.ShowOpenFileDialog(".log");
            inputFile.onchange = function(event) {
                let file = D.getElementById("file_import");
                let fr = new FileReader();
                if (file.files[0] == undefined) return;
                fr.readAsText(file.files[file.files.length - 1]);
                fr.onload = function() {
                    let data = fr.result;
                    file.parentNode.removeChild(file);
                    let LoadedData = JSON.parse(data);
                    // LoadedData.forEach(function(d) {
                    // console.log(d);
                    // });
                    // LoadedData.forEach(function(d) {
                    console.log(LoadedData);
                    // });
                }
            }

        }
    }

    // ----------------------CLEAR DATA BUTTON--------------------------------------------------------------------------------	

    // clear data
    D.getElementById("options_clear_data").onclick = function(event) {
        if (event.which == 1) {
            chrome.storage.local.clear();
            setTimeout(function() {
                chrome.runtime.sendMessage({ command: "reload" });
                chrome.runtime.sendMessage({ command: "reload_sidebar" });
                location.reload();
            }, 100);
        }
    }

}

function RemoveToolbarEditEvents() {
    D.querySelectorAll("#button_filter_clear").forEach(function(s) {
        s.style.opacity = "0";
    });
    D.querySelectorAll(".button").forEach(function(s) {
        s.removeAttribute("draggable");
    });
}

// ----------------------EDIT TOOLBAR-------------------------------------------------------------------------------------	
function AddEditToolbarEditEvents() {
    D.querySelectorAll("#button_filter_clear").forEach(function(s) {
        s.style.opacity = "1";
    });

    D.querySelectorAll("#toolbar_main .button_img, #toolbar_shelf_tools .button_img, #toolbar_shelf_groups .button_img, #toolbar_shelf_backup .button_img, #toolbar_shelf_folders .button_img").forEach(function(s) {
        s.setAttribute("draggable", true);
        s.onmousedown = function(event) {
            if (event.which == 1) {
                dragged_button = D.getElementById(this.parentNode.id);
            }
        }
        s.ondragstart = function(event) {
                event.dataTransfer.setData(" ", " ");
                event.dataTransfer.setDragImage(D.getElementById("DragImage"), 0, 0);
            }
            // move (flip) buttons
        s.ondragenter = function(event) {
                if ((dragged_button.id == "button_tools" || dragged_button.id == "button_search" || dragged_button.id == "button_groups" || dragged_button.id == "button_backup" || dragged_button.id == "button_folders") && this.parentNode.parentNode.classList.contains("toolbar_shelf")) {
                    return;
                }
                let dragged_buttonIndex = Array.from(dragged_button.parentNode.children).indexOf(dragged_button);
                let Index = Array.from(this.parentNode.parentNode.children).indexOf(this.parentNode);

                if (Index <= dragged_buttonIndex) {
                    TT.DOM.InsterBeforeNode(dragged_button, this.parentNode);
                } else {
                    TT.DOM.InsterAfterNode(dragged_button, this.parentNode);
                }
            }
            // save toolbar
        s.ondragend = function(event) {
            RemoveToolbarEditEvents();
            TT.Toolbar.SaveToolbar();
            AddEditToolbarEditEvents();
        }
    });


    D.querySelectorAll("#toolbar_main, .toolbar_shelf:not(#toolbar_search), #toolbar_unused_buttons").forEach(function(s) {
        s.ondragenter = function(event) {
            if ((dragged_button.id == "button_tools" || dragged_button.id == "button_search" || dragged_button.id == "button_groups" || dragged_button.id == "button_backup" || dragged_button.id == "button_folders") && this.classList.contains("toolbar_shelf")) {
                return;
            }
            if (dragged_button.parentNode.id != this.id) {
                this.appendChild(dragged_button);
            }

        }
    });
}

function copyStringToClipboard(string) {
    function handler(event) {
        event.clipboardData.setData('text/plain', string);
        event.preventDefault();
        D.removeEventListener('copy', handler, true);
    }
    D.addEventListener('copy', handler, true);
    D.execCommand('copy');
}


// shrink or expand theme field
function RefreshFields() {
    if (D.getElementById("theme_list").options.length == 0) {
        D.getElementById("field_theme").style.height = "45px";
    } else {
        D.getElementById("field_theme").style.height = "";
    }
    if (browserId == "F") {
        D.querySelectorAll("#scrollbar_size_indicator, #scrollbar_thumb, #scrollbar_thumb_hover, #scrollbar_track").forEach(function(s) {
            s.style.display = "none";
        });
    } else {
        D.querySelectorAll("#firefox_option_hide_other_groups_tabs_firefox").forEach(function(s) {
            s.style.display = "none";
        });
    }
    if (browserId == "V") {
        let WebPanelUrlBox = D.getElementById("url_for_web_panel");
        WebPanelUrlBox.value = (chrome.runtime.getURL("sidebar.html"));
        WebPanelUrlBox.setAttribute("readonly", true);
        D.getElementById("field_vivaldi").style.display = "block";
    }
    if (D.getElementById("show_toolbar").checked) {
        D.querySelectorAll("#options_available_buttons, #sample_toolbar_block, #options_reset_toolbar_button").forEach(function(s) {
            s.style.display = "";
        });
        D.getElementById("options_toolbar_look").style.display = "";
        D.getElementById("field_show_toolbar").style.height = "";
    } else {
        D.querySelectorAll("#options_available_buttons, #sample_toolbar_block, #options_reset_toolbar_button").forEach(function(s) {
            s.style.display = "none";
        });
        D.getElementById("options_toolbar_look").style.display = "none";
        D.getElementById("field_show_toolbar").style.height = "6";
    }


    if (D.getElementById("append_child_tab").value == "after") {
        D.getElementById("append_child_tab_after_limit_dropdown").style.display = "none";
        D.getElementById("options_append_orphan_tab_as_child").style.display = "none";

        if (opt.append_child_tab == "after" && opt.append_orphan_tab == "as_child") {
            opt.append_orphan_tab = "after_active";
            D.getElementById("append_orphan_tab").value = "after_active";
            TT.Preferences.SavePreferences(opt);
        }

    } else {
        D.getElementById("append_child_tab_after_limit_dropdown").style.display = "";
        D.getElementById("options_append_orphan_tab_as_child").style.display = "";
    }
}

function RefreshGUI() {
    let button_filter_type = D.getElementById("button_filter_type");
    if (button_filter_type != null) {
        button_filter_type.classList.add("url");
        button_filter_type.classList.remove("title");
    }
    if (D.querySelector(".on") != null) {
        D.getElementById("toolbar").style.height = "53px";
    } else {
        D.getElementById("toolbar").style.height = "26px";
    }
}

function AppendSampleTabs() {

    // folders
    TT.Folders.AddNewFolder({ folderId: "f_folder1", ParentId: "°tab_list", Name: labels.noname_group, Index: 0, ExpandState: "o", SkipSetEvents: true, AdditionalClass: "o" });
    TT.Folders.AddNewFolder({ folderId: "f_folder2", ParentId: "f_folder1", Name: labels.noname_group, Index: 0, ExpandState: "c", SkipSetEvents: true, AdditionalClass: "c" });
    TT.Folders.AddNewFolder({ folderId: "f_folder3", ParentId: "f_folder1", Name: labels.noname_group, Index: 0, ExpandState: "c", SkipSetEvents: true, AdditionalClass: "c" });


    // pins
    tt.tabs["0"] = new TT.Tabs.ttTab({ tab: { id: 0, pinned: true, active: false }, Append: true, SkipSetActive: true, SkipSetEvents: true, SkipFavicon: true, SkipMediaIcon: true });
    tt.tabs["1"] = new TT.Tabs.ttTab({ tab: { id: 1, pinned: true, active: false }, Append: true, SkipSetActive: true, SkipSetEvents: true, SkipFavicon: true, SkipMediaIcon: true });
    tt.tabs["10"] = new TT.Tabs.ttTab({ tab: { id: 10, pinned: true, active: false }, Append: true, SkipSetActive: true, SkipSetEvents: true, SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("10").classList.add("attention");

    // regular tabs
    tt.tabs["2"] = new TT.Tabs.ttTab({ tab: { id: 2, pinned: false, active: false }, Append: true, SkipSetActive: true, SkipSetEvents: true, addCounter: true, SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_2").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal");

    tt.tabs["11"] = new TT.Tabs.ttTab({ tab: { id: 11, pinned: false, active: false }, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_11").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_hover");
    D.getElementById("tab_header_11").classList.add("tab_header__hover");
    D.getElementById("tab_header_11").classList.add("close_show");

    tt.tabs["12"] = new TT.Tabs.ttTab({ tab: { id: 12, pinned: false, active: false }, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_12").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_selected");

    tt.tabs["13"] = new TT.Tabs.ttTab({ tab: { id: 13, pinned: false, active: false }, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_13").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_normal_selected_hover");
    D.getElementById("tab_header_13").classList.add("tab_header_hover")
    D.getElementById("tab_header_13").classList.add("close_show");
    D.getElementById("close_13").classList.add("close_hover");

    // regular active tabs
    tt.tabs["3"] = new TT.Tabs.ttTab({ tab: { id: 3, pinned: false, active: false }, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "active_tab", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_3").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active");

    tt.tabs["15"] = new TT.Tabs.ttTab({ tab: { id: 15, pinned: false, active: false }, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "active_tab", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_15").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_hover");
    D.getElementById("tab_header_15").classList.add("tab_header_hover");

    tt.tabs["14"] = new TT.Tabs.ttTab({ tab: { id: 14, pinned: false, active: false }, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "c selected active_tab", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_14").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_selected");

    tt.tabs["16"] = new TT.Tabs.ttTab({ tab: { id: 16, pinned: false, active: false }, ParentId: "2", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "c selected active_tab", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_16").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_active_selected_hover");
    D.getElementById("tab_header_16").classList.add("tab_header_hover");
    D.getElementById("exp_16").classList.add("hover");

    // discarded tabs
    tt.tabs["5"] = new TT.Tabs.ttTab({ tab: { id: 5, pinned: false, active: false, discarded: true }, Append: true, SkipSetActive: true, SkipSetEvents: true, SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_5").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded");

    tt.tabs["17"] = new TT.Tabs.ttTab({ tab: { id: 17, pinned: false, active: false, discarded: true }, ParentId: "5", Append: true, SkipSetActive: true, SkipSetEvents: true, SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_17").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_hover");
    D.getElementById("tab_header_17").classList.add("tab_header_hover");

    tt.tabs["19"] = new TT.Tabs.ttTab({ tab: { id: 19, pinned: false, active: false, discarded: true }, ParentId: "5", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected highlighted_drop_target after", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_19").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_selected");

    tt.tabs["20"] = new TT.Tabs.ttTab({ tab: { id: 20, pinned: false, active: false, discarded: true }, ParentId: "5", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_20").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_discarded_selected_hover");
    D.getElementById("tab_header_20").classList.add("tab_header_hover");

    // search result
    tt.tabs["6"] = new TT.Tabs.ttTab({ tab: { id: 6, pinned: false, active: false }, Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_6").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result");

    tt.tabs["21"] = new TT.Tabs.ttTab({ tab: { id: 21, pinned: false, active: false }, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_21").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_hover");
    D.getElementById("tab_header_21").classList.add("tab_header_hover");

    tt.tabs["22"] = new TT.Tabs.ttTab({ tab: { id: 22, pinned: false, active: false }, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered active_tab", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_22").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_active");

    tt.tabs["23"] = new TT.Tabs.ttTab({ tab: { id: 23, pinned: false, active: false }, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered active_tab", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_23").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_active_hover");
    D.getElementById("tab_header_23").classList.add("tab_header_hover");


    // search result selected
    tt.tabs["8"] = new TT.Tabs.ttTab({ tab: { id: 8, pinned: false, active: false }, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_8").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected");

    tt.tabs["18"] = new TT.Tabs.ttTab({ tab: { id: 18, pinned: false, active: false }, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_18").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_hover");
    D.getElementById("tab_header_18").classList.add("tab_header_hover");

    tt.tabs["25"] = new TT.Tabs.ttTab({ tab: { id: 25, pinned: false, active: false }, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered active_tab", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_25").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_active");


    tt.tabs["26"] = new TT.Tabs.ttTab({ tab: { id: 26, pinned: false, active: false }, ParentId: "6", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered active_tab", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_26").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_selected_active_hover");
    D.getElementById("tab_header_26").classList.add("tab_header_hover");

    // search result highlighted
    tt.tabs["30"] = new TT.Tabs.ttTab({ tab: { id: 30, pinned: false, active: false }, Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered highlighted_search", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_30").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted");

    tt.tabs["31"] = new TT.Tabs.ttTab({ tab: { id: 31, pinned: false, active: false }, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered highlighted_search", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_31").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_hover");
    D.getElementById("tab_header_31").classList.add("tab_header_hover");

    tt.tabs["32"] = new TT.Tabs.ttTab({ tab: { id: 32, pinned: false, active: false }, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered highlighted_search active_tab", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_32").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_active");

    tt.tabs["33"] = new TT.Tabs.ttTab({ tab: { id: 33, pinned: false, active: false }, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "filtered highlighted_search active_tab", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_33").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_active_hover");
    D.getElementById("tab_header_33").classList.add("tab_header_hover");

    tt.tabs["34"] = new TT.Tabs.ttTab({ tab: { id: 34, pinned: false, active: false }, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered highlighted_search", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_34").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected");

    tt.tabs["35"] = new TT.Tabs.ttTab({ tab: { id: 35, pinned: false, active: false }, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered highlighted_search", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_35").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_hover");
    D.getElementById("tab_header_35").classList.add("tab_header_hover");

    tt.tabs["36"] = new TT.Tabs.ttTab({ tab: { id: 36, pinned: false, active: false }, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered highlighted_search active_tab", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_36").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_active");

    tt.tabs["37"] = new TT.Tabs.ttTab({ tab: { id: 37, pinned: false, active: false }, ParentId: "30", Append: true, SkipSetActive: true, SkipSetEvents: true, AdditionalClass: "selected filtered highlighted_search active_tab", SkipFavicon: true, SkipMediaIcon: true });
    D.getElementById("tab_title_37").textContent = chrome.i18n.getMessage("options_theme_tabs_sample_text_search_result_highlighted_selected_active_hover");
    D.getElementById("tab_header_37").classList.add("tab_header_hover");

    D.getElementById("_tab_list").classList.add("active_group");

}