const connector = require ('../connectors');
const errors = require('../errors');
const { parseCollectionRequest, parseResourceRequest } = require('./request-parser');

module.exports = function(app) {
  app.get('/api/v1/mountainAreas', function(req, res) {
    connector.getMountainAreas(parseCollectionRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/v1/mountainAreas/:id', function(req, res) {
    connector.getMountainAreaById(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/v1/mountainAreas/:id/areaOwner', function(req, res) {
    connector.getMountainAreaOwner(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/v1/mountainAreas/:id/relationships/areaOwner', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/v1/mountainAreas/:id/lifts', function(req, res) {
    connector.getMountainAreaLifts(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/v1/mountainAreas/:id/relationships/lifts', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/v1/mountainAreas/:id/trails', function(req, res) {
    connector.getMountainAreaTrails(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/v1/mountainAreas/:id/relationships/trails', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/v1/mountainAreas/:id/snowparks', function(req, res) {
    connector.getMountainAreaSnowparks(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/v1/mountainAreas/:id/relationships/snowparks', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/v1/mountainAreas/:id/multimediaDescriptions', function(req, res) {
    connector.getMountainAreaMedia(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/api/v1/mountainAreas/:id/relationships/multimediaDescriptions', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/v1/mountainAreas/:id/connections', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/v1/mountainAreas/:id/relationships/connections', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/v1/mountainAreas/:id/subAreas', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/api/v1/mountainAreas/:id/relationships/subAreas', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
