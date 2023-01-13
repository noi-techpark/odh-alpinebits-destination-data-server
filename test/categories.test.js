const { basicRouteTests } = require("./route.test");
const { basicResourceRouteTests } = require("./route_id.test");
const { basicSchemaTests } = require("./route.schema.test");

let opts = {
  route: "categories",
  resourceType: "categories",
  sampleAttributes: ["name", "namespace", "resourceTypes", "url"],
  sampleRelationships: ["children", "multimediaDescriptions"],
  include: {
    relationship: "parents",
    resourceType: "categories",
  },
  multiInclude: {
    relationships: ["children", "parents", "multimediaDescriptions"],
    resourceTypes: ["categories", "mediaObjects"],
  },
  selectInclude: {
    attribute: "name",
    relationship: "children",
    resourceType: "categories",
  },
  multiSelectInclude: [
    {
      attributes: ["name", "url"],
      relationship: "children",
      resourceType: "categories",
    },
  ],
  schema: {
    pageStart: 1,
    pageEnd: 5,
    pageSize: 5,
  },
};

basicRouteTests(opts);
basicResourceRouteTests(opts);
basicSchemaTests(opts);
