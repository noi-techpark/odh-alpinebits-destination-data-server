const { Router } = require("./router");
const connector = require("../connectors");
const prefix = `/${process.env.API_VERSION}`;

class SkiSlopesRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(`${prefix}/skiSlopes`, connector.getSkiSlopes);
    this.addGetRoute(`${prefix}/skiSlopes/:id`, connector.getSkiSlopeById);
    this.addGetRoute(`${prefix}/skiSlopes/:id/categories`, connector.getSkiSlopeCategories);
    this.addGetRoute(`${prefix}/skiSlopes/:id/connections`, connector.getSkiSlopeConnections);
    this.addGetRoute(`${prefix}/skiSlopes/:id/multimediaDescriptions`, connector.getSkiSlopeMultimediaDescriptions);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  SkiSlopesRouter,
};
