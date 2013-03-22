
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    https = require('https'),
    path = require('path');

/*
On a Mac put the following in /etc/launchd.conf and reboot:
setenv GITLISTS_CLIENT_ID xxxxx
setenv GITLISTS_CLIENT_SECRET xxxxx
*/
var client_id = process.env.GITLISTS_CLIENT_ID,
    client_secret = process.env.GITLISTS_CLIENT_SECRET;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('secret keyboard cat'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

// Check if the user is authenticated
function checkAuth(req, res, next) {
  if (!req.session.user) {
    res.send('Sorry, you are not authorized!');
  } else {
    next();
  }
};

app.get('/auth/github', function(req, res) {
  res.redirect("https://github.com/login/oauth/authorize?client_id=" + client_id + "&scope=repo");
});

app.get('/auth/github/callback', function(req, res) {

  var options = {
    hostname: 'github.com',
    port: 443,
    headers: { "Accept" : "application/json" }, /* we want github to return json */
    path: '/login/oauth/access_token?client_id=' + client_id +
          '&client_secret=' + client_secret + '&code=' + req.query.code,
    method: 'POST'
  };

  var request = https.request(options, function(response) {
    var data = "";

    response.on('data', function (chunk) {
      data += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      var token = JSON.parse(data)["access_token"];
      req.session.token = token;
      res.redirect('/'); /* only redirect once token has been saved */
    });
  });

  request.on('error', function(e) {
    console.error(e);
  });

  request.end();
});

//the logout route
app.post('/logout', function (req, res) {
  delete req.session.token;
  res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
