const val = require("../validator");
const odhCon = require("./odh-connector");
const errors = require("../errors");

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
    console.log("> Dispatching request to the OpenDataHub connector...");
    data = await fetchFn(req);
    console.log("OK: Request completed.\n");
  } catch (error) {
    throw error;
  }

  try {
    // TODO: enable data validation in tests (use environment variables)
    // console.log('> Validating generated message...');
    // validateFn(data);
    console.log("> Message validation is disabled...");
    return data;
  } catch (error) {
    console.log("ERROR: Failed to validate data!");
    console.log(error);
    throw errors.cantValidate;
  }
}

// TODO: implementing support for pagination in relationships is possible in most cases, even though irrelevant.
module.exports = {
  getMountainAreas: (req) => handleRequest(req, odhCon.fetchMountainAreas, val.validateMountainAreas),
  getMountainAreaById: (req) => handleRequest(req, odhCon.fetchMountainAreaById, val.validateMountainAreasId),
  getMountainAreaMedia: (req) => handleRequest(req, odhCon.fetchMountainAreaMedia, val.validateMountainAreasMedia),
  getMountainAreaOwner: (req) => handleRequest(req, odhCon.fetchMountainAreaOwner, val.validateMountainAreasAreaOwner),
  getMountainAreaLifts: (req) => handleRequest(req, odhCon.fetchMountainAreaLifts, val.validateMountainAreasLifts),
  getMountainAreaTrails: (req) => handleRequest(req, odhCon.fetchMountainAreaTrails, val.validateMountainAreasTrails),
  getMountainAreaSnowparks: (req) =>
    handleRequest(req, odhCon.fetchMountainAreaSnowparks, val.validateMountainAreasSnowparks),
  getEventSeries: (req) => handleRequest(req, odhCon.fetchEventSeries, val.validateEventSeires),
  getEventSeriesById: (req) => handleRequest(req, odhCon.fetchEventSeriesById, val.validateEventSeiresId),
  getEventSeriesMedia: (req) => handleRequest(req, odhCon.fetchEventSeriesMedia, val.validateEventSeiresMedia),
};
