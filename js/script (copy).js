//Global variables declaration
var time_scale;
var station_scale;

var line_filter;
var day_filter;
var bound_filter;
var time_filter;

var lines;
var lineID;

var times;
var time_axis;
var timeDeparted;

var points;

var stations;
var this_stations;

//returns the three filters
function filter(data){
    //equates global variable line to lines data
    lines = data;
    line_filter = d3.select('#filter')
        .append("select")
            .attr("id", "line")
            .on("change", change)        
        line_filter.selectAll("option")
            .data(data)
            .enter()
            .append("option")
            .text(function(d){return d.line_name; })
            .attr("value", function(d){return d.line_id; });
    //initializes the lines filter to EDSA    
    line_filter.property("value", 0)

    day_filter = d3.select('#filter')
        .append("select")
            .attr("id", "day")
            .on("change", change)  
        day_filter.append("option")
            .attr("value", "weekday")
            .text("Weekday");
        day_filter.append("option")
            .attr("value", "weekend")
            .text("Weekend");

    bound_filter = d3.select('#filter')
        .append("select")
            .attr("id", "bound")
            .on("change", change)  
        bound_filter.append("option")
            .attr("value", "north")
            .text("Northbound");
        bound_filter.append("option")
            .attr("value", "south")
            .text("Southbound");
    redraw();
} 

//set departure time
function setTime(data){
    times = data
    time_filter = d3.select('#setTime')
        .append("select")
            .attr("id", "startTime")
            .on("change", change)        
        time_filter.selectAll("option")
            .data(data)
            .enter()
            .append("option")
            .text(function(d){return d.time;})
            .attr("value", function(d){return d.time_id; });
    time_filter.property("value", 0);
    redraw();
}

//updates the list of stations, aka, remove the former list and replace it with the new list
function change(){
    //change maxN with the max count of stations
    var maxN = 38; 
    d3.selectAll(".list-group").remove();
    d3.select("svg").remove();
    redraw();
}

//checking for the filtered values
function redraw(){
    var this_line = lines.filter(function(d){return d.line_id===parseInt(line_filter.property("value"));});
    //gets the filtered line id in the array
    lineID = this_line[0].line_id; 

    var this_time = times.filter(function(d){return d.time_id===parseInt(time_filter.property("value"));});
    //gets the filtered time_ms in the array
    timeDeparted = this_time[0].time_ms;
    draw(stations);  
}   

//drawing of the chart
function draw(data) {
    stations = data;
    // set up the viewport, the scales, and axis generators    
    var chart_container_dimensions = {width: 1200, height: 1000},
        cmargin = {top: 50, right: 20, bottom: 70, left: 200},        
        chart_dimensions = {
            width: chart_container_dimensions.width - cmargin.left - cmargin.right,
            height: chart_container_dimensions.height - cmargin.top - cmargin.bottom
        };  

    //filters the stations with the same line ID
    this_stations = stations.filter(function(d){return lineID === d.line_id;});

    //loads stations from station.json file given the line ID
    station_scale = d3.scale.ordinal()
        .rangeBands([0, chart_dimensions.height])
        .domain(this_stations.map(function(d){return d.station_name}))

    var station_axis = d3.svg.axis()
        .scale(station_scale)
        .orient("left");

    //time is in milliseconds equivalent with domain 0 == 8AM
    //So if we want to start in 00:00 (12 mn), then offset it negatively 8hours
    //1000*60s*60m*8  = 28800000
    time_scale = d3.time.scale()
        .range([0, chart_dimensions.width])
        .domain([timeDeparted, timeDeparted+43200000]); //adds 12 hours after the time departed
    var time_axis = d3.svg.axis()
        .scale(time_scale)
        .orient("bottom")
        .ticks(d3.time.minute, 30)
        .tickFormat(d3.time.format('%H:%M'));
        
    
    // draw axes
    var g = d3.select("#timeseries")
        .append("svg")
            .attr("width", chart_container_dimensions.width)
            .attr("height", chart_container_dimensions.height)
        .append("g")
            .attr("transform", "translate(" + cmargin.left + "," + cmargin.top + ")")
            .attr("id","chart");

        g.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + chart_dimensions.height + ")")
          .call(time_axis)
          .selectAll(".tick text")
            .style("text-anchor", "start")
            .attr("y", 0)
            .attr("x", 10)
            .attr("dy", ".50em")
            .attr("transform", "rotate(90)");
        //There should be y positioning assignment right here. Scaling part
        g.append("g")
          .attr("class", "y axis")
          .call(station_axis)
             
    //displays the stations on the left side of the screen
    var station_items = d3.select("#station")
        .selectAll("div")
        .data(this_stations)
        .enter()
        .append("div")
            .attr("class","list-group")
            .attr('id',function(d){return d.line_id})       
    station_items.append("div")
        .attr("class", "list-group-item active") 
        .text(function(d){return d.station_name;});
    d3.selectAll('.list-group')
            .on('click', get_timeseries_data);
}

