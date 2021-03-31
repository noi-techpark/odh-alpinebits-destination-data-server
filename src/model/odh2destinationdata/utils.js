const sanitizeHtml = require("sanitize-html");
const mappings = require("./../mappings");
const datatypes = require("./../destinationdata/datatypes");
const _ = require("lodash");

const htmlSanitizeOpts = {
  allowedTags: [],
  allowedAttributes: {},
};

// TODO: replace the dataProvider with a environment variable
// TODO: review whether changing the timezone with the "+01:00" suffix can damage data in CEST
function transformMeta(item) {
  const meta = { dataProvider: "http://tourism.opendatahub.bz.it/", lastUpdate: null };

  if (typeof item.LastChange === "string" || item.LastChange instanceof String) {
    meta.lastUpdate = item.LastChange.replace(/Z/g, "") + "+01:00";
  }

  return meta;
}

// TODO: test with "include" query parameter
function transformResourceLinks(request, resourceType, resourceId) {
  return { self: encodeURI(request.baseUrl + "/" + resourceType + "/" + resourceId) };
}

// TODO: running "sanitize" with the current options, we also remove special characters, such as non-breaking spaces (a.k.a. "&nbsp;" or U+00A0); maybe we should use a less aggressive sanitize
function sanitizeAndConvertLanguageTags(multilingualObject) {
  if (_.isEmpty(multilingualObject)) {
    return null;
  }

  const output = {};

  for (const twoLetterLang in multilingualObject) {
    const threeLetterLang = mappings.iso6391to6393[twoLetterLang];

    if (threeLetterLang) {
      output[threeLetterLang] = sanitizeHtml(multilingualObject[twoLetterLang], htmlSanitizeOpts);
    }
  }

  return _.isEmpty(output) ? null : output;
}

function transformName(item) {
  return sanitizeAndConvertLanguageTags(item.getTitle());
}

function transformDescription(item) {
  return sanitizeAndConvertLanguageTags(item.getBaseText());
}

function transformShortName(item) {
  return sanitizeAndConvertLanguageTags(item.getHeader());
}

function transformAbstract(item) {
  return sanitizeAndConvertLanguageTags(item.getSubHeader());
}

function transformUrl(item) {
  return sanitizeAndConvertLanguageTags(item.getUrl());
}

// I did not understand why the transformation of "howToArrive" used a "safeGet" on "GetThereText", so I just used the same functions as other multilingual text fields
function transformHowToArrive(item) {
  return sanitizeAndConvertLanguageTags(item.getGetThereText());
}

// This transformation simplifies the original version. I found no bad side-effects
// Fields no longer used: "Gpstype", "GpsPoints", "GpsTrack"
// The transformation loses information regarding direction (start/finish or vale/mountain station)
function transformGeometries(activity) {
  const { GpsInfo } = activity;

  if (!Array.isArray(GpsInfo)) {
    return null;
  }

  const geometries = [];

  const coordinatesArray = GpsInfo.map((info) => [info.Longitude, info.Latitude, info.Altitude]);

  if (_.isEmpty(coordinatesArray)) {
    return null;
  } else if (coordinatesArray.length === 1) {
    const [longitude, latitude, altitude] = coordinatesArray[0];
    geometries.push(datatypes.createPoint(longitude, latitude, altitude));;
  } else {
    geometries.push(datatypes.createLineString(coordinatesArray));
  }

  return geometries;
}

function transformLength(activity) {
  return activity.DistanceLength > 0 ? activity.DistanceLength : null;
}

// TODO: this is the original implementation for the transformation, but it shouldn't work, so I'm disabling it for now and adding this TODO for us to revisit the ODH API
// function transformPersonsPerChair (activity) {
//     const ppc = parseInt(activity.PoiType, 10);
//     return ppc ? pcc : null;
// }

