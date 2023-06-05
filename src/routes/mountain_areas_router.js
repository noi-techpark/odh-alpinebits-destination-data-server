// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Router } = require("./router");
const {
  MountainAreaConnector,
} = require("../connectors/mountain_area_connector");
const { deserializeMountainArea } = require("../model/destinationdata2022");
const { AgentConnector } = require("../connectors/agent_connector");
const { LiftConnector } = require("../connectors/lift_connector");
const { SkiSlopeConnector } = require("../connectors/ski_slope_connector");
const { SnowparkConnector } = require("../connectors/snowparks_connector");
const schemas = require("./../schemas");

class MountainAreasRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(
      `/mountainAreas/:id/areaOwner`,
      this.getMountainAreaAreaOwner
    );
    this.addGetRoute(`/mountainAreas/:id/lifts`, this.getMountainAreaLifts);
    this.addGetRoute(
      `/mountainAreas/:id/skiSlopes`,
      this.getMountainAreaSkiSlopes
    );
    this.addGetRoute(
      `/mountainAreas/:id/snowparks`,
      this.getMountainAreaSnowparks
    );
    this.addGetRoute(
      `/mountainAreas/:id/subAreas`,
      this.getMountainAreaSubAreas
    );

    this.addPostRoute(`/mountainAreas`, this.postMountainArea);
    this.addGetRoute(`/mountainAreas`, this.getMountainArea);
    this.addGetRoute(`/mountainAreas/:id`, this.getMountainAreaById);
    this.addDeleteRoute(`/mountainAreas/:id`, this.deleteMountainArea);
    this.addPatchRoute(`/mountainAreas/:id`, this.patchMountainArea);

    this.addGetRoute(
      `/mountainAreas/:id/categories`,
      this.getMountainAreaCategories
    );
    this.addGetRoute(
      `/mountainAreas/:id/connections`,
      this.getMountainAreaConnections
    );
    this.addGetRoute(
      `/mountainAreas/:id/multimediaDescriptions`,
      this.getMountainAreaMultimediaDescriptions
    );

    if (app) {
      this.installRoutes(app);
    }
  }

  postMountainArea = (request) =>
    this.postResource(
      request,
      MountainAreaConnector,
      deserializeMountainArea,
      schemas["/mountainAreas/post"]
    );

  getMountainArea = (request) =>
    this.getResources(request, MountainAreaConnector);

  getMountainAreaById = (request) =>
    this.getResourceById(request, MountainAreaConnector);

  deleteMountainArea = (request) =>
    this.deleteResource(request, MountainAreaConnector);

  patchMountainArea = (request) =>
    this.patchResource(
      request,
      MountainAreaConnector,
      deserializeMountainArea,
      schemas["/mountainAreas/:id/patch"]
    );

  getMountainAreaCategories = async (request) =>
    this.getResourceCategories(request, MountainAreaConnector);

  getMountainAreaConnections = async (request) =>
    this.getPlaceConnections(request, MountainAreaConnector);

  getMountainAreaMultimediaDescriptions = async (request) =>
    this.getResourceMultimediaDescriptions(request, MountainAreaConnector);

  getMountainAreaAreaOwner = async (request) => {
    const fnRetrieveAreaOwner = (mountainArea, parsedRequest) =>
      new AgentConnector(parsedRequest).retrieveAreaOwner(mountainArea);
    return this.getResourceRelationshipToOne(
      request,
      MountainAreaConnector,
      fnRetrieveAreaOwner
    );
  };

  getMountainAreaLifts = async (request) => {
    const fnRetrieveLifts = (mountainArea, parsedRequest) =>
      new LiftConnector(parsedRequest).retrieveMountainAreaLifts(mountainArea);
    return this.getResourceRelationshipToMany(
      request,
      MountainAreaConnector,
      fnRetrieveLifts
    );
  };

  getMountainAreaSkiSlopes = async (request) => {
    const fnRetrieveSkiSlopes = (mountainArea, parsedRequest) =>
      new SkiSlopeConnector(parsedRequest).retrieveMountainAreaSkiSlopes(
        mountainArea
      );
    return this.getResourceRelationshipToMany(
      request,
      MountainAreaConnector,
      fnRetrieveSkiSlopes
    );
  };

  getMountainAreaSnowparks = async (request) => {
    const fnRetrieveSnowparks = (mountainArea, parsedRequest) =>
      new SnowparkConnector(parsedRequest).retrieveMountainAreaSnowparks(
        mountainArea
      );
    return this.getResourceRelationshipToMany(
      request,
      MountainAreaConnector,
      fnRetrieveSnowparks
    );
  };

  getMountainAreaSubAreas = async (request) => {
    const fnRetrieveSubAreas = (mountainArea, parsedRequest) =>
      new MountainAreaConnector(parsedRequest).retrieveMountainAreaSubAreas(
        mountainArea
      );
    return this.getResourceRelationshipToMany(
      request,
      MountainAreaConnector,
      fnRetrieveSubAreas
    );
  };
}

module.exports = {
  MountainAreasRouter,
};
