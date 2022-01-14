const { schemas } = require(".");
const knex = require("./connect");
let connection;

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

knex
  .transaction(function (trx) {
    connection = trx;

    setupDatabase()
      .then(() => dropAllTables())
      .then(() => createAllTables())
      .then(() => createAllTriggers())
      .then(() => {
        console.log("Tables successfully (re)created.");
        return connection.commit();
      })
      .catch((err) => {
        console.error("Failed to (re)create tables.");
        console.log(err);
        return connection.rollback();
      })
      .finally(() => (connection = null));
  })
  .finally(() => knex.destroy());

function setupDatabase() {
  return addUuidGenerator();
}

function addUuidGenerator() {
  return connection.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
}

function dropTableIfExists(tableName) {
  return connection.raw(`DROP TABLE IF EXISTS ${tableName} CASCADE;`);
}

function createResourceTypesTable() {
  return connection.schema.createTable(resourceTypes._name, function (table) {
    table.string(resourceTypes.type, 50).primary();
    table.string(resourceTypes.title, 50);
  });
}

function createResourcesTable() {
  return connection.raw(`
    CREATE TABLE ${resources._name} (
      ${resources.id} UUID DEFAULT ${UUID_GENERATE} PRIMARY KEY,
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

function createAgentsTable() {
  return connection.schema.createTable(agents._name, function (table) {
    table.uuid(agents.id).primary().references(resources.id).inTable(resources._name).onDelete(CASCADE);
  });
}

function createCategoriesTable() {
  return connection.schema.createTable(categories._name, function (table) {
    table.string(categories.id, 100).primary();
    table.uuid(categories.resourceId).notNullable().references(resources.id).inTable(resources._name).onDelete(CASCADE);
    table.string(categories.namespace, 50).notNullable();
  });
}

function createCategoryCoveredTypesTable() {
  return connection.schema.createTable(categoryCoveredTypes._name, function (table) {
    table
      .string(categoryCoveredTypes.categoryId, 100)
      .references(categories.id)
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

function createCategorySpecializationsTable() {
  return connection.schema.createTable(categorySpecializations._name, function (table) {
    table
      .string(categorySpecializations.parentId, 100)
      .references(categories.id)
      .inTable(categories._name)
      .onDelete(CASCADE);
    table
      .string(categorySpecializations.childId, 100)
      .references(categories.id)
      .inTable(categories._name)
      .onDelete(CASCADE);
    table.primary([categorySpecializations.parentId, categorySpecializations.childId]);
  });
}

function createFeaturesTable() {
  // TODO: update the relationship to snowparks
  return connection.schema.createTable(features._name, function (table) {
    table.string(features.id, 100).primary();
    table.uuid(features.resourceId).notNullable().references(resources.id).inTable(resources._name).onDelete(CASCADE);
    table.string(features.namespace, 50).notNullable();
  });
}

// At the moment, this should always be "snowparks"
function createFeatureCoveredTypesTable() {
  return connection.schema.createTable(featureCoveredTypes._name, function (table) {
    table.string(featureCoveredTypes.featureId, 100).references(features.id).inTable(features._name).onDelete(CASCADE);
    table
      .string(featureCoveredTypes.type, 50)
      .references(resourceTypes.type)
      .inTable(resourceTypes._name)
      .onDelete(CASCADE);
    table.primary([featureCoveredTypes.featureId, featureCoveredTypes.type]);
  });
}

function createFeatureSpecializationsTable() {
  return connection.schema.createTable(featureSpecializations._name, function (table) {
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

function createMediaObjectsTable() {
  return connection.schema.createTable(mediaObjects._name, function (table) {
    table.uuid(mediaObjects.id).primary().references(resources.id).inTable(resources._name).onDelete(CASCADE);
    table.uuid(mediaObjects.copyrightOwnerId).references(agents.id).inTable(agents._name).onDelete(SET_NULL);
    table.string(mediaObjects.contentType);
    table.integer(mediaObjects.duration);
    table.integer(mediaObjects.height);
    table.string(mediaObjects.license, 50);
    table.integer(mediaObjects.width);
  });
}

function createSeriesFrequenciesTable() {
  return connection.schema.createTable(seriesFrequencies._name, function (table) {
    table.string(seriesFrequencies.frequency, 50).primary();
    table.string(seriesFrequencies.title, 50);
  });
}

function createEventSeriesTable() {
  return connection.schema.createTable(eventSeries._name, function (table) {
    table.uuid(eventSeries.id).primary().references(resources.id).inTable(resources._name).onDelete(CASCADE);
    table
      .string(eventSeries.frequency, 50)
      .references(seriesFrequencies.frequency)
      .inTable(seriesFrequencies._name)
      .onDelete(SET_NULL);
  });
}

function createEventStatusTable() {
  return connection.schema.createTable(eventStatus._name, function (table) {
    table.string(eventStatus.status, 50).primary();
    table.string(eventStatus.title, 50);
  });
}

function createEventsTable() {
  return connection.schema.createTable(events._name, function (table) {
    table.uuid(events.id).primary().references(resources.id).inTable(resources._name).onDelete(CASCADE);
    table.integer(events.capacity);
    table.timestamp(events.endDate, { useTz: true });
    table.timestamp(events.startDate, { useTz: true });
    table.uuid(events.parentId).references(events.id).inTable(events._name).onDelete(SET_NULL);
    table.uuid(events.publisherId).references(agents.id).inTable(agents._name).notNullable().onDelete(CASCADE);
    table.string(events.status, 50).references(eventStatus.status).inTable(eventStatus._name).onDelete(SET_NULL);
  });
}

function createLanguageCodesTable() {
  return connection.schema.createTable(languageCodes._name, function (table) {
    table.string(languageCodes.lang, 3).primary();
    table.string(languageCodes.title, 100);
  });
}

function createAbstractsTable() {
  return connection.schema.createTable(abstracts._name, function (table) {
    table.string(abstracts.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.uuid(abstracts.resourceId).references(resources.id).inTable(resources._name).onDelete(CASCADE);
    table.text(abstracts.content).notNullable();
    table.primary([abstracts.lang, abstracts.resourceId]);
  });
}

function createDescriptionsTable() {
  return connection.schema.createTable(descriptions._name, function (table) {
    table.string(descriptions.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.uuid(descriptions.resourceId).references(resources.id).inTable(resources._name).onDelete(CASCADE);
    table.text(descriptions.content).notNullable();
    table.primary([descriptions.lang, descriptions.resourceId]);
  });
}

function createNamesTable() {
  return connection.schema.createTable(names._name, function (table) {
    table.string(names.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.uuid(names.resourceId).references(resources.id).inTable(resources._name).onDelete(CASCADE);
    table.text(names.content).notNullable();
    table.primary([names.lang, names.resourceId]);
  });
}

function createShortNamesTable() {
  return connection.schema.createTable(shortNames._name, function (table) {
    table.string(shortNames.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.uuid(shortNames.resourceId).references(resources.id).inTable(resources._name).onDelete(CASCADE);
    table.text(shortNames.content).notNullable();
    table.primary([shortNames.lang, shortNames.resourceId]);
  });
}

function createUrlsTable() {
  return connection.schema.createTable(urls._name, function (table) {
    table.string(urls.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.uuid(urls.resourceId).references(resources.id).inTable(resources._name).onDelete(CASCADE);
    table.text(urls.content).notNullable();
    table.primary([urls.lang, urls.resourceId]);
  });
}

function createAddressesTable() {
  return connection.schema.createTable(addresses._name, function (table) {
    table.increments(addresses.id);
    table.string(addresses.country, 2).notNullable();
    table.string(addresses.zipcode, 20);
    table.string(addresses.type, 100);
  });
}

function createCitiesTable() {
  return connection.schema.createTable(cities._name, function (table) {
    table.string(cities.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.integer(cities.addressId).references(addresses.id).inTable(addresses._name).onDelete(CASCADE);
    table.text(cities.content).notNullable();
    table.primary([cities.lang, cities.addressId]);
  });
}

function createComplementsTable() {
  return connection.schema.createTable(complements._name, function (table) {
    table.string(complements.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.integer(complements.addressId).references(addresses.id).inTable(addresses._name).onDelete(CASCADE);
    table.primary([complements.lang, complements.addressId]);

    table.text(complements.content).notNullable();
  });
}

function createRegionsTable() {
  return connection.schema.createTable(regions._name, function (table) {
    table.string(regions.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.integer(regions.addressId).references(addresses.id).inTable(addresses._name).onDelete(CASCADE);
    table.primary([regions.lang, regions.addressId]);

    table.text(regions.content).notNullable();
  });
}

function createStreetsTable() {
  return connection.schema.createTable(streets._name, function (table) {
    table.string(streets.lang, 3).references(languageCodes.lang).inTable(languageCodes._name).onDelete(CASCADE);
    table.integer(streets.addressId).references(addresses.id).inTable(addresses._name).onDelete(CASCADE);
    table.primary([streets.lang, streets.addressId]);

    table.text(streets.content).notNullable();
  });
}

function createContactPointsTable() {
  return connection.schema.createTable(contactPoints._name, function (table) {
    table.increments(contactPoints.id);

    table.uuid(contactPoints.agentId).references(agents.id).inTable(agents._name).notNullable().onDelete(CASCADE);
    table.integer(contactPoints.addressId).references(addresses.id).inTable(addresses._name).onDelete(SET_NULL);

    table.jsonb(contactPoints.availableHours);
    table.string(contactPoints.email, 100);
    table.string(contactPoints.telephone, 100);
  });
}

function createResourceCategoriesTable() {
  return connection.schema.createTable(resourceCategories._name, function (table) {
    table
      .string(resourceCategories.categoryId, 100)
      .references(categories.id)
      .inTable(categories._name)
      .onDelete(CASCADE);
    table
      .uuid(resourceCategories.categorizedResourceId)
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table.primary([resourceCategories.categorizedResourceId, resourceCategories.categoryId]);
  });
}

function createContributorsTable() {
  return connection.schema.createTable(contributors._name, function (table) {
    table.uuid(contributors.contributorId).references(agents.id).inTable(agents._name).onDelete(CASCADE);
    table.uuid(contributors.eventId).references(events.id).inTable(events._name).onDelete(CASCADE);
    table.primary([contributors.contributorId, contributors.eventId]);
  });
}

function createOrganizersTable() {
  return connection.schema.createTable(organizers._name, function (table) {
    table.uuid(organizers.organizerId).references(agents.id).inTable(agents._name).onDelete(CASCADE);
    table.uuid(organizers.eventId).references(events.id).inTable(events._name).onDelete(CASCADE);
    table.primary([organizers.organizerId, organizers.eventId]);
  });
}

function createSponsorsTable() {
  return connection.schema.createTable(sponsors._name, function (table) {
    table.uuid(sponsors.sponsorId).references(agents.id).inTable(agents._name).onDelete(CASCADE);
    table.uuid(sponsors.eventId).references(events.id).inTable(events._name).onDelete(CASCADE);
    table.primary([sponsors.sponsorId, sponsors.eventId]);
  });
}

function createSponsorsTable() {
  return connection.schema.createTable(sponsors._name, function (table) {
    table.uuid(sponsors.sponsorId).references(agents.id).inTable(agents._name).onDelete(CASCADE);
    table.uuid(sponsors.eventId).references(events.id).inTable(events._name).onDelete(CASCADE);
    table.primary([sponsors.sponsorId, sponsors.eventId]);
  });
}

function createMultimediaDescriptionsTable() {
  return connection.schema.createTable(multimediaDescriptions._name, function (table) {
    table.uuid(multimediaDescriptions.resourceId).references(resources.id).inTable(resources._name).onDelete(CASCADE);
    table
      .uuid(multimediaDescriptions.mediaObjectId)
      .references(mediaObjects.id)
      .inTable(mediaObjects._name)
      .onDelete(CASCADE);
    table.primary([multimediaDescriptions.resourceId, multimediaDescriptions.mediaObjectId]);
  });
}

function createDeleteContactPointAddressTrigger() {
  return connection.raw(`
    CREATE OR REPLACE FUNCTION delete_contact_points_address()
      RETURNS TRIGGER AS
    $$
    BEGIN
      DELETE FROM ${addresses._name} WHERE OLD.${contactPoints.addressId} = ${addresses._name}.${addresses.id};
      RETURN OLD;
    END;
    $$ LANGUAGE PLPGSQL;

    DROP TRIGGER IF EXISTS contact_point_address_deletion ON ${contactPoints._name};

    CREATE TRIGGER contact_point_address_deletion
      AFTER DELETE
      ON ${contactPoints._name}
      FOR EACH ROW
      EXECUTE PROCEDURE delete_contact_points_address();
  `);
}

function createSyncLastUpdateTrigger() {
  return connection.raw(`
    CREATE OR REPLACE FUNCTION sync_last_update() RETURNS trigger AS $$
    BEGIN
      NEW.${resources.lastUpdate} := NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER
      sync_last_update
    BEFORE UPDATE ON
      ${resources._name}
    FOR EACH ROW EXECUTE PROCEDURE
      sync_last_update();
  `);
}

function createAllTriggers() {
  return createDeleteContactPointAddressTrigger().then(() => createSyncLastUpdateTrigger());
}

function dropAllTables() {
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

function createAllTables() {
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
