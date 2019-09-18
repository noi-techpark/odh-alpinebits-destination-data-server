module.exports = {
  timeout: {
    errors: [
      {
        title: "Data request to the provider's enpoint timed out.",
        status: 504
      }
    ]
  },
  notImplemented: {
    errors: [
      {
        title: "Route currently unavailable.",
        status: 503
      }
    ]
  },
  notFound: {
    errors: [
      {
        title: "Resource(s) not found.",
        status: 404
      }
    ]
  }
}
