const { Router } = require("./router");
const connector = require("../connectors");
const prefix = `/${process.env.API_VERSION}`;

class SnowparksRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(`${prefix}/snowparks`, connector.getSnowparks);
    this.addGetRoute(`${prefix}/snowparks/:id`, connector.getSnowparkById);
    this.addGetRoute(`${prefix}/snowparks/:id/categories`, connector.getSnowparkCategories);
    this.addGetRoute(`${prefix}/snowparks/:id/connections`, connector.getSnowparkConnections);
    this.addGetRoute(`${prefix}/snowparks/:id/features`, connector.getSnowparkFeatures);
    this.addGetRoute(`${prefix}/snowparks/:id/multimediaDescriptions`, connector.getSnowparkMultimediaDescriptions);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  SnowparksRouter,
};
