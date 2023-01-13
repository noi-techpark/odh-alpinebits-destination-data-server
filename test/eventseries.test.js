const { basicResourceRouteTests } = require("./route_id.test");
const { basicRouteTests } = require("./route.test");
const { basicSchemaTests } = require("./route.schema.test");

const arraySchema = require("../src/validator/schemas/eventseries.schema.json");
const resourceSchema = require("../src/validator/schemas/eventseries.id.schema.json");

let opts = {
  route: "eventSeries",
  resourceType: "eventSeries",
  sampleAttributes: ["name", "frequency"],
  sampleRelationships: ["multimediaDescriptions"],
  schema: {
    resourceSchema,
    arraySchema,
    pageStart: 1,
    pageEnd: 5,
    pageSize: 4,
  },
};

basicRouteTests(opts);
basicResourceRouteTests(opts);
basicSchemaTests(opts);
