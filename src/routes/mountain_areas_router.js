const { Router } = require("./router");
const prefix = `/${process.env.API_VERSION}`;

class MountainAreasRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`${prefix}/mountainAreas`);
    this.addUnimplementedGetRoute(`${prefix}/mountainAreas/:id`);
    this.addUnimplementedGetRoute(`${prefix}/mountainAreas/:id/areaOwner`);
    this.addUnimplementedGetRoute(`${prefix}/mountainAreas/:id/categories`);
    this.addUnimplementedGetRoute(`${prefix}/mountainAreas/:id/connections`);
    this.addUnimplementedGetRoute(`${prefix}/mountainAreas/:id/lifts`);
    this.addUnimplementedGetRoute(`${prefix}/mountainAreas/:id/multimediaDescriptions`);
    this.addUnimplementedGetRoute(`${prefix}/mountainAreas/:id/skiSlopes`);
    this.addUnimplementedGetRoute(`${prefix}/mountainAreas/:id/snowparks`);
    this.addUnimplementedGetRoute(`${prefix}/mountainAreas/:id/subAreas`);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  MountainAreasRouter,
};
