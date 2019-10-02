const types = {
  notFound: {
    title: "Resource(s) not found.",
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

function createResponse(error){
  return ({
    errors: [ error ]
  });
}

module.exports = {
  ...types,
  createResponse
}
