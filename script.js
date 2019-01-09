var width = 960,
    height = 600;
var projection = d3.geoAlbers()
    .rotate([0, 0])
    .center([8.3, 46.8])
    .scale(16000)
    .translate([width / 2, height / 2])
    .precision(.1);
var path = d3.geoPath()
    .projection(projection);
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
var color = d3.scaleQuantile()
    .range(["rgb(237, 248, 233)", "rgb(186, 228, 179)", "rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);

d3.json("/cantons.json").then(function(swiss) {
    d3.csv("/bip.csv").then(function(data) {
      color.domain([ d3.min(data, function(d){ return +d.value; }),
        d3.max(data, function(d){ return +d.value; })
        ]);
      console.log(data);
      var cantons = topojson.feature(swiss, swiss.objects.cantons);
      console.log(cantons);
      /*
      for(var i = 0; i < cantons.features.length; i++){
        if (cantons.features[i].properties.name == data.name) {
          cantons.features[i].properties.value = +data.value
        }
      }
      */
      for(var i = 0; i < data.length; i++){
        // grab state name
        var dataState = data[i].name;

        //grab data value, and convert from string to float
        var dataValue = parseFloat(data[i].value);

        //find the corresponding state inside the GeoJSON
        for(var n = 0; n < cantons.features.length; n++){

          // properties name gets the states name
          var jsonState = cantons.features[n].properties.name;
          // if statment to merge by name of state
          if(dataState == jsonState){
            //Copy the data value into the JSON
            // basically creating a new value column in JSON data
            cantons.features[n].properties.value = dataValue;

            //stop looking through the JSON
            break;
          }
        }
      }
      //console.log(cantons);
      svg.append("g")
          .attr("class", "canton")
          .attr("d", path)
         .selectAll("path")
           .data(cantons.features)
         .enter().append("path")
           .style("fill", function(d){
             //get the data value
             var value = d.properties.value;

             if(value){
               //If value exists
               return color(value);
             } else {
               // If value is undefined
               //we do this because alaska and hawaii are not in dataset we are using but still in projections
               return "#ccc"
             }

           })
           .attr("d", path);
      svg.append("path")
          .datum(topojson.mesh(swiss, swiss.objects.cantons, function(a, b) { return a !== b; }))
          .attr("class", "canton-boundary")
          .attr("d", path);
      svg.append("g")
        .selectAll("text")
          .data(cantons.features)
        .enter().append("text")
          .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .text(function(d) { return d.properties.name; });
    });
});
/*
d3.json("cantons.json").then(function(swiss) {
  var cantons = topojson.feature(swiss, swiss.objects.cantons);
  cantons.features[0].properties.value = 107;
  console.log(cantons.features[0].properties.value);
  console.log(cantons.features[0].properties.name);
  console.log(swiss);
  console.log(cantons);
  svg.append("path")
      .datum(cantons)
      .attr("class", "canton")
      .attr("d", path)
  svg.append("path")
      .datum(topojson.mesh(swiss, swiss.objects.cantons, function(a, b) { return a !== b; }))
      .attr("class", "canton-boundary")
      .attr("d", path);
  svg.selectAll("text")
      .data(cantons.features)
    .enter().append("text")
      .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .text(function(d) { return d.properties.name; });
});
*/
