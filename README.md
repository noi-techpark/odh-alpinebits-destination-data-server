# AlpineBits DestinationData Server

[![CI/CD](https://github.com/noi-techpark/odh-alpinebits-destination-data-server/actions/workflows/main.yml/badge.svg)](https://github.com/noi-techpark/odh-alpinebits-destination-data-server/actions/workflows/main.yml)

This is a reference implementation for an [AlpineBits](https://www.alpinebits.org/) DestinationData server.

The server exposes data from the [OpenDataHub API](http://tourism.opendatahub.bz.it/) in accordance to the AlpineBits format.

To learn about the available routes, HTTP methods, and features, visit the server's [live documentation](https://swagger.opendatahub.bz.it/?url=https://destinationdata.alpinebits.opendatahub.testingmachine.eu/specification.json).


### Install

To install the required dependencies, run:

```
npm install
```

### Setup

#### Setup Environment Variables

The server requires an `.env` file from which it loads general configurations.

You can reuse `.env.example` or create your own.

To use `.env.example`, run:

```
cp .evn.example .env
```

#### Setup Database (Development)

The server must be connected to a PostgreSQL database. During development, the following commands can be used to get Docker instances of PostgreSQL and PgAdmin running, which will be configured with the variables setup on the `.env` file:

```
npm run db
npm run pgadmin
```

The following commands can be then used to (i) create all necessary tables and views...

```
npm run create-tables
```

...(ii) insert default values (e.g., language codes, and standardized categories)... 

```
npm run insert-defaults
```

... and (iii) to populate the database with data imported from the [OpenDataHub API](http://tourism.opendatahub.bz.it/)

```
npm run import-odh-data
```

### Run

To run the server, execute:

```
npm run server
```

We set up the server to listen to HTTP request on the port 8080.

### Test

To run the tests, you will need to first deploy a local database with sample data (requires Docker), and a server connected to it:
```
npm run test-db
npm run test-server
```

Once the test server is running, execute:
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

* *The whole test suite may take around 35 seconds to be executed.

For the tests, we are using the [Jest](https://jestjs.io/) framework.

