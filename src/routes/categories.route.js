const errors = require('../errors');
const connector = require("../connectors");
const {
  parseCollectionRequest,
  parseResourceRequest,
} = require("./request-parser");

module.exports = function(app) {
  app.get("/1.0/categories", function (req, res) {
    try {
      connector
        .getCategories(parseCollectionRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/1.0/categories/:id", function (req, res) {
    try {
      connector
        .getCategoryById(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get('/1.0/categories/:id/multimediaDescription', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/1.0/categories/:id/children', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/1.0/categories/:id/parents', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
