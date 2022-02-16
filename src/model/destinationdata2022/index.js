const { Agent } = require("./agent");
const { Category } = require("./category");
const { Event } = require("./event");
const { EventSeries } = require("./event_series");
const { Feature } = require("./feature");
const { MediaObject } = require("./media_object");
const { Venue } = require("./venue");
const { Lift } = require("./lift");
const { MountainArea } = require("./mountain_area");
const { SkiSlope } = require("./ski_slope");
const { Snowpark } = require("./snowpark");

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

function deserializeLift(json) {
  const lift = new Lift();
  const { attributes, relationships } = json;

  deserializeResourceFields(lift, json);
  deserializeIndividualResourceFields(lift, json);

  lift.address = attributes?.address ?? lift?.address;
  lift.capacity = attributes?.capacity ?? lift?.capacity;
  lift.geometries = attributes?.geometries ?? lift?.geometries;
  lift.howToArrive = attributes?.howToArrive ?? lift?.howToArrive;
  lift.length = attributes?.length ?? lift?.length;
  lift.maxAltitude = attributes?.maxAltitude ?? lift?.maxAltitude;
  lift.minAltitude = attributes?.minAltitude ?? lift?.minAltitude;
  lift.openingHours = attributes?.openingHours ?? lift?.openingHours;
  lift.personsPerChair = attributes?.personsPerChair ?? lift?.personsPerChair;

  lift.connections = relationships?.connections?.data ?? lift?.connections;

  return lift;
}

function deserializeMountainArea(json) {
  const mountainArea = new MountainArea();
  const { attributes, relationships } = json;

  deserializeResourceFields(mountainArea, json);
  deserializeIndividualResourceFields(mountainArea, json);

  mountainArea.area = attributes?.area ?? mountainArea?.area;
  mountainArea.geometries = attributes?.geometries ?? mountainArea?.geometries;
  mountainArea.howToArrive = attributes?.howToArrive ?? mountainArea?.howToArrive;
  mountainArea.maxAltitude = attributes?.maxAltitude ?? mountainArea?.maxAltitude;
  mountainArea.minAltitude = attributes?.minAltitude ?? mountainArea?.minAltitude;
  mountainArea.openingHours = attributes?.openingHours ?? mountainArea?.openingHours;
  mountainArea.snowCondition = attributes?.snowCondition ?? mountainArea?.snowCondition;
  mountainArea.totalParkArea = attributes?.totalParkArea ?? mountainArea?.totalParkArea;
  mountainArea.totalTrailLength = attributes?.totalTrailLength ?? mountainArea?.totalTrailLength;

  mountainArea.areaOwner = relationships?.areaOwner?.data ?? mountainArea?.areaOwner;
  mountainArea.connections = relationships?.connections?.data ?? mountainArea?.connections;
  mountainArea.lifts = relationships?.lifts?.data ?? mountainArea?.lifts;
  mountainArea.snowparks = relationships?.snowparks?.data ?? mountainArea?.snowparks;
  mountainArea.subAreas = relationships?.subAreas?.data ?? mountainArea?.subAreas;
  mountainArea.skiSlopes = relationships?.skiSlopes?.data ?? mountainArea?.skiSlopes;

  return mountainArea;
}

function deserializeSkiSlope(json) {
  const skiSlope = new SkiSlope();
  const { attributes, relationships } = json;

  deserializeResourceFields(skiSlope, json);
  deserializeIndividualResourceFields(skiSlope, json);

  skiSlope.address = attributes?.address ?? skiSlope?.address;
  skiSlope.difficulty = attributes?.difficulty ?? skiSlope?.difficulty;
  skiSlope.geometries = attributes?.geometries ?? skiSlope?.geometries;
  skiSlope.howToArrive = attributes?.howToArrive ?? skiSlope?.howToArrive;
  skiSlope.length = attributes?.length ?? skiSlope?.length;
  skiSlope.maxAltitude = attributes?.maxAltitude ?? skiSlope?.maxAltitude;
  skiSlope.minAltitude = attributes?.minAltitude ?? skiSlope?.minAltitude;
  skiSlope.openingHours = attributes?.openingHours ?? skiSlope?.openingHours;
  skiSlope.snowCondition = attributes?.snowCondition ?? skiSlope?.snowCondition;

  skiSlope.connections = relationships?.connections?.data ?? skiSlope?.connections;

  return skiSlope;
}

