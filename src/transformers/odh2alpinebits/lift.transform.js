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

const utils = require('./utils');
const templates = require('./templates');
const { transformMediaObject } = require('./media-object.transform');

module.exports = (originalObject, included = {}, request) => {
  const source = JSON.parse(JSON.stringify(originalObject));
  let target = templates.createObject('Lift');

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

  // Lift categories
  const categoryMapping = {
    'Sessellift': [ 'alpinebits/chairlift' ],
    'Seilbahn': [ 'alpinebits/funicular' ],
    'Skibus': [ 'odh/skibus' ],
    'Förderband': [ 'odh/conveyor-belt' ],
    'Telemix': [ 'odh/telemix' ],
    'Standseilbahn/Zahnradbahn': [ 'odh/cable-railway' ],
    'no Subtype': null,
    'Zug': [ 'odh/train' ],
    'Kabinenbahn': [ 'alpinebits/gondola' ],
    'Schrägaufzug': [ 'odh/inclined-lift' ],
    'Umlaufbahn': [ 'alpinebits/gondola', 'odh/detachable-gondola'],
    'Unterirdische Bahn': [ 'alpinebits/funicular', 'odh/underground-ropeway' ],
    'Skilift': [ 'alpinebits/skilift'] ,
  }

  attributes.categories = categoryMapping[source.SubType];
  attributes.categories.push("odh/"+ source.SubType.replace(/\s/g, '-'));

  attributes.length = source.DistanceLength>0 ? source.DistanceLength : null;

  attributes.howToArrive = utils.transformHowToArrive(source.Detail);
  
  let ppc = parseInt(source.PoiType, 10);
  attributes.personsPerChair =  ppc ? ppc : null;

  attributes.openingHours = utils.transformOperationSchedule(source.OperationSchedule);

  attributes.address = utils.transformAddress(source.ContactInfos, ['city','country','zipcode']);

  const geometry = utils.transformGeometry(source.GpsInfo, ['Talstation','Mittelstation','Bergstation'], source.GpsPoints, source.GpsTrack);
  if(geometry) 
    attributes.geometries = [ geometry ];

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
