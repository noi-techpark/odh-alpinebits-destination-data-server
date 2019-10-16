const { basicResourceRouteTests } = require('./route_id.test');
const { basicRouteTests } = require('./route.test');

let opts = {
  route: 'eventSeries',
  resourceType: 'eventSeries',
  sampleAttributes: ['name','frequency'],
  sampleRelationships: ['multimediaDescriptions'],
}

basicRouteTests(opts);
basicResourceRouteTests(opts);
