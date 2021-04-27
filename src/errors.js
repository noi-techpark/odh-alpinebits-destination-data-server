// TODO: add about link to OpenAPI documentation on syntactical errors
// TODO: add detail to syntactical errors
const types = {
  unknownQuery: {
    title: "Query parameter is not supported in the given endpoint",
    status: 400,
  },
  badQuery: {
    title: "Query parameter does not have valid values",
    status: 400,
  },
  queryConflict: {
    title: "Request contains conflicting queries",
    status: 400,
  },
  noCredentials: {
    title: "No credentials were provided.",
    status: 401,
  },
  credentialsRejected: {
    title: "Credentials rejected.",
    status: 401,
  },
  notFound: {
    title: "Resource(s) not found.",
    status: 404,
  },
  pageNotFound: {
    title: "Page not found",
    status: 404,
  },
  serverFailed: {
    title: "Server failed to respond.",
    status: 500,
  },
  serverFailedToProcessError: {
    title: "Server failed to process an error.",
    status: 500,
  },
  gatewayFailed: {
    title: "Request to the gateway failed.",
    status: 500,
  },
  cantValidate: {
    title: "Server failed to validate response.",
    status: 500,
  },
  cantSerialize: {
    title: "Server failed to serialize response.",
    status: 500,
  },
  cantTransform: {
    title: "Server failed to transform gateway's response.",
    status: 500,
  },
  notImplemented: {
    title: "The route has not been implemented yet.",
    status: 501,
  },
  gatewayUnavailable: {
    title: "Gateway is currently unavailable.",
    status: 503,
  },
  gatewayTimeout: {
    title: "Request to the gateway timed out.",
    status: 504,
  },
};

class DestinationDataError {
  constructor(title, status, description) {
    this.title = title || null;
    this.status = status || null;
    this.description = description || null;
  }

  static throwBadQueryError(description) {
    const { title, status } = types.badQuery;
    throw new DestinationDataError(title, status, description);
  }

  static throwUnknownQueryError(description) {
    const { title, status } = types.unknownQuery;
    throw new DestinationDataError(title, status, description);
  }

  static throwQueryConflictError(description) {
    const { title, status } = types.queryConflict;
    throw new DestinationDataError(title, status, description);
  }

  static throwConnectionError(error) {
    console.log(error);
    let errorType;

    if (error && error.status === 404) {
      console.log("ERROR: page not found at OpenDataHub!");
      errorType = types.notFound;
    } else if (error && error.code === "ENOTFOUND") {
      console.log("ERROR: OpenDataHub API unavailable!");
      errorType = types.gatewayUnavailable;
    } else if (error && error.code === "ECONNABORTED") {
      console.log("ERROR: Connection to the OpenDataHub API aborted!");
      errorType = types.gatewayTimeout;
    } else {
      console.log("ERROR: Could not connect to the OpenDataHub API!");
      errorType = types.serverFailed;
    }

    const { title, status } = errorType;
    throw new DestinationDataError(title, status);
  }

  static throwPageNotFound(meta, links) {
    const { title, status } = types.pageNotFound;
    const error = new DestinationDataError(title, status);

    if (links) {
      const { first, last, prev, next } = links;
      const errorLinks = { first, last, prev, next };

      if (errorLinks.first && errorLinks.last && errorLinks.prev && errorLinks.next) {
        error.links = errorLinks;
        error.description = "Requested page is out of bounds.";
      }
    }

    if (meta) {
      const { count, pages } = meta;
      const errorMeta = { count, pages };

      if (errorMeta.count && errorMeta.pages) {
        error.meta = errorMeta;
      }
    }

    throw error;
  }

  static throwNotFound(description) {
    const { title, status } = types.notFound;
    throw new DestinationDataError(title, status, description);
  }
}

function throwUnknownQuery(description) {
  const newError = Object.assign({}, types.unknownQuery, { description });
  throw newError;
}

function throwBadQuery(description) {
  const newError = Object.assign({}, types.badQuery, { description });
  throw newError;
}

function throwQueryConflict(description) {
  const newError = Object.assign({}, types.queryConflict, { description });
  throw newError;
}

function throwPageNotFound(description) {
  const newError = Object.assign({}, types.pageNotFound, { description });
  throw newError;
}

function getSelfUrl(request) {
  if (request.selfUrl) {
    return request.selfUrl;
  } else {
    return process.env.REF_SERVER_URL + request.originalUrl;
  }
}

function handleError(err, req, res) {
  console.log("  Handling error", err, "");

  const errorMessage = {
    jsonapi: { version: "1.0" },
    links: getSelfUrl(req) ? { self: getSelfUrl(req) } : undefined,
    errors: [err instanceof DestinationDataError ? err : types.serverFailedToProcessError],
  };

  res.status((err && err.status) || 500);
  res.json(errorMessage);
}

function createJSON(err, req) {
  const errorMessage = {
    errors: [err],
    links: getSelfUrl(req) ? { self: getSelfUrl(req) } : undefined,
  };

  return errorMessage;
}

function handleNotImplemented(req, res) {
  handleError(types.notImplemented, req, res);
}

module.exports = {
  ...types,
  handleError,
  handleNotImplemented,
  createJSON,
  throwUnknownQuery,
  throwBadQuery,
  throwQueryConflict,
  throwPageNotFound,
  DestinationDataError,
};
