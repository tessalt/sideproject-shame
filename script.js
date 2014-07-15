/** @jsx React.DOM */

var Repos = React.createClass({
  loadRepos: function() {
    $.ajax({
      url: this.props.url,
      success: function(data) {
        this.setState({data: data});
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentWillMount: function() {
    this.loadRepos();
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