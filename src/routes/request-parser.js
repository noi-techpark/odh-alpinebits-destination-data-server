const iso6393to6391 = require("iso-639-3/to-1.json");
const errors = require("../errors");
const { templates } = require("../transformers/odh2alpinebits/templates");

const langValidation = (languageCodes) => {
  if (Array.isArray(languageCodes)) {
    return languageCodes.some(
      (code) => !Array.isArray(code) || !!iso6393to6391[code]
    );
  } else {
    return !!iso6393to6391[languageCodes];
  }
};

const categoriesValidation = (categories) => {
  const regex = /^([a-z]|[A-Z]|[0-9]|-|_)+\/([a-z]|[A-Z]|[0-9]|-|_)+(,(([a-z]|[A-Z]|[0-9]|-|_)+\/([a-z]|[A-Z]|[0-9]|-|_)+))*$/;
  if (Array.isArray(categories)) {
    return categories.some(
      (category) => !Array.isArray(category) || regex.test(categories)
    );
  } else {
    return regex.test(categories);
  }
};

const dateValidation = (date) =>
  !Array.isArray(date) && !isNaN(new Date(date).getTime());

const nearToValidation = (pointsInfo) => {
  if (!Array.isArray(pointsInfo) && typeof pointsInfo !== "string") {
    return false;
  }

  pointsInfo = normalize(pointsInfo);

  if (!Array.isArray(pointsInfo) || pointsInfo.length !== 3) {
    return false;
  }

  const lng = Number(pointsInfo[0]);
  const lat = Number(pointsInfo[1]);
  const dist = Number(pointsInfo[2]);

  return (
    pointsInfo[0] &&
    pointsInfo[1] &&
    pointsInfo[2] &&
    !isNaN(lng) &&
    !isNaN(lat) &&
    Number.isInteger(dist) &&
    dist > 0
  );
};

const organizationValidation = (organizationId) => {
  return typeof organizationId === "string" && organizationId.indexOf(",") < 0;
};

const queryValidation = {
  agents: {},
  events: {
    lang: langValidation,
    categories: (filterQuery) =>
      filterQuery.any && categoriesValidation(filterQuery.any),
    lastUpdate: (filterQuery) =>
      filterQuery.gt && dateValidation(filterQuery.gt),
    venues: (filterQuery) =>
      filterQuery.near && nearToValidation(filterQuery.near),
    endDate: (filterQuery) =>
      filterQuery.gte && dateValidation(filterQuery.gte),
    startDate: (filterQuery) =>
      filterQuery.lte && dateValidation(filterQuery.lte),
    organizers: (filterQuery) =>
      filterQuery.eq && organizationValidation(filterQuery.eq),
  },
  eventSeries: {},
  lifts: {
    lang: langValidation,
    categories: (filterQuery) =>
      filterQuery.any && categoriesValidation(filterQuery.any),
    lastUpdate: (filterQuery) =>
      filterQuery.gt && dateValidation(filterQuery.gt),
    geometries: (filterQuery) =>
      filterQuery.near && nearToValidation(filterQuery.near),
  },
  mediaObjects: {},
  mountainAreas: {},
  snowparks: {
    lang: langValidation,
    lastUpdate: (filterQuery) =>
      filterQuery.gt && dateValidation(filterQuery.gt),
    geometries: (filterQuery) =>
      filterQuery.near && nearToValidation(filterQuery.near),
  },
  trails: {
    lang: langValidation,
    lastUpdate: (filterQuery) =>
      filterQuery.gt && dateValidation(filterQuery.gt),
    geometries: (filterQuery) =>
      filterQuery.near && nearToValidation(filterQuery.near),
  },
  venues: {},
};

function isRepeated(queryValues) {
  return Array.isArray(queryValues);
}

function containsRepeatedValues(queryValues) {
  queryValues = normalize(queryValues);
  for (const value of queryValues) {
    if (queryValues.indexOf(value) !== queryValues.lastIndexOf(value)) {
      return true;
    }
  }
  return false;
}

function normalize(queryValues) {
  queryValues = Array.isArray(queryValues)
    ? queryValues.flatMap((value) => value.split(","))
    : queryValues.split(",");
  return queryValues;
}

function validateResourceRequestQueries(request) {
  if (!request.query) {
    return;
  }

  const { query } = request;
  const specificQueryNames = Object.keys(query);

  for (const queryName of specificQueryNames) {
    switch (queryName) {
      case "include":
        validateIncludeQuery(request);
        break;
      case "fields":
        validateFieldsQuery(request);
        break;
      default:
        errors.throwUnknownQuery(
          `The query parameter "${queryName}" was not recognized for the requested endpoint`
        );
    }
  }
}

