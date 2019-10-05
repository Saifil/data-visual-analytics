var margin = {top: 50, right: 50, bottom: 50, left: 200}
  , width = 1000 - margin.left - margin.right // Use the window's width
  , height = 450 - margin.top - margin.bottom; // Use the window's height
var legentSet = {'West': '#142d90', 'South': '#C70039', 'Midwest': '#FFC300', 'Northeast': '#9ccc3c'};
var dataset, svg1;

function makePlot(data) {
    var minY = d3.min(data, function (d) {
        return Math.min(d["West"], d["South"], d["Northeast"], d["Midwest"]);
    });
    var maxY = d3.max(data, function (d) {
        return Math.max(d["West"], d["South"], d["Northeast"], d["Midwest"]);
    });

    var xScale = d3.scaleTime()
        .domain(d3.extent(data, function (d) { return d.year; })) // input
        .range([0, width - 70]); // output
    var yScale = d3.scaleLinear()
            .domain([minY, maxY]) // input
            .range([height, 0]); // output

    var line_west = generateLine(xScale, yScale, "West");
    var line_south = generateLine(xScale, yScale, "South");
    var line_north = generateLine(xScale, yScale, "Northeast");
    var line_mid = generateLine(xScale, yScale, "Midwest");

    var svg = addSVG("svgLineGraph");
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    plotLine(svg, data, "line_west", line_west);
    plotLine(svg, data, "line_south", line_south);
    plotLine(svg, data, "line_north", line_north);
    plotLine(svg, data, "line_mid", line_mid);

    addSymbol(svg, data, xScale, yScale);

    addLegend(svg);
    addGraphTitleAndAxes(svg, "Year", "Num of Earthquakes", "US Earthquakes by Region 2010-2015");
}

function makeBarPlot(region, year) {
    var filteredData = dataset.filter(function (d) {
        return d.year === year &&
             d.region === region;
    }).sort(function(a,b) {
            return (a["count"] < b["count"]) ? 1 : ((b["count"] < a["count"]) ? -1 : 0);
        }).sort();

    var xScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, function (d) { return d.count; })]) // input
        .range([0, width - 70]); // output

    var yScale = d3.scaleBand()
        .domain(d3.set(filteredData.map(function(d) { return d.state; } )).values().reverse())
        .range([height, 0]);

    svg1 = addSVG("svgBarChart");
    svg1.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

    svg1.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    // add the X gridlines
    svg1.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat(""))
        .style("color", "#E8E8E8");

    svg1.selectAll("bar")
        .data(filteredData)
        .enter().append("rect")
        .style("fill", "steelblue")
        .attr("x", 0)
        .attr("width", function (d) {return xScale(d.count);})
        .attr("y", function(d) { return yScale(d.state); })
        .attr("height", yScale.bandwidth() - 2);

    //graph title
     svg1.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (width/2 - margin.right) +","+ -1 * margin.top / 2+")")  // centre below axis
        .text(region + "ern Region Earthquakes " + year)
        .style("font-family", "sans-serif");
}

function addSymbol(svg, data, xScale, yScale) {
    for (var state in legentSet) {
        svg.selectAll(".dot")
        .data(data)
        .enter().append("circle") // Uses the enter().append() method
        .attr("cx", function(d) { return xScale(d.year) })
        .attr("cy", function(d) { return yScale(d[state]) })
        .attr("r", function () {
            this.region = state;
            return 3;
        })
        .style("fill", legentSet[state])
        .style("stroke", "#fff")
            .on("mouseover", onMouseOver)
            .on("mouseleave", onMouseLeave);
    }
}

var onMouseOver = function (d) {
    d3.select(this).attr("r", 6);
    // console.log(d.year.getFullYear().toString(), this.region);
    removeSVG("svgBarChart");
    makeBarPlot(this.region, d.year.getFullYear().toString())
};

var onMouseLeave = function () {
    d3.select(this).attr("r", 3)
    removeSVG("svgBarChart")
};

function addSVG(svgID) {
    return d3.select("body").append("svg")
        .attr("id", svgID)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("text-align", "center");
}

function removeSVG(vSvg) {
    d3.select("#" + vSvg).remove();
}

function addGraphTitleAndAxes(svg, xTitle, yTitle, title) {
    //graph title
     svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (width/2 - margin.right) +","+ -1 * margin.top / 2+")")  // centre below axis
        .text(title)
        .style("font-family", "sans-serif");
}

function addLegend(svg) {
    // add legend
	var legend = svg.append("g")
        .attr("class", "legend")
        .attr("x", width - 55)
        .attr("y", 25)
        .attr("height", 100)
        .attr("width", 100);

	legend.selectAll('g').data([0, 0, 0, 0])
        .enter()
        .append('g')
        .each(function(d, i) {
            var g = d3.select(this);
            var key = Object.keys(legentSet)[i];
            g.append("rect")
                .attr("x", width - 55)
                .attr("y", i * 15)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", legentSet[key]);

            g.append("text")
                .attr("x", width - 40)
                .attr("y", i * 15 + 8)
                .attr("height", 30)
                .attr("width", 100)
                .text(key);
        });
}

function plotLine(svg, data, className, line) {
    svg.append("path")
    .datum(data) // 10. Binds data to the line
    .attr("class", className) // Assign a class for styling
    .attr("d", line); // 11. Calls the line generator
}

function generateLine(xScale, yScale, magnitude) {
    return d3.line()
        .x(function(d) { return xScale(d.year); }) // set the x values for the line generator
        .y(function(d) { return yScale(d[magnitude]); }); // set the y values for the line generator
}

function aggregateDate(data) {
    var parseDate = d3.timeParse("%Y");
    var arrayRegion = d3.map(data, function(d){return d.region;}).keys();
    var arrayYear = d3.map(data, function(d){return d.year;}).keys();
    var reData = [];
    for (var year in arrayYear) {
        var dataRow = {};
        if (arrayYear.hasOwnProperty(year)) {
            // dataRow["year"] = parseDate(arrayYear[year]);
            dataRow["year"] = parseDate(arrayYear[year]);
        }
        for (var region in arrayRegion) {
            if (arrayRegion.hasOwnProperty(region)) {
                dataRow[arrayRegion[region]] = 0;
            }
        }
        reData.push(dataRow);
    }
    for (var key in data) {
        if (data.hasOwnProperty(key)) { // get every row of og data
            if (data[key]["region"] && data[key]["year"] && data[key]["count"]) {
                reData[arrayYear.indexOf(data[key]["year"])][data[key]["region"]] += data[key]["count"];
            }
        }
    }
    return reData;
}

d3.dsv(",", "state-year-earthquakes.csv").
    then(function(data) {
        data.forEach(function(d){
            d.count = +d.count;
        });
        dataset = data;
        makePlot(aggregateDate(data));
});