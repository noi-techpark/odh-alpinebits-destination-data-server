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
const { DestinationDataError } = require("../../errors");
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
  resource.lastUpdate =
    (meta?.lastUpdate && new Date(meta?.lastUpdate)) ?? resource?.lastUpdate; // TODO: review whether we should deserialize by creating an instance of Date();

  resource.abstract = attributes?.abstract ?? resource?.abstract;
  resource.description = attributes?.description ?? resource?.description;
  resource.name = attributes?.name ?? resource?.name;
  resource.shortName = attributes?.shortName ?? resource?.shortName;
  resource.url = attributes?.url ?? resource?.url;

  return resource;
}

function deserializeIndividualResourceFields(individualResource, json) {
  const { relationships } = json;

  individualResource.categories =
    relationships?.categories?.data ?? individualResource?.categories;
  individualResource.multimediaDescriptions =
    relationships?.multimediaDescriptions?.data ??
    individualResource?.multimediaDescriptions;

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
  category.multimediaDescriptions =
    relationships?.multimediaDescriptions?.data ??
    category?.multimediaDescriptions;
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

  event.endDate = attributes?.endDate ?? event?.endDate;
  event.inPersonCapacity =
    attributes?.inPersonCapacity ?? event?.inPersonCapacity;
  event.onlineCapacity = attributes?.onlineCapacity ?? event?.onlineCapacity;
  event.participationUrl =
    attributes?.participationUrl ?? event?.participationUrl;
  event.recorded = attributes?.recorded ?? event?.recorded;
  event.registrationUrl = attributes?.registrationUrl ?? event?.registrationUrl;
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
  feature.multimediaDescriptions =
    relationships?.multimediaDescriptions?.data ??
    feature?.multimediaDescriptions;
  feature.parents = relationships?.parents?.data ?? feature?.parents;

  return feature;
}

function deserializeMediaObject(json) {
  const mediaObject = new MediaObject();
  const { attributes, relationships } = json;

  deserializeResourceFields(mediaObject, json);

  mediaObject.author = attributes?.author ?? mediaObject?.author;
  mediaObject.contentType = attributes?.contentType ?? mediaObject?.contentType;
  mediaObject.duration = attributes?.duration ?? mediaObject?.duration;
  mediaObject.height = attributes?.height ?? mediaObject?.height;
  mediaObject.license = attributes?.license ?? mediaObject?.license;
  mediaObject.width = attributes?.width ?? mediaObject?.width;

  mediaObject.categories =
    relationships?.categories?.data ?? mediaObject?.categories;
  mediaObject.licenseHolder =
    relationships?.licenseHolder?.data ?? mediaObject?.licenseHolder;

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
  mountainArea.howToArrive =
    attributes?.howToArrive ?? mountainArea?.howToArrive;
  mountainArea.maxAltitude =
    attributes?.maxAltitude ?? mountainArea?.maxAltitude;
  mountainArea.minAltitude =
    attributes?.minAltitude ?? mountainArea?.minAltitude;
  mountainArea.openingHours =
    attributes?.openingHours ?? mountainArea?.openingHours;
  mountainArea.snowCondition =
    attributes?.snowCondition ?? mountainArea?.snowCondition;
  mountainArea.totalParkArea =
    attributes?.totalParkArea ?? mountainArea?.totalParkArea;
  mountainArea.totalTrailLength =
    attributes?.totalTrailLength ?? mountainArea?.totalTrailLength;

  mountainArea.areaOwner =
    relationships?.areaOwner?.data ?? mountainArea?.areaOwner;
  mountainArea.connections =
    relationships?.connections?.data ?? mountainArea?.connections;
  mountainArea.lifts = relationships?.lifts?.data ?? mountainArea?.lifts;
  mountainArea.snowparks =
    relationships?.snowparks?.data ?? mountainArea?.snowparks;
  mountainArea.subAreas =
    relationships?.subAreas?.data ?? mountainArea?.subAreas;
  mountainArea.skiSlopes =
    relationships?.skiSlopes?.data ?? mountainArea?.skiSlopes;

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

  skiSlope.connections =
    relationships?.connections?.data ?? skiSlope?.connections;

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

  snowpark.connections =
    relationships?.connections?.data ?? snowpark?.connections;
  snowpark.features = relationships?.features?.data ?? snowpark?.features;

  return snowpark;
}

