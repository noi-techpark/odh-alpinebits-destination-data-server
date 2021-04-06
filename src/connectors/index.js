const val = require('../validator');
const odhCon = require('./odh-connector');
const errors = require('../errors');
const { DestinationDataError } = require('../errors');
const { Request } = require('../model/request/request');
const requestTransform = require('../model/request2odh/request_transform');
const responseTransform = require('../model/odh2destinationdata/response_transform');
const categoriesData = require('../../data/categories.data');
const featuresData = require('../../data/features.data');
const axios = require('axios');
const Ajv = new require("ajv");
const ajv = new Ajv();

const axiosOpts = {
  baseURL: process.env.ODH_BASE_URL,
  timeout: process.env.ODH_TIMEOUT,
  headers: { 'Accept': 'application/json' }
}

const EVENT_PATH = 'Event';
const ACTIVITY_PATH = 'Activity';

class Connector {
  static async fetch(odhPath, odhQueries) {
    try {
      const fullPath = odhQueries ? `${odhPath}?${odhQueries}` : `${odhPath}`;
      const instance = axios.create(axiosOpts);
      
      console.log(`  Fetching data from ${process.env.ODH_BASE_URL + fullPath}`);
      
      const response = await instance.get(fullPath);
      
      if(!response.data || response.status !== 200) {
        throw errors.notFound;
      }

      return response;
    } catch (error) {
      console.log('beep', error);
      DestinationDataError.throwConnectionError(error);
    }
  }

  static async fetchOdhEvents(request) {
    const { id } = request.params;
    const path = id ? `${EVENT_PATH}/${id}` : EVENT_PATH;
    const odhQueries = requestTransform.transformEventQueries(request);
    return Connector.fetch(path, odhQueries);
  }

  static async fetchOdhLifts(request) {
    const { id } = request.params;
    const path = id ? `${ACTIVITY_PATH}/${id}` : ACTIVITY_PATH;
    const odhQueries = requestTransform.transformLiftQueries(request);

    return Connector.fetch(path, odhQueries);
  }

  static async fetchOdhSkiSlopes(request) {
    const { id } = request.params;
    const path = id ? `${ACTIVITY_PATH}/${id}` : ACTIVITY_PATH;
    const odhQueries = requestTransform.transformSkiSlopesQueries(request);

    return Connector.fetch(path, odhQueries);
  }

  static async fetchOdhSnowparks(request) {
    const { id } = request.params;
    const path = id ? `${ACTIVITY_PATH}/${id}` : ACTIVITY_PATH;
    const odhQueries = requestTransform.transformSnowparksQueries(request);

    return Connector.fetch(path, odhQueries);
  }

  // Returning an object with a "data" field is a trick to keep using "handleSimpleRequest"
  // It also requires that transformFn is aware it is getting instances of DestinationData resources already
  static fetchCategories(request) {
    const { id } = request.params;
    const { page } = request.query;

    if(id) {
      return { data: categoriesData.categoriesMap[id] };
    }

    if(page) {
      const { size, number } = page;
      const firstIndex = size*number - 1;
      const lastIndex = firstIndex + size;

      return { data: categoriesData.categories.slice(firstIndex, lastIndex) };
    }

    return { data: null };
  }

  static fetchFeatures(request) {
    const { id } = request.params;
    const { page } = request.query;
    
    if(id) {
      DestinationDataError.throwConnectionError({status: 404});
    }

    if(page) {
      return { data: [] };
    }

    return { data: null };
  }

  static async handleSimpleRequest(expressRequest, isCollectionRequest, fetchFn, transformFn, validateFn, schema) {
    console.log("  Validating request...");
    const request = new Request(expressRequest, isCollectionRequest);
    request.validate();

    console.log("  Fetching ODH data...");
    const odhResponse = await fetchFn(request);
    const odhData = odhResponse.data;

    console.log("  Transforming response into DestinationData format...");
    const data = transformFn(odhData, request);

    console.log("  Validating data...");
    validateFn(request, odhData, data, schema);

    console.log("  Request processed, send to client");

    return data;
  }

