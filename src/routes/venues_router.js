const { Router } = require("./router");
const prefix = `/${process.env.API_VERSION}`;

class VenuesRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`${prefix}/venues`);
    this.addUnimplementedGetRoute(`${prefix}/venues/:id`);
    this.addUnimplementedGetRoute(`${prefix}/venues/:id/categories`);
    this.addUnimplementedGetRoute(`${prefix}/venues/:id/multimediaDescriptions`);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  VenuesRouter,
};
