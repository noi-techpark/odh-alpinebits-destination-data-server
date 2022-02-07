const { Agent } = require("./agent");
const { Category } = require("./category");
const { Event } = require("./event");
const { EventSeries } = require("./event_series");
const { Feature } = require("./feature");
const { MediaObject } = require("./media_object");
const { Venue } = require("./venue");

const _ = require("lodash");
const baseUrl = `${process.env.REF_SERVER_URL}/${process.env.API_VERSION}`;

const baseResourceSerialization = {
  type: null,
  id: null,
  meta: {},
  links: {},
  attributes: {},
  relationships: {},
};

function containsReferences(data) {
  return isReferenceObject(data) || isReferenceArray(data);
}

function isReferenceArray(data) {
  return _.isArray(data) && _.every(data, (item) => isReferenceObject(item));
}

function isReferenceObject(data) {
  return _.has(data, "type") && _.has(data, "id") && _.size(data) === 2;
}

function deserializeResourceFields(resource, json) {
  const { id, type, meta, attributes } = json;

  resource.id = id ?? resource?.id;
  resource.type = type ?? resource?.type;

  resource.dataProvider = meta?.dataProvider ?? resource?.dataProvider;
  resource.lastUpdate = (meta?.lastUpdate && new Date(meta?.lastUpdate)) ?? resource?.lastUpdate; // TODO: review whether we should deserialize by creating an instance of Date();

  resource.abstract = attributes?.abstract ?? resource?.abstract;
  resource.description = attributes?.description ?? resource?.description;
  resource.name = attributes?.name ?? resource?.name;
  resource.shortName = attributes?.shortName ?? resource?.shortName;
  resource.url = attributes?.url ?? resource?.url;

  return resource;
}

function deserializeIndividualResourceFields(individualResource, json) {
  const { relationships } = json;

  individualResource.categories = relationships?.categories?.data ?? individualResource?.categories;
  individualResource.multimediaDescriptions =
    relationships?.multimediaDescriptions?.data ?? individualResource?.multimediaDescriptions;

  return individualResource;
}

function deserializeAgent(json) {
  const agent = new Agent();
  const { attributes } = json;

  deserializeResourceFields(agent, json);
  deserializeIndividualResourceFields(agent, json);

  agent.contactPoints = attributes?.contactPoints ?? agent?.contactPoints;

  return agent;
}

function deserializeCategory(json) {
  const category = new Category();
  const { attributes, relationships } = json;

  deserializeResourceFields(category, json);

  category.namespace = attributes?.namespace ?? category?.namespace;
  category.resourceTypes = attributes?.resourceTypes ?? category?.resourceTypes;

  category.children = relationships?.children?.data ?? category?.children;
  category.multimediaDescriptions = relationships?.multimediaDescriptions?.data ?? category?.multimediaDescriptions;
  category.parents = relationships?.parents?.data ?? category?.parents;

  return category;
}

function deserializeEventSeries(json) {
  const eventSeries = new EventSeries();
  const { attributes, relationships } = json;

  deserializeResourceFields(eventSeries, json);
  deserializeIndividualResourceFields(eventSeries, json);

  eventSeries.frequency = attributes?.frequency ?? eventSeries?.frequency;

  eventSeries.editions = relationships?.editions?.data ?? eventSeries?.editions;

  return eventSeries;
}

function deserializeEvent(json) {
  const event = new Event();
  const { attributes, relationships } = json;

  deserializeResourceFields(event, json);
  deserializeIndividualResourceFields(event, json);

  event.capacity = attributes?.capacity ?? event?.capacity;
  event.endDate = attributes?.endDate ?? event?.endDate;
  event.startDate = attributes?.startDate ?? event?.startDate;
  event.status = attributes?.status ?? event?.status;

  event.contributors = relationships?.contributors?.data ?? event?.contributors;
  event.organizers = relationships?.organizers?.data ?? event?.organizers;
  event.publisher = relationships?.publisher?.data ?? event?.publisher;
  event.series = relationships?.series?.data ?? event?.series;
  event.sponsors = relationships?.sponsors?.data ?? event?.sponsors;
  event.subEvents = relationships?.subEvents?.data ?? event?.subEvents;
  event.venues = relationships?.venues?.data ?? event?.venues;

  return event;
}

