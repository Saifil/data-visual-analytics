var margin = {top: 50, right: 50, bottom: 50, left: 70}
  , width = 1000 - margin.left - margin.right // Use the window's width
  , height = 400 - margin.top - margin.bottom; // Use the window's height
var legentSet = {'5_5.9': '#FFC300', '6_6.9': '#FF5733', '7_7.9': '#C70039', '8.0+': '#900C3F'};

function makeSymbolPlot(data) {
    var svg = addSVG();
    makePlot(data, svg, 1, "Worldwide Earthquake stats 2000-2015 with symbols");
}
function makeSqrtSymbolPlot(data) {
    var svg = addSVG();
    makePlot(data, svg, 2, "Worldwide Earthquake stats 2000-2015 square root scale");
}
function makeLogSymbolPlot(data) {
    var svg = addSVG();
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            data[key]["8.0+"] = Math.max(data[key]["8.0+"], 1);
        }
    }
    makePlot(data, svg, 3, "Worldwide Earthquake stats 2000-2015 log scale");
}

function makePlot(data, svg, scaleType, title) {
    var minX = d3.min(data, function (d) {
        return d.year;
    });
    var maxX = d3.max(data, function (d) {
        return d.year;
    });
    var minY = d3.min(data, function (d) {
        return Math.min(d["5_5.9"], d["6_6.9"], d["7_7.9"], d["8.0+"]);
    });
    var maxY = d3.max(data, function (d) {
        return Math.max(d["5_5.9"], d["6_6.9"], d["7_7.9"], d["8.0+"]);
    });
    var xScale = d3.scaleTime()
        .domain([minX, maxX]) // input
        .range([0, width - 70]); // output

    var yScale;
    if (scaleType === 2) { // square root scale
        yScale = d3.scalePow()
            .exponent(0.5)
            .domain([minY, maxY]) // input
            .range([height, 0]); // output
    } else if (scaleType === 3) { // log scale
        yScale = d3.scaleLog()
            .domain([Math.max(minY, 1), maxY]) // input
            .range([height, 0]); // output
    } else {
        yScale = d3.scaleLinear()
            .domain([minY, maxY]) // input
            .range([height, 0]); // output
    }

    var line_5 = generateLine(xScale, yScale, "5_5.9");
    var line_6 = generateLine(xScale, yScale, "6_6.9");
    var line_7 = generateLine(xScale, yScale, "7_7.9");
    var line_8 = generateLine(xScale, yScale, "8.0+");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom
        // .text("Year");

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    plotLine(svg, data, "line_5_0", line_5);
    plotLine(svg, data, "line_6_0", line_6);
    plotLine(svg, data, "line_7_0", line_7);
    plotLine(svg, data, "line_8_0", line_8);

    addLegend(svg);
    addGraphTitleAndAxes(svg, "Year", "Num of Earthquakes", title);

    if (scaleType) { // add the symbols
        var meanEstDeaths = d3.mean(data, function (d) {
            return d["Estimated Deaths"];
        });
        addSymbol(svg, data, xScale, yScale, meanEstDeaths, "5_5.9");
        addSymbol(svg, data, xScale, yScale, meanEstDeaths, "6_6.9");
        addSymbol(svg, data, xScale, yScale, meanEstDeaths, "7_7.9");
        addSymbol(svg, data, xScale, yScale, meanEstDeaths, "8.0+");
    }

    // break page (add the new graph on next page)
    d3.select('body')
        .append('div')
        .attr("class", "pagebreak");
}

function addSymbol(svg, data, xScale, yScale, meanEstDeaths, magnitude) {
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle") // Uses the enter().append() method
        .attr("cx", function(d) { return xScale(d.year) })
        .attr("cy", function(d) { return yScale(d[magnitude]) })
        .attr("r", function (d) {
            var r = 15 * d["Estimated Deaths"] / meanEstDeaths;
            return (r < 5)? 5 + 2 * r / 5 : ((r > 15)? Math.min(10 + r / 15, 20) : r);
        })
        .style("fill", legentSet[magnitude])
        .style("stroke", "#fff");
}

function addSVG() {
    return d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

function addGraphTitleAndAxes(svg, xTitle, yTitle, title) {
    // now add titles to the axes
    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ -1 * margin.right +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text(yTitle)
        .style("font-family", "sans-serif");

    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (width/2) +","+(height+margin.left / 2)+")")  // centre below axis
        .text(xTitle)
        .style("font-family", "sans-serif");

    //graph title
     svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (width/2) +","+ -1 * margin.top / 2+")")  // centre below axis
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
        .y(function(d) { return yScale(d[magnitude]); }) // set the y values for the line generator
        .curve(d3.curveMonotoneX); // apply smoothing to the line
}

d3.dsv(",", "earthquakes.csv").
    then(function(data) {
        var parseDate = d3.timeParse("%Y");
        data.forEach(function(d){
            d.year = parseDate(d.year);
            d["8.0+"] = +d["8.0+"];
            d["7_7.9"] = +d["7_7.9"];
            d["6_6.9"] = +d["6_6.9"];
            d["5_5.9"] = +d["5_5.9"];
            d["Estimated Deaths"] = +d["Estimated Deaths"];
        });
        makePlot(data, addSVG(), 0, "Worldwide Earthquake stats 2000-2015"); // make line graph
        makeSymbolPlot(data); // make line graph with symbols
        makeSqrtSymbolPlot(data); // symbol using sqrt scale
        makeLogSymbolPlot(data); // symbol using log scale
    });