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

const utils = require('./utils');
const templates = require('./templates');
const { transformMediaObject } = require('./media-object.transform');

module.exports = (originalObject, included = {}, request) => {
  const source = JSON.parse(JSON.stringify(originalObject));
  let target = templates.createObject('Snowpark');

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

  attributes.minAltitude = source.AltitudeLowestPoint || null;
  attributes.maxAltitude = source.AltitudeHighestPoint || null;

  let categories = [];
  source.SmgTags.forEach(tag => 
    categories.push("odh/"+ tag.replace(/[\/|\s]/g,'-').toLowerCase())
  );

  if(categories.length>0)
    attributes.categories = categories;

  const difficultyMapping = {
    '2': 'beginner',
    '4': 'intermediate',
    '6': 'advanced'
  }
  attributes.difficulty = difficultyMapping[source.Difficulty];

  attributes.length = source.DistanceLength > 0 ? source.DistanceLength : null;

  attributes.howToArrive = utils.transformHowToArrive(source.Detail);

  attributes.openingHours = utils.transformOperationSchedule(source.OperationSchedule);

  attributes.address = utils.transformAddress(source.ContactInfos, ['city','country','zipcode']);

  const geometry = utils.transformGeometry(source.GpsInfo, ['Startpunkt', 'Endpunkt'], source.GpsPoints, source.GpsTrack);
  if(geometry) 
    attributes.geometries = [geometry];

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
