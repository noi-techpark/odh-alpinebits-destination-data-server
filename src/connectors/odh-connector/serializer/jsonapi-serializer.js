let JSONAPISerializer = require('jsonapi-serializer').Serializer;
let { getPagination } = require('./pagination');

const EVENT = 'events';
const AGENT = 'agents';
const MEDIA_OBJECT = 'mediaObjects';
const EVENT_SERIES = 'eventSeries';
const GEOMETRY = 'geometries';
const PLACE = 'places';

const basicAttr = ['name','shortName','description','abstract','url'];
const metaAttr = ['dataProvider', 'lastUpdate'];


function serializeEventData(data, request, meta) {
  let Serializer;

  if(Array.isArray(data))
    Serializer = new JSONAPISerializer('events', getEventCollectionSerialization(request, meta));
  else
    Serializer = new JSONAPISerializer('events', getRootEventSerialization(request, meta));

  return Serializer.serialize(data);
}

function getEventCollectionSerialization(request, meta) {
  const serializer = getEventSerialization(request, [], true);
  const pagination = getPagination(request, meta, EVENT);

  serializer.topLevelLinks = {
    ...serializer.topLevelLinks,
    ...pagination.links
  }

  serializer.meta = {
    ...pagination.meta
  }

  return serializer;
}

function getEventSerialization(request, path = [], isRoot) {
  let links = {};
  let subEvents = {};
  let attr = [...metaAttr, ...basicAttr, 'startDate', 'endDate', 'originalStartDate',
  'originalEndDate', 'categories', 'structure', 'status', 'capacity', 'multimediaDescriptions', 'publisher', 'organizers', 'sponsors', 'contributors', 'series', 'venues'];

  if(isRoot){
    links = {
      self: request.selfUrl
    };

    subEvents = {
      ref: 'id',
      included: isIncluded(request, ['subEvents']),
      typeForAttribute: getType,
      ...getEventSerialization(request, ['subEvents'], false),
    }

    attr.push('subEvents');
  }

  let selectedAttr = request.query.fields[EVENT];

  return({
    attributes: selectedAttr || attr,
    keyForAttribute: 'camelCase',
    nullIfMissing: true,
    dataLinks: {
      self: (data) => getSelfLink(request, EVENT, data)
    },
    topLevelLinks: links,
    typeForAttribute: getType,
    multimediaDescriptions: getMediaSerialization(request, [...path, 'multimediaDescriptions']),
    publisher: getAgentSerialization(request, [...path, 'publisher']),
    organizers: getAgentSerialization(request, [...path, 'organizers']),
    sponsors:getAgentSerialization(request, [...path, 'sponsors']),
    contributors: contributorSerialization(request, [...path, 'contributors']),
    series: getEventSeriesSerialization(request, [...path, 'series']),
    venues: getVenueSerialization(request, [...path, 'venues']),
    subEvents: subEvents
  })
}

function getAddressSerialization() {
  return ({
    attributes: ['street', 'category', 'street', 'city', 'region', 'zipcode', 'complement', 'country']
  });
}

function getHoursSerialization() {
  return ({
    attributes: ['hours', 'validFrom', 'validTo']
  });
}

function getContactSerialization() {
  return ({
    attributes: [...basicAttr, 'email', 'telephone', 'address', 'availableHours'],
    address: getAddressSerialization(),
    availableHours: getHoursSerialization()
  });
}

function getAgentSerialization(request, path = []) {
  let defaultAttr = [...basicAttr,'category','contacts'];
  let selectedAttr = request.query.fields[AGENT];

  return ({
    ref: 'id',
    included: isIncluded(request, path),
    typeForAttribute: getType,
    attributes: selectedAttr || defaultAttr,
    contacts: getContactSerialization()
  });
}

function contributorSerialization(request, path = []) {
  return ({
    ref: 'id',
    included: true,
    typeForAttribute: getType,
    attributes: ['agent', 'role'],
    agent: getAgentSerialization(request, [...path, 'agent'])
  });
}

function getMediaSerialization(request, path = []) {
  let defaultAttr = [...basicAttr,'contentType','height','width','duration','license','copyrightOwner'];
  let selectedAttr = request.query.fields[MEDIA_OBJECT];

  return ({
    ref: 'id',
    included: isIncluded(request, path),
    typeForAttribute: getType,
    attributes: selectedAttr || defaultAttr,
    copyrightOwner: getAgentSerialization(request, [...path,'copyrightOwner'])
  });
}

function getEventSeriesSerialization(request, path = []) {
  let defaultAttr = [...basicAttr, 'multimediaDescriptions', 'frequency'];
  let selectedAttr = request.query.fields[EVENT_SERIES];

  return ({
    ref: 'id',
    included: isIncluded(request, path),
    typeForAttribute: getType,
    attributes: selectedAttr || defaultAttr,
    multimediaDescriptions: getMediaSerialization(request, [...path, 'multimediaDescriptions'])
  });
}

function getGeometrySerialization(request, path = []) {
  return ({
    ref: 'id',
    included: isIncluded(request, path),
    typeForAttribute: getType,
    attributes: ['coordinates', 'category'],
    transform: function (data) {
       data.category = data['@type'];
       //TODO: fix this
       return data;
    }
  });
}

function getVenueSerialization(request, path = []) {
  let defaultAttr = [...basicAttr, 'multimediaDescriptions', 'frequency', 'address', 'geometries', 'howToArrive', 'connections', 'openingHours'];
  let selectedAttr = request.query.fields[PLACE];

  return ({
    ref: 'id',
    included: isIncluded(request, path),
    typeForAttribute: getType,
    attributes: selectedAttr || defaultAttr,
    multimediaDescriptions: getMediaSerialization(request, path),
    address: getAddressSerialization(),
    openingHours: getHoursSerialization(),
    geometries: getGeometrySerialization(request, path)
  });
}

function getType (attribute, data) {
  switch(data['@type']) {
    case 'Event':
      return EVENT;
    case 'Agent':
      return AGENT;
    case 'MediaObject':
      return MEDIA_OBJECT;
    case 'EventSeries':
      return EVENT_SERIES;
    case 'Point':
    case 'LineString':
    case 'Polygon':
    case 'MultiPoint':
    case 'MultiLineString':
    case 'MultiPolygon':
      return GEOMETRY;
    case 'Venue':
    case 'Place':
      return PLACE;

    return data['@type'];
  }
}

function getSelfLink(request, resourceType, data){
  return request.baseUrl + '/' + resourceType + '/' + data.id;
}

function isIncluded(request, path){
  let { include } = request.query;

  if(!path || (Array.isArray(path) && path.length===0) || !include)
    return false;

  let object = include;

  for (entry of path){
    if(!object[entry])
      return false;

    object = object[entry];
  }

  return true;
}

module.exports.serializeEventData = serializeEventData;
