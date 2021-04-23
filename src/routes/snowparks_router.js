const { Router } = require("./router");
const { SnowparkConnector } = require("./../connectors/snowpark_connector");
const { Agent } = require("./../model/destinationdata/agents");
const { Category } = require("./../model/destinationdata/category");
const { Feature } = require("./../model/destinationdata/feature");
const { Lift } = require("../model/destinationdata/lift");
const { MediaObject } = require("./../model/destinationdata/media_object");
const { MountainArea } = require("../model/destinationdata/mountain_area");
const { SkiSlope } = require("../model/destinationdata/ski_slope");
const { Snowpark } = require("../model/destinationdata/snowpark");
const responseTransform = require("../model/odh2destinationdata/response_transform");
const requestTransform = require("../model/request2odh/request_transform");

class SnowparksRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(`/snowparks`, this.getSnowparks);
    this.addGetRoute(`/snowparks/:id`, this.getSnowparkById);
    this.addGetRoute(`/snowparks/:id/categories`, this.getSnowparkCategories);
    this.addGetRoute(`/snowparks/:id/connections`, this.getSnowparkConnections);
    this.addGetRoute(`/snowparks/:id/features`, this.getSnowparkFeatures);
    this.addGetRoute(`/snowparks/:id/multimediaDescriptions`, this.getSnowparkMultimediaDescriptions);

    if (app) {
      this.installRoutes(app);
    }
  }

  getSnowparks = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Snowpark];
      const typesInIncluded = [Category, Feature, MediaObject, Lift, MountainArea, SkiSlope, Snowpark];
      const supportedFeatures = ["include", "fields", "filter", "page", "random", "search", "sort"];
      return this.parseRequest(request, typesInData, typesInIncluded, supportedFeatures);
    };
    const fetchFn = (parsedRequest) =>
      new SnowparkConnector(parsedRequest, requestTransform.transformGetSnowparksRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToSnowparkCollection,
      this.validate
    );
  };

  getSnowparkById = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Snowpark];
      const typesInIncluded = [Category, Feature, MediaObject, Lift, MountainArea, SkiSlope, Snowpark];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new SnowparkConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToSnowparkObject,
      this.validate
    );
  };

  getSnowparkCategories = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Category];
      const typesInIncluded = [Agent, Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new SnowparkConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToSnowparkCategories,
      this.validate
    );
  };

  getSnowparkConnections = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Lift, MountainArea, SkiSlope, Snowpark];
      const typesInIncluded = [Category, Feature, MediaObject, Lift, MountainArea, SkiSlope, Snowpark];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new SnowparkConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToSnowparkConnections,
      this.validate
    );
  };

  getSnowparkFeatures = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Feature];
      const typesInIncluded = [Feature, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new SnowparkConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToSnowparkFeatures,
      this.validate
    );
  };

  getSnowparkMultimediaDescriptions = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [MediaObject];
      const typesInIncluded = [Agent, Category];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new SnowparkConnector(parsedRequest, null).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToSnowparkMultimediaDescriptions,
      this.validate
    );
  };
}

module.exports = {
  SnowparksRouter,
};
