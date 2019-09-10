const { getBaseUrl, getSelfUrl } = require('../request-parser');

function getHomeResponse(request, response) {
  let data = {
    links: {
      self: getSelfUrl(request),
      events: getBaseUrl(request)+'/events'
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
