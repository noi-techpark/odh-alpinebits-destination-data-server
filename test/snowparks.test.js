const { basicResourceRouteTests } = require("./route_id.test");
const { basicRouteTests } = require("./route.test");
const { basicSchemaTests } = require("./route.schema.test");
const { basicQueriesTest } = require("./queries.test");

const arraySchema = require("../src/validator/schemas/snowparks.schema.json");
const resourceSchema = require("../src/validator/schemas/snowparks.id.schema.json");

let opts = {
  route: "snowparks",
  resourceType: "snowparks",
  sampleAttributes: [
    "name",
    "address",
    "geometries",
    "openingHours",
    "difficulty",
  ],
  sampleRelationships: ["connections", "multimediaDescriptions"],
  schema: {
    resourceSchema,
    arraySchema,
    pageStart: 1,
    pageEnd: 1,
    pageSize: 20,
  },
  queries: [
    {
      query: "filter[lang]=eng",
      expectStatus: 200,
    },
    {
      query: "filter[geometries][near]=11.309245,46.862025,1000",
      expectStatus: 200,
    },
    {
      query: "filter[lastUpdate][gt]=2020-10-01",
      expectStatus: 200,
    },
    {
      query: "search[name]=gardena",
      expectStatus: 200,
    },
  ],
};

// basicRouteTests(opts);
// basicResourceRouteTests(opts);
// basicSchemaTests(opts);
// basicQueriesTest(opts);
