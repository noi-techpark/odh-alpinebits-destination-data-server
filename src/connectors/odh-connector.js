const axios = require('axios');
const { getEventFilterQuery } = require('./filters/event-filters');
const { getLiftFilterQuery } = require('./filters/lift-filters');
const { getSnowparkFilterQuery } = require('./filters/snowpark-filters');
const { getTrailFilterQuery } = require('./filters/trail-filters');
const odh2ab = require ('../transformers/odh2alpinebits');
const errors = require ('../errors');
const { handleError } = require('../errors');
const sourceCategories = require('../../data/categories.data');
const mappings = require('./../transformers/odh2alpinebits/mappings')
require('custom-env').env();

const EVENT_PATH = 'Event';
const ACTIVITY_PATH = 'Activity';
const ACTIVITY_REDUCED_PATH = 'ActivityReduced';
const SKIAREA_PATH = 'Skiarea';
const SKIAREGION_PATH = 'Skiregion';
const ODH_TAG_MAP = {
  trails: 'ski alpin,ski alpin (rundkurs),rodelbahnen,loipen',
  lifts: 'aufstiegsanlagen',
  snowparks: 'snowpark'
}

const EVENT_SERIES_PATH = '../../data/event-series.data';

const axiosOpts = {
  baseURL: process.env.ODH_BASE_URL,
  timeout: process.env.ODH_TIMEOUT,
  headers: { 'Accept': 'application/json' }
}

function fetchEvents (request) {
  const paginationQuery = getPaginationQuery(request);
  const filtersQuery = getEventFilterQuery(request);
  const sortQuery = getEventSortQuery(request);
  const randomQuery = getRandomQuery(request);
  const searchQuery = getSearchQuery(request);
  const queryArray = [ ...paginationQuery, ...filtersQuery, ...sortQuery, ...searchQuery, ...randomQuery];
  
  const path = EVENT_PATH+'?'+queryArray.join('&');

  return fetch(path, request, odh2ab.transformEventArray)
}

function fetchLifts (request) {
  const pageQuery = getPaginationQuery(request);
  const filterQuery = getLiftFilterQuery(request);
  const searchQuery = getSearchQuery(request);
  const queryArray = [ ...pageQuery, ...filterQuery, ...searchQuery ];

  queryArray.push('odhtagfilter=aufstiegsanlagen')

  const path = ACTIVITY_PATH+'?'+queryArray.join('&');

  return fetch(path, request, odh2ab.transformLiftArray)
}

function fetchTrails (request) {
  const pageQuery = getPaginationQuery(request);
  const filterQuery = getTrailFilterQuery(request);
  const searchQuery = getSearchQuery(request);
  const queryArray = [ ...pageQuery, ...filterQuery, ...searchQuery ];

  // queryArray.push('odhtagfilter=ski alpin,ski alpin (rundkurs),rodelbahnen,loipen')
  queryArray.push('odhtagfilter=ski alpin,rodelbahnen,loipen')

  const path = ACTIVITY_PATH+"?"+queryArray.join("&");

  return fetch(path, request, odh2ab.transformTrailArray)
}

function fetchSnowparks (request) {
  const pageQuery = getPaginationQuery(request);
  const filterQuery = getSnowparkFilterQuery(request);
  const searchQuery = getSearchQuery(request);
  const queryArray = [ ...pageQuery, ...filterQuery, ...searchQuery ];

  queryArray.push('odhtagfilter=snowpark')

  let path = ACTIVITY_PATH+'?'+queryArray.join('&');

  return fetch(path, request, odh2ab.transformSnowparkArray)
}

function fechMockData (request, filePath, transformFn) {
  let res = loadMockDataFromFile(request, filePath);

  if(!res.data || res.status!==200){
    console.log('ERROR: Resource not found!');
    throw errors.notFound;
  }

  try {
    console.log('> Transforming data to the AlpineBits format...');
    const data = transformFn(res.data, request);
    console.log('OK: Successfully transformed data.\n');

    return data;
  }
  catch(error) {
    handleTransformationError(error);
  }
}

function loadMockDataFromFile(request, filePath) {
  let mockData;
  
  try {
    console.log(`\n> Loading mock data from '${filePath}'...`);
    mockData = require(filePath);
    console.log('OK: Data loaded.\n');
  }
  catch {
    console.log(`ERROR: Could not read file '${filePath}'!`);
    res.status = 404;
    return res;
  }

  let res = {};
  
  if(request.params.id) {
    data = mockData.find(resource => resource.id === request.params.id);
    if(data) {
      res.data = data;
      res.status = 200;
    }
    else {
      res.status = 404;
    }

    return res;
  }
  else {
    const { page } = request.query;
    let pageSize = page && page.size ? page.size : 10;
    let pageNumber = page && page.number ? page.number : 1;

    if(pageNumber > Math.ceil(mockData.length/pageSize)) {
      res.status = 404;
      return res;
    }

    res.data = {
      TotalResults:  mockData.length,
      TotalPages: Math.ceil(mockData.length/pageSize),
      CurrentPage: pageNumber,
      Seed: "null",
      Items: mockData.slice((pageNumber-1)*pageSize,pageNumber*pageSize)
    };
    res.status = 200;

    return res;
  }
}

