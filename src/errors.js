// TODO: add about link to OpenAPI documentation on syntactical errors
// TODO: add detail to syntactical errors
const types = {
  unknownQuery: {
    title: "Query parameter is not supported in the given endpoint",
    status: 400
  },
  badQuery: {
    title: "Query parameter does not have valid values",
    status: 400
  },
  queryConflict: {
    title: "Request contains conflicting queries",
    status: 400
  },
  noCredentials: {
    title: "No credentials were provided.",
    status: 401
  },
  credentialsRejected: {
    title: "Credentials rejected.",
    status: 401
  },
  notFound: {
    title: "Resource(s) not found.",
    status: 404
  },
  pageNotFound: {
    title: "Page not found",
    status: 404
  },
  serverFailed: {
    title: "Server failed to respond.",
    status: 500
  },
  gatewayFailed: {
    title: "Request to the gateway failed.",
    status: 500
  },
  cantValidate: {
    title: "Server failed to validate response.",
    status: 500
  },
  cantSerialize: {
    title: "Server failed to serialize response.",
    status: 500
  },
  cantTransform: {
    title: "Server failed to transform gateway's response.",
    status: 500
  },
  notImplemented: {
    title: "The route has not been implemented yet.",
    status: 501
  },
  gatewayUnavailable: {
    title: "Gateway is currently unavailable.",
    status: 503
  },
  gatewayTimeout: {
    title: "Request to the gateway timed out.",
    status: 504
  }
}

function throwUnknownQuery(description) {
  const newError = Object.assign({ description }, types.unknownQuery)
  throw newError
}

function throwBadQuery(description) {
  const newError = Object.assign({ description }, types.badQuery)
  throw newError
}

function throwQueryConflict(description) {
  const newError = Object.assign({ description }, types.queryConflict)
  throw newError
}

function throwPageNotFound(description) {
  const newError = Object.assign({ description }, types.pageNotFound)
  throw newError
}

function getSelfUrl(request) {
  if (request.selfUrl) {
    return request.selfUrl;
  } else {
    return process.env.REF_SERVER_URL + request.originalUrl;
  }
}

function handleError(err, req, res) {
  const errorMessage = {
    errors: [err],
    links: getSelfUrl(req) ? { self: getSelfUrl(req) } : undefined,
  };

  res.status(err.status || 500);
  res.json(errorMessage);
}

function createJSON(err, req) {
  const errorMessage = {
    errors: [err],
    links: getSelfUrl(req) ? { self: getSelfUrl(req) } : undefined,
  };

  return errorMessage;
}

function handleNotImplemented(req, res){
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
};;;;
