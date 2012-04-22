/**
 * @fileoverview Teco Core Webmapping engine.
 * This file provides the core class with a generic and master functions used
 * from any scope of the teco webmapping.
 *
 * @author Danilo Lacoste <danilo.lacoste@tecogroup.ca>, Gustavo Lacoste <gustavo.lacoste@tecogroup.ca>
 * @version 2.0 as of 30 Jun 2011
 * @license Copyright 2011 Tecogroup. All rights reserved.
 * @supported IE6+, WebKit 525+, Firefox 2+.
 */
goog.provide('teco.maps.webmap.Core');
goog.require('goog.json');

var tglBtnRule = null;
var temp_key = null;
var tmpCategory = null;
var arreglo_datos_bd = new Array;
var count=0;
var arreglo_puntos = new Array;
var contador_arreglo_puntos = 0;
//var bounds = new google.maps.LatLngBounds(); <- se usaba para el ajuste automatico
var ruta_foto = 'media/fotos/584px/';
var ruta_foto_t = 'media/fotos/56px/';
var ruta_video = '/media/videos/flv_640_480/';


/**
 * Client Site Icon
 * @const
 * @type {MarkerImage}
 */
var siteIcon = new google.maps.MarkerImage('images/icons/multimedia_icon.png', new google.maps.Size(20, 20), new google.maps.Point(0, 0), new google.maps.Point(0, 20));

/**
 * Constante que define todos los layers utilizados en el webmapping (key) y la
 * metainformación asociada a cada layer específico. El conjunto de parámetros
 * posibles de metainformación asociada a cada layer es:
 *
 * @example [{
 *            "is_db": {boolean},
 *            "url" : {String},
 *            "icon"  : {String},
 *            "param_ssKey": {String}
 *           }]
 * @see  <a href="http://tools.ietf.org/html/rfc4627">RFC 4627 JSON format</a>.
 * @const
 * @type {Object}
 */

var LAYERS_OBJS = {
 
};

  /* formato de la planilla de datos*/
  var param_ID = 'id';
  var param_SHOW = 'show'; /*0 o 1 dependiendo si se ve o no el punto*/
  
  var param_TITLE = 'title'; /*lo que repreenta o lo que es el punto*/
  var param_DESCRIPTION = 'descripcion'; /* la descripcion de dicho punto*/
  var param_LABELTEXT = 'labeltext'; /*para que aparezca o no una etiqueta que da información diferenciada ()*/
  var param_ICON = 'icono';
  /*var param_POINTID = 'id';
   *var param_TIPO = 'tipo';
   **/
  var param_LAT = 'lat';
  var param_LNG = 'lng';
  /* 
  var param_UTM_N = 'utm_n';
  var param_UTM_E = 'utm_e';
  var param_ALT = 'alt';
  */
  var param_F1 = "foto1";
  var param_TXTF1 = "textfoto1";
  var param_F2 = "foto2";
  var param_TXTF2 = "textfoto2";
  var param_F3 = "foto3";
  var param_TXTF3 = "textfoto3";
  var param_F4 = "foto4";
  var param_TXTF4 = "textfoto4";
  var param_F5 = "foto5";
  var param_TXTF5 = "textfoto5";
  var param_F6 = "foto6";
  var param_TXTF6 = "textfoto6";
  var param_F7 = "foto7";
  var param_TXTF7 = "textfoto7";
  var param_F8 = "foto8";
  var param_TXTF8 = "textfoto8";
  var param_F9 = "foto9";
  var param_TXTF9 = "textfoto9";
  var param_V1 = "vid1";
  var param_V2 = "vid2";
/**
 * Core constructor
 * @constructor
 */
teco.maps.webmap.Core = function (gmap) { /** @define {Map} */
  this.GMAP = gmap;
  return this;
};

/**
 * Carga la información para un cierto objeto layer.
 *
 * @param {String} layer is the layer of information.
 */

