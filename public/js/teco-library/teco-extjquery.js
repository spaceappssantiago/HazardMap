/**
 * @fileoverview Implement a simple tabbed dialog
 * example of use: $('#idOfTheElement').tabbedDialog({'modal':true,'width':800, 'height':600,'minWidth':400, 'minHeight':300,'draggable':true});.
 *
 * @supported IE6+, WebKit 525+, Firefox 2+.
 */

/**
 * Constructor of the tabbedDialog pluggin.
 * @param {opts} opts for create a dialog.
 * @constructor
 */
$.fn.tabbedDialog = function(opts) {
  this.tabs();
  this.dialog(opts);
  this.find('.ui-tab-dialog-close').append($('a.ui-dialog-titlebar-close'));
  this.find('.ui-tab-dialog-close').css({
    'position': 'absolute',
    'right': '0',
    'top': '14px'
  });
  this.find('.ui-tab-dialog-close > a').css({
    'float': 'none',
    'padding': '0'
  });
  var tabul = this.find('ul:first');
  this.parent().addClass('ui-tabs').prepend(tabul).draggable('option', 'handle', tabul);
  this.siblings('.ui-dialog-titlebar').remove();
  tabul.addClass('ui-dialog-titlebar');
};