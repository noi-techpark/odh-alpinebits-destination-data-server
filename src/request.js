function getBaseUrl(request) {
  return request.protocol + '://' + request.get('host') + '/api/v1';
}

function getSelfUrl(request) {
  return request.protocol + '://' + request.get('host') + request.originalUrl;
}

function createRequest(request){
  return ({
    baseUrl: getBaseUrl(request),
    selfUrl: getSelfUrl(request),
    params: request.params,
    query: {
      include: {},
      fields: {}
    }
  });
}

//TODO: VALIDATE QUERY PARAMETERS (only exisitng parameters, parameter values)
function parsePage(request) {
  const { page } = request.query;

  let result = {
    size: 10,
    number: 1
  }

  if(!page)
    return result;

  if(page.size>0)
    result.size = page.size;

  if(page.number>0)
    result.number = page.number;

  return result;
}

// "include=organizers,venues,venues.geometries => ['organizers','venues','venues.geometries']"
function parseInclude(request) {
  const { include } = request.query;

  let result = {}

  if(!include)
    return result;

  let entries = include.split(',');
  for(i=0; i<entries.length; i++) {

    const fields = entries[i].split('.');
    let container = result;

    for(j=0; j<fields.length; j++) {
      const field = fields[j];

      if(!container[field])
        container[field] = {}

      container = container[field];
    }
  }

  return result;
}

function parseFields(request) {
  let { fields } = request.query;

  if(!fields)
    return {};

  let result = {}
  Object.keys(fields).forEach( fieldName => {
    result[fieldName] = fields[fieldName].split(",")
  });

  return result;
}

function parseResourceRequest(request) {
  let parsedRequest = createRequest(request);

  parsedRequest.query.fields = parseFields(request);
  parsedRequest.query.include = parseInclude(request);

  return parsedRequest;
}

function parseCollectionRequest(request) {
  let parsedRequest = createRequest(request);

  parsedRequest.query.page = parsePage(request);
  parsedRequest.query.fields = parseFields(request);
  parsedRequest.query.include = parseInclude(request);
  console.log(parsedRequest.query.fields);
  return parsedRequest;
}

module.exports.parseResourceRequest = parseResourceRequest;
module.exports.parseCollectionRequest = parseCollectionRequest;
