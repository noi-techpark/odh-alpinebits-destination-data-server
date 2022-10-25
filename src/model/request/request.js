const { DestinationDataError } = require("./../../errors");
const { Agent } = require("./../destinationdata/agents");
const { Category } = require("./../destinationdata/category");
const { Event } = require("./../destinationdata/event");
const { EventSeries } = require("./../destinationdata/event_series");
const { Feature } = require("./../destinationdata/feature");
const { Lift } = require("./../destinationdata/lift");
const { MediaObject } = require("./../destinationdata/media_object");
const { MountainArea } = require("./../destinationdata/mountain_area");
const { SkiSlope } = require("./../destinationdata/ski_slope");
const { Snowpark } = require("./../destinationdata/snowpark");
const { Venue } = require("./../destinationdata/venue");
const schemas = require("./query-schemas");
const _ = require("lodash");
const Ajv = require("ajv");
const ajv = new Ajv();

function testSchema(input, schema) {
  const validate = ajv.compile(schema);
  const isValid = validate(input);

  if (!isValid) {
    // TODO: re-enable log after tests are done
    console.log("  The input is not valid against the provided schema");
  }

  return isValid;
}

class Request {
  constructor(expressRequest) {
    this.baseUrl = `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}`;
    this.selfUrl = `${process.env.REF_SERVER_URL}${expressRequest.originalUrl}`;
    this.params = expressRequest.params;

    this.query = Object.assign({}, expressRequest.query);
    this.query.page =
      typeof expressRequest.query.page !== "undefined"
        ? expressRequest.query.page
        : null;
    this.query.fields =
      typeof expressRequest.query.fields !== "undefined"
        ? expressRequest.query.fields
        : null;
    this.query.include =
      typeof expressRequest.query.include !== "undefined"
        ? expressRequest.query.include
        : null;
    this.query.filter =
      typeof expressRequest.query.filter !== "undefined"
        ? expressRequest.query.filter
        : null;
    this.query.sort =
      typeof expressRequest.query.sort !== "undefined"
        ? expressRequest.query.sort
        : null;
    this.query.random =
      typeof expressRequest.query.random !== "undefined"
        ? expressRequest.query.random
        : null;
    this.query.search =
      typeof expressRequest.query.search !== "undefined"
        ? expressRequest.query.search
        : null;

    this.supportedFeatures = {
      include: true,
      fields: true,
      page: true,
      filter: false,
      sort: true,
      random: false,
      search: false,
    };

    /** An array of the classes that requested resources may instantiate. The default value is `[]`. */
    this.expectedTypes = [];
    /** An array of the classes that requested resources in the 'data' array may instantiate. The default value is `[]`. */
    this.typesInData = [];
    /** An array of the classes that requested resources in the 'included' array may instantiate. The default value is `[]`. */
    this.typesInIncluded = [];
  }

  setMaxPagination() {
    _.set(this, "query.page.size", 999);
    _.set(this, "query.page.number", 1);
  }

