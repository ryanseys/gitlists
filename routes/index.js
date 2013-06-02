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
      version: "3.0.0", //required
      timeout: 5000 //optional
    });

// home page
exports.index = function(req, res) {
  if(req.session.token) {
    get_all_issues(req, function(err, issues) {
      if(err) throw err;
      res.render('index', { title: 'GitLists', token: req.session.token, issues : issues, username: req.session.username });
    });
  }
  else {
    res.render('index', { title: 'GitLists' });
  }
};

//log out of the current user
exports.logout = function (req, res) {
  delete req.session.token;
  res.redirect('/');
};

//authorize the user with github api
exports.auth = function(req, res) {
  res.redirect("https://github.com/login/oauth/authorize?client_id=" + client_id + "&scope=repo");
};

// create an issue on the gh-lists github repo to add to list
exports.create_issue = function(req, res) {
  github.issues.create({
    user: req.session.username,
    repo: "gh-lists",
    title: req.body.title,
    assignee: req.session.username,
    labels: []
  }, function(err, success) {
    if(err) throw err;
    else {
      res.redirect('/');
    }
  });
};

// get all issues from the gh-lists github repo
function get_all_issues(req, callback) {
  var issues = [];
  github.issues.repoIssues({
    user: req.session.username,
    repo: "gh-lists"
  }, function(err, data) {
    if(err) callback(err, null);
    var len = data.length;
    for(var i = 0; i < len; i++) {
      issues.push(data[i]["title"]);
    }
    callback(null, issues);
  });
};

function close_issue(req, id, callback) {
  var options = {
    hostname: 'github.com',
    port: 443,
    path: '/repos/'+req.session.username+'/gh-lists/issues/' + id+ "?access_token="+req.session.token+"&state=closed",
    method: 'PUT'
  };

  var request = https.request(options, function(response) {
    var data = "";

    response.on('data', function (chunk) {
      data += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      JSON.parse(data);
      console.log(data);
    });
  });

  request.on('error', function(e) {
    console.error(e);
  });

  request.end();
};

// get the repo, and if no repo exists, create one
function create_repo(username, callback) {
  github.repos.get({
    user: username,
    repo: "gh-lists"
  }, function(err, result) {
    if(err) {
      github.repos.create({
        name : 'gh-lists',
        description : "Created by gitlists for github-hosted lists!",
        private : true,
        has_issues: true,
        has_wiki: false,
        has_downloads: false
      }, function(err, result) {
        if(err) callback(err, null);
        else callback(null, result);
      });
    }
    else {
      callback(null, result);
    }
  });
}

//authorization/sign in callback
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
        create_repo(user.login, function(err, result) {
          if(err) res.send('FAIL');
          else res.redirect('/')
        });
      });
    });
  });

  request.on('error', function(e) {
    console.error(e);
  });

  request.end();
};
