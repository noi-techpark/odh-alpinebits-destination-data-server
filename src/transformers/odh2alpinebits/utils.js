const iso6393to6391 = require("iso-639-3/to-1.json"); // TODO: update languageMapping
const sanitizeHtml = require("sanitize-html");
const templates = require("./templates");
const mappings = require("./mappings");

const iso6391to6393 = Object.entries(iso6393to6391).reduce(
  (invertedMap, entry) => {
    const threeLetterCode = entry[0];
    const twoLetterCode = entry[1];

    if (invertedMap) {
      invertedMap[twoLetterCode] = threeLetterCode;
      return invertedMap;
    } else {
      return { twoLetterCode: threeLetterCode };
    }
  }
);

const languageMapping = [];

const htmlSanitizeOpts = {
  allowedTags: [],
  allowedAttributes: {},
};

const mappedLanguages = new Set();

// TODO: replace this function by updating transformMultilingualFields() to access the ISO-639 mappings directly, instead of the languageMapping array
function loadLanguageMappings(source) {
  if (Array.isArray(source.HasLanguage)) {
    source.HasLanguage.forEach((twoLetterCode) => {
      if (!mappedLanguages.has(twoLetterCode)) {
        mappedLanguages.add(twoLetterCode);
        languageMapping.push([twoLetterCode, iso6391to6393[twoLetterCode]]);
      }
    });
  }
}

// isLanguageNested: true => object.property.it
// isLanguageNested: false => object.it.property
function transformMultilingualFields(
  source,
  target,
  fieldMapping,
  isLanguageNested,
  ignoreNullValues
) {
  for (fieldEntry of fieldMapping) {
    let [sourceField, targetField] = fieldEntry;

    for (languageEntry of languageMapping) {
      let [sourceLanguage, targetLanguage] = languageEntry;

      if (
        isLanguageNested &&
        source[sourceField] &&
        (!ignoreNullValues || source[sourceField][sourceLanguage])
      ) {
        let value = sanitizeHtml(
          source[sourceField][sourceLanguage],
          htmlSanitizeOpts
        );

        if (typeof value === "string" || value instanceof String) {
          value = value.trim();

          if (value === "") continue;
        }

        if (value === null) continue;

        target[targetField] = safeAdd(
          target[targetField],
          targetLanguage,
          value
        );
      } else if (
        !isLanguageNested &&
        source[sourceLanguage] &&
        (!ignoreNullValues || source[sourceLanguage][sourceField])
      ) {
        let value = sanitizeHtml(
          source[sourceLanguage][sourceField],
          htmlSanitizeOpts
        );

        if (typeof value === "string" || value instanceof String) {
          value = value.trim();

          if (value === "") continue;
        }

        if (value === null) continue;

        target[targetField] = safeAdd(
          target[targetField],
          targetLanguage,
          value
        );
      }
    }
  }
}

function transformFields(source, target, fieldMapping, valueMapping = {}) {
  for (fieldEntry of fieldMapping) {
    let [sourceField, targetField] = fieldEntry;
    target[targetField] = valueMapping[sourceField]
      ? valueMapping[sourceField][source[sourceField]]
      : source[sourceField];
  }
}

// TODO currently unused. Check later...
function transformArrayFields(source, target, fieldMapping, valueMapping = {}) {
  for (fieldEntry of fieldMapping) {
    const [sourceField, targetField] = fieldEntry;
    target[targetField] = [];

    for (sourceItem of source[sourceField]) {
      const targetItem = valueMapping[sourceField]
        ? valueMapping[sourceField][sourceItem]
        : sourceItem;
      target[targetField].push(targetItem);
    }
  }
}
function safeGetString(path, object) {
  let value = path.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), object);

  if (typeof value === "string" || value instanceof String) {
    value = value.trim();

    if (!value) return null;

    return value;
  }

  return null;
}

function safeGet(path, object) {
  let value = path.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), object);

  if (typeof value === "string" || value instanceof String) return value.trim();

  return value;
}

function safeGetOne(paths, object) {
  for (path of paths) {
    let value = safeGet(path, object);

    if (value) return value;
  }

  return null;
}

