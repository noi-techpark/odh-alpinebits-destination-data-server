const shajs = require('sha.js')
const sanitizeHtml = require('sanitize-html');
const templates = require('./templates');

const languageMapping = [
  ['it','ita'],
  ['en','eng'],
  ['de','deu']
]

const htmlSanitizeOpts = {
  allowedTags: [],
  allowedAttributes: {}
};

// isLanguageNested: true => object.property.it
// isLanguageNested: false => object.it.property
function transformMultilingualFields (source, target, fieldMapping, languageMapping, isLanguageNested, ignoreNullValues) {
  for (fieldEntry of fieldMapping) {
    let [sourceField, targetField] = fieldEntry;

    for (languageEntry of languageMapping) {
      let [sourceLanguage, targetLanguage] = languageEntry;

      if(!target[targetField])
        target[targetField] = {}

      if(isLanguageNested && source[sourceField] && (!ignoreNullValues || source[sourceField][sourceLanguage]))
        target[targetField][targetLanguage] = sanitizeHtml(source[sourceField][sourceLanguage], htmlSanitizeOpts);
      else if (!isLanguageNested && source[sourceLanguage] && (!ignoreNullValues || source[sourceLanguage][sourceField]))
        target[targetField][targetLanguage] = sanitizeHtml(source[sourceLanguage][sourceField], htmlSanitizeOpts);
    }
  }
}

function transformFields (source, target, fieldMapping, valueMapping = {}) {
  for (fieldEntry of fieldMapping) {
    let [sourceField, targetField] = fieldEntry;
    target[targetField] = valueMapping[sourceField] ? valueMapping[sourceField][source[sourceField]] : source[sourceField];
  }
}

// TODO currently unused. Check later...
function transformArrayFields (source, target, fieldMapping, valueMapping = {}) {
  for (fieldEntry of fieldMapping) {
    const [sourceField, targetField] = fieldEntry;
    target[targetField] = [];

    for (sourceItem of source[sourceField]) {
       const targetItem = valueMapping[sourceField] ? valueMapping[sourceField][sourceItem] : sourceItem;
       target[targetField].push(targetItem);
    }
  }
}

function safeGet (path, object) {
  let value = path.reduce( (xs, x) => (xs && xs[x]) ? xs[x] : null, object );

  if(typeof value === 'string' || value instanceof String)
    return value.trim();

  return value;
}

function transformBasicProperties(source) {
  let target = {};
  let fieldMapping = [['Id','id']]
  transformFields(source, target, fieldMapping);

  // Basic textual descriptions
  if(source.Detail) {
    fieldMapping = [['Title','name'],['BaseText','description']];
    transformMultilingualFields(source.Detail, target, fieldMapping, languageMapping, false, true);
  }

  if(source.ContactInfos) {
    fieldMapping = [['Url', 'url']];
    transformMultilingualFields(source.ContactInfos, target, fieldMapping, languageMapping, false, true);
  }

  return target;
}

function transformMetadata(source) {
  target = {};
  target.lastUpdate = source.LastChange+'+02:00';
  target.dataProvider = "http://tourism.opendatahub.bz.it/";
  return target;
}

function transformOperationSchedule(operationSchedule) {
  let openingHours = []

  if(!operationSchedule)
    return openingHours;

  operationSchedule.forEach( entry => {
    let newEntry = templates.createObject('HoursSpecification');

    openingHours.push(newEntry);

    newEntry.validFrom = entry.Start.replace(/T.*/,'');
    newEntry.validTo = entry.Stop.replace(/T.*/,'');

    if(entry.OperationScheduleTime)
      entry.OperationScheduleTime.forEach( hours =>
        newEntry.hours.push({ opens: hours.Start, closes: hours.End})
      );
  })

  return openingHours;
}

