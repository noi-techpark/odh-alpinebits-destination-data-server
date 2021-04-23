const { Router } = require("./router");
const { SkiSlopeConnector } = require("./../connectors/ski_slope_connector");
const { Agent } = require("./../model/destinationdata/agents");
const { Category } = require("./../model/destinationdata/category");
const { Lift } = require("../model/destinationdata/lift");
const { MediaObject } = require("./../model/destinationdata/media_object");
const { MountainArea } = require("../model/destinationdata/mountain_area");
const { SkiSlope } = require("../model/destinationdata/ski_slope");
const { Snowpark } = require("../model/destinationdata/snowpark");
const responseTransform = require("../model/odh2destinationdata/response_transform");
const requestTransform = require("../model/request2odh/request_transform");
const connector = require("../connectors");
const { Feature } = require("../model/destinationdata/feature");

class SkiSlopesRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(`/skiSlopes`, this.getSkiSlopes);
    this.addGetRoute(`/skiSlopes/:id`, this.getSkiSlopeById);
    this.addGetRoute(`/skiSlopes/:id/categories`, this.getSkiSlopeCategories);
    this.addGetRoute(`/skiSlopes/:id/connections`, this.getSkiSlopeConnections);
    this.addGetRoute(`/skiSlopes/:id/multimediaDescriptions`, this.getSkiSlopeMultimediaDescriptions);

    if (app) {
      this.installRoutes(app);
    }
  }

  getSkiSlopes = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [SkiSlope];
      const typesInIncluded = [Category, MediaObject, Lift, MountainArea, SkiSlope, Snowpark];
      const supportedFeatures = ["include", "fields", "filter", "page", "random", "search", "sort"];
      return this.parseRequest(request, typesInData, typesInIncluded, supportedFeatures);
    };
    const fetchFn = (parsedRequest) =>
      new SkiSlopeConnector(parsedRequest, requestTransform.transformGetSkiSlopesRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToSkiSlopeCollection,
      this.validate
    );
  };

  getSkiSlopeById = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [SkiSlope];
      const typesInIncluded = [Category, MediaObject, Lift, MountainArea, SkiSlope, Snowpark];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new SkiSlopeConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToSkiSlopeObject,
      this.validate
    );
  };

  getSkiSlopeCategories = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Category];
      const typesInIncluded = [Agent, Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new SkiSlopeConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToSkiSlopeCategories,
      this.validate
    );
  };

  getSkiSlopeConnections = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Lift, MountainArea, SkiSlope, Snowpark];
      const typesInIncluded = [Category, Feature, MediaObject, Lift, MountainArea, SkiSlope, Snowpark];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new SkiSlopeConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToSkiSlopeConnections,
      this.validate
    );
  };

  getSkiSlopeMultimediaDescriptions = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [MediaObject];
      const typesInIncluded = [Agent, Category];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new SkiSlopeConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToSkiSlopeMultimediaDescriptions,
      this.validate
    );
  };
}

module.exports = {
  SkiSlopesRouter,
};
