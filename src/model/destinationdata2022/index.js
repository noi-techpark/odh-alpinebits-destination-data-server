const { Agent } = require("./agent");
const { Category } = require("./category");
const { Event } = require("./event");
const { EventSeries } = require("./event_series");
const { Feature } = require("./feature");
const { MediaObject } = require("./media_object");
const { Venue } = require("./venue");

const _ = require("lodash");

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

  event.organizers = relationships?.organizers?.data ?? event?.organizers;
  event.publisher = relationships?.publisher?.data ?? event?.publisher;
  event.series = relationships?.series?.data ?? event?.series;
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
};
