const { Router } = require("./router");
const connector = require("../connectors");
const prefix = `/${process.env.API_VERSION}`;

class CategoriesRouter extends Router {
  constructor(app) {
    super();

    this.addGetRoute(`${prefix}/categories`, connector.getCategories);
    this.addGetRoute(`${prefix}/categories/:id`, connector.getCategoryById);
    this.addGetRoute(`${prefix}/categories/:id/children`, connector.getCategoryChildren);
    this.addGetRoute(`${prefix}/categories/:id/multimediaDescriptions`, connector.getCategoryMultimediaDescriptions);
    this.addGetRoute(`${prefix}/categories/:id/parents`, connector.getCategoryParents);

    if (app) {
      this.installRoutes(app);
    }
  }
}

module.exports = {
  CategoriesRouter,
};
