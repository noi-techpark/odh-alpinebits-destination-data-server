const { basicRouteTests } = require('./route.test');
const { basicResourceRouteTests } = require('./route_id.test');
const { basicSchemaTests } = require('./route.schema.test');
const arraySchema = require('../src/validator/schemas/events.schema.json');
const resourceSchema = require('../src/validator/schemas/events.id.schema.json');

let opts = {
  route: 'events',
  resourceType: 'events',
  sampleAttributes: ['name','startDate','endDate','categories'],
  sampleRelationships: ['organizers','venues','multimediaDescriptions'],
  include: {
    relationship: 'organizers',
    resourceType: 'agents'
  },
  multiInclude: {
    relationships: ['organizers','venues','multimediaDescriptions'],
    resourceTypes: ['agents','venues','mediaObjects']
  },
  selectInclude: {
    attribute: 'name',
    relationship: 'organizers',
    resourceType: 'agents'
  },
  multiSelectInclude: [
    {
      attributes: ['name','categories'],
      relationship: 'organizers',
      resourceType: 'agents'
    },
    {
      attributes: ['name','address'],
      relationship: 'venues',
      resourceType: 'venues'
    }
  ],
  schema: {
    resourceSchema,
    arraySchema,
    pageStart: 1,
    pageEnd: 10,
    pageSize: 50
  }
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
basicSchemaTests(opts);
