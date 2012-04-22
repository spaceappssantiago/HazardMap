var DataParseEngine = function(w, d) {

  var URL = 'https://HazardMapMap:HazardMap@stream.twitter.com/1/statuses/filter.json?locations=-122.75,36.8,-121.75,37.8,-74,40,-73,41';
  var markers = [];

  var _getData = function(url){
     
$.getJSON(URL,
  { /*
    tags: "cat",
    tagmode: "any",
    format: "json" */
  },
  function(data) {
    $.each(data.items, function(i,item){
      $("<img/>").attr("src", item.media.m).appendTo("#images");
      if ( i == 3 ) return false;
    });
  });



  }

  return {
    getData: function(url){
        _getData();
        return dataarray;
    }
  };
}
