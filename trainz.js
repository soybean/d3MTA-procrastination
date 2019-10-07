$(document).ready(function() {
  var canReset = 1
  var totalPixelsCurrentlyDisplayed = 0;
  var allPixels = [29.31, 56.64, 40.65, 56.61, 52.88, 57.83, 34.12, 51.53, 51, 46.57, 54.43, 47.6, 59.69, 35.92, 35.29, 7.879, 36.22, 37.97]
  function doUpdate() {
    newData = newData.filter(function(d){
      var matchingKeys = []
      for (var i = 0; i<selectedTrains.length; i++){
        var keyString = selectedTrains[i] + " Line"
        matchingKeys.push(keyString)
      }
      if (!matchingKeys.includes(d.key)) {
        if (d.value !== 100){
          d.actual = d.value
        }
        d.value = 100
      }
      else {
        d.value = d.actual
      }
      return 1
    })
    console.log(newData)
    var select_data = newData.map(function(d){
        return{
        date: d.date,
        value: 100- d.value,
        key: d.key
      }
    })

    var layers = stack(nest.entries(select_data));
    var svg = d3.select("#tiny_mouse");
    svg.selectAll("path")
      .data(layers)
      .exit().remove()
    svg.selectAll("path")
      .transition()
      .duration(1500)
      .attr("d", function(d) {
        return area(d.values)
      })

  }
  $(".train").click(function(d) {
    var id = $(this).attr("id")
    if (canReset) {
      canReset = 0
      selectedTrains = []
      selectedTrains.push(id)
      for (var i = 0; i < allTrains.length; i++) {
        $("#"+allTrains[i]).removeClass("selected")
      }
      $("#"+id).addClass("selected")
    }

    else {
      if ($("#" + id).hasClass("selected")) {
        $("#" + id).removeClass("selected")
        var index = selectedTrains.indexOf(id)
        selectedTrains.splice(index, 1)
      }
      else {
        $("#" + id).addClass("selected")
        selectedTrains.push(id)
      }
    }
    doUpdate()

  })

var allTrains = ["1", "2", "3", "4", "5", "6", "A", "B", "C", "D", "E", "F", "G", "J", "L", "N", "Q", "R"]
var selectedTrains = ["1", "2", "3", "4", "5", "6", "A", "B", "C", "D", "E", "F", "G", "J", "L", "N", "Q", "R"]
var width = 1050;
var height = 525;
var newData;
var totalPix = 0
var csvpath = "https://gist.githubusercontent.com/soybean/58ff494a98ca73d381089cb660382f8a/raw/48b74b9584d789631b565959c75824252ce61972/test.csv"
//var csvpath = "https://gist.githubusercontent.com/soybean/d04d59bd6db77f1a73ee7cfe227c2c77/raw/c418303aefc16fc3be096cbc5fb37f96a62d91f5/test2.csv"
var csvpath = "https://gist.githubusercontent.com/soybean/9c7090ce3ebbf1676d7ce0c9d1ec6037/raw/17b0f07469b25b6c0f0c5749a73270e1a762e7ca/test3.csv"
var svg = d3.select("#tiny_mouse")
  .attr("width", width)
  .attr("height", height)

var x = d3.time.scale()
  .range([0, width]);
var y = d3.scale.linear()
  .range([0, height-10]);

var stack = d3.layout.stack()
  .offset("silhouette")
  .values(function(d) {
      return d.values;
  })
      .x(function(d) { return d.date; })
      .y(function(d) { return d.value; });
  var nest = d3.nest()
    .key(function(d) { return d.key; });

  function getScale() {
    var totalPixels = 0
    for (var i = 0; i < selectedTrains.length; i++) {
      var idx = allTrains.indexOf(selectedTrains[i])
      var pixels = allPixels[idx]
      totalPixels += pixels
    }
    console.log(totalPixels)
    return 350/totalPixels

    return (-1*8/17)*selectedTrains.length + (305/34)
    if(selectedTrains.length == 1) {
      scale = 8.5
    }
    else {
      scale = 0.5
    }
    return scale
  }
  scale = getScale()
  var area = d3.svg.area()
      .interpolate("cardinal")
      .x(function(d) {
        return x(d.date);
      })
      .y0(function(d) {
        scale = getScale()
        return d.y0*scale;
      })
      .y1(function(d) {
        scale = getScale()
        return (d.y0 + d.y)*scale;
      });

function calculateLastPointY(){

}

d3.csv(csvpath, function(data) {
  data.forEach(function(d){
    if (+d.INDICATOR_SEQ !== 391698 && +d.INDICATOR_SEQ !==391715){
      d.date = new Date(+d.PERIOD_YEAR, +d.PERIOD_MONTH)
      d.value = +d['MONTHLY_ACTUAL']
      d.actual = d.value
      d.key = d['INDICATOR_NAME'].substring(17)
    }
  })
  newData = data.filter(function(d){
    return 1
    //return d.key == "1 Line" || d.key == "2 Line" || d.key == "3 Line"
  })
  data = newData
  var select_data = data.map(function(d){
    return{
      date: d.date,
      value: 100- d.value,
      key: d.key
    }
  })
  var layers = stack(nest.entries(select_data));
  //console.log(totalPix)
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0, 1000])
  svg.selectAll(".layer")
  .data(layers)
  .enter().append("path")
  .attr("class", "layer")
  .attr("d", function(d, i) {
    return area(d.values)
  })
  .style("fill", function(d,i) {
    var color = d3.interpolateViridis(i*0.05263157894)
    return color
  })

    svg.selectAll(".layer")
    .on("mouseover", function(d) {
      d3.select(this).style("opacity", 0.5);
    })
    .on("mouseout", function(d) {
      d3.select(this).style("opacity", 1)
    })
})
})
