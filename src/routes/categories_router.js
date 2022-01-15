const { Router } = require("./router");
const { CategoryConnector } = require("../connectors/destinationdata2022/category_connector");
const { Category } = require("./../model/destinationdata/category");
const { MediaObject } = require("./../model/destinationdata/media_object");
const responseTransform = require("../model/odh2destinationdata/response_transform");
const { deserializeCategory } = require("../model/destinationdata2022");
const { Request } = require("../model/request/request");

class CategoriesRouter extends Router {
  constructor(app) {
    super();

    this.addUnimplementedGetRoute(`/categories/:id/children`); //, this.getCategoryChildren);
    this.addUnimplementedGetRoute(`/categories/:id/multimediaDescriptions`); //, this.getCategoryMultimediaDescriptions);
    this.addUnimplementedGetRoute(`/categories/:id/parents`); //, this.getCategoryParents);

    this.addPostRoute(`/categories`, this.postCategory);
    this.addGetRoute(`/categories`, this.getCategories);
    this.addGetRoute(`/categories/:id`, this.getCategoryById);
    this.addDeleteRoute(`/categories/:id`, this.deleteCategory);
    this.addPatchRoute(`/categories/:id`, this.patchCategory);

    if (app) {
      this.installRoutes(app);
    }
  }

  getCategories = async (request) => {
    // Process request and authentication
    // Retrieve data
    const connector = new CategoryConnector();

    // Return to the client
    try {
      return connector.retrieve();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  getCategoryById = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new CategoryConnector(parsedRequest);

    // Return to the client
    try {
      return connector.retrieve();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  postCategory = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const category = deserializeCategory(body.data);
    const connector = new CategoryConnector();

    // Return to the client
    try {
      return connector.create(category);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  patchCategory = async (request) => {
    // Process request and authentication
    const { body } = request;
    // Validate object
    this.validate(body);
    // Store data
    const category = deserializeCategory(body.data);
    const connector = new CategoryConnector();

    // Return to the client
    try {
      return connector.update(category);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  deleteCategory = async (request) => {
    // Process request and authentication
    // Retrieve data
    const parsedRequest = new Request(request);
    const connector = new CategoryConnector(parsedRequest);
    console.log("delete category");

    // Return to the client
    try {
      return connector.delete();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  validate(categoryMessage) {
    console.log("The category message HAS NOT BEEN validated.");
  }
}

module.exports = {
  CategoriesRouter,
};
