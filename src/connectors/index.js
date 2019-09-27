const serializer = require('../serializer');
const validator = require('../validator');
const odhConnector = require('./odh-connector');
const errors = require('../messages/errors');

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
    //TODO: improve error handling (e.g. check if this error is indeed a timeout) )
    console.log('ERROR: Failed to retrieve data!');
    console.log(error);
    console.log('Error: ' + error.syscall + ' ' + error.code + ' ' + error.config.url);
    throw errors.gatewayTimeout;
  }

  console.log(response.status, response.data);

  if(!response.data)
    console.log('ERROR: No data was retrieved!\n');

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
  }
}
