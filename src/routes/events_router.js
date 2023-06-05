// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Router } = require("./router");
const { EventConnector } = require("./../connectors/event_connector");
const { deserializeEvent } = require("../model/destinationdata2022");
const { AgentConnector } = require("../connectors/agent_connector");
const {
  EventSeriesConnector,
} = require("../connectors/event_series_connector");
const { VenueConnector } = require("../connectors/venue_connector");
const schemas = require("./../schemas");

class EventsRouter extends Router {
  constructor(app) {
    super();

    this.addPostRoute(`/events`, this.postEvent);
    this.addGetRoute(`/events`, this.getEvents);
    this.addGetRoute(`/events/:id`, this.getEventById);
    this.addDeleteRoute(`/events/:id`, this.deleteEvent);
    this.addPatchRoute(`/events/:id`, this.patchEvent);

    this.addGetRoute(`/events/:id/categories`, this.getEventCategories);
    this.addGetRoute(`/events/:id/contributors`, this.getEventContributors);
    this.addGetRoute(
      `/events/:id/multimediaDescriptions`,
      this.getEventMultimediaDescriptions
    );
    this.addGetRoute(`/events/:id/organizers`, this.getEventOrganizers);
    this.addGetRoute(`/events/:id/publisher`, this.getEventPublisher);
    this.addGetRoute(`/events/:id/series`, this.getEventSeries);
    this.addGetRoute(`/events/:id/sponsors`, this.getEventSponsors);
    this.addGetRoute(`/events/:id/subEvents`, this.getEventSubEvents);
    this.addGetRoute(`/events/:id/venues`, this.getEventVenues);

    if (app) {
      this.installRoutes(app);
    }
  }

  postEvent = (request) =>
    this.postResource(
      request,
      EventConnector,
      deserializeEvent,
      schemas["/events/post"]
    );

  getEvents = (request) => this.getResources(request, EventConnector);

  getEventById = (request) => this.getResourceById(request, EventConnector);

  deleteEvent = (request) => this.deleteResource(request, EventConnector);

  patchEvent = (request) =>
    this.patchResource(
      request,
      EventConnector,
      deserializeEvent,
      schemas["/events/:id/patch"]
    );

  getEventCategories = async (request) =>
    this.getResourceCategories(request, EventConnector);

  getEventMultimediaDescriptions = async (request) =>
    this.getResourceMultimediaDescriptions(request, EventConnector);

  getEventSeries = async (request) => {
    const fnRetrieveEventSeries = (event, parsedRequest) =>
      new EventSeriesConnector(parsedRequest).retrieveEventEventSeries(event);
    return this.getResourceRelationshipToOne(
      request,
      EventConnector,
      fnRetrieveEventSeries
    );
  };

  getEventPublisher = async (request) => {
    const fnRetrieveAgent = (event, parsedRequest) =>
      new AgentConnector(parsedRequest).retrieveEventPublisher(event);
    return this.getResourceRelationshipToOne(
      request,
      EventConnector,
      fnRetrieveAgent
    );
  };

  getEventContributors = async (request) => {
    const fnRetrieveAgents = (event, parsedRequest) =>
      new AgentConnector(parsedRequest).retrieveEventContributors(event);
    return this.getResourceRelationshipToMany(
      request,
      EventConnector,
      fnRetrieveAgents
    );
  };

  getEventOrganizers = async (request) => {
    const fnRetrieveAgents = (event, parsedRequest) =>
      new AgentConnector(parsedRequest).retrieveEventOrganizers(event);
    return this.getResourceRelationshipToMany(
      request,
      EventConnector,
      fnRetrieveAgents
    );
  };

  getEventSponsors = async (request) => {
    const fnRetrieveAgents = (event, parsedRequest) =>
      new AgentConnector(parsedRequest).retrieveEventSponsors(event);
    return this.getResourceRelationshipToMany(
      request,
      EventConnector,
      fnRetrieveAgents
    );
  };

  getEventSubEvents = async (request) => {
    const fnRetrieveEvents = (event, parsedRequest) =>
      new EventConnector(parsedRequest).retrieveEventSubEvents(event);
    return this.getResourceRelationshipToMany(
      request,
      EventConnector,
      fnRetrieveEvents
    );
  };

  getEventVenues = async (request) => {
    const fnRetrieveVenues = (event, parsedRequest) =>
      new VenueConnector(parsedRequest).retrieveEventVenues(event);
    return this.getResourceRelationshipToMany(
      request,
      EventConnector,
      fnRetrieveVenues
    );
  };
}

module.exports = {
  EventsRouter,
};
