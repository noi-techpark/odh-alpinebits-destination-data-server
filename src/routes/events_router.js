const { Router } = require("./router");
const connector = require("../connectors");
const prefix = `/${process.env.API_VERSION}`;

class EventsRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(`${prefix}/events`, connector.getEvents);
    this.addGetRoute(`${prefix}/events/:id`, connector.getEventById);
    this.addGetRoute(`${prefix}/events/:id/categories`, connector.getEventCategories);
    this.addGetRoute(`${prefix}/events/:id/contributors`, connector.getEventContributors);
    this.addGetRoute(`${prefix}/events/:id/multimediaDescriptions`, connector.getEventMultimediaDescriptions);
    this.addGetRoute(`${prefix}/events/:id/organizers`, connector.getEventOrganizers);
    this.addGetRoute(`${prefix}/events/:id/publisher`, connector.getEventPublisher);
    this.addGetRoute(`${prefix}/events/:id/series`, connector.getEventEventSeries);
    this.addGetRoute(`${prefix}/events/:id/sponsors`, connector.getEventSponsors);
    this.addGetRoute(`${prefix}/events/:id/subEvents`, connector.getEventSubEvents);
    this.addGetRoute(`${prefix}/events/:id/venues`, connector.getEventVenues);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  EventsRouter,
};
