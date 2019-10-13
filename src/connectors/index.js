const serializer = require('../serializer');
const validator = require('../validator');
const odhConnector = require('./odh-connector');
const errors = require('../errors');

/*
fetch(): an asynchronous function to retrieve data from a source data return

validate(alpineBitsObject): a function to validate an AlpineBits object
  input: an obejct following the AlpineBits format
  output: an object with validation results {valid: [], invalid: []}

serialize(alpineBitsObject): a function to serialize an AlpineBits object following the JSON:API standard
  input: an obejct following the AlpineBits format
  output: an JSON:API compliant object
*/

async function handleRequest(request, fetch, validate, serialize) {
  let response;

  try {
    console.log('> Dispatching request to OpenDataHub connector...');
    response = await fetch(request);
    console.log('OK: Request completed.\n');
  }
  catch (error) {
    throw error;
  }

  try {
    console.log('> Validating AlpineBits objects...');
    const validation = validate(response.data);
    console.log('OK: Objects validated (valid:'+validation.valid.length+', invalid: '+validation.invalid.length+')\n');
  }
  catch (error) {
    console.log('ERROR: Failed to validate data!');
    console.log(error);
    throw errors.cantValidate;
  }

  try {
    console.log('> Serializing objects in JSON:API format...');
    const dataJsonApi = serialize(response.data, request, response.meta);
    console.log('OK: Sucessfully serialized objects.\n');
    return dataJsonApi;
  }
  catch (error) {
    console.log('ERROR: Failed to serialize response data!');
    console.log(error);
    throw errors.cantSerialize;
  }
}

module.exports = {
  getEvents: (request) => {
    return handleRequest(request, odhConnector.fetchEvents, validator.validateEventArray, serializer.serializeEvents)
  },
  getEventById: (request) => {
    return handleRequest(request, odhConnector.fetchEventById, validator.validateEvent, serializer.serializeEvent)
  },
  getEventMedia: (request) => {
    return handleRequest(request, odhConnector.fetchEventMediaObjects, validator.validateMediaObjectArray, serializer.serializeMediaObjects)
  },
  getEventPublisher: (request) => {
    return handleRequest(request, odhConnector.fetchEventPublisher, validator.validateAgent, serializer.serializePublisher)
  },
  getEventOrganizers: (request) => {
    return handleRequest(request, odhConnector.fetchEventOrganizers, validator.validateAgentArray, serializer.serializeOrganizers)
  },
  getEventVenues: (request) => {
    return handleRequest(request, odhConnector.fetchEventVenues, validator.validateVenueArray, serializer.serializeVenues)
  },
  getLifts: (request) => {
    return handleRequest(request, odhConnector.fetchLifts, validator.validateLiftArray, serializer.serializeLifts)
  },
  getLiftById: (request) => {
    return handleRequest(request, odhConnector.fetchLiftById, validator.validateLift, serializer.serializeLift)
  },
  getTrails: (request) => {
    return handleRequest(request, odhConnector.fetchTrails, validator.validateTrailArray, serializer.serializeTrails)
  },
  getTrailById: (request) => {
    return handleRequest(request, odhConnector.fetchTrailById, validator.validateTrail, serializer.serializeTrail)
  },
  getTrailMedia: (request) => {
    return handleRequest(request, odhConnector.fetchTrailMediaObjects, validator.validateMediaObjectArray, serializer.serializeMediaObjects)
  },
  getSnowparks: (request) => {
    return handleRequest(request, odhConnector.fetchSnowparks, validator.validateSnowparkArray, serializer.serializeSnowparks)
  },
  getSnowparkById: (request) => {
    return handleRequest(request, odhConnector.fetchSnowparkById, validator.validateSnowpark, serializer.serializeSnowpark)
  }
}
