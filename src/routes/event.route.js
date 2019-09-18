const connector = require ('../connectors');
const errors = require('../messages/errors');
const { parseCollectionRequest, parseResourceRequest } = require('./request-parser');

function handleNotImplemented(req, res){
  error = errors.notImplemented;
  res.json(error);
  res.status(error.status);
}

module.exports = function(app) {
  app.get('/api/v1/events', function(req, res) {
    connector.getEvents(parseCollectionRequest(req))
      .then( data => { res.json(data); });
  });

  app.get('/api/v1/events/:id', function(req, res) {
    connector.getEventById(parseResourceRequest(req))
      .then( data => { res.json(data); });
  });

  app.get('/api/v1/events/:id/multimediaDescriptions', function(req, res) {
    connector.getEventMedia(parseResourceRequest(req))
      .then( data => { res.json(data); });
  });

  app.get('/api/v1/events/:id/publisher', function(req, res) {
    connector.getEventPublisher(parseResourceRequest(req))
      .then( data => { res.json(data); });
  });

  app.get('/api/v1/events/:id/organizers', function(req, res) {
    connector.getEventOrganizers(parseResourceRequest(req))
      .then( data => { res.json(data); });
  });

  app.get('/api/v1/events/:id/venues', function(req, res) {
    connector.getEventVenues(parseResourceRequest(req))
      .then( data => { res.json(data); });
  });

  app.get('/api/v1/events/:id/sponsors', function(req, res) {
    handleNotImplemented(req,res);
  });

  app.get('/api/v1/events/:id/contributors', function(req, res) {
    handleNotImplemented(req,res);
  });

  app.get('/api/v1/events/:id/series', function(req, res) {
    handleNotImplemented(req,res);
  });

  app.get('/api/v1/events/:id/subEvents', function(req, res) {
    handleNotImplemented(req,res);
  });
}
