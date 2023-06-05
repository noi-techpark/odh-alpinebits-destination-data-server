// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Router } = require("./router");
const { SnowparkConnector } = require("../connectors/snowparks_connector");
const { deserializeSnowpark } = require("../model/destinationdata2022");
const schemas = require("./../schemas");
const { FeatureConnector } = require("../connectors/feature_connector");

class SnowparksRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/snowparks/:id/features`);

    this.addPostRoute(`/snowparks`, this.postSnowpark);
    this.addGetRoute(`/snowparks`, this.getSnowpark);
    this.addGetRoute(`/snowparks/:id`, this.getSnowparkById);
    this.addDeleteRoute(`/snowparks/:id`, this.deleteSnowpark);
    this.addPatchRoute(`/snowparks/:id`, this.patchSnowpark);

    this.addGetRoute(`/snowparks/:id/categories`, this.getSnowparkCategories);
    this.addGetRoute(`/snowparks/:id/connections`, this.getSnowparkConnections);
    this.addGetRoute(`/snowparks/:id/features`, this.getSnowparkFeatures);
    this.addGetRoute(
      `/snowparks/:id/multimediaDescriptions`,
      this.getSnowparkMultimediaDescriptions
    );

    if (app) {
      this.installRoutes(app);
    }
  }

  postSnowpark = (request) =>
    this.postResource(
      request,
      SnowparkConnector,
      deserializeSnowpark,
      schemas["/snowparks/post"]
    );

  getSnowpark = (request) => this.getResources(request, SnowparkConnector);

  getSnowparkById = (request) =>
    this.getResourceById(request, SnowparkConnector);

  deleteSnowpark = (request) => this.deleteResource(request, SnowparkConnector);

  patchSnowpark = (request) =>
    this.patchResource(
      request,
      SnowparkConnector,
      deserializeSnowpark,
      schemas["/snowparks/:id/patch"]
    );

  getSnowparkCategories = async (request) =>
    this.getResourceCategories(request, SnowparkConnector);

  getSnowparkConnections = async (request) =>
    this.getPlaceConnections(request, SnowparkConnector);

  getSnowparkConnections = async (request) =>
    this.getPlaceConnections(request, SnowparkConnector);

  getSnowparkFeatures = async (request) => {
    const fnRetrieveSnowparkFeatures = (snowpark, parsedRequest) =>
      new FeatureConnector(parsedRequest).retrieveResourceFeatures(snowpark);
    return this.getResourceRelationshipToMany(
      request,
      SnowparkConnector,
      fnRetrieveSnowparkFeatures
    );
  };

  getSnowparkMultimediaDescriptions = async (request) =>
    this.getResourceMultimediaDescriptions(request, SnowparkConnector);
}

module.exports = {
  SnowparksRouter,
};
