$.ajax({
  url: "https://api.github.com/users/tessalt/repos",
  success: function(data) {
    localStorage.setItem(this.url, JSON.stringify(data));
  }
})