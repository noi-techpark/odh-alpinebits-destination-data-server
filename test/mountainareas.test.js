const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');

let opts = {
  pageSize: 2,
  route: 'mountainAreas',
  resourceType: 'mountainAreas',
  sampleAttributes: ['name','address','geometries','totalTrailLength'],
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
  ]
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
