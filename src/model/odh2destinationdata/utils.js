const sanitizeHtml = require("sanitize-html");
const mappings = require('./../mappings');
const datatypes = require('./../destinationdata/datatypes');
const _ = require('lodash');


const htmlSanitizeOpts = {
    allowedTags: [],
    allowedAttributes: {},
};

// TODO: replace the dataProvider with a environment variable
// TODO: review whether changing the timezone with the "+01:00" suffix can damage data in CEST
module.exports.transformMeta = function transformMeta(item) {
  const meta = { dataProvider: "http://tourism.opendatahub.bz.it/" };

  if (typeof item.LastChange === "string" || item.LastChange instanceof String) {
    meta.lastUpdate = item.LastChange.replace(/Z/g, "") + "+01:00";
  }

  return meta;
};

// TODO: test with "include" query parameter
module.exports.transformResourceLinks = function transformResourceLinks(request, resourceType, resourceId) {
    return { self: encodeURI(request.baseUrl + "/" + resourceType + "/" + resourceId) };
};

function sanitizeAndConvertLanguageTags(multilingualObject) {
    if(_.isEmpty(multilingualObject)) {
        return null;
    }

    const output = {};

    for(const twoLetterLang in multilingualObject) {
        const threeLetterLang = mappings.iso6391to6393[twoLetterLang];

        if(threeLetterLang) {
            output[threeLetterLang] = sanitizeHtml(multilingualObject[twoLetterLang], htmlSanitizeOpts);
        }
    }
    
    return _.isEmpty(output) ? null : output;
}

module.exports.transformName = function transformName(item) {
    return sanitizeAndConvertLanguageTags(item.getTitle());
}

module.exports.transformDescription = function transformDescription(item) {
    return sanitizeAndConvertLanguageTags(item.getBaseText());
}

module.exports.transformShortName = function transformShortName(item) {
    return sanitizeAndConvertLanguageTags(item.getHeader());
}

module.exports.transformAbstract = function transformAbstract(item) {
    return sanitizeAndConvertLanguageTags(item.getSubHeader());
}

module.exports.transformUrl = function transformUrl(item) {
    return sanitizeAndConvertLanguageTags(item.getUrl());
}

// I did not understand why the transformation of "howToArrive" used a "safeGet" on "GetThereText", so I just used the same functions as other multilingual text fields
module.exports.transformHowToArrive = function transformHowToArrive(item) {
    return sanitizeAndConvertLanguageTags(item.getGetThereText());
}

// This transformation simplifies the original version. I found no bad side-effects
// Fields no longer used: "Gpstype", "GpsPoints", "GpsTrack"
// The transformation loses information regarding direction (start/finish or vale/mountain station)
module.exports.transformGeometries = function transformGeometries(activity) {
    const { GpsInfo } = activity;
    
    if(!Array.isArray(GpsInfo)) {
        return null;
    }

    const geometries = [];

    const coordinatesArray = GpsInfo.map(info => [ info.Longitude, info.Latitude, info.Altitude ]);
    
    if(_.isEmpty(coordinatesArray)) {
        return null;
    } else if(coordinatesArray.length === 1) {
        const [ longitude, latitude, altitude ] = coordinatesArray[0];
        geometries.push(datatypes.createPoint());
    } else {
        geometries.push(datatypes.createLineString(coordinatesArray));
    }

    return geometries
}

module.exports.transformLength = function transformLength(activity) {
    return activity.DistanceLength > 0 ? activity.DistanceLength : null;
}
