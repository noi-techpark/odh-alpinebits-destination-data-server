const { Router } = require("./router");
const { SkiSlopeConnector } = require("../connectors/ski_slope_connector");
const {
  deserializeSkiSlope,
  serializeSingleResource,
  serializeResourceCollection,
} = require("../model/destinationdata2022");
const { Request } = require("../model/request/request");

class SkiSlopesRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/skiSlopes/:id/categories`);
    this.addUnimplementedGetRoute(`/skiSlopes/:id/connections`);
    this.addUnimplementedGetRoute(`/skiSlopes/:id/multimediaDescriptions`);

    this.addPostRoute(`/skiSlopes`, this.postSkiSlope);
    this.addGetRoute(`/skiSlopes`, this.getSkiSlope);
    this.addGetRoute(`/skiSlopes/:id`, this.getSkiSlopeById);
    this.addDeleteRoute(`/skiSlopes/:id`, this.deleteSkiSlope);
    this.addPatchRoute(`/skiSlopes/:id`, this.patchSkiSlope);

    if (app) {
      this.installRoutes(app);
    }
  }

  getSkiSlope = async (request) => {
    // Process request and authentication
    // Retrieve data
    const connector = new SkiSlopeConnector();

    // Return to the client
    try {
      return connector
        .retrieve()
        .then((skiSlopes) => serializeResourceCollection(skiSlopes, "/2022-04-draft", "skiSlopes"));
      // return connector.retrieve();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getSkiSlopeById = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new SkiSlopeConnector(parsedRequest);

    // Return to the client
    try {
      return connector.retrieve().then((skiSlope) => serializeSingleResource(skiSlope, "/2022-04-draft", "skiSlopes"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  postSkiSlope = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const skiSlope = deserializeSkiSlope(body.data);
    const parsedRequest = new Request(request);
    const connector = new SkiSlopeConnector(parsedRequest);

    // Return to the client
    try {
      return connector
        .create(skiSlope)
        .then((skiSlope) => serializeSingleResource(skiSlope, "/2022-04-draft", "skiSlopes"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  patchSkiSlope = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const skiSlope = deserializeSkiSlope(body.data);
    const parsedRequest = new Request(request);
    const connector = new SkiSlopeConnector(parsedRequest);

    // Return to the client
    try {
      return connector
        .update(skiSlope)
        .then((skiSlope) => serializeSingleResource(skiSlope, "/2022-04-draft", "skiSlopes"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  deleteSkiSlope = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new SkiSlopeConnector(parsedRequest);
    console.log("delete skiSlope");

    // Return to the client
    try {
      return connector.delete();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  validate(skiSlopeMessage) {
    console.log("The skiSlope message HAS NOT BEEN validated.");
  }
}

module.exports = {
  SkiSlopesRouter,
};
