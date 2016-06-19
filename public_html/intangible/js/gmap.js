var gmap, greenLayer, gooMarkers = [];
var mapCenter = new google.maps.LatLng(10, 15);
var citiesTableId = '1fh6Qwq7BdzWQ8FSJMvxuicc1RO-OZu34xTn3SNk';
var elementsTableId = '1YKHb7knsIdkh7DiPs1cdvSouBSOoU5Zjy_-jRsg';
var regionsTableId = '1HXnkRsZb_0zRr1eqyBP_4WE1SGTcAHqznV_iuLs';
//var regionsTableId = '1LS7eLOD2UV-O6mVNDxVksHXzQFLJphQ-TFbSHe0'
//var regionsTableId = '1QB4xElku6NJYsqMPrdl6zdEGbXNdPt1on23ET3Y';
//var regionsTableId = '12aBQ_GPbvCaXuMVv4-O2sL53aATJAc44JLAcksI';

var reqLayers=[], lyrCounter = 0, els = ''

function init_g() {
  //set defaults
  var gmapOptions = {
    zoom: 2, center: mapCenter, disableDefaultUI : true, mapTypeControl: false,
    mapTypeId: google.maps.MapTypeId.TERRAIN, zoomControl: true,
    zoomControlOptions: { style: google.maps.ZoomControlStyle.SMALL}
  };
  gmap = new google.maps.Map(document.getElementById('map_canvas'),
      gmapOptions);
  gmap.enableKeyDragZoom();
  var style = [
  { featureType: 'all', elementType: 'all', stylers: [
    { saturation: -50 } ] },
  { featureType: 'transit', elementType: 'all', stylers: [
    { visibility: 'off' } ] },
  { featureType: 'road', elementType: 'all', stylers: [
    { visibility: 'off' } ] },
  { featureType: 'administrative', elementType: 'all', stylers: [
    { visibility: 'off' } ] },
  { featureType: 'administrative.province', elementType: 'all', stylers: [
    { visibility: 'off' } ] }
  ];

  var styledMap = new google.maps.StyledMapType(style, {
    map: gmap,
    name: 'Styled Map'
  });

  // comment next 3 lines to TRY NO STYLING 
  gmap.mapTypes.set('map-style', styledMap);
  //gmap.mapTypes.set('map-style-hoods', styledMapHoods);
  gmap.setMapTypeId('map-style');
  // put data on the map
  makeBase('regions');
	makeBase('cities');
  
  google.maps.event.addListener(regionsLayer, 'click', function(e) {
    var p = e.latLng.toString()
    //console.log('you clicked the point: '+ p);
    allRegions(e.latLng);
    estuff = e;
  });
}
function allRegions (pnt) {
  p=pnt;
  console.log('in allRegions(), nothin...'+pnt)
  citiesLayer.setMap(null);
  regionsLayer.setOptions({
    query: {
      select: "geometry,OBJECTID",
      from: "1LS7eLOD2UV-O6mVNDxVksHXzQFLJphQ-TFbSHe0",
      where: "ST_INTERSECTS(geometry, RECTANGLE(LATLNG"+pnt+", LATLNG"+pnt+"))"
    }
  });
  //citiesLayer.setMap(gmap);
  var query = "https://www.googleapis.com/fusiontables/v1/query?sql="
  query += "select OBJECTID from 1HXnkRsZb_0zRr1eqyBP_4WE1SGTcAHqznV_iuLs ";
  query += "WHERE ST_INTERSECTS(geometry, RECTANGLE(LATLNG"+pnt+", LATLNG"+pnt+"))"
  // query += "&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ"
  query += "&key=AIzaSyBAXL-2FZC7GK97jX_h399Py3IXaj3VsJg"
  console.log(query)
  selRegions = []
  $.ajax({
    type: "GET",
    url: query,
    dataType: "jsonp",
    success: function(d) {
      console.log('something happened');
      foo=d;
      for (i in d.rows) selRegions.push(d.rows[i].toString());
      console.log('unbelievable: '+ selRegions);
      getElements(selRegions)
    },
    error: function() { console.log('something amiss')}
  })
}
function getElements(z) {  
  console.log('do a php call to get words');
  query="../intangible/php/elements.php?r="+z;
  request = $.ajax({
    url: query,
    success: function(d) {
      els=d;console.log('you have "els" to parse');
      elementList="<h3>Intangible Elements <span style='font-size:.8em;'>"+
        "[<a href='#' onClick='resetRegions();'>reset</a>]</span></h3>";
      for (i in d.features)
        elementList += "<p><a href='#' onClick='oneElement("+
        i+")'>"+d.features[i].properties.title+
        "</a> ("+
        "<em>"+d.features[i].properties.countries+")</em></p>";
      $("#southeast").html(elementList)
    },
    error: function() {console.log('not yet');}
  })
  request.fail(function(jqXHR, textStatus) {alert( "Request failed: " + textStatus );})
}

