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
// var xAxis = d3.svg.axis()
//   .scale(xScale)
//   .orient("bottom")
//   .tickPadding(margin / 4)
//   .tickSize(-h  + margin * 2, 0);

// var yAxis = d3.svg.axis()
//   .scale(yScale)
//   .tickPadding(margin / 4)
//   .tickSize(-w + margin * 2, 0)
//   .orient("left");

var reposUrl = 'https://api.github.com/users/tessalt/repos';

var getRepos = $.get(reposUrl);
var commits = [];



getRepos.success(function(data){
  var deferreds = [];
  localStorage.setItem(reposUrl, JSON.stringify(data));
  $.each(data, function(i, object) {
    var commitsUrl = object.commits_url.substr(0, object.commits_url.length-6);
    deferreds.push($.get(commitsUrl, function(stuff){
      localStorage.setItem(commitsUrl, JSON.stringify(stuff));
      // console.log(stuff);
      commits.push(stuff);
    }));
  });


  $.when.apply($, deferreds).then(function(def){
    console.log(commits);
  });
});

