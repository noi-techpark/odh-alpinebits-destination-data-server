const connector = require("../connectors");
const errors = require("../errors");
const {
  parseCollectionRequest,
  parseResourceRequest,
} = require("./request-parser");

module.exports = function (app) {
  app.get(`/${process.env.API_VERSION}/mountainAreas`, function (req, res) {
    try {
      connector
        .getMountainAreas(parseCollectionRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/mountainAreas/:id`, function (req, res) {
    try {
      connector
        .getMountainAreaById(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/mountainAreas/:id/areaOwner`, function (req, res) {
    try {
      connector
        .getMountainAreaOwner(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/mountainAreas/:id/categories`, function (req, res) {
    errors.handleNotImplemented(req, res);
  });

  app.get(`/${process.env.API_VERSION}/mountainAreas/:id/connections`, function (req, res) {
    errors.handleNotImplemented(req, res);
  });

  app.get(`/${process.env.API_VERSION}/mountainAreas/:id/lifts`, function (req, res) {
    try {
      connector
        .getMountainAreaLifts(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/mountainAreas/:id/multimediaDescriptions`, function (req, res) {
    try {
      connector
        .getMountainAreaMedia(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/mountainAreas/:id/snowparks`, function (req, res) {
    try {
      connector
        .getMountainAreaSnowparks(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/mountainAreas/:id/subAreas`, function (req, res) {
    errors.handleNotImplemented(req, res);
  });

  app.get(`/${process.env.API_VERSION}/mountainAreas/:id/skiSlopes`, function (req, res) {
    try {
      connector
        .getMountainAreaTrails(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });
};
