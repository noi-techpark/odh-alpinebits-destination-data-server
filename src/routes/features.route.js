const errors = require('../errors');
const connector = require("../connectors");

module.exports = function(app) {
  app.get(`/${process.env.API_VERSION}/features`, function (req, res) {
    try {
      connector
        .getFeatures(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/features/:id`, function (req, res) {
    try {
      connector
        .getFeatureById(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/features/:id/children`, function(req, res) {
    try {
      connector
        .getFeatureChildren(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/features/:id/multimediaDescription`, function(req, res) {
    try {
      connector
        .getFeatureMultimediaDescriptions(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/features/:id/parents`, function(req, res) {
    try {
      connector
        .getFeatureParents(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });
}
