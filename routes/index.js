/*
  On a Mac put the following in /etc/launchd.conf and reboot:
  setenv GITLISTS_CLIENT_ID xxxxx
  setenv GITLISTS_CLIENT_SECRET xxxxx
*/
var client_id = process.env.GITLISTS_CLIENT_ID,
    client_secret = process.env.GITLISTS_CLIENT_SECRET,
    https = require('https'),
    GitHubApi = require("github"),
    github = new GitHubApi({
      // required
      version: "3.0.0",
      // optional
      timeout: 5000
    });

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

exports.create_test_issue = function(req, res) {
  github.issues.create({
    user: req.session.username,
    repo: "gh-lists",
    title: "get milk",
    body: "don't forget the milk!",
    assignee: req.session.username,
    labels: []
  }, function(err, success) {
    if(err) throw err;
    else res.redirect('/');
  });
};

exports.create_repo = function(req, res) {
  github.repos.create({
    name : 'gh-lists',
    description : "Created by gitlists for github-hosted lists!",
    private : true,
    has_issues: true,
    has_wiki: false,
    has_downloads: false
  }, function(err, result) {
    if(err) {
      console.log('Could not create repo.');
    }
  });

  res.redirect('/');
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

      //authenticate with github object
      github.authenticate({
        type: "oauth",
        token: token
      });

      //get the username and store in session data
      github.user.get({}, function(err, user) {
        if(err) throw err;
        req.session.username = user.login; // ryanseys
        console.log(user.login);
        res.redirect('/'); /* only redirect once token has been saved */
      });
    });
  });

  request.on('error', function(e) {
    console.error(e);
  });

  request.end();
};
