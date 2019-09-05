const axios = require('axios');

const instance = axios.create({
  baseURL: 'http://tourism.opendatahub.bz.it/api',
  timeout: 2000,
  // headers: {'X-Custom-Header': 'foobar'}
});

function getEvent(onSuccess, onError) {
  return instance.get('/Event');
}

module.exports.getEvent = getEvent;
