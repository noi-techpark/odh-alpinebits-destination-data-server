const {
  parseLanguageFilter,
  parseLastUpdateFilter,
  parseGeometriesFilter,
} = require("./common");

function getTrailFilterQuery(request) {
  const { filter } = request.query;
  let filtersArray = [];

  parseLanguageFilter(filter, filtersArray);
  parseLastUpdateFilter(filter, filtersArray);
  parseGeometriesFilter(filter, filtersArray);

  return filtersArray;
}

function getMappedCategories(categories) {
  if (Array.isArray(categories)) {
    let mappedCategories = categories.map(
      (category) => trailCategoriesMap[category]
    );
    return mappedCategories.join(",");
  }
}

const trailCategoriesMap = {
  "alpinebits/cross-country": "loipen",
  "alpinebits/ski-slope": "ski alpin",
  "alpinebits/sledge-slope": "rodelbahnen",
  "odh/eisbahnen": "eisbahnen",
  "odh/klassisch": "klassisch",
  "odh/klassisch-und-skating": "klassisch und skating",
  "odh/loipen": "loipen",
  "odh/piste": "piste",
  "odh/schienenrodelbahn": "schienenrodelbahn",
  "odh/schneebahnen": "schneebahnen",
  "odh/skating": "skating",
  "odh/ski-alpin": "ski alpin",
  "odh/rodelbahnen": "rodelbahnen",
  "odh/rodeln": "rodeln",
  "odh/weitere-pisten": "weitere pisten",
  "odh/weitere-rodeln": "weitere rodeln",
};

module.exports = {
  getTrailFilterQuery,
};
