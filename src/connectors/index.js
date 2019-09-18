const serializer = require('../serializer');
const validator = require('../validator');
const connector = require('./odh-connector');

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
  console.log();
  let response;

  try {
    console.log('> Dispatching request to connector...');
    response = await fetch(request);
    console.log('OK: Request completed.\n');
  }
  catch (error) {
    console.log('ERROR: Failed to retrieve data!');
    console.log(error);
  }

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
    return null;
  }

}

module.exports = {
  getEvents: (request) => {
    return handleRequest(request, connector.fetchEvents, validator.validateEventArray, serializer.serializeEvents)
  },
  getEventById: (request) => {
    return handleRequest(request, connector.fetchEventById, validator.validateEvent, serializer.serializeEvent)
  },
  getEventMedia: (request) => {
    return handleRequest(request, connector.fetchEventMedia, validator.validateMediaObjectArray, serializer.serializeMediaObjects)
  },
  getEventPublisher: (request) => {
    return handleRequest(request, connector.fetchEventPublisher, validator.validateAgent, serializer.serializePublisher)
  },
  getEventOrganizers: (request) => {
    return handleRequest(request, connector.fetchEventOrganizers, validator.validateAgentArray, serializer.serializeOrganizers)
  },
  getEventVenues: (request) => {
    return handleRequest(request, connector.fetchEventVenues, validator.validateVenueArray, serializer.serializeVenues)
  }
}
