const iso6393 = require("iso-639-3");
const { schemas } = require(".");
const _ = require("lodash");

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
  eventSeries,
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
    .then((resourceIds) => connection(resources._name).whereIn(resources.resourceId, resourceIds).del());
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

  return insert(connection, addresses._name, address, addresses.addressId);
}

function getReturningColumns(returning) {
  return _.isString(returning) || _.isArray(returning) ? returning : "*";
}

function insert(connection, tableName, columns, returning) {
  const returnColumns = getReturningColumns(returning);
  return connection(tableName).insert(columns).returning(returnColumns);
}

function insertResource(connection, resource) {
  const type = resource[resources.type];
  const dataProvider = resource[resources.dataProvider];

  checkNotNullable(type, resources.type);
  checkNotNullable(dataProvider, resources.dataProvider);

  return insert(connection, resources._name, resource, resources.resourceId).then((array) => _.first(array));
}

function insertAgent(connection, agent) {
  return insert(connection, agents._name, agent, agents.agentId).then((array) => _.first(array));
}

function insertCategory(connection, category) {
  const categoryId = category[categories.categoryId];
  const resourceId = category[categories.resourceId];

  checkNotNullable(categoryId, categories.categoryId);
  checkNotNullable(resourceId, categories.resourceId);

  return insert(connection, categories._name, category, categories.categoryId).then((array) => _.first(array));
}

function insertResourceCategory(connection, resourceCategory) {
  return insert(connection, resourceCategories._name, resourceCategory);
}

function select(connection, tableName, where, selection) {
  const returnColumns = getReturningColumns(selection);
  return connection(tableName).select(returnColumns).where(where);
}

function selectResourceFromId(connection, resourceId) {
  const columns = { [resources.resourceId]: resourceId };
  return select(connection, resources._name, columns);
}

function selectAgentFromId(connection, agentId) {
  const columns = { [agents.agentId]: agentId };
  return select(connection, agents._name, columns);
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
      `${addresses._name}.${addresses.addressId}`,
      `${contactPoints._name}.${contactPoints.addressId}`
    )
    .where(columns);
}

function deleteResource(connection, resourceId, type) {
  const columns = {
    [resources.resourceId]: resourceId,
    [resources.type]: type,
  };
  return connection(resources._name).where(columns).del();
}

// function selectContactPointsFromAgentId(connection, agentId) {
//   const agentIdFilter = { [contactPoints.agentId]: agentId };
//   // return select(connection, contactPoints._name, columns);
//   return connection(contactPoints._name)
//     .select()
//     .innerJoin(
//       addresses._name,
//       `${addresses._name}.${addresses.addressId}`,
//       `${contactPoints._name}.${contactPoints.addressId}`
//     )
//     .where(agentIdFilter);
// }

// function selectContactPointFromAgentId(connection, agentId) {
//   const columns = { [contactPoints.agentId]: agentId };
//   return select(connection, contactPoints._name, columns);
// }

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
  selectAgentFromId,
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
  selectContactPointsFromId,
  deleteResource,
};
