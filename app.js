
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path');

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
  res.send('Welcome to the secret page ' + req.session.user + "!");
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

//the logout route
app.get('/logout', function (req, res) {
  delete req.session.user;
  res.redirect('/login');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
