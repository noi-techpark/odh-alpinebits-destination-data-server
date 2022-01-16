const { schemas } = require(".");
const _ = require("lodash");
const fs = require("fs");
const path = require("path");

const {
  abstracts,
  addresses,
  categoryCoveredTypes,
  categorySpecializations,
  agents,
  categories,
  cities,
  complements,
  contactPoints,
  contributors,
  descriptions,
  eventStatus,
  events,
  eventSeries: eventSeriesSchema,
  features,
  featureCoveredTypes,
  featureSpecializations,
  languageCodes,
  mediaObjects,
  multimediaDescriptions,
  names,
  organizers,
  regions,
  resourceCategories,
  resources,
  resourceTypes,
  seriesFrequencies,
  shortNames,
  sponsors,
  streets,
  urls,
} = schemas;

function deleteResourceTypes(connection) {
  return connection(resourceTypes._name).del();
}

function deleteAllEventsStatus(connection) {
  return connection(eventStatus._name).del();
}

function deleteSeriesFrequencies(connection) {
  return connection(seriesFrequencies._name).del();
}

function deleteLanguageCodes(connection) {
  return connection(languageCodes._name).del();
}

function deleteCategories(connection) {
  return connection(categories._name)
    .del(categories.resourceId)
    .then((resourceIds) => connection(resources._name).whereIn(resources.id, resourceIds).del());
}

function checkNotNullable(field, field_name) {
  if (!field && typeof field !== "boolean") throw new Error(`Missing not nullable field: ${field_name}`);
}

function insertResourceType(connection, resourceType) {
  const { type, title } = resourceType;

  checkNotNullable(type, resourceTypes.type);

  return connection(resourceTypes._name).insert({
    [resourceTypes.type]: type,
    [resourceTypes.title]: title,
  });
}

function insertSeriesFrequency(connection, seriesFrequency) {
  const { frequency, title } = seriesFrequency;

  checkNotNullable(frequency, seriesFrequency.frequency);

  return connection(seriesFrequencies._name).insert({
    [seriesFrequencies.frequency]: frequency,
    [seriesFrequencies.title]: title,
  });
}

function insertEventStatus(connection, eventStatusObj) {
  const { status } = eventStatusObj;

  checkNotNullable(status, eventStatus.status);

  return insert(connection, eventStatus._name, eventStatusObj);
}

function insertLanguageCode(connection, language) {
  const lang = _.get(language, languageCodes.lang);

  checkNotNullable(lang, languageCodes.lang);

  return insert(connection, languageCodes._name, language);
}

function insertAbstract(connection, abstract) {
  const content = _.get(abstract, abstracts.content);

  checkNotNullable(content, abstracts.content);

  return insert(connection, abstracts._name, abstract);
}

function insertDescription(connection, description) {
  const content = _.get(description, descriptions.content);

  checkNotNullable(content, descriptions.content);

  return insert(connection, descriptions._name, description);
}

function insertName(connection, name) {
  const content = _.get(name, names.content);

  checkNotNullable(content, names.content);

  return insert(connection, names._name, name);
}

function insertShortName(connection, shortName) {
  const content = _.get(shortName, shortNames.content);

  checkNotNullable(content, shortNames.content);

  return insert(connection, shortNames._name, shortName);
}

function insertUrl(connection, url) {
  const content = _.get(url, urls.content);

  checkNotNullable(content, urls.content);

  return insert(connection, urls._name, url);
}

function insertCity(connection, city) {
  const content = _.get(city, cities.content);

  checkNotNullable(content, cities.content);

  return insert(connection, cities._name, city);
}

function insertComplement(connection, complement) {
  const content = _.get(complement, complements.content);

  checkNotNullable(content, complements.content);

  return insert(connection, complements._name, complement);
}

function insertRegion(connection, region) {
  const content = _.get(region, regions.content);

  checkNotNullable(content, regions.content);

  return insert(connection, regions._name, region);
}

function insertStreet(connection, street) {
  const content = _.get(street, streets.content);

  checkNotNullable(content, streets.content);

  return insert(connection, streets._name, street);
}

function insertContactPoint(connection, contactPoint) {
  const agentId = _.get(contactPoint, contactPoints.agentId);

  checkNotNullable(agentId, contactPoints.agentId);

  return insert(connection, contactPoints._name, contactPoint);
}

