const { Router } = require("./router");
const prefix = `/${process.env.API_VERSION}`;

class AgentsRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`${prefix}/agents`);
    this.addUnimplementedGetRoute(`${prefix}/agents/:id`);
    this.addUnimplementedGetRoute(`${prefix}/agents/:id/categories`);
    this.addUnimplementedGetRoute(`${prefix}/agents/:id/multimediaDescriptions`);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  AgentsRouter,
};
