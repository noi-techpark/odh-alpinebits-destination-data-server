const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');
const { basicSchemaTests } = require('./route.schema.test');

const arraySchema = require('../src/validator/schemas/snowparks.array.schema.json');
const resourceSchema = require('../src/validator/schemas/snowparks.schema.json');

let opts = {
  route: 'snowparks',
  resourceType: 'snowparks',
  sampleAttributes: ['name','address','geometries','openingHours','difficulty'],
  sampleRelationships: ['connections','multimediaDescriptions'],
  schema: {
    resourceSchema,
    arraySchema,
    pageStart: 1,
    pageEnd: 2,
    pageSize: 20
  }
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
basicSchemaTests(opts);
