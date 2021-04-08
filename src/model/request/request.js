const { DestinationDataError } = require("./../../errors");
const schemas = require("./query-schemas");
const _ = require("lodash");
const Ajv = require("ajv");
const ajv = new Ajv();

function testSchema(input, schema) {
  const validate = ajv.compile(schema);
  const isValid = validate(input);

  if (!isValid) {
    // TODO: re-enable log after tests are done
    // console.log("  The input is not valid against the provided schema");
  }

  return isValid;
}

class Request {
  constructor(expressRequest) {
    this.baseUrl = `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}`;
    this.selfUrl = `${process.env.REF_SERVER_URL}${expressRequest.originalUrl}`;
    this.params = expressRequest.params;

    this.query = {};
    this.query.page = expressRequest.query.page ? expressRequest.query.page : null;
    this.query.fields = expressRequest.query.fields ? expressRequest.query.fields : null;
    this.query.include = expressRequest.query.include ? expressRequest.query.include : null;
    this.query.filter = expressRequest.query.filter ? expressRequest.query.filter : null;
    this.query.sort = expressRequest.query.sort ? expressRequest.query.sort : null;
    this.query.random = expressRequest.query.random ? expressRequest.query.random : null;
    this.query.search = expressRequest.query.search ? expressRequest.query.search : null;

    this.supportedFeatures = {
      include: true,
      fields: true,
      page: false,
      filter: false,
      sort: false,
      random: false,
      search: false,
    };

    /** An array of the classes that requested resources may instantiate. The default value is `[]`. */
    this.expectedTypes = [];
  }

  validate() {
    const { query } = this;

    if (!testSchema(query, schemas.query)) {
      const features = Object.entries(this.supportedFeatures)
        .filter(([_feature, isSupported]) => isSupported)
        .reduce(
          (supportedFeatures, [feature, _isSupported]) =>
            supportedFeatures ? `${supportedFeatures}, "${feature}"` : `"${feature}"`,
          ""
        );
      const description = !_.isEmpty(features)
        ? `The request contains unknown queries. The list of supported queries in this endpoint is: ${features}`
        : `The request contains unknown queries.`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if ([query.sort && query.random].every((item) => item !== null && item !== undefined)) {
      const regex = /(sort|random)([^&])*/;
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The cannot request contain both "random" and "sort" queries: "${problematicQueries}"`;
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
    const regex = /include([^&])*/;

    if (!this.supportedFeatures.include && include) {
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The request contains a query not supported in this endpoint: "${problematicQueries}"`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if (include !== null && include !== undefined && !testSchema(include, schemas.include)) {
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The "include" contains issues: "${problematicQueries}"`;
      DestinationDataError.throwBadQueryError(description);
    }
  }

  validateFieldsQuery() {
    const { fields } = this.query;
    const regex = /fields([^&])*/;

    if (!this.supportedFeatures.fields && fields) {
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The request contains a query not supported in this endpoint: "${problematicQueries}"`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if (fields !== null && fields !== undefined && !testSchema(fields, schemas.fields)) {
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The "fields" contains issues: "${problematicQueries}"`;
      DestinationDataError.throwBadQueryError(description);
    }
  }

  validatePageQuery() {
    let { page } = this.query;
    const regex = /page([^&])*/;

    if (!this.supportedFeatures.page && page) {
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The request contains a query not supported in this endpoint: "${problematicQueries}"`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if (page !== null && page !== undefined && !testSchema(page, schemas.page)) {
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The "page" query contains issues: "${problematicQueries}"`;
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
    const regex = /sort([^&])*/;

    if (!this.supportedFeatures.sort && sort) {
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The request contains a query not supported in this endpoint: "${problematicQueries}"`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if (sort !== null && sort !== undefined && !testSchema(sort, schemas.sort)) {
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The "sort" query contains issues: "${problematicQueries}"`;
      DestinationDataError.throwBadQueryError(description);
    }
  }

  validateRandomQuery() {
    const { random } = this.query;
    const regex = /random([^&])*/;

    if (!this.supportedFeatures.random && random) {
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The request contains a query not supported in this endpoint: "${problematicQueries}"`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if (random !== null && random !== undefined && !testSchema(random, schemas.random)) {
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The "random" query contains issues: "${problematicQueries}"`;
      DestinationDataError.throwBadQueryError(description);
    }
  }

  validateSearchQuery() {
    const { search } = this.query;
    const regex = /search([^&])*/;

    if (!this.supportedFeatures.search && search) {
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The request contains a query not supported in this endpoint: "${problematicQueries}"`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if (search !== null && search !== undefined && !testSchema(search, schemas.search)) {
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The "search" query contains issues: "${problematicQueries}"`;

      console.log("this.selfUrl", this.selfUrl);
      console.log("this.selfUrl.match(regex)", this.selfUrl.match(regex));

      DestinationDataError.throwBadQueryError(description);
    }
  }

  validateFilterQuery() {
    const { filter } = this.query;
    const regex = /filter([^&])*/;

    if (!this.supportedFeatures.filter && filter) {
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The request contains a query not supported in this endpoint: "${problematicQueries}"`;
      DestinationDataError.throwUnknownQueryError(description);
    }

    if (filter !== null && filter !== undefined && !testSchema(filter, schemas.filter)) {
      const problematicQueries = this.selfUrl.match(regex).join("&");
      const description = `The "filter" query contains issues: "${problematicQueries}"`;
      DestinationDataError.throwBadQueryError(description);
    }
  }
}

module.exports = {
  Request,
};
