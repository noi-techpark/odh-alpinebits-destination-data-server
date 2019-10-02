// isLanguageNested: true => object.property.it
// isLanguageNested: false => object.it.property
function transformMultilingualFields (source, target, fieldMapping, languageMapping, isLanguageNested, ignoreNullValues) {
  // TODO: languageMapping and fieldMapping must be lists of
  for (fieldEntry of fieldMapping) {
    let [sourceField, targetField] = fieldEntry;

    for (languageEntry of languageMapping) {
      let [sourceLanguage, targetLanguage] = languageEntry;

      if(!target[targetField])
        target[targetField] = {}

      if(isLanguageNested && source[sourceField] && (!ignoreNullValues || source[sourceField][sourceLanguage]))
        target[targetField][targetLanguage] = source[sourceField][sourceLanguage];
      else if (!isLanguageNested && source[sourceLanguage] && (!ignoreNullValues || source[sourceLanguage][sourceField]))
        target[targetField][targetLanguage] = source[sourceLanguage][sourceField];
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

module.exports.transformMultilingualFields = transformMultilingualFields;
module.exports.transformFields = transformFields;
module.exports.transformArrayFields = transformArrayFields;
module.exports.safeGet = safeGet;
