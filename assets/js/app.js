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

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthRiskData, chosenXAxis) {
    // create xScale
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthRiskData, d => d[chosenXAxis]) * 0.8,
            d3.max(healthRiskData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(healthRiskData, chosenYAxis) {
    // create yScale
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthRiskData, d => d[chosenYAxis]) * 0.8,
            d3.max(healthRiskData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {

    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

// function used for updating xAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {

    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale,chosenXAxis,chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

function renderText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    textGroup
        .transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => (newYScale(d[chosenYAxis])+3));
    
    return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup){

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
        .style('padding','6px')
        .html(function(d){

    if (chosenXAxis === "poverty") {
        return (`${d.state}<br>
        ${chosenXAxis}: ${d[chosenXAxis]}%<br>
        ${chosenYAxis}: ${d[chosenYAxis]}%`);  
    }
    else if (chosenXAxis === "age") {
        return (`${d.state}<br>
        ${chosenXAxis}: ${d[chosenXAxis]}<br>
        ${chosenYAxis}: ${d[chosenYAxis]}%`); 
    }
    else {
        return (`${d.state}<br>
        ${chosenXAxis}: $${d[chosenXAxis]}<br>
        ${chosenYAxis}: ${d[chosenYAxis]}%`); 
    }
    });


    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })

    //onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
    
    return circlesGroup;

}
// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(healthRiskData){

    // parse data
    healthRiskData.forEach(function(data){
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
    });


    // Create Scales
    var xLinearScale = xScale(healthRiskData, chosenXAxis);
        
    // Create y scale function
    var yLinearScale = yScale(healthRiskData, chosenYAxis);
      
    
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // Append initial circles to data points
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthRiskData)
        .enter()
        .append("circle")
        .attr("r",13)
        .attr("fill"," #89bdd3")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]));

    var textGroup = chartGroup.selectAll("text")
        .exit()
        .data(healthRiskData)
        .enter()
        .append("text") 
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => (yLinearScale(d[chosenYAxis])+3))
        .attr("font-size", "11px")
        .attr('text-anchor', 'middle')
        .attr("fill", "white");
          
    // Create group for 3 x-axis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") 
        .classed("active", true)
        .text("In Poverty (%)");
    
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") 
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") 
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Create group for 3 y-axis labels
    var yLabelsGroup = chartGroup.append("g");
    
    var healthcareLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 55)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "healthcare")
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 35)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "smokes")
      .classed("inactive", true)
      .text("Smokes (%)");
    
    var obeseLabel = yLabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 15)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "obesity")
      .classed("inactive", true)
      .text("Obese (%)");


    // update ToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
         // get value of selection
         var value = d3.select(this).attr("value");
         if (value !== chosenXAxis) {

            // replace chosenAxis with value
            chosenXAxis = value;

            // updates x scale for new data
            xLinearScale = xScale(healthRiskData, chosenXAxis);

            // updates y scale for new data
            yLinearScale = yScale(healthRiskData, chosenYAxis);

            // update x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // update  textgroup
            textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

            // update circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
           
            // update tooltups with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

            // change classes to change bold text
            if (chosenXAxis === "age"){
                ageLabel
                 .classed("active",true)
                 .classed("inactive", false);
                povertyLabel
                 .classed("active", false)
                 .classed("inactive", true);
                incomeLabel
                 .classed("active", false)
                 .classed("inactive", true);
            }
            else if (chosenXAxis === "income"){
                incomeLabel
                 .classed("active",true)
                 .classed("inactive", false);
                povertyLabel
                 .classed("active", false)
                 .classed("inactive", true);
                ageLabel
                 .classed("active", false)
                 .classed("inactive", true);
            }
            else {
                povertyLabel
                .classed("active",true)
                .classed("inactive", false);
               ageLabel
                .classed("active", false)
                .classed("inactive", true);
               incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
         }
     });

    // x axis labels event listener
    yLabelsGroup.selectAll("text")
    .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

           // replace chosenAxis with value
           chosenYAxis = value;
           
           // updates x scale for new data
           xLinearScale = xScale(healthRiskData, chosenXAxis);
           
           // updates y scale for new data
           yLinearScale = yScale(healthRiskData, chosenYAxis);
           
           // updates Y axis with transition
           yAxis = renderYAxes(yLinearScale, yAxis);
           
           // updates circles with new x values
           circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

           textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);

           // updates tooltips with new info
           circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,circlesGroup);

           // change classes to change bold text
           if (chosenYAxis === "smokes"){
               smokesLabel
                .classed("active",true)
                .classed("inactive", false);
               obeseLabel
                .classed("active", false)
                .classed("inactive", true);
               healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
           }
           else if (chosenYAxis === "obesity"){
               obeseLabel
                .classed("active",true)
                .classed("inactive", false);
               smokesLabel
                .classed("active", false)
                .classed("inactive", true);
               healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
           }
           else {
               healthcareLabel
               .classed("active",true)
               .classed("inactive", false);
              smokesLabel
               .classed("active", false)
               .classed("inactive", true);
              obeseLabel
               .classed("active", false)
               .classed("inactive", true);
           }
        }
    });
}).catch(function(error) {
    console.log(error);
  });

     




  
