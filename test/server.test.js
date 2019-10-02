const utils = require('./utils');

test('Unknown route returns 404 NOT FOUND', () => {
  expect.assertions(1);
  return utils.axiosInstance.get('/i-dont-exist')
    .catch( (res) => {
      expect(res.response.status).toEqual(404);
    });
});
