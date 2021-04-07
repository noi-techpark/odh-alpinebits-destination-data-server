function extractOdhPageSize(queriesArray, request) {
  const { page } = request.query;
  const pageSize = (page && page.size) || 10;
  if (pageSize) queriesArray.push(`pagesize=${pageSize}`);
}

function extractOdhPageNumber(queriesArray, request) {
  const { page } = request.query;
  const pageNumber = (page && page.number) || 1;
  if (pageNumber) queriesArray.push(`pagenumber=${pageNumber}`);
}

function extractEventSort(queriesArray, request) {
  const { sort } = request.query;
  if (sort) {
    // queriesArray.push(`pagenumber=${pageNumber}`);
  } else {
    // if no sorting is requested, sort by descending startDate
    queriesArray.push(`sort=desc`);
  }
}

function transformGetEventsRequest(request) {
  // TODO: update queries mapping/transformation to ODH

  const queries = [];
  const { id } = request.params;

  if (!id) {
    extractOdhPageSize(queries, request);
    extractOdhPageNumber(queries, request);
    extractEventSort(queries, request);
  }

  return queries ? queries.join("&") : null;
}

function transformGetLiftsRequest(request) {
  // TODO: update queries mapping/transformation to ODH

  const queries = [];
  const { id } = request.params;

  if (!id) {
    // no need to mention lifts' odhtagfilter: fetch already handles that
    extractOdhPageSize(queries, request);
    extractOdhPageNumber(queries, request);
  }

  return queries ? queries.join("&") : null;
}

function transformGetSkiSlopesRequest(request) {
  // TODO: update queries mapping/transformation to ODH

  const queries = [];
  const { id } = request.params;

  if (!id) {
    // no need to mention ski slopes' odhtagfilter: fetch already handles that
    extractOdhPageSize(queries, request);
    extractOdhPageNumber(queries, request);
  }

  return queries ? queries.join("&") : null;
}

function transformGetSnowparksRequest(request) {
  // TODO: update queries mapping/transformation to ODH

  const queries = [];
  const { id } = request.params;

  if (!id) {
    // no need to mention snowparks' odhtagfilter: fetch already handles that
    extractOdhPageSize(queries, request);
    extractOdhPageNumber(queries, request);
  }

  return queries ? queries.join("&") : null;
}

module.exports = {
  transformGetEventsRequest,
  transformGetLiftsRequest,
  transformGetSkiSlopesRequest,
  transformGetSnowparksRequest,
};
