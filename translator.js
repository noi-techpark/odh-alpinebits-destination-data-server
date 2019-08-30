// isLanguageNested: true => object.property.it
// isLanguageNested: false => object.it.property
module.exports.translateMultilingualFields = (source, target, fieldMapping, languageMapping, isLanguageNested) => {
  // TODO: languageMapping and fieldMapping must be lists of
  for (fieldEntry of fieldMapping) {
    let [sourceField, targetField] = fieldEntry;

    for (languageEntry of languageMapping) {
      let [sourceLanguage, targetLanguage] = languageEntry;

      if(!target[targetField])
        target[targetField] = {}

      if(isLanguageNested && source[sourceField])
        target[targetField][targetLanguage] = source[sourceField][sourceLanguage];
      else if (!isLanguageNested && source[sourceLanguage])
        target[targetField][targetLanguage] = source[sourceLanguage][sourceField];
    }
  }
}

module.exports.translateFields = (source, target, fieldMapping, valueMapping = {}) => {
  for (fieldEntry of fieldMapping) {
    let [sourceField, targetField] = fieldEntry;
    target[targetField] = valueMapping[sourceField] ? valueMapping[sourceField][source[sourceField]] : source[sourceField];
  }
}

// TODO currently unused. Check later...
module.exports.translateArrayFields = (source, target, fieldMapping, valueMapping = {}) => {
  for (fieldEntry of fieldMapping) {
    const [sourceField, targetField] = fieldEntry;
    target[targetField] = [];

    for (sourceItem of source[sourceField]) {
       const targetItem = valueMapping[sourceField] ? valueMapping[sourceField][sourceItem] : sourceItem;
       target[targetField].push(targetItem);
    }
  }
}
