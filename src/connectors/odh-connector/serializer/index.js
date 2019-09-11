let JSONAPISerializer = require('jsonapi-serializer').Serializer;
let { getPagination } = require('./pagination');

const EVENT = 'events';
const AGENT = 'agents';
const MEDIA_OBJECT = 'mediaObjects';
const EVENT_SERIES = 'eventSeries';
const GEOMETRY = 'geometries';
const PLACE = 'places';

const BASIC_ATTR = ['name','shortName','description','abstract','url'];
const META_ATTR = ['dataProvider', 'lastUpdate'];

module.exports = {
  serializeEvents: function (data, request, meta) {
    let Serializer = new JSONAPISerializer(EVENT, getEventCollectionSerialization(request, meta));
    return Serializer.serialize(data);
  },
  serializeEvent: function (data, request, meta) {
    let Serializer = new JSONAPISerializer(EVENT, getEventSerialization(request, [], true, false));
    return Serializer.serialize(data);
  },
  serializeSubevents: function (data, request, meta) {
    Serializer = new JSONAPISerializer(EVENT, getEventSerialization(request, [], true, true));
    return Serializer.serialize(data.subEvents || []);
  },

  serializePublisher: getFieldSerialization('publisher', AGENT, getAgentSerialization, getEmptyObject, false),
  serializeSeries: getFieldSerialization('series', EVENT_SERIES, getEventSeriesSerialization, getEmptyObject, false),

  serializeMediaObjects: getFieldSerialization('multimediaDescriptions', MEDIA_OBJECT, getMediaSerialization, getEmptyArray, true),
  serializeMediaObject: getResourceInArraySerialization('multimediaDescriptions', 'objectId', MEDIA_OBJECT, getMediaSerialization),

  serializeContributors: getFieldSerialization('contributors', AGENT, getAgentSerialization, getEmptyArray, true),
  serializeContributor: getResourceInArraySerialization('contributors', 'agentId', AGENT, getAgentSerialization),

  serializeOrganizers: getFieldSerialization('organizers', AGENT, getAgentSerialization, getEmptyArray, true),
  serializeOrganizer: getResourceInArraySerialization('organizers', 'agentId', AGENT, getAgentSerialization),

  serializeSponsors: getFieldSerialization('sponsors', AGENT, getAgentSerialization, getEmptyArray, true),
  serializeSponsor: getResourceInArraySerialization('sponsors', 'agentId', PLACE, getAgentSerialization),

  serializeVenues: getFieldSerialization('venues', PLACE, getVenueSerialization, getEmptyArray, true),
  serializeVenue: getResourceInArraySerialization('venues', 'venueId', PLACE, getVenueSerialization),
  serializeGeometries: function (data, request, meta){
    Serializer = new JSONAPISerializer(GEOMETRY, getGeometrySerialization(request, [], true));
    let venue = data.venues.find((venue) => venue.id === request.params.venueId);
    return Serializer.serialize(venue.geometries || []);
  }
}

function getFieldSerialization (field, resourceType, getSerialization, getEmptyResponse, isCollection) {
  return (
    function (data, request, meta) {
      Serializer = new JSONAPISerializer(resourceType, getSerialization(request, [], true, isCollection));

      let filteredData = data[field];

      if(!data[field])
        return getEmptyResponse(request)

      return Serializer.serialize(filteredData);
    }
  )
}

function getResourceInArraySerialization (field, subResourceId, resourceType, getSerialization) {
  return (
    function (data, request, meta) {
      Serializer = new JSONAPISerializer(resourceType, getSerialization(request, [], true));

      const subResource = data[field].find((resource) => resource.id === request.params[subResourceId]);

      return Serializer.serialize(subResource);
    }
  )
}

function getEmptyObject(request){
  return ({
    links: {
      self: request.selfUrl
    },
    data: {}
  });
}

function getEmptyArray(request){
  return ({
    links: {
      self: request.selfUrl
    },
    data: []
  });
}

function getDefaultSerialization(request, path, isRoot, isCollection){
  let serialization = {
    keyForAttribute: 'camelCase',
    typeForAttribute: getType,
    nullIfMissing: true,
  }

  const getRelatedLink = (record, current, parent) => {
    console.log("PARENT:", parent.id);

    if(request.params.id) {
      return request.selfUrl+'/'+path[path.length-1]
    }

    return request.selfUrl+'/'+record.id+'/'+path[path.length-1]
  }

  // e.g. "/events"
  if(isRoot && isCollection)
    Object.assign(serialization, {
      topLevelLinks: { self: request.selfUrl },
      dataLinks: { self: (record) => request.selfUrl+'/'+record.id }
    });

  if(isRoot && !isCollection)
    Object.assign(serialization, {
      topLevelLinks: { self: request.selfUrl }
    });

  if(!isRoot && isCollection)
    Object.assign(serialization, {
      ref: 'id',
      included: isIncluded(request, path),
      relationshipLinks: { related: getRelatedLink }
    });

  if(!isRoot && !isCollection)
    Object.assign(serialization, {
      ref: 'id',
      included: isIncluded(request, path),
      relationshipLinks: { related: getRelatedLink }
    });

  return serialization;
}

