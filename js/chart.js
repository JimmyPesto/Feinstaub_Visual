const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

const parseDate = function(d) {
    d.timestamp = parseTime(d.timestamp);
    //console.log(formatTime(d.timestamp));
};

data10.forEach(parseDate);
data25.forEach(parseDate);

const chartId = "chart"; //diagram

const pm10 = "PM10", pm25 = "PM2.5";
const durationRate = 500;

const thresholds = {
    [pm25]: {
        day: 25,
        year: 20,
    },
    [pm10]: {
        day: 50,
        year: 40,
    }
};

// group the data: I want to draw one line per group
var sumstat10 = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.sensorid;})
    .entries(data10);
const sensorCountPM10 = sumstat10.length;

// group the data: I want to draw one line per group
var sumstat25 = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.sensorid;})
    .entries(data25);
const sensorCountPM25 = sumstat25.length;

let data = sumstat10;

//////////////////////////////////////////////
// Chart Config /////////////////////////////
//////////////////////////////////////////////

// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width, // width gets defined below
    height = 250 - margin.top - margin.bottom;

// Set the scales ranges
var xScale = d3.scaleTime();
var yScale = d3.scaleLinear().range([height, 0]);

// Define the axes
var xAxis = d3.axisBottom().scale(xScale);
var yAxis = d3.axisLeft().scale(yScale);

// create a line
var line = d3.line();

// Add the svg canvas
var svg = d3.select("#"+chartId)
    .append("svg")
    .attr("height", height + margin.top + margin.bottom);

var artboard = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// set the domain range from the data
xScale.domain(d3.extent(data10, function(d) { return d.timestamp; })).nice();
yScale.domain([0, d3.max(data10, function(d) { return +d.value; })]);

// draw the line created above
var path = artboard.append("path").data([data])
    .style('fill', 'none')
    .style('stroke', 'steelblue')
    .style('stroke-width', '2px');

// Add the X Axis
var xAxisEl = artboard.append("g")
    .attr("transform", "translate(0," + height + ")");

// Add the Y Axis
// we aren't resizing height in this demo so the yAxis stays static, we don't need to call this every resize
var yAxisEl = artboard.append("g")
    .call(yAxis);

//////////////////////////////////////////////
// Drawing ///////////////////////////////////
//////////////////////////////////////////////
function drawChart() {
    // reset the width
    width = parseInt(d3.select('body').style('width'), 10) - margin.left - margin.right;

    // set the svg dimensions
    svg.attr("width", width + margin.left + margin.right);

    // Set new range for xScale
    xScale.range([0, width]);

    // give the x axis the resized scale
    xAxis.scale(xScale);

    // draw the new xAxis
    xAxisEl.call(xAxis);

    // specify new properties for the line
    line.x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.population); });

    // draw the path based on the line created above
    path.attr('d', line);
}

// call this once to draw the chart initially
drawChart();


//////////////////////////////////////////////
// Resizing //////////////////////////////////
//////////////////////////////////////////////

// redraw chart on resize
window.addEventListener('resize', drawChart);