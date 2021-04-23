const { Router } = require("./router");
const { LiftConnector } = require("./../connectors/lift_connector");
const { Agent } = require("./../model/destinationdata/agents");
const { Category } = require("./../model/destinationdata/category");
const { Lift } = require("../model/destinationdata/lift");
const { MediaObject } = require("./../model/destinationdata/media_object");
const { MountainArea } = require("../model/destinationdata/mountain_area");
const { SkiSlope } = require("../model/destinationdata/ski_slope");
const { Snowpark } = require("../model/destinationdata/snowpark");
const responseTransform = require("../model/odh2destinationdata/response_transform");
const requestTransform = require("../model/request2odh/request_transform");
const { Feature } = require("../model/destinationdata/feature");

class LiftsRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(`/lifts`, this.getLifts);
    this.addGetRoute(`/lifts/:id`, this.getLiftById);
    this.addGetRoute(`/lifts/:id/categories`, this.getLiftCategories);
    this.addGetRoute(`/lifts/:id/connections`, this.getLiftConnections);
    this.addGetRoute(`/lifts/:id/multimediaDescriptions`, this.getLiftMultimediaDescriptions);

    if (app) {
      this.installRoutes(app);
    }
  }

  getLifts = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Lift];
      const typesInIncluded = [Category, MediaObject, Lift, MountainArea, SkiSlope, Snowpark];
      const supportedFeatures = ["include", "fields", "filter", "page", "random", "search", "sort"];
      return this.parseRequest(request, typesInData, typesInIncluded, supportedFeatures);
    };
    const fetchFn = (parsedRequest) =>
      new LiftConnector(parsedRequest, requestTransform.transformGetLiftsRequest).fetch();

    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToLiftCollection,
      this.validate
    );
  };

  getLiftById = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Lift];
      const typesInIncluded = [Category, MediaObject, Lift, MountainArea, SkiSlope, Snowpark];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new LiftConnector(parsedRequest, null).fetch();

    return this.handleRequest(request, parseRequestFn, fetchFn, responseTransform.transformToLiftObject, this.validate);
  };

  getLiftCategories = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Category];
      const typesInIncluded = [Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
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

  getLiftConnections = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Lift, MountainArea, SkiSlope, Snowpark];
      const typesInIncluded = [Category, Feature, MediaObject, Lift, MountainArea, SkiSlope, Snowpark];
      return this.parseRequest(request, typesInData, typesInIncluded);
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

  getLiftMultimediaDescriptions = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [MediaObject];
      const typesInIncluded = [Agent, Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
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
  LiftsRouter,
};
