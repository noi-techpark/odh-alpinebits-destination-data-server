const { Router } = require("./router");
const {
  EventSeriesConnector,
} = require("./../connectors/event_series_connector");
const { EventConnector } = require("./../connectors/event_connector");
const { deserializeEventSeries } = require("../model/destinationdata2022");
const schemas = require("./../schemas");

class EventSeriesRouter extends Router {
  constructor(app) {
    super();

    this.addPostRoute(`/eventSeries`, this.postEventSeries);
    this.addGetRoute(`/eventSeries`, this.getEventSeries);
    this.addGetRoute(`/eventSeries/:id`, this.getEventSeriesById);
    this.addDeleteRoute(`/eventSeries/:id`, this.deleteEventSeries);
    this.addPatchRoute(`/eventSeries/:id`, this.patchEventSeries);

    this.addGetRoute(
      `/eventSeries/:id/categories`,
      this.getEventSeriesCategories
    );
    this.addGetRoute(`/eventSeries/:id/editions`, this.getEventSeriesEditions);
    this.addGetRoute(
      `/eventSeries/:id/multimediaDescriptions`,
      this.getEventSeriesMultimediaDescriptions
    );

    if (app) {
      this.installRoutes(app);
    }
  }

  postEventSeries = (request) =>
    this.postResource(
      request,
      EventSeriesConnector,
      deserializeEventSeries,
      schemas["/eventSeries/post"]
    );

  getEventSeries = (request) =>
    this.getResources(request, EventSeriesConnector);

  getEventSeriesById = (request) =>
    this.getResourceById(request, EventSeriesConnector);

  deleteEventSeries = (request) =>
    this.deleteResource(request, EventSeriesConnector);

  patchEventSeries = (request) =>
    this.patchResource(
      request,
      EventSeriesConnector,
      deserializeEventSeries,
      schemas["/eventSeries/:id/patch"]
    );

  getEventSeriesCategories = async (request) =>
    this.getResourceCategories(request, EventSeriesConnector);

  getEventSeriesEditions = async (request) => {
    const fnRetrieveEditions = (event, parsedRequest) =>
      new EventConnector(parsedRequest).retrieveEventSeriesEditions(event);
    return this.getResourceRelationshipToMany(
      request,
      EventSeriesConnector,
      fnRetrieveEditions
    );
  };

  getEventSeriesMultimediaDescriptions = async (request) =>
    this.getResourceMultimediaDescriptions(request, EventSeriesConnector);
}

module.exports = {
  EventSeriesRouter,
};
