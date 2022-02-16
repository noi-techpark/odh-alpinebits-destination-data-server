const { Router } = require("./router");
const { LiftConnector } = require("../connectors/destinationdata2022/lift_connector");
const {
  deserializeLift,
  serializeSingleResource,
  serializeResourceCollection,
} = require("../model/destinationdata2022");
const { Request } = require("../model/request/request");

class LiftsRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/lifts/:id/categories`);
    this.addUnimplementedGetRoute(`/lifts/:id/connections`);
    this.addUnimplementedGetRoute(`/lifts/:id/multimediaDescriptions`);

    this.addPostRoute(`/lifts`, this.postLift);
    this.addGetRoute(`/lifts`, this.getLift);
    this.addGetRoute(`/lifts/:id`, this.getLiftById);
    this.addDeleteRoute(`/lifts/:id`, this.deleteLift);
    this.addPatchRoute(`/lifts/:id`, this.patchLift);

    if (app) {
      this.installRoutes(app);
    }
  }

  getLift = async (request) => {
    // Process request and authentication
    // Retrieve data
    const connector = new LiftConnector();

    // Return to the client
    try {
      return connector.retrieve().then((lifts) => serializeResourceCollection(lifts, "/2022-04-draft", "lifts"));
      // return connector.retrieve();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getLiftById = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new LiftConnector(parsedRequest);

    // Return to the client
    try {
      return connector.retrieve().then((lift) => serializeSingleResource(lift, "/2022-04-draft", "lifts"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  postLift = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const lift = deserializeLift(body.data);
    const parsedRequest = new Request(request);
    const connector = new LiftConnector(parsedRequest);

    // Return to the client
    try {
      return connector.create(lift).then((lift) => serializeSingleResource(lift, "/2022-04-draft", "lifts"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  patchLift = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const lift = deserializeLift(body.data);
    const parsedRequest = new Request(request);
    const connector = new LiftConnector(parsedRequest);

    // Return to the client
    try {
      return connector.update(lift).then((lift) => serializeSingleResource(lift, "/2022-04-draft", "lifts"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  deleteLift = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new LiftConnector(parsedRequest);
    console.log("delete lift");

    // Return to the client
    try {
      return connector.delete();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  validate(liftMessage) {
    console.log("The lift message HAS NOT BEEN validated.");
  }
}

module.exports = {
  LiftsRouter,
};
