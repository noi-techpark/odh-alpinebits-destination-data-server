const connector = require("../connectors");
const { Connector } = require("../connectors");
const errors = require("../errors");
const {
  parseCollectionRequest,
  parseResourceRequest,
} = require("./request-parser");

module.exports = function (app) {
  app.get(`/${process.env.API_VERSION}/lifts`, function (req, res) {
    try {
      connector
        .getLifts(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/lifts/:id`, function (req, res) {
    try {
      connector
        .getLiftById(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/lifts/:id/categories`, function (req, res) {
    try {
      connector
        .getLiftCategories(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/lifts/:id/connections`, function (req, res) {
    try {
      connector
        .getLiftConnections(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/lifts/:id/multimediaDescriptions`, function (req, res) {
    try {
      connector
        .getLiftMultimediaDescriptions(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });
};