function transformOpeningHours(activity) {
  const { OperationSchedule } = activity;

  if (!Array.isArray(OperationSchedule)) {
    return null;
  }

  const hoursSpecification = datatypes.createHoursSpecification();

  OperationSchedule.forEach((schedule) => {
    const { OperationScheduleTime } = schedule;

    if (schedule.Start === schedule.Stop) {
      if (!schedule.Start || !Array.isArray(OperationScheduleTime)) return;

      const dateRegex = /\d{4}-\d{2}-\d{2}/i;
      const matchArray = schedule.Start.match(dateRegex);

      if (!matchArray) return;

      const scheduleDate = matchArray[0];

      OperationScheduleTime.forEach((item) => {
        const openingWindow = datatypes.createOpeningWindow(item.Start, item.End);
        datatypes.addDailySchedule(hoursSpecification, scheduleDate, [openingWindow]);
      });
    } else {
      if (!schedule.Start || !Array.isArray(OperationScheduleTime)) return;

      const dateRegex = /T.*/;
      const validFrom = schedule.Start.replace(dateRegex, "");
      const validTo = schedule.Stop.replace(dateRegex, "");

      OperationScheduleTime.forEach((item) => {
        const weeklySchedule = datatypes.createWeeklySchedule(validFrom, validTo);

        weeklySchedule.sunday = item.Sunday ? [datatypes.createOpeningWindow(item.Start, item.End)] : null;
        weeklySchedule.monday = item.Monday ? [datatypes.createOpeningWindow(item.Start, item.End)] : null;
        weeklySchedule.tuesday = item.Tuesday ? [datatypes.createOpeningWindow(item.Start, item.End)] : null;
        weeklySchedule.wednesday = item.Wednesday ? [datatypes.createOpeningWindow(item.Start, item.End)] : null;
        weeklySchedule.thursday = item.Thursday ? [datatypes.createOpeningWindow(item.Start, item.End)] : null;
        weeklySchedule.friday = item.Friday ? [datatypes.createOpeningWindow(item.Start, item.End)] : null;
        weeklySchedule.saturday = item.Saturday ? [datatypes.createOpeningWindow(item.Start, item.End)] : null;

        datatypes.addWeeklySchedule(hoursSpecification, weeklySchedule);
      });
    }
  });

  return !_.isEmpty(hoursSpecification.dailySchedules) || !_.isEmpty(hoursSpecification.weeklySchedules)
    ? hoursSpecification
    : null;
}

function transformAddress(item) {
  const street = sanitizeAndConvertLanguageTags(item.getAddress());
  const city = sanitizeAndConvertLanguageTags(item.getCity());
  const countryCode = sanitizeAndConvertLanguageTags(item.getCountryCode());
  const zipCode = sanitizeAndConvertLanguageTags(item.getZipCode());

  if (_.isEmpty(city) || _.isEmpty(countryCode)) {
    return null;
  }

  const address = datatypes.createAddress();

  address.street = street;
  address.city = city;
  address.country = Object.values(countryCode)[0];
  address.zipcode = !_.isEmpty(zipCode) ? Object.values(zipCode)[0] : null;

  return address;
}

function transformMinAltitude(activity) {
  return activity.AltitudeLowestPoint && activity.AltitudeHighestPoint ? activity.AltitudeLowestPoint : null;
}

function transformMaxAltitude(activity) {
  return activity.AltitudeLowestPoint && activity.AltitudeHighestPoint ? activity.AltitudeHighestPoint : null;
}

function transformSkiSlopeDifficulty(activity) {
  // TODO: review: is this the "us" or the "eu" classification?
  const difficultyMapping = {
    2: "beginner",
    4: "intermediate",
    6: "expert",
  };

  return activity.Difficulty && difficultyMapping[activity.Difficulty] ? 
        { eu: difficultyMapping[activity.Difficulty], us: null } : null;
}

function transformSnowparkDifficulty(activity) {
  // TODO: review: is this mapping indeed the same as the ski slope one?
  const difficultyMapping = {
    2: "beginner",
    4: "intermediate",
    6: "expert",
  };

  return activity.Difficulty && difficultyMapping[activity.Difficulty] ? 
        difficultyMapping[activity.Difficulty] : null;
}

module.exports = {
  transformMeta,
  transformResourceLinks,
  sanitizeAndConvertLanguageTags,
  transformName,
  transformDescription,
  transformShortName,
  transformAbstract,
  transformUrl,
  transformHowToArrive,
  transformGeometries,
  transformLength,
  transformOpeningHours,
  transformAddress,
  transformMinAltitude,
  transformMaxAltitude,
  transformSkiSlopeDifficulty,
  transformSnowparkDifficulty
};
