const { Router } = require("./router");
const { CategoryConnector } = require("../connectors/category_connector");
const { Agent } = require("./../model/destinationdata/agents");
const { Category } = require("./../model/destinationdata/category");
const { MediaObject } = require("./../model/destinationdata/media_object");
const responseTransform = require("../model/odh2destinationdata/response_transform");

class CategoriesRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(`/categories`, this.getCategories);
    this.addGetRoute(`/categories/:id`, this.getCategoryById);
    this.addGetRoute(`/categories/:id/children`, this.getCategoryChildren);
    this.addGetRoute(`/categories/:id/multimediaDescriptions`, this.getCategoryMultimediaDescriptions);
    this.addGetRoute(`/categories/:id/parents`, this.getCategoryParents);

    if (app) {
      this.installRoutes(app);
    }
  }

  getCategories = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Category];
      const typesInIncluded = [Category, MediaObject];
      const supportedFeatures = ["include", "fields", "page"];
      return this.parseRequest(request, typesInData, typesInIncluded, supportedFeatures);
    };
    const fetchFn = (parsedRequest) => new CategoryConnector(parsedRequest).fetch();
    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToCategoryCollection,
      this.validate
    );
  };

  getCategoryById = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Category];
      const typesInIncluded = [Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new CategoryConnector(parsedRequest).fetch();
    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToCategoryObject,
      this.validate
    );
  };

  getCategoryChildren = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Category];
      const typesInIncluded = [Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new CategoryConnector(parsedRequest).fetch();
    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToCategoryChildren,
      this.validate
    );
  };

  getCategoryMultimediaDescriptions = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [MediaObject];
      const typesInIncluded = [Agent, Category];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new CategoryConnector(parsedRequest).fetch();
    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToCategoryMultimediaDescriptions,
      this.validate
    );
  };

  getCategoryParents = (request) => {
    const parseRequestFn = (request) => {
      const typesInData = [Category];
      const typesInIncluded = [Category, MediaObject];
      return this.parseRequest(request, typesInData, typesInIncluded);
    };
    const fetchFn = (parsedRequest) => new CategoryConnector(parsedRequest).fetch();
    return this.handleRequest(
      request,
      parseRequestFn,
      fetchFn,
      responseTransform.transformToCategoryParents,
      this.validate
    );
  };
}

module.exports = {
  CategoriesRouter,
};
