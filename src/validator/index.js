const Ajv = require('ajv');

const jsonapiSchema = require('./schemas/jsonapi.schema.json');
const agentsSchema = require('./schemas/agents.schema.json');
const agentsArraySchema = require('./schemas/agents.array.schema.json');
const agentsNoPagesArraySchema = require('./schemas/agents.array.nopages.schema.json');
const eventsSchema = require('./schemas/events.schema.json');
const eventsArraySchema = require('./schemas/events.array.schema.json');
const eventsNoPagesArraySchema = require('./schemas/events.array.nopages.schema.json');
const eventSeriesSchema = require('./schemas/eventseries.schema.json');
const eventSeriesArraySchema = require('./schemas/eventseries.array.schema.json');
const liftsSchema = require('./schemas/lifts.schema.json');
const liftsArraySchema = require('./schemas/lifts.array.schema.json');
const liftsNoPagesArraySchema = require('./schemas/lifts.array.nopages.schema.json');
const mediaObjectsSchema = require('./schemas/mediaobjects.schema.json');
const mediaObjectsArraySchema = require('./schemas/mediaobjects.array.schema.json');
const mediaObjectsNoPagesArraySchema = require('./schemas/mediaobjects.array.nopages.schema.json');
const venuesSchema = require('./schemas/venues.schema.json');
const venuesArraySchema = require('./schemas/venues.array.schema.json');
const venuesNoPagesArraySchema = require('./schemas/venues.array.nopages.schema.json');
const trailsSchema = require('./schemas/trails.schema.json');
const trailsArraySchema = require('./schemas/trails.array.schema.json');
const trailsNoPagesArraySchema = require('./schemas/trails.array.nopages.schema.json');
const snowparksSchema = require('./schemas/snowparks.schema.json');
const snowparksArraySchema = require('./schemas/snowparks.array.schema.json');
const snowparksNoPagesArraySchema = require('./schemas/snowparks.array.nopages.schema.json');
const mountainAreasSchema = require('./schemas/mountainareas.schema.json');
const mountainAreasArraySchema = require('./schemas/mountainareas.array.schema.json');
const mountainAreasNoPagesArraySchema = require('./schemas/mountainareas.array.nopages.schema.json');

const ajvOptions = { 
  verbose: false,
  allErrors: true 
}; 

let ajv = new Ajv(ajvOptions);
let jsonapiValidation = ajv.compile(jsonapiSchema);

ajv = new Ajv(ajvOptions);
let agentsValidation = ajv.compile(agentsSchema);

ajv = new Ajv(ajvOptions);
let agentsArrayValidation = ajv.compile(agentsArraySchema);

ajv = new Ajv(ajvOptions);
let agentsNoPagesArrayValidation = ajv.compile(agentsNoPagesArraySchema);

ajv = new Ajv(ajvOptions);
let eventsValidation = ajv.compile(eventsSchema);

ajv = new Ajv(ajvOptions);
let eventsArrayValidation = ajv.compile(eventsArraySchema);

ajv = new Ajv(ajvOptions);
let eventsNoPagesArrayValidation = ajv.compile(eventsNoPagesArraySchema);

ajv = new Ajv(ajvOptions);
let eventSeriesValidation = ajv.compile(eventSeriesSchema);

ajv = new Ajv(ajvOptions);
let eventSeriesArrayValidation = ajv.compile(eventSeriesArraySchema);

ajv = new Ajv(ajvOptions);
let liftsValidation = ajv.compile(liftsSchema);

ajv = new Ajv(ajvOptions);
let liftsArrayValidation = ajv.compile(liftsArraySchema);

ajv = new Ajv(ajvOptions);
let liftsNoPagesArrayValidation = ajv.compile(liftsNoPagesArraySchema);

ajv = new Ajv(ajvOptions);
let mediaObjectsValidation = ajv.compile(mediaObjectsSchema);

