const { schemas } = require(".");
const knex = require("./connect");

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

const UUID_GENERATE = "uuid_generate_v4()";
const SET_NULL = "SET NULL";
const CASCADE = "CASCADE";

async function setupDatabase() {
  return addUuidGenerator();
}

async function addUuidGenerator() {
  return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
}

async function dropTableIfExists(tableName) {
  return knex.raw(`DROP TABLE IF EXISTS ${tableName} CASCADE;`);
}

async function createResourceTypesTable() {
  return knex.schema.createTable(resourceTypes._name, function (table) {
    table.string(resourceTypes.type, 50).primary();
    table.string(resourceTypes.title, 50);
  });
}

async function createResourcesTable() {
  return knex.raw(`
    CREATE TABLE ${resources._name} (
      ${resources.resourceId} UUID DEFAULT ${UUID_GENERATE} PRIMARY KEY,
      ${resources.type} VARCHAR ( 50 ) NOT NULL,
      ${resources.odhId} VARCHAR ( 50 ),
      ${resources.dataProvider} TEXT NOT NULL,
      ${resources.createdAt} TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ${resources.lastUpdate} TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ${resources.simpleUrl} TEXT,

      FOREIGN KEY (${resources.type})
        REFERENCES ${resourceTypes._name} (${resourceTypes.type})
        ON DELETE CASCADE
    );`);
}

async function createAgentsTable() {
  return knex.schema.createTable(agents._name, function (table) {
    table.uuid(agents.agentId).primary().references(resources.resourceId).inTable(resources._name).onDelete(CASCADE);
  });
}

async function createCategoriesTable() {
  return knex.schema.createTable(categories._name, function (table) {
    table.string(categories.categoryId, 100).primary();
    table
      .uuid(categories.resourceId)
      .notNullable()
      .references(resources.resourceId)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table.string(categories.namespace, 50).notNullable();
  });
}

async function createCategoryCoveredTypesTable() {
  return knex.schema.createTable(categoryCoveredTypes._name, function (table) {
    table
      .string(categoryCoveredTypes.categoryId, 100)
      .references(categories.categoryId)
      .inTable(categories._name)
      .onDelete(CASCADE);
    table
      .string(categoryCoveredTypes.type, 50)
      .references(resourceTypes.type)
      .inTable(resourceTypes._name)
      .onDelete(CASCADE);
    table.primary([categoryCoveredTypes.categoryId, categoryCoveredTypes.type]);
  });
}

async function createCategorySpecializationsTable() {
  return knex.schema.createTable(categorySpecializations._name, function (table) {
    table
      .string(categorySpecializations.parentId, 100)
      .references(categories.categoryId)
      .inTable(categories._name)
      .onDelete(CASCADE);
    table
      .string(categorySpecializations.childId, 100)
      .references(categories.categoryId)
      .inTable(categories._name)
      .onDelete(CASCADE);
    table.primary([categorySpecializations.parentId, categorySpecializations.childId]);
  });
}

async function createFeaturesTable() {
  // TODO: update the relationship to snowparks
  return knex.schema.createTable(features._name, function (table) {
    table.string(features.featureId, 100).primary();
    table
      .uuid(features.resourceId)
      .notNullable()
      .references(resources.resourceId)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table.string(features.namespace, 50).notNullable();
  });
}

// At the moment, this should always be "snowparks"
async function createFeatureCoveredTypesTable() {
  return knex.schema.createTable(featureCoveredTypes._name, function (table) {
    table
      .string(featureCoveredTypes.featureId, 100)
      .references(features.featureId)
      .inTable(features._name)
      .onDelete(CASCADE);
    table
      .string(featureCoveredTypes.type, 50)
      .references(resourceTypes.type)
      .inTable(resourceTypes._name)
      .onDelete(CASCADE);
    table.primary([featureCoveredTypes.featureId, featureCoveredTypes.type]);
  });
}

async function createFeatureSpecializationsTable() {
  return knex.schema.createTable(featureSpecializations._name, function (table) {
    table
      .string(featureSpecializations.parentId, 100)
      .references(features.categoryId)
      .inTable(features._name)
      .onDelete(CASCADE);
    table
      .string(featureSpecializations.childId, 100)
      .references(features.categoryId)
      .inTable(features._name)
      .onDelete(CASCADE);
    table.primary([featureSpecializations.parentId, featureSpecializations.childId]);
  });
}

