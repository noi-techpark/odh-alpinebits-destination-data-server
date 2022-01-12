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

function deleteResourceTypes(knex) {
  return knex(resourceTypes._name).del();
}

function deleteAllEventsStatus(knex) {
  return knex(eventStatus._name).del();
}

function deleteSeriesFrequencies(knex) {
  return knex(seriesFrequencies._name).del();
}

function deleteLanguageCodes(knex) {
  return knex(languageCodes._name).del();
}

function deleteCategories(knex) {
  return knex(categories._name)
    .del(categories.resourceId)
    .then((resourceIds) => knex(resources._name).whereIn(resources.resourceId, resourceIds).del());
}

function checkNotNullable(field, field_name) {
  if (!field && typeof field !== "boolean") throw new Error(`Missing not nullable field: ${field_name}`);
}

function insertResourceType(knex, resourceType) {
  const { type, title } = resourceType;

  checkNotNullable(type, resourceTypes.type);

  return knex(resourceTypes._name).insert({
    [resourceTypes.type]: type,
    [resourceTypes.title]: title,
  });
}

function insertSeriesFrequency(knex, seriesFrequency) {
  const { frequency, title } = seriesFrequency;

  checkNotNullable(frequency, seriesFrequency.frequency);

  return knex(seriesFrequencies._name).insert({
    [seriesFrequencies.frequency]: frequency,
    [seriesFrequencies.title]: title,
  });
}

function insertEventStatus(knex, eventStatusObj) {
  const { status } = eventStatusObj;

  checkNotNullable(status, eventStatus.status);

  return insert(knex, eventStatus._name, eventStatusObj);
}

function insertLanguageCode(knex, language) {
  const lang = _.get(language, languageCodes.lang);

  checkNotNullable(lang, languageCodes.lang);

  return insert(knex, languageCodes._name, language);
}

function insertAbstract(knex, abstract) {
  const content = _.get(abstract, abstracts.content);

  checkNotNullable(content, abstracts.content);

  return insert(knex, abstracts._name, abstract);
}

function insertDescription(knex, description) {
  const content = _.get(description, descriptions.content);

  checkNotNullable(content, descriptions.content);

  return insert(knex, descriptions._name, description);
}

function insertName(knex, name) {
  const content = _.get(name, names.content);

  checkNotNullable(content, names.content);

  return insert(knex, names._name, name);
}

function insertShortName(knex, shortName) {
  const content = _.get(shortName, shortNames.content);

  checkNotNullable(content, shortNames.content);

  return insert(knex, shortNames._name, shortName);
}

function insertUrl(knex, url) {
  const content = _.get(url, urls.content);

  checkNotNullable(content, urls.content);

  return insert(knex, urls._name, url);
}

function insertCity(knex, city) {
  const content = _.get(city, cities.content);

  checkNotNullable(content, cities.content);

  return insert(knex, cities._name, city);
}

function insertComplement(knex, complement) {
  const content = _.get(complement, complements.content);

  checkNotNullable(content, complements.content);

  return insert(knex, complements._name, complement);
}

function insertRegion(knex, region) {
  const content = _.get(region, regions.content);

  checkNotNullable(content, regions.content);

  return insert(knex, regions._name, region);
}

function insertStreet(knex, street) {
  const content = _.get(street, streets.content);

  checkNotNullable(content, streets.content);

  return insert(knex, streets._name, street);
}

function insertContactPoint(knex, contactPoint) {
  const agentId = _.get(contactPoint, contactPoints.agentId);

  checkNotNullable(agentId, contactPoints.agentId);

  return insert(knex, contactPoints._name, contactPoint);
}

function insertAddress(knex, address) {
  const country = _.get(address, addresses.country);

  checkNotNullable(country, addresses.country);

  return insert(knex, addresses._name, address, addresses.addressId);
}

function getReturningColumns(returning) {
  return _.isString(returning) || _.isArray(returning) ? returning : "*";
}

function insert(knex, tableName, columns, returning) {
  const returnColumns = getReturningColumns(returning);
  return knex(tableName).insert(columns).returning(returnColumns);
}

