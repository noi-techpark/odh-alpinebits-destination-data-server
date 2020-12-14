const connector = require("../connectors");
const errors = require("../errors");
const {
  parseCollectionRequest,
  parseResourceRequest,
} = require("./request-parser");

module.exports = function (app) {
  app.get("/1.0/snowparks", function (req, res) {
    try {
      connector
        .getSnowparks(parseCollectionRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/1.0/snowparks/:id", function (req, res) {
    try {
      connector
        .getSnowparkById(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/1.0/snowparks/:id/connections", function (req, res) {
    errors.handleNotImplemented(req, res);
  });

  app.get("/1.0/snowparks/:id/multimediaDescriptions", function (req, res) {
    try {
      connector
        .getSnowparkMedia(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });
};
