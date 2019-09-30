var margin = {top: 50, right: 50, bottom: 50, left: 70}
  , width = 800 - margin.left - margin.right // Use the window's width
  , height = 470 - margin.top - margin.bottom; // Use the window's height

var dataset, svg;
var categoryArray = ["0 to 9", "10 to 99", "100 to 499", "500 or above"];
var gradientColor = ["#ffffcc", "#ffeda0", "#fed976", "#feb24c",
    "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026"];

function addSVG() {
    svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom * 2)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("text")
        .attr("id", "mouseText")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (width/2 - margin.left / 4) +","+ -margin.top/1.5 +")");  // centre below axis
}

function removeSVG() {
    d3.select("svg").remove();
}

d3.select("body").append("div").attr("id", "selectDiv").style("width", "" + (width + 2 * margin.left) + "px");
d3.select("#selectDiv").append("center")
        .text("Visualizing Earthquake Counts by States 2010-2015")
        .style("font-family", "sans-serif");

d3.select("#selectDiv").append("text").text("Range of ")
    .append("select")
    .style("text-align", "left")
    .attr("id", "heatSelect")
    .attr("transform", "translate("+ (width/2 - margin.left / 4) +","+ height / 2 +")")  // centre below axis
    .selectAll("option")
    .data(categoryArray)
    .enter().append("option")
    .text(function(d) { return d; })
    .attr("value", function (d, i) {
        return d;
    });

    d3.select("#heatSelect").on("change", function () {
        var ctg = this.value;
        removeSVG();
        addSVG();
        reshapeData(dataset, ctg)
    });

var onMouseOver = function(d) {
    svg.select("#mouseText").text(d.state + " "  + d.year + ": " + d["count"]);
};

var onMouseLeave = function () {
    svg.select("#mouseText").text("");
};

function makePlot(data) {
    var heightPad = 120;
    var xScale = d3.scaleBand()
        .domain(d3.set(data.map(function(d) { return d.state; } )).values())
        .range([0, width])
        .padding(0.02);

    var yScale = d3.scaleBand()
            .domain(d3.set(data.map(function(d) { return d.year; } )).values().reverse()) // input
            .range([height - heightPad, 0])
            .padding(0.02); // output

    var zScale = d3.scaleQuantile()
            .domain(d3.extent(data, function(d) { return d.count; })) // input
            .range(gradientColor); // output

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - heightPad) + ")")
        .call(d3.axisBottom(xScale))
        .call(g => g.select(".domain").remove())
        .selectAll("text")
        .attr("transform", function() {
            return "translate(" + this.getBBox().height * -2 + "," + this.getBBox().height * 1.5 + ")rotate(-45)";
        });

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)) // Create an axis component with d3.axisLeft
        .call(g => g.select(".domain").remove())
        .selectAll("text")
        .style("font-weight", "500");

    svg.selectAll()
      .data(data)
      .enter()
      .append("rect")
      .attr("x", function(d) { return xScale(d.state) })
      .attr("y", function(d) { return yScale(d.year) })
      .attr("width", xScale.bandwidth() )
      .attr("height", yScale.bandwidth() )
      .style("fill", function(d) { return zScale(d["count"]); })
        .on("mouseover", onMouseOver)
        .on("mouseleave", onMouseLeave);

    // now add titles to the axes
    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ -1 * margin.right +","+(height/2 - margin.top)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text("Year")
        .style("font-family", "sans-serif");

    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (width/2) +","+(height - heightPad +margin.bottom * 1.2)+")")  // centre below axis
        .text("States")
        .style("font-family", "sans-serif");

    // add heat map legend
    svg.append("text")
        .attr("x", 0)
        .attr("y", height - heightPad / 8)
        .text("Count");

    var legend = svg.selectAll(".legend")
        .data([0].concat(zScale.quantiles()), function(d) {return d;})
        .enter().append("g")
        .attr("class", "legend");

    var legendWidth = width / (zScale.quantiles().length + 1);
    legend.append("rect")
        .attr("x", function(d, i){ return legendWidth * i;})
        .attr("y", height)
        .attr("width", legendWidth)
        .attr("height", 50/2)
        .style("fill", function(d, i) {return gradientColor[i]; });

    legend.append("text")
        .attr("class", "mono")
        .text(function(d) {
            return "" + Math.round(d).toString();})
        .attr("x", function(d, i){ return legendWidth *i;})
        .attr("y", height+ 50);
}

function reshapeData(data, ctg) {
    var reData = [];
    for (var key in data) {
        if (data.hasOwnProperty(key)) { // get every row of og data
            var state = data[key]["States"];
            var category = data[key]["Category"];
            for (var indvKey in data[key]) { // traverse all columns for given row
                var dataRow = {};
                if (!(indvKey === "States" || indvKey === "Category")) {
                    dataRow["state"] = state;
                    if (data[key].hasOwnProperty(indvKey)) {
                        dataRow["year"] = +indvKey;
                        dataRow["count"] = +data[key][indvKey];
                    }
                    dataRow["category"] = category;
                }
                if (Object.keys(dataRow).length && dataRow["state"] && dataRow["category"] === ctg) {
                    reData.push(dataRow);
                }
            }
        }
    }
    makePlot(reData);
}

d3.dsv(",", "earthquakes.csv").
    then(function(data) {
        dataset = data;
        addSVG();
        reshapeData(data, "0 to 9");
    });