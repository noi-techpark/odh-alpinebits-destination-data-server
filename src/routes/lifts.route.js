const connector = require ('../connectors');
const errors = require('../errors');
const { parseCollectionRequest, parseResourceRequest } = require('./request-parser');

module.exports = function(app) {
  app.get('/api/v1/lifts', function(req, res) {
    connector.getLifts(parseCollectionRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/v1/lifts/:id', function(req, res) {
    connector.getLiftById(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/v1/lifts/:id/multimediaDescriptions', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/v1/lifts/:id/connections', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
