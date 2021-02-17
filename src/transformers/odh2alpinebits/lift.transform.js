/*
USED:
  * Id
  * PoiType
  * SubType
  * DistanceLength
  * LastChange
  * Type
  * GpsInfo
  * OperationSchedule
  * ImageGallery (always [])

PARTIALLY USED :
  * Detail: Title, BaseText, GetThereText
  * ContactInfos: City, Country, ZipCode

IGNORED:
> Potentially useful:
  * DistanceDuration: we imagine to be the expected duration of a ride on a lift.
  * RunToValley: Does the lift has a direct connection to a trail
  * AltitudeDifference
  * LiftAvailable: the meaning of this field is not clear
  * BikeTransport: can tourists carry their bikes on it

> Out of scope or "useless" field (e.g. always null, [], false...)
  * Difficulty (always 0)
  * AltitudeLowestPoint (always 0)
  * AltitudeHighestPoint (always 0)
  * AltitudeSumUp (always 0)
  * AltitudeSumDown (always 0)
  * HasFreeEntrance (always null)
  * HasRentals (always false)
  * IsPrepared (always false)
  * ChildPoiIds (always null)
  * IsWithLigth (always false)
  * HasFreeEntrance (always false)
  * CopyrightChecked (always null)
  * MasterPoiIds (always null)
  * Ratings {Stamina, Landscape, Technique, Difficulty, Experience} (subfields are always null)
  * FeetClimb (always false)
  * CopyrightChecked (always null)
  * Exposition (always null)
  * OwnerRid (always null)
  * Active (always true)
  * SmgActive (always true)
  * AdditionalPoiInfos (we are using PoiType and SubType instead)
  * Shortname (we are getting the name from the Detail field)
  * IsOpen (we decided not to add this field, as it should be computed by the API user)
  * LTSTags (always null)
  * SmgTags
  * ChildPoiIds (always null)
  * SmgId
  * OutdooractiveID
  * TourismorganizationId
  * FirstImport
  * Highlight
  * HasLanguage
  * GpsPoints (we are using GpsInfo)
  * AreaId (repeated from LocationInfo)
  * LocationInfo
  * GpsTrack
*/

const utils = require("./utils");
const templates = require("./templates");
const { transformMediaObject } = require("./media-object.transform");
const mappings = require("./mappings");

module.exports = (originalObject, included = {}, request) => {
  const { apiVersion } = request;

  if (!apiVersion || apiVersion === "1.0") {
    return transformLiftV1(originalObject, included, request);
  } else if (apiVersion === "2.0") {
    return transformLiftV2(originalObject, included, request);
  } else {
    throw new Error(`Unexpected value for 'apiVersion': ${apiVersion}`);
  }
};

function transformLiftV1(originalObject, included = {}, request) {
  const source = JSON.parse(JSON.stringify(originalObject));
  const target = templates.createObject("Lift", "1.0");

  target.id = source.Id;

  utils.processMeta(source, target, request);
  utils.processLinks(target, request);
  utils.processBasicAttributes(source, target);

  utils.processAddressAttribute(source, target);
  utils.processCategoriesAttributeFromActivitiesV1(source, target);
  utils.processGeometriesAttribute(source, target);
  utils.processHowToArriveAttribute(source, target);
  utils.processLengthAttribute(source, target);
  utils.processOpeningHoursAttribute(source, target);
  processPersonsPerChairAttribute(source, target);

  processMultimediaDescriptionsRelationship(source, target, included, request);

  return target;
}

function transformLiftV2(originalObject, included = {}, request) {
  const source = JSON.parse(JSON.stringify(originalObject));
  const target = templates.createObject("Lift", "2.0");

  target.id = source.Id;

  utils.processMeta(source, target, request);
  utils.processLinks(target, request);
  utils.processBasicAttributes(source, target);

  utils.processAddressAttribute(source, target);
  utils.processGeometryAttribute(source, target);
  utils.processHowToArriveAttribute(source, target);
  utils.processLengthAttribute(source, target);
  utils.processOpeningHoursAttribute(source, target);
  processPersonsPerChairAttribute(source, target);

  processMultimediaDescriptionsRelationship(source, target, included, request);
  processCategoriesRelationshipV2(source, target, included, request);

  return target;
}

function processPersonsPerChairAttribute(source, target) {
  const { attributes } = target;
  const ppc = parseInt(source.PoiType, 10);
  attributes.personsPerChair = ppc ? ppc : null;
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
