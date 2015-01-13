// Base map
var osmLayer = new ol.layer.Tile({source: new ol.source.OSM()});

// Census map layer
var wmsLayer = new ol.layer.Image({
  source: new ol.source.ImageWMS({
    url: 'http://student.ifip.tuwien.ac.at/geoserver/wms',
    params: {'LAYERS': 'g06_2014:normalized_wien,g06_2014:comments'}
  }),
  opacity: 0.6
});

// Map object
olMap = new ol.Map({
  target: 'map',
  renderer: 'canvas',
  layers: [osmLayer, wmsLayer],
  view: new ol.View({
    center: ol.proj.transform([16.37, 48.21], 'EPSG:4326', 'EPSG:3857'),
    zoom: 11,
    maxZoom: 18
  })
});

// Load variables into dropdown
$.get("data/DataDictWien.txt", function(response) {
  // We start at line 3 - line 1 is column names, line 2 is not a variable
  $(response.split('\n').splice(2)).each(function(index, line) {
    $('#topics').append($('<option>')
      .val(line.substr(0, 20).trim())
      .html(line.substr(20, 106).trim()));
  });
});

// Add behaviour to dropdown
$('#topics').change(function() {
  wmsLayer.getSource().updateParams({
    'viewparams': 'column:' + $('#topics>option:selected').val()
  });
});

// Create an ol.Overlay with a popup anchored to the map
var popup = new ol.Overlay({
  element: $('#popup')
});
olMap.addOverlay(popup);

// Handle map clicks to send a GetFeatureInfo request and open the popup
olMap.on('singleclick', function(evt) {
  var view = olMap.getView();
  var url = wmsLayer.getSource().getGetFeatureInfoUrl(evt.coordinate,
      view.getResolution(), view.getProjection(), {'INFO_FORMAT': 'text/html'});
  popup.setPosition(evt.coordinate);
  $('#popup-content iframe').attr('src', url);
  $('#popup')
    .popover({content: function() { return $('#popup-content').html(); }})
    .popover('show');
  // Close popup when user clicks on the 'x'
  $('.popover-title').click(function() {
    $('#popup').popover('hide');
  });
  
  $('.popover form')[0].onsubmit = function(e) {
  var feature = new ol.Feature();
  feature.setGeometryName('geom');
  feature.setGeometry(new ol.geom.Point(evt.coordinate));
  feature.set('comment', this.comment.value);
  var xml = new ol.format.WFS().writeTransaction([feature], null, null, {
    featureType: 'comments', featureNS: 'http://geoweb/2014/g06',
    gmlOptions: {srsName: 'EPSG:3857'}
  });
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://student.ifip.tuwien.ac.at/geoserver/wfs', true);
  xhr.onload = function() {
    wmsLayer.getSource().updateParams({});
    alert('Thanks for your comment.');
  };
  xhr.send(new XMLSerializer().serializeToString(xml));
  e.preventDefault();
};

});

// Submit query to Nominatim and zoom map to the result's extent
var form = document.forms[0];
form.onsubmit = function(evt) {
  var url = 'http://nominatim.openstreetmap.org/search?format=json&q=';
  url += form.query.value;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onload = function() {
    var result = JSON.parse(xhr.responseText);
    if (result.length > 0) {
      var bbox = result[0].boundingbox;
      olMap.getView().fitExtent(ol.proj.transform([parseFloat(bbox[2]),
          parseFloat(bbox[0]), parseFloat(bbox[3]), parseFloat(bbox[1])],
          'EPSG:4326', 'EPSG:3857'), olMap.getSize());
    }
  };
  xhr.send();
  evt.preventDefault();
};


// Funktion bei Anklicken der Checkboxen

var haltestellen = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
  url: 'http://student.ifip.tuwien.ac.at/geoserver/g06_2014/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=g06_2014:g06_Haltestellen&maxFeatures=50&outputFormat=json',
  projection: 'EPSG:3857'
}),
 style: new ol.style.Style({
       image: new ol.style.Icon({
          src: 'https://cloud.githubusercontent.com/assets/9718782/5702712/6ce678b0-9a5d-11e4-9c26-22a44aea13ea.png',
        })
      
    })
}); 

