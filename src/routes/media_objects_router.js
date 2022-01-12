const { Router } = require("./router");

class MediaObjectsRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/mediaObjects`);
    this.addUnimplementedGetRoute(`/mediaObjects/:id`);
    this.addUnimplementedGetRoute(`/mediaObjects/:id/categories`);
    this.addUnimplementedGetRoute(`/mediaObjects/:id/copyrightOwner`);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  MediaObjectsRouter,
};
