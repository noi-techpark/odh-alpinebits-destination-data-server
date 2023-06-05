// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });

const schemas = {
  "Agent Resource": {
    filePath: "./agent.schema.json",
  },
  "/agents": {
    filePath: "./agents.get.schema.json",
  },
  "/agents/:id": {
    filePath: "./agents.id.get.schema.json",
  },
  "/agents/:id/patch": {
    filePath: "./agents.id.patch.schema.json",
  },
  "/agents/post": {
    filePath: "./agents.post.schema.json",
  },
  "/": {
    filePath: "./base.get.schema.json",
  },
  "Category Resource": {
    filePath: "./category.schema.json",
  },
  "/categories": {
    filePath: "./categories.get.schema.json",
  },
  "/categories/:id": {
    filePath: "./categories.id.get.schema.json",
  },
  "/categories/:id/patch": {
    filePath: "./categories.id.patch.schema.json",
  },
  "/categories/post": {
    filePath: "./categories.post.schema.json",
  },
  Datatype: {
    filePath: "./datatypes.schema.json",
  },
  "Event Resource": {
    filePath: "./event.schema.json",
  },
  "/events": {
    filePath: "./events.get.schema.json",
  },
  "/events/:id": {
    filePath: "./events.id.get.schema.json",
  },
  "/events/:id/patch": {
    filePath: "./events.id.patch.schema.json",
  },
  "/events/post": {
    filePath: "./events.post.schema.json",
  },
  "Event Series Resource": {
    filePath: "./eventseries.schema.json",
  },
  "/eventSeries": {
    filePath: "./eventseries.get.schema.json",
  },
  "/eventSeries/:id": {
    filePath: "./eventseries.id.get.schema.json",
  },
  "/eventSeries/:id/patch": {
    filePath: "./eventseries.id.patch.schema.json",
  },
  "/eventSeries/post": {
    filePath: "./eventseries.post.schema.json",
  },
  "Feature Resource": {
    filePath: "./feature.schema.json",
  },
  "/features": {
    filePath: "./features.get.schema.json",
  },
  "/features/:id": {
    filePath: "./features.id.get.schema.json",
  },
  "/features/:id/patch": {
    filePath: "./features.id.patch.schema.json",
  },
  "/features/post": {
    filePath: "./features.post.schema.json",
  },
  "Lift Resource": {
    filePath: "./lift.schema.json",
  },
  "/lifts": {
    filePath: "./lifts.get.schema.json",
  },
  "/lifts/:id": {
    filePath: "./lifts.id.get.schema.json",
  },
  "/lifts/:id/patch": {
    filePath: "./lifts.id.patch.schema.json",
  },
  "/lifts/post": {
    filePath: "./lifts.post.schema.json",
  },
  "Media Object Resource": {
    filePath: "./mediaobject.schema.json",
  },
  "/mediaObjects": {
    filePath: "./mediaobjects.get.schema.json",
  },
  "/mediaObjects/:id": {
    filePath: "./mediaobjects.id.get.schema.json",
  },
  "/mediaObjects/:id/patch": {
    filePath: "./mediaobjects.id.patch.schema.json",
  },
  "/mediaObjects/post": {
    filePath: "./mediaobjects.post.schema.json",
  },
  "Mountain Area Resource": {
    filePath: "./mountainarea.schema.json",
  },
  "/mountainAreas": {
    filePath: "./mountainareas.get.schema.json",
  },
  "/mountainAreas/:id": {
    filePath: "./mountainareas.id.get.schema.json",
  },
  "/mountainAreas/:id/patch": {
    filePath: "./mountainareas.id.patch.schema.json",
  },
  "/mountainAreas/post": {
    filePath: "./mountainareas.post.schema.json",
  },
  "Ski Slope Resource": {
    filePath: "./skislope.schema.json",
  },
  "/skiSlopes": {
    filePath: "./skislopes.get.schema.json",
  },
  "/skiSlopes/:id": {
    filePath: "./skislopes.id.get.schema.json",
  },
  "/skiSlopes/:id/patch": {
    filePath: "./skislopes.id.patch.schema.json",
  },
  "/skiSlopes/post": {
    filePath: "./skislopes.post.schema.json",
  },
  "Snowpark Resource": {
    filePath: "./snowpark.schema.json",
  },
  "/snowparks": {
    filePath: "./snowparks.get.schema.json",
  },
  "/snowparks/:id": {
    filePath: "./snowparks.id.get.schema.json",
  },
  "/snowparks/:id/patch": {
    filePath: "./snowparks.id.patch.schema.json",
  },
  "/snowparks/post": {
    filePath: "./snowparks.post.schema.json",
  },
  "Venue Resource": {
    filePath: "./venue.schema.json",
  },
  "/venues": {
    filePath: "./venues.get.schema.json",
  },
  "/venues/:id": {
    filePath: "./venues.id.get.schema.json",
  },
  "/venues/:id/patch": {
    filePath: "./venues.id.patch.schema.json",
  },
  "/venues/post": {
    filePath: "./venues.post.schema.json",
  },
};

for (const [key, value] of Object.entries(schemas)) {
  const schema = require(value.filePath);
  const schemaId = schema?.["$id"];

  schemas[key]["schema"] = schema;
  schemas[key]["schemaId"] = schemaId;
  schemas[key]["validate"] = (obj) => [ajv.validate(schemaId, obj), ajv];

  ajv.addSchema(schema);
}

module.exports = schemas;