function safePush(array, value) {
  if (
    value === null ||
    (typeof value === "string" && value.trim().length === 0)
  )
    return array;

  if (!array) array = [];

  array.push(value);

  return array;
}

function safeAdd(object, field, value) {
  if (!object) object = {};

  object[field] = value;
  return object;
}

function addRelationshipToMany(
  relationships,
  relationshipName,
  resource,
  selfLink
) {
  if (!relationships[relationshipName]) {
    relationships[relationshipName] = {
      data: [],
      links: {
        related: encodeURI(selfLink + "/" + relationshipName),
      },
    };
  }

  const relationship = {
    type: resource.type,
    id: resource.id,
  };

  relationships[relationshipName].data.push(relationship);
}

function addRelationshipToOne(
  relationships,
  relationshipName,
  resource,
  selfLink
) {
  relationships[relationshipName] = {
    data: {
      type: resource.type,
      id: resource.id,
    },
    links: {
      related: encodeURI(selfLink + "/" + relationshipName),
    },
  };
}

function transformBasicProperties(source) {
  loadLanguageMappings(source);
  let target = {};

  // Basic textual descriptions
  if (source.Detail) {
    fieldMapping = [
      ["Title", "name"],
      ["BaseText", "description"],
      ["Header", "shortName"],
      ["SubHeader", "abstract"],
    ];
    transformMultilingualFields(
      source.Detail,
      target,
      fieldMapping,
      false,
      true
    );
  }

  if (source.ContactInfos) {
    fieldMapping = [["Url", "url"]];
    transformMultilingualFields(
      source.ContactInfos,
      target,
      fieldMapping,
      false,
      true
    );
  }

  return target;
}

function transformMetadata(source) {
  meta = {};

  if (
    typeof source.LastChange === "string" ||
    source.LastChange instanceof String
  ) {
    meta.lastUpdate = source.LastChange.replace(/Z/g, "") + "+01:00";
  }
  meta.dataProvider = "http://tourism.opendatahub.bz.it/";
  return meta;
}

function transformOperationSchedule(operationSchedule) {
  if (!operationSchedule) return null;

  let openingHours = templates.createObject("HoursSpecification");

  operationSchedule.forEach((entry) => {
    if (entry.Start === entry.Stop) {
      let key = entry.Start;
      if (!key) return;

      let found = key.match(/\d{4}-\d{2}-\d{2}/i);
      if (!found) return;

      key = found[0];

      if (!openingHours.dailySchedule) openingHours.dailySchedules = {};

      let hoursArray = entry.OperationScheduleTime;

      if (Array.isArray(hoursArray)) {
        let dailyHours = [];
        openingHours.dailySchedules[key] = dailyHours;

        hoursArray.forEach((hours) => {
          let openClose = { opens: hours.Start, closes: hours.End };
          dailyHours = safePushUniqueHours(dailyHours, openClose);
        });
      } else {
        openingHours.dailySchedules[key] = null;
      }
    } else {
      if (!openingHours.weeklySchedules) openingHours.weeklySchedules = [];

      let newEntry = templates.createObject("Weekly");
      openingHours.weeklySchedules.push(newEntry);

      newEntry.validFrom = entry.Start.replace(/T.*/, "");
      newEntry.validTo = entry.Stop.replace(/T.*/, "");

      let hoursArray = entry.OperationScheduleTime;

      if (Array.isArray(hoursArray)) {
        hoursArray.forEach((hours) => {
          let openClose = { opens: hours.Start, closes: hours.End };
          newEntry.sunday = hours.Sunday
            ? safePushUniqueHours(newEntry.sunday, openClose)
            : newEntry.sunday;
          newEntry.monday = hours.Monday
            ? safePushUniqueHours(newEntry.monday, openClose)
            : newEntry.monday;
          newEntry.tuesday = hours.Tuesday
            ? safePushUniqueHours(newEntry.tuesday, openClose)
            : newEntry.tuesday;
          newEntry.wednesday = hours.Wednesday
            ? safePushUniqueHours(newEntry.wednesday, openClose)
            : newEntry.wednesday;
          newEntry.thursday = hours.Thuresday
            ? safePushUniqueHours(newEntry.thursday, openClose)
            : newEntry.thursday;
          newEntry.friday = hours.Friday
            ? safePushUniqueHours(newEntry.friday, openClose)
            : newEntry.friday;
          newEntry.saturday = hours.Saturday
            ? safePushUniqueHours(newEntry.saturday, openClose)
            : newEntry.saturday;
        });
      }
    }
  });

  return openingHours;
}

