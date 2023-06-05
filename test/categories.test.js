// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { basicRouteTests } = require("./route.test");
const { basicResourceRouteTests } = require("./route_id.test");
const { basicSchemaTests } = require("./route.schema.test");
const arraySchema = null; //require("../src/validator/schemas/events.schema.json");
const resourceSchema = null; //require("../src/validator/schemas/events.id.schema.json");

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
    resourceSchema,
    arraySchema,
    pageStart: 1,
    pageEnd: 10,
    pageSize: 50,
  },
};

basicRouteTests(opts);
basicResourceRouteTests(opts);
// basicSchemaTests(opts);
