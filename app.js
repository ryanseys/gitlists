
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

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

app.get('/', routes.index); // get homepage
app.get('/auth/github', routes.auth); // initial request to auth with github
app.get('/auth/github/callback', routes.auth_callback); //callback from github auth
app.post('/logout', routes.logout); // logout
// app.post('/create_repo', routes.create_repo); //creates the initial repo needed
app.post('/create_test_issue', routes.create_test_issue);

server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on('connection', function (socket) {
  socket.emit('msg', "you are connected!");
  socket.on('msg', function (data) {
    console.log(data);
  });
});
