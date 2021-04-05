const errors = require('../errors');

module.exports = function(app) {
  app.get(`/${process.env.API_VERSION}/mediaObjects`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get(`/${process.env.API_VERSION}/mediaObjects/:id`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get(`/${process.env.API_VERSION}/mediaObjects/:id/categories`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get(`/${process.env.API_VERSION}/mediaObjects/:id/copyrightOwner`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
