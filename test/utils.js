const axios = require('axios');
const https = require('https');
require('custom-env').env();
const REJECT_UNAUTHORIZED_REQUESTS = JSON.parse(process.env.SSL_REJECT_UNAUTHORIZED);

const TIMEOUT = 300000;
const AUTH = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD
}

const axiosInstance = axios.create({
  baseURL: process.env.REF_SERVER_URL,
  timeout: TIMEOUT,
  auth: AUTH,
  httpsAgent: new https.Agent({
    rejectUnauthorized: REJECT_UNAUTHORIZED_REQUESTS,
    keepAlive: true,
  }),
});

module.exports = {
  axiosInstance,
  get: url => axios.get(url, {
    timeout: TIMEOUT,
    auth: AUTH,
    httpsAgent: new https.Agent({
      rejectUnauthorized: REJECT_UNAUTHORIZED_REQUESTS,
      keepAlive: true,
    }),
  })
};
