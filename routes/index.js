/*
  On a Mac put the following in /etc/launchd.conf and reboot:
  setenv GITLISTS_CLIENT_ID xxxxx
  setenv GITLISTS_CLIENT_SECRET xxxxx
*/
var client_id = process.env.GITLISTS_CLIENT_ID,
    client_secret = process.env.GITLISTS_CLIENT_SECRET,
    https = require('https');

exports.index = function(req, res) {
  res.render('index', { title: 'GitLists', token: req.session.token });
};

exports.logout = function (req, res) {
  delete req.session.token;
  res.redirect('/');
};

exports.auth = function(req, res) {
  res.redirect("https://github.com/login/oauth/authorize?client_id=" + client_id + "&scope=repo");
};

exports.auth_callback = function(req, res) {

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
};
