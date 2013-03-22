
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
}

app.get('/secret', checkAuth, function (req, res) {
  // res.render('secret', {user : req.session.user });
  authGithub();
});

var users = {
  "ryan" : "password",
  "shuhao" : "wu"
}

//the login route
app.post('/login', function (req, res) {
  var post = req.body;
  if(users[post.user] && users[post.user] == post.password) {
    req.session.user = post.user;
    res.redirect('/secret');
  } else {
    res.send('Bad user/pass');
  }
});

app.get('/auth/github', function(req, res) {
  res.redirect("https://github.com/login/oauth/authorize?client_id=" + client_id + "&scope=repo");
});

app.get('/auth/github/callback', function(req, res) {

  var options = {
    hostname: 'github.com',
    port: 443,
    headers: { "Accept" : "application/json" },
    path: '/login/oauth/access_token?client_id=' + client_id +
          '&client_secret=' + client_secret + '&code=' + req.query.code,
    method: 'POST'
  };

  var req = https.request(options, function(res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    });

    //the whole res has been recieved, so we just print it out here
    res.on('end', function () {
      console.log(data);
    });
  });



  req.end();

  req.on('error', function(e) {
    console.error(e);
  });

  res.redirect('/');
});

//the logout route
app.post('/logout', function (req, res) {
  delete req.session.user;
  res.redirect('/');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
