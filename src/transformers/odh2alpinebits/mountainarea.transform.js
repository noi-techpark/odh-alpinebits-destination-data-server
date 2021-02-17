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

const shajs = require("sha.js");
const utils = require("./utils");
const templates = require("./templates");
const transformLift = require("./lift.transform");
const transformTrail = require("./trail.transform");
const transformSnowpark = require("./snowpark.transform");
const {
  transformMultimediaDescriptionsRelationship,
  transformMediaObject,
} = require("./media-object.transform");
const mappings = require("./mappings");

module.exports = (originalObject, included = {}, request) => {
  const { apiVersion } = request;

  if (!apiVersion || apiVersion === "1.0") {
    return transformEventV1(originalObject, included, request);
  } else if (apiVersion === "2.0") {
    return transformEventV2(originalObject, included, request);
  } else {
    throw new Error(`Unexpected value for 'apiVersion': ${apiVersion}`);
  }
};

function transformMountainArea(originalObject, included = {}, request) {
  const { apiVersion } = request;

  if (!apiVersion || apiVersion === "1.0") {
    return transformMountainAreaV1(originalObject, included, request);
  } else if (apiVersion === "2.0") {
    return transformMountainAreaV2(originalObject, included, request);
  } else {
    throw new Error(`Unexpected value for 'apiVersion': ${apiVersion}`);
  }
}

function transformAreaMultimedDescriptionsRelationship(originalObject, included = {}, request) {
  const { apiVersion } = request;

  if (!apiVersion || apiVersion === "1.0") {
    return transformAreaMultimedDescriptionsRelationshipV1(originalObject, included, request);
  } else if (apiVersion === "2.0") {
    return transformAreaMultimedDescriptionsRelationshipV2(originalObject, included, request);
  } else {
    throw new Error(`Unexpected value for 'apiVersion': ${apiVersion}`);
  }
}

function transformMountainAreaV1(originalObject, included = {}, request) {
  const source = JSON.parse(JSON.stringify(originalObject));
  const target = templates.createObject('MountainArea','1.0');

  target.id = source.Id;

  utils.processMeta(source, target, request);
  utils.processLinks(target, request);

  utils.processBasicAttributes(source, target);

  utils.processHowToArriveAttribute(source, target);
  processMinAltitudeAttribute(source, target);
  processMaxAltitudeAttribute(source, target);
  processTotalTrailLengthAttribute(source, target);
  utils.processOpeningHoursAttribute(source, target);
  processGeometriesAttribute(source, target);
  processCategoriesAttributeV1(source, target);

  processMultimediaDescriptionsRelationship(source,target,included,request)
  processAreaOwnerRelationship(source,target,included,request);
  processLiftsRelationship(source,target,included,request);
  processTrailsRelationship(source,target,included,request);
  processSnowparksRelationship(source,target,included,request);

  return target;
}

function transformMountainAreaV2(originalObject, included = {}, request) {
  const source = JSON.parse(JSON.stringify(originalObject));
  const target = templates.createObject('MountainArea','2.0');

  target.id = source.Id;

  utils.processMeta(source, target, request);
  utils.processLinks(target, request);

  utils.processBasicAttributes(source, target);

  utils.processHowToArriveAttribute(source, target);
  processMinAltitudeAttribute(source, target);
  processMaxAltitudeAttribute(source, target);
  processTotalTrailLengthAttribute(source, target);
  utils.processOpeningHoursAttribute(source, target);
  processGeometriesAttribute(source, target);

  processMultimediaDescriptionsRelationship(source,target,included,request)
  processAreaOwnerRelationship(source,target,included,request);
  processLiftsRelationship(source,target,included,request);
  processTrailsRelationship(source,target,included,request);
  processSnowparksRelationship(source,target,included,request);
  processCategoriesRelationshipV2(source,target,included,request);

  return target;
}

function processMinAltitudeAttribute(source, target) {
  const { attributes } = target;
  attributes.minAltitude = source.AltitudeFrom || null;
}

function processMaxAltitudeAttribute(source, target) {
  const { attributes } = target;
  attributes.maxAltitude = source.AltitudeTo || null;
}

function processTotalTrailLengthAttribute(source, target) {
  const { attributes } = target;  
  attributes.totalTrailLength = parseInt(source.TotalSlopeKm) || null;
}

function processGeometriesAttribute(source, target) {
  const { attributes } = target;  
  attributes.totalTrailLength = parseInt(source.TotalSlopeKm) || null;

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
}

