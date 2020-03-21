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

const utils = require('./utils');
const templates = require('./templates');
const { transformMediaObject } = require('./media-object.transform');

module.exports = (originalObject, included = {}, request) => {
  const source = JSON.parse(JSON.stringify(originalObject));
  let target = templates.createObject('Trail');

  target.id = source.Id;

  let meta = target.meta;
  Object.assign(meta, utils.transformMetadata(source));

  let links = target.links;
  Object.assign(links, utils.createSelfLink(target, request));

   /**
   * 
   *  ATTRIBUTES
   * 
   */

  let attributes = target.attributes;
  Object.assign(attributes, utils.transformBasicProperties(source));

  const categoryMapping = {
    'ski alpin': 'alpinebits/ski-slope',
    'ski alpin (rundkurs)': 'alpinebits/ski-slope',
    'rodelbahnen': 'alpinebits/sledge-slope',
    'loipen': 'alpinebits/cross-country',
  };

  let categories = [];
  source.SmgTags.forEach(tag => {
    if(categoryMapping[tag])
      categories.push(categoryMapping[tag]);
    
    categories.push("odh/"+ tag.replace(/[\/|\s]/g,'-').toLowerCase());
  })

  if(categories.length>0)
    attributes.categories = categories;

  attributes.length = source.DistanceLength > 0 ? source.DistanceLength : null;

  attributes.minAltitude = source.AltitudeLowestPoint || null;
  attributes.maxAltitude = source.AltitudeHighestPoint || null;

  const difficultyMapping = {
    '2': 'beginner',
    '4': 'intermediate',
    '6': 'expert'
  }
  attributes.difficulty = {
    'eu': difficultyMapping[source.Difficulty]
  };

  const geometry = utils.transformGeometry(source.GpsInfo, ['Startpunkt', 'Endpunkt'], source.GpsPoints, source.GpsTrack);
  if(geometry) 
    attributes.geometries = [geometry];

  attributes.openingHours = utils.transformOperationSchedule(source.OperationSchedule);

  attributes.address = utils.transformAddress(source.ContactInfos, ['city','country','zipcode']);

  attributes.howToArrive = utils.transformHowToArrive(source.Detail);

  /**
   * 
   *  RELATIONSHIPS
   * 
   */

  let relationships = target.relationships;

  for (image of source.ImageGallery){
    const { mediaObject, copyrightOwner } = transformMediaObject(image, links, request);
    utils.addRelationshipToMany(relationships, 'multimediaDescriptions', mediaObject, links.self);
    utils.addIncludedResource(included, mediaObject);
    utils.addIncludedResource(included, copyrightOwner);
  }

  return target;
}
