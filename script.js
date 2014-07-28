var data; // a global

var login = 'tessalt';

var colors = [
  'rgba(22, 160, 133,1.0)',
  'rgba(39, 174, 96,1.0)',
  'rgba(41, 128, 185,1.0)',
  'rgba(142, 68, 173,1.0)',
  'rgba(52, 73, 94,1.0)',
  'rgba(192, 57, 43,1.0)',
  'rgba(211, 84, 0,1.0)',
  'rgba(241, 196, 15,1.0)'
]

// sizing vars
var viewportWidth  = $(".graph").width(),
    viewportHeight = document.documentElement.clientHeight,
    margin = 175,
    w = viewportWidth,
    h = viewportHeight;

// create svg element
var svg = d3.select(".graph")
  .append("svg")
  .attr("width", w - margin)
  .attr("height", h);

var colorScale = d3.scale.ordinal().range(colors);

var xScale = d3.time.scale()
  .range([0 + margin, w - (margin +1)]);

var yScale = d3.scale.linear()
  .range([0 + margin, h - margin]);

var xAxis = d3.svg.axis()
  .scale(xScale)
  .orient("bottom")
  .ticks(d3.time.month)
  .outerTickSize(0)
  .tickFormat(d3.time.format('%b'));

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

var reposUrl = 'https://api.github.com/users/'+ login +'/repos';

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
  console.log(data);
  $.each(data, function(i, object) {
    var dfd = new $.Deferred();
    if (object.size) {
      var repoObj = {
        name: object.name,
        created_at: object.created_at,
        updated_at: object.updated_at,
        language: object.language
      };
      var commitsUrl = object.commits_url.substr(0, object.commits_url.length-6);
      loadOptimistically(commitsUrl, function(data){
        var filtered = data.filter(function(item){
          if (item.author) {
            return item.author.login === login;
          } else {
            return false;
          }
        });
        repoObj.first_commit = d3.min(filtered, function(commit) {
          return new Date(commit.commit.committer.date);
          }) || new Date(repoObj.created_at);
        repoObj.last_commit = d3.max(filtered, function(commit) {
          return new Date(commit.commit.committer.date);
          }) || new Date(repoObj.updated_at);
        repoObj.commits = filtered;
        dfd.resolve();
      });
      repos.push(repoObj);
    } else {
      dfd.resolve();
    }
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

  var reposCount = repos.length;

  var langs = [];

  repos.forEach(function(repo){
    if (repo.language && !(langs.indexOf(repo.language) > -1)) {
      langs.push(repo.language);
    }
  });

  colorScale.domain(langs);

  svg.append("g")
    .call(xAxis)
    .attr('class', 'axis')
    .attr("transform", "translate(0," + reposCount * 20 + ")");

  var rectangles = svg.append('g')
    .selectAll('g')
    .data(repos)
    .enter()
    .append('g');

  var repos = rectangles.append('rect')
    .style({
      'opacity': 0.2
    })
    .attr('x', function(d) {
      return xScale(d.first_commit);
    })
    .attr('y', function(d, i){
      return (i * 20);
    })
    .attr('width', function(d){
      var width = xScale(d.last_commit) - xScale(d.first_commit);
      return width > 1 ? width : 1;
    })
    .attr('height', 20)
    .attr('class', function(d){
      return d.name;
    })
    .attr('fill', function(d, i){
      return colorScale(d.language);
    });

  var labels = rectangles.append('text')
    .attr('x', margin - 10)
    .attr('y', function(d, i){
      return (i * 20) + 15;
    })
    .text(function(d){
      return d.name
    })
    .attr('width', function(d){
      return margin /2;
    })
    .attr("font-size", 12)
    .attr("text-anchor", "end")
    .attr("fill", "rgba(0,0,0,0.7)");

  var commits = rectangles.selectAll('g')
    .data(function(d){
      return d.commits;
    })
    .enter()
    .append('rect')
    .style({
      'opacity': 0.2
    })
    .attr('width', 1)
    .attr('height', 19)
    .attr('fill', function(d){
      return d3.select(this.parentNode.firstChild).attr('fill');
    })
    .attr('x', function(d){
      return xScale(new Date(d.commit.author.date));
    })
    .attr('y', function(d, i){
      return parseInt(d3.select(this.parentNode.firstChild).attr('y')) ;
    });

  var guides = rectangles.append('rect')
    .attr('x', margin)
    .attr('y', function(d, i){
      return i * 20;
    })
    .attr('width', w)
    .attr('height', 1)
    .attr('fill', 'rgba(0,0,0,0.05)');
}