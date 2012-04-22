/**
 * @fileoverview In this file are defines the functionality for the module mapa.
 *
 * @author Gustavo Lacoste <gustavo.lacoste@tecogroup.ca>
 * @version 0.1 as of 21 Jun 2011
 * @license Copyright 2011 Tecogroup. All rights reserved.
 * @supported IE6+, WebKit 525+, Firefox 2+.
 */

/*globales*/
/** @define {Map} */
var GMAP; /** @define {teco.maps.webmap.tools.TecoRuler} */
var miregla; /** @define {teco.maps.webmap.tools.Core} */
var tmap, t;


/*librerias*/
goog.require('teco.maps.webmap.Core');
goog.require('teco.maps.webmap.tools.TecoRuler');
goog.require('teco.maps.webmap.tools.TecoDragZoom');


function Initialize() { /*main*/
  
  var gmapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER
    },
    navigationControl: true,
    navigationControlOptions: {
        style: google.maps.NavigationControlStyle.ZOOM_PAN,
        position: google.maps.ControlPosition.TOP_LEFT
    },
  /*  scaleControl: true,
    scaleControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_RIGHT
    },*/
    zoom: 7,
    center: new google.maps.LatLng(-39.639859, -71.914879)
  };
/* mapa inteligente con parametros en url
  if (document.location.hash) {
      var zoomParam = getHashParamValue('zoom');
      if (zoomParam)
          mapOptions.zoom = parseInt(zoomParam);
      var lat = getHashParamValue("lat");
      var lng = getHashParamValue("lng");
      if (lat && lng)
          mapOptions.center = new google.maps.LatLng(lat, lng);
      if (lat && lng && zoomParam)
          currentHash = window.location.hash;
  }*/

  GMAP = new google.maps.Map(document.getElementById('map_canvas'), gmapOptions);
  tmap = new teco.maps.webmap.Core(GMAP);
  miregla = new teco.maps.webmap.tools.TecoRuler();
  miregla.init();
  midragzoom =  new teco.maps.webmap.tools.TecoDragZoom(GMAP);
  midragzoom.init();
  
  //$('#rulerDialog').dialog('open');
  //miregla.setIsActiveRuler(true);
  t = tmap; // *quitar luego
  //tmap.createMenu('menu');
  //tmap.openKML('http://www.timberline.cl/losrios/kml/rios.kml');

  $('#capas_ventana').tabbedDialog({
    autoOpen: true,
    buttons: {},
    closeOnEscape: true,
    closeText: 'Minimizar',
    dialogClass: 'capas_ventana',
    draggable: true,
    hide: null,
    height: 180,
    modal: false,
    position: {
      my: 'center',
      at: 'bootom',
      collision: 'fit',
      // ensure that the titlebar is never outside the document
      using: function (pos) {
        $(this).css('bottom', 15);
        $(this).css('left', 15);
        $(this).css('top', 'auto');
      }
    },
    show: null,
    stack: true,
    title: '',
    width: 700,
    zIndex: 1000
  });

  $('#capas_ventana').dialog('option', 'resizable', false);
  $('#capas_ventana').bind('dialogbeforeclose', function (event, ui) {
    $('#capas_ventana_min').show();
    $(this).effect('transfer', {
      to: '#capas_ventana_min',
      className: 'ui-effects-transfer'
    }, 500);
    return true;
  });


  $('#capas_ventana_min').click(function () {
    $('#capas_ventana').dialog('open').css('top', 'auto').css('height', 169);
    $('#capas_ventana_min').hide();
  });
  
  $( "#sidebar" ).dialog({
    autoOpen: true,
    buttons: {},
    closeOnEscape: true,
    closeText: 'Minimizar',
    dialogClass: 'sidebar',
    draggable: true,
    hide: null,
    position: ['right','top'],
    show: null,
    stack: false,
    title: '',
    width: 400,
	resizable: false,
	zIndex: 1000  
  });
  $('#sidebar').bind('dialogbeforeclose', function (event, ui) {
    $('#sidebar_min').show();
    $(this).effect('transfer', {
      to: '#sidebar_min',
      className: 'ui-effects-transfer'
    }, 500);
    return true;
  });
  $('#sidebar_min').click(function () {
    $('#sidebar').dialog('open');
    $('#sidebar_min').hide();
  });

  $(":checkbox:checked").each(function(){this.checked = false;});
$('#waiting').hide();




//cargar();

}

function ruleClick(element) {
  
  if ($('#rulerDialog').dialog('isOpen')) { 
    miregla.setIsActiveRuler(false);
    element.removeClass('ruler-tbl-btn-press').addClass('ruler-tbl-btn-normal');
    $('#rulerDialog').dialog('close');
  } else {
    element.removeClass('ruler-tbl-btn-normal').addClass('ruler-tbl-btn-press');
    $('#rulerDialog').dialog('open');
    miregla.setIsActiveRuler(true);
  }
}
function dragZoomClick(element) {
  if (!midragzoom.isActiveDragginZoom) {
    midragzoom.startSelection();
    element.removeClass('dragzoom-tbl-btn-press').addClass('dragzoom-tbl-btn-normal');
  } else {
    element.removeClass('dragzoom-tbl-btn-normal').addClass('dragzoom-tbl-btn-press');
  }   
        
}


jQuery(document).ready(function() {
  $(":checkbox:checked").each(function(){this.checked = false;});
  jQuery('.lightbox').lightbox();
  //SexyLightbox.initialize({color:'negro', dir: 'js/others-librarys/sexyimages'});
  $('#rulerDialog').tabbedDialog({'width':285, 'height':146,'draggable':true,'resizable': false, 'position': 'right', autoOpen: false,buttons: {
				Borrar: function() {
					miregla.clear();
				}
			}});
                      
                      
   // if ruler dialog is closed then the state of the toogle button with the ruler icon is no checked
  $("#rulerDialog").bind( "dialogbeforeclose", function(event, ui) {
    $('#tecoRulerTglbtn').removeClass('ruler-tbl-btn-press').addClass('ruler-tbl-btn-normal');
    miregla.clear();
    miregla.setIsActiveRuler(false);
    return true;
  });

  //area_concesionico
  /*$("#area_concesionico").dblclick(function () { 
      alert('OLI');
  });*/

  
  
});
