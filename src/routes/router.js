const errors = require("./../errors");
const { DestinationDataError } = require("./../errors");
const { Request } = require("./../model/request/request");

const version_prefix = `/${process.env.API_VERSION}`;

class Router {
  constructor() {
    this.getRoutes = {};
    this.postRoutes = {};
    this.patchRoutes = {};
    this.deleteRoutes = {};
  }

  addGetRoute(path, handleRequestFn) {
    this.getRoutes[version_prefix + path] = (request, response) => {
      try {
        handleRequestFn(request)
          .then((data) => response.json(data))
          .catch((error) => errors.handleError(error, request, response));
      } catch (error) {
        errors.handleError(error, request, response);
      }
    };
  }

  addPostRoute(path, handleRequestFn) {
    this.postRoutes[version_prefix + path] = (request, response) => {
      try {
        handleRequestFn(request)
          .then((data) => response.json(data))
          .catch((error) => errors.handleError(error, request, response));
      } catch (error) {
        errors.handleError(error, request, response);
      }
    };
  }

  addPostRoute(path, handleRequestFn) {
    this.getRoutes[version_prefix + path] = (request, response) => {
      try {
        handleRequestFn(request)
          .then((data) => response.json(data))
          .catch((error) => errors.handleError(error, request, response));
      } catch (error) {
        errors.handleError(error, request, response);
      }
    };
  }

  addPostRoute(path, handleRequestFn) {
    this.postRoutes[version_prefix + path] = (request, response) => {
      try {
        handleRequestFn(request)
          .then((data) => response.json(data))
          .catch((error) => errors.handleError(error, request, response));
      } catch (error) {
        errors.handleError(error, request, response);
      }
    };
  }

  addUnimplementedGetRoute(path) {
    this.getRoutes[version_prefix + path] = (request, response) => errors.handleNotImplemented(request, response);
  }

  installRoutes(app) {
    Object.entries(this.getRoutes).forEach(([path, routeFn]) => app.get(path, routeFn));
    Object.entries(this.postRoutes).forEach(([path, routeFn]) => app.post(path, routeFn));
    Object.entries(this.patchRoutes).forEach(([path, routeFn]) => app.patch(path, routeFn));
    Object.entries(this.deleteRoutes).forEach(([path, routeFn]) => app.delete(path, routeFn));
  }

  async handleGetRequest(request, requestFn, fetchFn, transformFn, validateFn) {
    console.log("  Validating request...");
    request = requestFn(request);

    console.log("  Fetching data...");
    const sourceData = await fetchFn(request);

    console.log("  Transforming response into DestinationData format...");
    const data = transformFn(sourceData, request);

    console.log("  Validating data...");
    validateFn(request, data);

    console.log("  Request processed, sending to client");

    return data;
  }

  validate(request, data, schema) {
    const { page } = request.query;
    const { number } = page || {};
    const { pages } = data.meta;
    const { id } = request.params;

    if (number && (!pages || number > pages) && !id) {
      // checking for "id" avoids issues with default pagination
      // TODO: remove "!id" from "if"; the request must be rejected earlier if the route does not supported a requested pagination, as well as, setting default pagination only when needed
      const { meta, links } = data;
      DestinationDataError.throwPageNotFound(meta, links);
    }

    if (schema) {
      const validateDataFormat = ajv.compile(schema);
      const isValidAgainstSchema = validateDataFormat(data);

      if (!isValidAgainstSchema) {
        console.error(
          "  The data is not valid against the provided schema",
          JSON.stringify(validateDataFormat.errors, null, 2)
        );
      }
    } else {
      console.error("  Schema validation skipped: no schema provided");
    }
  }

  parseRequest = (request, typesInData, typesInIncluded, supportedFeatures) => {
    const parsedRequest = new Request(request);

    parsedRequest.typesInData = typesInData || [];
    parsedRequest.typesInIncluded = typesInIncluded || [];
    parsedRequest.expectedTypes = [...parsedRequest.typesInData, ...parsedRequest.typesInIncluded];

    if (Array.isArray(supportedFeatures)) {
      Object.keys(parsedRequest.supportedFeatures).forEach((feature) => {
        parsedRequest.supportedFeatures[feature] = supportedFeatures.includes(feature);
      });
    }

    parsedRequest.validate();

    return parsedRequest;
  };
}

module.exports = {
  Router,
};
