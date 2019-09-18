const odhConnector = require('../connectors/odh-connector');
const errors = require('../messages/errors');
const { parseCollectionRequest, parseResourceRequest } = require('../request-parser');

function handleNotImplemented(req, res){
  error = errors.notImplemented;
  res.json(error);
  res.status(error.status);
}

module.exports = function(app) {

  app.get('/api/v1/events', function(req, res) {
    const parsedRequest = parseCollectionRequest(req);
    odhConnector.getEvents(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventById(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/multimediaDescriptions', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventMediaObjects(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/publisher', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventPublisher(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/organizers', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventOrganizers(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/venues', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventVenues(parsedRequest).then( (data) => {
      res.json(data);
    });
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
