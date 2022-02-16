const { Router } = require("./router");
const { EventConnector } = require("./../connectors/event_connector");
const {
  deserializeEvent,
  serializeResourceCollection,
  serializeSingleResource,
} = require("../model/destinationdata2022");
const { Request } = require("../model/request/request");

class EventsRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/events/:id/categories`);
    this.addUnimplementedGetRoute(`/events/:id/contributors`);
    this.addUnimplementedGetRoute(`/events/:id/multimediaDescriptions`);
    this.addUnimplementedGetRoute(`/events/:id/organizers`);
    this.addUnimplementedGetRoute(`/events/:id/publisher`);
    this.addUnimplementedGetRoute(`/events/:id/series`);
    this.addUnimplementedGetRoute(`/events/:id/sponsors`);
    this.addUnimplementedGetRoute(`/events/:id/subEvents`);
    this.addUnimplementedGetRoute(`/events/:id/venues`);

    this.addPostRoute(`/events`, this.postEvent);
    this.addGetRoute(`/events`, this.getEvents);
    this.addGetRoute(`/events/:id`, this.getEventById);
    this.addDeleteRoute(`/events/:id`, this.deleteEvent);
    this.addPatchRoute(`/events/:id`, this.patchEvent);

    if (app) {
      this.installRoutes(app);
    }
  }

  getEvents = async (request) => {
    // Process request and authentication
    // Retrieve data
    const connector = new EventConnector();
    const parsedRequest = new Request(request);

    // Return to the client
    try {
      return connector.retrieve().then((events) => serializeResourceCollection(events, parsedRequest));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getEventById = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new EventConnector(parsedRequest);

    // Return to the client
    try {
      return connector.retrieve().then((event) => serializeSingleResource(event, parsedRequest));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  postEvent = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const event = deserializeEvent(body.data);
    const parsedRequest = new Request(request);
    const connector = new EventConnector(parsedRequest);

    // Return to the client
    try {
      return connector.create(event).then((event) => serializeSingleResource(event, parsedRequest));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  patchEvent = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const event = deserializeEvent(body.data);
    const parsedRequest = new Request(request);
    const connector = new EventConnector(parsedRequest);

    console.log(event);

    // Return to the client
    try {
      return connector.update(event).then((event) => serializeSingleResource(event, parsedRequest));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  deleteEvent = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new EventConnector(parsedRequest);
    console.log("delete event");

    // Return to the client
    try {
      return connector.delete();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  validate(eventMessage) {
    console.log("The event message HAS NOT BEEN validated.");
  }
}

module.exports = {
  EventsRouter,
};
