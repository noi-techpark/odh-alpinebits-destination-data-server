const errors = require('../errors');

module.exports = function(app) {
  app.get('/api/v1/mediaObjects', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/v1/mediaObjects/:id', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
