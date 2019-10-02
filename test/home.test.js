const utils = require('./utils');

let headers, status, meta, data, links;

beforeAll( () => {
  return utils.axiosInstance.get('/')
    .then( (response) => {
      ({headers, status} = response);
      ({meta, data, links} = response.data);
    })
})

test('Home route exists', () => {
  expect(data).toBeDefined();
});

test('Home route returns content-type "application/vnd.api+json"', () => {
  expect(headers['content-type']).toEqual(expect.stringContaining('application/vnd.api+json'));
});

test('Home route returns status 200 OK', () => {
  expect(status).toEqual(200);
});
