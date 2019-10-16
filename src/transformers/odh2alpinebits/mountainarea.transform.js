/*
TODO:
  * SkiRegionId
  * SkiRegionName

CHECK:
  * SkiAreaMapURL ==> should we create a field for this info?

USED:
  * Altitude
  * AltitudeFrom
  * AltitudeTo
  * Detail.[it|en|de].Title
  * Detail.[it|en|de].Header
  * Detail.[it|en|de].BaseText
  * Detail.[it|en|de].SubHeader
  * Detail.[it|en|de].GetThereText
  * Id
  * LastChange
  * TotalSlopeKm
  * ImageGallery (no data in current examples, but it should work if there is)
  * OperationSchedule
  * Longitude
  * Latitude
  * GpsPolygon
  * SkiAreaMapURL ==> as multimedia object
  * ContactInfos.[it|en|de].CompanyName
  * ContactInfos.[it|en|de].Url
  * ContactInfos.[it|en|de].Email
  * ContactInfos.[it|en|de].Phonenumber
  * ContactInfos.[it|en|de].Address
  * ContactInfos.[it|en|de].City
  * ContactInfos.[it|en|de].ZipCode
  * ContactInfos.[it|en|de].CountryCode
  * ContactInfos.[it|en|de].LogoUrl

IGNORED:
> Potentially useful:
  * SlopeKmBlack
  * SlopeKmBlue
  * SlopeKmRed
  * SmgTags

> Out of scope or "useless" field (e.g. always null, [], false...)
  * Active
  * AltitudeUnitofMeasure
  * AreaId
  * ContactInfos.[it|en|de].Tax
  * ContactInfos.[it|en|de].Vat
  * ContactInfos.[it|en|de].Surname
  * ContactInfos.[it|en|de].Givenname
  * ContactInfos.[it|en|de].NamePrefix
  * ContactInfos.[it|en|de].Language
  * ContactInfos.[it|en|de].CountryName
  * CustomId
  * Detail.[it|en|de].Keywords
  * Detail.[it|en|de].Language
  * Detail.[it|en|de].IntroText
  * Detail.[it|en|de].AdditionalText
  * Detail.[it|en|de].MetaTitle
  * Detail.[it|en|de].MetaDesc
  * GpsType
  * HasLanguage
  * LocationInfo
  * RegionIds
  * Shortname
  * SmgActive
  * TourismvereinIds
  * Webcam
*/

const shajs = require('sha.js');
const utils = require('./utils');
const templates = require('./templates');
const transformLift = require('./lift.transform');
const transformTrail = require('./trail.transform');
const transformSnowpark = require('./snowpark.transform');

module.exports = (object) => {
  const source = JSON.parse(JSON.stringify(object));
  let target = templates.createObject('MountainArea');

  Object.assign(target, utils.transformMetadata(source));

  Object.assign(target, utils.transformBasicProperties(source));
  target.howToArrive = utils.transformHowToArrive(source.Detail);
  target.address = utils.transformAddress(source.ContactInfos, ['city','country','zipcode']);

  target.minAltitude = source.AltitudeFrom;
  target.maxAltitude = source.AltitudeTo;
  target.totalTrailLength = source.TotalSlopeKm;

  target.multimediaDescriptions = []
  for (image of source.ImageGallery)
    target.multimediaDescriptions.push(utils.transformMediaObject(image));

  if(source.SkiAreaMapURL) {
    let map = templates.createObject('MediaObject');
    Object.assign(map, {
      id: target.id+'+map',
      name: {
        deu: 'Ski map of '+target.name.deu,
        eng: 'Ski map of '+target.name.eng,
        ita: 'Ski map of '+target.name.ita
      },
      url: source.SkiAreaMapURL,
      contentType: 'image/jpg',
      license: 'CC0-1.0'
    });

    target.multimediaDescriptions.push(map);
  }

  target.openingHours = utils.transformOperationSchedule(source.OperationSchedule);

  if(source.Longitude && source.Latitude) {
    let point = templates.createObject('Point');

    point.coordinates = [ source.Longitude, source.Latitude ];
    if(source.Altitude)
      point.coordinates.push(source.Altitude);

    target.geometries.push(point);
  }

  if(source.GpsPolygon){
    let polygon = templates.createObject('Polygon');
    let outerRing = polygon.coordinates[0]

    source.GpsPolygon.forEach(point =>
      outerRing.push([point.Latitude, point.Longitude])
    )
    outerRing.push(outerRing[0]);

    if(utils.isClockwise(outerRing))
      outerRing = outerRing.reverse();

    target.geometries.push(polygon);
  }

  let contact = source.ContactInfos;

  let owner = templates.createObject('Agent');
  let ownerContact = templates.createObject('ContactPoint');
  let ownerAddress = templates.createObject('Address');
  target.areaOwner = owner;

  let idBaseAttributes = [
    ['de','Email'],['it','Email'],['en','Email'],
    ['de','CompanyName'],['it','CompanyName'],['en','CompanyName']
  ];
  let idBase = utils.safeGetOne(idBaseAttributes, contact);

  Object.assign(owner, {
    id: shajs('sha256').update(idBase).digest('hex'),
    name:{
      deu: utils.safeGet(['de','CompanyName'], contact),
      ita: utils.safeGet(['it','CompanyName'], contact),
      eng: utils.safeGet(['en','CompanyName'], contact),
    },
    url: utils.safeGetOne([['de','Url'],['it','Url'],['en','Url']], contact),
    contacts: [{
      ...ownerContact,
      email: utils.safeGetOne([['de','Email'],['it','Email'],['en','Email']], contact),
      telephone: utils.safeGetOne([['de','Phonenumber'],['it','Phonenumber'],['en','Phonenumber']], contact),
      address: utils.transformAddress(contact, ['street','city','country','zipcode'])
    }],
    category: 'organization'
  });

  let logoUrl = utils.safeGetOne([['de','LogoUrl'],['it','LogoUrl'],['en','LogoUrl']], contact);
  if(logoUrl) {
    let logo = templates.createObject('MediaObject');
    Object.assign(logo, {
      id: owner.id+'+logo',
      name: {
        deu: 'Logo of '+owner.name.deu,
        eng: 'Logo of '+owner.name.eng,
        ita: 'Logo of '+owner.name.ita
      },
      url: logoUrl,
      contentType: 'image/jpg',
      license: 'CC0-1.0'
    });
    owner.multimediaDescriptions = [ logo ];
  }

  if(source.lifts)
    target.lifts = source.lifts.map(lift => conditionalTransform(lift, 'Lift', transformLift));
  else
    target.lifts = [];

  if(source.trails)
    target.trails = source.trails.map(trail => conditionalTransform(trail, 'Trail', transformTrail));
  else
    target.trails = [];

  if(source.snowparks)
    target.snowparks = source.snowparks.map(park => conditionalTransform(park, 'Snowpark', transformSnowpark));
  else
    target.snowparks = [];

  return target;
}

function conditionalTransform(object, type, transformFn) {
  if(Object.keys(object).join('')===['Id','Name'].join(''))
    return ({
      '@type': type,
      'id': object.Id,
      'name': {
        'deu': object.Name,
        'ita': object.Name,
        'eng':object.Name
      }
    })

  return transformFn(object);
}
