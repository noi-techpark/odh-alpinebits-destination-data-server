const odhConnector = require('../connectors/odh-connector/odh-connector');

function getRequestData(request) {
  const baseUrl = request.protocol + '://' + request.get('host');
  const selfUrl = baseUrl + request.originalUrl;

  return {
    baseUrl,
    selfUrl
  }
}


module.exports = function(app) {

  app.get('/v1/events', function(request, response) {

    const requestData = getRequestData(request);

    odhConnector.getEvents(requestData, true).then( (data) => {
      response.json(data);
    });

  });

  app.get('/v1/events/:id', function(request, response) {

    const requestData = getRequestData(request);
    odhConnector.getEvent(request.params, requestData, true).then( (data) => {
      response.json(data);
    });
  });

}
