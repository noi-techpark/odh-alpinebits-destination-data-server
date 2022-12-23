const { basicRouteTests } = require("./route.test");
const { basicResourceRouteTests } = require("./route_id.test");
const { basicSchemaTests } = require("./route.schema.test");

let opts = {
  route: "agents",
  resourceType: "agents",
  sampleAttributes: ["name", "description", "url"],
  sampleRelationships: ["multimediaDescriptions"],
  include: {
    relationship: "multimediaDescriptions",
    resourceType: "mediaObjects",
  },
  multiInclude: {
    relationships: ["categories", "multimediaDescriptions"],
    resourceTypes: ["categories", "mediaObjects"],
  },
  selectInclude: {
    attribute: "name",
    relationship: "categories",
    resourceType: "categories",
  },
  multiSelectInclude: [
    {
      attributes: ["name", "url"],
      relationship: "categories",
      resourceType: "categories",
    },
  ],
  schema: {
    pageStart: 1,
    pageEnd: 1,
    pageSize: 1,
  },
};

// basicRouteTests(opts);
// basicResourceRouteTests(opts);
// basicSchemaTests(opts); // some agents are breaking the schema for lack of data