function fetchResourceById(resource, transform) {
  return (
    function(request) {
      let path = resource+'/'+request.params.id;
      return fetch(path, request, transform);
    }
  );
}

/*
transform(openDataHubObject): a function to transform an OpenDataHub response into the AlpineBits format
  input: an object retrieved from the OpenDataHub API
  output: an object following the AlpineBits format
*/

async function fetch(path, request, transformFn) {
  const instance = axios.create(axiosOpts);
  let res;

  try {
    console.log(`\n> Fetching data from ${process.env.ODH_BASE_URL+path}`);
    res = await instance.get(path);

    if(typeof res.data === 'string')
      res.data = JSON.parse(res.data);
  }
  catch(error){
    handleConnectionError(error);
  }

  if(!res.data || res.status!==200){
    console.log('ERROR: Resource not found!');
    throw errors.notFound;
  }

  console.log('OK: Data received from the OpenDataHub API.\n');

  try {
    console.log('> Transforming data to the AlpineBits format...');
    const data = transformFn(res.data, request);
    console.log('OK: Sucessfully transformed data.\n');

    return data;
  }
  catch(error) {
    handleTransformationError(error);
  }
}

async function fetchMountainArea(request, field) {
  const instance = axios.create(axiosOpts);
  let areaId = request.params.id;
  let areaRes, regionRes;

  try {
    console.log(`\n> Fetching mountain area(s) from ${process.env.ODH_BASE_URL}...`);
    let areaPath = areaId ? SKIAREA_PATH+'/'+areaId : SKIAREA_PATH;
    let regionPath = areaId ? SKIAREGION_PATH+'/'+areaId : SKIAREGION_PATH;
    [ areaRes, regionRes] = await Promise.all([instance.get(areaPath), instance.get(regionPath)]); // TODO: insert filters here

    if(typeof areaRes.data === 'string')
      areaRes.data = JSON.parse(areaRes.data);

    if(typeof regionRes.data === 'string')
      regionRes.data = JSON.parse(regionRes.data);
  }
  catch(error) {
    handleConnectionError(error);
  }

  if((!areaRes.data && !regionRes.data) || (areaRes.status!==200 && regionRes.status!==200)) {
    console.log('ERROR: Resource not found!');
    throw errors.notFound;
  }

  console.log('OK: Data received from the OpenDataHub API.\n');
  let items, res;

  if(areaId) {
    res = areaRes.data || regionRes.data;
    items = [ res ];
  }
  else {
    let areas = areaRes.data.concat(regionRes.data);
    let pageSize = request.query.page.size;
    let pageNumber = request.query.page.number;

    items = areas.slice((pageNumber-1)*pageSize, pageSize*pageNumber);
    res = {
      TotalResults: areas.length,
      TotalPages: Math.ceil(areas.length/pageSize),
      CurrentPage: pageNumber,
      Items: items
    }
  }

  try {
    let subRequests = [];
    let opts = [];
    let odhTagMap = {
      lifts: 'aufstiegsanlagen',
      snowparks: 'snowpark',
      trails: 'ski alpin,ski alpin (rundkurs),rodelbahnen,loipen'
    }

    if(field && odhTagMap[field])
      opts = [ [field, odhTagMap[field]] ];
    else
      opts = Object.keys(odhTagMap).map(key => [key, odhTagMap[key]]);

    if(opts.length>0){
      items.forEach( area => subRequests=subRequests.concat(fetchMountainSubResources(request, area, opts)) );
      await Promise.all(subRequests);
    }
  }
  catch(error){
    handleConnectionError(error);
  }

  try {
    console.log('> Transforming data to the AlpineBits format...');
    const data = areaId ? odh2ab.transformMountainArea(res, request) : odh2ab.transformMountainAreaArray(res, request);
    console.log('OK: Sucessfully transformed data.\n');

    return data;
  }
  catch(error) {
    handleTransformationError(error);
  }
}

