const errors = require('../errors');

module.exports = function(app) {
  app.get('/1.0/venues', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/1.0/venues/:id', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/1.0/venues/:id/multimediaDescriptions', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
