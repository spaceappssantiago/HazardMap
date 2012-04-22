
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , streaming = require('./streaming');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.get('/map', function(req, res) {
	
});

tweets = [];

function spit_coordinates(data) {
  if(data && data.coordinates) {
    coordinates = data.coordinates.coordinates.split(',');
    lat = coordinates[0];
    lon = coordinates[1];
    message = data.text;
    id = data.id;
    tweets.push({'latitud': lat, 'longitud': lon, 'id': id, 'descripcion': message});
  }
}
create_streaming({track: 'terremoto', data: spit_coordinates});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