function fetchMountainSubResources(request, area, opts) {
  return opts.map( entry => {
    let [ relationship, odhTag ] = entry;

    const instance = axios.create(axiosOpts);
    const id = 'SkiRegionId' in area ? 'ska'+area.Id : 'skr'+area.Id;
    let path;

    if(opts.length===1 || relationship in request.query.include)
      path = `${ACTIVITY_PATH}?odhtagfilter=${odhTag}&areafilter=${id}&pagesize=1000`
    else
      path = `${ACTIVITY_REDUCED_PATH}?odhtagfilter=${odhTag}&areafilter=${id}`

    console.log(`> Fetching ${relationship} from ${process.env.ODH_BASE_URL+path}...`);
    return instance.get(path)
      .then( res => {
        if(typeof res.data === 'string')
          res.data = JSON.parse(res.data);

        if(res.status!==200 || !res.data)
          area[relationship] = [];
        else if('Items' in res.data)
          area[relationship] = res.data.Items;
        else
          area[relationship] = res.data;

        console.log(`OK: Received the ${relationship} of area ${area.Id}.`);
      })
      .catch( error => {
        console.log(`ERROR: Failed to fetch ${relationship} for area ${area.Id}`);
        area[relationship] = [];
      });
  })
}

function fetchMountainAreaDependentRelationship(request, transformFn) {
  const id = request.params.id;
  let basePath = id.includes('SKI') ? SKIAREA_PATH : SKIAREGION_PATH;
  let path = `${basePath}/${id}`;

  return fetch(path, request, transformFn);
}

function fetchMountainAreaIndependentRelationship(request, relationship, transformFn) {
  const odhTag = ODH_TAG_MAP[relationship]
  const areaId = request.params.id;
  const id = areaId.includes('SKI') ? 'ska'+areaId : 'skr'+areaId;
  let path = `${ACTIVITY_PATH}?odhtagfilter=${odhTag}&areafilter=${id}&pagesize=1000`
  
  return fetch(path, request, transformFn);
}

// async function fetchCategories(request, transformArray) {
//   // fetch event topics from ODH
//   const instance = axios.create(axiosOpts);
//   let res;

//   try {
//     console.log(`\n> Fetching event topics(s) from ${process.env.ODH_BASE_URL}...`);
//     let eventTopicsPath = 'EventTopics';
//     res = await instance.get(eventTopicsPath)

//     if(typeof res.data === 'string') {
//       res.data = JSON.parse(res.data);
//     }
//   }
//   catch(error) {
//     handleConnectionError(error);
//   }

//   if((!res.data) || (res.status!==200)) {
//     console.log('ERROR: Resource not found!');
//     throw errors.notFound;
//   } else {
//     console.log('OK: categories data received from ODH API');
//   }

//   // transform data and filter out those without a category mapping
//   res.data = odh2ab.transformCategoryArray(res.data,request)

//   return res.data
// }

// async function fetchCategory(request/*, odh2ab.transformCategory*/) {
//   // fetch event topics from ODH
//   const instance = axios.create(axiosOpts);
//   let res;

//   try {
//     console.log(`\n> Fetching event topic from ${process.env.ODH_BASE_URL}...`);
//     let eventTopicsPath = 'EventTopics';
//     let regex = /(odh|schema)+\:\w(\w|-)*/;
//     let topicId = mappings.eventCategoryToTopicId[request.selfUrl.match(regex)[0]];
//     // let activityTypesPath = 'ActivityTypes';
//     // [ areaRes, regionRes] = await Promise.all([instance.get(eventTopicsPath), instance.get(activityTypesPath)]); // TODO: insert filters here
//     console.log('Making request to: ', `${eventTopicsPath}/${topicId}`, topicId, request.selfUrl);
//     res = await instance.get(`${eventTopicsPath}/${topicId}`)

//     if(typeof res.data === 'string') {
//       res.data = JSON.parse(res.data);
//     }
//   }
//   catch(error) {
//     handleConnectionError(error);
//   }

//   if((!res.data) || (res.status!==200)) {
//     console.log('ERROR: Resource not found!');
//     throw errors.notFound;
//   } else {
//     console.log('OK: categories data received from ODH API');
//   }

//   // transform data and filter out those without a category mapping

//   res.data = odh2ab.transformCategory(res.data,request)

//   // return data

//   return res.data
// }

async function fetchCategories(request, transformArray) {
  const data = {
    Items: Object.values(sourceCategories),
  }

  data.TotalResults = data.Items.length
  data.CurrentPage = 1
  data.TotalPages = 1

  return transformArray(data,request);
}

async function fetchCategory(request, transformObject) {
  return transformObject(sourceCategories[request.params.id],request);
}

function handleConnectionError(error) {
  console.log(error);

  if(error.code==='ENOTFOUND'){
    console.log('ERROR: OpenDataHub API unavailable!');
    throw errors.gatewayUnavailable;
  }

  if(error.code==='ECONNABORTED'){
    console.log('ERROR: Connection to the OpenDataHub API aborted!');
    throw errors.gatewayTimeout;
  }

  console.log('ERROR: Could not connect to the OpenDataHub API!');
  throw errors.serverFailed;
}

