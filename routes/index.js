
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'GitLists', token: req.session.token });
};
