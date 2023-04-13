let countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
let educationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

let canvas = d3.select('#canvas');
let legend = d3.select('#legend');

let countyJSON = {};
let eduJSON = {};
let colors = ["#66FF99", "#52CC7A", "#42A362", "#35824E"];

document.addEventListener('DOMContentLoaded', function () {
  fetch(educationURL).
  then(response => response.json()).
  then(data => {
    eduJSON = data;
    fetch(countyURL).
    then(response => response.json()).
    then(data => {
      countyJSON = topojson.feature(data, data.objects.counties).features;
      showChoroplethMap();
    });
  });
});

function showChoroplethMap() {
  //Creating the map and tooltip
  let tooltip = d3.select("body").
  append("div").
  attr("id", "tooltip").
  attr("class", "tooltip").
  style("opacity", 0);

  canvas.selectAll('path').
  data(countyJSON).
  enter().
  append('path').
  attr('d', d3.geoPath()).
  attr('class', 'county').
  style('fill', countyElement => {
    let county = eduJSON.find(eduElement => {
      if (countyElement['id'] == eduElement['fips']) {
        return eduElement;
      }
    });
    let percentage = county['bachelorsOrHigher'];
    if (percentage <= 15) {
      return '#66FF99';
    } else if (percentage <= 30) {
      return '#52CC7A';
    } else if (percentage <= 45) {
      return '#42A362';
    } else {
      return '#35824E';
    }
  }).
  attr('data-fips', countyElement => {
    let county = eduJSON.find(eduElement => {
      if (countyElement['id'] == eduElement['fips']) {
        return eduElement;
      }
    });
    return county['fips'];
  }).
  attr('data-education', countyElement => {
    let county = eduJSON.find(eduElement => {
      if (countyElement['id'] == eduElement['fips']) {
        return eduElement;
      }
    });
    return county['bachelorsOrHigher'];
  }).
  on("mouseover", function (event, countyElement) {
    let county = eduJSON.find(eduElement => {
      if (countyElement['id'] == eduElement['fips']) {
        return eduElement;
      }
    });

    tooltip.
    transition().
    duration(200).
    style("opacity", 0.9);
    tooltip.
    html(county['area_name'] + ", " + county['state'] + ": " + county['bachelorsOrHigher'] + "%").
    style("left", event.pageX + 20 + "px").
    style("top", event.pageY - 40 + "px");
    tooltip.attr("data-education", county['bachelorsOrHigher']);
  }).
  on("mouseout", function (event, d) {
    tooltip.
    transition().
    duration(400).
    style("opacity", 0);
  });

  //Creating a legend
  let cubeScale = d3.scaleLinear().domain([0, 100]).range([0, 160]);
  let xScale = d3.scaleLinear().domain([0, 100]).range([20, 180]);
  let xAxis = d3.axisBottom(xScale).ticks(5).tickValues([0, 15, 30, 45, 100]);

  legend.attr('height', 60).attr('width', 200);

  legend.selectAll('rect').
  data(colors).
  enter().
  append('rect').
  attr('height', 20).
  attr('width', (d, i) => {
    switch (i) {
      case 0:
      case 1:
      case 2:
        return cubeScale(15);
        break;
      case 3:
        return cubeScale(55);
        break;
      default:
        break;}

  }).
  attr('x', (d, i) => {
    switch (i) {
      case 0:return xScale(0);break;
      case 1:return xScale(15);break;
      case 2:return xScale(30);break;
      case 3:return xScale(45);break;}

  }).
  attr('y', 20).
  style('fill', (d, i) => d);

  legend.append('g').
  attr('transform', 'translate(0,' + 40 + ')').
  call(xAxis);
}