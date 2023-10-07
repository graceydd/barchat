// Load the data from data.csv
d3.csv("/Users/gracedurotolu/Downloads/data.csv").then(function(data) {
  data.forEach(function(d) {
    d.Period = +d.Period;
    d.Count = +d.Count;
  });

  // Separate data into marriage and divorce rates
  var marriageData = data.filter(function(d) {
    return d['General Marriage_Rate_and Divorce_Rate'] === "Marriage Rate";
  });

  var divorceData = data.filter(function(d) {
    return d['General Marriage_Rate_and Divorce_Rate'] === "Divorce Rate";
  });

  // Merge data for the same year
  var mergedData = marriageData.map(function(d) {
    var year = d.Period;
    var marriageRate = d.Count;
    var divorceRate = divorceData.find(function(div) {
      return div.Period === year;
    }).Count;
    return {
      year: year,
      marriageRate: marriageRate,
      divorceRate: divorceRate
    };
  });

  // Create the SVG and set the dimensions
  var svg = d3.select("#chart");
  var margin = { top: 20, right: 30, bottom: 30, left: 40 };
  var width = +svg.attr("width") - margin.left - margin.right-50;
  var height = +svg.attr("height") - margin.top - margin.bottom-50;

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Calculate the difference between marriage and divorce rates and highlight if less than 2
  mergedData.forEach(function(d) {
    d.diff = Math.abs(d.marriageRate - d.divorceRate);
    d.highlight = d.diff < 2 ? true : false;
  });

  // Create the x and y scales
  var x = d3.scaleBand()
    .domain(mergedData.map(function(d) { return d.year; }))
    .range([0, width])
    .padding(0.1);

  var y = d3.scaleLinear()
    .domain([0, d3.max(mergedData, function(d) { return d.marriageRate; })])
    .nice()
    .range([height, 0]);

  // Create the bars
  g.selectAll(".bar")
    .data(mergedData)
    .enter().append("rect")
    .attr("class", function(d) { return "bar" + (d.highlight ? " highlight" : ""); })
    .attr("x", function(d) { return x(d.year); })
    .attr("y", function(d) { return y(Math.max(0, d.marriageRate)); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return Math.abs(y(d.marriageRate) - y(0)); });

  // Add the x and y axes
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

  // Add a title
  svg.append("text")
    .attr("x", (width / 2) + margin.left)
    .attr("y", height +  60)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Year-wise Marriage Rates");

  // Add a legend
  svg.append("text")
    .attr("x", width - margin.right - 150)
    .attr("y", height  + 60)
    .text("Highlighted years have a difference less than 2")
    .style("font-size", "16px");
});