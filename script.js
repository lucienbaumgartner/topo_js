// define canvas geometries
// width and height
var width = 960,
    height = 600;
// projection of the map
var projection = d3.geoAlbers()
    .rotate([0, 0])
    .center([8.3, 46.8])
    .scale(16000)
    .translate([width / 2, height / 2])
    .precision(.1);
// coerce all paths to projection
var path = d3.geoPath()
    .projection(projection);
// create svg object to which we append the other d3 objects to
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
// define color range
var color = d3.scaleQuantile()
    .range(["rgb(237, 248, 233)", "rgb(186, 228, 179)", "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);
// append d3 elements
// load json
d3.json("./cantons.json").then(function(swiss) {
    // load metadata
    d3.csv("./bip.csv").then(function(data) {
      // scale color domain to metadata
      color.domain([ d3.min(data, function(d){ return +d.value; }),
        d3.max(data, function(d){ return +d.value; })
        ]);
      // log metadata
      console.log(data);
      // subset cantonal data
      var cantons = topojson.feature(swiss, swiss.objects.cantons);
      // log cantonal data
      console.log(cantons);
      // loop over data and append it to the cantonal metadata
      for(var i = 0; i < data.length; i++){
        // grab canton name
        var dataState = data[i].name;
        //grab data value, and convert from string to float
        var dataValue = parseFloat(data[i].value);
        //find the corresponding canton inside the GeoJSON
        for(var n = 0; n < cantons.features.length; n++){
          // grab canton name in GeoJSON
          var jsonState = cantons.features[n].properties.name;
          // if statment to merge by name of canton
          if(dataState == jsonState){
            // Copy the data value into the JSON as a new property
            cantons.features[n].properties.value = dataValue;
            //stop looking through the JSON
            break;
          }
        }
      }
      // now append the d3 objects
      // canton polygons
      svg.append("g")
          .attr("class", "canton")
          .attr("d", path)
         .selectAll("path")
           .data(cantons.features)
         .enter().append("path")
            // add the metadata fill
           .style("fill", function(d){
             //get the data value
             var value = d.properties.value;
             if(value){
               //If value exists
               return color(value);
             } else {
               // If value is undefined
               return "#ccc"
             }
           })
           .attr("d", path);
      // add canton borders as seperate lines
      svg.append("path")
          .datum(topojson.mesh(swiss, swiss.objects.cantons, function(a, b) { return a !== b; }))
          .attr("class", "canton-boundary")
          .attr("d", path);
      // add the canton names (basic property)
      svg.append("g")
        .selectAll("text")
          .data(cantons.features)
        .enter().append("text")
          .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .text(function(d) { return d.properties.name; });
    });
});
