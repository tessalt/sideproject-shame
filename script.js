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

function loadOptimistically(url, cb) {
  var localVersion = localStorage.getItem(url);
  if (localVersion) {
    cb(JSON.parse(localVersion));
  } else {
    $.get(url, function(data){
      localStorage.setItem(url, JSON.stringify(data));
      cb(data);
    });
  }
}

var reposUrl = 'https://api.github.com/users/tessalt/repos';

var repos = [];

var commits = [];

function getRepos() {
  var dfd = new $.Deferred();
  loadOptimistically(reposUrl, function(data){
    dfd.resolve(data);
  });
  return dfd.promise();
}

$.when(getRepos()).then(function(data){
  var deferreds = [];
  $.each(data, function(i, object) {
    var repoObj = {
      name: object.name
    };
    var commitsUrl = object.commits_url.substr(0, object.commits_url.length-6);
    var dfd = new $.Deferred();
    loadOptimistically(commitsUrl, function(data){
      repoObj.commits = data;
      dfd.resolve();
    });
    repos.push(repoObj);
    deferreds.push(dfd.promise());
  });

  $.when.apply($, deferreds).then(function(def){
    console.log(repos);
  });

});