function safePushUniqueHours(array, value) {
  if (
    value === null ||
    (typeof value === "string" && value.trim().length === 0)
  )
    return array;

  if (!array) array = [];

  let found = array.find(
    (entry) => entry.opens === value.opens && entry.closes === value.closes
  );

  if (!found) array.push(value);

  return array;
}

function transformHowToArrive(detail) {
  const deGetThere = safeGet(["de", "GetThereText"], detail);
  const itGetThere = safeGet(["it", "GetThereText"], detail);
  const enGetThere = safeGet(["en", "GetThereText"], detail);

  if (deGetThere || itGetThere || enGetThere)
    return {
      deu: sanitizeHtml(deGetThere, htmlSanitizeOpts),
      ita: sanitizeHtml(itGetThere, htmlSanitizeOpts),
      eng: sanitizeHtml(enGetThere, htmlSanitizeOpts),
    };

  return null;
}

function transformAddress(contactInfo, fields) {
  let address = templates.createObject("Address");

  if (fields.includes("street")) {
    address.street = {};

    let deu = safeGet(["de", "Address"], contactInfo);
    if (deu) address.street.deu = deu;

    let ita = safeGet(["it", "Address"], contactInfo);
    if (ita) address.street.ita = ita;

    let eng = safeGet(["en", "Address"], contactInfo);
    if (eng) address.street.eng = eng;

    if (!address.street.deu && !address.street.eng && !address.street.ita)
      address.street = null;
  }

  if (fields.includes("city")) {
    address.city = {};

    let deu = safeGet(["de", "City"], contactInfo);
    if (deu) address.city.deu = deu;

    let ita = safeGet(["it", "City"], contactInfo);
    if (ita) address.city.ita = ita;

    let eng = safeGet(["en", "City"], contactInfo);
    if (eng) address.city.eng = eng;

    if (!address.city.deu && !address.city.eng && !address.city.ita)
      address.city = null;
  }

  if (fields.includes("country"))
    address.country = safeGetOne(
      [
        ["de", "CountryCode"],
        ["it", "CountryCode"],
        ["en", "CountryCode"],
      ],
      contactInfo
    );

  if (fields.includes("zipcode"))
    address.zipcode = safeGetOne(
      [
        ["de", "ZipCode"],
        ["it", "ZipCode"],
        ["en", "ZipCode"],
      ],
      contactInfo
    );

  if (!address.city || !address.country) return null;

  return address;
}

function transformGeometry(gpsInfo, infoKeys, gpsPoints, gpsTrack) {
  let geometry;

  if (gpsInfo && gpsInfo.length >= 1) {
    if (gpsInfo.length === 1) {
      geometry = templates.createObject("Point");
      geometry.coordinates = [
        gpsInfo[0].Longitude,
        gpsInfo[0].Latitude,
        gpsInfo[0].Altitude,
      ];
      return geometry;
    } else {
      geometry = templates.createObject("LineString");

      if (Array.isArray(infoKeys) && infoKeys.length === gpsInfo.length) {
        infoKeys.forEach((key) => {
          let point = gpsInfo.find((p) => p.Gpstype === key);
          if (point)
            geometry.coordinates.push([
              point.Longitude,
              point.Latitude,
              point.Altitude,
            ]);
        });
        return geometry;
      } else {
        gpsInfo.forEach((point) =>
          geometry.coordinates.push([
            point.Longitude,
            point.Latitude,
            point.Altitude,
          ])
        );
        return geometry;
      }
    }
  } else if (gpsPoints && Object.keys(gpsPoints)) {
    // console.log('Has GpsPoints:', Object.keys(gpsPoints).length);
    return null;
  } else if (gpsTrack && gpsTrack.length >= 1) {
    // console.log('Has GpsTrack:', gpsTrack.length);
    return null;
  }

  return geometry;
}

