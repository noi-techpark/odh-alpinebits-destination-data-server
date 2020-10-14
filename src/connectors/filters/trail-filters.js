const {
  parseDateString,
  getLangInIso6391,
  parsePointDistance,
} = require("./common");

function getTrailFilterQuery(request) {
  const { filter } = request.query;
  let filtersArray = [];

  if (filter) {
    for (let filterName of Object.getOwnPropertyNames(filter)) {
      switch (filterName) {
        case "lang": // langfilter
          filtersArray.push("langfilter=" + getLangInIso6391(filter.lang));
          break;
        case "nearTo": {
          // latitude, longitude, and radius
          const { lat, lng, rad } = parsePointDistance(filter.nearTo);
          if (lat && lng && rad) {
            filtersArray.push("latitude=" + lat);
            filtersArray.push("longitude=" + lng);
            filtersArray.push("radius=" + rad);
          }
          break;
        }
        case "categories": // disabled: multiple usage of odhtagfilter
        //   filtersArray.push(
        //     "odhtagfilter=" + getMappedCategories(filter.categories)
        //   );
          break;
        case "updatedAfter": // updatefrom
          filtersArray.push(
            "updatefrom=" + parseDateString(filter.updatedAfter)
          );
          break;
        // distancefilter - does not work
        // altitudefilter - does not work
        // durationfilter - does not work
        // difficultyfilter - does not work
      }
    }
  }

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
