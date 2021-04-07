const { Router } = require("./router");
const { Request } = require("./../model/request/request");
const { EventConnector } = require("./../connectors/event_connector");
const responseTransform = require("../model/odh2destinationdata/response_transform");
const connector = require("../connectors");

const prefix = `/${process.env.API_VERSION}`;

class EventsRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(`${prefix}/events`, (request) => this.getEvents(request));
    this.addGetRoute(`${prefix}/events/:id`, (request) => this.getEventById(request));
    this.addGetRoute(`${prefix}/events/:id/categories`, (request) => this.getEventCategories(request));
    this.addGetRoute(`${prefix}/events/:id/contributors`, (request) => this.getEventContributors(request));
    this.addGetRoute(`${prefix}/events/:id/multimediaDescriptions`, (request) =>
      this.getEventMultimediaDescriptions(request)
    );
    this.addGetRoute(`${prefix}/events/:id/organizers`, (request) => this.getEventOrganizers(request));
    this.addGetRoute(`${prefix}/events/:id/publisher`, (request) => this.getEventPublisher(request));
    this.addGetRoute(`${prefix}/events/:id/series`, (request) => this.getEventEventSeries(request));
    this.addGetRoute(`${prefix}/events/:id/sponsors`, (request) => this.getEventSponsors(request));
    this.addGetRoute(`${prefix}/events/:id/subEvents`, (request) => this.getEventSubEvents(request));
    this.addGetRoute(`${prefix}/events/:id/venues`, (request) => this.getEventVenues(request));

    if (app) {
      this.installRoutes(app);
    }
  }

  parseRequest(expressRequest) {
    const parsedRequest = new Request(expressRequest);
    parsedRequest.validate();
    return parsedRequest;
  }

  getEvents(request) {
    return this.handleRequest(
      request,
      this.parseRequest,
      (parsedRequest) => new EventConnector(parsedRequest, null).fetch(),
      responseTransform.transformToEventCollection,
      this.validate
    );
  }

  getEventById(request) {
    return this.handleRequest(
      request,
      this.parseRequest,
      (parsedRequest) => new EventConnector(parsedRequest, null).fetch(),
      responseTransform.transformToEventObject,
      this.validate
    );
  }

  getEventCategories(request) {
    return this.handleRequest(
      request,
      this.parseRequest,
      (parsedRequest) => new EventConnector(parsedRequest, null).fetch(),
      responseTransform.transformToEventCategories,
      this.validate
    );
  }

  getEventContributors(request) {
    return this.handleRequest(
      request,
      this.parseRequest,
      (parsedRequest) => new EventConnector(parsedRequest, null).fetch(),
      responseTransform.transformToEventContributors,
      this.validate
    );
  }

  getEventEventSeries(request) {
    return this.handleRequest(
      request,
      this.parseRequest,
      (parsedRequest) => new EventConnector(parsedRequest, null).fetch(),
      responseTransform.transformToEventEventSeries,
      this.validate
    );
  }

  getEventMultimediaDescriptions(request) {
    return this.handleRequest(
      request,
      this.parseRequest,
      (parsedRequest) => new EventConnector(parsedRequest, null).fetch(),
      responseTransform.transformToEventMultimediaDescriptions,
      this.validate
    );
  }

  getEventOrganizers(request) {
    return this.handleRequest(
      request,
      this.parseRequest,
      (parsedRequest) => new EventConnector(parsedRequest, null).fetch(),
      responseTransform.transformToEventOrganizers,
      this.validate
    );
  }

  getEventPublisher(request) {
    return this.handleRequest(
      request,
      this.parseRequest,
      (parsedRequest) => new EventConnector(parsedRequest, null).fetch(),
      responseTransform.transformToEventPublisher,
      this.validate
    );
  }

  getEventSponsors(request) {
    return this.handleRequest(
      request,
      this.parseRequest,
      (parsedRequest) => new EventConnector(parsedRequest, null).fetch(),
      responseTransform.transformToEventSponsors,
      this.validate
    );
  }

  getEventSubEvents(request) {
    return this.handleRequest(
      request,
      this.parseRequest,
      (parsedRequest) => new EventConnector(parsedRequest, null).fetch(),
      responseTransform.transformToEventSubEvents,
      this.validate
    );
  }

  getEventVenues(request) {
    return this.handleRequest(
      request,
      this.parseRequest,
      (parsedRequest) => new EventConnector(parsedRequest, null).fetch(),
      responseTransform.transformToEventVenues,
      this.validate
    );
  }
}

module.exports = {
  EventsRouter,
};