function searchText() {
  var searchString = $("#i_searchbox").val().replace(/'/g, "\\'");
  query="../intangible/php/fts.php?q="+searchString;
  console.log('looking for: '+searchString);
  request = $.ajax({
    url: query,
    success: function(d) {
      els=d; console.log('you have new "els" to parse');
      elementList="<h3>Intangible Elements <span style='font-size:.8em;'>"+
        "[<a href='#' onClick='resetRegions();'>reset</a>]</span></h3>";
      for (i in d.features)
        elementList += "<p><a href='#' onClick='oneElement("+
        i+")'>"+d.features[i].properties.title+
        "</a> ("+
        "<em>"+d.features[i].properties.countries+")</em></p>";
      $("#southeast").html(elementList)
    },
    error: function() {console.log('not yet');}
  })
}

function oneElement(idx) {
  console.log('in oneElement() with index ' +idx);
  $("#nw_start").hide();
  $("#nw_terms").show();
  $("#nw_left").html('<h5>some noun phrases</h5>'+
    els.features[idx].properties.nphrases);
  $("#nw_right").html('<h5>some verbs</h5><p>'+
    els.features[idx].properties.verbs)+'</p>';
  $("#nw_title").html('<h4>'+
    els.features[idx].properties.title+'</h4>');
  var cutoff = 300;
  var text = els.features[idx].properties.description;
  var rest = text.substring(cutoff);
  if (text.length > 100) {
    var period = rest.indexOf('.');
    var space = rest.indexOf(' ');
    cutoff += Math.max(Math.min(period, space), 0);
  }
  // Assign the rest again, because we recalculated the cutoff
  rest = text.substring(cutoff);
  var visibleText = text.substring(0, cutoff)
  $("#nw_blurb").html('<p>' + visibleText +
    //' ... [<a href="" onClick="">more</a>]</p>');
	 ' ... [ more ]</p>');
  }
function resetRegions() {
  $("#nw_terms").hide();
  $("#nw_start").show();
  $("#southeast").html(BLURBS['intro']);
  citiesLayer.setMap(null);
  init_g();
  // citiesLayer.setMap(gmap);
}
function makeBase(attr) {
  console.log(eval(attr+'TableId')); //var id=attr+'TableId';
  var s, t;
  if (attr == 'elements') {
    elementsLayer = new google.maps.FusionTablesLayer({
      query: { select: 'longitude', from: eval(attr+'TableId'), map: gmap },
      suppressInfoWindows: false, styleId: 2, templateId: 2
    });
    //elementsLayer.setMap(gmap);
  } else if (attr == 'cities') {
    citiesLayer = new google.maps.FusionTablesLayer({
      query: { select: "longitude", from: eval(attr+'TableId'), map: gmap },
      suppressInfoWindows: false, styleId: 4, templateId: 4
    });
    //citiesLayer.setMap(gmap);
  } else if (attr == 'regions') {
    regionsLayer = new google.maps.FusionTablesLayer({
      query: { select: "geometry", from: eval(attr+'TableId'), map: gmap },
      suppressInfoWindows: false, styleId: 2, templateId: 2
    });
    regionsLayer.setMap(gmap);
  }
} //

function makeAndShow(lyrs) { // needs 'c_' prepend
  var url = '';
  // city:eq_denver43261; city:g_denver_4326; city:hoods3158lite
  console.log('in makeAndShow(),layers are: '+lyrs);
  result=$.grep(reqLayers, function(e){ return e.name == lyrs; });
    lyrCounter += 1;
    // initialize a new or additional layer
    gmap.overlayMapTypes.push(null);
    //gmap.overlayMapTypes.push(null);
    wmsLayer = new google.maps.ImageMapType({ // 
      getTileUrl: function (coord, zoom) {
        var proj = gmap.getProjection();
        var zfactor = Math.pow(2, zoom);
        // get Long Lat coordinates
        var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
        var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));
        // NECESSARY? corrections for the slight shift of the SLP (mapserver)
        var deltaX = 0.0; //var deltaX = 0.0013;
        var deltaY = 0.0; //var deltaY = 0.00058;  
        //create the Bounding box string
        var bbox =   (top.lng() + deltaX) + "," +
                     (bot.lat() + deltaY) + "," +
                     (bot.lng() + deltaX) + "," +
                     (top.lat() + deltaY);
        //base WMS URL
        url = "http://regis-dev.stanford.edu/geoserver/heritage/wms?";
        //var url = "https://geodata.stanford.edu/geoserver/city/wms?";
        url += "&SERVICE=WMS";    //WMS service
        url += "&REQUEST=GetMap"; //WMS operation
        url += "&VERSION=1.1.1";  //WtilMS version  
        url += "&LAYERS=" + lyrs; //WMS layers
        url += "&FORMAT=image/png" ; //WMS format
        url += "&BGCOLOR=0xFFFFFF";  
        url += "&TRANSPARENT=TRUE";
        url += "&SRS=EPSG:4326";     //set WGS84 
        url += "&BBOX=" + bbox;      // set bounding box
        url += "&WIDTH=256";         //tile size in google
        url += "&HEIGHT=256";
        //console.log(url);
        return url;                 // return URL for the tile
      }
      , tileSize: new google.maps.Size(256, 256)
      , isPng: true
    });
    //gmap.overlayMapTypes.push(wmsLayer);
    gmap.overlayMapTypes.setAt(lyrCounter,wmsLayer);
    reqLayers.push ({
      name: lyrs,
      num: lyrCounter
    });
    //console.log(url);
  } //
