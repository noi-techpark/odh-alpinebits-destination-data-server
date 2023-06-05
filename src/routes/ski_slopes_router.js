// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Router } = require("./router");
const { SkiSlopeConnector } = require("../connectors/ski_slope_connector");
const { deserializeSkiSlope } = require("../model/destinationdata2022");
const schemas = require("./../schemas");

class SkiSlopesRouter extends Router {
  constructor(app) {
    super();

    this.addPostRoute(`/skiSlopes`, this.postSkiSlope);
    this.addGetRoute(`/skiSlopes`, this.getSkiSlope);
    this.addGetRoute(`/skiSlopes/:id`, this.getSkiSlopeById);
    this.addDeleteRoute(`/skiSlopes/:id`, this.deleteSkiSlope);
    this.addPatchRoute(`/skiSlopes/:id`, this.patchSkiSlope);

    this.addGetRoute(`/skiSlopes/:id/categories`, this.getSkiSlopeCategories);
    this.addGetRoute(`/skiSlopes/:id/connections`, this.getSkiSlopeConnections);
    this.addGetRoute(
      `/skiSlopes/:id/multimediaDescriptions`,
      this.getSkiSlopeMultimediaDescriptions
    );

    if (app) {
      this.installRoutes(app);
    }
  }

  postSkiSlope = (request) =>
    this.postResource(
      request,
      SkiSlopeConnector,
      deserializeSkiSlope,
      schemas["/skiSlopes/post"]
    );

  getSkiSlope = (request) => this.getResources(request, SkiSlopeConnector);

  getSkiSlopeById = (request) =>
    this.getResourceById(request, SkiSlopeConnector);

  deleteSkiSlope = (request) => this.deleteResource(request, SkiSlopeConnector);

  patchSkiSlope = (request) =>
    this.patchResource(
      request,
      SkiSlopeConnector,
      deserializeSkiSlope,
      schemas["/skiSlopes/:id/patch"]
    );

  getSkiSlopeCategories = async (request) =>
    this.getResourceCategories(request, SkiSlopeConnector);

  getSkiSlopeConnections = async (request) =>
    this.getPlaceConnections(request, SkiSlopeConnector);

  getSkiSlopeMultimediaDescriptions = async (request) =>
    this.getResourceMultimediaDescriptions(request, SkiSlopeConnector);
}

module.exports = {
  SkiSlopesRouter,
};