function deserializeFeature(json) {
  const feature = new Feature();
  const { attributes, relationships } = json;

  deserializeResourceFields(feature, json);

  feature.namespace = attributes?.namespace ?? feature?.namespace;
  feature.resourceTypes = attributes?.resourceTypes ?? feature?.resourceTypes;

  feature.children = relationships?.children?.data ?? feature?.children;
  feature.multimediaDescriptions = relationships?.multimediaDescriptions?.data ?? feature?.multimediaDescriptions;
  feature.parents = relationships?.parents?.data ?? feature?.parents;

  return feature;
}

function deserializeMediaObject(json) {
  const mediaObject = new MediaObject();
  const { attributes, relationships } = json;

  deserializeResourceFields(mediaObject, json);

  mediaObject.contentType = attributes?.contentType ?? mediaObject?.contentType;
  mediaObject.duration = attributes?.duration ?? mediaObject?.duration;
  mediaObject.height = attributes?.height ?? mediaObject?.height;
  mediaObject.license = attributes?.license ?? mediaObject?.license;
  mediaObject.width = attributes?.width ?? mediaObject?.width;

  mediaObject.categories = relationships?.categories?.data ?? mediaObject?.categories;
  mediaObject.copyrightOwner = relationships?.copyrightOwner?.data ?? mediaObject?.copyrightOwner;

  return mediaObject;
}

function deserializeVenue(json) {
  const venue = new Venue();
  const { attributes } = json;

  deserializeResourceFields(venue, json);
  deserializeIndividualResourceFields(venue, json);

  venue.address = attributes?.address ?? venue?.address;
  venue.howToArrive = attributes?.howToArrive ?? venue?.howToArrive;
  venue.geometries = attributes?.geometries ?? venue?.geometries;

  return venue;
}

function toRelationshipToManyObject(relationshipName, resource, versionUrl) {
  const relationship = resource[relationshipName];

  if (!_.isArray(relationship)) {
    return null;
  }

  return {
    data: relationship?.map((item) => {
      const { id, type } = item;
      return { id, type };
    }),
    link: `${baseUrl}/${resource.type}/${resource.id}/${relationshipName}`,
  };
}

function toRelationshipToOneObject(relationshipName, resource, versionUrl) {
  const relationship = resource[relationshipName];

  if (!_.isObject(relationship)) {
    return null;
  }

  return {
    data: {
      id: relationship.id,
      type: relationship.type,
    },
    link: `${baseUrl}/${resource.type}/${resource.id}/${relationshipName}`,
  };
}

function serializeResource(resource, versionUrl) {
  const json = _.cloneDeep(baseResourceSerialization);

  const { meta, links, attributes } = json;

  json.id = resource.id;
  json.type = resource.type;

  meta.dataProvider = resource.dataProvider;
  meta.lastUpdate = resource.lastUpdate;
  meta.license = resource.license;
  meta.licenseHolder = resource.licenseHolder;

  links.self = `${baseUrl}/${resource.type}/${resource.id}`;

  attributes.abstract = _.cloneDeep(resource.abstract) ?? null;
  attributes.description = _.cloneDeep(resource.description) ?? null;
  attributes.name = _.cloneDeep(resource.name) ?? null;
  attributes.shortName = _.cloneDeep(resource.shortName) ?? null;
  attributes.url = _.cloneDeep(resource.url) ?? null;

  return json;
}

function serializeIndividualResource(individualResource, versionUrl) {
  const json = serializeResource(individualResource, versionUrl);

  const { relationships } = json;

  relationships.categories = toRelationshipToManyObject("categories", individualResource, versionUrl);
  relationships.multimediaDescriptions = toRelationshipToManyObject(
    "multimediaDescriptions",
    individualResource,
    versionUrl
  );

  return json;
}

function serializeAgent(agent, versionUrl) {
  const json = serializeIndividualResource(agent, versionUrl);

  const { attributes } = json;

  attributes.contactPoints = _.cloneDeep(agent.contactPoints) ?? null;

  return json;
}

function serializeCategory(category, versionUrl) {
  const json = serializeResource(category, versionUrl);

  const { attributes, relationships } = json;

  attributes.namespace = category.namespace;
  attributes.resourceTypes = !_.isEmpty(category.resourceTypes) ? category.resourceTypes : null;

  relationships.children = toRelationshipToManyObject("children", category, versionUrl);
  relationships.multimediaDescriptions = toRelationshipToManyObject("multimediaDescriptions", category, versionUrl);
  relationships.parents = toRelationshipToManyObject("parents", category, versionUrl);

  return json;
}

function serializeEventSeries(eventSeries, versionUrl) {
  const json = serializeIndividualResource(eventSeries, versionUrl);

  const { attributes, relationships } = json;

  attributes.frequency = eventSeries.frequency;

  relationships.editions = toRelationshipToManyObject("editions", eventSeries, versionUrl);

  return json;
}

