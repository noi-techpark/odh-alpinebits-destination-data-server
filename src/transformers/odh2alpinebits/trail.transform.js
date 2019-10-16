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

module.exports = (object) => {
  const source = JSON.parse(JSON.stringify(object));
  let target = templates.createObject('Trail');

  Object.assign(target, utils.transformMetadata(source));
  Object.assign(target, utils.transformBasicProperties(source));

  // Media Objects
  target.multimediaDescriptions = []
  for (image of source.ImageGallery)
    target.multimediaDescriptions.push(utils.transformMediaObject(image));

  const categoryMapping = {
    'ski alpin': 'alpinebits/ski-slope',
    'ski alpin (rundkurs)': 'alpinebits/ski-slope',
    'rodelbahnen': 'alpinebits/sledge-slope',
    'loipen': 'alpinebits/cross-country',
  };

  source.SmgTags.find(tag => {
    if(categoryMapping[tag]) {
      target.category = categoryMapping[tag];
      return true;
    }
    return false;
  })

  target.length = source.DistanceLength > 0 ? source.DistanceLength : null;

  target.minAltitude = source.AltitudeLowestPoint;
  target.maxAltitude = source.AltitudeHighestPoint;

  const difficultyMapping = {
    '2': 'beginner',
    '4': 'intermediate',
    '6': 'expert'
  }
  target.difficulty = {
    'eu': difficultyMapping[source.Difficulty]
  };

  const geometry = utils.transformGeometry(source.GpsInfo, ['Startpunkt', 'Endpunkt'], source.GpsPoints, source.GpsTrack);
  if(geometry) target.geometries.push(geometry);

  target.openingHours = utils.transformOperationSchedule(source.OperationSchedule);

  target.address = utils.transformAddress(source.ContactInfos, ['city','country','zipcode']);

  target.howToArrive = utils.transformHowToArrive(source.Detail);

  return target;
}
