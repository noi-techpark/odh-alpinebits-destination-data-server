function getBaseUrl(req) {
  return process.env.REF_SERVER_URL + '/api/v1';
}

function getSelfUrl(req) {
  return  process.env.REF_SERVER_URL + req.originalUrl;
}

function createRequest(req){
  return ({
    baseUrl: getBaseUrl(req),
    selfUrl: getSelfUrl(req),
    params: req.params,
    query: {
      include: {},
      fields: {}
    }
  });
}

//TODO: VALIDATE QUERY PARAMETERS (only exisitng parameters, parameter values)
function parsePage(req) {
  const { page } = req.query;

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
function parseInclude(req) {
  const { include } = req.query;

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

function parseFields(req) {
  let { fields } = req.query;

  if(!fields)
    return {};

  let result = {}
  Object.keys(fields).forEach( fieldName => {
    result[fieldName] = fields[fieldName].split(",")
  });

  return result;
}

function parseResourceRequest(req) {
  let parsedRequest = createRequest(req);

  parsedRequest.query.fields = parseFields(req);
  parsedRequest.query.include = parseInclude(req);

  return parsedRequest;
}

function parseCollectionRequest(req) {
  let parsedRequest = createRequest(req);

  parsedRequest.query.page = parsePage(req);
  parsedRequest.query.fields = parseFields(req);
  parsedRequest.query.include = parseInclude(req);
  return parsedRequest;
}

module.exports.parseResourceRequest = parseResourceRequest;
module.exports.parseCollectionRequest = parseCollectionRequest;
module.exports.getBaseUrl = getBaseUrl;
module.exports.getSelfUrl = getSelfUrl;
