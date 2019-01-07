const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
let data = [];

fetch(url)
  .then(response => response.json())
  .then(function(receivedData) {
    data = receivedData;
    let chartWidth = 1000;
    let chartHeight = 500;

    data.forEach(d => {
      let parsedTime = d.Time.split(":");
      d.Time = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1]));
    });

    let domainY = d3.extent(data, d => d.Time);

    let minDate = d3.min(data, d => d.Year - 1);
    let maxDate = d3.max(data, d => d.Year + 1);

    let tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("opacity", 0);

    let chart = d3
      .select(".chart")
      .append("svg")
      .attr("id", "chartSVG")
      .attr("width", chartWidth)
      .attr("height", chartHeight);

    let color = d3.scaleOrdinal(d3.schemeSet1);

    let y = d3
      .scaleLinear()
      .domain(domainY)
      .range([0, chartHeight]);

    let x = d3
      .scaleTime()
      .domain([minDate, maxDate])
      .range([0, chartWidth]);

    chart
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 6)
      .attr("cx", function(d) {
        return x(d.Year);
      })
      .attr("cy", function(d) {
        return y(d.Time);
      })
      .attr("data-xvalue", function(d) {
        return d.Year;
      })
      .attr("data-yvalue", function(d) {
        return d.Time;
      })
      .style("fill", d => color(d.Doping != ""))
      .on("mouseover", d => {
        tooltip.style("opacity", 0.9);
        tooltip.attr("data-year", d.Year);
        tooltip
          .html(
            d.Name +
              ": " +
              d.Nationality +
              "<br/>" +
              "Year: " +
              d.Year +
              ", Time: " +
              timeformat(d.Time) +
              (d.Doping ? "<br/><br/>" + d.Doping : "")
          )
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", d => {
        tooltip.style("opacity", 0);
      });

    let timeformat = d3.timeFormat("%M:%S");
    let xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));

    let yAxis = d3.axisLeft(y).tickFormat(timeformat);

    chart
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(xAxis);

    chart
      .append("g")
      .attr("id", "y-axis")
      .attr("transfrom", "translate(50, 10)")
      .call(yAxis);

    chart
      .append("text")
      .text("Time in Minutes")
      .attr("x", 30)
      .attr("y", 210)
      .attr("transform", "rotate(-90 30 210)");

    let legend = chart
      .selectAll(".legend")
      .data(color.domain())
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("id", "legend")
      .attr("transform", function(d, i) {
        return "translate(0," + (chartHeight / 2 - i * 20) + ")";
      });

    legend
      .append("rect")
      .attr("x", chartWidth - 30)
      .attr("width", 30)
      .attr("height", 15)
      .style("fill", color);

    legend
      .append("text")
      .attr("x", chartWidth - 40)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) {
        if (d) return "Riders with doping allegations";
        else {
          return "No doping allegations";
        }
      });
  });
