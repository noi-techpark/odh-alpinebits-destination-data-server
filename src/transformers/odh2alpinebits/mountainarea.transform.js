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
const { transformMultimediaDescriptionsRelationship, 
  transformMediaObject } = require('./media-object.transform');

function transformMountainArea(originalObject, included = {}, request) {
  const source = JSON.parse(JSON.stringify(originalObject));
  let target = templates.createObject('MountainArea');

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

  attributes.howToArrive = utils.transformHowToArrive(source.Detail);
  attributes.address = utils.transformAddress(source.ContactInfos, ['city','country','zipcode']);

  attributes.minAltitude = source.AltitudeFrom || null;
  attributes.maxAltitude = source.AltitudeTo || null;
  attributes.totalTrailLength = parseInt(source.TotalSlopeKm) || null;

  attributes.openingHours = utils.transformOperationSchedule(source.OperationSchedule);

  if(source.Longitude && source.Latitude) {
    let point = templates.createObject('Point');

    point.coordinates = [ source.Longitude, source.Latitude ];
    if(source.Altitude)
      point.coordinates.push(source.Altitude);
    
    attributes.geometries = [ point ];
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

    if(!target.geometries)
      attributes.geometries = [];
    
    attributes.geometries.push(polygon);
  }

  let categories = [];
  source.OdhTags.forEach(tag => {
    categories.push("odh/"+ tag.Id.replace(/[\/|\s]/g,'-').toLowerCase());
  })

  if(categories.length>0)
    attributes.categories = categories;


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

  let map = transformAreaMap(source, included, request);
  if(map) {
    utils.addRelationshipToMany(relationships, 'multimediaDescriptions', map, links.self);
    utils.addIncludedResource(included, map);
  }

  let { areaOwner, ownerLogo } = transformAreaOwner(source.ContactInfos, request);
  
  utils.addRelationshipToOne(relationships, 'areaOwner', areaOwner, links.self);
  utils.addIncludedResource(included, areaOwner);
  
  if(ownerLogo)
    utils.addIncludedResource(included, ownerLogo);

  if(source.lifts)
    source.lifts.forEach( lift => {
      let newLift = conditionalTransform(lift, included, request, 'lifts', transformLift);
      utils.addRelationshipToMany(relationships, 'lifts', newLift, links.self);
      utils.addIncludedResource(included, newLift);
    });

  if(source.trails){
    source.trails.forEach( trail => {
      let newTrail = conditionalTransform(trail, included, request, 'trails', transformTrail);
      utils.addRelationshipToMany(relationships, 'trails', newTrail, links.self);
      utils.addIncludedResource(included, newTrail);
    });
  }

  if(source.snowparks){
    source.snowparks.forEach( snowpark => {
      let newSnowpark = conditionalTransform(snowpark, included, request, 'snowparks', transformSnowpark);
      utils.addRelationshipToMany(relationships, 'snowparks', newSnowpark, links.self);
      utils.addIncludedResource(included, newSnowpark);
    });
  }

  return target;
}

function transformAreaOwner(contactInfo, request){
  let areaOwner = templates.createObject('Agent');
  
  let idBaseAttributes = [ ['de','Email'],['it','Email'],['en','Email'],
                           ['de','CompanyName'],['it','CompanyName'],['en','CompanyName'] ];

  let idBase = utils.safeGetOne(idBaseAttributes, contactInfo);

  areaOwner.id = shajs('sha256').update(idBase).digest('hex');
  
  let links = areaOwner.links;
  Object.assign(links, utils.createSelfLink(areaOwner, request));

  areaOwner.attributes.categories = ['alpinebits/organization'];
  areaOwner.attributes.url = utils.safeGetOne([['de','Url'],['it','Url'],['en','Url']], contactInfo);
  areaOwner.attributes.name = {
    deu: utils.safeGet(['de','CompanyName'], contactInfo),
    ita: utils.safeGet(['it','CompanyName'], contactInfo),
    eng: utils.safeGet(['en','CompanyName'], contactInfo),
  };

  let contactPoint = templates.createObject('ContactPoint');
  contactPoint.email = utils.safeGetOne([['de','Email'],['it','Email'],['en','Email']], contactInfo);
  contactPoint.telephone = utils.safeGetOne([['de','Phonenumber'],['it','Phonenumber'],['en','Phonenumber']], contactInfo);
  contactPoint.address = utils.transformAddress(contactInfo, ['street','city','country','zipcode']);

  if(contactPoint.address && (!contactPoint.address.city || !contactPoint.address.country))
    contactPoint.address = null;

  if(!contactPoint.email && !contactPoint.telephone && !contactPoint.address)
    contactPoint = null;

  if(contactPoint)
    areaOwner.attributes.contactPoints = [ contactPoint ];

  let ownerLogo;
  let logoUrl = utils.safeGetOne([['de','LogoUrl'],['it','LogoUrl'],['en','LogoUrl']], contactInfo);
  if(logoUrl) {
    ownerLogo = templates.createObject('MediaObject');
    ownerLogo.id = areaOwner.id+'+logo';

    ownerLogo.attributes.name = {
      deu: 'Logo of '+areaOwner.attributes.name.deu,
      eng: 'Logo of '+areaOwner.attributes.name.eng,
      ita: 'Logo of '+areaOwner.attributes.name.ita
    };

    ownerLogo.attributes.url = logoUrl;
    ownerLogo.attributes.contentType = 'image/jpg';
    ownerLogo.attributes.license = 'CC0-1.0';

    Object.assign(areaOwner.links, utils.createSelfLink(areaOwner, request));
    Object.assign(ownerLogo.links, utils.createSelfLink(ownerLogo, request));
    utils.addRelationshipToMany(areaOwner.relationships, 'multimediaDescriptions', ownerLogo, areaOwner.links.self);
  }

  return ({
    areaOwner,
    ownerLogo
  })
}

function transformAreaOwnerRelationship(sourceArea, included, request) {
  let { areaOwner, ownerLogo } = transformAreaOwner(sourceArea.ContactInfos, request);
  
  if(ownerLogo)
    utils.addIncludedResource(included, ownerLogo);

  return areaOwner;
}

function transformAreaMultimedDescriptionsRelationship (sourceArea, included, request) {
  let data = transformMultimediaDescriptionsRelationship(sourceArea, included, request);

  if(!data)
    data = [];

  let map = transformAreaMap(sourceArea, included, request);  

  if(map)
    data.push(map);

  if(!data)
    return null;

  return data;
}

function transformAreaMap(sourceArea, included, request) {
  if(!sourceArea.SkiAreaMapURL) 
    return null

  let map = templates.createObject('MediaObject');
  map.id = sourceArea.Id+'+map';
  map.attributes.name = {
    deu: 'Skikarte',
    eng: 'Ski map',
    ita: 'Mappa comprensorio sciistico'
  };
  map.attributes.url = sourceArea.SkiAreaMapURL,
  map.attributes.contentType = 'image/jpg',
  map.attributes.license = 'CC0-1.0'

  Object.assign(map.links, utils.createSelfLink(map, request));

  return map;
}

function conditionalTransform(originalObject, included, request, type, transformFn) {
  if(Object.keys(originalObject).join('')===['Id','Name'].join(''))
    return ({
      type: type,
      id: originalObject.Id,
      attributes: {
        name: {
          deu: originalObject.Name,
          ita: originalObject.Name,
          eng: originalObject.Name
        }
      }
    })

  return transformFn(originalObject, included, request);
}

module.exports = {
  transformMountainArea,
  transformAreaOwnerRelationship,
  transformAreaMultimedDescriptionsRelationship
}