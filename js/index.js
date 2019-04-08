const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

const parseDate = function(d) {
    d.timestamp = parseTime(d.timestamp);
    //console.log(formatTime(d.timestamp));
};

data10.forEach(parseDate);
data25.forEach(parseDate);

const pm10 = "PM10", pm25 = "PM2.5";
const durationRate = 500;

let width, height;

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

// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 50, left: 50};

const chartDiv = document.getElementById("diagram");

// append the svg object to the body of the page
var svg = d3.select("#diagram")
    .append("svg");

redraw();

// Initialise a X axis:
var x = d3.scaleTime()
    .domain(d3.extent(data10, function(d) { return d.timestamp; })).nice()
    .range([0,width]);
var xAxis = d3.axisBottom(x)
    .tickFormat(d3.timeFormat("%d-%b"));
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class","myXaxis")
//.call(xAxis)


// Initialize an Y axis
var y = d3.scaleLinear()
    .domain([0, d3.max(data10, function(d) { return +d.value; })])//60])//d3.max(data, function(d) { return +d.value; })-80])
    .range([ height, 0 ]);
var yAxis = d3.axisLeft().scale(y);
svg.append("g")
    .attr("class","myYaxis");


// Create a function that takes a dataset as input and update the plot:
function update(data, selectedPM) {
    //console.log({selectedPM});
    //console.log(thresholds[selectedPM]);
    const sensorCount = data.length;
    document.getElementById("sensorCount").innerHTML = "Anzahl Sensoren: "+sensorCount;
    //Y-Axis Text
    svg.select("#y_legend").remove();
    svg.append("text")
        .attr("id","y_legend")//to delete later by this id
        .attr("transform", "rotate(-90)")
        .attr("y", -48)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Feinstaub ("+selectedPM+") [µg/m³]");

    //Grenzwerte
    svg.selectAll(".thresholdLines").remove();
    svg.selectAll(".thresholdText").remove();
    svg.append("g")
        .attr("transform", "translate(0, "+y(thresholds[selectedPM].year)+")")
        .append("line")
        .attr("class","thresholdLines")
        .attr("x2", width)
        .style("stroke", "#ef1000")
        .style("stroke-width", "1.5px");
    svg.append("text")
        .attr("class","thresholdText")
        .style("fill", "#ef1000")
        .attr("transform", "translate("+(width-3)+", "+y(thresholds[selectedPM].year)+")")
        .attr("y", 6)
        .attr("dy", "-.71em")
        .style("text-anchor", "end")
        .text("zugelassener Jahresmittelwert ("+selectedPM+")");

    svg.append("g")
        .attr("transform", "translate(0, "+y(thresholds[selectedPM].day)+")")
        .append("line")
        .attr("class","thresholdLines")
        .attr("x2", width)
        .style("stroke", "#ef4300")
        .style("stroke-width", "1.5px");
    svg.append("text")
        .attr("class","thresholdText")
        .style("fill", "#ef4300")
        .attr("transform", "translate("+(width-3)+", "+y(thresholds[selectedPM].day)+")")
        .attr("y", 6)
        .attr("dy", "-.71em")
        .style("text-anchor", "end")
        .text("zugelassener Tagesmittelwert ("+selectedPM+")");


    // Create the X axis:
    //x.domain(d3.extent(data, function(d) { return d.timestamp; })).nice();
    svg.selectAll(".myXaxis")
        .transition()
        .duration(durationRate)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    // create the Y axis
    //y.domain([0, 60]);//d3.max(data, function(d) { return +d.value; })-80]);
    svg.selectAll(".myYaxis")
        .transition()
        .duration(durationRate)
        .call(yAxis);

    // Draw the line
    let u = svg.selectAll(".line")
        .data(data);

    u
        .enter()
        .append("path")
        .attr("class","line")
        .merge(u)
        .transition()
        .duration(durationRate)
        .style("opacity", 0.7)
        .attr("fill", "none")
        .attr("stroke", '#888888')//function(d){ return color(d.key) })
        .attr("stroke-width", 0.3)
        .attr("d", function(d){
            return d3.line()
                .x(function(d) { return x(d.timestamp); })
                .y(function(d) { return y(+d.value); })
                (d.values)
        })
}

// At the beginning, I run the update function on the first dataset:
update(sumstat10, pm10);

const updateDataSource = function() {
    const checkedPM10 = document.getElementById('pm10').checked;
    console.log("checked Pm10:",checkedPM10);
    let data, selectedPM;
    if(checkedPM10 === true) {//initially set PM10 Checkbox and Data
        //document.getElementById('pm10').checked = true;
        //selectedData = pm10;
        data = sumstat10;
        selectedPM = pm10;
    } else if(checkedPM10 === false) {
        //document.getElementById('pm25').checked = true;
        //selectedData = pm25;
        data = sumstat25;
        selectedPM = pm25;
    }
    console.log("toggled data source");
    update(data, selectedPM);
};

updateDataSource();

document.getElementById("pm10").onclick = updateDataSource;
document.getElementById("pm25").onclick = updateDataSource;

//display tooltip while mouse on linechart
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

svg.selectAll(".line")
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

window.addEventListener('resize', redraw);

function redraw() {
    console.log("redraw");
    // Extract the width and height that was computed by CSS.
    width = document.getElementById('diagram').offsetWidth;//chartDiv.clientWidth;
    height = document.getElementById('diagram').offsetHeight;//chartDiv.clientHeight;


    console.log({width});
    console.log({height});

    // Use the extracted size to set the size of an SVG element.

    // append the svg object to the body of the page

    svg
        .attr("width", width - margin.left - margin.right)
        .attr("height", height)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


}