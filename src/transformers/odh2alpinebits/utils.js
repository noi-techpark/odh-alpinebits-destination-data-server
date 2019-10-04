var sanitizeHtml = require('sanitize-html');

const languageMapping = [
  ['it','ita'],
  ['en','eng'],
  ['de','deu']
]

// isLanguageNested: true => object.property.it
// isLanguageNested: false => object.it.property
function transformMultilingualFields (source, target, fieldMapping, languageMapping, isLanguageNested, ignoreNullValues) {
  // TODO: languageMapping and fieldMapping must be lists of
  sanitizeOpts = {
    allowedTags: [],
    allowedAttributes: {}
  };

  for (fieldEntry of fieldMapping) {
    let [sourceField, targetField] = fieldEntry;

    for (languageEntry of languageMapping) {
      let [sourceLanguage, targetLanguage] = languageEntry;

      if(!target[targetField])
        target[targetField] = {}

      if(isLanguageNested && source[sourceField] && (!ignoreNullValues || source[sourceField][sourceLanguage]))
        target[targetField][targetLanguage] = sanitizeHtml(source[sourceField][sourceLanguage], sanitizeOpts);
      else if (!isLanguageNested && source[sourceLanguage] && (!ignoreNullValues || source[sourceLanguage][sourceField]))
        target[targetField][targetLanguage] = sanitizeHtml(source[sourceLanguage][sourceField], sanitizeOpts);
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

module.exports = {
  transformMultilingualFields,
  transformFields,
  transformArrayFields,
  safeGet,
  transformBasicProperties,
  transformMetadata,
  languageMapping
}
