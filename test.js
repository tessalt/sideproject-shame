d3.json("https://api.github.com/users/tessalt/repos", function(error, json) {

  if (error) return console.warn(error);

  data = json;

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

 var data2 = [1, 4, 5, 6, 8, 9, 11, 55];

 var rectangles = svg.append('g')
     .selectAll("rect")
     .data(data)
     .enter()
    .append('rect')
   .attr('x', function(d) {
     return xScale(new Date(d.created_at));
   })
   .attr('y', function(d, i){
     return i * 20;
   })
   .attr('width', function(d){
      return xScale(new Date(d.updated_at)) - xScale(new Date(d.created_at));
   })
   .attr('height', 15)
   .selectAll('p')
   .data(data2)
   .enter()
   .append('p');

});