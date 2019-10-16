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

module.exports = (object) => {
  const source = JSON.parse(JSON.stringify(object));
  let target = templates.createObject('Snowpark');

  Object.assign(target, utils.transformMetadata(source));
  Object.assign(target, utils.transformBasicProperties(source));

  target.minAltitude = source.AltitudeLowestPoint;
  target.maxAltitude = source.AltitudeHighestPoint;

  const difficultyMapping = {
    '2': 'alpinebits/easy',
    '4': 'alpinebits/medium',
    '6': 'alpinebits/hard'
  }
  target.difficulty = difficultyMapping[source.Difficulty];

  target.length = source.DistanceLength > 0 ? source.DistanceLength : null;

  target.howToArrive = utils.transformHowToArrive(source.Detail);

  target.openingHours = utils.transformOperationSchedule(source.OperationSchedule);

  target.address = utils.transformAddress(source.ContactInfos, ['city','country','zipcode']);

  const geometry = utils.transformGeometry(source.GpsInfo, ['Startpunkt', 'Endpunkt'], source.GpsPoints, source.GpsTrack);
  if(geometry) target.geometries.push(geometry);

  target.multimediaDescriptions = []
  for (image of source.ImageGallery)
    target.multimediaDescriptions.push(utils.transformMediaObject(image));

  return target;
}
