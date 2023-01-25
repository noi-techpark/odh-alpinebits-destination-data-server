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
  headers: {
    "Content-Type": "application/vnd.api+json",
  },
});

module.exports = {
  axiosInstance,
  get: (url) =>
    axios.get(url, {
      timeout: TIMEOUT,
      auth: AUTH,
      baseURL: process.env.REF_SERVER_URL,
    }),
  post: (url, data) =>
    axios.post(url, data, {
      baseURL: process.env.REF_SERVER_URL,
      headers: {
        "Content-Type": "application/vnd.api+json",
      },
    }),
  patch: (url, data) =>
    axios.patch(url, data, {
      baseURL: process.env.REF_SERVER_URL,
      headers: {
        "Content-Type": "application/vnd.api+json",
      },
    }),
  delete: (url) =>
    axios.delete(url, {
      baseURL: process.env.REF_SERVER_URL,
    }),
};
