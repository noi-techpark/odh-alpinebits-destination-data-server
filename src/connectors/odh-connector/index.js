const axios = require('axios');
const odh2ab = require ('./odh2alpinebits');
const serializer = require ('./serializer');
const validator = require ('./validator');
const { createOdhQuery } = require ('./odh-query-builder');

const EVENT_PATH = 'Event';

module.exports = {
  getEvents: getResource(EVENT_PATH, odh2ab.transformEventArray, validator.validateEventArray, serializer.serializeEvents),
  getEventById: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializeEvent),
  getSubEvents: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializeSubevents),

  getEventPublisher: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializePublisher),
  getEventSeries: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializeSeries),

  getEventMediaObjects: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializeMediaObjects),
  getEventMediaObjectById: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializeMediaObject),

  getEventContributors: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializeContributors),
  getEventContributorById: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializeContributor),

  getEventOrganizers: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializeOrganizers),
  getEventOrganizerById: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializeOrganizer),

  getEventSponsors: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializeSponsors),
  getEventSponsorById: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializeSponsor),

  getEventVenues: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializeVenues),
  getEventVenueById: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializeVenue),
  getEventVenueGeometries: getSubResource(EVENT_PATH, odh2ab.transformEvent, validator.validateEvent, serializer.serializeGeometries),
}

function getResource (basePath, transform, validate, serialize) { 
  return (
    function(request) {
      return getFromServer(basePath, request, transform, validate, serialize);
    }
  );
}

function getSubResource (basePath, transform, validate, serialize) {
  return (
    function(request) {
      let fullPath = basePath+'/'+request.params.id;
      return getFromServer(fullPath, request, transform, validate, serialize);
    }
  );
}

/*
transform(openDataHubObject): a function to transform an OpenDataHub response into the AlpineBits format
  input: an object retrieved from the OpenDataHub API
  output: an obejct following the AlpineBits format

validate(alpineBitsObject): a function to validate an AlpineBits object
  input: an obejct following the AlpineBits format
  output: an object with validation results {valid: [], invalid: []}

serialize(alpineBitsObject): a function to serialize an AlpineBits object following the JSON:API standard
  input: an obejct following the AlpineBits format
  output: an JSON:API compliant object
*/

async function getFromServer(path, request, transform, validate, serialize) {
  try {
    const instance = axios.create({
      baseURL: 'http://tourism.opendatahub.bz.it/api/',
      timeout: 2000,
    });

    console.log('\n> Retrieving data from the OpenDataHub API (http://tourism.opendatahub.bz.it/api)...');
    const fullOdhPath = path + createOdhQuery(request);
    const responseOdh = await instance.get(fullOdhPath);
    const dataOdh = responseOdh.data;
    console.log('OK: Data received.\n');

    console.log('> Transforming data to the AlpineBits format...');
    const dataAlpineBits = transform(dataOdh);

    if(dataAlpineBits) {
      console.log('OK: Sucessfully transformed data.\n');

      console.log('> Validating AlpineBits objects...');
      const validation = validate(dataAlpineBits);
      console.log('OK: Objects validated (valid:'+validation.valid.length+', invalid: '+validation.invalid.length+')\n');

      console.log('> Serializing objects in JSON:API format...');

      const meta = getResponseMeta(dataOdh);
      const dataJsonApi = serialize(dataAlpineBits, request, meta);
      console.log('OK: Sucessfully serialized objects.\n');

      return dataJsonApi;
    }
    else {
      console.log('ERROR: Failed to transform the input data!\n');
      return null;
    }

  }
  catch (error) {
    console.log(error);
  }
}

function getResponseMeta(dataOdh){
  let count = dataOdh.TotalResults;
  let current = dataOdh.CurrentPage;
  let last = pages = dataOdh.TotalPages;
  let prev = current > 1 ? current-1 : 1;
  let next = current < last ? current+1 : last;
  let first = 1;

  return ({
    page: {
      current,
      first,
      last,
      prev,
      next,
      pages,
      count,
    }
  });
}
