const axios = require('axios');
const { transformEventData } = require ('./transformer/odh2alpinebits');
const serializer = require ('./serializer/jsonapi-serializer');
const { validateEventData } = require ('./validator/validator');
const { createOdhQuery } = require ('./odh-query-builder');

module.exports = {
  getEvents: function (request) {
    let odhPath = '/Event';
    return getFromServer(odhPath, request, transformEventData, validateEventData, serializer.serializeEvent);
  },
  getEvent: getResourceFunction(transformEventData, validateEventData, serializer.serializeEvent),
  getSubEvents: getResourceFunction(transformEventData, validateEventData, serializer.serializeSubevents),

  getEventPublisher: getResourceFunction(transformEventData, validateEventData, serializer.serializePublisher),
  getEventSeries: getResourceFunction(transformEventData, validateEventData, serializer.serializeSeries),

  getEventMediaObjects: getResourceFunction(transformEventData, validateEventData, serializer.serializeMediaObjects),
  getEventMediaObjectById: getResourceFunction(transformEventData, validateEventData, serializer.serializeMediaObject),

  getEventContributors: getResourceFunction(transformEventData, validateEventData, serializer.serializeContributors),
  getEventContributorById: getResourceFunction(transformEventData, validateEventData, serializer.serializeContributor),

  getEventOrganizers: getResourceFunction(transformEventData, validateEventData, serializer.serializeOrganizers),
  getEventOrganizerById: getResourceFunction(transformEventData, validateEventData, serializer.serializeOrganizer),

  getEventSponsors: getResourceFunction(transformEventData, validateEventData, serializer.serializeSponsors),
  getEventSponsorById: getResourceFunction(transformEventData, validateEventData, serializer.serializeSponsor),

  getEventVenues: getResourceFunction(transformEventData, validateEventData, serializer.serializeVenues),
  getEventVenueById: getResourceFunction(transformEventData, validateEventData, serializer.serializeVenue),
  getEventVenueGeometries: getResourceFunction(transformEventData, validateEventData, serializer.serializeGeometries),
}

function getResourceFunction (transform, validate, serialize) {
  return (
    function(request) {
      let odhPath = '/Event/'+request.params.id;
      return getFromServer(odhPath, request, transform, validate, serialize);
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
      baseURL: 'http://tourism.opendatahub.bz.it/api',
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