function show(category) {
  
  conectar_bd_loading();
  setTimeout('', 100);

  switch (eval('LAYERS_OBJS.' + category + '[0].type'))
  {
  case 'db':
      var param_ssKey = eval('LAYERS_OBJS.' + category + '[0].param_ssKey');
      tmpCategory = category;
      conectar_bd_getJSON(param_ssKey);
    break;
    
  case 'kml':
    
    var kmlLayer=null;
    if(category=='area_concesion' || category=='cuerpos_de_agua' || category=='caminos_finales'|| category=='proyecto'|| category=='titulos_de_merced_kml'|| category=='sprioritarios'|| category=='snaspe'|| category=='proyecto_obras' || category=='proyecto_buffer'){
      kmlLayer = new google.maps.KmlLayer(eval('LAYERS_OBJS.' + category + '[0].url'), {
                                              map: GMAP,
                                              preserveViewport: true,
                                              suppressInfoWindows: true
                     });
    }else{
      kmlLayer = new google.maps.KmlLayer(eval('LAYERS_OBJS.' + category + '[0].url'), {
                                              map: GMAP,
                                              preserveViewport: true
                     });
    }
    
    arreglo_datos_bd[category] = kmlLayer;
    // cuando el kml se termine de cargar entonces ocultar el mensaje de cargando
    google.maps.event.addListener(kmlLayer, 'metadata_changed', function () {
      conectar_bd_loaded();
      /*
      if(category=='proyecto'){
        kmlLayer = new google.maps.KmlLayer('http://maps.timberline.cl/los_rios/kmls/finales/proyecto7_numeros.kmz', {
                                                      map: GMAP,
                                                      preserveViewport: true
                             });
      }
      */
    });
    
    /*Para el caso cuando se haga click y sobre un poligono kml y la regla este
     *activa, crear otro vertice de la regla para seguir midiendo*/
    google.maps.event.addListener(kmlLayer, 'click', function (event) {
      if(miregla.isActiveRuler){
        if (event.latLng) {
          miregla.createVertex(event);
        }
      }
    });
    break;
    
    
  case 'panoramio':
    var panoramioLayer = new google.maps.panoramio.PanoramioLayer();
    panoramioLayer.setMap(GMAP);
    arreglo_datos_bd[category] = panoramioLayer;
    google.maps.event.addListener(panoramioLayer, 'metadata_changed', function () {
      conectar_bd_loaded();
    });
    break;
  }

  if (document.getElementById(category + 'box') != null) document.getElementById(category + 'box').checked = true;
}

/**
 * Hide all markers of a particular category, and ensures the checkbox is checked
 *
 * @param {String} category is the layer of information
 * @param {String} db_param es el identificar de la planilla en google docs que
 * contiene la información que se debe cargar.
 */
function hide(category) {
	try{
	  if(eval('LAYERS_OBJS.'+category+'[0].type')=='db' && (eval(arreglo_datos_bd[category]) instanceof Array)){
            if($(arreglo_datos_bd[category]).length<=1){ // SIN JQUERY: eval(arreglo_datos_bd[category]).length<=1
              
            }
          //  alert($(arreglo_datos_bd[category]).length);
           jQuery(arreglo_datos_bd[category]).each(function () {
             this.setMap(null);
           });
           /* SIN JQUERY:
            *arreglo_datos_bd[category].forEach(function(marker) { marker.setMap(null) });*/
           /* O
            *for (var i = 0; i < eval(arreglo_datos_bd[category]).length; i++) {
              arreglo_datos_bd[category][i].setMap(null);
	    }*/
          }
	  else{
            arreglo_datos_bd[category].setMap(null);
          }

	
	}catch (err) {
 		arreglo_datos_bd[category].setMap(null);  //? esta condición 
                //existía en la versión anterior pero no esoy seguro de porque 
                //aveces ocurre el error y otras veces no ocurre, aprentemente
                // se debe a un problema de tiempo de respuesta.
	}
        // == clear the checkbox ==
        document.getElementById(category+"box").checked = false;
        // == close the info window, in case its open on a marker that we just hid
      //  map.closeInfoWindow();

}

/**
 * Emula el addOverlay del api2
 */

function addOverlay(layer) {
  var agregado = new google.maps.KmlLayer(kmlObjs[layer][0]['url'], {
    map: GMAP
  });
  return agregado;
}


/**
 * Muestra un mensaje de cargando. Se usa cuando se están cargando los puntos desde
 * la bd.
 */

function conectar_bd_loading() {
  document.getElementById('conectar_bd_waiting').style.visibility = 'visible';
}


/**
 * Oculta el mensaje de cargando. Se usa cuando se están cargando los puntos desde
 * la bd.
 */

function conectar_bd_loaded() {
  document.getElementById('conectar_bd_waiting').style.visibility = 'hidden';
}

