<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: CC0-1.0
-->

# AlpineBits DestinationData Server

This is a reference implementation for an [AlpineBits](https://www.alpinebits.org/) DestinationData server.

The server exposes data from the [OpenDataHub API](http://tourism.opendatahub.bz.it/) in accordance to the AlpineBits format.

The current version of the server accepts HTTP GET requests on the following routes:

![REUSE Compliance](https://github.com/noi-techpark/odh-alpinebits-destination-data-server/actions/workflows/reuse.yml/badge.svg)
[![CI/CD](https://github.com/noi-techpark/odh-alpinebits-destination-data-server/actions/workflows/main.yml/badge.svg)](https://github.com/noi-techpark/odh-alpinebits-destination-data-server/actions/workflows/main.yml)

* /
* /1.0
* /1.0/events
* /1.0/events/:id
* /1.0/events/:id/multimediaDescriptions
* /1.0/events/:id/venues
* /1.0/events/:id/publisher
* /1.0/events/:id/organizers
* /1.0/eventSeries\*
* /1.0/eventSeries/:id\*
* /1.0/lifts
* /1.0/lifts/:id
* /1.0/lifts/:id/multimediaDescriptions
* /1.0/trails
* /1.0/trails/:id
* /1.0/trails/:id/multimediaDescriptions
* /1.0/snowparks
* /1.0/snowparks/:id
* /1.0/snowparks/:id/multimediaDescriptions
* /1.0/mountainAreas
* /1.0/mountainAreas/:id
* /1.0/mountainAreas/:id/lifts
* /1.0/mountainAreas/:id/trails
* /1.0/mountainAreas/:id/snowparks
* /1.0/mountainAreas/:id/areaOwner
* /1.0/mountainAreas/:id/multimediaDescriptions

\* These routes return dummy data, as they are not currently available on the OpenDataHub API.

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

#### Setup Database

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

