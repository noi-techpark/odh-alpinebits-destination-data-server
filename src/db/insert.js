const iso6393 = require("iso-639-3");
const { schemas } = require(".");

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
  const { status, title } = eventStatusObj;

  checkNotNullable(status, eventStatus.status);

  return knex(eventStatus._name).insert({
    [eventStatus.status]: status,
    [eventStatus.title]: title,
  });
}

async function insertLanguageCode(knex, language) {
  const { lang, title } = language;

  checkNotNullable(lang, languageCodes.lang);

  return knex(languageCodes._name).insert({
    [languageCodes.lang]: lang,
    [languageCodes.title]: title,
  });
}

async function insertAgent(knex, agent) {
  const { type, dataProvider } = agent;

  checkNotNullable(type, resources.type);
  checkNotNullable(dataProvider, resources.dataProvider);

  const ret = await knex(resources._name)
    .insert({
      [resources.resourceId]: agent.resourceId,
      [resources.type]: agent.type,
      [resources.dataProvider]: agent.dataProvider,
      [resources.createdAt]: agent.createdAt,
      [resources.lastUpdate]: agent.lastUpdate,
    })
    .returning(resources.resourceId);

  console.log("Insert resource return", ret);

  return knex(agents._name).insert({
    [agents.agentId]: ret[0],
  });
}

module.exports = {
  deleteResourceTypes,
  deleteAllEventsStatus,
  deleteSeriesFrequencies,
  deleteLanguageCodes,
  insertResourceType,
  insertSeriesFrequency,
  insertEventStatus,
  insertLanguageCode,
  insertAgent,
};
