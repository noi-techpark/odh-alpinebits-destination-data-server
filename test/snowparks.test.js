const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');

let opts = {
  route: 'snowparks',
  resourceType: 'snowparks',
  sampleAttributes: ['name','address','geometries','openingHours','difficulty'],
  sampleRelationships: ['connections','multimediaDescriptions'],
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