function get_timeseries_data(d,i){
    // get the id of the current element
    var id = d.station_id;
    // see if we have an associated time series
    var ts = d3.select("#station_"+id);
    // toggle
    if (ts.empty()){
        // if(line_filter.property("value") === "weekday")
        if(day_filter.property("value")==="weekday" && bound_filter.property("value") ==="north"){
            d3.json('data/wkdayN.json', function(data){
                points = data;
                filtered_data = points.filter(function(d){
                    if(d.time_ms >= timeDeparted){
                        return id === d.station_id;
                    }
                });
                draw_timeseries(filtered_data, id);
            });
            console.log("day north");
        }
        //error
        else if(day_filter.property("value")==="weekend" && bound_filter.property("value") ==="north"){
            d3.json('data/wkendN.json', function(data){
                points = data;
                filtered_data = points.filter(function(d){if(d.time_ms >= timeDeparted){return id === d.station_id;}});
                draw_timeseries(filtered_data, id); 
            });
            console.log("end north");
        }

        else if(day_filter.property("value")==="weekday" && bound_filter.property("value") ==="south"){
            d3.json('data/wkdayS.json', function(data){
                points = data;
                filtered_data = points.filter(function(d){if(d.time_ms >= timeDeparted){return id === d.station_id;}});
                draw_timeseries(filtered_data, id);
            });
            console.log("day south");
        }
        else if(day_filter.property("value")==="weekend" && bound_filter.property("value") ==="south"){
            d3.json('data/wkendS.json', function(data){
                points = data;
                filtered_data = points.filter(function(d){if(d.time_ms >= timeDeparted){return id === d.station_id}});
                draw_timeseries(filtered_data, id);
            });
            console.log("end south");
        }
        console.log(id + " displayed");
    } else {
        ts.remove()
        console.log(d.station_id + " removed");
    }
}

function draw_timeseries(data, id){  
    console.log(timeDeparted)
    var line = d3.svg.line()
        .x(function(d){return time_scale(d.time_ms)}) // add traffic time
        .y(function(d){return station_scale(d.station_name)})
        .interpolate("linear")
    
    var g = d3.select("#chart")
        .append("g")
        .attr("id", "station_" + id)
        .attr("class", "timeseries " + "station_" +id)
    
    g.append("path")
        .attr("d", line(data))
    
    g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {return time_scale(d.time_ms)})
        .attr("cy", function(d) {return station_scale(d.station_name)})
        .attr("r",0)
            
    var enter_duration = 1000;
    
    g.selectAll("circle")
        .transition()
        .delay(function(d, i) { return i / data.length * enter_duration; })
        .attr("r", 5)
        .each("end",function(d,i){
            if (i === data.length-1){
                add_label(this,d)
            }
        })
        
    var counter = 0;  
    g.selectAll("circle")
        .on("mouseover", function(d){
            d3.select(this).transition().attr("r", 9)
        })
        .on("mouseout", function(d,i){
            if (i !== data.length-1) {
                d3.select(this).transition().attr("r", 5)
            }
        })
        .on("click", function(d){
            counter++;
            d3.select(this).attr("value", function(d){return d.time_ms}).attr("fill", "red")
            console.log(d.time_ms + " Clicked");
            if(counter == 1){
                finalTime = d.time_ms;
            }
            else if(counter == 2){
                initialTime = d.time_ms;
                console.log( "Elapsed time: " + Math.abs((finalTime-initialTime) / 3600000) );
                d3.select("#timeElapsed")
                    .append("h4")
                    .text(Math.abs((finalTime-initialTime) / 3600000));
            }
            else if(counter > 2){
                d3.selectAll("circle").attr("value", function(d){return d.time_ms}).attr("fill", "");
                counter = 0;
                d3.select("#timeElapsed h4").remove();
            }
        })
    
    g.selectAll("circle")
        .on("mouseover.tooltip", function(d){
            d3.select("text." + "station_" + d.station_id).remove()
            d3.select("#chart")
                .append("text")
                .text(d.time_ms)
                .attr("x", time_scale(d.time_ms) + 10)
                .attr("y", station_scale(d.station_name) - 10)
                .attr("class", "station_" + d.station_id)
        })
        .on("mouseout.tooltip", function(d){
            d3.select("text." + "station_" + d.station_id)
                .transition()
                .duration(500)
                .style("opacity",0)
                .attr("transform","translate(10, -10)")
                .remove()
        })

    function add_label(circle, d, i){
        d3.select(circle)
            .transition()
            .attr("r", 9)
        
        d3.select("#" + "station_" + d.station_id)
            .append("text")
            .text(d.station_id)
            .attr("text-anchor","middle")
            .style("dominant-baseline","central")
            .attr("x", time_scale(d.time_ms))
            .attr("y", station_scale(d.station_name))
            .attr("class","linelabel")
            .style("opacity",0)
            .style("fill","white")
            .transition()
                .style("opacity",1)        
    }
}

    