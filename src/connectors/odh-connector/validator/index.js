const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const eventSchema = require('./schemas/eventSchema');

const params = {
  verbose: false
}

let ajv = new Ajv(params);
let validate = ajv.compile(eventSchema);

module.exports = {
  validateEvent: function (object) {
    let result = { valid: [], invalid: [] }
    validateEvent(object, result);
    return result;
  },
  validateEventArray: function (array) {
    let result = { valid: [], invalid: [] }
    for (object of array)
      validateEvent(object, result);
    return result;
  }
}

function validateEvent(object, result) {
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