function isClockwise(poly) {
  var sum = 0;
  for (var i = 0; i < poly.length - 1; i++) {
    var cur = poly[i],
      next = poly[i + 1];
    sum += (next[0] - cur[0]) * (next[1] + cur[1]);
  }
  return sum > 0;
}

function addIncludedResource(included, resource) {
  if (!included[resource.type]) included[resource.type] = {};

  included[resource.type][resource.id] = resource;
}

function createSelfLink(resource, request) {
  const link = encodeURI(
    request.baseUrl + "/" + resource.type + "/" + resource.id
  );
  return { self: link };
}

function processMeta(source, target, request) {
  const { meta } = target;
  Object.assign(meta, transformMetadata(source));
}

function processLinks(target, request) {
  const { links } = target;
  Object.assign(links, createSelfLink(target, request));
}

function processBasicAttributes(source, target) {
  const { attributes } = target;
  Object.assign(attributes, transformBasicProperties(source));
}

function processMinAltitudeAttribute(source, target) {
  const { attributes } = target;
  attributes.minAltitude = source.AltitudeLowestPoint || null;
}

function processMaxAltitudeAttribute(source, target) {
  const { attributes } = target;
  attributes.maxAltitude = source.AltitudeHighestPoint || null;
}

function processLengthAttribute(source, target) {
  const { attributes } = target;
  attributes.length = source.DistanceLength > 0 ? source.DistanceLength : null;
}

function processHowToArriveAttribute(source, target) {
  const { attributes } = target;
  attributes.howToArrive = transformHowToArrive(source.Detail);
}

function processOpeningHoursAttribute(source, target) {
  const { attributes } = target;
  attributes.openingHours = transformOperationSchedule(
    source.OperationSchedule
  );
}

function processAddressAttribute(source, target) {
  const { attributes } = target;
  attributes.address = transformAddress(source.ContactInfos, [
    "city",
    "country",
    "zipcode",
  ]);
}

function processGeometriesAttribute(source, target) {
  const { attributes } = target;
  const geometry = transformGeometry(
    source.GpsInfo,
    ["Startpunkt", "Endpunkt"],
    source.GpsPoints,
    source.GpsTrack
  );
  if (geometry) attributes.geometries = [geometry];
}

function processCategoriesAttributeFromActivitiesV1(source, target) {
  const { attributes } = target;

  let mappedCategories = [
    mappings.activityTypeIdToODHCategories[source.Type],
    mappings.activityTypeIdToODHCategories[source.SubType],
    mappings.activityTypeIdToAlpineBitsCategories[source.SubType],
  ];

  if (Array.isArray(source.SmgTags)) {
    source.SmgTags.forEach((tag) => {
      mappedCategories.push(mappings.activitySmgTagToODHCategories[tag]);
      mappedCategories.push(mappings.activitySmgTagToAlpineBitsCategories[tag]);
    });
  }

  attributes.categories = mappedCategories.reduce(
    (categories, mappedCategory) => {
      if (
        !!mappedCategory &&
        !categories.find(
          (category) => category.id === mappedCategory
        )
      ) {
        categories.push(mappedCategory);
      }

      return categories;
    },
    []
  );
}

module.exports = {
  languageMapping,
  safeGet,
  safeGetString,
  safeGetOne,
  safeAdd,
  safePush,
  addIncludedResource,
  addRelationshipToMany,
  addRelationshipToOne,
  createSelfLink,
  isClockwise,
  transformMultilingualFields,
  transformFields,
  transformArrayFields,
  transformBasicProperties,
  transformMetadata,
  transformOperationSchedule,
  transformHowToArrive,
  transformAddress,
  transformGeometry,
  processMeta,
  processLinks,
  processBasicAttributes,
  processMinAltitudeAttribute,
  processMaxAltitudeAttribute,
  processLengthAttribute,
  processHowToArriveAttribute,
  processOpeningHoursAttribute,
  processAddressAttribute,
  processGeometriesAttribute,
  processCategoriesAttributeFromActivitiesV1,
};
