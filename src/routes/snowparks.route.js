const connector = require("../connectors");
const { Connector } = require("../connectors");
const errors = require("../errors");
const {
  parseCollectionRequest,
  parseResourceRequest,
} = require("./request-parser");

module.exports = function (app) {
  app.get(`/${process.env.API_VERSION}/snowparks`, function (req, res) {
    try {
      connector
        .getSnowparks(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/snowparks/:id`, function (req, res) {
    try {
      connector
        .getSnowparkById(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/snowparks/:id/categories`, function (req, res) {
    try {
      connector
        .getSnowparkCategories(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });
  
  app.get(`/${process.env.API_VERSION}/snowparks/:id/connections`, function (req, res) {
    try {
      connector
        .getSnowparkConnections(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/snowparks/:id/features`, function (req, res) {
    try {
      connector
        .getSnowparkFeatures(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/snowparks/:id/multimediaDescriptions`, function (req, res) {
    try {
      connector
        .getSnowparkMultimediaDescriptions(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });
};
