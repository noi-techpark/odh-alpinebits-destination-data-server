const axios = require('axios');
const { transformEventData } = require ('./transformer/odh2alpinebits');
const { serializeEventData } = require ('./serializer/jsonapi-serializer');
const { validateEventData } = require ('./validator/validator');
const { createOdhQuery } = require ('./odh-query-builder');

const instance = axios.create({
  baseURL: 'http://tourism.opendatahub.bz.it/api',
  timeout: 2000,
  // headers: {'X-Custom-Header': 'foobar'}
});

function getEvents(request) {
  let odhPath = '/Event';
  return getFromServer(odhPath, request);
}

function getEvent(request) {
  let odhPath = '/Event/'+request.params.id;

  return getFromServer(odhPath, request);
}

async function getFromServer(path, request) {
  try {

    console.log('\n> Retrieving data from the OpenDataHub API (http://tourism.opendatahub.bz.it/api)...');
    const fullOdhPath = path + createOdhQuery(request);
    const responseOdh = await instance.get(fullOdhPath);
    const dataOdh = responseOdh.data;
    console.log('OK: Data received.\n');

    console.log('> Transforming data to the AlpineBits format...');
    const dataAlpineBits = transformEventData(dataOdh);

    if(dataAlpineBits) {
      console.log('OK: Sucessfully transformed data.\n');

      console.log('> Validating AlpineBits objects...');
      const validation = validateEventData(dataAlpineBits);
      console.log('OK: Objects validated (valid:'+validation.valid.length+', invalid: '+validation.invalid.length+')\n');

      console.log('> Serializing objects in JSON:API format...');

      const meta = getResponseMeta(dataOdh);
      const dataJsonApi = serializeEventData(dataAlpineBits, request, meta);
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

module.exports.getEvents = getEvents;
module.exports.getEvent = getEvent;
