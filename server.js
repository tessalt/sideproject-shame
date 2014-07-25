// Dependencies
var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    logfmt = require("logfmt"),
    request = require('request'),
    qs = require('querystring');

var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser());
app.use(logfmt.requestLogger());

var port = Number(process.env.PORT || 3000);
var server = app.listen(port,  function() {
  console.dir("server listening on port " + server.address().port);
});

var auth_token = '';

app.get('/session', function(req, res){
  res.send('authenticated?');
});

app.get('/', function(req, res){
  res.sendfile('index.html');
  console.log(auth_token);
});

app.post('/session', function(req, res){
  auth_token = res.req.body.authenticity_token;
  res.redirect('/')
});

app.get('/auth', function(req, res){
  params = qs.stringify({
    client_id: 'd6af12d2e13e2b8dd167',
    redirect_uri: '127.0.0.1:3000',
    scope: 'public_repo',
    state: Math.floor(Math.random() * (1000 - 100)) + 100
  });
  request.get({url: 'https://github.com/login/oauth/authorize' + '?' + params}, function(e, r, body) {
    res.send(body);
  });
});

