/*
CHECK:
  * Difficulty and PoiType: we need to discuss the difficulty scale

USED:
  * AltitudeLowestPoint: always 0
  * AltitudeHighestPoint: always 0
  * Difficulty
  * DistanceLength
  * Id
  * LastChange
  * OperationSchedule
  * GpsInfo
  * GpsPoints
  * GpsTrack
  * ImageGallery: always []

PARTIALLY USED :
  * Detail: Title, BaseText
  * ContactInfos: City, Country, ZipCode

IGNORED:
> Potentially useful:
  * AltitudeDifference
  * AltitudeSumDown: always 0
  * AltitudeSumUp: always 0
  * DistanceDuration: always 0
  * Exposition: values 'NO' and 'O' (exposure?)
  * HasRentals: true and false
  * IsPrepared: true and false, meaning unclear
  * IsWithLigth: always false, meaning unclear
  * LiftAvailable: always false
  * Ratings: properties Stamina, Landscape, Technique, Difficulty, Experience
  * RunToValley: true and false

> Out of scope or "useless" field (e.g. always null, [], false...)
  * Active
  * AreaId
  * BikeTransport
  * ChildPoiIds
  * CopyrightChecked
  * FeetClimb
  * FirstImport
  * HasLanguage
  * Highlight
  * IsOpen: this should be calculated by the client
  * LTSTags: always []
  * MasterPoiIds: always null
  * OutdooractiveID
  * OwnerRid: always null
  * SmgActive
  * SmgId
  * SmgTags
  * TourismorganizationId
  * LocationInfo

> Redundant
  * AdditionalPoiInfos: we this data from 'PoiType' and 'SubType'
  * Shortname
  * Type: Piste / we only query snowparks
  * SubType: Snowpark / we only query for snowparks
  * PoiType: redudant with difficulty [[blau, 2], [rot, 4], [schwarz, 6]]
*/

const utils = require("./utils");
const templates = require("./templates");

module.exports = (originalObject, included = {}, request) => {
  const { apiVersion } = request;

  if (!apiVersion || apiVersion === "1.0") {
    return transformSnowparkV1(originalObject, included, request);
  } else if (apiVersion === "2.0") {
    return transformSnowparkV2(originalObject, included, request);
  } else {
    throw new Error(`Unexpected value for 'apiVersion': ${apiVersion}`);
  }
};

function transformSnowparkV1(originalObject, included = {}, request) {
  const source = JSON.parse(JSON.stringify(originalObject));
  let target = templates.createObject("Snowpark");

  target.id = source.Id;

  utils.processMeta(source, target, request);
  utils.processLinks(target, request);
  utils.processBasicAttributes(source, target);

  utils.processAddressAttribute(source, target);
  utils.processCategoriesAttributeFromActivitiesV1(source, target);
  processDifficultyAttribute(source, target);
  utils.processGeometriesAttribute(source, target);
  utils.processHowToArriveAttribute(source, target);
  utils.processLengthAttribute(source, target);
  utils.processMinAltitudeAttribute(source, target);
  utils.processMaxAltitudeAttribute(source, target);
  utils.processOpeningHoursAttribute(source, target);

  utils.processMultimediaDescriptionsRelationship(
    source,
    target,
    included,
    request
  );

  return target;
}

function transformSnowparkV2(originalObject, included = {}, request) {
  const source = JSON.parse(JSON.stringify(originalObject));
  let target = templates.createObject("Snowpark", '2.0');

  target.id = source.Id;

  utils.processMeta(source, target, request);
  utils.processLinks(target, request);
  utils.processBasicAttributes(source, target);

  utils.processAddressAttribute(source, target);
  processDifficultyAttribute(source, target);
  utils.processGeometriesAttribute(source, target);
  utils.processHowToArriveAttribute(source, target);
  utils.processLengthAttribute(source, target);
  utils.processMinAltitudeAttribute(source, target);
  utils.processMaxAltitudeAttribute(source, target);
  utils.processOpeningHoursAttribute(source, target);

  utils.processCategoriesRelationshipFromActivitiesV2(
    source,
    target,
    included,
    request
  );
  utils.processMultimediaDescriptionsRelationship(
    source,
    target,
    included,
    request
  );

  return target;
}

function processDifficultyAttribute(source, target) {
  const { attributes } = target;
  const difficultyMapping = {
    2: "beginner",
    4: "intermediate",
    6: "advanced",
  };
  attributes.difficulty = difficultyMapping[source.Difficulty];
}

function processCategoriesRelationshipFromActivitiesV2(
  source,
  target,
  included,
  request
) {
  const { relationships, links } = target;
  const getCategoryReference = (categoryId) => {
    return categoryId ? { type: "categories", id: categoryId } : null;
  };

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

  mappedCategories
    .reduce((categories, mappedCategory) => {
      if (
        !!mappedCategory &&
        !categories.find((category) => category.id === mappedCategory)
      ) {
        categories.push(getCategoryReference(mappedCategory));
      }

      return categories;
    }, [])
    .forEach((category) => {
      addRelationshipToMany(relationships, "categories", category, links.self);
    });
}

function processMultimediaDescriptionsRelationship(
  source,
  target,
  included,
  request
) {
  const { relationships, links } = target;
  for (image of source.ImageGallery) {
    const { mediaObject, copyrightOwner } = transformMediaObject(
      image,
      links,
      request
    );
    addRelationshipToMany(
      relationships,
      "multimediaDescriptions",
      mediaObject,
      links.self
    );
    addIncludedResource(included, mediaObject);
    addIncludedResource(included, copyrightOwner);
  }
}
