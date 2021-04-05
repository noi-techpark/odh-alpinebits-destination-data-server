require('custom-env').env();

function getResponse(request, response) {
  let data = {
    jsonapi: { version: "1.0" },
    links: {
      self: `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}`,
      // agents: `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}/agents`,
      categories: `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}/categories`,
      events: `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}/events`,
      // eventSeries: `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}/eventSeries`,
      features: `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}/features`,
      lifts: `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}/lifts`,
      // mediaObjects: `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}/mediaObjects`,
      mountainAreas: `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}/mountainAreas`,
      snowparks: `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}/snowparks`,
      skiSlopes: `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}/skiSlopes`,
      // venues: `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}/venues`
    },
    data: null,
  };

  response.status(200);
  response.json(data);
}

module.exports = function(app) {
  app.get(`/${process.env.API_VERSION}`, getResponse);
}
