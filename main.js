
mapboxgl.accessToken = 'pk.eyJ1IjoiYW5hZ2hhaiIsImEiOiJjanRrZjN0b3YweGUxNDNtZDk3bmk0aXB1In0.h_pHapEmfp4YzIF-nUlKeA';

if (!mapboxgl.supported()) {
  var noSupport = listings.appendChild(document.createElement('div'));
  noSupport.className = 'item legend';
  noSupport.innerHTML = 'Sorry! This map cannot load because your browser does not support <a href="http://caniuse.com/#feat=webgl" target="_blank">WebGL</a> and MapboxGL.';
}


var ufoDataUrl = "https://raw.githubusercontent.com/anagha-jay/Datasets/master/ufo.geojson";

// Javascript code portion for getting data
$.ajax(ufoDataUrl).done(function(ajaxResponseValue) {
  markers = JSON.parse(ajaxResponseValue);
  main_fn(markers);
});


function main_fn(markers){
	console.log("inside main")

  markers.features = markers.features.slice(0,1000)

	var map = new mapboxgl.Map({
	  container: 'map',
	  style: 'mapbox://styles/anaghaj/cjwreudqj09xy1cnwikz4l9as',
	  center: [-77.04, 38.907],
	  zoom: 4
	});



	// disable scroll zoom when ?scroll=false is in URL
	var scrollZoom = location.search.split('scroll=')[1];
	if (scrollZoom == 'false') {
	  // console.log("hey")
	  map.scrollZoom.disable();
	  map.addControl(new mapboxgl.Navigation({
	    position: 'top-right'
	  }));
	}

	map.on('style.load', function () {
	  // Add marker data as a new GeoJSON source.
	  map.addSource("markers", {
	    "type": "geojson",
	    "data": markers
	  });

    console.log(markers.features.length)

	  // add layer for the circles
	  map.addLayer({
	    "id": "markers",
	    "interactive": true,
	    "type": "circle",
	    "source": "markers",
	    "layout": {},
	    "paint": {
	      "circle-color": "#FFFFFF",
	      "circle-radius": {
	        "base": 1,
	        "stops": [
	          [0,1],
	          [12,10]
	        ]
	      }
	    }
	  });


	  // add layer for marker active state
	  map.addLayer({
	    "id": "markers-hover",
	    "interactive": true,
	    "type": "circle",
	    "source": "markers",
	    "layout": {},
	    "paint": {
	      "circle-color": "#ff0000",
	      "circle-radius": {
	        "base": 1,
	        "stops": [
	          [0,1],
	          [12,10]
	        ]
	      }
	    },
	    "filter": ["==", "id", ""]
	  });

    var popup =  new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: true
    });

    map.on('mouseenter', 'markers', function (e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      var description = e.features[0].properties.comments;

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      popup.setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'markers', function () {
      map.getCanvas().style.cursor = '';
      popup.remove();
      });



	  console.log("Added map");

	  // if URL has a hash, zoom to location
	  if (location.hash) {
	    var loc = location.hash.replace('#','');
	    setActive(document.getElementById(loc));

	    map.setFilter("markers-hover", ["==", "id", parseInt(loc)]);

	    var getCoordinates;
	    var getType;

	    var getNumber = markers.features.forEach(function(locale){
	      if (locale.properties.id == loc) {
	        getCoordinates = locale.geometry.coordinates;
	        getType = locale.geometry.type;
	      }
	    });

	    if (getType == "MultiPoint") {
	      var bounds = mapboxgl.LngLatBounds.convert(getCoordinates);
	      map.fitBounds(bounds, {padding: 50});
	    } else {
	      map.setCenter(getCoordinates);
	      map.setZoom(12);
	    }
	  }
	});

	console.log("loaded data");

	function setActive(el) {
	  var siblings = listings.getElementsByTagName('div');
	  for (var i = 0; i < siblings.length; i++) {
	    siblings[i].className = siblings[i].className
	    .replace(/active/, '').replace(/\s\s*$/, '');
	  }

	  if (window.innerWidth < 700 ){
	    var mHeight = document.getElementById('listings').offsetHeight;
	    document.getElementById('listings').scrollTop = parseInt(el.dataset.top) - parseInt(mHeight);
	  } else {
	    document.getElementById('listings').scrollTop = parseInt(el.dataset.top) - 40;
	  }

	  // push state
	  if (history.pushState) {
	    history.pushState(null, null, '#'+el.id);
	  }
	  else {
	    location.hash = '#'+ el.id;
	  }
	  el.className += ' active';
	}

	// build sidebar listings
	markers.features.reduce(function(prev, locale, index, array) {
	  var prop = locale.properties;

	  // build legend
	  if (index == 0) {
	    var legend = listings.appendChild(document.createElement('div'));
	    legend.className = 'item legend';
	    legend.innerHTML = '<h1> UFO ANALYSIS </h1><p>Explore UFO appearances over the last century</p><p style="font-style: italic;"> Click on the City or Hover on the points to get more Information.</p>'
	;  }



	  var listing = listings.appendChild(document.createElement('div'));
	  listing.className = 'item';
	  listing.id = prop.id;
	  var size = listing.getBoundingClientRect();
	  listing.dataset.top = size.top;

	  var link = listing.appendChild(document.createElement('a'));
	  link.href = '#';
	  link.className = 'title';
	  link.innerHTML = prop.city + ', ' + prop.state;

	  if (prop.fictitious) {
	    var place = prop.country + ' (fictitious)';
	  } else {
	    var place = prop.country;
	  }

	  link.innerHTML += '<p class="icon marker inline small quiet">' + place + '</p>';



	  var details = listing.appendChild(document.createElement('div'));
	  details.className = 'item-details';
	  details.innerHTML += '<p class="icon time inline small quiet">Date ' + prop.datetime +  '</p>';

	  link.onclick = function() {
	    setActive(listing);

	    if (locale.geometry.type == "MultiPoint") {
	      var bounds = mapboxgl.LngLatBounds.convert(locale.geometry.coordinates);
	      map.fitBounds(bounds, {padding: 50});
	    } else {
	      map.flyTo({
	        center: locale.geometry.coordinates,
	        zoom: 12
	      });
	    }

	    map.setFilter("markers-hover", ["==", "id", prop.id]);

	    return false;
	  };
	},0);

	// When a click event occurs near a marker icon, activate it's listing in the sidebar and set the circle to active
	map.on('click', function (e) {
	    var features = map.queryRenderedFeatures(e.point, { layers: ['markers'] });

	    if (!features.length) {
	      return;
	    }

	    var feature = features[0];

	    // change circle fill on click
	    if (features.length) {
	      map.setFilter("markers-hover", ["==", "id", features[0].properties.id]);
	    } else {
	      map.setFilter("markers-hover", ["==", "id", ""]);
	    }


	    setActive(document.getElementById(feature.properties.id));
	});


	map.on('mousemove', function (e) {
	  var features = map.queryRenderedFeatures(e.point, { layers: ['markers'] });
	    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
	});
}