/**@+
 * Carga los datos en formato JSON desde una planilla pública de google docs
 * definida por la clave única identificadora param_ssKey, la carga usa como
 * retorno de carro(callback) a la función  la función conectar_bd_loadMapJSON,
 * por lo tanto se llama automáticamente una vez terminada la carga.
 *
 * @param {String} param_ssKey clave única que identifica a la planilla pública.
 * @callback conectar_bd_loadMapJSON
 * #@-
 */

function conectar_bd_getJSON(param_ssKey) {

  // parametros planilla
  var param_wsId = 'default';
  temp_key = param_ssKey;

  var script = document.createElement('script');
  script.setAttribute('src', 'http://spreadsheets.google.com/feeds/list/' + param_ssKey + '/' + param_wsId + '/public/values?alt=json-in-script&callback=conectar_bd_loadMapJSON');
  script.setAttribute('id', 'jsonScript');
  script.setAttribute('type', 'text/javascript');
  document.documentElement.firstChild.appendChild(script);
  conectar_bd_loading();
}


function conectar_bd_loadMapJSON(json) {
  var este_key = temp_key;
  var category = tmpCategory;
var html;

  var arreglo_puntos = [];
	for (var i = 0; i < json.feed.entry.length; i++) {
		var entry = json.feed.entry[i];
             
		//var point_id =entry["gsx$" + param_ID].$t;

                //var punto_tipo = entry["gsx$" + param_TIPO].$t;
		var show_entry =entry["gsx$" + param_SHOW].$t;
	        var lat = parseFloat(entry["gsx$" + param_LAT].$t);
		var lng = parseFloat(entry["gsx$" + param_LNG].$t);
                        
		if(show_entry != "0")
		{
                var point_title = entry["gsx$" + param_TITLE].$t;
                var point_description = entry["gsx$" + param_DESCRIPTION].$t;
                
		   if (  !isNaN(lat) || !isNaN(lng) )
		    {
			if (entry["gsx$" + param_DESCRIPTION].$t == ""){
				html = "<strong>" + point_title + "</strong><br/>";
				html += "";//en caso de que no exista una descripcion pero si un titulo entonces muestra el puro titulo
			}else{
				html = "<strong>" + point_title + "</strong><br/>";
				html += entry["gsx$" + param_DESCRIPTION].$t;
			}

                        var labelText = entry["gsx$"+param_LABELTEXT].$t;
                        var ico=entry["gsx$"+param_ICON].$t;

			var f1 = entry["gsx$"+param_F1].$t;
			var txtf1 = entry["gsx$"+param_TXTF1].$t;
			var f2 = entry["gsx$"+param_F2].$t;
			var txtf2 = entry["gsx$"+param_TXTF2].$t;
			var f3 = entry["gsx$"+param_F3].$t;
			var txtf3 = entry["gsx$"+param_TXTF3].$t;
			var f4 = entry["gsx$"+param_F4].$t;
			var txtf4 = entry["gsx$"+param_TXTF4].$t;
			var f5 = entry["gsx$"+param_F5].$t;
			var txtf5 = entry["gsx$"+param_TXTF5].$t;
			var f6 = entry["gsx$"+param_F6].$t;
			var txtf6 = entry["gsx$"+param_TXTF6].$t;
			var f7 = entry["gsx$"+param_F7].$t;
			var txtf7 = entry["gsx$"+param_TXTF7].$t;
			var f8 = entry["gsx$"+param_F8].$t;
			var txtf8 = entry["gsx$"+param_TXTF8].$t;
			var f9 = entry["gsx$"+param_F9].$t;
			var txtf9 = entry["gsx$"+param_TXTF9].$t;
			var v1 = entry["gsx$"+param_V1].$t;
			var v2 = entry["gsx$"+param_V2].$t;
                        

			if (txtf1 == ""){txtf1=f1;}
			if (txtf2 == ""){txtf2=f2;}
			if (txtf3 == ""){txtf3=f3;}
			if (txtf4 == ""){txtf4=f4;}
			if (txtf5 == ""){txtf5=f5;}
			if (txtf6 == ""){txtf6=f6;}
			if (txtf7 == ""){txtf7=f7;}
			if (txtf8 == ""){txtf8=f8;}
			if (txtf9 == ""){txtf9=f9;}

			var point = new google.maps.LatLng(lat,lng);

            //bounds.extend(point); <- se usaba para el ajuste automatico
            //GMAP.fitBounds(bounds); <- se usaba para el ajuste automatico
            var marker = null;
            
            /*Si hay un video o una imagen en los ficheros de tipo DB entonces
             *en lugar de mostrar el icono que esta configurado muestro un icono
             *con una camara
            if(f1!='' || v1!=''){
              ico=eval('LAYERS_OBJS.'+category+'[0].iconMultimedia');
            }*/
            
            if (labelText != '') { /*si lleva texto entonces uso el MapLabel*/
            //marker = createLabelMarker(point, '', punto_titulo, punto_descripcion, labelText);
            marker =  createLabelMarker(point,
					null,
					null,html,ico,
					f1,txtf1,
					f2,txtf2,
					f3,txtf3,
					f4,txtf4,
					f5,txtf5,
					f6,txtf6,
					f7,txtf7,
					f8,txtf8,
					f9,txtf9,
					v1,v2, labelText);

            } else { /* si no usa texto entonces creo un marcador normal*/
            marker =  createMarker(point,
					null,
					null,html,ico,
					f1,txtf1,
					f2,txtf2,
					f3,txtf3,
					f4,txtf4,
					f5,txtf5,
					f6,txtf6,
					f7,txtf7,
					f8,txtf8,
					f9,txtf9,
					v1,v2);

					}
             arreglo_puntos.push(marker);



		    } // fin validacion NaN
		  
		} // fin if mostrar o no
	}	
  arreglo_datos_bd[category] = arreglo_puntos;
  conectar_bd_loaded();
}

