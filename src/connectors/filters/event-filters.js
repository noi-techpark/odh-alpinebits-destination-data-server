const {
  parseDateString,
  parsePointDistance,
  parseLanguageFilter,
  parseLastUpdateFilter,
} = require("./common");

function getEventFilterQuery(request) {
  const { filter } = request.query;
  let filtersArray = [];

  parseLanguageFilter(filter, filtersArray);
  parseCategoriesFilter(filter, filtersArray);
  parseStartDateFilter(filter, filtersArray);
  parseEndDateFilter(filter, filtersArray);
  parseLastUpdateFilter(filter, filtersArray);
  parseOrganizersFilter(filter, filtersArray);
  parseVenuesNearFilter(filter, filtersArray);

  return filtersArray;
}

function parseCategoriesFilter(filter, filtersArray) {
  if (filter.categories && filter.categories.any) {
    const categories = filter.categories.any.split(",");
    filtersArray.push("topicfilter=" + getCategoriesAsBitmask(categories));
  }
}

function parseStartDateFilter(filter, filtersArray) {
  if (filter.startDate && filter.startDate.lte) {
    filtersArray.push("begindate=" + parseDateString(filter.startDate.lte));
  }
}

function parseEndDateFilter(filter, filtersArray) {
  if (filter.endDate && filter.endDate.gte) {
    filtersArray.push("enddate=" + parseDateString(filter.endDate.gte));
  }
}

function parseOrganizersFilter(filter, filtersArray) {
  if (filter.organizers && filter.organizers.eq) {
    filtersArray.push("orgfilter=" + filter.organizers.eq);
  }
}

function parseVenuesNearFilter(filter, filtersArray) {
  if (filter.venues && filter.venues.near) {
    const location = filter.venues.near.split(",");
    const { lat, lng, rad } = parsePointDistance(location);
    if (lat && lng && rad) {
      filtersArray.push("latitude=" + lat);
      filtersArray.push("longitude=" + lng);
      filtersArray.push("radius=" + rad);
    }
  }
}

const eventCategoryMask = {
  "schema/BusinessEvent": 1, // 'Tagungen Vorträge'
  "schema/SportsEvent": 2, // 'Sport'
  "schema/FoodEvent": 4, // 'Gastronomie/Typische Produkte'
  "schema/TheaterEvent": 32, // 'Theater/Vorführungen'
  "schema/EducationEvent": 64, // 'Kurse/Bildung'
  "schema/MusicEvent": 128, // 'Musik/Tanz'
  "schema/Festival": 256, // 'Volksfeste/Festivals'
  "schema/VisualArts": 2048, // 'Ausstellungen/Kunst'
  "schema/ChildrensEvent": 4096, // 'Familie'
  "odh/tagungen-vortrage": 1, // 'schema/BusinessEvent',
  "odh/sport": 2, // 'schema/SportsEvent',
  "odh/gastronomie-typische-produkte": 4, // 'schema/FoodEvent',
  "odh/handwerk-brauchtum": 8,
  "odh/messen-markte": 16,
  "odh/theater-vorführungen": 32, // 'schema/TheatherEvent',
  "odh/kurse-bildung": 64, // 'schema/EducationEvent',
  "odh/musik-tanz": 128, // 'schema/MusicEvent',
  "odh/volksfeste-festivals": 256, // 'schema/Festival',
  "odh/wanderungen-ausflüge": 512,
  "odh/führungen-besichtigungen": 1024,
  "odh/ausstellungen-kunst": 2048, // 'schema/VisualArts',
  "odh/familie": 4096, // 'schema/ChildrensEvent',
};

function getCategoriesAsBitmask(categories) {
  if (Array.isArray(categories)) {
    let categoriesMasks = categories.map((category) =>
      eventCategoryMask[category] ? eventCategoryMask[category] : 0
    );
    return categoriesMasks.reduce((totalMask, currentMask) =>
      !totalMask ? currentMask : totalMask | currentMask
    );
  }
}

module.exports = {
  getEventFilterQuery,
};