  validate() {
    const { query } = this;

    if (!testSchema(query, schemas.query)) {
      const features = Object.entries(this.supportedFeatures)
        .filter(([_feature, isSupported]) => isSupported)
        .reduce(
          (supportedFeatures, [feature, _isSupported]) =>
            supportedFeatures
              ? `${supportedFeatures}, "${feature}"`
              : `"${feature}"`,
          ""
        );
      const description = !_.isEmpty(features)
        ? `The request contains unknown or empty queries. The list of supported queries in this endpoint is: ${features}`
        : `The request contains unknown queries.`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if ([query.sort, query.random].every((item) => item !== null)) {
      const regex = /(sort|random)(.+?(?=&|$))/g;
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `The query 'random' and 'sort' are incompatible: '${problematicQueries}'`;
      DestinationDataError.throwQueryConflictError(description);
    }

    this.validateIncludeQuery();
    this.validateFieldsQuery();
    this.validatePageQuery();
    this.validateSortQuery();
    this.validateRandomQuery();
    this.validateSearchQuery();
    this.validateFilterQuery();
  }

  validateIncludeQuery() {
    const { include } = this.query;
    const regex = /include(.+?(?=&|$))/g;

    if (!this.supportedFeatures.include && include) {
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `This endpoint does not support the following queries: '${problematicQueries}'`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if (
      include !== null &&
      include !== undefined &&
      !testSchema(include, schemas.include)
    ) {
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `The 'include' query contains issues in the values passed: '${problematicQueries}'`;
      DestinationDataError.throwBadQueryError(description);
    }

    // TODO: update and re-enable
    // if (include) {
    //   const relationshipNames = this.typesInData.flatMap((ResourceType) => {
    //     const _dummyResource = new ResourceType();
    //     return _dummyResource.getRelationshipsNames();
    //   });
    //   const includeRelationships = include.split(",");

    //   if (
    //     includeRelationships.some(
    //       (relationshipName) => !relationshipNames.includes(relationshipName)
    //     )
    //   ) {
    //     DestinationDataError.throwBadQueryError(
    //       `The 'include' query contains relationships that are not available in the requested resource(s): 'include=${include}'`
    //     );
    //   }
    // }
  }

  validateFieldsQuery() {
    const { fields } = this.query;
    const regex = /fields(.+?(?=&|$))/g;
    const resourceTypeMap = {
      agents: Agent,
      categories: Category,
      events: Event,
      eventSeries: EventSeries,
      features: Feature,
      lifts: Lift,
      mediaObjects: MediaObject,
      mountainAreas: MountainArea,
      skiSlopes: SkiSlope,
      snowparks: Snowpark,
      venues: Venue,
    };

    if (!this.supportedFeatures.fields && fields) {
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `This endpoint does not support the following queries: '${problematicQueries}'`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if (
      fields !== null &&
      fields !== undefined &&
      !testSchema(fields, schemas.fields)
    ) {
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `The 'fields' query contains issues in the values passed: '${problematicQueries}'`;
      DestinationDataError.throwBadQueryError(description);
    }

    if (fields) {
      Object.entries(fields).forEach(([resourceType, fieldNames]) => {
        const fieldNamesArray = fieldNames.split(",");
        const ResourceClass = resourceTypeMap[resourceType];
        const _dummyInstance = new ResourceClass();
        const allFields = _dummyInstance.getFieldsNames();

        if (
          fieldNamesArray.some((fieldName) => !allFields.includes(fieldName))
        ) {
          DestinationDataError.throwBadQueryError(
            `The 'fields' query contains attributes or relationships that are not available in the selected resource: 'fields[${resourceType}]=${fieldNames}'`
          );
        }
      });
    }
  }

  validatePageQuery() {
    let { page } = this.query;
    const regex = /page(.+?(?=&|$))/g;

    if (!this.supportedFeatures.page && page) {
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `This endpoint does not support the following queries: '${problematicQueries}'`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if (
      page !== null &&
      page !== undefined &&
      !testSchema(page, schemas.page)
    ) {
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `The 'page' query contains issues in the values passed: '${problematicQueries}'`;
      DestinationDataError.throwBadQueryError(description);
    }

    if (this.supportedFeatures.page) {
      if (!page) {
        page = { size: null, number: null };
        this.query.page = page;
      }
      const { size, number } = page;

      page.size = size ? parseInt(size) : 10;
      page.number = number ? parseInt(number) : 1;
    }
  }

  validateSortQuery() {
    const { sort } = this.query;
    const regex = /sort(.+?(?=&|$))/g;

    if (!this.supportedFeatures.sort && sort) {
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `This endpoint does not support the following queries: '${problematicQueries}'`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if (
      sort !== null &&
      sort !== undefined &&
      !testSchema(sort, schemas.sort)
    ) {
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `The 'sort' query contains issues in the values passed: '${problematicQueries}'`;
      DestinationDataError.throwBadQueryError(description);
    }
  }

  validateRandomQuery() {
    const { random } = this.query;
    const regex = /random(.+?(?=&|$))/g;

    if (!this.supportedFeatures.random && random) {
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `This endpoint does not support the following queries: '${problematicQueries}'`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if (
      random !== null &&
      random !== undefined &&
      !testSchema(random, schemas.random)
    ) {
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `The 'random' query contains issues in the values passed: '${problematicQueries}'`;
      DestinationDataError.throwBadQueryError(description);
    }
  }

  validateSearchQuery() {
    const { search } = this.query;
    const regex = /search(.+?(?=&|$))/g;

    if (!this.supportedFeatures.search && search) {
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `This endpoint does not support the following queries: '${problematicQueries}'`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if (
      search !== null &&
      search !== undefined &&
      !testSchema(search, schemas.search)
    ) {
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `The 'search' query contains issues in the values passed: '${problematicQueries}'`;
      DestinationDataError.throwBadQueryError(description);
    }
  }

  validateFilterQuery() {
    const { filter } = this.query;
    const regex = /filter(.+?(?=&|$))/g;

    if (!this.supportedFeatures.filter && filter) {
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `This endpoint does not support the following queries: '${problematicQueries}'`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if (
      filter !== null &&
      filter !== undefined &&
      !testSchema(filter, schemas.filter)
    ) {
      const problematicQueries = this.selfUrl.match(regex)?.join("&");
      const description = `The 'filter' query contains issues in the values passed: '${problematicQueries}'`;
      DestinationDataError.throwBadQueryError(description);
    }
  }
}

module.exports = {
  Request,
};
