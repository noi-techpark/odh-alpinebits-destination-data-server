const {
  parseLanguageFilter,
  parseLastUpdateFilter,
  parseGeometriesFilter,
} = require("./common");

function getSnowparkFilterQuery(request) {
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

// These are only the categories that actually exist in the endpoint, not all possible values!
const snowparkCategoriesMap = {
  "odh/piste": "piste",
  "odh/snowpark": "snowpark",
  "odh/weitere-pisten": "weitere pisten",
};

module.exports = {
  getSnowparkFilterQuery,
};