const { Router } = require("./router");

class EventSeriesRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/eventSeries`);
    this.addUnimplementedGetRoute(`/eventSeries/:id`);
    this.addUnimplementedGetRoute(`/eventSeries/:id/categories`);
    this.addUnimplementedGetRoute(`/eventSeries/:id/editions`);
    this.addUnimplementedGetRoute(`/eventSeries/:id/multimediaDescriptions`);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  EventSeriesRouter,
};
