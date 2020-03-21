const utils = require('./utils');

let headers, status, data, links;

beforeAll( () => {
  return utils.axiosInstance.get('/')
    .then( (response) => {
      ({headers, status} = response);
      ({data, links} = response.data);
    })
})

test('Home route returns correct body', () => {
  expect(data).toEqual(null);
  expect(links).toBeDefined();
  expect(links["self"]).toBeDefined();
  expect(links["1.0"]).toBeDefined();
  
});

test('Home route returns content-type "application/vnd.api+json"', () => {
  expect(headers['content-type']).toEqual(expect.stringContaining('application/vnd.api+json'));
});

test('Home route returns status 200 OK', () => {
  expect(status).toEqual(200);
});
