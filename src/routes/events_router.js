const { Router } = require("./router");
const { EventConnector } = require("./../connectors/event_connector");
const { Agent } = require("./../model/destinationdata/agents");
const { Category } = require("./../model/destinationdata/category");
const { Event } = require("./../model/destinationdata/event");
const { EventSeries } = require("./../model/destinationdata/event_series");
const { MediaObject } = require("./../model/destinationdata/media_object");
const { Venue } = require("./../model/destinationdata/venue");
const responseTransform = require("../model/odh2destinationdata/response_transform");
const requestTransform = require("../model/request2odh/request_transform");

class EventsRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(`/events`, this.getEvents);
    this.addGetRoute(`/events/:id`, this.getEventById);
    this.addGetRoute(`/events/:id/categories`, this.getEventCategories);
    this.addGetRoute(`/events/:id/contributors`, this.getEventContributors);
    this.addGetRoute(`/events/:id/multimediaDescriptions`, this.getEventMultimediaDescriptions);
    this.addGetRoute(`/events/:id/organizers`, this.getEventOrganizers);
    this.addGetRoute(`/events/:id/publisher`, this.getEventPublisher);
    this.addGetRoute(`/events/:id/series`, this.getEventEventSeries);
    this.addGetRoute(`/events/:id/sponsors`, this.getEventSponsors);
    this.addGetRoute(`/events/:id/subEvents`, this.getEventSubEvents);
    this.addGetRoute(`/events/:id/venues`, this.getEventVenues);

    if (app) {
      this.installRoutes(app);
    }
  }

  getEvents = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Event];
      const typesInIncluded = [Agent, Category, Event, EventSeries, MediaObject, Venue];
      const supportedFeatures = ["include", "fields", "filter", "page", "random", "search", "sort"];
      return this.parseRequest(request, typesInData, typesInIncluded, supportedFeatures);
    };
    const fetchFn = (parsedRequest) =>
      new EventConnector(parsedRequest, requestTransform.transformGetEventsRequest).fetch();

    return this.handleGetRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventCollection,
      this.validate
    );
  };

  getEventById = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Event];
      const typesInIncluded = [Agent, Category, Event, EventSeries, MediaObject, Venue];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleGetRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventObject,
      this.validate
    );
  };

  getEventCategories = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Category];
      const typesInIncluded = [Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleGetRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventCategories,
      this.validate
    );
  };

  getEventContributors = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Agent];
      const typesInIncluded = [Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleGetRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventContributors,
      this.validate
    );
  };

  getEventEventSeries = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [EventSeries];
      const typesInIncluded = [Category, Event, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleGetRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventEventSeries,
      this.validate
    );
  };

  getEventMultimediaDescriptions = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [MediaObject];
      const typesInIncluded = [Agent, Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleGetRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventMultimediaDescriptions,
      this.validate
    );
  };

  getEventOrganizers = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Agent];
      const typesInIncluded = [Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleGetRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventOrganizers,
      this.validate
    );
  };

  getEventPublisher = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Agent];
      const typesInIncluded = [Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleGetRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventPublisher,
      this.validate
    );
  };

  getEventSponsors = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Agent];
      const typesInIncluded = [Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleGetRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventSponsors,
      this.validate
    );
  };

  getEventSubEvents = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Event];
      const typesInIncluded = [Agent, Category, Event, EventSeries, MediaObject, Venue];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleGetRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventSubEvents,
      this.validate
    );
  };

  getEventVenues = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Venue];
      const typesInIncluded = [Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new EventConnector(parsedRequest, null).fetch();

    return this.handleGetRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToEventVenues,
      this.validate
    );
  };
}

module.exports = {
  EventsRouter,
};