//create the marker
function createMarker(point,punto_tipo,point_id, html,ico,
			f1,txtf1,
			f2,txtf2,
			f3,txtf3,
			f4,txtf4,
			f5,txtf5,
			f6,txtf6,
			f7,txtf7,
			f8,txtf8,
			f9,txtf9,
			v1,v2){

var category = tmpCategory;

	  var marker_icon = new google.maps.MarkerImage('images/icons/'+ico, new google.maps.Size(25, 25), new google.maps.Point(0, 0), new google.maps.Point(3, 25));

if(category=='proyecto_puntos'){
  marker_icon=null;
 marker_icon = new google.maps.MarkerImage('images/icons/'+ico, new google.maps.Size(158, 158), new google.maps.Point(0, 0), new google.maps.Point(3, 25));
}


  var marker = new google.maps.Marker({
    position: point,
    icon: marker_icon,
    map: GMAP/*variable global con el mapa*/
   // title: punto_titulo
  });

  /* var marker_html = '<b>' + punto_titulo + '</b><br><br>' + punto_descripcion;
   var infowindow = new google.maps.InfoWindow({
   content: marker_html
   });*/

  google.maps.event.addListener(marker, 'click', function () {
    //infowindow.open(GMAP, this);
      if(miregla.isActiveRuler){
        if (event.latLng) {
          miregla.createVertex(event);
        }
      }else{
         var dhtml=changeMedia(point, null, f1, txtf1, f2, txtf2, f3, txtf3, f4, txtf4, f5, txtf5, f6, txtf6, f7, txtf7, f8, txtf8, f9, txtf9, v1, v2, null, html);
         document.getElementById("dynamic_media").innerHTML = dhtml;
      }


  });
  return marker;
}



//create the marker with a label
function createLabelMarker(point,punto_tipo,point_id, html,ico,
			f1,txtf1,
			f2,txtf2,
			f3,txtf3,
			f4,txtf4,
			f5,txtf5,
			f6,txtf6,
			f7,txtf7,
			f8,txtf8,
			f9,txtf9,
			v1,v2, labelText){
  var marker_icon = new google.maps.MarkerImage('images/icons/'+ico, new google.maps.Size(25, 25), new google.maps.Point(0, 0), new google.maps.Point(10,10));
  var marker = new MarkerWithLabel({
    position: point,
    icon: marker_icon,
    map: GMAP,
    //labelContent: '<strong><FONT size=1 COLOR="black" style="background-color:yellow;filter:alpha(opacity=60);-moz-opacity:.60;opacity:.60">'+labelText+'</FONT></strong>',
    labelContent: '<p class="shadowed"><span>'+labelText+'</span></p>',
    //labelContent: '<div class="sombra">'+labelText+'<div class="texto">'+labelText+'</div></div>',
    labelAnchor: new google.maps.Point(35, -11),
    labelClass: 'markerLabels',
    labelStyle: {
      opacity: 0.75
    }
  });

  /*var marker_html = '<b>' + punto_titulo + '</b><br><br>' + punto_descripcion;
  var infowindow = new google.maps.InfoWindow({
    content: marker_html
  });*/

  google.maps.event.addListener(marker, 'click', function () {
    //infowindow.open(GMAP, this);
      if(miregla.isActiveRuler){
        if (event.latLng) {
          miregla.createVertex(event);
        }
      }else{
         var dhtml=changeMedia(point, null, f1, txtf1, f2, txtf2, f3, txtf3, f4, txtf4, f5, txtf5, f6, txtf6, f7, txtf7, f8, txtf8, f9, txtf9, v1, v2, null, html);
         document.getElementById("dynamic_media").innerHTML = dhtml;
      }

  });
  return marker;
}





