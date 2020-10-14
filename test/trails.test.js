const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');
const { basicSchemaTests } = require('./route.schema.test');
const { basicFilterTests } = require("./filter.test");
const { basicSearchTests } = require("./search.test");

const arraySchema = require('../src/validator/schemas/trails.schema.json');
const resourceSchema = require('../src/validator/schemas/trails.id.schema.json');

let opts = {
  route: 'trails',
  resourceType: 'trails',
  sampleAttributes: ['name','address','geometries','openingHours','difficulty'],
  sampleRelationships: ['connections','multimediaDescriptions'],
  schema: {
    resourceSchema,
    arraySchema,
    pageStart: 1,
    pageEnd: 7,
    pageSize: 20
  },
  filters: [
    {
      name: "updatedAfter",
      value: "2020-09-01",
    },
    {
      name: "nearTo",
      value: "11.309245,46.862025,10000",
    },
  ],
  searches: [
    {
      name: "name",
      value: "cross",
    },
  ],
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
basicSchemaTests(opts);
basicFilterTests(opts);
basicSearchTests(opts);
