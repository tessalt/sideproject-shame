var data; // a global

var login = 'tessalt';

// sizing vars
var viewportWidth  = $(".graph").width(),
    viewportHeight = document.documentElement.clientHeight,
    margin = 0,
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
      name: object.name,
      created_at: object.created_at,
      updated_at: object.updated_at
    };
    var commitsUrl = object.commits_url.substr(0, object.commits_url.length-6);
    var dfd = new $.Deferred();
    loadOptimistically(commitsUrl, function(data){
      var filtered = data.filter(function(item){
        if (item.author) {
          return item.author.login === login;
        } else {
          return false;
        }
      });
      repoObj.first_commit = d3.min(filtered, function(commit) {return new Date(commit.commit.committer.date);}) || new Date(repoObj.created_at);
      repoObj.last_commit = d3.max(filtered, function(commit) {return new Date(commit.commit.committer.date);}) || new Date(repoObj.updated_at);
      repoObj.commits = filtered;
      dfd.resolve();
    });
    repos.push(repoObj);
    deferreds.push(dfd.promise());
  });

  $.when.apply($, deferreds).then(function(def){
    createChart(repos);
  });

});

function createChart(repos) {

  repos.sort(function(a, b){
    if ( new Date(a.created_at) < new Date(b.created_at)) {
      return 1;
    } else if (new Date(a.created_at) > new Date(b.created_at)) {
      return -1;
    }
    return 0;
  });

  var xMax = d3.max(repos, function(repo) {return new Date(repo.updated_at);});

  var xMin = d3.min(repos, function(repo) {return new Date(repo.created_at);});

  xScale.domain([xMin, xMax]);

  var rectangles = svg.append('g')
    .selectAll('g')
    .data(repos)
    .enter()
    .append('g');

  rectangles.append('rect')
    .attr('x', function(d) {
      return xScale(d.first_commit);
    })
    .attr('y', function(d, i){
      return i * 20;
    })
    .attr('width', function(d){
      return xScale(d.last_commit) - xScale(d.first_commit);
    })
    .attr('height', 15)
    .attr('class', function(d){
      return d.name;
    })
    .attr('fill', 'grey');

  rectangles.selectAll('rect')
    .data(function(d){
      return d.commits;
    })
    .enter()
    .insert('rect')
    .attr('width', 1)
    .attr('height', 15)
    .attr('class', function(d){
      if (d.author) {

        return d.author.login;
      }
    })
    .attr('x', function(d){
      return xScale(new Date(d.commit.committer.date));
    })
    .attr('y', function(d, i){
      return d3.select(this.parentNode.firstChild).attr('y');
    })
}