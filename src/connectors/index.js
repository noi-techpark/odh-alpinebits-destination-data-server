const ser = require('../serializer');
const val = require('../validator');
const odhCon = require('./odh-connector');
const errors = require('../errors');

/*
fetch(): an asynchronous function to retrieve data from a source data return

validate(alpineBitsObject): a function to validate an AlpineBits object
  input: an obejct following the AlpineBits format
  output: an object with validation results {valid: [], invalid: []}

serialize(alpineBitsObject): a function to serialize an AlpineBits object following the JSON:API standard
  input: an obejct following the AlpineBits format
  output: an JSON:API compliant object
*/

async function handleRequest(req, fetch, validate, serialize) {
  let response;

  try {
    console.log('> Dispatching req to OpenDataHub connector...');
    response = await fetch(req);
    console.log('OK: Request completed.\n');
  }
  catch (error) {
    throw error;
  }

  try {
    console.log('> Validating AlpineBits objects...');
    const validation = validate(response.data);
    console.log('OK: Objects validated (valid:'+validation.valid.length+', invalid: '+validation.invalid.length+')\n');
  }
  catch (error) {
    console.log('ERROR: Failed to validate data!');
    console.log(error);
    throw errors.cantValidate;
  }

  try {
    console.log('> Serializing objects in JSON:API format...');
    const dataJsonApi = serialize(response.data, req, response.meta);
    console.log('OK: Sucessfully serialized objects.\n');
    return dataJsonApi;
  }
  catch (error) {
    console.log('ERROR: Failed to serialize response data!');
    console.log(error);
    throw errors.cantSerialize;
  }
}

module.exports = {
  getEvents: req => handleRequest(req, odhCon.fetchEvents, val.validateEventArray, ser.serializeEventArray),
  getEventById: req => handleRequest(req, odhCon.fetchEventById, val.validateEvent, ser.serializeEvent),
  getEventMedia: req => handleRequest(req, odhCon.fetchEventMediaObjects, val.validateMediaObjectArray, ser.serializeMediaObjectArray),
  getEventPublisher: req => handleRequest(req, odhCon.fetchEventPublisher, val.validateAgent, ser.serializeAgent),
  getEventOrganizers: req => handleRequest(req, odhCon.fetchEventOrganizers, val.validateAgentArray, ser.serializeAgentArray),
  getEventVenues: req => handleRequest(req, odhCon.fetchEventVenues, val.validateVenueArray, ser.serializeVenueArray),
  getLifts: req => handleRequest(req, odhCon.fetchLifts, val.validateLiftArray, ser.serializeLiftArray),
  getLiftById: req => handleRequest(req, odhCon.fetchLiftById, val.validateLift, ser.serializeLift),
  getTrails: req => handleRequest(req, odhCon.fetchTrails, val.validateTrailArray, ser.serializeTrailArray),
  getTrailById: req => handleRequest(req, odhCon.fetchTrailById, val.validateTrail, ser.serializeTrail),
  getTrailMedia: req => handleRequest(req, odhCon.fetchTrailMediaObjects, val.validateMediaObjectArray, ser.serializeMediaObjectArray),
  getSnowparks: req => handleRequest(req, odhCon.fetchSnowparks, val.validateSnowparkArray, ser.serializeSnowparkArray),
  getSnowparkById: req => handleRequest(req, odhCon.fetchSnowparkById, val.validateSnowpark, ser.serializeSnowpark),
  getMountainAreas: req => handleRequest(req, odhCon.fetchMountainAreas, val.validateMountainAreaArray, ser.serializeMountainAreaArray),
  getMountainAreaById: req => handleRequest(req, odhCon.fetchMountainAreaById, val.validateMountainArea, ser.serializeMountainArea),
  getMountainAreaMedia: req => handleRequest(req, odhCon.fetchMountainAreaMedia, val.validateMediaObjectArray, ser.serializeMediaObjectArray),
  getMountainAreaOwner: req => handleRequest(req, odhCon.fetchMountainAreaOwner, val.validateAgent, ser.serializeAgent),
  getMountainAreaLifts: req => handleRequest(req, odhCon.fetchMountainAreaLifts, val.validateLiftArray, ser.serializeLiftArray),
  getMountainAreaTrails: req => handleRequest(req, odhCon.fetchMountainAreaTrails, val.validateTrailArray, ser.serializeTrailArray),
  getMountainAreaSnowparks: req => handleRequest(req, odhCon.fetchMountainAreaSnowparks, val.validateSnowparkArray, ser.serializeSnowparkArray),
  getEventSeries: (req) => handleRequest(req, odhCon.fetchEventSeries, val.validateEventSeriesArray, ser.serializeEventSeriesArray),
  getEventSeriesById: (req) => handleRequest(req, odhCon.fetchEventSeriesById, val.validateEventSeries, ser.serializeEventSeries),
  getSnowReports: (req) => handleRequest(req, odhCon.fetchSnowReports, val.validateSnowReportArray, ser.serializeSnowReports),
  getSnowReportById: (req) => handleRequest(req, odhCon.fetchSnowReportById, val.validateSnowReport, ser.serializeSnowReport),
}
