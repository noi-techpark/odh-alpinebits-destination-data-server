require("custom-env").env();
const _ = require("lodash");

const types = {
  unknownQuery: {
    title: "Query parameter is not supported in the given endpoint",
    status: 400,
  },
  badQuery: {
    title: "Query parameter contains bad values",
    status: 400,
  },
  badMessage: {
    title: "Request body failed schema validation",
    status: 400,
  },
  queryConflict: {
    title: "Request contains conflicting queries",
    status: 400,
  },
  unableToDelete: {
    title:
      "Unable to delete due to required dependencies from other resources.",
    status: 400,
  },
  idConflict: {
    title: "Resource ID already in use.",
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
  badDatabaseQuerySyntax: {
    title: "The server-generated database query contains syntactical errors.",
    status: 500,
  },
  unexpectedDatabaseError: {
    title: "Unexpected error while accessing the database.",
    status: 500,
  },
  databaseConstraintViolation: {
    title:
      "The server-generated database query caused a internal constraint violation.",
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
    this.description = description;
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

      if (
        errorLinks.first &&
        errorLinks.last &&
        errorLinks.prev &&
        errorLinks.next
      ) {
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

  static throwBadMessage(description, errors, schema) {
    const { title, status } = types.badMessage;
    const exception = new DestinationDataError(title, status, description);

    exception.errors = errors || undefined;
    exception.schema = schema || undefined;

    throw exception;
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
  console.log("Handling error", err, "");

  const dbErr = checkDbError(err, req, res);

  if (!_.isEqual(dbErr, err)) {
    console.log(
      `Database error error detected
        Code: '${err?.code}'
        Severity: '${err?.severity}'
        Hint: '${err?.hint}'
        `
    );
    err = dbErr;
  }

  const links = {
    self: getSelfUrl(req) ? getSelfUrl(req) : undefined,
    swagger: process.env.SWAGGER_URL,
  };

  const errorMessage = {
    jsonapi: { version: "1.0" },
    links,
    errors: [
      "status" in err && "title" in err
        ? err
        : types.serverFailedToProcessError,
    ],
  };

  res.status(errorMessage.errors[0].status);
  res.json(errorMessage);
}

function checkDbError(err, req, res) {
  if (err?.code?.match(/^23503/)) {
    err = { ...types.unableToDelete };
  } else if (err?.code?.match(/^23505/)) {
    err = { ...types.idConflict };
  } else if (err?.code?.match(/^23\S{3}/)) {
    err = { ...types.databaseConstraintViolation };
  } else if (err?.code?.match(/^42\S{3}/)) {
    err = { ...types.badDatabaseQuerySyntax };
  } else if (err?.code?.match(/^\S{5}/) && err?.severity === "ERROR") {
    err = { ...types.unexpectedDatabaseError };
  }

  return err;
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