function validateCollectionRequestQueries(request) {
  if (!request.query) {
    return;
  }

  const { query } = request;
  const specificQueryNames = Object.keys(query);

  for (const queryName of specificQueryNames) {
    switch (queryName) {
      case "page":
        validatePageQuery(request);
        break;
      case "include":
        validateIncludeQuery(request);
        break;
      case "sort":
        validateSortQuery(request);
        break;
      case "random":
        validateRandomQuery(request);
        break;
      case "search":
        validateSearchQuery(request);
        break;
      case "filter":
        validateFilterQuery(request);
        break;
      case "fields":
        validateFieldsQuery(request);
        break;
      default:
        errors.throwUnknownQuery(
          `The query parameter "${queryName}" was not recognized for the requested endpoint`
        );
    }
  }
}

function validatePageQuery(request) {
  const pageQuery = request.query.page;

  if (typeof pageQuery !== "object") {
    errors.throwBadQuery(`Invalid page query parameter "page=${pageQuery}"`);
  }

  const pageKeys = Object.keys(pageQuery);
  const isValid = (numberInput) =>
    Number.isInteger(Number(numberInput)) && Number(numberInput) > 0;

  for (const key of pageKeys) {
    if ((key !== "size" && key !== "number") || !isValid(pageQuery[key])) {
      errors.throwBadQuery(
        `Invalid page query parameter "page[${key}]${pageQuery[key]}"`
      );
    }
  }
}

function validateIncludeQuery(request) {
  let resourceType = request.path.replace("/1.0/", "");

  if (resourceType.indexOf("/") >= 0) {
    resourceType = resourceType.substring(0, resourceType.indexOf("/"));
  }

  const relationships = templates[resourceType].relationships;

  let includeQuery = request.query.include;

  if (isRepeated(includeQuery)) {
    errors.throwBadQuery(`Repeated include query`);
  }

  includeQuery = normalize(includeQuery);

  if (containsRepeatedValues(includeQuery)) {
    errors.throwBadQuery(`Include query contains repeated values`);
  }

  if (includeQuery.some((include) => relationships[include] !== null)) {
    errors.throwUnknownQuery(
      `Unknown or unsupported value on "include=${includeQuery}"`
    );
  }
}

function validateSortQuery(request) {
  const resourceType = request.path.replace("/1.0/", "");
  const supportedFields = {
    events: {
      startDate: true,
    },
  };

  let sortQuery = request.query.sort;

  if (isRepeated(sortQuery)) {
    errors.throwBadQuery(`Repeated sort query`);
  }

  sortQuery = normalize(sortQuery).map((value) => value.replace("-", ""));

  if (containsRepeatedValues(sortQuery)) {
    errors.throwBadQuery(`Sort query contains repeated values`);
  }

  if (
    sortQuery.some(
      (fieldToSort) =>
        !supportedFields[resourceType] ||
        !supportedFields[resourceType][fieldToSort]
    )
  ) {
    errors.throwUnknownQuery(
      `Unknown or unsupported value on "sort=${sortQuery}"`
    );
  }
}

function validateRandomQuery(request) {
  if (request.query.sort) {
    errors.throwQueryConflict(
      `Unable to process "random" and "sort" on a single request`
    );
  }

  const resourceType = request.path.replace("/1.0/", "");
  const supportedResourceTypes = ["events", "lifts", "snowparks", "trails"];

  if (!supportedResourceTypes.includes(resourceType)) {
    errors.throwUnknownQuery(
      `Random query parameter not supported on the requested endpoint`
    );
  }

  let randomQuery = request.query.random;

  if (isRepeated(randomQuery)) {
    errors.throwBadQuery(`Repeated random query`);
  }

  randomQuery = Number(randomQuery);

  if (!Number.isInteger(randomQuery) || randomQuery < 1 || randomQuery > 50) {
    errors.throwBadQuery(
      `Invalid query parameter value "random=${randomQuery}"`
    );
  }
}

function validateSearchQuery(request) {
  const resourceType = request.path.replace("/1.0/", "");
  const supportedFields = {
    events: {
      name: true,
    },
    lifts: {
      name: true,
    },
    snowparks: {
      name: true,
    },
    trails: {
      name: true,
    },
  };

  if (!supportedFields[resourceType]) {
    errors.throwUnknownQuery(
      `Search query parameter not supported on the requested endpoint`
    );
  }

  const searchQuery = request.query.search;

  if (
    Object.values(searchQuery).some((searchString) => isRepeated(searchString))
  ) {
    errors.throwBadQuery(`Repeated search query`);
  }

  if (typeof searchQuery !== "object") {
    errors.throwBadQuery(
      `Invalid or unsupported query parameter value on "search"`
    );
  }

  if (
    Object.keys(searchQuery).some(
      (fieldToSearch) => !supportedFields[resourceType][fieldToSearch]
    )
  ) {
    errors.throwBadQuery(
      `Invalid or unsupported query parameter value on "search"`
    );
  }
}

