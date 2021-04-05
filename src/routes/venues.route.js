const errors = require('../errors');

module.exports = function(app) {
  app.get(`/${process.env.API_VERSION}/venues`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get(`/${process.env.API_VERSION}/venues/:id`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get(`/${process.env.API_VERSION}/venues/:id/categories`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get(`/${process.env.API_VERSION}/venues/:id/multimediaDescriptions`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
