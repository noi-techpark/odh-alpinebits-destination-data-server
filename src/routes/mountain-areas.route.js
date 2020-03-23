const connector = require ('../connectors');
const errors = require('../errors');
const { parseCollectionRequest, parseResourceRequest } = require('./request-parser');

module.exports = function(app) {
  app.get('/1.0/mountainAreas', function(req, res) {
    connector.getMountainAreas(parseCollectionRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/1.0/mountainAreas/:id', function(req, res) {
    connector.getMountainAreaById(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/1.0/mountainAreas/:id/areaOwner', function(req, res) {
    connector.getMountainAreaOwner(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/1.0/mountainAreas/:id/connections', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/1.0/mountainAreas/:id/lifts', function(req, res) {
    connector.getMountainAreaLifts(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/1.0/mountainAreas/:id/multimediaDescriptions', function(req, res) {
    connector.getMountainAreaMedia(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });
  
  app.get('/1.0/mountainAreas/:id/snowparks', function(req, res) {
    connector.getMountainAreaSnowparks(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

  app.get('/1.0/mountainAreas/:id/subAreas', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/1.0/mountainAreas/:id/trails', function(req, res) {
    connector.getMountainAreaTrails(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => errors.handleError(error, req, res));
  });

}
