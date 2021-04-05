const errors = require('../errors');

module.exports = function(app) {
  app.get(`/${process.env.API_VERSION}/eventSeries`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get(`/${process.env.API_VERSION}/eventSeries/:id`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get(`/${process.env.API_VERSION}/eventSeries/:id/categories`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get(`/${process.env.API_VERSION}/eventSeries/:id/editions`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get(`/${process.env.API_VERSION}/eventSeries/:id/multimediaDescriptions`, function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
