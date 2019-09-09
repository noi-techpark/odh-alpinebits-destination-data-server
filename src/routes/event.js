const odhConnector = require('../connectors/odh-connector/odh-connector');

function getResourceRequest(request) {
  return ({
    baseUrl: request.protocol + '://' + request.get('host') + '/api/v1',
    selfUrl: request.protocol + '://' + request.get('host') + request.originalUrl,
    query: request.query,
    params: request.params
  });
}

function getCollectionRequest(request) {
  let coreRequest = getResourceRequest(request);
  if(!coreRequest.query.page)
    coreRequest.query.page = { size: 10, number: 1 };

  return coreRequest;
}

module.exports = function(app) {

  app.get('/api/v1/events', function(request, response) {

    const requestData = getCollectionRequest(request);

    odhConnector.getEvents(requestData).then( (data) => {
      response.json(data);
    });

  });

  app.get('/api/v1/events/:id', function(request, response) {

    const requestData = getResourceRequest(request);

    odhConnector.getEvent(requestData).then( (data) => {
      response.json(data);
    });
  });

}
