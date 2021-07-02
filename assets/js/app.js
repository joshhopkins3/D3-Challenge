// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 700;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var svg_group = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var current_x = "income";

// function used for updating x-scale var upon click on axis label
function xScale(peopleData, current_x) {
  // create scales
  var lin_xscale = d3.scaleLinear()
    .domain([d3.min(peopleData, d => d[current_x]) * 0.8,
      d3.max(peopleData, d => d[current_x]) * 1.2
    ])
    .range([0, width]);

  return lin_xscale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(transition_xscale, xAxis) {
  var bottomAxis = d3.axisBottom(transition_xscale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circles, transition_xscale, current_x) {

  circles.transition()
    .duration(1000)
    .attr("cx", d => transition_xscale(d[current_x]))
    ;

  return circles;
}

// function used for updating circles group with new tooltip
function updateToolTip(current_x, circles) {

  if (current_x === "income") {
    var label = "Income:";
  }
  else {
    var label = "Age: ";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([120, -10])
    //.offset([0,5])
    .html(function(d) {
      return (`${d.state}<br>Coverage: ${parseFloat(d.healthcare*100).toFixed(1)}%<br>${label} ${d[current_x]}`);
    });


  circles.call(toolTip);

  circles.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(hide_tip, index) {
      toolTip.hide(hide_tip);
    });

  return circles;
}

// Read CSV
d3.csv("assets/data/data.csv").then(function(data) {
  //Test data connection
  console.log(data[1]);
  // parse data
  data.forEach(function(incomeData) {
      incomeData.income = +incomeData.income;
      incomeData.healthcare = +incomeData.healthcare/100;
      incomeData.age = +incomeData.age;
  });

  // lin_xscale function above csv import
  var lin_xscale = xScale(data, current_x);

  // Create y scale function
  var lin_yscale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.healthcare)])
      .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(lin_xscale);
  var leftAxis = d3.axisLeft(lin_yscale);

  // append x axis
  var xAxis = svg_group.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

  // append y axis
  svg_group.append("g")
      .call(leftAxis
        .ticks(10)
        .tickFormat(d3.format(",.1%")));

  // append initial circles
  var circles = svg_group.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => lin_xscale(d[current_x]))
      .attr("cy", d => lin_yscale(d.healthcare))
      .attr("r", 10)
      .attr("class", d => d.abbr)
      .attr("fill", "blue")
      .attr("opacity", ".5");

  // Create group for  2 x- axis labels
  var labels = svg_group.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var income_label = labels.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "income") // value to grab for event listener
      .classed("active", true)
      .text("Average Income Per State");

  var age_label = labels.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Average Age Per State");

  // append y axis
  svg_group.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("active", true)
      .classed("axis-text", true)
      .text("Health Insurance Coverage (%)");

  // updateToolTip function above csv import
  var circles = updateToolTip(current_x, circles);

  // x axis labels event listener
  labels.selectAll("text")
      .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== current_x) {

          // replaces current_x with value
          current_x = value;

          // updates x scale for new data
          lin_xscale = xScale(data, current_x);

          // updates x axis with transition
          xAxis = renderAxes(lin_xscale, xAxis);

          // updates circles with new x values
          circles = renderCircles(circles, lin_xscale, current_x);

          // updates tooltips with new info
          circles = updateToolTip(current_x, circles);

          // changes classes to change bold text
          if (current_x === "age") {
          age_label
              .classed("active", true)
              .classed("inactive", false);
          income_label
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
          age_label
              .classed("active", false)
              .classed("inactive", true);
          income_label
              .classed("active", true)
              .classed("inactive", false);
          }
      }
      });
  });