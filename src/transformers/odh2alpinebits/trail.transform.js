/*
USED:
  * Id
  * SmgTags
  * Difficulty
  * OperationSchedule
  * GpsInfo
  * GpsPoints
  * GpsTrack
  * DistanceLength
  * LastChange

PARTIALLY USED:
  * Detail: Title, BaseText, GetThereText
  * ContactInfos: City, Country, ZipCode, Street

IGNORED:
> Potentially useful:
  * AltitudeDifference
  * AltitudeSumDown
  * AltitudeSumUp
  * DistanceDuration
  * Exposition
  * FeetClimb
  * ImageGallery
  * LiftAvailable
  * RunToValley
  * LocationInfo

> Out of scope or "useless" field (e.g. always null, [], false...)
  * Active (always true)
  * AreaId (unkown IDs)
  * BikeTransport (potentially uselles for this endpoint)
  * ChildPoiIds (always null)
  * CopyrightChecked (always null)
  * FirstImport (unclear semantics)
  * HasFreeEntrance (always false)
  * HasLanguage (unclear semantics)
  * HasRentals (unclear semantics)
  * Highlight (unclear semantics)
  * IsOpen (unclear semantics, mostly false)
  * IsPrepared (unclear semantics)
  * IsWithLigth (unclear semantics)
  * LTSTags (always [])
  * MasterPoiIds (always null)
  * OutdooractiveID (unkown IDs)
  * OwnerRid (always null)
  * SmgActive (always true)
  * SmgId (always null)
  * TourismorganizationId (unkown IDs)

> Redundant
  * AdditionalPoiInfos: potentially useful information is redundant (i.e. PoiType and SubType)
  * Shortname
  * Type: only querying for SmgTags
  * SubType: only querying for SmgTags
  * PoiType: redudant with difficulty [[blau, 2], [rot, 4], [schwarz, 6]]

*/

const utils = require("./utils");
const templates = require("./templates");
const { transformMediaObject } = require("./media-object.transform");
const mappings = require("./mappings");

module.exports = (originalObject, included = {}, request) => {
  const { apiVersion } = request;

  if (!apiVersion || apiVersion === "1.0") {
    return transformTrailV1(originalObject, included, request);
  } else if (apiVersion === "2.0") {
    return transformTrailV2(originalObject, included, request);
  } else {
    throw new Error(`Unexpected value for 'apiVersion': ${apiVersion}`);
  }
};

function transformTrailV1(originalObject, included = {}, request) {
  const source = JSON.parse(JSON.stringify(originalObject));
  let target = templates.createObject("Trail");

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

  processMultimediaDescriptionsRelationship(source, target, included, request);

  return target;
}

function transformTrailV2(originalObject, included = {}, request) {
  const source = JSON.parse(JSON.stringify(originalObject));
  let target = templates.createObject("Trail", '2.0');

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

  processCategoriesRelationshipV2(source, target, included, request);
  processMultimediaDescriptionsRelationship(source, target, included, request);

  return target;
}

function processDifficultyAttribute(source, target) {
  const { attributes } = target;
  const difficultyMapping = {
    2: "beginner",
    4: "intermediate",
    6: "expert",
  };
  attributes.difficulty = {
    eu: difficultyMapping[source.Difficulty],
  };
}

function processCategoriesRelationshipV2(source, target, included, request) {
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

  mappedCategories = mappedCategories.reduce((categories, mappedCategory) => {
    if (
      !!mappedCategory &&
      !categories.find((category) => category.id === mappedCategory)
    ) {
      categories.push(getCategoryReference(mappedCategory));
    }

    return categories;
  }, []);

  console.log("mappedCategories after reduce", mappedCategories);
  mappedCategories.forEach((category) => {
    utils.addRelationshipToMany(
      relationships,
      "categories",
      category,
      links.self
    );
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
    utils.addRelationshipToMany(
      relationships,
      "multimediaDescriptions",
      mediaObject,
      links.self
    );
    utils.addIncludedResource(included, mediaObject);
    utils.addIncludedResource(included, copyrightOwner);
  }
}