function insertResource(knex, resource) {
  const type = resource[resources.type];
  const dataProvider = resource[resources.dataProvider];

  checkNotNullable(type, resources.type);
  checkNotNullable(dataProvider, resources.dataProvider);

  return insert(knex, resources._name, resource, resources.resourceId).then((array) => _.first(array));
}

function insertAgent(knex, agent) {
  return insert(knex, agents._name, agent, agents.agentId).then((array) => _.first(array));
}

function insertCategory(knex, category) {
  const categoryId = category[categories.categoryId];
  const resourceId = category[categories.resourceId];

  checkNotNullable(categoryId, categories.categoryId);
  checkNotNullable(resourceId, categories.resourceId);

  return insert(knex, categories._name, category, categories.categoryId).then((array) => _.first(array));
}

function insertResourceCategory(knex, resourceCategory) {
  return insert(knex, resourceCategories._name, resourceCategory);
}

function select(knex, tableName, where, selection) {
  const returnColumns = getReturningColumns(selection);
  return knex(tableName).select(returnColumns).where(where);
}

function selectResourceFromId(knex, resourceId) {
  const columns = { [resources.resourceId]: resourceId };
  return select(knex, resources._name, columns);
}

function selectAgentFromId(knex, agentId) {
  const columns = { [agents.agentId]: agentId };
  return select(knex, agents._name, columns);
}

function selectAbstractsFromId(knex, resourceId) {
  const columns = { [abstracts.resourceId]: resourceId };
  return select(knex, abstracts._name, columns);
}

function selectDescriptionsFromId(knex, resourceId) {
  const columns = { [descriptions.resourceId]: resourceId };
  return select(knex, descriptions._name, columns);
}

function selectNamesFromId(knex, resourceId) {
  const columns = { [names.resourceId]: resourceId };
  return select(knex, names._name, columns);
}

function selectShortNamesFromId(knex, resourceId) {
  const columns = { [shortNames.resourceId]: resourceId };
  return select(knex, shortNames._name, columns);
}

function selectUrlsFromId(knex, resourceId) {
  const columns = { [urls.resourceId]: resourceId };
  return select(knex, urls._name, columns);
}

function selectCitiesFromId(knex, addressId) {
  const columns = { [cities.addressId]: addressId };
  return select(knex, cities._name, columns);
}

function selectComplementsFromId(knex, addressId) {
  const columns = { [complements.addressId]: addressId };
  return select(knex, complements._name, columns);
}

function selectRegionsFromId(knex, addressId) {
  const columns = { [regions.addressId]: addressId };
  return select(knex, regions._name, columns);
}

function selectStreetsFromId(knex, addressId) {
  const columns = { [streets.addressId]: addressId };
  return select(knex, streets._name, columns);
}

function selectCategoriesFromId(knex, resourceId) {
  const columns = { [resourceCategories.categorizedResourceId]: resourceId };
  return select(knex, resourceCategories._name, columns);
}

function selectContactPointsFromId(knex, agentId) {
  const columns = { [contactPoints.agentId]: agentId };
  return knex(contactPoints._name)
    .select()
    .leftJoin(
      addresses._name,
      `${addresses._name}.${addresses.addressId}`,
      `${contactPoints._name}.${contactPoints.addressId}`
    )
    .where(columns);
  // return select(knex, resourceCategories._name, columns);
}

// function selectContactPointsFromAgentId(knex, agentId) {
//   const agentIdFilter = { [contactPoints.agentId]: agentId };
//   // return select(knex, contactPoints._name, columns);
//   return knex(contactPoints._name)
//     .select()
//     .innerJoin(
//       addresses._name,
//       `${addresses._name}.${addresses.addressId}`,
//       `${contactPoints._name}.${contactPoints.addressId}`
//     )
//     .where(agentIdFilter);
// }

// function selectContactPointFromAgentId(knex, agentId) {
//   const columns = { [contactPoints.agentId]: agentId };
//   return select(knex, contactPoints._name, columns);
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
};
