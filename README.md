# AlpineBits DestinationData Server

This is a reference implementation for an [AlpineBits](https://www.alpinebits.org/) DestinationData server.

The server exposes data from the [OpenDataHub API](http://tourism.opendatahub.bz.it/) in accordance to the AlpineBits format.

The current version of the server accepts HTTP GET requests on the following routes:

* /events
* /events/:id
* /events/:id/multimediaDescriptions
* /events/:id/venues
* /events/:id/publisher
* /events/:id/organizers


### Install

To install the required dependencies, execute:

```
npm install
```

### Run

To run the server, execute:

```
npm run server
```

We set up the server to listen to HTTP request on the port 8080.

### Test

To run the **end-to-end** tests, execute:
```
npm run test
```

*Note that the server needs to be running for these tests to be properly executed.*

For the tests, we are using the [Jest](https://jestjs.io/) framework.
