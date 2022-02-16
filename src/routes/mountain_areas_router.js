const { Router } = require("./router");
const { MountainAreaConnector } = require("../connectors/destinationdata2022/mountain_area_connector");
const {
  deserializeMountainArea,
  serializeSingleResource,
  serializeResourceCollection,
} = require("../model/destinationdata2022");
const { Request } = require("../model/request/request");

class MountainAreasRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/mountainAreas/:id/areaOwner`);
    this.addUnimplementedGetRoute(`/mountainAreas/:id/categories`);
    this.addUnimplementedGetRoute(`/mountainAreas/:id/connections`);
    this.addUnimplementedGetRoute(`/mountainAreas/:id/lifts`);
    this.addUnimplementedGetRoute(`/mountainAreas/:id/multimediaDescriptions`);
    this.addUnimplementedGetRoute(`/mountainAreas/:id/skiSlopes`);
    this.addUnimplementedGetRoute(`/mountainAreas/:id/snowparks`);
    this.addUnimplementedGetRoute(`/mountainAreas/:id/subAreas`);

    this.addPostRoute(`/mountainAreas`, this.postMountainArea);
    this.addGetRoute(`/mountainAreas`, this.getMountainArea);
    this.addGetRoute(`/mountainAreas/:id`, this.getMountainAreaById);
    this.addDeleteRoute(`/mountainAreas/:id`, this.deleteMountainArea);
    this.addPatchRoute(`/mountainAreas/:id`, this.patchMountainArea);

    if (app) {
      this.installRoutes(app);
    }
  }

  getMountainArea = async (request) => {
    // Process request and authentication
    // Retrieve data
    const connector = new MountainAreaConnector();

    // Return to the client
    try {
      return connector
        .retrieve()
        .then((mountainAreas) => serializeResourceCollection(mountainAreas, "/2022-04-draft", "mountainAreas"));
      // return connector.retrieve();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getMountainAreaById = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new MountainAreaConnector(parsedRequest);

    // Return to the client
    try {
      return connector
        .retrieve()
        .then((mountainArea) => serializeSingleResource(mountainArea, "/2022-04-draft", "mountainAreas"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  postMountainArea = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const mountainArea = deserializeMountainArea(body.data);
    const parsedRequest = new Request(request);
    const connector = new MountainAreaConnector(parsedRequest);

    // Return to the client
    try {
      return connector
        .create(mountainArea)
        .then((mountainArea) => serializeSingleResource(mountainArea, "/2022-04-draft", "mountainAreas"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  patchMountainArea = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const mountainArea = deserializeMountainArea(body.data);
    const parsedRequest = new Request(request);
    const connector = new MountainAreaConnector(parsedRequest);

    // Return to the client
    try {
      return connector
        .update(mountainArea)
        .then((mountainArea) => serializeSingleResource(mountainArea, "/2022-04-draft", "mountainAreas"));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  deleteMountainArea = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new MountainAreaConnector(parsedRequest);
    console.log("delete mountainArea");

    // Return to the client
    try {
      return connector.delete();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  validate(mountainAreaMessage) {
    console.log("The mountainArea message HAS NOT BEEN validated.");
  }
}

module.exports = {
  MountainAreasRouter,
};
