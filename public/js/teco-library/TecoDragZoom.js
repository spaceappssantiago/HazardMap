/**
 * @fileoverview A simple selector for create a zoomin.
 * This file provides the class TecoDragZoom this class is
 * based in the old dragzoom in timberline_webmapping library crated by Andre Lewis.
 *
 * @author Gustavo Lacoste <gustavo.lacoste@tecogroup.ca>
 * @version 0.1 as of 08 Jul 2011
 * @license Copyright 2011 Tecogroup. All rights reserved.
 * @supported IE6+, WebKit 525+, Firefox 2+.
 */


goog.provide('teco.maps.webmap.tools.TecoDragZoom');

teco.maps.webmap.tools.TecoDragZoom = function(_map) {
  this.mouseDown=false;
  this.point1=null;
  this.point2=null;
  this.startPosX=0;
  this.startPosY=0;
  this.noDraggingEvent=null;
  this.isActiveDragginZoom=false;

  this.map = _map;
  this.map_id = $(this.map.getDiv()).attr("id");
  this.self = this;
};

teco.maps.webmap.tools.TecoDragZoom.prototype.init= function() {
  var self=this;
  $("body").append('<div id="sel"></div>');
  $("head").append('<style type="text/css">#sel {' + 'background-color: #ccc;' + 'border: 2px solid #ff0000;' + 'position: absolute;' + 'display: none;' + 'width: 100%;' + '-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=50)";' + 'filter: alpha(opacity=50);' + '-moz-opacity:0.5;' + '-khtml-opacity: 0.5;' + 'opacity: 0.5;}</style>');

  google.maps.event.addListener(this.map, 'mousedown', function (event) {
      if(self.isActiveDragginZoom){
      self.point1 = event.latLng;
      self.mouseDown = true;
      }
  });
  
  google.maps.event.addListener(this.map, 'mouseup', function (event) {
    if(self.isActiveDragginZoom){
        self.point2 = event.latLng;
        self.mouseDown = false;
        var bounds = new google.maps.LatLngBounds();
        bounds.extend(self.point1);
        bounds.extend(self.point2);
        self.map.fitBounds(bounds);
        self.getSelection();
        $('#tecoDragZoomTglbtn').removeClass('dragzoom-tbl-btn-press').addClass('dragzoom-tbl-btn-normal');
        //self.map.setCenter(self.point1.lat()+";"+self.point1.lng()+";"+self.point2.lat()+";"+self.point2.lng());
    }
  });
  
    /*para que el selector este donde se dibuja y no en 0,0*/
    $("#" + this.map_id).mousedown(function (e) {
        if(self.isActiveDragginZoom){
        self.startPosX = e.pageX;
        self.startPosY = e.pageY;
        }
    });

    $("#map_canvas, #sel").mousemove(function (e) { 
      // fije map_canvas por ahora, falta hacer un setting
    //  alert('mouseDown:'+self.mouseDown);
      if (self.mouseDown && self.isActiveDragginZoom) {
        
        var endPosX = e.pageX;
        var endPosY = e.pageY;

        var width = 0;
        var height = 0;
        var top = 0;
        var left = 0;

        if (endPosX > self.startPosX) {
          width = endPosX - self.startPosX;
          left = self.startPosX;
        } else {
          width = self.startPosX - endPosX;
          left = self.startPosX - width;
        }

        if (endPosY > self.startPosY) {
          height = endPosY - self.startPosY;
          top = self.startPosY;
        } else {
          height = self.startPosY - endPosY;
          top = self.startPosY - height;
        }

        $("#sel").show();
        $("#sel").css('width', width);
        $("#sel").css('height', height);
        $("#sel").css('top', top);
        $("#sel").css('left', left);
      }
    });
};

/**
* Comienza la selección del área sobre la cual se realizará el zoom, 
* para realizar esto se desactiva el evento drag de google maps y se
* espera que el usuario realice la selección del área.
* 
* Cuando el usuario termina la selección se llama a getSelection para
* terminar el proceso y se reactiva el dragging
* 
*/
  
teco.maps.webmap.tools.TecoDragZoom.prototype.startSelection = function() {
    var self=this;
    var c = self.map.getCenter();
    self.noDraggingEvent = google.maps.event.addListener(self.map, 'drag', function () {
      self.map.setCenter(c);
    });
    self.isActiveDragginZoom=true;
};


teco.maps.webmap.tools.TecoDragZoom.prototype.getSelection = function() {
    var self=this;
    google.maps.event.removeListener(self.noDraggingEvent); // Enable dragging
    $("#sel").hide();
    self.isActiveDragginZoom = false;
    self.mouseDown = false;
};