/**
 * Basado en el estado del checkbox decide si mostrar o ocultar la capa de
 * información correspondiente.
 *
 * @param {HTMLInputCheckboxElement} the checkbox element.
 * @param {String} category is the layer of information.
 * @param {String} db_param es el identificar de la planilla en google docs que
 * contiene la información que se debe cargar.
 */

function boxclick(box, category) {
  if (box.checked) {
    show(category);
  } else {
    hide(category);
  }
}


/**
 * Dadas varias fotografías (máximo 9) con textos asociados a ellas y videos 
 * (máximo 2) esta función retorna una cadena html para implementar una galería
 * de medios utilizando lightbox2.
 *
 * @param {LatLng} point is a latlng object of the marker (Marker) google maps 
 * clicked for generate the media information.
 * 
 * @param {String} point_id Point id
 * @param {String} f1..f9 Images
 * @param {String} txtf1..txtf9 Description of the 'x' image
 * @param {String} v1,v2 Videos
 * @param {String} detalles_encuesta Details of the marker
 * @param {String} html undefined
 */
function changeMedia(point, point_id, f1, txtf1, f2, txtf2, f3, txtf3, f4, txtf4, f5, txtf5, f6, txtf6, f7, txtf7, f8, txtf8, f9, txtf9, v1, v2, detalles_encuesta, html) {
  var noimages=false,novideos=false;
  if (f1 != '') {
    var html1 = "<a href='" + ruta_foto + f1 + "' class='lightbox' rel='group1' title='" + txtf1 + " '><img class='dynamic' src='" + ruta_foto_t + f1 + "' border='1' /></a>";
    if (f2 != '') {
      html1 += "<a href='" + ruta_foto + f2 + "' class='lightbox' rel='group1' title='Image: " + txtf2 + "' ><img class='dynamic' src='" + ruta_foto_t + f2 + "' border='1'/></a>";
    }
    if (f3 != '') {
      html1 += "<a href='" + ruta_foto + f3 + "' class='lightbox' rel='group1' title='Image: " + txtf3 + "' ><img class='dynamic' src='" + ruta_foto_t + f3 + "' border='1'/></a>";
    }
    if (f4 != '') {
      html1 += "<a href='" + ruta_foto + f4 + "' class='lightbox' rel='group1' title='Image: " + txtf4 + "' ><img class='dynamic' src='" + ruta_foto_t + f4 + "' border='1'/></a>";
    }
    if (f5 != '') {
      html1 += "<a href='" + ruta_foto + f5 + "' class='lightbox' rel='group1' title='Image: " + txtf5 + "' ><img class='dynamic' src='" + ruta_foto_t + f5 + "' border='1'/></a>";
    }
    if (f6 != '') {
      html1 += "<a href='" + ruta_foto + f6 + "' class='lightbox' rel='group1' title='Image: " + txtf6 + "' ><img class='dynamic' src='" + ruta_foto_t + f6 + "' border='1'/></a>";
    }
    if (f7 != '') {
      html1 += "<a href='" + ruta_foto + f7 + "' class='lightbox' rel='group1' title='Image: " + txtf7 + "' ><img class='dynamic' src='" + ruta_foto_t + f7 + "' border='1'/></a>";
    }
    if (f8 != '') {
      html1 += "<a href='" + ruta_foto + f8 + "' class='lightbox' rel='group1' title='Image: " + txtf8 + "' ><img class='dynamic' src='" + ruta_foto_t + f8 + "' border='1'/></a>";
    }
    if (f9 != '') {
      html1 += "<a href='" + ruta_foto + f9 + "' class='lightbox' rel='group1' title='Image: " + txtf9 + "' ><img class='dynamic' src='" + ruta_foto_t + f9 + "' border='1'/></a>";
    }

  }else {
    noimages=true;
    html1 = 'Sin im&aacute;genes';
  }
  
  if (v1 != '') {
    var html2 = '<embed id="player" width="360" height="300" flashvars="file=..' + ruta_video + '/' + v1 + '&amp;autostart=false&amp;bufferlength=4&amp;stretching=fill" allowfullscreen="true" quality="high" name="player" wmode="transparent"  style="" src="flash/mediaplayer.swf" type="application/x-shockwave-flash">';
   
   if (v2 != '') {
     html2 += '<embed id="player" width="360" height="300" flashvars="file=..' + ruta_video + '/' + v2 + '&amp;autostart=false&amp;bufferlength=4&amp;stretching=fill" allowfullscreen="true" quality="high" name="player" wmode="transparent"  style="" src="flash/mediaplayer.swf" type="application/x-shockwave-flash">';
    }
    
  }else {
    novideos=true;
    html2 = ' Sin Videos';
  }
  


  var dynamic_html = '<div id="vertical_container" >';
  dynamic_html += '<div class="accordion_content"><p>' + html + '</p></div>';
  
  if(!noimages){
    dynamic_html += '<h2 class="toggler">Im&aacute;genes</h2>';
    dynamic_html += '<div class="accordion_content">' + html1 + '</div>';
  }
  if(!novideos){
    dynamic_html += '<h2 class="toggler">Videos</h2>';
    dynamic_html += '<div class="accordion_content">' + html2 + '</div>';
  }
    dynamic_html+='</div>';
   
  return dynamic_html;
}


