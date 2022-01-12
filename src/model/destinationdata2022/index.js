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

  resource.id = id;
  resource.type = type;

  resource.dataProvider = meta?.dataProvider;
  resource.lastUpdate = meta?.lastUpdate; // TODO: review whether we should deserialize by creating an instance of Date();

  resource.abstract = attributes?.abstract;
  resource.description = attributes?.description;
  resource.name = attributes?.name;
  resource.shortName = attributes?.shortName;
  resource.url = attributes?.url;

  return resource;
}

function deserializeIndividualResourceFields(individualResource, json) {
  const { relationships } = json;

  individualResource.categories = relationships?.categories?.data;
  individualResource.multimediaDescriptions = relationships?.multimediaDescriptions?.data;

  return individualResource;
}

function deserializeAgent(json) {
  const agent = new Agent();
  const { attributes } = json;

  deserializeResourceFields(agent, json);
  deserializeIndividualResourceFields(agent, json);

  agent.contactPoints = attributes?.contactPoints;

  return agent;
}

function deserializeCategory(json) {
  const category = new Category();
  const { attributes, relationships } = json;

  deserializeResourceFields(category, json);

  category.namespace = attributes?.namespace;
  category.resourceTypes = attributes?.resourceTypes;

  category.children = relationships?.children;
  category.multimediaDescriptions = relationships?.multimediaDescriptions;
  category.parents = relationships?.parents;

  return category;
}

function deserializeEventSeries(json) {
  const eventSeries = new EventSeries();
  const { attributes, relationships } = json;

  deserializeResourceFields(eventSeries, json);
  deserializeIndividualResourceFields(eventSeries, json);

  eventSeries.frequency = attributes?.frequency;

  eventSeries.editions = relationships?.editions;

  return eventSeries;
}

function deserializeEvent(json) {
  const event = new Event();
  const { attributes, relationships } = json;

  deserializeResourceFields(event, json);
  deserializeIndividualResourceFields(event, json);

  event.capacity = attributes?.capacity;
  event.endDate = attributes?.endDate;
  event.startDate = attributes?.startDate;
  event.status = attributes?.status;

  event.organizers = relationships?.organizers;
  event.publisher = relationships?.publisher;
  event.series = relationships?.series;
  event.subEvents = relationships?.subEvents;
  event.venues = relationships?.venues;

  return event;
}

function deserializeFeature(json) {
  const feature = new Feature();
  const { attributes, relationships } = json;

  deserializeResourceFields(feature, json);

  feature.namespace = attributes?.namespace;
  feature.resourceTypes = attributes?.resourceTypes;

  feature.children = relationships?.children;
  feature.multimediaDescriptions = relationships?.multimediaDescriptions;
  feature.parents = relationships?.parents;

  return feature;
}

function deserializeMediaObject(json) {
  const mediaObject = new MediaObject();
  const { attributes, relationships } = json;

  deserializeResourceFields(mediaObject, json);

  mediaObject.contentType = attributes?.contentType;
  mediaObject.duration = attributes?.duration;
  mediaObject.height = attributes?.height;
  mediaObject.license = attributes?.license;
  mediaObject.width = attributes?.width;

  mediaObject.categories = relationships?.categories;
  mediaObject.copyrightOwner = relationships?.copyrightOwner;

  return mediaObject;
}

function deserializeVenue(json) {
  const venue = new Venue();
  const { attributes } = json;

  deserializeResourceFields(venue, json);
  deserializeIndividualResourceFields(venue, json);

  venue.address = attributes?.address;
  venue.howToArrive = attributes?.howToArrive;
  venue.geometries = attributes?.geometries;

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