function getEventCollectionSerialization(request, meta) {
  const serializer = getEventSerialization(request, [], true, true);
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

function getEventSerialization(request, path = [], isRoot, isCollection) {
  let attr = [...META_ATTR, ...BASIC_ATTR, 'startDate', 'endDate', 'originalStartDate',
  'originalEndDate', 'categories', 'structure', 'status', 'capacity', 'multimediaDescriptions', 'publisher', 'organizers', 'sponsors', 'contributors', 'series', 'venues'];
  let selectedAttr = request.query.fields[EVENT];

  let serializationOpts = {};

  if(isRoot){
    serializationOpts = {
      ...serializationOpts,
      topLevelLinks: {
        self: request.selfUrl
      },
      subEvents: {
        ref: 'id',
        included: isIncluded(request, ['subEvents']),
        typeForAttribute: getType,
        ...getEventSerialization(request, ['subEvents'], false, true),
      }
    }

    attr.push('subEvents');
  }

  if(isCollection){
    serializationOpts = {
      ...serializationOpts,
      dataLinks: {
        self: (data) => request.baseUrl + '/' + EVENT + '/' + data.id
      }
    }
  }

  return({
    ...serializationOpts,
    attributes: selectedAttr || attr,
    keyForAttribute: 'camelCase',
    nullIfMissing: true,
    typeForAttribute: getType,
    multimediaDescriptions: getMediaSerialization(request, [...path, 'multimediaDescriptions'], false, true),
    publisher: getAgentSerialization(request, [...path, 'publisher'], false, false),
    organizers: getAgentSerialization(request, [...path, 'organizers'], false, true),
    sponsors:getAgentSerialization(request, [...path, 'sponsors'], false, true),
    contributors: contributorSerialization(request, [...path, 'contributors'], false, true),
    series: getEventSeriesSerialization(request, [...path, 'series'], false, false),
    venues: getVenueSerialization(request, [...path, 'venues'], false, true),
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
    attributes: [...BASIC_ATTR, 'email', 'telephone', 'address', 'availableHours'],
    address: getAddressSerialization(),
    availableHours: getHoursSerialization()
  });
}

function getAgentSerialization(request, path = [], isRoot, isCollection) {
  let properties = getDefaultSerialization(request, path, isRoot, isCollection);
  let defaultAttr = [...BASIC_ATTR,'category','contacts'];
  let selectedAttr = request.query.fields[AGENT];
  return ({
    ...properties,
    attributes: selectedAttr || defaultAttr,
    contacts: getContactSerialization()
  });
}

function contributorSerialization(request, path = [], isRoot, isCollection) {
  return ({
    ref: 'id',
    included: true,
    keyForAttribute: 'camelCase',
    typeForAttribute: getType,
    attributes: ['agent', 'role'],
    agent: getAgentSerialization(request, [...path, 'agent'], false, false)
  });
}

function getMediaSerialization(request, path = [], isRoot, isCollection) {
  let properties = getDefaultSerialization(request, path, isRoot, isCollection);
  let defaultAttr = [...BASIC_ATTR,'contentType','height','width','duration','license','copyrightOwner'];
  let selectedAttr = request.query.fields[MEDIA_OBJECT];

  return ({
    ...properties,
    attributes: selectedAttr || defaultAttr,
    copyrightOwner: getAgentSerialization(request, [...path,'copyrightOwner'], false, false)
  });
}

function getEventSeriesSerialization(request, path = [], isRoot, isCollection) {
  let properties = getDefaultSerialization(request, path, isRoot, isCollection);
  let defaultAttr = [...BASIC_ATTR, 'multimediaDescriptions', 'frequency'];
  let selectedAttr = request.query.fields[EVENT_SERIES];

  return ({
    ...properties,
    attributes: selectedAttr || defaultAttr,
    multimediaDescriptions: getMediaSerialization(request, [...path, 'multimediaDescriptions'], false)
  });
}

function getGeometrySerialization(request, path = [], isRoot, isCollection) {
  let properties = getDefaultSerialization(request, path, isRoot);

  return ({
    ...properties,
    attributes: ['coordinates', 'category'],
    transform: function (data) {
       data.category = data['@type'];
       //TODO: fix this
       return data;
    }
  });
}

function getVenueSerialization(request, path = [], isRoot, isCollection) {
  let properties = getDefaultSerialization(request, path, isRoot, isCollection);
  let defaultAttr = [...BASIC_ATTR, 'multimediaDescriptions', 'frequency', 'address', 'geometries', 'howToArrive', 'connections', 'openingHours'];
  let selectedAttr = request.query.fields[PLACE];

  return ({
    ...properties,
    attributes: selectedAttr || defaultAttr,
    multimediaDescriptions: getMediaSerialization(request, [...path,'multimediaDescriptions'], false),
    address: getAddressSerialization(),
    openingHours: getHoursSerialization(),
    geometries: getGeometrySerialization(request, [...path,'geometries'], false)
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
