const axios = require('axios');
require('custom-env').env();

const axiosInstance = axios.create({
  baseURL: process.env.REF_SERVER_URL,
  timeout: 300000,
});

module.exports = {
  axiosInstance
};
