const connector = require ('../connectors');
const errors = require('../errors');
const { parseCollectionRequest, parseResourceRequest } = require('./request-parser');

module.exports = function(app) {
  app.get('/api/1.0/snowparks', function(req, res) {
    connector.getSnowparks(parseCollectionRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/1.0/snowparks/:id', function(req, res) {
    connector.getSnowparkById(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/1.0/snowparks/:id/multimediaDescriptions', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/1.0/snowparks/:id/connections', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
