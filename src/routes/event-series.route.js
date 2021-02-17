const connector = require ('../connectors');
const errors = require('../errors');
const { parseCollectionRequest, parseResourceRequest } = require('./request-parser');

module.exports = function(app) {
  app.get('/1.0/eventSeries', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/1.0/eventSeries/:id', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/1.0/eventSeries/:id/editions', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/1.0/eventSeries/:id/multimediaDescriptions', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/2.0/eventSeries', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/2.0/eventSeries/:id', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/2.0/eventSeries/:id/categories', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/2.0/eventSeries/:id/editions', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/2.0/eventSeries/:id/features', function(req, res) {
    errors.handleNotImplemented(req,res);
  });

  app.get('/2.0/eventSeries/:id/multimediaDescriptions', function(req, res) {
    errors.handleNotImplemented(req,res);
  });
}
