const utils = require('./utils');

let headers, status, data, links;

beforeAll( () => {
  return utils.axiosInstance.get('/1.0')
    .then( (response) => {
      ({headers, status} = response);
      ({data, links} = response.data);
    })
})

test('Version home route returns correct body', () => {
  expect(data).toEqual(null);
  expect(links).toBeDefined();
  expect(links["self"]).toBeDefined();
  
  let validEndpoints = ['self','events','eventSeries','venues','mountainAreas','lifts','trails','snowparks','agents','mediaObjects']
  let linksKeys = Object.keys(links);

  let pointsToSomeEndpoint = validEndpoints.some(r=> linksKeys.includes(r))
  expect(pointsToSomeEndpoint).toBe(true);

  let onlyValidEndpoints = linksKeys.every( key => validEndpoints.includes(key))
  expect(onlyValidEndpoints).toBe(true);
  
});

test('Version home route returns content-type "application/vnd.api+json"', () => {
  expect(headers['content-type']).toEqual(expect.stringContaining('application/vnd.api+json'));
});

test('Version home route returns status 200 OK', () => {
  expect(status).toEqual(200);
});