function transformHowToArrive(detail) {
  let howToArrive = {};

  const deGetThere = safeGet(['de','GetThereText'], detail);
  const itGetThere = safeGet(['it','GetThereText'], detail);
  const enGetThere = safeGet(['en','GetThereText'], detail);

  if(deGetThere || itGetThere || enGetThere)
    howToArrive = {
      deu: sanitizeHtml(deGetThere, htmlSanitizeOpts),
      ita: sanitizeHtml(itGetThere, htmlSanitizeOpts),
      eng: sanitizeHtml(enGetThere, htmlSanitizeOpts)
    };

  return howToArrive;
}

function transformAddress(contactInfo, fields){
  let address = templates.createObject('Address');

  if(fields.includes('city'))
    address.city = {
      deu: safeGet(['de','City'], contactInfo),
      ita: safeGet(['it','City'], contactInfo),
      eng: safeGet(['en','City'], contactInfo)
    };

  if(fields.includes('country'))
    address.country = safeGet(['de','CountryCode'], contactInfo) ||
      safeGet(['it','CountryCode'], contactInfo) || safeGet(['en','CountryCode'], contactInfo);

  if(fields.includes('zipcode'))
    address.zipcode = safeGet(['de','ZipCode'], contactInfo) ||
      safeGet(['it','ZipCode'], contactInfo) || safeGet(['en','ZipCode'], contactInfo);

  address.region = {}

  return address;
}

function transformGeometry(gpsInfo, infoKeys, gpsPoints, gpsTrack){
  let geometry;

  if(gpsInfo && gpsInfo.length>=1) {
    if(gpsInfo.length===1) {
      geometry = templates.createObject('Point');
      geometry.coordinates = [gpsInfo[0].Longitude, gpsInfo[0].Latitude, gpsInfo[0].Altitude];
      return geometry;
    }
    else {
      geometry = templates.createObject('LineString');

      if(Array.isArray(infoKeys) && infoKeys.length===gpsInfo.length) {
        infoKeys.forEach(key => {
          let point = gpsInfo.find(p => p.Gpstype === key);
          if(point)
            geometry.coordinates.push([point.Longitude, point.Latitude, point.Altitude]);
        })
        return geometry;
      }

      else {
        gpsInfo.forEach(point =>
          geometry.coordinates.push([point.Longitude, point.Latitude, point.Altitude])
        )
        return geometry;
      }
    }
  }
  else if(gpsPoints && Object.keys(gpsPoints)) {
    console.log('Has GpsPoints:', Object.keys(gpsPoints).length);
    return geometry;
  }
  else if(gpsTrack && gpsTrack.length>=1) {
    console.log('Has GpsTrack:', gpsTrack.length);
    return geometry;
  }

  return geometry;
}

function transformMediaObject(mediaObject) {
  let newMediaObject = templates.createObject('MediaObject');

  const match = mediaObject.ImageUrl.match(/ID=(.*)/i);
  newMediaObject.id = match.length>=2 ? match[1] : mediaObject.ImageUrl;

  newMediaObject.contentType = 'image/jpeg'

  // ['Width','width'], ['Height','height']
  const imageFieldMapping = [ ['ImageUrl','url'], ['License','license'] ];

  const imageValueMapping = {
    License: {
      'CC0': 'CC0-1.0',
      'CC1': 'CC1-1.0'
    }
  }

  transformFields(mediaObject, newMediaObject, imageFieldMapping, imageValueMapping);

  // ['ImageTitle', 'name']
  const imageMultilingualFieldMapping = [ ['ImageDesc', 'description'] ];

  transformMultilingualFields(mediaObject, newMediaObject, imageMultilingualFieldMapping, languageMapping, true);

  const owner = templates.createObject('Agent');
  owner.name.ita = owner.name.deu = owner.name.eng = mediaObject.CopyRight;
  owner.id = shajs('sha256').update(mediaObject.CopyRight).digest('hex');
  newMediaObject.copyrightOwner = owner;

  return newMediaObject;
}

module.exports = {
  languageMapping,
  safeGet,
  transformMultilingualFields,
  transformFields,
  transformArrayFields,
  transformBasicProperties,
  transformMetadata,
  transformOperationSchedule,
  transformHowToArrive,
  transformAddress,
  transformGeometry,
  transformMediaObject,
}
