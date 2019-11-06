const errors = require('../errors');

module.exports = function(app) {
  app.get('/api/1.0/agents', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/1.0/agents/:id', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
