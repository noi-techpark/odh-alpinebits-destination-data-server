const { basicResourceRouteTests } = require("./route_id.test");
const { basicRouteTests } = require("./route.test");
const { basicSchemaTests } = require("./route.schema.test");
const { basicQueriesTest } = require("./queries.test");

const arraySchema = require("../src/validator/schemas/lifts.schema.json");
const resourceSchema = require("../src/validator/schemas/lifts.id.schema.json");

let opts = {
  route: "lifts",
  resourceType: "lifts",
  sampleAttributes: ["name", "address", "geometries", "openingHours"],
  sampleRelationships: ["connections", "multimediaDescriptions"],
  schema: {
    resourceSchema,
    arraySchema,
    pageStart: 1,
    pageEnd: 5,
    pageSize: 4,
  },
  queries: [
    {
      query: "filter[categories][any]=alpinebits:skilift,odh:sessellift",
      expectStatus: 200,
    },
    {
      query: "filter[geometries][near]=11.309245,46.862025,10000",
      expectStatus: 200,
    },
    {
      query: "filter[lastUpdate][gt]=2020-10-01",
      expectStatus: 200,
    },
    {
      query: "search=renon",
      expectStatus: 200,
    },
  ],
};

basicRouteTests(opts);
basicResourceRouteTests(opts);
basicSchemaTests(opts);
basicQueriesTest(opts);
