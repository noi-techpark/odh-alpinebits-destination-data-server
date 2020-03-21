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

async function handleRequest(req, fetchFn, validateFn) {
  let response;

  try {
    console.log('> Dispatching request to the OpenDataHub connector...');
    data = await fetchFn(req);
    console.log('OK: Request completed.\n');
  }
  catch (error) {
    throw error;
  }

  try {
    console.log('> Validating generated message...');
    validateFn(data);
    return data;
  }
  catch (error) {
    console.log('ERROR: Failed to validate data!');
    console.log(error);
    throw errors.cantValidate;
  }
}

module.exports = {
  getEvents: req => handleRequest(req, odhCon.fetchEvents, val.validateEventArray),
  getEventById: req => handleRequest(req, odhCon.fetchEventById, val.validateEvent),
  getEventMedia: req => handleRequest(req, odhCon.fetchEventMediaObjects, val.validateMediaObjectArray),
  getEventPublisher: req => handleRequest(req, odhCon.fetchEventPublisher, val.validateAgent),
  getEventOrganizers: req => handleRequest(req, odhCon.fetchEventOrganizers, val.validateAgentNoPagesArray),
  getEventVenues: req => handleRequest(req, odhCon.fetchEventVenues, val.validateVenueNoPagesArray),
  getLifts: req => handleRequest(req, odhCon.fetchLifts, val.validateLiftArray),
  getLiftById: req => handleRequest(req, odhCon.fetchLiftById, val.validateLift),
  getLiftMedia: req => handleRequest(req, odhCon.fetchLiftMediaObjects, val.validateMediaObjectNoPagesArray),
  getTrails: req => handleRequest(req, odhCon.fetchTrails, val.validateTrailArray),
  getTrailById: req => handleRequest(req, odhCon.fetchTrailById, val.validateTrail),
  getTrailMedia: req => handleRequest(req, odhCon.fetchTrailMediaObjects, val.validateMediaObjectNoPagesArray),
  getSnowparks: req => handleRequest(req, odhCon.fetchSnowparks, val.validateSnowparkArray),
  getSnowparkById: req => handleRequest(req, odhCon.fetchSnowparkById, val.validateSnowpark),
  getSnowparkMedia: req => handleRequest(req, odhCon.fetchSnowparkMediaObjects, val.validateMediaObjectNoPagesArray),
  getMountainAreas: req => handleRequest(req, odhCon.fetchMountainAreas, val.validateMountainAreaArray),
  getMountainAreaById: req => handleRequest(req, odhCon.fetchMountainAreaById, val.validateMountainArea),
  getMountainAreaMedia: req => handleRequest(req, odhCon.fetchMountainAreaMedia, val.validateMediaObjectNoPagesArray),
  getMountainAreaOwner: req => handleRequest(req, odhCon.fetchMountainAreaOwner, val.validateAgent),
  getMountainAreaLifts: req => handleRequest(req, odhCon.fetchMountainAreaLifts, val.validateLiftNoPagesArray),
  getMountainAreaTrails: req => handleRequest(req, odhCon.fetchMountainAreaTrails, val.validateTrailNoPagesArray),
  getMountainAreaSnowparks: req => handleRequest(req, odhCon.fetchMountainAreaSnowparks, val.validateSnowparkNoPagesArray),
  getEventSeries: (req) => handleRequest(req, odhCon.fetchEventSeries, val.validateEventSeriesArray),
  getEventSeriesById: (req) => handleRequest(req, odhCon.fetchEventSeriesById, val.validateEventSeries),
  getEventSeriesMedia: req => handleRequest(req, odhCon.fetchEventSeriesMedia, val.validateMediaObjectNoPagesArray),
}

// validateAgentNoPagesArray
// validateEventNoPagesArray
// validateLiftNoPagesArray
// validateMediaObjectNoPagesArray
// validateVenueNoPagesArray
// validateTrailNoPagesArray
// validateSnowparkNoPagesArray
// validateMountainAreaNoPagesArray