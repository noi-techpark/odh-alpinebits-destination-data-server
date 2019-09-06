const axios = require('axios');
const { transformEventData } = require ('./transformer/odh2alpinebits');
const { serializeEventData } = require ('./serializer/jsonapi-serializer');
const { validateEventData } = require ('./validator/validator');

const instance = axios.create({
  baseURL: 'http://tourism.opendatahub.bz.it/api',
  timeout: 2000,
  // headers: {'X-Custom-Header': 'foobar'}
});

async function getFromServer(path, request) {
  try {
    console.log('\n> Retrieving data from the OpenDataHub API (http://tourism.opendatahub.bz.it/api)...');
    const response = await instance.get(path, request);
    const dataOdh = response.data;
    console.log('OK: Data received.\n');

    console.log('> Transforming data to the AlpineBits format...');
    const dataAlpineBits = transformEventData(dataOdh);

    if(dataAlpineBits) {
      console.log('OK: Sucessfully transformed data.\n');

      console.log('> Validating AlpineBits objects...');
      const validation = validateEventData(dataAlpineBits);
      console.log('OK: Objects validated (valid:'+validation.valid.length+', invalid: '+validation.invalid.length+')\n');

      console.log('> Serializing objects in JSON:API format...');
      const dataJsonApi = serializeEventData(dataAlpineBits, request);
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

function getEvents(request) {
  return getFromServer('/Event', request);
}

function getEvent(params, request) {
  return getFromServer('/Event/'+params.id, request);
}

module.exports.getEvents = getEvents;
module.exports.getEvent = getEvent;