function handleTransformationError(error) {
  if(!error.status) {
    console.log(error);
    console.log('ERROR: Failed to transform the input data!');
    throw errors.cantTransform;
  } else {
    throw error
  }
}

function getPaginationQuery(request) {
  const { page } = request.query;
  let pageArray = []

  if (page) {
    if (page.size)
      pageArray.push('pagesize='+page.size);
    if (page.number)
      pageArray.push('pagenumber='+page.number);
  }
  return pageArray;
}

function getSearchQuery(request) {
  const { search } = request.query;
  let result = [];

  if(!search || typeof search === 'string') {
    // At the moment, we only support name searches
    return result;
  }

  Object.keys(search).forEach(searchedField => {
    switch(searchedField) {
      case 'name':
        result.push(`searchfilter=${search.name}`);
      default:
        // At the moment, we only support name searches
    }
  })

  return result;
}

function getEventSortQuery(request) {
  const { sort } = request.query;
  let sortArray = [];

  if (typeof sort === 'string') {
    switch (sort) {
      case "startDate":
        sortArray.push("sort=asc");
        break;
      case "-startDate":
        sortArray.push("sort=desc");
        break;
      default:
        // at the moment, other sorting options are not supported
        sortArray.push("sort=desc");
        break;
    }
  } else if(!request.query.random) {
    sortArray.push("sort=desc");
  }
  
  return sortArray;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomQuery(request) {
  let random = Number(request.query.random);

  if(isNaN(random)) {
    return [];
  }
  
  random = random === 0 ? getRandomInt(1,50) : random;
  
  return [ `seed=${random}` ];
}

module.exports = {
  fetchEvents,
  fetchEventById: fetchResourceById(EVENT_PATH, odh2ab.transformEvent),
  fetchEventPublisher: fetchResourceById(EVENT_PATH, odh2ab.transformPublisherRelationship),
  fetchEventMediaObjects: fetchResourceById(EVENT_PATH, odh2ab.transformMultimediaDescriptionsRelationship),
  fetchEventOrganizers: fetchResourceById(EVENT_PATH, odh2ab.transformOrganizersRelationship),
  fetchEventVenues: fetchResourceById(EVENT_PATH, odh2ab.transformVenuesRelationship),
  fetchLifts,
  fetchLiftById: fetchResourceById(ACTIVITY_PATH, odh2ab.transformLift),
  fetchLiftMediaObjects: fetchResourceById(ACTIVITY_PATH, odh2ab.transformMultimediaDescriptionsRelationship),
  fetchTrails,
  fetchTrailById: fetchResourceById(ACTIVITY_PATH, odh2ab.transformTrail),
  fetchTrailMediaObjects: fetchResourceById(ACTIVITY_PATH, odh2ab.transformMultimediaDescriptionsRelationship),
  fetchSnowparks,
  fetchSnowparkById: fetchResourceById(ACTIVITY_PATH, odh2ab.transformSnowpark),
  fetchSnowparkMediaObjects: fetchResourceById(ACTIVITY_PATH, odh2ab.transformMultimediaDescriptionsRelationship),
  fetchMountainAreas: request => fetchMountainArea(request, null), // TODO: support mountain areas filters
  fetchMountainAreaById: request => fetchMountainArea(request, null),
  fetchMountainAreaMedia: request => fetchMountainAreaDependentRelationship(request, odh2ab.transformAreaMultimedDescriptionsRelationship),
  fetchMountainAreaOwner: request => fetchMountainAreaDependentRelationship(request, odh2ab.transformAreaOwnerRelationship),
  fetchMountainAreaLifts: request => fetchMountainAreaIndependentRelationship(request, 'lifts', odh2ab.transformLiftArray),
  fetchMountainAreaTrails: request => fetchMountainAreaIndependentRelationship(request, 'trails', odh2ab.transformTrailArray),
  fetchMountainAreaSnowparks: request => fetchMountainAreaIndependentRelationship(request, 'snowparks', odh2ab.transformSnowparkArray),
  fetchEventSeries: request => fechMockData(request, EVENT_SERIES_PATH, odh2ab.transformEventSeriesArray),
  fetchEventSeriesById: request => fechMockData(request, EVENT_SERIES_PATH, odh2ab.transformEventSeries),
  fetchEventSeriesMedia: request => fechMockData(request, EVENT_SERIES_PATH, odh2ab.transformMockMultimediaDescriptionsRelationship),
  fetchCategories: request => fetchCategories(request, odh2ab.transformCategoryArray),
  fetchCategoryById: request => fetchCategory(request, odh2ab.transformCategory),
}