function serializeEvent(events, versionUrl) {
  const json = serializeIndividualResource(events, versionUrl);

  const { attributes, relationships } = json;

  attributes.capacity = events.capacity;
  attributes.endDate = events.endDate;
  attributes.startDate = events.startDate;
  attributes.status = events.status;

  relationships.contributors = toRelationshipToManyObject("contributors", events, versionUrl);
  relationships.organizers = toRelationshipToManyObject("organizers", events, versionUrl);
  relationships.publisher = toRelationshipToOneObject("publisher", events, versionUrl);
  relationships.series = toRelationshipToOneObject("series", events, versionUrl);
  relationships.sponsors = toRelationshipToManyObject("sponsors", events, versionUrl);
  relationships.subEvents = toRelationshipToManyObject("subEvents", events, versionUrl);
  relationships.venues = toRelationshipToManyObject("venues", events, versionUrl);

  return json;
}

function serializeFeature(feature, versionUrl) {
  const json = serializeResource(feature, versionUrl);

  const { attributes, relationships } = json;

  attributes.namespace = feature.namespace;
  attributes.resourceTypes = !_.isEmpty(feature.resourceTypes) ? feature.resourceTypes : null;

  relationships.children = toRelationshipToManyObject("children", feature, versionUrl);
  relationships.multimediaDescriptions = toRelationshipToManyObject("multimediaDescriptions", feature, versionUrl);
  relationships.parents = toRelationshipToManyObject("parents", feature, versionUrl);

  return json;
}

function serializeMediaObject(mediaObject, versionUrl) {
  const json = serializeResource(mediaObject, versionUrl);

  const { meta, attributes, relationships } = json;

  attributes.contentType = mediaObject.contentType;
  attributes.duration = mediaObject.duration;
  attributes.height = mediaObject.height;
  attributes.license = mediaObject.license;
  attributes.width = mediaObject.width;

  relationships.categories = toRelationshipToManyObject("categories", mediaObject, versionUrl);
  relationships.copyrightOwner = toRelationshipToOneObject("copyrightOwner", mediaObject, versionUrl);

  return json;
}

function serializeVenue(venue, versionUrl) {
  const json = serializeIndividualResource(venue, versionUrl);

  const { attributes } = json;

  attributes.address = _.cloneDeep(venue.address) ?? null;
  attributes.howToArrive = _.cloneDeep(venue.howToArrive) ?? null;
  attributes.geometries = _.cloneDeep(venue.geometries) ?? null;

  return json;
}

function serializeAnyResource(resource, versionUrl) {
  switch (resource.type) {
    case "agents":
      return serializeAgent(resource, versionUrl);
    case "categories":
      return serializeCategory(resource, versionUrl);
    case "events":
      return serializeEvent(resource, versionUrl);
    case "eventSeries":
      return serializeEventSeries(resource, versionUrl);
    case "features":
      return serializeFeature(resource, versionUrl);
    case "lifts":
      throw new Error("Unimplemented");
    case "mediaObjects":
      return serializeMediaObject(resource, versionUrl);
    case "mountainAreas":
      throw new Error("Unimplemented");
    case "skiSlopes":
      throw new Error("Unimplemented");
    case "snowparks":
      throw new Error("Unimplemented");
    case "venues":
      return serializeVenue(resource, versionUrl);
  }

  if (!_.isEmpty(resource)) throw new Error("Unexpected input");

  return null;
}

function serializeSingleResource(resource, versionUrl, typeUrl) {
  return {
    meta: {},
    links: {
      self: `${baseUrl}/${typeUrl}/${typeUrl}/${resource.id}`,
    },
    data: serializeAnyResource(resource, versionUrl),
    include: [],
  };
}

function serializeResourceCollection(resources, versionUrl, typeUrl) {
  return {
    meta: {
      page: 999,
      count: 999,
    },
    links: {
      self: `${baseUrl}/${typeUrl}`,
    },
    data: resources?.map((resource) => serializeAnyResource(resource, versionUrl)),
    include: [],
  };
}

module.exports = {
  containsReferences,
  isReferenceArray,
  isReferenceObject,
  deserializeAgent,
  deserializeCategory,
  deserializeEventSeries,
  deserializeEvent,
  deserializeFeature,
  deserializeMediaObject,
  deserializeVenue,
  serializeSingleResource,
  serializeResourceCollection,
};
