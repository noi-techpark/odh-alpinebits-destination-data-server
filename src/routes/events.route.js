const connector = require("../connectors");
const errors = require("../errors");
const {
  parseCollectionRequest,
  parseResourceRequest,
} = require("./request-parser");

module.exports = function (app) {
  app.get("/1.0/events", function (req, res) {
    try {
      connector
        .getEvents(parseCollectionRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/1.0/events/:id", function (req, res) {
    try {
      connector
        .getEventById(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/1.0/events/:id/contributors", function (req, res) {
    errors.handleNotImplemented(req, res);
  });

  app.get("/1.0/events/:id/multimediaDescriptions", function (req, res) {
    try {
      connector
        .getEventMedia(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/1.0/events/:id/organizers", function (req, res) {
    try {
      connector
        .getEventOrganizers(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/1.0/events/:id/publisher", function (req, res) {
    try {
      connector
        .getEventPublisher(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/1.0/events/:id/series", function (req, res) {
    errors.handleNotImplemented(req, res);
  });

  app.get("/1.0/events/:id/sponsors", function (req, res) {
    errors.handleNotImplemented(req, res);
  });

  app.get("/1.0/events/:id/subEvents", function (req, res) {
    errors.handleNotImplemented(req, res);
  });

  app.get("/1.0/events/:id/venues", function (req, res) {
    try {
      connector
        .getEventVenues(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/2.0/events", function (req, res) {
    try {
      connector
        .getEvents(parseCollectionRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/2.0/events/:id", function (req, res) {
    try {
      connector
        .getEventById(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/2.0/events/:id/categories", function (req, res) {
    errors.handleNotImplemented(req, res);
  });
  
  app.get("/2.0/events/:id/contributors", function (req, res) {
    errors.handleNotImplemented(req, res);
  });

  app.get("/2.0/events/:id/features", function (req, res) {
    errors.handleNotImplemented(req, res);
  });

  app.get("/2.0/events/:id/multimediaDescriptions", function (req, res) {
    try {
      connector
        .getEventMedia(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/2.0/events/:id/organizers", function (req, res) {
    try {
      connector
        .getEventOrganizers(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/2.0/events/:id/publisher", function (req, res) {
    try {
      connector
        .getEventPublisher(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });

  app.get("/2.0/events/:id/series", function (req, res) {
    errors.handleNotImplemented(req, res);
  });

  app.get("/2.0/events/:id/sponsors", function (req, res) {
    errors.handleNotImplemented(req, res);
  });

  app.get("/2.0/events/:id/subEvents", function (req, res) {
    errors.handleNotImplemented(req, res);
  });

  app.get("/2.0/events/:id/venues", function (req, res) {
    try {
      connector
        .getEventVenues(parseResourceRequest(req))
        .then((data) => res.json(data))
        .catch((error) => errors.handleError(error, req, res));
    } catch (error) {
      errors.handleError(error, req, res);
    }
  });
};
