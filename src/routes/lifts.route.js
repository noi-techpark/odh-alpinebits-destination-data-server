const connector = require ('../connectors');
const errors = require('../messages/errors');
const { parseCollectionRequest, parseResourceRequest } = require('./request-parser');

function handleNotImplemented(req, res){
  handleError(errors.notImplemented, req, res);
}

function handleError(err, req, res ){
  console.log(err);
  res.status(err.status || 500);
  res.json(errors.createResponse(err));
}

module.exports = function(app) {
  app.get('/api/v1/lifts', function(req, res) {
    connector.getLifts(parseCollectionRequest(req))
      .then(data => res.json(data))
      .catch(error => handleError(error, req, res));
  });

  app.get('/api/v1/lifts/:id', function(req, res) {
    connector.getLiftById(parseResourceRequest(req))
      .then(data => res.json(data))
      .catch(error => handleError(error, req, res));
  });
}