function insertAddress(connection, address) {
  const country = _.get(address, addresses.country);

  checkNotNullable(country, addresses.country);

  return insert(connection, addresses._name, address, addresses.id);
}

function getReturningColumns(returning) {
  return _.isString(returning) || _.isArray(returning) ? returning : "*";
}

function insert(connection, tableName, columns, returning) {
  const returnColumns = getReturningColumns(returning);
  return connection(tableName).insert(columns).returning(returnColumns);
}

function insertResourceText(connection, tableName, resourceId, lang, content) {
  const columns = {
    [abstracts.resourceId]: resourceId,
    [abstracts.lang]: lang,
    [abstracts.content]: content,
  };

  checkNotNullable(resourceId, abstracts.resourceId);
  checkNotNullable(lang, abstracts.lang);
  checkNotNullable(content, abstracts.content);

  return insert(connection, tableName, columns);
}

function insertAddressText(connection, tableName, addressId, lang, content) {
  const columns = {
    [cities.addressId]: addressId,
    [cities.lang]: lang,
    [cities.content]: content,
  };

  checkNotNullable(addressId, cities.addressId);
  checkNotNullable(lang, cities.lang);
  checkNotNullable(content, cities.content);

  return insert(connection, tableName, columns);
}

function insertCategoryCoveredType(connection, type, categoryId) {
  const columns = {
    [categoryCoveredTypes.type]: type,
    [categoryCoveredTypes.categoryId]: categoryId,
  };

  checkNotNullable(type, categoryCoveredTypes.type);
  checkNotNullable(categoryId, categoryCoveredTypes.categoryId);

  return insert(connection, categoryCoveredTypes._name, columns);
}

function insertCategorySpecialization(connection, childId, parentId) {
  const columns = {
    [categorySpecializations.childId]: childId,
    [categorySpecializations.parentId]: parentId,
  };

  checkNotNullable(childId, categorySpecializations.childId);
  checkNotNullable(parentId, categorySpecializations.parentId);

  return insert(connection, categorySpecializations._name, columns);
}

function insertResource(connection, resource) {
  const type = resource[resources.type];
  const dataProvider = resource[resources.dataProvider];

  checkNotNullable(type, resources.type);
  checkNotNullable(dataProvider, resources.dataProvider);

  return insert(connection, resources._name, resource, resources.id).then((array) => _.first(array));
}

function insertAgent(connection, agent) {
  return insert(connection, agents._name, agent, agents.id).then((array) => _.first(array));
}

function insertCategory(connection, category) {
  const categoryId = category[categories.id];
  const resourceId = category[categories.resourceId];
  const namespace = category[categories.namespace];

  checkNotNullable(categoryId, categories.id);
  checkNotNullable(resourceId, categories.resourceId);
  checkNotNullable(namespace, categories.namespace);

  return insert(connection, categories._name, category, categories.id).then((array) => _.first(array));
}

function insertMediaObject(connection, mediaObject) {
  return insert(connection, mediaObjects._name, mediaObject, mediaObjects.id).then((array) => _.first(array));
}

function insertEvent(connection, event) {
  const eventId = event[events.id];
  const publisherId = event[events.publisherId];

  checkNotNullable(eventId, events.id);
  checkNotNullable(publisherId, events.publisherId);

  return insert(connection, events._name, event, events.id).then((array) => _.first(array));
}

function insertEventSeries(connection, eventSeries) {
  const eventSeriesId = eventSeries[eventSeriesSchema.id];

  checkNotNullable(eventSeriesId, eventSeriesSchema.id);

  return insert(connection, eventSeriesSchema._name, eventSeries, eventSeriesSchema.id).then((array) => _.first(array));
}

function insertResourceCategory(connection, resourceId, categoryId) {
  const columns = {
    [resourceCategories.categoryId]: categoryId,
    [resourceCategories.categorizedResourceId]: resourceId,
  };

  checkNotNullable(categoryId, resourceCategories.categoryId);
  checkNotNullable(resourceId, resourceCategories.categorizedResourceId);

  return insert(connection, resourceCategories._name, columns);
}

function insertMultimediaDescriptions(connection, resourceId, descriptionId) {
  const columns = {
    [multimediaDescriptions.mediaObjectId]: descriptionId,
    [multimediaDescriptions.resourceId]: resourceId,
  };

  checkNotNullable(descriptionId, multimediaDescriptions.mediaObjectId);
  checkNotNullable(resourceId, multimediaDescriptions.resourceId);

  return insert(connection, multimediaDescriptions._name, columns);
}