function deserializeSnowpark(json) {
  const snowpark = new Snowpark();
  const { attributes, relationships } = json;

  deserializeResourceFields(snowpark, json);
  deserializeIndividualResourceFields(snowpark, json);

  snowpark.address = attributes?.address ?? snowpark?.address;
  snowpark.difficulty = attributes?.difficulty ?? snowpark?.difficulty;
  snowpark.geometries = attributes?.geometries ?? snowpark?.geometries;
  snowpark.howToArrive = attributes?.howToArrive ?? snowpark?.howToArrive;
  snowpark.length = attributes?.length ?? snowpark?.length;
  snowpark.maxAltitude = attributes?.maxAltitude ?? snowpark?.maxAltitude;
  snowpark.minAltitude = attributes?.minAltitude ?? snowpark?.minAltitude;
  snowpark.openingHours = attributes?.openingHours ?? snowpark?.openingHours;
  snowpark.snowCondition = attributes?.snowCondition ?? snowpark?.snowCondition;

  snowpark.connections = relationships?.connections?.data ?? snowpark?.connections;
  snowpark.features = relationships?.features?.data ?? snowpark?.features;

  return snowpark;
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

function serializeLift(lift, versionUrl) {
  const json = serializeIndividualResource(lift, versionUrl);

  const { attributes, relationships } = json;

  attributes.address = _.cloneDeep(lift.address) ?? null;
  attributes.capacity = _.cloneDeep(lift.capacity) ?? null;
  attributes.geometries = _.cloneDeep(lift.geometries) ?? null;
  attributes.howToArrive = _.cloneDeep(lift.howToArrive) ?? null;
  attributes.length = _.cloneDeep(lift.length) ?? null;
  attributes.maxAltitude = _.cloneDeep(lift.maxAltitude) ?? null;
  attributes.minAltitude = _.cloneDeep(lift.minAltitude) ?? null;
  attributes.openingHours = _.cloneDeep(lift.openingHours) ?? null;
  attributes.personsPerChair = _.cloneDeep(lift.personsPerChair) ?? null;

  relationships.connections = toRelationshipToManyObject("connections", lift, versionUrl);

  return json;
}

function serializeSkiSlope(skiSlope, versionUrl) {
  const json = serializeIndividualResource(skiSlope, versionUrl);

  const { attributes, relationships } = json;

  attributes.address = _.cloneDeep(skiSlope.address) ?? null;
  attributes.difficulty = _.cloneDeep(skiSlope.difficulty) ?? null;
  attributes.geometries = _.cloneDeep(skiSlope.geometries) ?? null;
  attributes.howToArrive = _.cloneDeep(skiSlope.howToArrive) ?? null;
  attributes.length = _.cloneDeep(skiSlope.length) ?? null;
  attributes.maxAltitude = _.cloneDeep(skiSlope.maxAltitude) ?? null;
  attributes.minAltitude = _.cloneDeep(skiSlope.minAltitude) ?? null;
  attributes.openingHours = _.cloneDeep(skiSlope.openingHours) ?? null;
  attributes.snowCondition = _.cloneDeep(skiSlope.snowCondition) ?? null;

  relationships.connections = toRelationshipToManyObject("connections", skiSlope, versionUrl);

  return json;
}

function serializeSnowpark(snowpark, versionUrl) {
  const json = serializeIndividualResource(snowpark, versionUrl);

  const { attributes, relationships } = json;

  attributes.address = _.cloneDeep(snowpark.address) ?? null;
  attributes.difficulty = _.cloneDeep(snowpark.difficulty) ?? null;
  attributes.geometries = _.cloneDeep(snowpark.geometries) ?? null;
  attributes.howToArrive = _.cloneDeep(snowpark.howToArrive) ?? null;
  attributes.length = _.cloneDeep(snowpark.length) ?? null;
  attributes.maxAltitude = _.cloneDeep(snowpark.maxAltitude) ?? null;
  attributes.minAltitude = _.cloneDeep(snowpark.minAltitude) ?? null;
  attributes.openingHours = _.cloneDeep(snowpark.openingHours) ?? null;
  attributes.snowCondition = _.cloneDeep(snowpark.snowCondition) ?? null;

  relationships.connections = toRelationshipToManyObject("connections", snowpark, versionUrl);
  relationships.features = toRelationshipToManyObject("features", snowpark, versionUrl);

  return json;
}

function serializeMountainArea(mountainArea, versionUrl) {
  const json = serializeIndividualResource(mountainArea, versionUrl);

  const { attributes, relationships } = json;

  attributes.area = _.cloneDeep(mountainArea.area) ?? null;
  attributes.geometries = _.cloneDeep(mountainArea.geometries) ?? null;
  attributes.howToArrive = _.cloneDeep(mountainArea.howToArrive) ?? null;
  attributes.maxAltitude = _.cloneDeep(mountainArea.maxAltitude) ?? null;
  attributes.minAltitude = _.cloneDeep(mountainArea.minAltitude) ?? null;
  attributes.openingHours = _.cloneDeep(mountainArea.openingHours) ?? null;
  attributes.snowCondition = _.cloneDeep(mountainArea.snowCondition) ?? null;
  attributes.totalParkArea = _.cloneDeep(mountainArea.totalParkArea) ?? null;
  attributes.totalTrailLength = _.cloneDeep(mountainArea.totalTrailLength) ?? null;

  relationships.areaOwner = toRelationshipToOneObject("areaOwner", mountainArea, versionUrl);
  relationships.connections = toRelationshipToManyObject("connections", mountainArea, versionUrl);
  relationships.lifts = toRelationshipToManyObject("lifts", mountainArea, versionUrl);
  relationships.snowparks = toRelationshipToManyObject("snowparks", mountainArea, versionUrl);
  relationships.subAreas = toRelationshipToManyObject("subAreas", mountainArea, versionUrl);
  relationships.skiSlopes = toRelationshipToManyObject("skiSlopes", mountainArea, versionUrl);

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
      return serializeLift(resource, versionUrl);
    case "mediaObjects":
      return serializeMediaObject(resource, versionUrl);
    case "mountainAreas":
      return serializeMountainArea(resource, versionUrl);
    case "skiSlopes":
      return serializeSkiSlope(resource, versionUrl);
    case "snowparks":
      return serializeSnowpark(resource, versionUrl);
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
  deserializeLift,
  deserializeMountainArea,
  deserializeSkiSlope,
  deserializeSnowpark,
  serializeSingleResource,
  serializeResourceCollection,
};
