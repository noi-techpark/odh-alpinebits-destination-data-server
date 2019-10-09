const errors = require('../errors');

module.exports = function(app) {
  app.get('/api/v1/agents', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/v1/agents/:id', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
