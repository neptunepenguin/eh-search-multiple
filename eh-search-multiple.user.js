// ==UserScript==
// @name        eh-search-multiple
// @namespace   e-hentai
// @description Select several tags in a gallery and a search for all of them
// @include     https://e-hentai.org/g/*
// @include     https://exhentai.org/g/*
// @include     http://e-hentai.org/g/*
// @include     http://g.e-hentai.org/g/*
// @version     0.4
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
The search is performed on the main page.

The button to enter search mode is shown as "> < Tagging Mode > <", and when
clicked it becomes "> < Search Mode > <".  By clicking the same button again
you return to the normal tagging mode.  The state of the toggle is carried
across different galleries and page reloads by means of local browser storage.

TODO:  Add an option to search by gallery category.  Maybe by including a
checkbox next to the category on the current gallery.

KNOWN BUGS:  If you select a tag in tagging mode and then switch to search mode
and back to tagging mode again, the tag selection will get messed up.
Reloading the page (F5 or Ctrl+R) is a temporary fix.

COMPATIBILITY NOTE: Since most of the gallery page is measured in pixels there
is little space where placing new elements will not mangle the layout. To add
more buttons (from other scripts) I suggests placing 'inline-block' buttons
above the title, this way the buttons will line together above the title.

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

"use strict";

(function () {
    var the_uuid = 'eh-search-multiple';
    var title_pane = document.querySelector('#gd2');
    var title = document.querySelector('#gn');
    var top_p = document.createElement('p');
    var top_a = document.createElement('a');
    var text_tag = document.createTextNode('> < Tagging Mode > <');
    var text_search = document.createTextNode('> < Search Mode > <');
    var newt_field = document.querySelector('#newtagfield');
    var newt_button = document.querySelector('#newtagbutton');
    var style_tag = 'color:#aa9955;font-size:1.2em;display:inline-block;';
    var style_search = 'color:#33ccee;font-size:1.2em;display:inline-block;';
    top_p.className = 'g2';
    top_a.style = style_tag;
    top_a.href = '#';
    top_a.appendChild(text_tag);
    top_p.appendChild(top_a);
    title_pane.insertBefore(top_p, title);

    /* Thankfully we can get the tag namespace from the id of the anchor.
     * Otherwise we would need to jump backwards through the parents' relations
     * to get the namespace from the left column.
     */
    function tag_from_id(tag_id) {
        return tag_id.substr(3).replace(/_/g, ' ');
    }

    /* We defined a class that will be placed on all elements we want to search
     * for, thanks to that making the search string is simply a question of
     * getting all elements with the class and bundling together.
     */
    function make_query_string() {
        var tags = document.querySelectorAll('.' + the_uuid);
        var arr = [];
        for (var tag of tags) {
            arr.push(tag_from_id(tag.id));
        }
        if (arr.length > 0) {
            var query_str = arr.join('$" "');
            return '"' + query_str + '$"';
        } else {
            return '';
        }
    }

    /* This will perform the search for all selected tags.
     * TODO: Something clever could be made to search only for the category of
     * the current gallery.
     */
    function do_search() {
        var query_str = newt_field.value;
        var search = location.origin + '/?f_doujinshi=1&f_manga=1&f_artistcg=1';
        search += '&f_gamecg=1&f_western=1&f_non-h=1&f_imageset=1';
        search += '&f_cosplay=1&f_asianporn=1&f_misc=1&f_search=';
        search += encodeURIComponent(query_str);
        search += '&f_apply=Apply+Filter';
        window.location.href = search;
        return false;
    }

    /* We cannot simply remove our listener because the website has a listener
     * of its own.  So we need to reinstate the old listener.  Unfortunately we
     * do not have the API code so we need to cross fingers that the same
     * function that is currently being used by the tagging system do work as a
     * callback.
     */
    function tag_menu() {
        var tag_name = tag_from_id(this.id);
        // this is Tenboro's function, if it changes things will break
        return toggle_tagmenu(tag_name, this);
    }

    /* We also need to restore the functionality of the "Tag!" button after we
     * are done with it.  This mocks a similar functionality that we put in.
     */
    function tag_button() {
        tag_from_field();
        return false;
    }

    /* Our listener for clicks on tags.  Instead of opening a tagging menu, it
     * build a search query in the tagging field.  This query can be edited
     * before searching.
     */
    function tag_search() {
        if (this.classList.contains(the_uuid)) {
            this.classList.remove(the_uuid);
            this.style = '';
        } else {
            this.classList.add(the_uuid);
            this.style = 'color:#00aaff;';
        }
        newt_field.value = make_query_string();
        return false;
    }

    /* Remove the original listeners from the tags and add our own listener.
     * We also need to perform some cosmetic changes.
     * Note that there is a bug here:  Since we are using the tag field, if the
     * tag menu is currently open the Search Mode will not work.  To fix this
     * bug would require a good deal of API reverse engineering, and it isn't
     * really worth it.
     */
    function toggle_search() {
        top_a.replaceChild(text_search, text_tag);
        top_a.style = style_search;
        newt_field.placeholder = 'Query preview';
        newt_field.size = 40;
        newt_field.style = 'width:425px;';
        newt_button.value = 'Search!';
        newt_button.onclick = do_search;
        var tags = document.querySelectorAll('#taglist a');
        for (var tag of tags) {
            tag.onclick = tag_search;
        }
        top_a.onclick = toggle_tagging;
        localStorage.setItem(the_uuid, 'search');
        return false;
    }

    /* Try to make things look as before.  Return the listeners to something
     * that performs in a similar fashion and revert cosmetic changes.  If you
     * messed up with the tag menu, just reload the page and things should work
     * fine.
     */
    function toggle_tagging() {
        top_a.replaceChild(text_tag, text_search);
        top_a.style = style_tag;
        newt_field.placeholder = 'Enter new tags, separated with comma';
        newt_field.size = 60;
        newt_field.style = '';
        newt_field.value = '';
        newt_button.value = 'Tag!';
        newt_button.onclick = tag_button;
        var tags = document.querySelectorAll('#taglist a');
        for (var tag of tags) {
            tag.onclick = tag_menu;
            tag.classList.remove(the_uuid);
            tag.style = '';
        }
        top_a.onclick = toggle_search;
        localStorage.setItem(the_uuid, 'tag');
        return false;
    }

    // all is linked together, make the final bindings
    top_a.onclick = toggle_search;
    var mode = localStorage.getItem(the_uuid);
    if ('search' === mode) {
        toggle_search();
    }
})();

// useful to tell us if something blew up
console.log('eh-search-multiple is active');

