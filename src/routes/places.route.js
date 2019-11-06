const errors = require('../errors');

module.exports = function(app) {
  app.get('/api/1.0/places', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/1.0/places/:id', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