async function createMediaObjectsTable() {
  return knex.schema.createTable(mediaObjects._name, function (table) {
    table
      .uuid(mediaObjects.mediaObjectId)
      .primary()
      .references(resources.resourceId)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table.uuid(mediaObjects.copyrightOwnerId).references(agents.agentId).inTable(agents._name).onDelete(SET_NULL);
    table.string(mediaObjects.contentType);
    table.integer(mediaObjects.duration);
    table.integer(mediaObjects.height);
    table.string(mediaObjects.license, 50);
    table.integer(mediaObjects.width);
  });
}

async function createSeriesFrequenciesTable() {
  return knex.schema.createTable(seriesFrequencies._name, function (table) {
    table.string(seriesFrequencies.frequency, 50).primary();
    table.string(seriesFrequencies.title, 50);
  });
}

async function createEventSeriesTable() {
  return knex.schema.createTable(eventSeries._name, function (table) {
    table
      .uuid(eventSeries.eventSeriesId)
      .primary()
      .references(resources.resourceId)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table
      .string(eventSeries.frequency, 50)
      .references(seriesFrequencies.frequency)
      .inTable(seriesFrequencies._name)
      .onDelete(SET_NULL);
  });
}

async function createEventStatusTable() {
  return knex.schema.createTable(eventStatus._name, function (table) {
    table.string(eventStatus.status, 50).primary();
    table.string(eventStatus.title, 50);
  });
}

async function createEventsTable() {
  return knex.schema.createTable(events._name, function (table) {
    table.uuid(events.eventId).primary().references(resources.resourceId).inTable(resources._name).onDelete(CASCADE);
    table.integer(events.capacity);
    table.timestamp(events.endDate, { useTz: true });
    table.timestamp(events.startDate, { useTz: true });
    table.uuid(events.parentId).references(events.eventId).inTable(events._name).onDelete(SET_NULL);
    table.uuid(events.publisherId).references(agents.agentId).inTable(agents._name).notNullable().onDelete(CASCADE);
    table.string(events.status, 50).references(eventStatus.status).inTable(eventStatus._name).onDelete(SET_NULL);
  });
}

async function createLanguageCodesTable() {
  return knex.schema.createTable(languageCodes._name, function (table) {
    table.string(languageCodes.lang, 3).primary();
    table.string(languageCodes.title, 100);
  });
}

