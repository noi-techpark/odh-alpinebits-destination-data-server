const errors = require('../errors');
const connector = require("../connectors");
const {
  parseCollectionRequest,
  parseResourceRequest,
} = require("./request-parser");

module.exports = function(app) {
  app.get("/2.0/features", function (req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get("/2.0/features/:id", function (req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/2.0/features/:id/multimediaDescription', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/2.0/features/:id/children', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/2.0/features/:id/parents', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
