const types = {
  notImplemented: {
    title: "The route has not been implemented yet.",
    status: 503
  },
  notFound: {
    title: "Resource(s) not found.",
    status: 404
  },
  gatewayTimeout: {
    title: "Request to the gateway timed out.",
    status: 504
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
