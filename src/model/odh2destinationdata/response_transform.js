const { Collection: OdhCollection } = require("../odh/collection");
const { Item: OdhItem } = require("../odh/item");
const { Event: OdhEvent } = require("../odh/event");
const {
  CollectionResponse: DestinationDataCollection,
  ObjectResponse: DestinationDataObject,
} = require("../destinationdata/collection");
const { transformToEvent } = require("./event_transform");
const { transformToLift, transformToSkiSlope, transformToSnowpark } = require("./activity_transform");
const categoriesData = require("./../../../data/categories.data");
const featuresData = require("./../../../data/features.data");

function transformCollectionMeta(odhCollection) {
  const { TotalResults, TotalPages } = odhCollection;
  return { count: TotalResults, pages: TotalPages };
}

function transformCollectionLinks(odhCollection, request) {
  const { TotalPages, CurrentPage } = odhCollection;
  const first = 1;
  const current = CurrentPage;
  const next = current < TotalPages ? current + 1 : TotalPages;
  const prev = current > 1 ? current - 1 : 1;
  const last = TotalPages ? TotalPages : 1;

  const { selfUrl } = request;
  const links = {};
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

  return links;
}

function transformCollection(odhItems, request, transformResourceFn) {
  const odhCollection = new OdhCollection(odhItems);
  const collection = new DestinationDataCollection();

  const { include, fields } = request.query;
  collection._include = include;
  collection._fields = fields;

  collection.meta = transformCollectionMeta(odhCollection);
  collection.links = transformCollectionLinks(odhCollection, request);

  odhCollection.getItems(OdhEvent).forEach((item) => collection.data.push(transformResourceFn(item, request)));

  return collection;
}

function transformObject(odhItem, request, transformResourceFn) {
  const object = new DestinationDataObject();
  const resource = transformResourceFn(odhItem, request);

  const { include, fields } = request.query;
  object._include = include;
  object._fields = fields;

  object.data = resource;
  object.links = { self: request.selfUrl };

  return object;
}

function transformRelationshipToMany(odhItem, request, transformResourceFn, relationshipName) {
  const collection = new DestinationDataCollection();
  const context = transformResourceFn(odhItem, request);
  let targets = context.relationships[relationshipName];
  targets = targets ? targets : [];

  const { include, fields } = request.query;
  collection._include = include;
  collection._fields = fields;

  collection.links = { self: request.selfUrl };
  collection.data = targets;

  return collection;
}

function transformRelationshipToOne(odhItem, request, transformResourceFn, relationshipName) {
  const object = new DestinationDataObject();
  const context = transformResourceFn(odhItem, request);
  const target = context.relationships[relationshipName];

  const { include, fields } = request.query;
  object._include = include;
  object._fields = fields;

  object.links = { self: request.selfUrl };
  object.data = target;

  return object;
}

function transformCategoryCollectionMeta(request) {
  const count = categoriesData.categories.length;
  const { size } = request.query.page;
  return { count, pages: Math.ceil(count / size) };
}

function transformCategoryCollectionLinks(meta, request) {
  const { count, pages } = meta;
  const { number, size } = request.query.page;

  const first = 1;
  const current = number;
  const next = current < pages ? current + 1 : pages;
  const prev = current > 1 ? current - 1 : 1;
  const last = pages ? pages : 1;

  const { selfUrl } = request;
  const links = {};
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

  return links;
}

function transformToCategoryCollection(categories, request) {
  const collection = new DestinationDataCollection();

  const { include, fields } = request.query;
  collection._include = include;
  collection._fields = fields;

  collection.meta = transformCategoryCollectionMeta(request);
  collection.links = transformCategoryCollectionLinks(collection.meta, request);

  collection.data = Array.isArray(categories) ? categories : [];

  return collection;
}

function transformToCategoryObject(category, request) {
  const object = new DestinationDataObject();

  const { include, fields } = request.query;
  object._include = include;
  object._fields = fields;

  object.data = category;
  object.links = { self: request.selfUrl };

  return object;
}

function transformToCategoryRelationshipToMany(contextCategory, request, relationshipName) {
  const collection = new DestinationDataCollection();
  const context = contextCategory;
  let targets = context.relationships[relationshipName];
  targets = targets ? targets : [];

  const { include, fields } = request.query;
  collection._include = include;
  collection._fields = fields;

  collection.links = { self: request.selfUrl };
  collection.data = targets;

  return collection;
}

