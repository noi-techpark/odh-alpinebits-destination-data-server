const errors = require('../messages/errors');

function handleNotImplemented(req, res){
  let error = errors.notImplemented;
  res.status(error.status);
  res.json(errors.createResponse(error));
}

module.exports = function(app) {
  app.get('/api/v1/eventSeries', function(req, res) {
    handleNotImplemented(req,res);
  });

  app.get('/api/v1/eventSeries/:id', function(req, res) {
    handleNotImplemented(req,res);
  });
}
