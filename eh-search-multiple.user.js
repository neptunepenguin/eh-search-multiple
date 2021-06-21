// ==UserScript==
// @name        eh-search-multiple
// @namespace   e-hentai
// @description Select several tags in a gallery and a search for all of them
// @include     https://e-hentai.org/g/*
// @include     https://exhentai.org/g/*
// @include     http://e-hentai.org/g/*
// @version     0.6
// @grant       none
// ==/UserScript==
/*
@usage_start

The script (eh-search-multiple.user.js) adds a toggle button which can switch
into a search mode for tags.  In search mode, tagging is disabled and you can
select multiple tags in the tag pane.  The tagging field is also changed, and
it displays all tags that have been selected in the format used for tag
searching.

After selecting all desired tags you can edit the text field if needed and then
click the new "Search!" button (that is placed instead of the "Tag!" button).
The search is performed on the main page.  The state of the toggle is carried
across different galleries and page reloads by means of local browser storage.

@usage_end

@licstart

eh-search-multiple.user.js - adds a search mode for gallery tags

Copyright (C) 2016 Aquamarine Penguin

This JavaScript code is free software: you can redistribute it and/or modify it
under the terms of the GNU General Public License (GNU GPL) as published by the
Free Software Foundation, either version 3 of the License, or (at your option)
any later version.

This JavaScript code is distributed WITHOUT ANY WARRANTY; without even the
implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See
the GNU GPL for more details.

The full text of the license can be found in the COPYING file.  If you cannot
find this file, see <http://www.gnu.org/licenses/>.

@licend
*/

"use strict;";

(function () {
  var script_uuid = "eh-search-multiple";

  function scriptPanel() {
    var panelId = "penguin-script-panel";
    var panel = document.getElementById(panelId);
    if (panel) {
      return panel;
    }
    var panel = document.createElement("div");
    var style = "position:fixed;z-index:100;top:0;left:0;";
    style += "padding:20px;border-radius:3px;border:2px solid white;";
    style += "text-align:left;font-size:10pt;";
    panel.style = style;
    panel.setAttribute("id", panelId);
    document.body.appendChild(panel);
    // we may wish to override this one often
    panel.style.cursor = "auto";
    return panel;
  }

  var newtField = document.getElementById("newtagfield");
  var newtButton = document.getElementById("newtagbutton");
  var taglist = document.getElementById("taglist");

  // we can get the tag namespace from the id of the anchor
  function tagFromId(tagId) {
    return tagId.substr(3).replace(/_/g, " ");
  }

  // we have a class placed on all elements we want to search for
  function makeQueryString() {
    var tags = document.getElementsByClassName(script_uuid);
    var arr = [];
    for (var tag of tags) {
      arr.push(tagFromId(tag.id));
    }
    if (arr.length > 0) {
      var query_str = arr.join('$" "');
      return '"' + query_str + '$"';
    } else {
      return '';
    }
  }

  // performs the search for all selected tags.
  function performSearch() {
    var query_str = newtField.value;
    var search = location.origin + "/?f_cats="
    search += currCats;
    search += "&f_search=";
    search += encodeURIComponent(query_str);
    window.location.href = search;
    return false;
  }

  // attempt to reinstate the old listener
  function tagMenu() {
    var tag_name = tagFromId(this.id);
    // this is Tenboro's function, if it changes things will break
    return toggle_tagmenu(tag_name, this);
  }

  // restore the functionality of the "Tag" button
  function tagButton() {
    // again, Tenboro's function
    tag_from_field();
    return false;
  }

  // our modified listener for clicks on tags
  function tagSearch() {
    if (this.classList.contains(script_uuid)) {
      this.classList.remove(script_uuid);
      this.style = "";
    } else {
      this.classList.add(script_uuid);
      this.style = "color:deepskyblue;";
    }
    newtField.value = makeQueryString();
    return false;
  }

  // remove the original listeners from the tags and add our own
  function toggleSearch() {
    // Tenboro's function, clears tag state when called without arguments
    toggle_tagmenu();
    newtField.placeholder = "Query preview";
    newtField.size = 40;  // ignored on FF but we still keep it
    newtButton.value = "Search!";
    newtButton.onclick = performSearch;
    taglist.style.height = "265px";
    cats.style.display = "block";
    var tags = document.querySelectorAll("#taglist a");
    for (var tag of tags) {
      tag.onclick = tagSearch;
    }
    newtField.value = makeQueryString();  // just in case
    return false;
  }

  // try to make things look as before
  function toggleTagging() {
    newtField.placeholder = "Enter new tags, separated with comma";
    newtField.size = 60;
    newtField.value = "";
    newtButton.value = "Tag!";
    newtButton.onclick = tagButton;
    taglist.style.height = "295px";
    cats.style.display = "none";
    var tags = document.querySelectorAll("#taglist a");
    for (var tag of tags) {
      tag.onclick = tagMenu;
      tag.classList.remove(script_uuid);
      tag.style = "";
    }
    return false;
  }

  var currCats = 0;
  var catValues = new Map([ ["Misc", 1]
                          , ["Doujinshi", 2]
                          , ["Manga", 4]
                          , ["Artist CG", 8]
                          , ["Game CG", 16]
                          , ["Image Set", 32]
                          , ["Cosplay", 64]
                          , ["Asian Porn", 128]
                          , ["Non-H", 256]
                          , ["Western", 512]
  ]);
  var cats = document.createElement("div");
  cats.style.display = "none";
  for (var [k, v] of catValues.entries()) {
    var div = document.createElement("div");
    var style = "font-size:1.2em;float:left;";
    style += "cursor:pointer;padding:2px;border:1px solid;";
    style += "border-radius:5px;margin:1px;fon";
    div.style = style;
    var text = document.createTextNode(k);
    div.appendChild(text);
    cats.appendChild(div);
    div.className = script_uuid + "-on";
    // closure
    div.onclick = (function() {
      var myDiv = div;
      var myCat = v;
      return (function(e) {
        if (myDiv.className === script_uuid + "-on") {
          myDiv.className = script_uuid + "-off";
          myDiv.style.opacity = 0.3;
          currCats += myCat;
          console.log("f_cats=" + currCats);
        } else {
          myDiv.className = script_uuid + "-on";
          myDiv.style.opacity = 1.0;
          currCats -= myCat;
          console.log("f_cats=" + currCats);
        }
      });
    })();
  }
  var centerPane = taglist.parentNode;
  centerPane.appendChild(cats);

  var label = document.createElement("div");
  var down = document.createTextNode("mode");
  label.style.textAlign = "center";
  label.appendChild(down);

  var toggle = document.createElement("div");
  toggle.style.textAlign = "center";
  var tagMode = document.createTextNode("tagging");
  var searchMode = document.createTextNode("search");
  toggle.style.padding = "2px";
  toggle.style.cursor = "pointer";
  toggle.style.color = "peru";
  toggle.appendChild(tagMode);
  toggle.addEventListener("click", function(e) {
    if (toggle.contains(tagMode)) {
      toggle.style.color = "deepskyblue";
      localStorage.setItem(script_uuid, "search");
      toggleSearch();
      toggle.replaceChild(searchMode, tagMode);
    } else {
      toggle.style.color = "peru";
      localStorage.setItem(script_uuid, "tag");
      toggleTagging();
      toggle.replaceChild(tagMode, searchMode);
    }
  });

  var panel = scriptPanel();
  panel.appendChild(label);
  panel.appendChild(toggle);
  var state = localStorage.getItem(script_uuid);
  if ("search" === state) {
    toggle.click();
  }
})();

// useful to tell us if something blew up
console.log("eh-search-multiple is active");

