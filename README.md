# AlpineBits DestinationData Server

This is a reference implementation for an [AlpineBits](https://www.alpinebits.org/) DestinationData server.

The server exposes data from the [OpenDataHub API](http://tourism.opendatahub.bz.it/) in accordance to the AlpineBits format.

To learn what endpoints and features from the AlpineBits DestinationData standard are implemented in the reference server, visit its [OpenAPI documentation](https://github.com/claudenirmf/odh-alpinebits-dd-openapi) where you can also find a Swagger page to interact with the running server.

### Install

To install the required dependencies, run:

```
npm install
```

### Setup

The server requires an `.env` file from which it loads general configurations.

You can reuse `.env.example` or create your own.

To use `.env.example`, run:

```
cp .evn.example .env
```

### Run

To run the server, execute:

```
npm run server
```

We set up the server to listen to HTTP request on the port 8080.

### Test

To run the **end-to-end** tests, run:
```
npm run test
```

### Server Deployment

To deploy the server with Docker, run:
```
docker-compose build
docker-compose start
```

*Note:*

* *The server needs to be running for these tests to be properly executed.*

* *These commands must be executed from within the project's folder.*

* *Please set the environment variables as you need within the '.env' file.*

* *The whole test suite may take between 15 and 25 seconds to be executed, as it makes multiple HTTP requests to the OpenDataHub API.*

For the tests, we are using the [Jest](https://jestjs.io/) framework.
