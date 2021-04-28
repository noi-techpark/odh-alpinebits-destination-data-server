const { basicResourceRouteTests } = require("./route_id.test");
const { basicRouteTests } = require("./route.test");
const { basicSchemaTests } = require("./route.schema.test");

const arraySchema = require("../src/validator/schemas/mountainareas.schema.json");
const resourceSchema = require("../src/validator/schemas/mountainareas.id.schema.json");

let opts = {
  pageSize: 2,
  route: "mountainAreas",
  resourceType: "mountainAreas",
  sampleAttributes: ["name", "geometries", "totalTrailLength"],
  sampleRelationships: ["areaOwner", "lifts", "skiSlopes"],
  include: {
    relationship: "areaOwner",
    resourceType: "agents",
  },
  multiInclude: {
    relationships: ["lifts", "skiSlopes", "multimediaDescriptions"],
    resourceTypes: ["lifts", "skiSlopes", "mediaObjects"],
  },
  selectInclude: {
    attribute: "name",
    relationship: "lifts",
    resourceType: "lifts",
  },
  multiSelectInclude: [
    {
      attributes: ["name", "geometries"],
      relationship: "lifts",
      resourceType: "lifts",
    },
    {
      attributes: ["name"],
      relationship: "areaOwner",
      resourceType: "agents",
    },
  ],
  schema: {
    resourceSchema,
    arraySchema,
    pageStart: 1,
    pageEnd: 2,
    pageSize: 10,
  },
};

basicRouteTests(opts);
basicResourceRouteTests(opts);
// basicSchemaTests(opts);