function validateFilterQuery(request) {
  const filterQuery = request.query.filter;
  let resourceType = request.path.replace("/1.0/", "");

  if (resourceType.indexOf("/") >= 0) {
    resourceType = resourceType.substring(0, resourceType.indexOf("/"));
  }

  if (!queryValidation[resourceType] || typeof filterQuery !== "object") {
    errors.throwBadQuery(
      `Invalid or unsupported query parameter value on "filter"`
    );
  }

  for (const filterName in filterQuery) {
    const filterValidation = queryValidation[resourceType][filterName];

    if (!filterValidation || !filterValidation(filterQuery[filterName])) {
      errors.throwBadQuery(
        `Invalid or unsupported query parameter value on "filter"`
      );
    }
  }
}

function validateFieldsQuery(request) {
  const fieldsQuery = request.query.fields;

  if (typeof fieldsQuery !== "object" || Array.isArray(fieldsQuery)) {
    errors.throwBadQuery(
      `Invalid or unsupported query parameter value on "fields"`
    );
  }

  for (const resourceType in fieldsQuery) {
    let fieldNames = normalize(fieldsQuery[resourceType]);

    if (
      !templates[resourceType] ||
      !Array.isArray(fieldNames) ||
      containsRepeatedValues(fieldNames)
    ) {
      errors.throwBadQuery(
        `Invalid or unsupported query parameter value on "fields"`
      );
    }

    const attributes = templates[resourceType].attributes;
    const relationships = templates[resourceType].relationships;

    for (const fieldName of fieldNames) {
      if (
        !(relationships[fieldName] === null || attributes[fieldName] === null)
      ) {
        errors.throwBadQuery(
          `Invalid or unsupported query parameter value on "fields"`
        );
      }
    }
  }
}

function getBaseUrl(req) {
  return process.env.REF_SERVER_URL + "/1.0";
}

function getSelfUrl(req) {
  return process.env.REF_SERVER_URL + req.originalUrl;
}

function createRequest(req) {
  return {
    baseUrl: getBaseUrl(req),
    selfUrl: getSelfUrl(req),
    params: req.params,
    query: {
      include: {},
      fields: {},
    },
  };
}

function parsePage(req) {
  const { page } = req.query;

  let result = {
    size: 10,
    number: 1,
  };

  if (!page) return result;

  if (page.size > 0) result.size = page.size;

  if (page.number > 0) result.number = page.number;

  return result;
}

// "include=organizers,venues,venues.geometries => ['organizers','venues','venues.geometries']"
function parseInclude(req) {
  const { include } = req.query;

  let result = {};

  if (!include) return result;

  let entries = include.split(",");
  for (i = 0; i < entries.length; i++) {
    const fields = entries[i].split(".");
    let container = result;

    for (j = 0; j < fields.length; j++) {
      const field = fields[j];

      if (!container[field]) container[field] = {};

      container = container[field];
    }
  }

  return result;
}

function parseFields(req) {
  let { fields } = req.query;

  if (!fields) return {};

  let result = {};
  Object.keys(fields).forEach((fieldName) => {
    result[fieldName] = normalize(fields[fieldName]);
  });

  return result;
}

function parseSearch(req) {
  let { search } = req.query;

  if (search && (typeof search === "string" || typeof search === "object")) {
    return search;
  }
}

function parseResourceRequest(req) {
  validateResourceRequestQueries(req);

  let parsedRequest = createRequest(req);

  parsedRequest.query.fields = parseFields(req);
  parsedRequest.query.include = parseInclude(req);

  return parsedRequest;
}

function parseCollectionRequest(req) {
  validateCollectionRequestQueries(req);

  let parsedRequest = createRequest(req);

  parsedRequest.query.page = parsePage(req);
  parsedRequest.query.fields = parseFields(req);
  parsedRequest.query.include = parseInclude(req);
  parsedRequest.query.filter = req.query.filter || {};
  parsedRequest.query.sort = req.query.sort || {};
  parsedRequest.query.random = req.query.random || {};
  parsedRequest.query.search = parseSearch(req);

  return parsedRequest;
}

module.exports.parseResourceRequest = parseResourceRequest;
module.exports.parseCollectionRequest = parseCollectionRequest;
module.exports.getBaseUrl = getBaseUrl;
module.exports.getSelfUrl = getSelfUrl;
