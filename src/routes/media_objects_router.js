const { Router } = require("./router");
const connector = require("../connectors");
const prefix = `/${process.env.API_VERSION}`;

class MediaObjectsRouter extends Router {
  constructor(app) {
    super();

    this.addGetUnimplementedRoute(`${prefix}/mediaObjects`);
    this.addGetUnimplementedRoute(`${prefix}/mediaObjects/:id`);
    this.addGetUnimplementedRoute(`${prefix}/mediaObjects/:id/categories`);
    this.addGetUnimplementedRoute(`${prefix}/mediaObjects/:id/copyrightOwner`);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  MediaObjectsRouter,
};
