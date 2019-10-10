const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');

let opts = {
  route: 'lifts',
  resourceType: 'lifts',
  sampleAttributes: ['name','address','geometries','openingHours'],
  sampleRelationships: ['connections','multimediaDescriptions'],
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