// }
function zapLayer(foo) {
  result=$.grep(reqLayers, function(e){ return e.name == foo; });
  gmap.overlayMapTypes.setAt(result[0].num,null);
}

// initial map render
function drawMap(data) {
  // data.rows.[i][0] is the city name
  makeBase('green');
  greenLayer.setMap(gmap);
  rows = data.rows;
  for (var i in rows) {
    coords = new google.maps.LatLng(rows[i][1],rows[i][2]);
    m = createMarker(coords, rows[i][0]);
    gooMarkers.push(m);
    m.setMap(gmap);
  }
}

function createMarker(latlong, city) {
  //console.log('from createMarker(): '+latlong + ', ' + city);
  marker = new google.maps.Marker({
    position: latlong,
      map: gmap,
      title: city,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7, strokeWeight: 1, fillOpacity: 0.8,
        fillColor: "lime", strokeColor: "darkgreen"}         
    });
  google.maps.event.addListener(marker, "click", function(e) {
      // console.log('you clicked the '+city+' marker');
      goCity(city,'');
      $("select option").filter(function() {
        return $(this).text() == city; 
      }).attr('selected', true);
  });
  return marker;
}

function goCity(dest,lyrs) { // lyrs must have 'c_' prepend already
  var l;
  if (lyrs === null || lyrs === '') { l = 'c_'+activeWMSBase+','+'c_'+activeWMSMarker;} else {l=lyrs;}
  console.log('in goCity(), headed to '+dest+', displaying '+l);
  goGmap(dest,l);
  // panel housekeeping
  $( "#gmap-intro-text").hide();
  $( "#radioD ").show(); $( "#radioG ").show(); $( "#indices-list ").show();
  if(!document.getElementById('legendWrapperB'||'legendWrapperM')){addLegends(gmap);}
    else { $("#legendWrapperB").show(); }
  //pointsLayer.setMap(gmap);
  toggleMarkers(false);
  $( "#mapReset ").show();
  if ($("#citySelectG option:selected").text() == ('Dallas'||'Louisville')) {
      $("#attr3").attr('disabled','disabled');
      $("#attr4").attr('disabled','disabled');
  }
}
// get points in city, calculate bounds and go
function zoomTo(response) {
  console.log('now in zoomTo(), congratulations!');
  if (!response) { alert('no response'); return; }
  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;  } 
    FTresponse = response;
    //response object docs
    //http://code.google.com/apis/visualization/documentation/reference.html#QueryResponse
    numRows = response.getDataTable().getNumberOfRows();
    numCols = response.getDataTable().getNumberOfColumns();
    
    var bounds = new google.maps.LatLngBounds();
    for(i = 0; i < numRows; i++) {
        var point = new google.maps.LatLng(
            parseFloat(response.getDataTable().getValue(i, 0)),
            parseFloat(response.getDataTable().getValue(i, 1)));
        bounds.extend(point);
    }
    // zoom to the bounds
    gmap.fitBounds(bounds);
}
// ?? on click city marker
function zoomCity(e,gmap) {
  //console.log(i);
  currCityCoord = e.latLng;
  gmap.setCenter(currCityCoord);
  gmap.setZoom(11);
  $("#gmapIntro").hide();
  $( "#radio ").show(); $( "#radioG ").show();
  if(!document.getElementById('legendWrapper')){addLegends(gmap);}
    else { $("#legendWrapper").show(); }
  toggleMarkers(false);
  pointsLayer.setMap(gmap);
}
// ?? on select from dropdown
function cityFromSelect(coord) {
  var latlngStr = coord.split(",",2);
  var lat = parseFloat(latlngStr[0]);
  var lng = parseFloat(latlngStr[1]);
  currCityCoord = new google.maps.LatLng(lat, lng);
  gmap.setCenter(currCityCoord);
  gmap.setZoom(10);
  $("#gmap-intro-text").hide();
  $( "#radio" ).show(); $( "#radioG ").show();
  if(!document.getElementById('legendWrapper')){addLegends(gmap);}
    else { $("#legendWrapper").show(); }
  toggleMarkers(false);
  pointsLayer.setMap(gmap);
}

