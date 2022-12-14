const { Router } = require("./router");
const { LiftConnector } = require("../connectors/lift_connector");
const { deserializeLift } = require("../model/destinationdata2022");
const schemas = require("./../schemas");

class LiftsRouter extends Router {
  constructor(app) {
    super();

    this.addPostRoute(`/lifts`, this.postLift);
    this.addGetRoute(`/lifts`, this.getLifts);
    this.addGetRoute(`/lifts/:id`, this.getLiftById);
    this.addDeleteRoute(`/lifts/:id`, this.deleteLift);
    this.addPatchRoute(`/lifts/:id`, this.patchLift);

    this.addGetRoute(`/lifts/:id/categories`, this.getLiftCategories);
    this.addGetRoute(`/lifts/:id/connections`, this.getLiftConnections);
    this.addGetRoute(
      `/lifts/:id/multimediaDescriptions`,
      this.getLiftMultimediaDescriptions
    );

    if (app) {
      this.installRoutes(app);
    }
  }

  postLift = (request) =>
    this.postResource(
      request,
      LiftConnector,
      deserializeLift,
      schemas["/lifts/post"]
    );

  getLifts = (request) => this.getResources(request, LiftConnector);

  getLiftById = (request) => this.getResourceById(request, LiftConnector);

  deleteLift = (request) => this.deleteResource(request, LiftConnector);

  patchLift = (request) =>
    this.patchResource(
      request,
      LiftConnector,
      deserializeLift,
      schemas["/lifts/:id/patch"]
    );

  getLiftCategories = async (request) =>
    this.getResourceCategories(request, LiftConnector);

  getLiftConnections = async (request) =>
    this.getPlaceConnections(request, LiftConnector);

  getLiftMultimediaDescriptions = async (request) =>
    this.getResourceMultimediaDescriptions(request, LiftConnector);
}

module.exports = {
  LiftsRouter,
};
