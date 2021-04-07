const { Router } = require("./router");
const { MountainAreaConnector } = require("./../connector/mountain_area_connector");
const { Agent } = require("./../model/destinationdata/agents");
const { Category } = require("./../model/destinationdata/category");
const { Lift } = require("../model/destinationdata/lift");
const { MediaObject } = require("./../model/destinationdata/media_object");
const { MountainArea } = require("../model/destinationdata/mountain_area");
const { SkiSlope } = require("../model/destinationdata/ski_slope");
const { Snowpark } = require("../model/destinationdata/snowpark");
const responseTransform = require("../model/odh2destinationdata/response_transform");
const requestTransform = require("../model/request2odh/request_transform");

class MountainAreasRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(`/mountainAreas`, this.getMountainAreas);
    this.addGetRoute(`/mountainAreas/:id`, this.getMountainAreaById);
    this.addGetRoute(`/mountainAreas/:id/areaOwner`, this.getAreaOwner);
    this.addGetRoute(`/mountainAreas/:id/categories`, this.getCategories);
    this.addGetRoute(`/mountainAreas/:id/connections`, this.getConnections);
    this.addGetRoute(`/mountainAreas/:id/lifts`, this.getLifts);
    this.addGetRoute(`/mountainAreas/:id/multimediaDescriptions`, this.getMultimediaDescriptions);
    this.addGetRoute(`/mountainAreas/:id/skiSlopes`, this.getSkiSlopes);
    this.addGetRoute(`/mountainAreas/:id/snowparks`, this.getSnowparks);
    this.addGetRoute(`/mountainAreas/:id/subAreas`, this.getSubAreas);

    if (app) {
      this.installRoutes(app);
    }
  }

  getMountainAreas = (request) => {
    const parseRequestFn = (request) => {
      const expectedTypes = [Agent, Category, Lift, MediaObject, MountainArea, SkiSlope, Snowpark];
      // TODO: Add additional features (filter, sort)
      const supportedFeatures = ["include", "fields", "page"];
      return this.parseRequest(request, expectedTypes, supportedFeatures);
    };

    const fetchFn = (parsedRequest) =>
      new MountainAreaConnector(parsedRequest, requestTransform.transformGetLiftsRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToLiftCollection,
      this.validate
    );
  };

  getMountainAreaById = (request) => {
    const parseRequestFn = (request) => {
      const expectedTypes = [Category, MediaObject, Lift, MountainArea, SkiSlope, Snowpark];
      return this.parseRequest(request, expectedTypes);
    };
    const fetchFn = (parsedRequest) => new LiftConnector(parsedRequest, null).fetch();

    return this.handleRequest(request, parseRequestFn, fetchFn, responseTransform.transformToLiftObject, this.validate);
  };

  getCategories = (request) => {
    const parseRequestFn = (request) => {
      const expectedTypes = [Category, MediaObject];
      return this.parseRequest(request, expectedTypes);
    };
    const fetchFn = (parsedRequest) => new LiftConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToLiftCategories,
      this.validate
    );
  };

  getConnections = (request) => {
    const parseRequestFn = (request) => {
      const expectedTypes = [Agent, Category, MediaObject, Lift, MountainArea, SkiSlope, Snowpark];
      return this.parseRequest(request, expectedTypes);
    };
    const fetchFn = (parsedRequest) => new LiftConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToLiftConnections,
      this.validate
    );
  };

  getMultimediaDescriptions = (request) => {
    const parseRequestFn = (request) => {
      const expectedTypes = [Agent, Category, MediaObject];
      return this.parseRequest(request, expectedTypes);
    };
    const fetchFn = (parsedRequest) => new LiftConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToLiftMultimediaDescriptions,
      this.validate
    );
  };
}

module.exports = {
  MountainAreasRouter,
};
