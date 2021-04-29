const { Router } = require("./router");
const prefix = `/${process.env.API_VERSION}`;

class EventSeriesRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`${prefix}/eventSeries`);
    this.addUnimplementedGetRoute(`${prefix}/eventSeries/:id`);
    this.addUnimplementedGetRoute(`${prefix}/eventSeries/:id/categories`);
    this.addUnimplementedGetRoute(`${prefix}/eventSeries/:id/editions`);
    this.addUnimplementedGetRoute(`${prefix}/eventSeries/:id/multimediaDescriptions`);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  EventSeriesRouter,
};
