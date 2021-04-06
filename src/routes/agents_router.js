const { Router } = require("./router");
const prefix = `/${process.env.API_VERSION}`;

class AgentsRouter extends Router {
  constructor(app) {
    super();

    this.addGetUnimplementedRoute(`${prefix}/agents`);
    this.addGetUnimplementedRoute(`${prefix}/agents/:id`);
    this.addGetUnimplementedRoute(`${prefix}/agents/:id/categories`);
    this.addGetUnimplementedRoute(`${prefix}/agents/:id/multimediaDescriptions`);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  AgentsRouter,
};
