const connector = require ('../connectors');
const errors = require('../errors');
const { parseCollectionRequest, parseResourceRequest } = require('./request-parser');

module.exports = function(app) {
  app.get('/api/1.0/trails', function(req, res) {
    connector.getTrails(parseCollectionRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/1.0/trails/:id', function(req, res) {
    connector.getTrailById(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/1.0/trails/:id/multimediaDescriptions', function(req, res) {
    connector.getTrailMedia(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/1.0/trails/:id/relationships/multimediaDescriptions', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

}
