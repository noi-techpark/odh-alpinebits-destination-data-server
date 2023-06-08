// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const Ajv = require('ajv');

const ajvOptions = { 
  verbose: false,
  allErrors: true 
}; 

const jsonapiSchema = require('./schemas/jsonapi.schema.json');
let ajv = new Ajv(ajvOptions);
let jsonapiValidation = ajv.compile(jsonapiSchema);

function getValidator(filename) {
  ajv = new Ajv(ajvOptions);
  let schema = require(filename);
  return ajv.compile(schema);
}

let eventsValidator = getValidator('./schemas/events.schema.json');
let eventsIdValidator = getValidator('./schemas/events.id.schema.json');
let eventsMediaValidator = getValidator('./schemas/events.id.multimediadescriptions.schema.json');
let eventsPublisherValidator = getValidator('./schemas/events.id.publisher.schema.json');
let eventsOrganizersValidator = getValidator('./schemas/events.id.organizers.schema.json');
let eventsVenuesValidator = getValidator('./schemas/events.id.venues.schema.json');
let liftsValidator = getValidator('./schemas/lifts.schema.json');
let liftsIdValidator = getValidator('./schemas/lifts.id.schema.json');
let liftsMediaValidator = getValidator('./schemas/lifts.id.multimediadescriptions.schema.json');
let trailsValidator = getValidator('./schemas/trails.schema.json');
let trailsIdValidator = getValidator('./schemas/trails.id.schema.json');
let trailsMediaValidator = getValidator('./schemas/trails.id.multimediadescriptions.schema.json');
let snowparksValidator = getValidator('./schemas/snowparks.schema.json');
let snowparksIdValidator = getValidator('./schemas/snowparks.id.schema.json');
let snowparksMediaValidator = getValidator('./schemas/snowparks.id.multimediadescriptions.schema.json');
let mountainAreasValidator = getValidator('./schemas/mountainareas.schema.json');
let mountainAreasIdValidator = getValidator('./schemas/mountainareas.id.schema.json');
let mountainAreasMediaValidator = getValidator('./schemas/mountainareas.id.multimediadescriptions.schema.json');
let mountainAreasAreaOwnerValidator = getValidator('./schemas/mountainareas.id.areaowner.schema.json');
let mountainAreasLiftsValidator = getValidator('./schemas/mountainareas.id.lifts.schema.json');
let mountainAreasTrailsValidator = getValidator('./schemas/mountainareas.id.trails.schema.json');
let mountainAreasSnowparksValidator = getValidator('./schemas/mountainareas.id.snowparks.schema.json');
let eventSeriesValidator = getValidator('./schemas/eventseries.schema.json');
let eventSeriesIdValidator = getValidator('./schemas/eventseries.id.schema.json');
let eventSeriesMediaValidator = getValidator('./schemas/eventseries.id.multimediadescriptions.schema.json');

module.exports = {
  validateEvents: (message) => validate(eventsValidator, message),
  validateEventsId: (message) => validate(eventsIdValidator, message),
  validateEventsMedia: (message) => validate(eventsMediaValidator, message),
  validateEventsPublisher: (message) => validate(eventsPublisherValidator, message),
  validateEventsOrganizers: (message) => validate(eventsOrganizersValidator, message),
  validateEventsVenues: (message) => validate(eventsVenuesValidator, message),
  validateLifts: (message) => validate(liftsValidator, message),
  validateLiftsId: (message) => validate(liftsIdValidator, message),
  validateLiftsMedia: (message) => validate(liftsMediaValidator, message),
  validateTrails: (message) => validate(trailsValidator, message),
  validateTrailsId: (message) => validate(trailsIdValidator, message),
  validateTrailsMedia: (message) => validate(trailsMediaValidator, message),
  validateSnowparks: (message) => validate(snowparksValidator, message),
  validateSnowparksId: (message) => validate(snowparksIdValidator, message),
  validateSnowparksMedia: (message) => validate(snowparksMediaValidator, message),
  validateMountainAreas: (message) => validate(mountainAreasValidator, message),
  validateMountainAreasId: (message) => validate(mountainAreasIdValidator, message),
  validateMountainAreasMedia: (message) => validate(mountainAreasMediaValidator, message),
  validateMountainAreasAreaOwner: (message) => validate(mountainAreasAreaOwnerValidator, message),
  validateMountainAreasLifts: (message) => validate(mountainAreasLiftsValidator, message),
  validateMountainAreasTrails: (message) => validate(mountainAreasTrailsValidator, message),
  validateMountainAreasSnowparks: (message) => validate(mountainAreasSnowparksValidator, message),
  validateEventSeires: (message) => validate(eventSeriesValidator, message),
  validateEventSeiresId: (message) => validate(eventSeriesIdValidator, message),
  validateEventSeiresMedia: (message) => validate(eventSeriesMediaValidator, message),
  validateCategories: (message) => { throw new Error('Category validation is not yet implemented.') },
  validateCategoriesId: (message) => { throw new Error('Category validation is not yet implemented.') },
}

function validate(validation, message) {
  let isValid = jsonapiValidation(message);
  
  if(!isValid){
    console.log('ERROR: Generated message is INVALID against JSON:API v1.0!');
    // console.log('ERROR: '+message+' is INVALID! ' + JSON.stringify(validation.errors,null,1));
    console.log(JSON.stringify(jsonapiValidation.errors,null,2));
    // console.log(JSON.stringify(message,null,2));
    return isValid;
  }
  
  isValid = validation(message);

  if(isValid){
    console.log('OK: Generated message is VALID.');
  }
  else {
    console.log('ERROR: Generated message is INVALID against resource schema!');
    // console.log('ERROR: '+message+' is INVALID! ' + JSON.stringify(validation.errors,null,1));
    console.log(JSON.stringify(validation.errors,null,2));
    // console.log(JSON.stringify(message,null,2));
  }

  return isValid;
}
