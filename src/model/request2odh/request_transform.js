const _ = require("lodash");
const objectPath = require("object-path");
const categoriesData = require("./../../../data/categories.data");

function transformGetCollectionRequest(request, extractQueryFunctions) {
  // TODO: update queries mapping/transformation to ODH
  const queries = [];
  const { id } = request.params;

  if (!id && Array.isArray(extractQueryFunctions)) {
    extractQueryFunctions.forEach((extractFunction) => extractFunction(queries, request));
  }

  return queries ? queries.join("&") : null;
}

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
  if (sort === "startDate") {
    queriesArray.push(`sort=asc`);
  } else {
    // if no sorting is requested or if "-startDate" is request, sort by descending startDate
    // "rawsort" doesn't seem to work at the moment
    queriesArray.push(`sort=desc`);
  }
}

function orFilter(filters) {
  if (!Array.isArray(filters) || _.isEmpty(filters)) {
    return "";
  }
  if (filters.length === 1) {
    return filters[0];
  } else {
    return `or(${filters.join(",")})`;
  }
}

function andFilter(filters) {
  if (!Array.isArray(filters) || _.isEmpty(filters)) {
    return "";
  }
  if (filters.length === 1) {
    return filters[0];
  } else {
    return `and(${filters.join(",")})`;
  }
}

function eventFilterCategoriesAll(categoryIds, rawFilters) {
  const idFilters = categoryIds
    .split(",")
    .map((categoryId) => categoriesData.categoriesToOdhIds[categoryId])
    .filter((id) => !!id)
    .map((id) => `in(Topics.[].TopicRID,"${id}")`);
  rawFilters.push(andFilter(idFilters));
}

function eventFilterCategoriesAny(categoryIds, rawFilters) {
  const idFilters = categoryIds
    .split(",")
    .map((categoryId) => categoriesData.categoriesToOdhIds[categoryId])
    .filter((id) => !!id)
    .map((id) => `in(Topics.[].TopicRID,"${id}")`);
  rawFilters.push(orFilter(idFilters));
}

function activityFilterCategoriesAll(categoryIds, rawFilters) {
  const idFilters = categoryIds
    .split(",")
    .map((categoryId) => categoriesData.categoriesToOdhIds[categoryId])
    .filter((id) => !!id)
    .map((id) => `in(ODHTags.[].Id,"${id.toLowerCase()}")`);
  rawFilters.push(andFilter(idFilters));
}

function activityFilterCategoriesAny(categoryIds, rawFilters) {
  const idFilters = categoryIds
    .split(",")
    .map((categoryId) => categoriesData.categoriesToOdhIds[categoryId])
    .filter((id) => !!id)
    .map((id) => `in(ODHTags.[].Id,"${id}")`);
  rawFilters.push(orFilter(idFilters));
}

function extractEventFilter(queriesArray, request) {
  const { filter } = request.query;
  const rawFilters = [];

  if (filter) {
    if (objectPath.has(filter, "categories.all")) {
      eventFilterCategoriesAll(objectPath.get(filter, "categories.all", ""), rawFilters);
    }

    if (objectPath.has(filter, "categories.any")) {
      eventFilterCategoriesAny(objectPath.get(filter, "categories.any", ""), rawFilters);
    }
  }

  if (!_.isEmpty(rawFilters)) {
    queriesArray.push(`rawfilter=${andFilter(rawFilters)}`);
  }
}

function extractActivityFilter(queriesArray, request) {
  const { filter } = request.query;
  const rawFilters = [];

  if (filter) {
    if (objectPath.has(filter, "categories.all")) {
      activityFilterCategoriesAll(objectPath.get(filter, "categories.all", ""), rawFilters);
    }

    if (objectPath.has(filter, "categories.any")) {
      activityFilterCategoriesAny(objectPath.get(filter, "categories.any", ""), rawFilters);
    }
  }

  if (!_.isEmpty(rawFilters)) {
    queriesArray.push(`rawfilter=${andFilter(rawFilters)}`);
  }
}

// TODO: update queries mapping/transformation to ODH
transformGetEventsRequest = (request) =>
  transformGetCollectionRequest(request, [
    extractOdhPageNumber,
    extractOdhPageSize,
    extractEventSort,
    extractEventFilter,
  ]);

// TODO: update queries mapping/transformation to ODH
transformGetLiftsRequest = (request) =>
  transformGetCollectionRequest(request, [extractOdhPageNumber, extractOdhPageSize, extractActivityFilter]);

// TODO: update queries mapping/transformation to ODH
transformGetSkiSlopesRequest = (request) =>
  transformGetCollectionRequest(request, [extractOdhPageNumber, extractOdhPageSize, extractActivityFilter]);

// TODO: update queries mapping/transformation to ODH
transformGetSnowparksRequest = (request) =>
  transformGetCollectionRequest(request, [extractOdhPageNumber, extractOdhPageSize, extractActivityFilter]);

module.exports = {
  transformGetEventsRequest,
  transformGetLiftsRequest,
  transformGetSkiSlopesRequest,
  transformGetSnowparksRequest,
};
