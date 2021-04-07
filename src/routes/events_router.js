const { Router } = require("./router");
const { Request } = require("./../model/request/request");
const { EventConnector } = require("./../connectors/event_connector");
const { Agent } = require("./../model/destinationdata/agents");
const { Category } = require("./../model/destinationdata/category");
const { Event } = require("./../model/destinationdata/event");
const { EventSeries } = require("./../model/destinationdata/event_series");
const { MediaObject } = require("./../model/destinationdata/media_object");
const { Venue } = require("./../model/destinationdata/venue");
const responseTransform = require("../model/odh2destinationdata/response_transform");
const requestTransform = require("../model/request2odh/request_transform");

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

  parseRequest(request, expectedTypes, supportedFeatures) {
    const parsedRequest = new Request(request);

    parsedRequest.expectedTypes = expectedTypes || [];

    if (Array.isArray(supportedFeatures)) {
      Object.keys(parsedRequest.supportedFeatures).forEach((feature) => {
        parsedRequest.supportedFeatures[feature] = supportedFeatures.includes(feature);
      });
    }

    parsedRequest.validate();
    return parsedRequest;
  }

  getEvents(request) {
    const parseRequestFn = (request) => {
      const expectedTypes = [Agent, Category, Event, EventSeries, MediaObject, Venue];
      const supportedFeatures = ["include", "fields", "filter", "page", "random", "search", "sort"];
      return this.parseRequest(request, expectedTypes, supportedFeatures);
    };
    const fetchFn = (parsedRequest) =>
      new EventConnector(parsedRequest, requestTransform.transformGetEventsRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventCollection,
      this.validate
    );
  }

  getEventById(request) {
    const parseRequestFn = (request) => {
      const expectedTypes = [Agent, Category, Event, EventSeries, MediaObject, Venue];
      return this.parseRequest(request, expectedTypes);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventObject,
      this.validate
    );
  }

  getEventCategories(request) {
    const parseRequestFn = (request) => {
      const expectedTypes = [Category, MediaObject];
      return this.parseRequest(request, expectedTypes);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventCategories,
      this.validate
    );
  }

  getEventContributors(request) {
    const parseRequestFn = (request) => {
      const expectedTypes = [Agent];
      return this.parseRequest(request, expectedTypes);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventContributors,
      this.validate
    );
  }

  getEventEventSeries(request) {
    const parseRequestFn = (request) => {
      const expectedTypes = [Agent, Category, MediaObject];
      return this.parseRequest(request, expectedTypes);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventEventSeries,
      this.validate
    );
  }

  getEventMultimediaDescriptions(request) {
    const parseRequestFn = (request) => {
      const expectedTypes = [Category, Event, MediaObject];
      return this.parseRequest(request, expectedTypes);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventMultimediaDescriptions,
      this.validate
    );
  }

  getEventOrganizers(request) {
    const parseRequestFn = (request) => {
      const expectedTypes = [Agent];
      return this.parseRequest(request, expectedTypes);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventOrganizers,
      this.validate
    );
  }

  getEventPublisher(request) {
    const parseRequestFn = (request) => {
      const expectedTypes = [Agent];
      return this.parseRequest(request, expectedTypes);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventPublisher,
      this.validate
    );
  }

  getEventSponsors(request) {
    const parseRequestFn = (request) => {
      const expectedTypes = [Agent];
      return this.parseRequest(request, expectedTypes);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventSponsors,
      this.validate
    );
  }

  getEventSubEvents(request) {
    const parseRequestFn = (request) => {
      const expectedTypes = [Agent, Category, Event, EventSeries, MediaObject, Venue];
      return this.parseRequest(request, expectedTypes);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventSubEvents,
      this.validate
    );
  }

  getEventVenues(request) {
    const parseRequestFn = (request) => {
      const expectedTypes = [Category, MediaObject];
      return this.parseRequest(request, expectedTypes);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventVenues,
      this.validate
    );
  }
}

module.exports = {
  EventsRouter,
};
