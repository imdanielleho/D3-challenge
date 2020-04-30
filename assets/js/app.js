var svgWidth = 960;
var svgHeight = 500;

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

  var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  d3.csv("assets/data/data.csv").then(function(healthRiskData){


    //Format the data 
    healthRiskData.forEach(function(data){
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.smokes = +data.smokes;
        data.age = +data.age;
    });


    //Create Scales
    var xScale = d3.scaleLinear()
        .domain([d3.min(healthRiskData, d => d.poverty) -1 , d3.max(healthRiskData, d => d.poverty)+1])
        .range([0,width]);

    var yScale = d3.scaleLinear()
        .domain([d3.min(healthRiskData, d => d.healthcare) -1 , d3.max(healthRiskData, d => d.healthcare)+1])
        .range([height,0]);
    
    // Create Axes
    var bottomAxis = d3.axisBottom(xScale);
    var leftAxis = d3.axisLeft(yScale);

    // Append the axes to the chartGroup
    // Add bottomAxis
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .attr("stroke", "black")
        .call(leftAxis);

    // Append circles to data points
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthRiskData)
        .enter()
        .append("circle")
        .attr("r",13)
        .attr("fill","LightBlue");
        
    circlesGroup
        .transition()
        .duration(1000)
        .attr("cx", d => xScale(d.poverty))
        .attr("cy",d => yScale(d.healthcare));

    
    
    var textGroup = chartGroup.selectAll("text")
        .exit()
        .data(healthRiskData)
        .enter()
        .append("text") 
        .text(d => d.abbr)
        .attr("font-size", "11px")
        .attr('text-anchor', 'middle')
        .attr("fill", "white");
    
    textGroup
        .transition()
        .duration(1000)
        .attr("x", d => xScale(d.poverty))
        .attr("y", d => yScale(d.healthcare)+3);
    
        
    // Create Axes Labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 1.5))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");


    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)")

    

    // Initialize Tooltip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([40, -30])
        .style('text-align','center')
        .style("position", "absolute")
        .style("font-size",  "10px")
        .style('text-aglin', 'center')
        .style('webkit-border-radius', '10px')
        .style('moz-border-radius', '10px')
        .style('border-radius', '10px')
        .style('background-color','black')
        .style('color','white')
        .style('padding','5px')
        .html(function(d){
            return(`${d.state}<br>
            Poverty: ${d.poverty}%<br>
            Lacks Healthcare: ${d.healthcare}%`)
        });

    // Create the tooltip in chartGroup.
    chartGroup.call(toolTip);

    // Create "mouseover" event listener to display tooltip
    circlesGroup.on("mouseover", function(d) {
        toolTip.show(d, this);
      })
    // Create "mouseout" event listener to hide tooltip
      .on("mouseout", function(d) {
        toolTip.hide(d);
      });

    }).catch(function(error) {
        console.log(error);
    });
    

  