function toRelationshipToManyObject(relationshipName, resource) {
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

function toRelationshipToOneObject(relationshipName, resource) {
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

function serializeResource(resource) {
  const json = _.cloneDeep(baseResourceSerialization);

  const { meta, links, attributes } = json;

  json.id = resource.id;
  json.type = resource.type;

  meta.dataProvider = resource.dataProvider;
  meta.lastUpdate = resource.lastUpdate;
  // meta.license = resource.license;
  // meta.licenseHolder = resource.licenseHolder;

  links.self = `${baseUrl}/${resource.type}/${resource.id}`;

  attributes.abstract = _.cloneDeep(resource.abstract) ?? null;
  attributes.description = _.cloneDeep(resource.description) ?? null;
  attributes.name = _.cloneDeep(resource.name) ?? null;
  attributes.shortName = _.cloneDeep(resource.shortName) ?? null;
  attributes.url = _.cloneDeep(resource.url) ?? null;

  return json;
}

function serializeIndividualResource(individualResource) {
  const json = serializeResource(individualResource);

  const { relationships } = json;

  relationships.categories = toRelationshipToManyObject(
    "categories",
    individualResource
  );
  relationships.multimediaDescriptions = toRelationshipToManyObject(
    "multimediaDescriptions",
    individualResource
  );

  return json;
}

function serializeAgent(agent) {
  const json = serializeIndividualResource(agent);

  const { attributes } = json;

  attributes.contactPoints = _.cloneDeep(agent.contactPoints) ?? null;

  return json;
}

function serializeCategory(category) {
  const json = serializeResource(category);

  const { attributes, relationships } = json;

  attributes.namespace = category.namespace;
  attributes.resourceTypes = !_.isEmpty(category.resourceTypes)
    ? category.resourceTypes
    : null;

  relationships.children = toRelationshipToManyObject("children", category);
  relationships.multimediaDescriptions = toRelationshipToManyObject(
    "multimediaDescriptions",
    category
  );
  relationships.parents = toRelationshipToManyObject("parents", category);

  return json;
}

function serializeEventSeries(eventSeries) {
  const json = serializeIndividualResource(eventSeries);

  const { attributes, relationships } = json;

  attributes.frequency = eventSeries.frequency;

  relationships.editions = toRelationshipToManyObject("editions", eventSeries);

  return json;
}

function serializeEvent(event) {
  const json = serializeIndividualResource(event);

  const { attributes, relationships } = json;

  attributes.endDate = event.endDate;
  attributes.inPersonCapacity = event.inPersonCapacity;
  attributes.onlineCapacity = event.onlineCapacity;
  attributes.participationUrl = event.participationUrl;
  attributes.recorded = event.recorded;
  attributes.registrationUrl = event.registrationUrl;
  attributes.startDate = event.startDate;
  attributes.status = event.status;

  relationships.contributors = toRelationshipToManyObject(
    "contributors",
    event
  );
  relationships.organizers = toRelationshipToManyObject("organizers", event);
  relationships.publisher = toRelationshipToOneObject("publisher", event);
  relationships.series = toRelationshipToOneObject("series", event);
  relationships.sponsors = toRelationshipToManyObject("sponsors", event);
  relationships.subEvents = toRelationshipToManyObject("subEvents", event);
  relationships.venues = toRelationshipToManyObject("venues", event);

  return json;
}

function serializeFeature(feature) {
  const json = serializeResource(feature);

  const { attributes, relationships } = json;

  attributes.namespace = feature.namespace;
  attributes.resourceTypes = !_.isEmpty(feature.resourceTypes)
    ? feature.resourceTypes
    : null;

  relationships.children = toRelationshipToManyObject("children", feature);
  relationships.multimediaDescriptions = toRelationshipToManyObject(
    "multimediaDescriptions",
    feature
  );
  relationships.parents = toRelationshipToManyObject("parents", feature);

  return json;
}

function serializeMediaObject(mediaObject) {
  const json = serializeResource(mediaObject);

  const { attributes, relationships } = json;

  attributes.author = mediaObject.author;
  attributes.contentType = mediaObject.contentType;
  attributes.duration = mediaObject.duration;
  attributes.height = mediaObject.height;
  attributes.license = mediaObject.license;
  attributes.width = mediaObject.width;

  relationships.categories = toRelationshipToManyObject(
    "categories",
    mediaObject
  );
  relationships.licenseHolder = toRelationshipToOneObject(
    "licenseHolder",
    mediaObject
  );

  return json;
}

function serializeVenue(venue) {
  const json = serializeIndividualResource(venue);

  const { attributes } = json;

  attributes.address = _.cloneDeep(venue.address) ?? null;
  attributes.howToArrive = _.cloneDeep(venue.howToArrive) ?? null;
  attributes.geometries = _.cloneDeep(venue.geometries) ?? null;

  return json;
}

function serializeLift(lift) {
  const json = serializeIndividualResource(lift);

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

  relationships.connections = toRelationshipToManyObject("connections", lift);

  return json;
}

function serializeSkiSlope(skiSlope) {
  const json = serializeIndividualResource(skiSlope);

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

  relationships.connections = toRelationshipToManyObject(
    "connections",
    skiSlope
  );

  return json;
}

function serializeSnowpark(snowpark) {
  const json = serializeIndividualResource(snowpark);

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

  relationships.connections = toRelationshipToManyObject(
    "connections",
    snowpark
  );
  relationships.features = toRelationshipToManyObject("features", snowpark);

  return json;
}

function serializeMountainArea(mountainArea) {
  const json = serializeIndividualResource(mountainArea);

  const { attributes, relationships } = json;

  attributes.area = _.cloneDeep(mountainArea.area) ?? null;
  attributes.geometries = _.cloneDeep(mountainArea.geometries) ?? null;
  attributes.howToArrive = _.cloneDeep(mountainArea.howToArrive) ?? null;
  attributes.maxAltitude = _.cloneDeep(mountainArea.maxAltitude) ?? null;
  attributes.minAltitude = _.cloneDeep(mountainArea.minAltitude) ?? null;
  attributes.openingHours = _.cloneDeep(mountainArea.openingHours) ?? null;
  attributes.snowCondition = _.cloneDeep(mountainArea.snowCondition) ?? null;
  attributes.totalParkArea = _.cloneDeep(mountainArea.totalParkArea) ?? null;
  attributes.totalTrailLength =
    _.cloneDeep(mountainArea.totalTrailLength) ?? null;

  relationships.areaOwner = toRelationshipToOneObject(
    "areaOwner",
    mountainArea
  );
  relationships.connections = toRelationshipToManyObject(
    "connections",
    mountainArea
  );
  relationships.lifts = toRelationshipToManyObject("lifts", mountainArea);
  relationships.snowparks = toRelationshipToManyObject(
    "snowparks",
    mountainArea
  );
  relationships.subAreas = toRelationshipToManyObject("subAreas", mountainArea);
  relationships.skiSlopes = toRelationshipToManyObject(
    "skiSlopes",
    mountainArea
  );

  return json;
}

function serializeAnyResource(resource, request) {
  switch (resource?.type) {
    case "agents":
      resource = serializeAgent(resource);
      break;
    case "categories":
      resource = serializeCategory(resource);
      break;
    case "events":
      resource = serializeEvent(resource);
      break;
    case "eventSeries":
      resource = serializeEventSeries(resource);
      break;
    case "features":
      resource = serializeFeature(resource);
      break;
    case "lifts":
      resource = serializeLift(resource);
      break;
    case "mediaObjects":
      resource = serializeMediaObject(resource);
      break;
    case "mountainAreas":
      resource = serializeMountainArea(resource);
      break;
    case "skiSlopes":
      resource = serializeSkiSlope(resource);
      break;
    case "snowparks":
      resource = serializeSnowpark(resource);
      break;
    case "venues":
      resource = serializeVenue(resource);
      break;
  }

  removeNonSelectedFields(resource, request);

  return resource;
}

function removeNonSelectedFields(resource, request) {
  const type = resource?.type;
  const selectedFields = request?.query?.fields?.[type] ?? "";

  if (_.isEmpty(selectedFields)) return;

  for (const field of Object.keys(resource.attributes)) {
    if (!selectedFields.includes(field)) delete resource.attributes[field];
  }

  for (const field of Object.keys(resource.relationships)) {
    if (!selectedFields.includes(field)) delete resource.relationships[field];
  }
}

function serializeSingleResource(resource, request, include) {
  const links = {
    swagger: process.env.SWAGGER_URL,
    self: request.selfUrl,
  };

  return {
    jsonapi: { version: "1.0" },
    links,
    data: !_.isEmpty(resource) ? serializeAnyResource(resource, request) : null,
    include: request?.query?.include
      ? include?.map((resource) => serializeAnyResource(resource, request)) ??
        []
      : undefined,
  };
}

function serializeResourceCollection(resources, request, include) {
  const size = parseInt(request?.query?.page?.size) || 10;
  const number = parseInt(request?.query?.page?.number) || 1;
  const count = parseInt(resources?.[0]?.total) || 0;

  const current = number;
  const first = 1;
  const last = Math.ceil(count / size);
  const prev = number <= 1 ? 1 : number > last ? last : number - 1;
  const next = number < last ? number + 1 : last;

  const meta = {
    pages: last,
    count,
  };

  const { selfUrl } = request;
  const links = { swagger: process.env.SWAGGER_URL };
  const regexPageQuery = /page\[number\]=[0-9]+/;
  const pageQuery = "page[number]=";

  if (regexPageQuery.test(selfUrl)) {
    links.first = selfUrl.replace(regexPageQuery, pageQuery + first);
    links.last = selfUrl.replace(regexPageQuery, pageQuery + last);
    links.next = selfUrl.replace(regexPageQuery, pageQuery + next);
    links.prev = selfUrl.replace(regexPageQuery, pageQuery + prev);
    links.self = selfUrl.replace(regexPageQuery, pageQuery + current);
  } else {
    const regexQueries = /page|include|fields|filter|sort|search|random/;
    const separator = regexQueries.test(selfUrl) ? "&" : "?";

    links.self = selfUrl + separator + pageQuery + current;
    links.first = selfUrl + separator + pageQuery + first;
    links.next = selfUrl + separator + pageQuery + next;
    links.prev = selfUrl + separator + pageQuery + prev;
    links.last = selfUrl + separator + pageQuery + last;
  }

  if (number > 1 && !count) {
    DestinationDataError.throwPageNotFound(meta, links);
  }

  return {
    jsonapi: { version: "1.0" },
    meta,
    links,
    data: resources?.map((resource) => serializeAnyResource(resource, request)),
    include: request?.query?.include
      ? include?.map((resource) => serializeAnyResource(resource, request)) ??
        []
      : undefined,
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
