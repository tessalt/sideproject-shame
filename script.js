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

var commits = [];

// var getRepos = new $.Deferred();

function getRepos() {
  var dfd = new $.Deferred();
  var localRepos = localStorage.getItem(reposUrl);
  if (localRepos) {
    dfd.resolve(JSON.parse(localRepos));
  } else {
    $.get(reposUrl, function(data){
      localStorage.setItem(reposUrl, JSON.stringify(data));
      dfd.resolve(data);
    });
  }
  return dfd.promise();
}

$.when(getRepos()).then(function(data){
  var deferreds = [];
  $.each(data, function(i, object) {
    var commitsUrl = object.commits_url.substr(0, object.commits_url.length-6);
    var localCommits = localStorage.getItem(commitsUrl);
    var dfd = new $.Deferred();
    if (localCommits) {
      commits.push(JSON.parse(localCommits))
      dfd.resolve();
    } else {
      $.get(commitsUrl, function(data){
        localStorage.setItem(commitsUrl, JSON.stringify(data));
        commits.push(data);
        dfd.resolve();
      });
    }
    deferreds.push(dfd.promise());
  });


  $.when.apply($, deferreds).then(function(def){
    console.log(commits);
  });

});