function processCategoriesAttributeV1(source, target) {
  const { attributes } = target;

  if (Array.isArray(source.SmgTags)) {
    const mappedTags = source.SmgTags
        .map((tag) => mappings.skiAreaSmgTagToODHCategories[tag])
        .map((mappedTag) => mappedTag.replace(/\:/,'/'));
    const mappedTagsSet = new Set(mappedTags);
    attributes.categories = mappedTagsSet.size > 0 ? [ ...mappedTagsSet ] : null;
  }
}

function processMultimediaDescriptionsRelationship(source,target,included,request) {
  const { relationships, links } = target;
  for (image of source.ImageGallery){
    const { mediaObject, copyrightOwner } = transformMediaObject(image, links, request);
    utils.addRelationshipToMany(relationships, 'multimediaDescriptions', mediaObject, links.self);
    utils.addIncludedResource(included, mediaObject);
    utils.addIncludedResource(included, copyrightOwner);
  }

  const map = transformAreaMap(source, included, request);
  if(map) {
    utils.addRelationshipToMany(relationships, 'multimediaDescriptions', map, links.self);
    utils.addIncludedResource(included, map);
  }
}

function processAreaOwnerRelationship(source,target,included,request) {
  const { relationships, links } = target;
  const { areaOwner, ownerLogo } = transformAreaOwner(source.ContactInfos, request);
  
  utils.addRelationshipToOne(relationships, 'areaOwner', areaOwner, links.self);
  utils.addIncludedResource(included, areaOwner);
  
  if(ownerLogo)
    utils.addIncludedResource(included, ownerLogo);
}

function processLiftsRelationship(source,target,included,request) {
  const { relationships, links } = target;
  if(source.lifts && source.lifts.length>0)
    source.lifts.forEach( lift => {
      let newLift = conditionalTransform(lift, included, request, 'lifts', transformLift);
      utils.addRelationshipToMany(relationships, 'lifts', newLift, links.self);
      utils.addIncludedResource(included, newLift);
    });
}

function processTrailsRelationship(source,target,included,request) {
  const { relationships, links } = target;
  if(source.trails && source.trails.length>0){
    source.trails.forEach( trail => {
      let newTrail = conditionalTransform(trail, included, request, 'trails', transformTrail);
      utils.addRelationshipToMany(relationships, 'trails', newTrail, links.self);
      utils.addIncludedResource(included, newTrail);
    });
  }
}

function processSnowparksRelationship(source,target,included,request) {
  const { relationships, links } = target;
  if(source.snowparks && source.snowparks.length>0){
    source.snowparks.forEach( snowpark => {
      let newSnowpark = conditionalTransform(snowpark, included, request, 'snowparks', transformSnowpark);
      utils.addRelationshipToMany(relationships, 'snowparks', newSnowpark, links.self);
      utils.addIncludedResource(included, newSnowpark);
    });
  }
}

function processCategoriesRelationshipV2(source, target) {
  const { relationships, links } = target;
  const getCategoryReference = (categoryId) => {
    return categoryId ? { type: "categories", id: categoryId } : null;
  };

  if (Array.isArray(source.SmgTags)) {
    const mappedTags = source.SmgTags.map((tag) => mappings.skiAreaSmgTagToODHCategories[tag]);
    const mappedTagsSet = new Set(mappedTags);

    for (const mappedTag of mappedTagsSet) {
      const categoryReference = getCategoryReference(mappedTag);
      utils.addRelationshipToMany(relationships, "categories", categoryReference, links.self);
    }
  }
}

// TODO: do some refactoring here too
function transformAreaOwner(contactInfo, request){
  let areaOwner = templates.createObject('Agent', request.apiVersion);
  
  let idBaseAttributes = [ ['de','Email'],['it','Email'],['en','Email'],
                           ['de','CompanyName'],['it','CompanyName'],['en','CompanyName'] ];

  let idBase = utils.safeGetOne(idBaseAttributes, contactInfo);

  areaOwner.id = shajs('sha256').update(idBase).digest('hex');
  
  let links = areaOwner.links;
  Object.assign(links, utils.createSelfLink(areaOwner, request));

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
    ownerLogo = templates.createObject('MediaObject', request.apiVersion);
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

  if(!request.apiVersion || request.apiVersion === '1.0') {
    areaOwner.attributes.categories = ['alpinebits/organization'];
  } else if(request.apiVersion === '2.0') {
    const category = { type: 'categories', id: 'alpinebits:organization' }
    utils.addRelationshipToMany(areaOwner.relationships, 'categories', category, areaOwner.links.self);
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

function transformAreaMultimedDescriptionsRelationshipV1 (sourceArea, included, request) {
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

  let map = templates.createObject('MediaObject', request.apiVersion);
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