function insertContributor(connection, eventId, contributorId) {
  const columns = {
    [contributors.contributorId]: contributorId,
    [contributors.eventId]: eventId,
  };

  checkNotNullable(contributorId, contributors.contributorId);
  checkNotNullable(eventId, contributors.eventId);

  return insert(connection, contributors._name, columns);
}

function insertOrganizer(connection, eventId, organizerId) {
  const columns = {
    [organizers.organizerId]: organizerId,
    [organizers.eventId]: eventId,
  };

  checkNotNullable(organizerId, organizers.organizerId);
  checkNotNullable(eventId, organizers.eventId);

  return insert(connection, organizers._name, columns);
}

function insertSponsor(connection, eventId, sponsorId) {
  const columns = {
    [sponsors.sponsorId]: sponsorId,
    [sponsors.eventId]: eventId,
  };

  checkNotNullable(sponsorId, sponsors.sponsorId);
  checkNotNullable(eventId, sponsors.eventId);

  return insert(connection, sponsors._name, columns);
}

function select(connection, tableName, where, selection) {
  const returnColumns = getReturningColumns(selection);
  return connection(tableName).select(returnColumns).where(where);
}

function selectUsingFile(connection, queryFileName, where) {
  const queryPath = path.resolve(__dirname, queryFileName);
  return fs.promises
    .readFile(queryPath, "utf-8")
    .then((query) => connection.raw(`${query} ${where};`))
    .then((result) => result?.rows)
    .catch((queryError) => {
      throw queryError;
    });
}

function selectAgentFromId(connection, id) {
  const selectAgentFile = "select_agent.sql";
  const where = _.isString(id) ? `WHERE agents.id = '${id}'` : "";
  return selectUsingFile(connection, selectAgentFile, where);
}

function selectCategoryFromId(connection, id) {
  const selectCategoryFile = "select_category.sql";
  const where = _.isString(id) ? `WHERE categories.id = '${id}'` : "";
  return selectUsingFile(connection, selectCategoryFile, where);
}

function selectMediaObjectFromId(connection, id) {
  const selectMediaObjectFile = "select_media_object.sql";
  const where = _.isString(id) ? `WHERE media_objects.id = '${id}'` : "";
  return selectUsingFile(connection, selectMediaObjectFile, where);
}

function selectEventFromId(connection, id) {
  const selectEventFile = "select_event.sql";
  const where = _.isString(id) ? `WHERE events.id = '${id}'` : "";
  return selectUsingFile(connection, selectEventFile, where);
}

function selectEventSeriesFromId(connection, id) {
  const selectEventSeriesFile = "select_event_series.sql";
  const where = _.isString(id) ? `WHERE event_series.id = '${id}'` : "";
  return selectUsingFile(connection, selectEventSeriesFile, where);
}

function selectResourceFromId(connection, resourceId) {
  const columns = { [resources.id]: resourceId };
  return select(connection, resources._name, columns);
}

function selectAbstractsFromId(connection, resourceId) {
  const columns = { [abstracts.resourceId]: resourceId };
  return select(connection, abstracts._name, columns);
}

function selectDescriptionsFromId(connection, resourceId) {
  const columns = { [descriptions.resourceId]: resourceId };
  return select(connection, descriptions._name, columns);
}

function selectNamesFromId(connection, resourceId) {
  const columns = { [names.resourceId]: resourceId };
  return select(connection, names._name, columns);
}

function selectShortNamesFromId(connection, resourceId) {
  const columns = { [shortNames.resourceId]: resourceId };
  return select(connection, shortNames._name, columns);
}

function selectUrlsFromId(connection, resourceId) {
  const columns = { [urls.resourceId]: resourceId };
  return select(connection, urls._name, columns);
}

function selectCitiesFromId(connection, addressId) {
  const columns = { [cities.addressId]: addressId };
  return select(connection, cities._name, columns);
}

function selectComplementsFromId(connection, addressId) {
  const columns = { [complements.addressId]: addressId };
  return select(connection, complements._name, columns);
}

function selectRegionsFromId(connection, addressId) {
  const columns = { [regions.addressId]: addressId };
  return select(connection, regions._name, columns);
}

