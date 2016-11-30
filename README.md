eh-search-multiple - adds a search mode for gallery tags


## Usage

The script (`eh-search-multiple.user.js`) adds a toggle button which can switch
into a search mode for tags.  In search mode, tagging is disabled and you can
select multiple tags in the tag pane.  The tagging field is also changed, and
it displays all tags that have been selected in the format used for tag
searching.

After selecting all desired tags you can edit the text field if needed and then
click the new "Search!" button (that is placed instead of the `Tag!` button).
The search is performed on the main page.

The button to enter search mode is shown as `> < Tagging Mode > <`, and when
clicked it becomes `> < Search Mode > <`.  By clicking the same button again
you return to the normal tagging mode.  The state of the toggle is carried
across different galleries and page reloads by means of local browser storage.

### TODO

*   Add an option to search by gallery category.  Maybe by including a checkbox
   next to the category on the current gallery.

### Known Bugs

*   If you select a tag in tagging mode and then switch to search mode and back
   to tagging mode again, the tag selection will get messed up.  Reloading the
page (F5 or Ctrl+R) is a temporary fix.


## Copyright

This file is part of eh-search-multiple

Copyright (C) 2016 Neptune Penguin

This JavaScript code is free software: you can redistribute it and/or modify it
under the terms of the GNU General Public License (GNU GPL) as published by the
Free Software Foundation, either version 3 of the License, or (at your option)
any later version.

This JavaScript code is distributed WITHOUT ANY WARRANTY; without even the
implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See
the GNU GPL for more details.

The full text of the license can be found in the COPYING file.  If you cannot
find this file, see <http://www.gnu.org/licenses/>.

