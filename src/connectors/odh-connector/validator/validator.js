const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const eventSchema = require('./schemas/eventSchema');

const defaultParameters = {
  verbose: false
}

function validateEventData(data, parameters = defaultParameters){
  let result = {
    valid: [],
    invalid: []
  }

  let dataToValidate = Array.isArray(data) ? data : [data];

  for (object of dataToValidate)
    validateEvent(object, result);

  return result;
}

function validateEvent(object, result, parameters = defaultParameters) {
  let ajv = new Ajv(parameters);
  let validate = ajv.compile(eventSchema);
  let isValid = validate(object);

  if(isValid){
    console.log('OK: Event <'+object.id+'> is VALID.');
    result.valid.push(object);
  }
  else {
    let message = object && object.id ? 'Event <'+object.id+'>' : 'Data';
    console.log('ERROR: '+message+' is INVALID!');
    result.invalid.push(object);
    // console.log(JSON.stringify(validate.errors,null,2));
  }
}

module.exports.validateEventData = validateEventData;