function selectStreetsFromId(connection, addressId) {
  const columns = { [streets.addressId]: addressId };
  return select(connection, streets._name, columns);
}

function selectCategoriesFromId(connection, resourceId) {
  const columns = { [resourceCategories.categorizedResourceId]: resourceId };
  return select(connection, resourceCategories._name, columns);
}

function selectContactPointsFromId(connection, agentId) {
  const columns = { [contactPoints.agentId]: agentId };
  return connection(contactPoints._name)
    .select()
    .leftJoin(
      addresses._name,
      `${addresses._name}.${addresses.id}`,
      `${contactPoints._name}.${contactPoints.addressId}`
    )
    .where(columns);
}

function deleteResource(connection, resourceId, type) {
  const columns = {
    [resources.id]: resourceId,
    [resources.type]: type,
  };
  return connection(resources._name).where(columns).del();
}

function deleteCategory(connection, id) {
  const columns = {
    [categories.id]: id,
  };
  return connection(categories._name).where(columns).del();
}

function update(connection, tableName, where, columns, returning) {
  const returnColumns = getReturningColumns(returning);
  return connection(tableName).where(where).update(columns).returning(returnColumns);
}

function updateResource(connection, resource) {
  const resourceId = resource[resources.id];

  checkNotNullable(resourceId, resources.id);

  const where = { [resources.id]: resourceId };
  return update(connection, resources._name, where, resource);
}

function updateCategory(connection, category) {
  const categoryId = category[categories.id];

  checkNotNullable(categoryId, categories.id);

  const where = { [categories.id]: categoryId };
  return update(connection, categories._name, where, category);
}

function deleteAbstracts(connection, id) {
  checkNotNullable(id, resources.id);

  const where = { [abstracts.resourceId]: id };
  return _delete(connection, abstracts._name, where);
}

function deleteDescriptions(connection, id) {
  checkNotNullable(id, resources.id);

  const where = { [descriptions.resourceId]: id };
  return _delete(connection, descriptions._name, where);
}

function deleteNames(connection, id) {
  checkNotNullable(id, resources.id);

  const where = { [names.resourceId]: id };
  return _delete(connection, names._name, where);
}

function deleteShortNames(connection, id) {
  checkNotNullable(id, resources.id);

  const where = { [shortNames.resourceId]: id };
  return _delete(connection, shortNames._name, where);
}

function deleteUrls(connection, id) {
  checkNotNullable(id, resources.id);

  const where = { [urls.resourceId]: id };
  return _delete(connection, urls._name, where);
}

function deleteContactPoints(connection, id) {
  checkNotNullable(id, resources.id);

  const where = { [contactPoints.agentId]: id };
  return _delete(connection, contactPoints._name, where);
}

function _delete(connection, tableName, where, returning) {
  const ret = getReturningColumns(returning);
  return connection(tableName).where(where).del(ret);
}

function deleteResourceText(connection, tableName, resourceId) {
  const columns = {
    [abstracts.resourceId]: resourceId,
  };

  checkNotNullable(resourceId, abstracts.resourceId);

  return connection(tableName).where(columns).del();
}

function deleteAddressText(connection, tableName, addressId) {
  const columns = {
    [cities.addressId]: addressId,
  };

  checkNotNullable(addressId, cities.addressId);

  return connection(tableName).where(columns).del();
}

function deleteResourceCategories(connection, resourceId) {
  const columns = {
    [resourceCategories.categorizedResourceId]: resourceId,
  };

  checkNotNullable(resourceId, resourceCategories.categorizedResourceId);

  return connection(resourceCategories._name).where(columns).del();
}

function deleteMultimediaDescriptions(connection, descriptionId) {
  const columns = {
    [multimediaDescriptions.resourceId]: descriptionId,
  };

  checkNotNullable(descriptionId, multimediaDescriptions.resourceId);

  return connection(multimediaDescriptions._name).where(columns).del();
}

function deleteContributors(connection, eventId) {
  const columns = {
    [contributors.eventId]: eventId,
  };

  checkNotNullable(eventId, contributors.eventId);

  return connection(contributors._name).where(columns).del();
}

function deleteOrganizers(connection, eventId) {
  const columns = {
    [organizers.eventId]: eventId,
  };

  checkNotNullable(eventId, organizers.eventId);

  return connection(organizers._name).where(columns).del();
}

