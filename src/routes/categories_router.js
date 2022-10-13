const { Router } = require("./router");
const { CategoryConnector } = require("../connectors/category_connector");
const { deserializeCategory } = require("../model/destinationdata2022");

class CategoriesRouter extends Router {
  constructor(app) {
    super();

    this.addPostRoute(`/categories`, this.postCategory);
    this.addGetRoute(`/categories`, this.getCategories);
    this.addGetRoute(`/categories/:id`, this.getCategoryById);
    this.addDeleteRoute(`/categories/:id`, this.deleteCategory);
    this.addPatchRoute(`/categories/:id`, this.patchCategory);

    this.addGetRoute(`/categories/:id/children`, this.getCategoryChildren);
    this.addGetRoute(
      `/categories/:id/multimediaDescriptions`,
      this.getCategoryMultimediaDescriptions
    );
    this.addGetRoute(`/categories/:id/parents`, this.getCategoryParents);

    if (app) {
      this.installRoutes(app);
    }
  }

  postCategory = (request) =>
    this.postResource(request, CategoryConnector, deserializeCategory);

  getCategories = (request) => this.getResources(request, CategoryConnector);

  getCategoryById = (request) =>
    this.getResourceById(request, CategoryConnector);

  deleteCategory = (request) => this.deleteResource(request, CategoryConnector);

  patchCategory = (request) =>
    this.patchResource(request, CategoryConnector, deserializeCategory);

  validate(categoryMessage) {
    console.log("The category message HAS NOT BEEN validated.");
  }

  getCategoryChildren = async (request) => {
    const fnRetrieveCategories = (category, parsedRequest) =>
      new CategoryConnector(parsedRequest).retrieveCategoryChildren(category);
    return this.getResourceRelationshipToMany(
      request,
      CategoryConnector,
      fnRetrieveCategories
    );
  };

  getCategoryMultimediaDescriptions = async (request) =>
    this.getResourceMultimediaDescriptions(request, CategoryConnector);

  getCategoryParents = async (request) => {
    const fnRetrieveCategories = (category, parsedRequest) =>
      new CategoryConnector(parsedRequest).retrieveCategoryParents(category);
    return this.getResourceRelationshipToMany(
      request,
      CategoryConnector,
      fnRetrieveCategories
    );
  };
}

module.exports = {
  CategoriesRouter,
};
