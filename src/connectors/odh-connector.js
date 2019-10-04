const axios = require('axios');
const odh2ab = require ('../transformers/odh2alpinebits');
const errors = require ('../messages/errors');

const EVENT_PATH = 'Event';
const ACTIVITY_PATH = 'Activity';

function fetchEvents (request) {
  let path = EVENT_PATH;
  let queryArray = getPaginationQuery(request);

  if(queryArray.length)
    path+="?"+queryArray.join("&");

  return fetch(path, request, odh2ab.transformEventArray)
}

function fetchLifts (request) {
  let queryArray = getPaginationQuery(request);
  queryArray.push('activitytype=512')

  let path = ACTIVITY_PATH+"?"+queryArray.join("&");

  return fetch(path, request, odh2ab.transformLiftArray)
}

function getPaginationQuery(request) {
  const { page } = request.query;
  let pageArray = []

  if (page) {
    if (page.size)
      pageArray.push("pagesize="+page.size);
    if (page.number)
      pageArray.push("pagenumber="+page.number);
  }
  return pageArray;
}

function fetchResourceById(resource, transform) {
  return (
    function(request) {
      let path = resource+'/'+request.params.id;
      return fetch(path, request, transform);
    }
  );
}

function fetchSubResource(resource, transform, field) {
  return (
    function(request) {
      let path = resource+'/'+request.params.id;
      return fetch(path, request, transform, field);
    }
  );
}


/*
transform(openDataHubObject): a function to transform an OpenDataHub response into the AlpineBits format
  input: an object retrieved from the OpenDataHub API
  output: an obejct following the AlpineBits format
*/

async function fetch(path, request, transform, field) {
  const instance = axios.create({
    baseURL: 'http://tourism.opendatahub.bz.it/api/',
    timeout: 60000,
  });

  let res;

  try {
    console.log('\n> Fetching data from the OpenDataHub API (http://tourism.opendatahub.bz.it/api)...');
    res = await instance.get(path);
  }
  catch(error){
    console.log(error);

    if(error.code==='ENOTFOUND'){
      console.log("ERROR: OpenDataHub API unavailable!");
      throw(errors.gatewayUnavailable)
    }

    if(error.code==='ECONNABORTED'){
      console.log("ERROR: Connection to the OpenDataHub API aborted!");
      throw(errors.gatewayTimeout)
    }

    console.log("ERROR: Could not connect to the OpenDataHub API!");
    throw(errors.serverFailed)
  }

  if(!res.data || res.status!==200){
    console.log("ERROR: Resource not found!");
    throw errors.notFound;
  }

  console.log('OK: Data received from the OpenDataHub API.\n');

  try {
    console.log('> Transforming data to the AlpineBits format...');
    const data = transform(res.data);
    console.log('OK: Sucessfully transformed data.\n');
    const meta = getResponseMeta(res.data);

    if(field)
      return { data: data[field], meta };

    return { data, meta };
  }
  catch(error) {
    console.log(error);
    console.log('ERROR: Failed to transform the input data!\n');
    throw errors.cantTransform;
  }
}

function getResponseMeta(dataOdh){
  let count = dataOdh.TotalResults;
  let current = dataOdh.CurrentPage;
  let last = pages = dataOdh.TotalPages;
  let next = (current < last) ? current+1 : last;
  let first = 1;

  let prev = 1;
  if(current > 1) {
    if(current <= last)
      prev = current-1;
    else
      prev = last;
  }

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

module.exports = {
  fetchEvents: fetchEvents,
  fetchEventById: fetchResourceById(EVENT_PATH, odh2ab.transformEvent),
  fetchEventPublisher: fetchSubResource(EVENT_PATH, odh2ab.transformEvent, 'publisher'),
  fetchEventMediaObjects: fetchSubResource(EVENT_PATH, odh2ab.transformEvent, 'multimediaDescriptions'),
  fetchEventOrganizers: fetchSubResource(EVENT_PATH, odh2ab.transformEvent, 'organizers'),
  fetchEventVenues: fetchSubResource(EVENT_PATH, odh2ab.transformEvent, 'venues'),
  fetchLifts: fetchLifts,
  fetchLiftById: fetchResourceById(ACTIVITY_PATH, odh2ab.transformLift),
}
