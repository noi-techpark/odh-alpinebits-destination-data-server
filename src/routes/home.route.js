const { getBaseUrl, getSelfUrl } = require('./request-parser');

function getHomeResponse(request, response) {
  let data = {
    jsonapi: {
      version: "1.0"
    },
    links: {
      self: getSelfUrl(request),
      resources: {
        events: getBaseUrl(request)+'/events'
      }
    },
    data: []
  };

  response.status(200);
  response.json(data);
}

module.exports = function(app) {
  app.get('/', getHomeResponse);
  app.get('/api', getHomeResponse);
  app.get('/api/v1', getHomeResponse);
}
