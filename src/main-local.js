const fs = require('fs');
const { transformEvent } = require ('./transformers/odh2alpinebits');
const { serializeEvent } = require ('./serializers/jsonapi-serializer');
const { validateEventList } = require ('./validators/validator');

// small dataset with 33 events
// const inputFile = 'input/events-with-image.json';

// medium dataset with 500 events (~5MB)
const inputFile = 'input/events.json';

// large dataset with 25000 events (~190MB)
// const inputFile = 'input/events-all.json';

const outputFile = 'output/result.json';

console.log('Reading `' + inputFile + '`...');
let dataOdh = JSON.parse(fs.readFileSync(inputFile));
console.log('OK: Input file loaded.\n')

console.log('Transforming input data (' + dataOdh.Items.length + ' objects)...');

const handleSuccess = (source, target) => {
  console.log('OK: Sucessfully transformed data.\n');
}

const handleError = (exception, source) => {
  console.log('ERROR: Failed to transform the input data!');
  throw exception;
}

let dataAlpineBits = transformEvent(dataOdh.Items, handleSuccess, handleError);

console.log('Validating AlpineBits objects...');

let validation = validateEventList(dataAlpineBits);

console.log('OK: Objects validated (valid:'+validation.valid.length+', invalid: '+validation.invalid.length+')\n');

console.log('Serializing objects in JSON:API format...');

let dataJsonApi = serializeEvent(dataAlpineBits, true);

console.log('OK: Sucessfully serialized objects.\n');

console.log('Saving serialized data in `'+outputFile+'`...');

let outputData = JSON.stringify(dataJsonApi, null, 2);

fs.writeFile(outputFile, outputData, function (err) {
  if (err){
    console.log('ERROR: Could not create file!')
    throw err;
  }
  else
    console.log('OK: Output file created.')

});
