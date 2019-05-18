// Function to initialize map
function createMap(quakeLocations) {

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap
  };

  // Create an overlayMaps object to hold the quakeLocations layer
  
  var overlayMaps = {
    "Earthquake Locations": quakeLocations
  };

  // Create the map object with options
  var map = L.map("map-id", {
    center: [36.1699, -115.1398],
    zoom: 5,
    layers: [lightmap, quakeLocations]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);
  
  // Pass in createLegend function to include legend in layer control
  createLegend(map);
}

// Function to assign colors to legend
// Colors based on colors in createMarkers function
function getColor(d) {
  return d > 5  ? '#ff4500' :
         d > 4  ? '#f77802' :
         d > 3  ? '#ed9f0c' :
         d > 2   ? '#dec117' :
         d > 1   ? '#cae123' :
         d > 0   ? '#adff2f' :
                    '#FFEDA0';
}

// Function to create legend
function createLegend(map) {
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [0, 1, 2, 3, 4, 5];
    var labels = [];

    // Create title for legend and pass in to html
    var legendInfo = "<b>Magnitude</b><br>";

    div.innerHTML = legendInfo;

    // Loop through limits, using getColor function to add colors
    for (var i = 0; i < limits.length; i++) {
      div.innerHTML +=
          '<i style="background-color:' + getColor(limits[i] + 1) + '"></i> ' +
          limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+');
  }
    return div;
};
  // Add legend to map
  legend.addTo(map);
};

// Function to create earthquake markers
function createMarkers(response) {

  // Pull features from response
  var earthquakes = response.features;

  // Initialize an array to hold earthquake markers
  var quakeMarkers = [];

  // Loop through features
  for (var index = 0; index < earthquakes.length; index++) {
    
    // Set variable for each earthquake
    var quake = earthquakes[index];
    
    // Determine magnitude of each earthquake and assign to variable
    var magnitude = quake.properties.mag;
    
    // Initialize circleColor variable
    var circleColor = "";

    // If statement to determine color of marker based on magnitude
    if (magnitude > 5) {
      var circleColor = "#ff4500"
    }
    else if (magnitude > 4) {
      var circleColor = "#f77802"
    }
    else if (magnitude > 3) {
      var circleColor = "#ed9f0c"
    }
    else if (magnitude > 2) {
      var circleColor = "#dec117"
    }
    else if (magnitude > 1) {
      var circleColor = "#cae123"
    }
    else {
      var circleColor = "#adff2f"
    }

    // Create circle marker for each earthquake
    var quakeMarker = L.circle(
      [quake.geometry.coordinates[1], quake.geometry.coordinates[0]], {radius: magnitude * 20000, 
        color: "black", 
        weight: 1, 
        fillColor: circleColor, 
        fillOpacity: 0.8})
      
        // Bind popup w/ location, time and magnitude of earthquake
        .bindPopup("<h3>" + quake.properties.place + "<h3><hr><p>" + new Date(quake.properties.time) + "<br>" + "Magnitude: " + magnitude + "</p");

    // Add each marker to the quakeMarkers array
    quakeMarkers.push(quakeMarker);
  }

  // Create a layer group made from the quakeMarkers array and pass into the createMap function
  createMap(L.layerGroup(quakeMarkers));
};

// Call USGSS earthquake API to find info for all earthquakes in the last week. Call createMarkers when complete
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", createMarkers);
