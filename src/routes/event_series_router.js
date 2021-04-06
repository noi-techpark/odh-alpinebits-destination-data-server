const { Router } = require("./router");
const prefix = `/${process.env.API_VERSION}`;

class EventSeriesRouter extends Router {
  constructor(app) {
    super();

    this.addGetUnimplementedRoute(`${prefix}/eventSeries`);
    this.addGetUnimplementedRoute(`${prefix}/eventSeries/:id`);
    this.addGetUnimplementedRoute(`${prefix}/eventSeries/:id/categories`);
    this.addGetUnimplementedRoute(`${prefix}/eventSeries/:id/editions`);
    this.addGetUnimplementedRoute(`${prefix}/eventSeries/:id/multimediaDescriptions`);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  EventSeriesRouter,
};