document.getElementById('haltestellen').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(haltstellen);
  }else{
    olMap.removeLayer(haltestellen);
  }
};

var schulen = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
  url: 'http://student.ifip.tuwien.ac.at/geoserver/g06_2014/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=g06_2014:g06_Schulen&maxFeatures=50&outputFormat=json',
  projection: 'EPSG:3857'
}),
 style: new ol.style.Style({
       image: new ol.style.Icon({
          src: 'https://cloud.githubusercontent.com/assets/9718782/5702554/dad22b5a-9a5b-11e4-9189-45cad967981d.png',
        })
      
    })
}); 

document.getElementById('schulen').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(schulen);
  }else{
    olMap.removeLayer(schulen);
  }
};

var universitaeten = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
  url: 'http://student.ifip.tuwien.ac.at/geoserver/g06_2014/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=g06_2014:g06_Universitaeten&maxFeatures=50&outputFormat=json',
  projection: 'EPSG:3857'
}),
 style: new ol.style.Style({
       image: new ol.style.Icon({
          src: 'https://cloud.githubusercontent.com/assets/9718782/5702722/7a5f5ce6-9a5d-11e4-8074-ecde4ace1b3e.png',
        })
      
    })
}); 

document.getElementById('universitaeten').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(universitaeten);
  }else{
    olMap.removeLayer(universitaeten);
  }
};

var sportstaetten = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
  url: 'http://student.ifip.tuwien.ac.at/geoserver/g06_2014/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=g06_2014:g06_Sportstaetten&maxFeatures=50&outputFormat=json',
  projection: 'EPSG:3857'
}),
 style: new ol.style.Style({
       image: new ol.style.Icon({
          src: 'https://cloud.githubusercontent.com/assets/9718782/5702718/73d71ad0-9a5d-11e4-8987-0eb33cdcb922.png',
        })
      
    })
}); 

document.getElementById('sportstaetten').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(sportstaetten);
  }else{
    olMap.removeLayer(sportstaetten);
  }
};

var parkanlagen = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
  url: 'http://student.ifip.tuwien.ac.at/geoserver/g06_2014/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=g06_2014:g06_Parkanlagen&maxFeatures=50&outputFormat=json',
  projection: 'EPSG:3857'
}),
 style: new ol.style.Style({
       image: new ol.style.Icon({
          src: 'https://cloud.githubusercontent.com/assets/9718782/5702720/7767bb5a-9a5d-11e4-9577-b40263281ec2.png',
        })
      
    })
}); 

document.getElementById('parkanlagen').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(parkanlagen);
  }else{
    olMap.removeLayer(parkanlagen);
  }
};

var spielplaetze = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
  url: 'http://student.ifip.tuwien.ac.at/geoserver/g06_2014/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=g06_2014:g06_Spielplaetze&maxFeatures=50&outputFormat=json',
  projection: 'EPSG:3857'
}),
 style: new ol.style.Style({
       image: new ol.style.Icon({
          src: 'https://cloud.githubusercontent.com/assets/9718782/5702710/65b04274-9a5d-11e4-8484-ac290f232ade.png',
        })
      
    })
}); 

document.getElementById('spielplaetze').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(spielplaetze);
  }else{
    olMap.removeLayer(spielplaetze);
  }
};

var fahrrad = new ol.layer.Vector({
  source: new ol.source.GeoJSON({
  url: 'http://student.ifip.tuwien.ac.at/geoserver/g06_2014/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=g06_2014:g06_Fahrradabstellanlagen&maxFeatures=50&outputFormat=json',
  projection: 'EPSG:3857'
}),
 style: new ol.style.Style({
       image: new ol.style.Icon({
          src: 'https://cloud.githubusercontent.com/assets/9718782/5702714/70cb2674-9a5d-11e4-9465-11cbfc8fe7b9.png',
        })
      
    })
}); 

document.getElementById('fahrrad').onclick = function(e){
  if(this.checked==1){
    olMap.addLayer(fahrrad);
  }else{
    olMap.removeLayer(fahrrad);
  }
};

