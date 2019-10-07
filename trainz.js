$(document).ready(function() {
  var canReset = 1

  function doUpdate() {
    newData = newData.filter(function(d){
      if (!(d.key == "1 Line" || d.key == "2 Line" || d.key == "3 Line")){
        d.value = 100
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
      doUpdate();
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

  })

})
var allTrains = ["1", "2", "3", "4", "5", "6", "A", "B", "C", "D", "E", "F"]
var selectedTrains = ["1", "2", "3", "4", "5", "6", "A", "B", "C", "D", "E", "F"]
var width = 1050;
var height = 700;
var newData;
var csvpath = "https://gist.githubusercontent.com/soybean/d04d59bd6db77f1a73ee7cfe227c2c77/raw/c418303aefc16fc3be096cbc5fb37f96a62d91f5/test2.csv"
var svg = d3.select("#tiny_mouse")
  .attr("width", width)
  .attr("height", height)

var x = d3.time.scale()
  .range([0, width]);
var y = d3.scale.linear()
  .range([0, 100]);

var stack = d3.layout.stack()
  .offset("silhouette")
  .values(function(d) {
      return d.values;
  })
      .x(function(d) { return d.date; })
      .y(function(d) { return d.value; });
  var nest = d3.nest()
    .key(function(d) { return d.key; });
  var area = d3.svg.area()
      .interpolate("cardinal")
      .x(function(d) {
        return x(d.date);
      })
      .y0(function(d) {
        if (Number.isNaN(y(+d.y0))){
        }
        return d.y0*1.5;
        //return y(d.y0)
      })
      .y1(function(d) {
        if (Number.isNaN(d.y0) || Number.isNaN(d.y)){
          console.log("NaN detected... in other one")
          console.log(d)
        }
        if (Number.isNaN(y(d.y0 + d.y))){
          //console.log(d.y0 + d.y)
          //console.log("y is NaN!")
        }
        return (d.y0 + d.y)*1.5;
        return y(d.y0 + d.y);
      });

d3.csv(csvpath, function(data) {
    //console.log(data[0]["PARENT_SEQ"])
    data.forEach(function(d){

      if (+d.INDICATOR_SEQ !== 391698 && +d.INDICATOR_SEQ !==391715){
      d.date = new Date(+d.PERIOD_YEAR, +d.PERIOD_MONTH)

        d.value = +d['MONTHLY_ACTUAL']
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
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
    svg.selectAll(".layer")
        .data(layers)
      .enter().append("path")
        .attr("class", "layer")
        .attr("d", function(d, i) {
          return area(d.values)
        })
        .style("fill", function(d,i) {
          var color = d3.interpolateViridis(i*0.16666)
          return color
        })
        // .transition()
        //   .duration(1500)
        //   .style("fill", function(d,i){
        //     var random = Math.random()
        //     return d3.interpolateViridis(random)
        //
        //   })

    svg.selectAll(".layer")
    .on("mouseover", function(d) {
      d3.select(this).style("opacity", 0.5);
    })
    .on("mouseout", function(d) {
      d3.select(this).style("opacity", 1)
    })
})
