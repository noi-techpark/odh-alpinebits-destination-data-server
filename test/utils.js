const axios = require("axios");
require("custom-env").env("test");

const TIMEOUT = 300000;
const AUTH = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
};

const axiosInstance = axios.create({
  baseURL: process.env.REF_SERVER_URL,
  timeout: TIMEOUT,
  auth: AUTH,
});

module.exports = {
  axiosInstance,
  get: (url) =>
    axios.get(url, {
      timeout: TIMEOUT,
      auth: AUTH,
    }),
};
