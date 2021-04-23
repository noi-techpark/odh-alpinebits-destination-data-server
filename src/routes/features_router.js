const { Router } = require("./router");
const { Agent } = require("./../model/destinationdata/agents");
const { Feature } = require("./../model/destinationdata/feature");
const { MediaObject } = require("./../model/destinationdata/media_object");
const responseTransform = require("../model/odh2destinationdata/response_transform");
const { Category } = require("../model/destinationdata/category");

class FeaturesRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(`/features`, this.getFeatures);
    this.addGetRoute(`/features/:id`, this.getFeatureById);
    this.addGetRoute(`/features/:id/children`, this.getFeatureChildren);
    this.addGetRoute(`/features/:id/multimediaDescriptions`, this.getFeatureMultimediaDescriptions);
    this.addGetRoute(`/features/:id/parents`, this.getFeatureParents);

    if (app) {
      this.installRoutes(app);
    }
  }

  getFeatures = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Feature];
      const typesInIncluded = [Feature, MediaObject];
      const supportedFeatures = ["include", "fields", "page"];
      return this.parseRequest(request, typesInData, typesInIncluded, supportedFeatures);
    };
    const fetchFn = () => [];
    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToFeatureCollection,
      this.validate
    );
  };

  getFeatureById = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Feature];
      const typesInIncluded = [Feature, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = () => null;
    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToFeatureObject,
      this.validate
    );
  };

  getFeatureChildren = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Feature];
      const typesInIncluded = [Feature, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = () => [];
    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToFeatureChildren,
      this.validate
    );
  };

  getFeatureMultimediaDescriptions = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [MediaObject];
      const typesInIncluded = [Agent, Category];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = () => [];
    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToFeatureMultimediaDescriptions,
      this.validate
    );
  };

  getFeatureParents = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Feature];
      const typesInIncluded = [Feature, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = () => [];
    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToFeatureParents,
      this.validate
    );
  };
}

module.exports = {
  FeaturesRouter,
};
