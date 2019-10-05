var margin = {top: 50, right: 50, bottom: 50, left: 70}
  , width = 1200 - margin.left - margin.right // Use the window's width
  , height = 600 - margin.top - margin.bottom; // Use the window's height

svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom * 2)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var projection = d3.geoAlbersUsa().translate([width / 2.5, height/ 2]);
var earthquakes = d3.map();

var path = d3.geoPath().projection(projection);

var maxEarthquakes;
var promises = [
  d3.json("states-10m.json"),
    d3.dsv(",", "state-earthquakes.csv").then(function (data) {
        data.forEach(function (d) {
            earthquakes.set(d.States, [d.States, d.Region, +d["Total Earthquakes"]]);
        });
        maxEarthquakes = d3.max(data, function (d) { return +d["Total Earthquakes"]; });
    })
];

var tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d) {
          return "State: " +  d.properties["name"]
              + "<br>Region: " + earthquakes.get(d.properties["name"])[1]
              + "<br>Earthquakes: " + earthquakes.get(d.properties["name"])[2];
      });
svg.call(tip);

Promise.all(promises).then(function ([us]) {
    // Use log scale to find the thresholds
    var zScale = d3.scaleLog() // scale for color
            .domain([1, maxEarthquakes]) // input
            .range([0, 9]); // output

    var legendRange = []; // array for the legend values
    for (var i = 1; i <= 8; i++) {
        legendRange.push(zScale.invert(i));
    }
    var colorScale = d3.scaleThreshold() // pick colors based on threshold
        .domain(legendRange)
        .range(d3.schemeReds[9]);

    legendRange.unshift(0);
    // console.log(legendRange);
    // console.log(d3.schemeReds[9]);

    var states = topojson.feature(us, us.objects.states).features;

    svg.selectAll(".state")
        .data(states)
        .enter().append("path")
        .attr("class", "state")
        .attr("d", path)
        .attr("fill", function (d) {
            if (earthquakes.get(d.properties["name"])) {
                var val = earthquakes.get(d.properties["name"])[2];
                return colorScale(val);
            }
        })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    // add the legend
    svg.append("text")
        .attr("x", width - 5 * margin.right)
        .attr("y", height/5)
        .text("Earthquake Frequency");

    var legend = svg.selectAll(".legend")
        .data(legendRange)
        .enter().append("g")
        .attr("class", "legend");

    var legendShape = 25, baseHeight = height/4;
    legend.append("rect")
        .attr("x", width - 4 * margin.right + 10)
        .attr("y", function (d, i) {
            return baseHeight + (legendShape + 2) * i;
        })
        .attr("width", legendShape)
        .attr("height", legendShape)
        .style("fill", function (d, i) {
            return d3.schemeReds[9][i];
        });

    legend.append("text")
        .attr("class", "mono")
        .text(function (d, i) {
            return Math.ceil(legendRange[i]);
        })
        .attr("x", width - 4 * margin.right + legendShape + 15)
        .attr("y", function (d, i) {
            return baseHeight + legendShape / 2 + (legendShape + 2) * i;
        });
});
