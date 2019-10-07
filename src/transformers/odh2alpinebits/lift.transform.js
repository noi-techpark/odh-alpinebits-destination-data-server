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

PARTIALLY USED :
  * Detail: Title, BaseText, GetThereText
  * ContactInfos: City, Country, ZipCode

IGNORED:
> Potentially Useful:
  * DistanceDuration: we imagine to be the expected duration of a ride on a lift.
  * RunToValley: Does the lift has a direct connection to a trail
  * AltitudeDifference
  * LiftAvailable: the meaning of this field is not clear
  * BikeTransport: can tourists carry their bikes on it

> Empty fields:
  * ImageGallery (always [])
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

> Not in scope:
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

var sanitizeHtml = require('sanitize-html');
const utils = require('./utils');
const templates = require('./templates');

const htmlSanitizeOpts = {
  allowedTags: [],
  allowedAttributes: {}
};

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

  let geometry = templates.createObject('LineString');
  target.geometries.push(geometry);

  source.GpsInfo.forEach(point => {
    let newPoint = [];
    newPoint.push(point.Longitude);
    newPoint.push(point.Latitude);
    newPoint.push(point.Altitude);
    geometry.coordinates.push(newPoint);
  })

  target.length = source.DistanceLength>0 ? source.DistanceLength : null;

  const deGetThere = utils.safeGet(['de','GetThereText'], source.Detail);
  const itGetThere = utils.safeGet(['it','GetThereText'], source.Detail);
  const enGetThere = utils.safeGet(['en','GetThereText'], source.Detail);

  if(deGetThere || itGetThere || enGetThere)
    target.howToArrive = {
      deu: sanitizeHtml(deGetThere, htmlSanitizeOpts),
      ita: sanitizeHtml(itGetThere, htmlSanitizeOpts),
      eng: sanitizeHtml(enGetThere, htmlSanitizeOpts)
    };

  target.personsPerChair = parseInt(source.PoiType, 10);

  source.OperationSchedule.forEach( entry => {
    let newEntry = templates.createObject('HoursSpecification');
    target.openingHours.push(newEntry);

    newEntry.validFrom = entry.Start.replace(/T.*/,'');
    newEntry.validTo = entry.Stop.replace(/T.*/,'');

    entry.OperationScheduleTime.forEach( hours =>
      newEntry.hours.push({ opens: hours.Start, closes: hours.End})
    );
  })

  let address = templates.createObject('Address');
  target.address = address;

  let contactInfo = source.ContactInfos;

  target.address.city = {
    deu: utils.safeGet(['de','City'], contactInfo),
    ita: utils.safeGet(['it','City'], contactInfo),
    eng: utils.safeGet(['en','City'], contactInfo)
  };

  address.country = utils.safeGet(['de','CountryCode'], contactInfo) ||
    utils.safeGet(['it','CountryCode'], contactInfo) || utils.safeGet(['en','CountryCode'], contactInfo);

  address.zipcode = utils.safeGet(['de','ZipCode'], contactInfo) ||
    utils.safeGet(['it','ZipCode'], contactInfo) || utils.safeGet(['en','ZipCode'], contactInfo);

  address.region = {}

  return target;
}
