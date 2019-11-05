const utils = require('./utils');
const https = require('https');
require('custom-env').env();
const REJECT_UNAUTHORIZED_REQUESTS = JSON.parse(process.env.SSL_REJECT_UNAUTHORIZED);
const axios = require('axios').create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: REJECT_UNAUTHORIZED_REQUESTS,
    keepAlive: true,
  }),
});

describe(`Testing unknown route`, () => {
  test('Unknown route returns 404 NOT FOUND', () => {
    expect.assertions(1);
    return utils.axiosInstance.get('/i-dont-exist')
      .catch( (res) => {
        expect(res.response.status).toEqual(404);
      });
  });
});

describe(`Refuse request without authentication`, () => {
  let status, data;

  beforeAll( () => {
    return axios.get(process.env.REF_SERVER_URL+'/api/v1/events')
      .catch( res =>  ({data, status} = res.response) );
  });

  test('Test HTTP Status 401 Unauthorized', () => {
    expect(status).toEqual(401);
  });

  test('Test error message title', () => {
    expect(data.errors.length).toEqual(1);
    expect(data.errors[0].title).toEqual("No credentials were provided.");
  });
});

describe(`Refuse request with invalid username and password`, () => {
  let status, message;

  beforeAll( () => {
    return axios.get(process.env.REF_SERVER_URL+'/api/v1/events', { auth: { username: 'me', password: 'mypassword' }})
      .catch( res =>  ({data, status} = res.response) );
  });

  test('Test HTTP Status 401 Unauthorized', () => {
    expect(status).toEqual(401);
  });

  test('Test error message title', () => {
    expect(data.errors.length).toEqual(1);
    expect(data.errors[0].title).toEqual("Credentials rejected.");
  });
});
