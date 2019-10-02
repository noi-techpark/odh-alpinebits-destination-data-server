const axios = require('axios');

const baseURL = 'http://localhost:8080'

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 300000,
});

module.exports = {
  baseURL,
  axiosInstance
};
