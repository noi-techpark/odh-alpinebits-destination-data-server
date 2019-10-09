const { basicRouteTests } = require('./route.test');
const { basicResourceRouteTests } = require('./route_id.test');

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
    resourceTypes: ['agents','places','mediaObjects']
  },
  selectInclude: {
    attribute: 'name',
    relationship: 'organizers',
    resourceType: 'agents'
  },
  multiSelectInclude: [
    {
      attributes: ['name','category'],
      relationship: 'organizers',
      resourceType: 'agents'
    },
    {
      attributes: ['name','address'],
      relationship: 'venues',
      resourceType: 'places'
    }
  ]
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
