const { parseInclude, parsePage } = require('./query');

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

function parseResourceRequest(request) {
  let parsedRequest = createRequest(request);

  if(request.query.include)
    parsedRequest.query.include = parseInclude(request);

  return parsedRequest;
}

function parseCollectionRequest(request) {
  let parsedRequest = createRequest(request);

  parsedRequest.query.page = parsePage(request);

  if(request.query.include)
    parsedRequest.query.include = parseInclude(request);

  return parsedRequest;
}

module.exports.parseResourceRequest = parseResourceRequest;
module.exports.parseCollectionRequest = parseCollectionRequest;
