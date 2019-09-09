let JSONAPISerializer = require('jsonapi-serializer').Serializer;
let { getPagination } = require('./pagination');

const EVENT = 'events';
const AGENT = 'agents';
const MEDIA_OBJECT = 'mediaObjects';
const EVENT_SERIES = 'eventSeries';
const GEOMETRY = 'geometries';

const basicAttr = ['name','shortName','description','abstract','url'];
const agentAttr = [...basicAttr,'category','contacts'];
const mediaObjectAttr = [...basicAttr,'contentType','height','width','duration','license','copyrightOwner'];
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
  const serializer = getRootEventSerialization(request);
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

function getRootEventSerialization(request, meta) {
  let serializer = getEventSerialization(request);

  serializer.topLevelLinks = { self: request.selfUrl };

  serializer.attributes.push('subEvents');
  let subEvents = {
    ref: 'id',
    included: false,
    typeForAttribute: getType,
    ...getEventSerialization(request),
  }
  serializer.subEvents = subEvents;

  return serializer;
}

function getEventSerialization(request) {
  return({
    attributes: [...metaAttr, ...basicAttr, 'startDate', 'endDate', 'originalStartDate',
  'originalEndDate', 'categories', 'structure', 'status', 'capacity', 'multimediaDescriptions', 'publisher', 'organizers', 'sponsors', 'contributors', 'series', 'venues'],
    keyForAttribute: 'camelCase',
    nullIfMissing: true,
    dataLinks: {
      self: (data) => getSelfLink(request, getType("", data), data)
    },
    typeForAttribute: getType,
    multimediaDescriptions: getMediaSerialization(request),
    publisher: getAgentSerialization(request),
    organizers: getAgentSerialization(request),
    sponsors:getAgentSerialization(request),
    contributors: contributorSerialization(request),
    series: getEventSeriesSerialization(request),
    venues: getVenueSerialization(request)
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

function getAgentSerialization(request) {
  return ({
    ref: 'id',
    included: false,
    typeForAttribute: getType,
    attributes: [...agentAttr],
    contacts: getContactSerialization()
  });
}

function contributorSerialization(request) {
  return ({
    ref: 'id',
    included: false,
    typeForAttribute: getType,
    attributes: ['agent', 'role'],
    agent: getAgentSerialization(request)
  });
}

function getMediaSerialization(request) {
  return ({
    ref: 'id',
    included: false,
    typeForAttribute: getType,
    attributes: [...mediaObjectAttr],
    copyrightOwner: getAgentSerialization(request)
  });
}

function getEventSeriesSerialization(request) {
  return ({
    ref: 'id',
    included: false,
    typeForAttribute: getType,
    attributes: [...basicAttr, 'multimediaDescriptions', 'frequency'],
    multimediaDescriptions: getMediaSerialization(request)
  });
}

function getGeometrySerialization(request) {
  return ({
    ref: 'id',
    included: false,
    typeForAttribute: getType,
    attributes: ['coordinates', 'category'],
    transform: function (data) {
       data.category = data['@type'];
       console.log(data);
       return data;
    }
  });
}

function getVenueSerialization(request) {
  return ({
    ref: 'id',
    included: false,
    typeForAttribute: getType,
    attributes: [...basicAttr, 'multimediaDescriptions', 'frequency', 'address', 'geometries', 'howToArrive', 'connections', 'openingHours'],
    multimediaDescriptions: getMediaSerialization(request),
    address: getAddressSerialization(),
    openingHours: getHoursSerialization(),
    geometries: getGeometrySerialization(request)
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

    return data['@type'];
  }
}

function getSelfLink(request, resourceType, data){
  return request.baseUrl + '/' + resourceType + '/' + data.id;
}

module.exports.serializeEventData = serializeEventData;
