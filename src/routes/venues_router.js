const { Router } = require("./router");
const prefix = `/${process.env.API_VERSION}`;

class VenuesRouter extends Router {
  constructor(app) {
    super();

    this.addGetUnimplementedRoute(`${prefix}/venues`);
    this.addGetUnimplementedRoute(`${prefix}/venues/:id`);
    this.addGetUnimplementedRoute(`${prefix}/venues/:id/categories`);
    this.addGetUnimplementedRoute(`${prefix}/venues/:id/multimediaDescriptions`);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  VenuesRouter,
};
