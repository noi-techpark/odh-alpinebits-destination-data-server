const { DestinationDataError } = require("./../../errors");
const schemas = require("./query-schemas");
const Ajv = new require("ajv");
const ajv = new Ajv();

function testSchema(input, schema) {
    const validate = ajv.compile(schema);
    const isValid = validate(input);

    if(!isValid) {
        console.error('The input is not valid against the provided schema',JSON.stringify(validate.errors, null, 2));
        console.error('Input:',JSON.stringify(input, null, 2));
        console.error('Schema',JSON.stringify(schema, null, 2));
    }

    return isValid;
}

class Request {
    constructor(expressRequest, isCollectionRequest) {
        this.isCollectionRequest = isCollectionRequest;

        this.baseUrl = `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}`;
        this.selfUrl = `${process.env.REF_SERVER_URL}/${expressRequest.originalUrl}`;
        this.params = expressRequest.params;
        
        this.query = {};
        this.query.page = expressRequest.query.page ? expressRequest.query.page : {};
        this.query.fields = expressRequest.query.fields ? expressRequest.query.fields : undefined;
        this.query.include = expressRequest.query.include ? expressRequest.query.include : undefined;
        this.query.filter = expressRequest.query.filter ? expressRequest.query.filter : undefined;
        this.query.sort = expressRequest.query.sort ? expressRequest.query.sort : undefined;
        this.query.random = expressRequest.query.random ? expressRequest.query.random : undefined;
        this.query.search = expressRequest.query.search ? expressRequest.query.search : undefined;

        const { size, number } = this.query.page;
        this.query.page.size = size || 10;
        this.query.page.number = number || 1;
    }
    
    /** Returns the resource type in the "base" of the quest, independent of relationships
     * Example: "/2021-04/events/121323-asd_213/categories?page[size]=2" returns "events"
     */
    getBaseResourceType() {
        const regex = /^\/2021-04\/\w+/
        const matches = this.selfUrl ? this.selfUrl.match(regex) : null;
        return matches ? matches[0] : null;
    }

    validate() {
        this.validateIncludeQuery();
        this.validateFieldsQuery();
    }

    validateIncludeQuery() {
        const { include } = this.query;

        if(!include) {
            return ;
        }

        if(!testSchema(include, schemas.include)) {
            const regex = /include([^&])*/;
            const problematicQueries = this.selfUrl.match(regex).join('&');
            const description = `The include query must be a single list of comma-separated relationship names. Problematic queries: "${problematicQueries}"`
            DestinationDataError.throwBadQueryError(description)
        }

        // TODO: add check for valid relationship name

        return ;
    }

    validateFieldsQuery() {
        const { fields } = this.query;

        if(!fields) {
            return ;
        }

        if(!testSchema(fields, schemas.fields)) {
            const regex = /fields([^&])*/;
            const problematicQueries = this.selfUrl.match(regex).join('&');
            const description = `The fields query must be an object containing comma-separated field names Problematic queries: "${problematicQueries}"`
            DestinationDataError.throwBadQueryError(description)
        }

        // TODO: add check for valid field names

        return ;
    }
}

module.exports = {
    Request
}