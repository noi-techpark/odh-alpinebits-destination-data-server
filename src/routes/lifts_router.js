const { Router } = require("./router");
const connector = require("../connectors");
const prefix = `/${process.env.API_VERSION}`;

class LiftsRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(`${prefix}/lifts`, connector.getLifts);
    this.addGetRoute(`${prefix}/lifts/:id`, connector.getLiftById);
    this.addGetRoute(`${prefix}/lifts/:id/categories`, connector.getLiftCategories);
    this.addGetRoute(`${prefix}/lifts/:id/connections`, connector.getLiftConnections);
    this.addGetRoute(`${prefix}/lifts/:id/multimediaDescriptions`, connector.getLiftMultimediaDescriptions);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  LiftsRouter,
};
