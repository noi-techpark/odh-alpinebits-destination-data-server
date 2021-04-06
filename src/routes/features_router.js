const { Router } = require("./router");
const connector = require("../connectors");
const prefix = `/${process.env.API_VERSION}`;

class FeaturesRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(`${prefix}/features`, connector.getFeatures);
    this.addGetRoute(`${prefix}/features/:id`, connector.getFeatureById);
    this.addGetRoute(`${prefix}/features/:id/children`, connector.getFeatureChildren);
    this.addGetRoute(`${prefix}/features/:id/multimediaDescriptions`, connector.getFeatureMultimediaDescriptions);
    this.addGetRoute(`${prefix}/features/:id/parents`, connector.getFeatureParents);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  FeaturesRouter,
};
