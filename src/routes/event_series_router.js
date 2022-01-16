const { Router } = require("./router");
const { EventSeriesConnector } = require("./../connectors/destinationdata2022/event_series_connector");
const { deserializeEventSeries } = require("../model/destinationdata2022");
const { Request } = require("../model/request/request");

class EventSeriesRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/eventSeries/:id/categories`);
    this.addUnimplementedGetRoute(`/eventSeries/:id/editions`);
    this.addUnimplementedGetRoute(`/eventSeries/:id/multimediaDescriptions`);

    this.addPostRoute(`/eventSeries`, this.postEventSeries);
    this.addGetRoute(`/eventSeries`, this.getEventSeries);
    this.addGetRoute(`/eventSeries/:id`, this.getEventSeriesById);
    this.addDeleteRoute(`/eventSeries/:id`, this.deleteEventSeries);
    this.addPatchRoute(`/eventSeries/:id`, this.patchEventSeries);

    if (app) {
      this.installRoutes(app);
    }
  }

  getEventSeries = async (request) => {
    // Process request and authentication
    // Retrieve data
    const connector = new EventSeriesConnector();

    // Return to the client
    try {
      return connector.retrieve();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getEventSeriesById = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new EventSeriesConnector(parsedRequest);

    // Return to the client
    try {
      return connector.retrieve();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  postEventSeries = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const eventSeries = deserializeEventSeries(body.data);
    const parsedRequest = new Request(request);
    const connector = new EventSeriesConnector(parsedRequest);

    // Return to the client
    try {
      return connector.create(eventSeries);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  patchEventSeries = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const eventSeries = deserializeEventSeries(body.data);
    const parsedRequest = new Request(request);
    const connector = new EventSeriesConnector(parsedRequest);

    // Return to the client
    try {
      return connector.update(eventSeries);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  deleteEventSeries = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new EventSeriesConnector(parsedRequest);

    // Return to the client
    try {
      return connector.delete();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  validate(eventSeriesMessage) {
    console.log("The event series message HAS NOT BEEN validated.");
  }
}

module.exports = {
  EventSeriesRouter,
};
