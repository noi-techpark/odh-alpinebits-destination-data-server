const connector = require ('../connectors');
const errors = require('../errors');
const { parseCollectionRequest, parseResourceRequest } = require('./request-parser');

module.exports = function(app) {
  app.get('/1.0/eventSeries', function(req, res) {
    connector.getEventSeries(parseCollectionRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/1.0/eventSeries/:id', function(req, res) {
    connector.getEventSeriesById(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/1.0/eventSeries/:id/editions', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/1.0/eventSeries/:id/multimediaDescriptions', function(req, res) {
    connector.getEventSeriesMedia(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

}
