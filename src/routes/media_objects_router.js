const { AgentConnector } = require("../connectors/agent_connector");
const {
  MediaObjectConnector,
} = require("../connectors/media_object_connector");
const { deserializeMediaObject } = require("../model/destinationdata2022");
const { Router } = require("./router");

class MediaObjectsRouter extends Router {
  constructor(app) {
    super();

    this.addPostRoute(`/mediaObjects`, this.postMediaObject);
    this.addGetRoute(`/mediaObjects`, this.getMediaObjects);
    this.addGetRoute(`/mediaObjects/:id`, this.getMediaObjectById);
    this.addDeleteRoute(`/mediaObjects/:id`, this.deleteMediaObject);
    this.addPatchRoute(`/mediaObjects/:id`, this.patchMediaObject);

    this.addGetRoute(
      `/mediaObjects/:id/categories`,
      this.getMediaObjectCategories
    );
    this.addGetRoute(
      `/mediaObjects/:id/licenseHolder`,
      this.getMediaObjectLicenseHolder
    );

    if (app) {
      this.installRoutes(app);
    }
  }

  postMediaObject = (request) =>
    this.postResource(request, MediaObjectConnector, deserializeMediaObject);

  getMediaObjects = (request) =>
    this.getResources(request, MediaObjectConnector);

  getMediaObjectById = (request) =>
    this.getResourceById(request, MediaObjectConnector);

  deleteMediaObject = (request) =>
    this.deleteResource(request, MediaObjectConnector);

  patchMediaObject = (request) =>
    this.patchResource(request, MediaObjectConnector, deserializeMediaObject);

  validate(mediaObjectMessage) {
    console.log("The media object message HAS NOT BEEN validated.");
  }

  getMediaObjectCategories = async (request) =>
    this.getResourceCategories(request, MediaObjectConnector);

  getMediaObjectLicenseHolder = async (request) => {
    const fnRetrieveLicenseHolder = (mediaObject, parsedRequest) =>
      new AgentConnector(parsedRequest).retrieveLicenseHolder(mediaObject);
    return this.getResourceRelationshipToOne(
      request,
      MediaObjectConnector,
      fnRetrieveLicenseHolder
    );
  };
}

module.exports = {
  MediaObjectsRouter,
};