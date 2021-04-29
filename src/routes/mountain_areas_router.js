const { Router } = require("./router");
const { MountainAreaConnector } = require("./../connectors/mountain_area_connector");
const { Agent } = require("./../model/destinationdata/agents");
const { Category } = require("./../model/destinationdata/category");
const { Lift } = require("../model/destinationdata/lift");
const { MediaObject } = require("./../model/destinationdata/media_object");
const { MountainArea } = require("../model/destinationdata/mountain_area");
const { SkiSlope } = require("../model/destinationdata/ski_slope");
const { Snowpark } = require("../model/destinationdata/snowpark");
const responseTransform = require("../model/odh2destinationdata/response_transform");
const { Feature } = require("../model/destinationdata/feature");

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
      const typesInData = [MountainArea];
      const typesInIncluded = [Agent, Category, Lift, MediaObject, MountainArea, SkiSlope, Snowpark];
      // TODO: Add additional features (filter, sort)
      const supportedFeatures = ["include", "fields", "page"];
      return this.parseRequest(request, typesInData, typesInIncluded, supportedFeatures);
    };

    const fetchFn = (parsedRequest) => new MountainAreaConnector(parsedRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToMountainAreaCollection,
      this.validate
    );
  };

  getMountainAreaById = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [MountainArea];
      const typesInIncluded = [Agent, Category, Lift, MediaObject, MountainArea, SkiSlope, Snowpark];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new MountainAreaConnector(parsedRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToMountainAreaObject,
      this.validate
    );
  };

  getAreaOwner = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Category];
      const typesInIncluded = [Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new MountainAreaConnector(parsedRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToMountainAreaAreaOwner,
      this.validate
    );
  };

  getCategories = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Category];
      const typesInIncluded = [Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new MountainAreaConnector(parsedRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToMountainAreaCategories,
      this.validate
    );
  };

  getConnections = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Lift, MountainArea, SkiSlope, Snowpark];
      const typesInIncluded = [Agent, Category, Feature, Lift, MediaObject, MountainArea, SkiSlope, Snowpark];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new MountainAreaConnector(parsedRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToMountainAreaConnections,
      this.validate
    );
  };

  getLifts = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Lift, MountainArea, SkiSlope, Snowpark];
      const typesInIncluded = [Agent, Category, Feature, Lift, MediaObject, MountainArea, SkiSlope, Snowpark];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new MountainAreaConnector(parsedRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToMountainAreaLifts,
      this.validate
    );
  };

  getMultimediaDescriptions = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [MediaObject];
      const typesInIncluded = [Agent, Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new MountainAreaConnector(parsedRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToMountainAreaMultimediaDescriptions,
      this.validate
    );
  };

  getSubAreas = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Lift, MountainArea, SkiSlope, Snowpark];
      const typesInIncluded = [Agent, Category, Feature, Lift, MediaObject, MountainArea, SkiSlope, Snowpark];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new MountainAreaConnector(parsedRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToMountainAreaSubAreas,
      this.validate
    );
  };

  getSkiSlopes = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Lift, MountainArea, SkiSlope, Snowpark];
      const typesInIncluded = [Agent, Category, Feature, Lift, MediaObject, MountainArea, SkiSlope, Snowpark];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new MountainAreaConnector(parsedRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToMountainAreaSkiSlopes,
      this.validate
    );
  };

  getSnowparks = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Lift, MountainArea, SkiSlope, Snowpark];
      const typesInIncluded = [Agent, Category, Feature, Lift, MediaObject, MountainArea, SkiSlope, Snowpark];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new MountainAreaConnector(parsedRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToMountainAreaSnowparks,
      this.validate
    );
  };
}

module.exports = {
  MountainAreasRouter,
};
