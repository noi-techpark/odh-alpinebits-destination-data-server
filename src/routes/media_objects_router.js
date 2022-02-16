const { MediaObjectConnector } = require("../connectors/media_object_connector");
const {
  deserializeMediaObject,
  serializeResourceCollection,
  serializeSingleResource,
} = require("../model/destinationdata2022");
const { Request } = require("../model/request/request");
const { Router } = require("./router");

class MediaObjectsRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/mediaObjects/:id/categories`);
    this.addUnimplementedGetRoute(`/mediaObjects/:id/copyrightOwner`);

    this.addPostRoute(`/mediaObjects`, this.postMediaObject);
    this.addGetRoute(`/mediaObjects`, this.getMediaObjects);
    this.addGetRoute(`/mediaObjects/:id`, this.getMediaObjectById);
    this.addDeleteRoute(`/mediaObjects/:id`, this.deleteMediaObject);
    this.addPatchRoute(`/mediaObjects/:id`, this.patchMediaObject);

    if (app) {
      this.installRoutes(app);
    }
  }

  getMediaObjects = async (request) => {
    // Process request and authentication
    // Retrieve data
    const connector = new MediaObjectConnector();
    const parsedRequest = new Request(request);

    // Return to the client
    try {
      return connector.retrieve().then((mediaObjects) => serializeResourceCollection(mediaObjects, parsedRequest));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getMediaObjectById = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new MediaObjectConnector(parsedRequest);

    // Return to the client
    try {
      return connector.retrieve().then((mediaObject) => serializeSingleResource(mediaObject, parsedRequest));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  postMediaObject = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const mediaObject = deserializeMediaObject(body.data);
    const parsedRequest = new Request(request);
    const connector = new MediaObjectConnector(parsedRequest);

    // Return to the client
    try {
      return connector.create(mediaObject).then((mediaObject) => serializeSingleResource(mediaObject, parsedRequest));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  patchMediaObject = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const mediaObject = deserializeMediaObject(body.data);
    const parsedRequest = new Request(request);
    const connector = new MediaObjectConnector(parsedRequest);

    // Return to the client
    try {
      return connector.update(mediaObject).then((mediaObject) => serializeSingleResource(mediaObject, parsedRequest));
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  deleteMediaObject = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new MediaObjectConnector(parsedRequest);
    console.log("delete media object");

    // Return to the client
    try {
      return connector.delete();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  validate(mediaObjectMessage) {
    console.log("The media object message HAS NOT BEEN validated.");
  }
}

module.exports = {
  MediaObjectsRouter,
};
