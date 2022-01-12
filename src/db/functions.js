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

async function deleteResourceTypes(knex) {
  return knex(resourceTypes._name).del();
}

async function deleteAllEventsStatus(knex) {
  return knex(eventStatus._name).del();
}

async function deleteSeriesFrequencies(knex) {
  return knex(seriesFrequencies._name).del();
}

async function deleteLanguageCodes(knex) {
  return knex(languageCodes._name).del();
}

function checkNotNullable(field, field_name) {
  if (!field && typeof field !== "boolean") throw new Error(`Missing not nullable field: ${field_name}`);
}

async function insertResourceType(knex, resourceType) {
  const { type, title } = resourceType;

  checkNotNullable(type, resourceTypes.type);

  return knex(resourceTypes._name).insert({
    [resourceTypes.type]: type,
    [resourceTypes.title]: title,
  });
}

async function insertSeriesFrequency(knex, seriesFrequency) {
  const { frequency, title } = seriesFrequency;

  checkNotNullable(frequency, seriesFrequency.frequency);

  return knex(seriesFrequencies._name).insert({
    [seriesFrequencies.frequency]: frequency,
    [seriesFrequencies.title]: title,
  });
}

async function insertEventStatus(knex, eventStatusObj) {
  const { status } = eventStatusObj;

  checkNotNullable(status, eventStatus.status);

  return insert(knex, eventStatus._name, eventStatusObj);
}

async function insertLanguageCode(knex, language) {
  const lang = _.get(language, languageCodes.lang);

  checkNotNullable(lang, languageCodes.lang);

  return insert(knex, languageCodes._name, language);
}

async function insertAbstract(knex, abstract) {
  const content = _.get(abstract, abstracts.content);

  checkNotNullable(content, abstracts.content);

  return insert(knex, abstracts._name, abstract);
}

async function insertDescription(knex, description) {
  const content = _.get(description, descriptions.content);

  checkNotNullable(content, descriptions.content);

  return insert(knex, descriptions._name, description);
}

async function insertName(knex, name) {
  const content = _.get(name, names.content);

  checkNotNullable(content, names.content);

  return insert(knex, names._name, name);
}

async function insertShortName(knex, shortName) {
  const content = _.get(shortName, shortNames.content);

  checkNotNullable(content, shortNames.content);

  return insert(knex, shortNames._name, shortName);
}

async function insertUrl(knex, url) {
  const content = _.get(url, urls.content);

  checkNotNullable(content, urls.content);

  return insert(knex, urls._name, url);
}

async function insertCity(knex, city) {
  console.log("inserting city", city);
  const content = _.get(city, cities.content);

  checkNotNullable(content, cities.content);

  return insert(knex, cities._name, city);
}

async function insertComplement(knex, complement) {
  console.log("inserting complement", complement);
  const content = _.get(complement, complements.content);

  checkNotNullable(content, complements.content);

  return insert(knex, complements._name, complement);
}

async function insertRegion(knex, region) {
  const content = _.get(region, regions.content);

  checkNotNullable(content, regions.content);

  return insert(knex, regions._name, region);
}

async function insertStreet(knex, street) {
  const content = _.get(street, streets.content);

  checkNotNullable(content, streets.content);

  return insert(knex, streets._name, street);
}

async function insertContactPoint(knex, contactPoint) {
  const agentId = _.get(contactPoint, contactPoints.agentId);

  checkNotNullable(agentId, contactPoints.agentId);

  return insert(knex, contactPoints._name, contactPoint);
}

async function insertAddress(knex, address) {
  const country = _.get(address, addresses.country);

  checkNotNullable(country, addresses.country);

  return insert(knex, addresses._name, address, addresses.addressId);
}

function getReturningColumns(returning) {
  return _.isString(returning) || _.isArray(returning) ? returning : "*";
}

async function insert(knex, tableName, columns, returning) {
  const returnColumns = getReturningColumns(returning);
  return knex(tableName).insert(columns).returning(returnColumns);
}

async function insertResource(knex, resource) {
  const type = resource[resources.type];
  const dataProvider = resource[resources.dataProvider];

  checkNotNullable(type, resources.type);
  checkNotNullable(dataProvider, resources.dataProvider);

  return insert(knex, resources._name, resource, resources.resourceId).then((array) => _.first(array));
}

async function insertAgent(knex, agent) {
  return insert(knex, agents._name, agent, agents.agentId).then((array) => _.first(array));
}

module.exports = {
  deleteResourceTypes,
  deleteAllEventsStatus,
  deleteSeriesFrequencies,
  deleteLanguageCodes,
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
};
