const { response } = require("express");
const { Router } = require("./router");
const selfUrl = `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}`;
const responseData = {
  jsonapi: { version: "1.0" },
  links: {
    self: selfUrl,
    // agents: `${selfUrl}/agents`,
    categories: `${selfUrl}/categories`,
    events: `${selfUrl}/events`,
    // eventSeries: `${selfUrl}/eventSeries`,
    features: `${selfUrl}/features`,
    lifts: `${selfUrl}/lifts`,
    // mediaObjects: `${selfUrl}/mediaObjects`,
    mountainAreas: `${selfUrl}/mountainAreas`,
    snowparks: `${selfUrl}/snowparks`,
    skiSlopes: `${selfUrl}/skiSlopes`,
    // venues: `${selfUrl}/venues`
  },
  data: null,
};

class HomeRouter extends Router {
  constructor(app) {
    super();

    this.getRoutes[`/${process.env.API_VERSION}`] = (_request, response) => response.status(200).json(responseData);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  HomeRouter,
};
