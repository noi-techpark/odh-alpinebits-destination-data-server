const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');
const { basicSchemaTests } = require('./route.schema.test');
const { basicFilterTests } = require("./filter.test");
const { basicSearchTests } = require("./search.test");

const arraySchema = require('../src/validator/schemas/lifts.schema.json');
const resourceSchema = require('../src/validator/schemas/lifts.id.schema.json');

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
  },
  filters: [
    {
      name: "updatedAfter",
      value: "2020-09-01",
    },
    {
      name: "categories",
      value: "alpinebits/skilift,odh/sessellift",
    },
    {
      name: "nearTo",
      value: "11.309245,46.862025,10000",
    },
  ],
  searches: [
    {
      name: "name",
      value: "renon",
    },
  ],
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
basicSchemaTests(opts);
basicFilterTests(opts);
basicSearchTests(opts);