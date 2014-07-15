/** @jsx React.DOM */

var Repo = function(object) {
  this.name = object.name;
}

var loadRepos = function(callback) {
  var oReq = new XMLHttpRequest();
  oReq.open("get", "https://api.github.com/users/tessalt/repos", true);
  oReq.send();
  oReq.onload = function(){
    var response = JSON.parse(this.responseText);
    var repos = [];
    for (var i = 0; i < response.length; i++) {
      var repo = new Repo(response[i]);
      repos.push(repo);
    }
    callback(repos);
  };
}

var Repos = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentWillMount: function() {
    var _this = this;
    loadRepos(function(data){
      console.log(data);
      _this.setState({data:data})
    });
  },
  render: function() {
    return (
      <div className="repos">
        <h1>Repos</h1>
        <RepoList data={this.state.data} />
      </div>
    );
  }
});

var RepoList = React.createClass({
  render: function(){
    var repoNodes = this.props.data.map(function(repo, index){
      return <li key={index}>{repo.name}</li>;
    });
    return <ul>{repoNodes}</ul>;
  }
});

React.renderComponent(
  <Repos url="https://api.github.com/users/tessalt/repos" />,
  document.getElementById('container')
);