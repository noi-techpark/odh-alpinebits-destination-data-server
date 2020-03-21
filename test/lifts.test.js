const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');
const { basicSchemaTests } = require('./route.schema.test');

const arraySchema = require('../src/validator/schemas/lifts.array.schema.json');
const resourceSchema = require('../src/validator/schemas/lifts.schema.json');

let opts = {
  route: 'lifts',
  resourceType: 'lifts',
  sampleAttributes: ['name','address','geometries','openingHours'],
  sampleRelationships: ['connections','multimediaDescriptions'],
  schema: {
    resourceSchema,
    arraySchema,
    pageStart: 1,
    pageEnd: 10,
    pageSize: 50
  }
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
basicSchemaTests(opts);