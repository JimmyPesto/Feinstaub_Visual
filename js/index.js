

const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
const formatTime = d3.timeFormat("%d-%b");


const pm10 = "PM10", pm25 = "PM25";
let selectedData = "";

const parseDate = function(d) {
    d.timestamp = parseTime(d.timestamp);
    //console.log(formatTime(d.timestamp));
};

data10.forEach(parseDate);
data25.forEach(parseDate);

//Global data array
let data = [];

const selectDataSource = function(source) {
  console.log("selecting source:",source);
  if(source === pm10) {
      data = data10;
      selectedData = pm10;
  } else if(data === pm25) {
      data = data25;
      selectedData = pm25;
  }
};

selectDataSource(pm10);




var margin = {top: 10, right: 10, bottom: 50, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#data")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// group the data: I want to draw one line per group
var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.sensorid;})
    .entries(data);

// Add X axis --> it is a date format
var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.timestamp; })).nice()
    .range([0, width ]);
// Add X axis legend at bottom of page
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
        .tickFormat(d3.timeFormat("%d-%b")))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

// Add Y axis
var y = d3.scaleLinear()
    .domain([0, 60])//d3.max(data, function(d) { return +d.value; })-80])
    .range([ height, 0 ]);

svg.append("g")
    .call(d3.axisLeft(y));

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Feinstaub (PM10)");

// // color palette
// var res = sumstat.map(function(d){ return d.key }) // list of group names
//
// var color = d3.scaleOrdinal()
//     .domain(res)
//     .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999']);

// Draw the line
svg.selectAll(".line")
    .data(sumstat)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", '#888888')//function(d){ return color(d.key) })
    .attr("stroke-width", 0.3)
    .style("opacity", 0.7)
    .attr("d", function(d){
        return d3.line()
            .x(function(d) { return x(d.timestamp); })
            .y(function(d) { return y(+d.value); })
            (d.values)
    })
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

svg.append("g")
    .attr("transform", "translate(0, "+y(40)+")")
    .append("line")
    .attr("x2", width)
    .style("stroke", "#ef1000")
    .style("stroke-width", "1.5px");
svg.append("text")
    .style("fill", "#ef1000")
    .attr("transform", "translate("+(width-3)+", "+y(40)+")")
    .attr("y", 6)
    .attr("dy", "-.71em")
    .style("text-anchor", "end")
    .text("zugelassener Jahresmittelwert (PM10)");

svg.append("g")
    .attr("transform", "translate(0, "+y(50)+")")
    .append("line")
    .attr("x2", width)
    .style("stroke", "#ef4300")
    .style("stroke-width", "1.5px");
svg.append("text")
    .style("fill", "#ef4300")
    .attr("transform", "translate("+(width-3)+", "+y(50)+")")
    .attr("y", 6)
    .attr("dy", "-.71em")
    .style("text-anchor", "end")
    .text("zugelassener Tagesmittelwert (PM10)");

// set the type of number here, n is a number with a comma, .2% will get you a percent, .2f will get you 2 decimal points
var NumbType = d3.format(".2f");

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function mouseover(d, i) {
    d3.select(this)
        .style("opacity", 1)
        .attr("stroke", '#232323')//function(d){ return color(d.key) })
        .attr("stroke-width", 1.5);
    console.log({d});
    // $("#id1").text(d.key);
    div.transition()
        .duration(200)
        .style("opacity", .9);
    div	.html("Sensor ID = "+d.key)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
}

function mouseout(d, i) {
    d3.select(this)//.style("stroke", function(d) { return color(d.key); })
        .attr("stroke", '#888888')//function(d){ return color(d.key) })
        .attr("stroke-width", 0.3)
        .style("opacity", 0.7);
    div.transition()
        .duration(500)
        .style("opacity", 0);
}

//events

let radioClickPM10 = function (selectedData) {
    //
    selectDataSource(pm10);
};


let radioClickPM25 = function (selectedData) {
    //
    selectDataSource(pm25);
};

document.getElementById("pm10").onclick = radioClickPM10;
document.getElementById("pm25").onclick = radioClickPM25;