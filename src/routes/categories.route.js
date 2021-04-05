const errors = require('../errors');
const connector = require("../connectors");

module.exports = function(app) {
  app.get(`/${process.env.API_VERSION}/categories`, function (req, res) {
    try {
      connector
        .getCategories(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/categories/:id`, function (req, res) {
    try {
      connector
        .getCategoryById(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/categories/:id/children`, function(req, res) {
    try {
      connector
        .getCategoryChildren(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/categories/:id/multimediaDescriptions`, function(req, res) {
    try {
      connector
        .getCategoryMultimediaDescriptions(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/categories/:id/parents`, function(req, res) {
    try {
      connector
        .getCategoryParents(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });
}
