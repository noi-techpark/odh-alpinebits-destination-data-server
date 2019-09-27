const axios = require('axios');
const odh2ab = require ('../transformers/odh2alpinebits');
const errors = require ('../messages/errors');

const EVENT_PATH = 'Event';

module.exports = {
  fetchEvents: fetchResource(EVENT_PATH, odh2ab.transformEventArray),
  fetchEventById: fetchSubResource(EVENT_PATH, odh2ab.transformEvent),
  fetchEventPublisher: fetchSubResource(EVENT_PATH, odh2ab.transformEvent, 'publisher'),
  fetchEventMediaObjects: fetchSubResource(EVENT_PATH, odh2ab.transformEvent, 'multimediaDescriptions'),
  fetchEventOrganizers: fetchSubResource(EVENT_PATH, odh2ab.transformEvent, 'organizers'),
  fetchEventVenues: fetchSubResource(EVENT_PATH, odh2ab.transformEvent, 'venues'),
}

function fetchResource (basePath, transform) {
  return (
    function(request) {
      return fetch(basePath, request, transform);
    }
  );
}

function fetchSubResource (basePath, transform, field) {
  return (
    function(request) {
      let fullPath = basePath+'/'+request.params.id;
      return fetch(fullPath, request, transform, field);
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
    timeout: 300000,
  });

  console.log('\n> Fetching data from the OpenDataHub API (http://tourism.opendatahub.bz.it/api)...');
  const odhApiPath = getUrl(path, request);
  const res = await instance.get(odhApiPath);
  console.log('OK: Data received from the OpenDataHub API.\n');

  console.log('> Transforming data to the AlpineBits format...');
  const data = transform(res.data);

  if(data) {
    console.log('OK: Sucessfully transformed data.\n');
    const meta = getResponseMeta(res.data);

    if(field)
      return { data: data[field], meta };

    return { data, meta };
  }
  else {
    //CONTINUE HERE!
    console.log('ERROR: Failed to transform the input data!\n');
    throw errors.cantTransform;
  }
}

function getUrl(path, request) {
  const { page } = request.query;
  let odhQuery = []

  if (page) {
    if (page.size)
      odhQuery.push("pagesize="+page.size);
    if (page.number)
      odhQuery.push("pagenumber="+page.number);
  }

  if(odhQuery.length)
    return path+"?"+odhQuery.join("&");

  return path;
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
