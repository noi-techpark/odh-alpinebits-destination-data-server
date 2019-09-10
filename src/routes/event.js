const odhConnector = require('../connectors/odh-connector/odh-connector');
const { parseCollectionRequest, parseResourceRequest } = require('../request-parser');

module.exports = function(app) {

  app.get('/api/v1/events', function(req, res) {
    const parsedRequest = parseCollectionRequest(req);
    odhConnector.getEvents(parsedRequest).then( (data) => {
      res.json(data);
    });

  });

  app.get('/api/v1/events/:id', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEvent(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/multimediaDescriptions', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventMediaObjects(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/multimediaDescriptions/:objectId', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventMediaObjectById(parsedRequest).then( (data) => {
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

  app.get('/api/v1/events/:id/organizers/:agentId', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventOrganizerById(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/sponsors', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventSponsors(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/sponsors/:agentId', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventSponsorById(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/contributors', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventSponsors(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/contributors/:agentId', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventSponsorById(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/series', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventSeries(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/venues', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventVenues(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/venues/:venueId', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventVenueById(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/venues/:venueId/geometries', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getEventVenueGeometries(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

  app.get('/api/v1/events/:id/subEvents', function(req, res) {
    const parsedRequest = parseResourceRequest(req);
    odhConnector.getSubEvents(parsedRequest).then( (data) => {
      res.json(data);
    });
  });

}
