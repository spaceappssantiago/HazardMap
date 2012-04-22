require('./settings.js');
var twitter = require('ntwitter');

var twit = new twitter({
  consumer_key: CONSUMER_KEY,
  consumer_secret: CONSUMER_SECRET,
  access_token_key: ACCESS_TOKEN_KEY,
  access_token_secret: ACCESS_TOKEN_SECRET
});

global.create_streaming = function(options) {
  default_options = {
    track: '#spaceapps',
    data: console.log,
    error: console.log
  };

  twit.stream('statuses/filter', {track: options.track || default_options.track},
    function(stream) {
      stream.on('data', options.data || default_options.data);
      stream.on('error', options.error || default_options.data);
    });
}
