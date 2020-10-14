require('custom-env').env();

const SERVER_URL = process.env.REF_SERVER_URL

function getBaseResponse(request, response) {
  let data = {
    data: null,
    links: {
      self: SERVER_URL,
      "1.0":  SERVER_URL+"/1.0"
    }
  };

  response.status(200);
  response.json(data);
}

function getVersion1Response(request, response) {
  let data = {
    data: null,
    links: {
      self: SERVER_URL+'/1.0',
      events: SERVER_URL+'/1.0/events',
      // eventSeries: SERVER_URL+'/1.0/eventSeries',
      lifts: SERVER_URL+'/1.0/lifts',
      mountainAreas: SERVER_URL+'/1.0/mountainAreas',
      snowparks: SERVER_URL+'/1.0/snowparks',
      trails: SERVER_URL+'/1.0/trails',
      // agents: SERVER_URL+'/1.0/agents',
      // mediaObjects: SERVER_URL+'/1.0/mediaObjects',
      // venues: SERVER_URL+'/1.0/venues'
    }
  };

  response.status(200);
  response.json(data);
}

module.exports = function(app) {
  app.get('/', getBaseResponse);
  app.get('/1.0', getVersion1Response);
}
