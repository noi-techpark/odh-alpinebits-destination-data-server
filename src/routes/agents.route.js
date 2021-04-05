const errors = require('../errors');

module.exports = function(app) {
  app.get(`/${process.env.API_VERSION}/agents`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get(`/${process.env.API_VERSION}/agents/:id`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get(`/${process.env.API_VERSION}/agents/:id/categories`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get(`/${process.env.API_VERSION}/agents/:id/multimediaDescription`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