  static simpleValidate(request, odhData, ddData, schema) {
    const { page } = request.query;
    const { number } = page || {};
    const { pages } = ddData.meta;
    const { id } = request.params;

    if (number && (!pages || number > pages) && !id) {
      // checking for "id" avoids issues with default pagination
      const { meta, links } = ddData;
      DestinationDataError.throwPageNotFound(meta, links);
    }

    if (schema) {
      const validateSchema = ajv.compile(schema);
      const isValidAgainstSchema = validateSchema(ddData);

      if (!isValidAgainstSchema) {
        console.error(
          "  The input is not valid against the provided schema",
          JSON.stringify(validateSchema.errors, null, 2)
        );
      }
    } else {
      console.error("  Schema validation skipped: no schema provided");
    }
  }
}

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
    // TODO: enable data validation in tests (use environment variables)
    // console.log('> Validating generated message...');
    // validateFn(data);
    console.log('> Message validation is disabled...');
    return data;
  }
  catch (error) {
    console.log('ERROR: Failed to validate data!');
    console.log(error);
    throw errors.cantValidate;
  }
}

// TODO: implementing support for pagination in relationships is possible in most cases, even though irrelevant.
module.exports = {
  Connector,
  getEvents: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhEvents, responseTransform.transformToEventCollection, Connector.simpleValidate, schema),
  getEventById: (request, schema) => Connector.handleSimpleRequest(request, false, Connector.fetchOdhEvents, responseTransform.transformToEventObject, Connector.simpleValidate, schema),
  getEventCategories: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhEvents, responseTransform.transformToEventCategories, Connector.simpleValidate, schema),
  getEventContributors: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhEvents, responseTransform.transformToEventContributors, Connector.simpleValidate, schema),
  getEventEventSeries: (request, schema) => Connector.handleSimpleRequest(request, false, Connector.fetchOdhEvents, responseTransform.transformToEventEventSeries, Connector.simpleValidate, schema),
  getEventMultimediaDescriptions: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhEvents, responseTransform.transformToEventMultimediaDescriptions, Connector.simpleValidate, schema),
  getEventOrganizers: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhEvents, responseTransform.transformToEventOrganizers, Connector.simpleValidate, schema),
  getEventPublisher: (request, schema) => Connector.handleSimpleRequest(request, false, Connector.fetchOdhEvents, responseTransform.transformToEventPublisher, Connector.simpleValidate, schema),
  getEventSponsors: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhEvents, responseTransform.transformToEventSponsors, Connector.simpleValidate, schema),
  getEventSubEvents: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhEvents, responseTransform.transformToEventSubEvents, Connector.simpleValidate, schema),
  getEventVenues: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhEvents, responseTransform.transformToEventVenues, Connector.simpleValidate, schema),
  
  getLifts: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhLifts, responseTransform.transformToLiftCollection, Connector.simpleValidate, schema),
  getLiftById: (request, schema) => Connector.handleSimpleRequest(request, false, Connector.fetchOdhLifts, responseTransform.transformToLiftObject, Connector.simpleValidate, schema),
  getLiftCategories: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhLifts, responseTransform.transformToLiftCategories, Connector.simpleValidate, schema),
  getLiftConnections: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhLifts, responseTransform.transformToLiftConnections, Connector.simpleValidate, schema),
  getLiftMultimediaDescriptions: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhLifts, responseTransform.transformToLiftMultimediaDescriptions, Connector.simpleValidate, schema),

  getSkiSlopes: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhSkiSlopes, responseTransform.transformToSkiSlopeCollection, Connector.simpleValidate, schema),
  getSkiSlopeById: (request, schema) => Connector.handleSimpleRequest(request, false, Connector.fetchOdhSkiSlopes, responseTransform.transformToSkiSlopeObject, Connector.simpleValidate, schema),
  getSkiSlopeCategories: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhSkiSlopes, responseTransform.transformToSkiSlopeCategories, Connector.simpleValidate, schema),
  getSkiSlopeConnections: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhSkiSlopes, responseTransform.transformToSkiSlopeConnections, Connector.simpleValidate, schema),
  getSkiSlopeMultimediaDescriptions: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhSkiSlopes, responseTransform.transformToSkiSlopeMultimediaDescriptions, Connector.simpleValidate, schema),

  getSnowparks: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhSnowparks, responseTransform.transformToSnowparkCollection, Connector.simpleValidate, schema),
  getSnowparkById: (request, schema) => Connector.handleSimpleRequest(request, false, Connector.fetchOdhSnowparks, responseTransform.transformToSnowparkObject, Connector.simpleValidate, schema),
  getSnowparkCategories: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhSnowparks, responseTransform.transformToSnowparkCategories, Connector.simpleValidate, schema),
  getSnowparkConnections: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhSnowparks, responseTransform.transformToSnowparkConnections, Connector.simpleValidate, schema),
  getSnowparkFeatures: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhSnowparks, responseTransform.transformToSnowparkFeatures, Connector.simpleValidate, schema),
  getSnowparkMultimediaDescriptions: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchOdhSnowparks, responseTransform.transformToSnowparkMultimediaDescriptions, Connector.simpleValidate, schema),
  
  getCategories: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchCategories, responseTransform.transformToCategoryCollection, Connector.simpleValidate, schema),
  getCategoryById: (request, schema) => Connector.handleSimpleRequest(request, false, Connector.fetchCategories, responseTransform.transformToCategoryObject, Connector.simpleValidate, schema),
  getCategoryChildren: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchCategories, responseTransform.transformToCategoryChildren, Connector.simpleValidate, schema),
  getCategoryMultimediaDescriptions: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchCategories, responseTransform.transformToCategoryMultimediaDescriptions, Connector.simpleValidate, schema),
  getCategoryParents: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchCategories, responseTransform.transformToCategoryParents, Connector.simpleValidate, schema),
  
  getFeatures: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchFeatures, responseTransform.transformToFeatureCollection, Connector.simpleValidate, schema),
  getFeatureById: (request, schema) => Connector.handleSimpleRequest(request, false, Connector.fetchFeatures, responseTransform.transformToFeatureObject, Connector.simpleValidate, schema),
  getFeatureChildren: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchFeatures, responseTransform.transformToFeatureChildren, Connector.simpleValidate, schema),
  getFeatureMultimediaDescriptions: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchFeatures, responseTransform.transformToFeatureMultimediaDescriptions, Connector.simpleValidate, schema),
  getFeatureParents: (request, schema) => Connector.handleSimpleRequest(request, true, Connector.fetchFeatures, responseTransform.transformToFeatureParents, Connector.simpleValidate, schema),

  getMountainAreas: req => handleRequest(req, odhCon.fetchMountainAreas, val.validateMountainAreas),
  getMountainAreaById: req => handleRequest(req, odhCon.fetchMountainAreaById, val.validateMountainAreasId),
  getMountainAreaMedia: req => handleRequest(req, odhCon.fetchMountainAreaMedia, val.validateMountainAreasMedia),
  getMountainAreaOwner: req => handleRequest(req, odhCon.fetchMountainAreaOwner, val.validateMountainAreasAreaOwner),
  getMountainAreaLifts: req => handleRequest(req, odhCon.fetchMountainAreaLifts, val.validateMountainAreasLifts),
  getMountainAreaTrails: req => handleRequest(req, odhCon.fetchMountainAreaTrails, val.validateMountainAreasTrails),
  getMountainAreaSnowparks: req => handleRequest(req, odhCon.fetchMountainAreaSnowparks, val.validateMountainAreasSnowparks),
  getEventSeries: (req) => handleRequest(req, odhCon.fetchEventSeries, val.validateEventSeires),
  getEventSeriesById: (req) => handleRequest(req, odhCon.fetchEventSeriesById, val.validateEventSeiresId),
  getEventSeriesMedia: req => handleRequest(req, odhCon.fetchEventSeriesMedia, val.validateEventSeiresMedia),
  // getCategories: (req) => handleRequest(req, odhCon.fetchCategories, val.validateCategories),
  // getCategoryById: (req) => handleRequest(req, odhCon.fetchCategoryById, val.validateCategoriesId),
}
