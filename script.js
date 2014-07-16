var data; // a global


// sizing vars
var viewportWidth  = $(".graph").width(), 
    viewportHeight = document.documentElement.clientHeight,
    margin = 50,
    w = viewportWidth - margin,
    h = viewportHeight - margin*3;

// create svg element
var svg = d3.select(".graph")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

var xScale = d3.time.scale()
  .range([0 + margin, w - margin]);

var yScale = d3.scale.linear() 
  .range([0 + margin, h - margin]);

  // set axes
var xAxis = d3.svg.axis()
  .scale(xScale)
  .orient("bottom")  
  .tickPadding(margin / 4)
  .tickSize(-h  + margin * 2, 0);

var yAxis = d3.svg.axis()
  .scale(yScale)
  .tickPadding(margin / 4)
  .tickSize(-w + margin * 2, 0)
  .orient("left");

  
d3.json("https://api.github.com/users/tessalt/repos", function(error, json) {
  if (error) return console.warn(error);
  data = json;
  console.log(data);

  yScale.domain([0, 100]);

  var xMax = d3.max(data, function(repo) {return new Date(repo.updated_at);});

  var xMin = d3.min(data, function(repo) {return new Date(repo.created_at);});

  data.sort(function(a, b){
    if ( new Date(a.created_at) < new Date(b.created_at)) {
    return 1;
    } else if (new Date(a.created_at) > new Date(b.created_at)) {
    return -1;
    } 
    return 0;
    });

  console.log(data);

  // set x scale domain based on rage of years
  xScale.domain([xMin, xMax]);

  // svg.append("g")
  //   .attr("class", "axis")
  //   .attr("transform", "translate(" + margin + ",0)")
  //   .call(yAxis);

 // // create x axis   
 //  svg.append("g")
 //    .attr("class", "axis")
 //    .call(xAxis)
 //    .attr("transform", "translate(0," + (h - margin) + ")");

  
 var rectangles = svg.append('g')
     .selectAll("rect")
     .data(data)
     .enter();


   rectangles.append('rect')
   .attr('x', function(d) {
     return xScale(new Date(d.created_at));
   })
   .attr('y', function(d, i){
     return i * 20;
   })
   .attr('width', function(d){
      return xScale(new Date(d.updated_at)) - xScale(new Date(d.created_at));
   })
   .attr('height', 15);

   rectangles.append('text')
     .attr('x', function(d) {
     return xScale(new Date(d.created_at));
   })
    .attr('y', function(d, i){
     return i * 20;
   })
   .attr('width', function(d){
      return xScale(new Date(d.updated_at)) - xScale(new Date(d.created_at));
   })
   .text(function(d){
    return d.name;
   })
   .attr("font-size", 14)
               .attr("text-anchor", "middle")
               .attr("text-height", 16)
               .attr("fill", "#000");
});