const errors = require('../errors');

module.exports = function(app) {
  app.get('/api/v1/eventSeries', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/v1/eventSeries/:id', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
