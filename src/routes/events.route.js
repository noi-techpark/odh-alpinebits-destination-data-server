const connector = require("../connectors");
const errors = require("../errors");

module.exports = function (app) {
  app.get(`/${process.env.API_VERSION}/events`, function (req, res) {
    try {
      connector
        .getEvents(req, null)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/events/:id`, function (req, res) {
    try {
      connector
        .getEventById(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/events/:id/categories`, function (req, res) {
    try {
      connector
        .getEventCategories(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });
  
  app.get(`/${process.env.API_VERSION}/events/:id/contributors`, function (req, res) {
    try {
      connector
        .getEventContributors(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/events/:id/multimediaDescriptions`, function (req, res) {
    try {
      connector
        .getEventMultimediaDescriptions(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/events/:id/organizers`, function (req, res) {
    try {
      connector
        .getEventOrganizers(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/events/:id/publisher`, function (req, res) {
    try {
      connector
        .getEventPublisher(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/events/:id/series`, function (req, res) {
    try {
      connector
        .getEventEventSeries(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/events/:id/sponsors`, function (req, res) {
    try {
      connector
        .getEventSponsors(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/events/:id/subEvents`, function (req, res) {
    try {
      connector
        .getEventSubEvents(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get(`/${process.env.API_VERSION}/events/:id/venues`, function (req, res) {
    try {
      connector
        .getEventVenues(req)
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });
};
