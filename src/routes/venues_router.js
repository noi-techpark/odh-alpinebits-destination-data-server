const { Router } = require("./router");

class VenuesRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/venues`);
    this.addUnimplementedGetRoute(`/venues/:id`);
    this.addUnimplementedGetRoute(`/venues/:id/categories`);
    this.addUnimplementedGetRoute(`/venues/:id/multimediaDescriptions`);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  VenuesRouter,
};