/**
 * Load a KML file in the map object
 *
 * @param {Webmap} a Teco Webmap Object.
 */
teco.maps.webmap.Core.prototype.openKML = function (url) {
  kmlLayer = new google.maps.KmlLayer(url, {
    map: GMAP,
    preserveViewport: true
  }); // GMAP es una constante global que contiene el gmap object
};


//************************* PLANILLA DE DATOS *******************************
// datos y puntos
//functional variables
var mapPoints = []; //file:///var/www/apache2-default/sendero/js/sendero20.js
var mapHtmls = [];
var highlightCircle;
var currentMarker;
var nearest_point;
var directions = '';



//************************* FIN PLANILLA DE DATOS *******************************
/**
 * Create a toolbar menu for control the Webmap
 *
 * @param {HTMLDivElement} a div for create a toolbar.
 * @deprecated
 */
teco.maps.webmap.Core.prototype.createMenu = function (container) {

  var tlbMap = new goog.ui.Toolbar;
  var tlbBtn = new goog.ui.ToolbarButton('Datos');
  tlbBtn.setTooltip('Click para definir la informaci\u00f3n a cargar en el mapa');
  tlbMap.addChild(tlbBtn, !0);
  goog.events.listen(tlbBtn.getContentElement(), goog.events.EventType.CLICK, function () {
    jQuery('#legend').dialog();
  });
  tlbMap.addChild(new goog.ui.ToolbarSeparator, !0);
  tlbMap.addChild(new goog.ui.ToolbarButton('Disabled'), !0);
  tglBtnRule = new goog.ui.ToolbarToggleButton(goog.dom.createDom('div', 'ico-teco-map-rule'));
  tglBtnRule.setTooltip('Una regla');
  tlbMap.addChild(tglBtnRule, !0);
  goog.events.listen(tglBtnRule.getContentElement(), goog.events.EventType.CLICK, function () {
    if (jQuery('#rulerDialog').dialog('isOpen')) {
      miregla.setIsActiveRuler(false);
      jQuery('#rulerDialog').dialog('close');
    } else {
      jQuery('#rulerDialog').dialog('open');
      miregla.setIsActiveRuler(true);
    }
  });
  // if ruler dialog is closed then the state of the toogle button with the ruler icon is no checked
  jQuery('#rulerDialog').bind('dialogbeforeclose', function (event, ui) {
    tglBtnRule.setState(goog.ui.Component.State.CHECKED, false);
    miregla.clear();
    miregla.setIsActiveRuler(false);
    return true;
  });

  tlbMap.render(goog.dom.getElement(container));
};

