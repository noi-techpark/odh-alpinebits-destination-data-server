const iso6393 = require("iso-639-3");
const { schemas } = require(".");
const knex = require("./connect");
const {
  deleteResourceTypes,
  deleteAllEventsStatus,
  deleteSeriesFrequencies,
  deleteLanguageCodes,
  insertResourceType,
  insertSeriesFrequency,
  insertEventStatus,
  insertLanguageCode,
} = require("./insert");

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

async function deletePredefinedRecords() {
  return deleteResourceTypes(knex)
    .then(() => deleteAllEventsStatus(knex))
    .then(() => deleteSeriesFrequencies(knex))
    .then(() => deleteLanguageCodes(knex));
}

async function insertResourceTypes() {
  return insertResourceType(knex, { type: "agents", title: "Agents" })
    .then(() => insertResourceType(knex, { type: "categories", title: "Categories" }))
    .then(() => insertResourceType(knex, { type: "events", title: "Events" }))
    .then(() => insertResourceType(knex, { type: "eventSeries", title: "Event Series" }))
    .then(() => insertResourceType(knex, { type: "features", title: "Features" }))
    .then(() => insertResourceType(knex, { type: "lifts", title: "Lifts" }))
    .then(() => insertResourceType(knex, { type: "mediaObjects", title: "Media Objects" }))
    .then(() => insertResourceType(knex, { type: "mountainAreas", title: "Mountain Areas" }))
    .then(() => insertResourceType(knex, { type: "skiSlopes", title: "Ski Slopes" }))
    .then(() => insertResourceType(knex, { type: "snowparks", title: "Snowparks" }))
    .then(() => insertResourceType(knex, { type: "venues", title: "Venues" }));
}

async function insertSeriesFrequencies() {
  return insertSeriesFrequency(knex, { frequency: "daily", title: "Daily" })
    .then(() => insertSeriesFrequency(knex, { frequency: "weekly", title: "Weekly" }))
    .then(() => insertSeriesFrequency(knex, { frequency: "monthly", title: "Monthly" }))
    .then(() => insertSeriesFrequency(knex, { frequency: "bimonthly", title: "Bimonthly" }))
    .then(() => insertSeriesFrequency(knex, { frequency: "quarterly", title: "Quarterly" }))
    .then(() => insertSeriesFrequency(knex, { frequency: "annual", title: "Annual" }))
    .then(() => insertSeriesFrequency(knex, { frequency: "biennial", title: "Biennial" }))
    .then(() => insertSeriesFrequency(knex, { frequency: "triennial", title: "Triennial" }));
}

async function insertAllEventStatus() {
  return insertEventStatus(knex, { status: "canceled", title: "Canceled" }).then(() =>
    insertEventStatus(knex, { status: "published", title: "Published" })
  );
}

async function insertLanguageCodes() {
  for (const { iso6393: code, name, scope, type } of iso6393) {
    if (type === "living" && scope === "individual") {
      try {
        await insertLanguageCode(knex, { lang: code, title: name });
      } catch (err) {
        throw err;
      }
    }
  }
}

async function insertPredefinedRecords() {
  return insertAllEventStatus()
    .then(() => insertResourceTypes())
    .then(() => insertSeriesFrequencies())
    .then(() => insertLanguageCodes());
}

deletePredefinedRecords()
  .then(() => insertPredefinedRecords())
  .catch((err) => console.log(err))
  .finally(() => knex.destroy());