ajv = new Ajv(ajvOptions);
let mediaObjectsArrayValidation = ajv.compile(mediaObjectsArraySchema);

ajv = new Ajv(ajvOptions);
let mediaObjectsNoPagesArrayValidation = ajv.compile(mediaObjectsNoPagesArraySchema);

ajv = new Ajv(ajvOptions);
let venuesValidation = ajv.compile(venuesSchema);

ajv = new Ajv(ajvOptions);
let venuesArrayValidation = ajv.compile(venuesArraySchema);

ajv = new Ajv(ajvOptions);
let venuesNoPagesArrayValidation = ajv.compile(venuesNoPagesArraySchema);

ajv = new Ajv(ajvOptions);
let trailsValidation = ajv.compile(trailsSchema);

ajv = new Ajv(ajvOptions);
let trailsArrayValidation = ajv.compile(trailsArraySchema);

ajv = new Ajv(ajvOptions);
let trailsNoPagesArrayValidation = ajv.compile(trailsNoPagesArraySchema);

ajv = new Ajv(ajvOptions);
let snowparksValidation = ajv.compile(snowparksSchema);

ajv = new Ajv(ajvOptions);
let snowparksArrayValidation = ajv.compile(snowparksArraySchema);

ajv = new Ajv(ajvOptions);
let snowparksNoPagesArrayValidation = ajv.compile(snowparksNoPagesArraySchema);

ajv = new Ajv(ajvOptions);
let mountainAreasValidation = ajv.compile(mountainAreasSchema);

ajv = new Ajv(ajvOptions);
let mountainAreasArrayValidation = ajv.compile(mountainAreasArraySchema);

ajv = new Ajv(ajvOptions);
let mountainAreasNoPagesArrayValidation = ajv.compile(mountainAreasNoPagesArraySchema);

module.exports = {
  validateAgent: (message) => validate(agentsValidation, message),
  validateAgentArray: (message) => validate(agentsArrayValidation, message),
  validateAgentNoPagesArray: (message) => validate(agentsNoPagesArrayValidation, message),
  validateEvent: (message) => validate(eventsValidation, message),
  validateEventArray: (message) => validate(eventsArrayValidation, message),
  validateEventNoPagesArray: (message) => validate(eventsNoPagesArrayValidation, message),
  validateEventSeries: (message) => validate(eventSeriesValidation, message),
  validateEventSeriesArray: (message) => validate(eventSeriesArrayValidation, message),
  validateLift: (message) => validate(liftsValidation, message),
  validateLiftArray: (message) => validate(liftsArrayValidation, message),
  validateLiftNoPagesArray: (message) => validate(liftsNoPagesArrayValidation, message),
  validateMediaObject: (message) => validate(mediaObjectsValidation, message),
  validateMediaObjectArray: (message) => validate(mediaObjectsArrayValidation, message),
  validateMediaObjectNoPagesArray: (message) => validate(mediaObjectsNoPagesArrayValidation, message),
  validateVenue: (message) => validate(venuesValidation, message),
  validateVenueArray: (message) => validate(venuesArrayValidation, message),
  validateVenueNoPagesArray: (message) => validate(venuesNoPagesArrayValidation, message),
  validateTrail: (message) => validate(trailsValidation, message),
  validateTrailArray: (message) => validate(trailsArrayValidation, message),
  validateTrailNoPagesArray: (message) => validate(trailsNoPagesArrayValidation, message),
  validateSnowpark: (message) => validate(snowparksValidation, message),
  validateSnowparkArray: (message) => validate(snowparksArrayValidation, message),
  validateSnowparkNoPagesArray: (message) => validate(snowparksNoPagesArrayValidation, message),
  validateMountainArea: (message) => validate(mountainAreasValidation, message),
  validateMountainAreaArray: (message) => validate(mountainAreasArrayValidation, message),
  validateMountainAreaNoPagesArray: (message) => validate(mountainAreasNoPagesArrayValidation, message),
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
