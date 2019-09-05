const fs = require('fs');
const { transformEvent } = require ('./transformers/odh2alpinebits');
const { serializeEvent } = require ('./serializers/jsonapi-serializer');
const { validateEventList } = require ('./validators/validator');
const { getEvent } = require ('./connectors/odh-connector');

// large dataset with 25000 events (~190MB)
// const inputFile = 'input/events-all.json';

const outputFile = 'output/result.json';

console.log('Retrieving events from the OpenDataHub API (http://tourism.opendatahub.bz.it/api)...');

getEvent()
  .then(function (response) {
    let dataOdh = response.data;
    console.log('OK: Data received.\n');

    console.log('Transforming data to the AlpineBits format (' + dataOdh.Items.length + ' objects)...');
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

  })
  .catch(function (error) {
    console.log('ERROR: Could not get data from the OpenDataHub API!');
  });