function zoomHome() {
  gmap.setCenter(mapCenter);
  gmap.setZoom(4);
}
function windowControl(e, infoWindow, gmap) {
  infoWindow.setOptions({
      content: e.infoWindowHtml,
      position: e.latLng,
      pixelOffset: e.pixelOffset
  });
  infoWindow.open(gmap);
}     

function initCitymenu() {
  cityMenu = document.getElementById('citySelectG');
  console.log('in initCitymenu() and cityMenu exists: ' + cityMenu);
  for (var key in CITYLIST) {
    //console.log(key);
    o = document.createElement('option');
    o.setAttribute('value', CITYLIST[key]);
    o.innerHTML = key;
    cityMenu.appendChild(o);
  }
}

// Create the where clause
function generateWhere(columnName, low, high) {
  var whereClause = [];
  whereClause.push("'");
  whereClause.push(columnName);
  whereClause.push("' >= ");
  whereClause.push(low);
  whereClause.push(" AND '");
  whereClause.push(columnName);
  whereClause.push("' < ");
  whereClause.push(high);
  return whereClause.join('');
}
// Initialize the legends; B=base, M=markers
function addLegends(map) {
  var wrapperB = document.createElement('div');
  wrapperB.id = 'legendWrapperB';
  wrapperB.index = 1;
  var wrapperM = document.createElement('div');
  wrapperM.id = 'legendWrapperM';
  wrapperM.index = 1;

  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
      wrapperB);
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(
      wrapperM);
  legendContentB(wrapperB, activeWMSBase);
  legendContentM(wrapperM, activeWMSMarker);
}
// Generate the content for the marker legend; join eventually
function legendContentM(legendWrapper, attrib) {
  console.log('into legendContentM now, attrib is '+attrib);
  var legendM = document.createElement('div');
  legendM.id = 'legend_m';

  var title = document.createElement('p');
  title.innerHTML = LEGEND_TITLES[attrib];
  legendM.appendChild(title);
  var body = document.createElement('p'); body.id = "";
  if (attrib !== 'markers_off'){
    body.innerHTML = "<img src='../content/legend_"+attrib+".png' />";
  } else {body.innerHTML = "";}
  legendM.appendChild(body);
  legendWrapper.appendChild(legendM);
}
// Generate the content for the base legend
function legendContentB(legendWrapper, attrib) {
  console.log('into legendContentB now, attrib is '+attrib);
  var legendB = document.createElement('div');
  legendB.id = 'legend_b';

  var title = document.createElement('p');
  title.innerHTML = LEGEND_TITLES[attrib];
  legendB.appendChild(title);

  var baseStyle = BASE_STYLES[attrib];
  for (var i in baseStyle) {
    var style = baseStyle[i];

    var legendItem = document.createElement('div');

    var color = document.createElement('span');
    color.setAttribute('class', 'color');
    color.style.backgroundColor = style.color;
    legendItem.appendChild(color);

    var minMax = document.createElement('span');
    if (style.color != "#FFFFFF") {
      minMax.innerHTML = style.min + ' - ' + style.max;
    } else { minMax.innerHTML = "data not available"; }
    legendItem.appendChild(minMax);
    legendB.appendChild(legendItem);
  }
  legendWrapper.appendChild(legendB);
}
// Update the legend content
function updateLegend(attrib,which) {
  if (which == 'base') {
    var wrapperB = document.getElementById('legendWrapperB');
    var legendB = document.getElementById('legend_b');
    wrapperB.removeChild(legendB); 
    legendContentB(wrapperB, attrib); 
  } else {
    var wrapperM = document.getElementById('legendWrapperM');
    var legendM = document.getElementById('legend_m');
    wrapperM.removeChild(legendM);
    legendContentM(wrapperM, attrib);
  }
}

function toggleMarkers(q){
  for(var i=0; i<gooMarkers.length; i++){
      gooMarkers[i].setVisible(q);
  }
}
function toggleAllMarkers(q){
  for(var i=0; i<gooMarkers.length; i++){
      gooMarkers[i].setVisible(q);
  }
  pointsLayer.setMap(null);
  greenLayer.setMap(null);
}
