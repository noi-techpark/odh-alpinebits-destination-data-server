const connector = require ('../connectors');
const errors = require('../errors');
const { parseCollectionRequest, parseResourceRequest } = require('./request-parser');

module.exports = function(app) {
  app.get('/api/v1/eventSeries', function(req, res) {
    connector.getEventSeries(parseCollectionRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/v1/eventSeries/:id', function(req, res) {
    connector.getEventSeriesById(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/v1/eventSeries/:id/multimediaDescriptions', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/v1/eventSeries/:id/relationships/multimediaDescriptions', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
