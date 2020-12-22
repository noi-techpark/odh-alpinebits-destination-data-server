const schemas = require("./query-schemas");
const Ajv = new require("ajv");
const ajv = new Ajv();

const iso6393to6391 = require("iso-639-3/to-1.json");
const errors = require("../errors");
const { templates } = require("../transformers/odh2alpinebits/templates");

function validateResourceRequestQueries(request) {
  if (!request.query) {
    return;
  }

  console.log("\n\n> Validating query parameters");

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
          `The request contains unsupported query parameters for this endpoint ` +
          `${urlQueriesToString(request,queryName)}.`
        );
    }
  }
}

function validateCollectionRequestQueries(request) {
  if (!request.query) {
    return;
  }

  console.log("Validating query parameters");

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
          `The request contains unsupported query parameters for this endpoint ` +
          `${urlQueriesToString(request,queryName)}.`
        );
    }
  }
}

function urlQueriesToString(request, queryName) {
  const regex = new RegExp(`${queryName}[^&]*`, "g")
  const urlSerializedQueries = request.originalUrl
      .match(regex)
      .reduce((acc, current) => `${acc ? acc + ',': acc} '${current}'`, '');
  return urlSerializedQueries;
}

function getResourceTypeFromPath(request) {
  const regex = /\/1\.0\/\w+/;
  const { path } = request;
  let resourceType = path.match(regex);

  if(resourceType && resourceType.length === 1) {
    resourceType = resourceType[0].replace("/1.0/","");
  } else {
    throw new Error("Unable to extract resource type from path")
  }

  return resourceType
}

function containsRepeatedValues(queryParameterValue) {
  const arr = queryParameterValue.split(",");
  const set = new Set(arr);
  return arr.length > set.size
}

function validateQueryParameterWithSchema(request, schema, queryName) {
  const validate = ajv.compile(schema);
  const query = request.query[queryName]
  
  if(!validate(query)) {
    console.log(`\nQuery parameter '${queryName}' failed the schema:`, validate.errors)
    errors.throwBadQuery(`Some error is present in some of the following query parameters: ${urlQueriesToString(request, queryName)}`);
  }
}

function validatePageQuery(request) {
  validateQueryParameterWithSchema(request, schemas.page, "page");
}

function validateIncludeQuery(request) {
  const { include } = request.query;
  const resourceType = getResourceTypeFromPath(request);
  const relationships = templates[resourceType].relationships;

  validateQueryParameterWithSchema(request, schemas.include, "include");

  if (containsRepeatedValues(include)) {
    errors.throwBadQuery(
      `The following query cannot contain repeated values: ${urlQueriesToString(
        request,
        "include"
      )}`
    );
  }

  for (const includeRelationship of include.split(',')) {
    if(relationships[includeRelationship] !== null) {
      errors.throwUnknownQuery(
        `The value '${includeRelationship}' is not a supported relationship for this endpoint's resource types. ` + 
        `Please review the following query parameters: ${urlQueriesToString(request, 'include')}.`);
    } 
  }
}

function validateSortQuery(request) {
  const { sort } = request.query;
  const resourceType = getResourceTypeFromPath(request);
  const supportedFields = {
    events: {
      startDate: true,
    },
  };

  validateQueryParameterWithSchema(request, schemas.sort, 'sort');

  if(containsRepeatedValues(sort.replace(/-/g,""))) {
    errors.throwBadQuery(
      `The following query cannot contain repeated values: ${urlQueriesToString(
        request,
        'sort'
      )}`
    );
  }

  for (const sortBy of sort.split( ',')) {
    if(!supportedFields[resourceType][sortBy.replace(/-/g,"")]) {
      errors.throwUnknownQuery(
        `Sorting by '${sortBy}' is not supported. ` +
        `Please review the following query parameters: ${urlQueriesToString(request, 'sort')}.`
      );
    }
  }
}

function validateRandomQuery(request) {
  const resourceType = getResourceTypeFromPath(request);
  const supportedResourceTypes = ["events", "lifts", "snowparks", "trails"];

  validateQueryParameterWithSchema(request, schemas.random, 'random');

  if (request.query.sort) {
    errors.throwQueryConflict(
      `Unable to process the following query parameters in the same request: ` +
      `${urlQueriesToString(request,'(random|sort)')}.`
    );
  }

  if (!supportedResourceTypes.includes(resourceType)) {
    errors.throwUnknownQuery(
      `Query parameter 'random' not supported on the requested endpoint: ` +
      `${urlQueriesToString(request,'random')}.`
    );
  }
}

function validateSearchQuery(request) {
  const { search } = request.query;
  const resourceType = getResourceTypeFromPath(request);
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
  
  validateQueryParameterWithSchema(request, schemas.search, 'search');

  if (!supportedFields[resourceType]) {
    errors.throwUnknownQuery(
      `Search query parameter not supported on the requested endpoint: ` +
      `${urlQueriesToString(request,'search')}.`
    );
  }

  for (const searchFieldName of Object.keys(search)) {
    if(!supportedFields[resourceType][searchFieldName]) {
      errors.throwUnknownQuery(
        `Search field '${searchFieldName}' not supported on the requested endpoint: ` +
        `${urlQueriesToString(request,'search')}.`
      );
    }
  }
}

function validateFilterQuery(request) {
  const { filter } = request.query;
  const resourceType = getResourceTypeFromPath(request);
  const checkLangCodes = input => {
    const languages = input.split(',');
    for (const languageCode of languages) {
      if(!iso6393to6391[languageCode]) {
        errors.throwBadQuery(
          `Language code '${languageCode}' in 'lang' filter does not match an ISO 639-3 language code.`
        )
      }
    }
  }
  const additionalValidation = {
    events: { lang: checkLangCodes },
    lifts: { lang: checkLangCodes },
    snowparks: { lang: checkLangCodes },
    trails: { lang: checkLangCodes },
  }

  validateQueryParameterWithSchema(request, schemas.filter[resourceType], 'filter');

  for (const filterName of Object.keys(filter)) {
    // Adding validations per operand would require an additional loop
    if(additionalValidation[resourceType][filterName]) {
      const validate = additionalValidation[resourceType][filterName]
      validate(filter[filterName])
    }
  }
}

function validateFieldsQuery(request) {
  const { fields } = request.query;
  
  validateQueryParameterWithSchema(request, schemas.fields, 'fields');
  
  for (const resourceType of Object.keys(fields)) {
    const attributes = templates[resourceType].attributes;
    const relationships = templates[resourceType].relationships;

    for (const fieldName of fields[resourceType].split(',')) {
      if(attributes[fieldName] !== null && relationships[fieldName] !== null) {
        errors.throwUnknownQuery(
          `In the query parameters, '${fieldName}' is not an attribute or relationship field name in the queried resource type '${resourceType}': ` +
          `${urlQueriesToString(request,'fields')}.`
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


function normalize(queryValues) {
  queryValues = Array.isArray(queryValues)
    ? queryValues.flatMap((value) => value.split(","))
    : queryValues.split(",");
  return queryValues;
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
