const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const eventSchema = require('./schemas/eventSchema');

const defaultParameters = {
  verbose: false
}

function validateEvent(object, parameters = defaultParameters) {
  let ajv = new Ajv(parameters);
  let validate = ajv.compile(eventSchema);
  return validate(object);
}

function validateEventList(list, parameters = defaultParameters) {
  let valid = [];
  let invalid = [];

  for (object of list) {
    let isValid = validateEvent(object);

    if(isValid){
      console.log('OK: Event <'+object.id+'> is VALID.');
      valid.push(object);
    }
    else {
      console.log('ERROR: Event <'+object.id+'> is INVALID!');
      invalid.push(object);
      // console.log(JSON.stringify(validate.errors,null,2));
    }
  }

  return ({valid, invalid});
}

module.exports.validateEvent = validateEvent;
module.exports.validateEventList = validateEventList;
