const { Router } = require("./router");
const prefix = `/${process.env.API_VERSION}`;

class MountainAreasRouter extends Router {
  constructor(app) {
    super();

    this.addGetUnimplementedRoute(`${prefix}/mountainAreas`);
    this.addGetUnimplementedRoute(`${prefix}/mountainAreas/:id`);
    this.addGetUnimplementedRoute(`${prefix}/mountainAreas/:id/areaOwner`);
    this.addGetUnimplementedRoute(`${prefix}/mountainAreas/:id/categories`);
    this.addGetUnimplementedRoute(`${prefix}/mountainAreas/:id/connections`);
    this.addGetUnimplementedRoute(`${prefix}/mountainAreas/:id/lifts`);
    this.addGetUnimplementedRoute(`${prefix}/mountainAreas/:id/multimediaDescriptions`);
    this.addGetUnimplementedRoute(`${prefix}/mountainAreas/:id/skiSlopes`);
    this.addGetUnimplementedRoute(`${prefix}/mountainAreas/:id/snowparks`);
    this.addGetUnimplementedRoute(`${prefix}/mountainAreas/:id/subAreas`);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  MountainAreasRouter,
};
