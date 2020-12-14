const iso6393map = require("iso-639-3/to-1.json");

function parseDateString(malformedDateString) {
  console.log("Date", malformedDateString);

  const date = new Date(malformedDateString);

  if (isNaN(date.getDate())) {
    return "";
  }

  const day =
    date.getUTCDate() > 9 ? date.getUTCDate() : `0${date.getUTCDate()}`;
  const month =
    date.getUTCMonth() + 1 > 9
      ? date.getUTCMonth() + 1
      : `0${date.getUTCMonth() + 1}`;
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

function getLangInIso6391(lang) {
  if (Array.isArray(lang)) {
    return lang.map((_3letterCode) => iso6393map[_3letterCode]).join(",");
  } else if (typeof lang === "string") {
    return iso6393map[lang];
  } else {
    return "";
  }
}

function parsePointDistance(point) {
  const distanceToPoint = {
    lng: point[0],
    lat: point[1],
    rad: point[2],
  };

  return distanceToPoint;
}

function parseLanguageFilter(filter, filtersArray) {
  if (filter.lang) {
    const lang = filter.lang.split(",");
    filtersArray.push("language=" + getLangInIso6391(lang));
  }
}
function parseLastUpdateFilter(filter, filtersArray) {
  if (filter.lastUpdate && filter.lastUpdate.gt) {
    filtersArray.push("updatefrom=" + parseDateString(filter.lastUpdate.gt));
  }
}
function parseGeometriesFilter(filter, filtersArray) {
  if (filter.geometries && filter.geometries.near) {
    const location = filter.geometries.near.split(",");
    const { lat, lng, rad } = parsePointDistance(location);
    if (lat && lng && rad) {
      filtersArray.push("latitude=" + lat);
      filtersArray.push("longitude=" + lng);
      filtersArray.push("radius=" + rad);
    }
  }
}

module.exports = {
  parseDateString,
  getLangInIso6391,
  parsePointDistance,
  parseLanguageFilter,
  parseLastUpdateFilter,
  parseGeometriesFilter,
};
