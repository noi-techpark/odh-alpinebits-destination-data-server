const errors = require("./../errors");

class Router {
  constructor() {
    this.getRoutes = {};
  }

  addGetRoute(path, fetchFn) {
    this.getRoutes[path] = (request, response) => {
      try {
        fetchFn(request, null)
          .then((data) => response.json(data))
          .catch((error) => errors.handleError(error, request, response));
      } catch (error) {
        errors.handleError(error, request, response);
      }
    };
  }

  addGetUnimplementedRoute(path) {
    this.getRoutes[path] = (request, response) => errors.handleNotImplemented(request, response);
  }

  installRoutes(app) {
    Object.entries(this.getRoutes).forEach(([path, routeFn]) => app.get(path, routeFn));
  }
}

module.exports = {
  Router,
};