function transformToFeatureCollection(features, request) {
  const collection = new DestinationDataCollection();

  const { include, fields } = request.query;
  collection._include = include;
  collection._fields = fields;

  collection.meta = { count: 0, pages: 1 };
  collection.links = transformCategoryCollectionLinks(collection.meta, request);

  collection.data = [];

  return collection;
}

function transformToFeatureObject(feature, request) {
  const object = new DestinationDataObject();

  const { include, fields } = request.query;
  object._include = include;
  object._fields = fields;

  object.data = null;
  object.links = { self: request.selfUrl };

  return object;
}

function transformToFeatureRelationshipToMany(contextFeature, request, relationshipName) {
  const collection = new DestinationDataCollection();
  const context = contextFeature;
  let targets = context.relationships[relationshipName];
  targets = targets ? targets : [];

  const { include, fields } = request.query;
  collection._include = include;
  collection._fields = fields;

  collection.links = { self: request.selfUrl };
  collection.data = targets;

  return collection;
}

module.exports = {
  transformToEventCollection: (odhItems, request) => transformCollection(odhItems, request, transformToEvent),
  transformToEventObject: (odhItem, request) => transformObject(odhItem, request, transformToEvent),
  transformToEventCategories: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToEvent, "categories"),
  transformToEventContributors: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToEvent, "contributors"),
  transformToEventEventSeries: (odhItem, request) =>
    transformRelationshipToOne(odhItem, request, transformToEvent, "series"),
  transformToEventMultimediaDescriptions: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToEvent, "multimediaDescriptions"),
  transformToEventOrganizers: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToEvent, "organizers"),
  transformToEventPublisher: (odhItem, request) =>
    transformRelationshipToOne(odhItem, request, transformToEvent, "publisher"),
  transformToEventSponsors: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToEvent, "sponsors"),
  transformToEventSubEvents: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToEvent, "subEvents"),
  transformToEventVenues: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToEvent, "venues"),

  transformToLiftCollection: (odhItems, request) => transformCollection(odhItems, request, transformToLift),
  transformToLiftObject: (odhItem, request) => transformObject(odhItem, request, transformToLift),
  transformToLiftCategories: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToLift, "categories"),
  transformToLiftConnections: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToLift, "connections"),
  transformToLiftMultimediaDescriptions: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToLift, "multimediaDescriptions"),

  transformToSkiSlopeCollection: (odhItems, request) => transformCollection(odhItems, request, transformToSkiSlope),
  transformToSkiSlopeObject: (odhItem, request) => transformObject(odhItem, request, transformToSkiSlope),
  transformToSkiSlopeCategories: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToSkiSlope, "categories"),
  transformToSkiSlopeConnections: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToSkiSlope, "connections"),
  transformToSkiSlopeMultimediaDescriptions: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToSkiSlope, "multimediaDescriptions"),

  transformToSnowparkCollection: (odhItems, request) => transformCollection(odhItems, request, transformToSnowpark),
  transformToSnowparkObject: (odhItem, request) => transformObject(odhItem, request, transformToSnowpark),
  transformToSnowparkCategories: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToSnowpark, "categories"),
  transformToSnowparkConnections: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToSnowpark, "connections"),
  transformToSnowparkFeatures: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToSnowpark, "features"),
  transformToSnowparkMultimediaDescriptions: (odhItem, request) =>
    transformRelationshipToMany(odhItem, request, transformToSnowpark, "multimediaDescriptions"),

  transformToCategoryCollection,
  transformToCategoryObject,
  transformToCategoryChildren: (contextCategory, request) =>
    transformToCategoryRelationshipToMany(contextCategory, request, "children"),
  transformToCategoryMultimediaDescriptions: (contextCategory, request) =>
    transformToCategoryRelationshipToMany(contextCategory, request, "multimediaDescriptions"),
  transformToCategoryParents: (contextCategory, request) =>
    transformToCategoryRelationshipToMany(contextCategory, request, "parents"),

  transformToFeatureCollection,
  transformToFeatureObject,
  transformToFeatureChildren: (contextFeature, request) =>
    transformToFeatureRelationshipToMany(contextFeature, request, "children"),
  transformToFeatureMultimediaDescriptions: (contextFeature, request) =>
    transformToFeatureRelationshipToMany(contextFeature, request, "multimediaDescriptions"),
  transformToFeatureParents: (contextFeature, request) =>
    transformToFeatureRelationshipToMany(contextFeature, request, "parents"),
};
