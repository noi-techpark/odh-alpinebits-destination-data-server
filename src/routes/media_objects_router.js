const { Router } = require("./router");
const connector = require("../connectors");
const prefix = `/${process.env.API_VERSION}`;

class MediaObjectsRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`${prefix}/mediaObjects`);
    this.addUnimplementedGetRoute(`${prefix}/mediaObjects/:id`);
    this.addUnimplementedGetRoute(`${prefix}/mediaObjects/:id/categories`);
    this.addUnimplementedGetRoute(`${prefix}/mediaObjects/:id/copyrightOwner`);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  MediaObjectsRouter,
};
