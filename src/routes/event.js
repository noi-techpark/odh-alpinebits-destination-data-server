const odhConnector = require('../connectors/odh-connector/odh-connector');
const { parseCollectionRequest, parseResourceRequest } = require('../request');

module.exports = function(app) {

  app.get('/api/v1/events', function(request, response) {

    const parsedRequest = parseCollectionRequest(request);

    odhConnector.getEvents(parsedRequest).then( (data) => {
      response.json(data);
    });

  });

  app.get('/api/v1/events/:id', function(request, response) {

    const parsedRequest = parseResourceRequest(request);

    odhConnector.getEvent(parsedRequest).then( (data) => {
      response.json(data);
    });
  });

}
