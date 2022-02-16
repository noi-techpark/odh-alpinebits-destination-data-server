const { Router } = require("./router");
const { SnowparkConnector } = require("../connectors/snowparks_connector");
const {
  deserializeSnowpark,
  serializeSingleResource,
  serializeResourceCollection,
} = require("../model/destinationdata2022");
const { Request } = require("../model/request/request");

class SnowparksRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/snowparks/:id/categories`);
    this.addUnimplementedGetRoute(`/snowparks/:id/connections`);
    this.addUnimplementedGetRoute(`/snowparks/:id/features`);
    this.addUnimplementedGetRoute(`/snowparks/:id/multimediaDescriptions`);

    this.addPostRoute(`/snowparks`, this.postSnowpark);
    this.addGetRoute(`/snowparks`, this.getSnowpark);
    this.addGetRoute(`/snowparks/:id`, this.getSnowparkById);
    this.addDeleteRoute(`/snowparks/:id`, this.deleteSnowpark);
    this.addPatchRoute(`/snowparks/:id`, this.patchSnowpark);

    if (app) {
      this.installRoutes(app);
    }
  }

  getSnowpark = async (request) => {
    // Process request and authentication
    // Retrieve data
    const connector = new SnowparkConnector();
    const parsedRequest = new Request(request);

    // Return to the client
    try {
      return connector.retrieve().then((snowparks) => serializeResourceCollection(snowparks, parsedRequest));
      // return connector.retrieve();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getSnowparkById = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new SnowparkConnector(parsedRequest);

    // Return to the client
    try {
      return connector.retrieve().then((snowpark) => serializeSingleResource(snowpark, parsedRequest));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  postSnowpark = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const snowpark = deserializeSnowpark(body.data);
    const parsedRequest = new Request(request);
    const connector = new SnowparkConnector(parsedRequest);

    // Return to the client
    try {
      return connector.create(snowpark).then((snowpark) => serializeSingleResource(snowpark, parsedRequest));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  patchSnowpark = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const snowpark = deserializeSnowpark(body.data);
    const parsedRequest = new Request(request);
    const connector = new SnowparkConnector(parsedRequest);

    // Return to the client
    try {
      return connector.update(snowpark).then((snowpark) => serializeSingleResource(snowpark, parsedRequest));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  deleteSnowpark = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new SnowparkConnector(parsedRequest);
    console.log("delete snowpark");

    // Return to the client
    try {
      return connector.delete();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  validate(snowparkMessage) {
    console.log("The snowpark message HAS NOT BEEN validated.");
  }
}

module.exports = {
  SnowparksRouter,
};