function deleteSponsors(connection, eventId) {
  const columns = {
    [sponsors.eventId]: eventId,
  };

  checkNotNullable(eventId, sponsors.eventId);

  return connection(sponsors._name).where(columns).del();
}

// TODO: check the case where the event already has a parent
function updateSubEvent(connection, eventId, subEventId) {
  const columns = {
    [events.parentId]: eventId,
  };

  checkNotNullable(eventId, events.parentId);
  checkNotNullable(subEventId, events.id);

  const where = { [events.id]: subEventId };

  return update(connection, events._name, where, columns);
}

// TODO: check the case where the event already has a series
function updateEdition(connection, eventSeriesId, eventId) {
  const columns = {
    [events.seriesId]: eventSeriesId,
  };

  checkNotNullable(eventSeriesId, events.seriesId);
  checkNotNullable(eventId, events.id);

  const where = { [events.id]: eventId };

  return update(connection, events._name, where, columns);
}

function deleteSubEvents(connection, eventId) {
  const columns = { [events.parentId]: null };

  checkNotNullable(eventId, events.parentId);

  const where = { [events.parentId]: eventId };

  return update(connection, events._name, where, columns);
}

function deleteEditions(connection, eventSeriesId) {
  const columns = { [events.seriesId]: null };

  checkNotNullable(eventSeriesId, events.seriesId);

  const where = { [events.seriesId]: eventSeriesId };

  return update(connection, events._name, where, columns);
}

function deleteCategoryCoveredTypes(connection, categoryId) {
  const columns = {
    [categoryCoveredTypes.categoryId]: categoryId,
  };

  checkNotNullable(categoryId, categoryCoveredTypes.categoryId);

  return connection(categoryCoveredTypes._name).where(columns).del();
}

function deleteChildrenCategories(connection, parentId) {
  const columns = {
    [categorySpecializations.parentId]: parentId,
  };

  checkNotNullable(parentId, categorySpecializations.parentId);

  return connection(categorySpecializations._name).where(columns).del();
}

function deleteParentCategories(connection, childId) {
  const columns = {
    [categorySpecializations.childId]: childId,
  };

  checkNotNullable(childId, categorySpecializations.childId);

  return connection(categorySpecializations._name).where(columns).del();
}

module.exports = {
  deleteResourceTypes,
  deleteAllEventsStatus,
  deleteSeriesFrequencies,
  deleteLanguageCodes,
  deleteCategories,
  insert,
  insertResourceType,
  insertSeriesFrequency,
  insertEventStatus,
  insertLanguageCode,
  insertAbstract,
  insertDescription,
  insertName,
  insertShortName,
  insertUrl,
  insertCity,
  insertComplement,
  insertRegion,
  insertStreet,
  insertContactPoint,
  insertAddress,
  insertResource,
  insertAgent,
  insertCategory,
  insertResourceCategory,
  insertCategoryCoveredType,
  insertCategorySpecialization,
  insertEvent,
  insertEventSeries,
  selectAgentFromId,
  selectCategoryFromId,
  selectResourceFromId,
  selectAbstractsFromId,
  selectDescriptionsFromId,
  selectNamesFromId,
  selectShortNamesFromId,
  selectUrlsFromId,
  selectCitiesFromId,
  selectComplementsFromId,
  selectRegionsFromId,
  selectStreetsFromId,
  selectCategoriesFromId,
  selectMediaObjectFromId,
  selectEventFromId,
  selectEventSeriesFromId,
  selectContactPointsFromId,
  deleteResource,
  deleteCategory,
  updateResource,
  updateCategory,
  deleteAbstracts,
  deleteDescriptions,
  deleteNames,
  deleteShortNames,
  deleteUrls,
  deleteContactPoints,
  deleteResourceText,
  deleteAddressText,
  insertResourceText,
  insertAddressText,
  insertResourceCategory,
  insertMultimediaDescriptions,
  insertOrganizer,
  insertContributor,
  insertSponsor,
  deleteResourceCategories,
  deleteMultimediaDescriptions,
  deleteOrganizers,
  deleteContributors,
  deleteSponsors,
  updateSubEvent,
  deleteSubEvents,
  deleteEditions,
  updateEdition,
  deleteCategoryCoveredTypes,
  deleteChildrenCategories,
  deleteParentCategories,
  insertMediaObject,
};
