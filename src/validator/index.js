const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const eventSchema = require('./schemas/event.schema');
const venueSchema = require('./schemas/venue.schema');
const agentSchema = require('./schemas/agent.schema');
const mediaObjectSchema = require('./schemas/mediaobject.schema');
const liftSchema = require('./schemas/lift.schema');

let ajv = new Ajv({ verbose: false });

let eventAjv = ajv.compile(eventSchema);
let venueAjv = ajv.compile(venueSchema);
let mediaObjectAjv = ajv.compile(mediaObjectSchema);
let agentAjv = ajv.compile(agentSchema);
let liftAjv = ajv.compile(liftSchema);

module.exports = {
  validateEvent: (object) => validateObject(eventAjv, object),
  validateEventArray: (array) => validateArray(eventAjv, array),
  validateVenueArray: (object) => validateObject(venueAjv, object),
  validateMediaObjectArray: (array) => validateArray(mediaObjectAjv, array),
  validateAgent: (object) => validateObject(agentAjv, object),
  validateAgentArray: (array) => validateArray(agentAjv, array),
  validateLift: (object) => validateObject(liftAjv, object),
  validateLiftArray: (object) => validateArray(liftAjv, object)
}

function validateObject(validation, object){
  let result = { valid: [], invalid: [] }
  validate(validation, object, result);
  return result;
}

function validateArray(validation, array){
  let result = { valid: [], invalid: [] }
  for (object of array)
    validate(validation, object, result);
  return result;
}

function validate(validation, object, result) {
  let isValid = validation(object);

  if(isValid){
    console.log('OK: Object <'+object.id+'> is VALID.');
    result.valid.push(object);
  }
  else {
    let message = object && object.id ? 'Object <'+object.id+'>' : 'Data';
    console.log('ERROR: '+message+' is INVALID!');
    result.invalid.push(object);
    console.log(validation.errors);
  }
}
