const errors = require('../errors');

module.exports = function(app) {
  app.get('/api/v1/places', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/v1/places/:id', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
