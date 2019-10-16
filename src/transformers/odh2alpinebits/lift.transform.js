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

module.exports = (object) => {
  const source = JSON.parse(JSON.stringify(object));
  let target = templates.createObject('Lift');

  Object.assign(target, utils.transformMetadata(source));
  Object.assign(target, utils.transformBasicProperties(source));

  const categoryMapping = {
    'Sessellift': 'alpinebits/chairlift',
    'Seilbahn': 'alpinebits/funicular',
    'Skibus': 'alpinebits/skibus',
    'Förderband': 'alpinebits/conveyor-belt',
    'Telemix': 'alpinebits/telemix',
    'Standseilbahn/Zahnradbahn': 'alpinebits/cable-railway ',
    'no Subtype': null,
    'Zug': 'alpinebits/train',
    'Kabinenbahn': 'alpinebits/gondola',
    'Schrägaufzug': 'alpinebits/inclined-lift',
    'Umlaufbahn': 'alpinebits/detachable-gondola',
    'Unterirdische Bahn': 'alpinebits/underground-ropeway',
    'Skilift': 'alpinebits/skilift',
  }

  target.category = categoryMapping[source.SubType];

  target.length = source.DistanceLength>0 ? source.DistanceLength : null;

  target.howToArrive = utils.transformHowToArrive(source.Detail);

  target.personsPerChair = parseInt(source.PoiType, 10);

  target.openingHours = utils.transformOperationSchedule(source.OperationSchedule);

  target.address = utils.transformAddress(source.ContactInfos, ['city','country','zipcode']);

  const geometry = utils.transformGeometry(source.GpsInfo, ['Talstation','Mittelstation','Bergstation'], source.GpsPoints, source.GpsTrack);
  if(geometry) target.geometries.push(geometry);

  target.multimediaDescriptions = []
  for (image of source.ImageGallery)
    target.multimediaDescriptions.push(utils.transformMediaObject(image));

  return target;
}
