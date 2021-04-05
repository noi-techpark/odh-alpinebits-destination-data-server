const connector = require(`../connectors`);
const { Connector } = require("../connectors");
const errors = require("../errors");
const {
  parseCollectionRequest,
  parseResourceRequest,
} = require("./request-parser");

module.exports = function (app) {
  app.get(`/${process.env.API_VERSION}/skiSlopes`, function (req, res) {
    try {
      connector
        .getSkiSlopes(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/skiSlopes/:id`, function (req, res) {
    try {
      connector
        .getSkiSlopeById(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/skiSlopes/:id/categories`, function (req, res) {
    try {
      connector
        .getSkiSlopeCategories(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/skiSlopes/:id/connections`, function (req, res) {
    try {
      connector
        .getSkiSlopeConnections(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/skiSlopes/:id/multimediaDescriptions`, function (req, res) {
    try {
      connector
        .getSkiSlopeMultimediaDescriptions(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });
};
