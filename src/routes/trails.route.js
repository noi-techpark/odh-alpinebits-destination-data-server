const connector = require("../connectors");
const errors = require("../errors");
const {
  parseCollectionRequest,
  parseResourceRequest,
} = require("./request-parser");

module.exports = function (app) {
  app.get("/1.0/trails", function (req, res) {
    try {
      connector
        .getTrails(parseCollectionRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/1.0/trails/:id", function (req, res) {
    try {
      connector
        .getTrailById(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/1.0/trails/:id/connections", function (req, res) {
    errors.handleNotImplemented(req, res);
  });

  app.get("/1.0/trails/:id/multimediaDescriptions", function (req, res) {
    try {
      connector
        .getTrailMedia(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });
};