async function createAbstractsTable() {
  return knex.schema.createTable(abstracts._name, function (table) {
    table.string(abstracts.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.uuid(abstracts.resourceId).references(resources.resourceId).inTable(resources._name).onDelete(CASCADE);
    table.text(abstracts.content).notNullable();
    table.primary([abstracts.lang, abstracts.resourceId]);
  });
}

async function createDescriptionsTable() {
  return knex.schema.createTable(descriptions._name, function (table) {
    table.string(descriptions.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.uuid(descriptions.resourceId).references(resources.resourceId).inTable(resources._name).onDelete(CASCADE);
    table.text(descriptions.content).notNullable();
    table.primary([descriptions.lang, descriptions.resourceId]);
  });
}

async function createNamesTable() {
  return knex.schema.createTable(names._name, function (table) {
    table.string(names.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.uuid(names.resourceId).references(resources.resourceId).inTable(resources._name).onDelete(CASCADE);
    table.text(names.content).notNullable();
    table.primary([names.lang, names.resourceId]);
  });
}

async function createShortNamesTable() {
  return knex.schema.createTable(shortNames._name, function (table) {
    table.string(shortNames.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.uuid(shortNames.resourceId).references(resources.resourceId).inTable(resources._name).onDelete(CASCADE);
    table.text(shortNames.content).notNullable();
    table.primary([shortNames.lang, shortNames.resourceId]);
  });
}

async function createUrlsTable() {
  return knex.schema.createTable(urls._name, function (table) {
    table.string(urls.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.uuid(urls.resourceId).references(resources.resourceId).inTable(resources._name).onDelete(CASCADE);
    table.text(urls.content).notNullable();
    table.primary([urls.lang, urls.resourceId]);
  });
}

async function createAddressesTable() {
  return knex.schema.createTable(addresses._name, function (table) {
    table.increments(addresses.addressId);
    table.string(addresses.country, 2).notNullable();
    table.string(addresses.zipcode, 20);
    table.string(addresses.type, 100);
  });
}

async function createCitiesTable() {
  return knex.schema.createTable(cities._name, function (table) {
    table.string(cities.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.integer(cities.addressId).references(addresses.addressId).inTable(addresses._name).onDelete(CASCADE);
    table.text(cities.content).notNullable();
    table.primary([cities.lang, cities.addressId]);
  });
}

async function createComplementsTable() {
  return knex.schema.createTable(complements._name, function (table) {
    table.string(complements.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.integer(complements.addressId).references(addresses.addressId).inTable(addresses._name).onDelete(CASCADE);
    table.primary([complements.lang, complements.addressId]);

    table.text(complements.content).notNullable();
  });
}

async function createRegionsTable() {
  return knex.schema.createTable(regions._name, function (table) {
    table.string(regions.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.integer(regions.addressId).references(addresses.addressId).inTable(addresses._name).onDelete(CASCADE);
    table.primary([regions.lang, regions.addressId]);

    table.text(regions.content).notNullable();
  });
}

async function createStreetsTable() {
  return knex.schema.createTable(streets._name, function (table) {
    table.string(streets.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.integer(streets.addressId).references(addresses.addressId).inTable(addresses._name).onDelete(CASCADE);
    table.primary([streets.lang, streets.addressId]);

    table.text(streets.content).notNullable();
  });
}

async function createContactPointsTable() {
  return knex.schema.createTable(contactPoints._name, function (table) {
    table.increments(contactPoints.contactPointId);

    table.uuid(contactPoints.agentId).references(agents.agentId).inTable(agents._name).notNullable().onDelete(CASCADE);
    table.integer(contactPoints.addressId).references(addresses.addressId).inTable(addresses._name).onDelete(SET_NULL);

    table.jsonb(contactPoints.availableHours);
    table.string(contactPoints.email, 100);
    table.string(contactPoints.telephone, 100);
  });
}

async function createResourceCategoriesTable() {
  return knex.schema.createTable(resourceCategories._name, function (table) {
    table
      .string(resourceCategories.categoryId, 100)
      .references(categories.categoryId)
      .inTable(categories._name)
      .onDelete(CASCADE);
    table
      .uuid(resourceCategories.categorizedResourceId)
      .references(resources.resourceId)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table.primary([resourceCategories.categorizedResourceId, resourceCategories.categoryId]);
  });
}

async function createContributorsTable() {
  return knex.schema.createTable(contributors._name, function (table) {
    table.uuid(contributors.contributorId).references(agents.agentId).inTable(agents._name).onDelete(CASCADE);
    table.uuid(contributors.eventId).references(events.eventId).inTable(events._name).onDelete(CASCADE);
    table.primary([contributors.contributorId, contributors.eventId]);
  });
}

async function createOrganizersTable() {
  return knex.schema.createTable(organizers._name, function (table) {
    table.uuid(organizers.organizerId).references(agents.agentId).inTable(agents._name).onDelete(CASCADE);
    table.uuid(organizers.eventId).references(events.eventId).inTable(events._name).onDelete(CASCADE);
    table.primary([organizers.organizerId, organizers.eventId]);
  });
}

async function createSponsorsTable() {
  return knex.schema.createTable(sponsors._name, function (table) {
    table.uuid(sponsors.sponsorId).references(agents.agentId).inTable(agents._name).onDelete(CASCADE);
    table.uuid(sponsors.eventId).references(events.eventId).inTable(events._name).onDelete(CASCADE);
    table.primary([sponsors.sponsorId, sponsors.eventId]);
  });
}

async function createSponsorsTable() {
  return knex.schema.createTable(sponsors._name, function (table) {
    table.uuid(sponsors.sponsorId).references(agents.agentId).inTable(agents._name).onDelete(CASCADE);
    table.uuid(sponsors.eventId).references(events.eventId).inTable(events._name).onDelete(CASCADE);
    table.primary([sponsors.sponsorId, sponsors.eventId]);
  });
}

async function createMultimediaDescriptionsTable() {
  return knex.schema.createTable(multimediaDescriptions._name, function (table) {
    table
      .uuid(multimediaDescriptions.resourceId)
      .references(resources.resourceId)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table
      .uuid(multimediaDescriptions.mediaObjectId)
      .references(mediaObjects.mediaObjectId)
      .inTable(mediaObjects._name)
      .onDelete(CASCADE);
    table.primary([multimediaDescriptions.resourceId, multimediaDescriptions.mediaObjectId]);
  });
}

async function dropAllTables() {
  return dropTableIfExists(resourceTypes._name)
    .then(() => dropTableIfExists(languageCodes._name))
    .then(() => dropTableIfExists(resources._name))
    .then(() => dropTableIfExists(abstracts._name))
    .then(() => dropTableIfExists(descriptions._name))
    .then(() => dropTableIfExists(names._name))
    .then(() => dropTableIfExists(shortNames._name))
    .then(() => dropTableIfExists(urls._name))
    .then(() => dropTableIfExists(agents._name))
    .then(() => dropTableIfExists(addresses._name))
    .then(() => dropTableIfExists(cities._name))
    .then(() => dropTableIfExists(complements._name))
    .then(() => dropTableIfExists(regions._name))
    .then(() => dropTableIfExists(streets._name))
    .then(() => dropTableIfExists(contactPoints._name))
    .then(() => dropTableIfExists(categories._name))
    .then(() => dropTableIfExists(features._name))
    .then(() => dropTableIfExists(mediaObjects._name))
    .then(() => dropTableIfExists(seriesFrequencies._name))
    .then(() => dropTableIfExists(eventSeries._name))
    .then(() => dropTableIfExists(eventStatus._name))
    .then(() => dropTableIfExists(events._name))
    .then(() => dropTableIfExists(resourceCategories._name))
    .then(() => dropTableIfExists(categoryCoveredTypes._name))
    .then(() => dropTableIfExists(categorySpecializations._name))
    .then(() => dropTableIfExists(featureCoveredTypes._name))
    .then(() => dropTableIfExists(featureSpecializations._name))
    .then(() => dropTableIfExists(contributors._name))
    .then(() => dropTableIfExists(organizers._name))
    .then(() => dropTableIfExists(sponsors._name))
    .then(() => dropTableIfExists(multimediaDescriptions._name));
}

async function createAllTables() {
  return createResourceTypesTable()
    .then(() => createResourcesTable())
    .then(() => createAgentsTable())
    .then(() => createCategoriesTable())
    .then(() => createFeaturesTable())
    .then(() => createMediaObjectsTable())
    .then(() => createSeriesFrequenciesTable())
    .then(() => createEventSeriesTable())
    .then(() => createEventStatusTable())
    .then(() => createEventsTable())
    .then(() => createLanguageCodesTable())
    .then(() => createAbstractsTable())
    .then(() => createDescriptionsTable())
    .then(() => createNamesTable())
    .then(() => createShortNamesTable())
    .then(() => createUrlsTable())
    .then(() => createAddressesTable())
    .then(() => createCitiesTable())
    .then(() => createComplementsTable())
    .then(() => createRegionsTable())
    .then(() => createStreetsTable())
    .then(() => createContactPointsTable())
    .then(() => createResourceCategoriesTable())
    .then(() => createCategoryCoveredTypesTable())
    .then(() => createCategorySpecializationsTable())
    .then(() => createFeatureCoveredTypesTable())
    .then(() => createFeatureSpecializationsTable())
    .then(() => createContributorsTable())
    .then(() => createOrganizersTable())
    .then(() => createSponsorsTable())
    .then(() => createMultimediaDescriptionsTable());
}

setupDatabase()
  .then(() => dropAllTables())
  .then(() => createAllTables())
  .catch((err) => console.log(err))
  .finally(() => knex.destroy());
