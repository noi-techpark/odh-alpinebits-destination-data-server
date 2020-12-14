const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');
const { basicSchemaTests } = require('./route.schema.test');

const arraySchema = require('../src/validator/schemas/mountainareas.schema.json');
const resourceSchema = require('../src/validator/schemas/mountainareas.id.schema.json');

let opts = {
  pageSize: 2,
  route: 'mountainAreas',
  resourceType: 'mountainAreas',
  sampleAttributes: ['name','geometries','totalTrailLength'],
  sampleRelationships: ['areaOwner','lifts','trails'],
  include: {
    relationship: 'areaOwner',
    resourceType: 'agents'
  },
  multiInclude: {
    relationships: ['lifts','trails','multimediaDescriptions'],
    resourceTypes: ['lifts','trails','mediaObjects']
  },
  selectInclude: {
    attribute: 'name',
    relationship: 'lifts',
    resourceType: 'lifts'
  },
  multiSelectInclude: [
    {
      attributes: ['name','geometries'],
      relationship: 'lifts',
      resourceType: 'lifts'
    },
    {
      attributes: ['name'],
      relationship: 'areaOwner',
      resourceType: 'agents'
    }
  ],
  schema: {
    resourceSchema,
    arraySchema,
    pageStart: 1,
    pageEnd: 2,
    pageSize: 10
  }
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
basicSchemaTests(opts);
