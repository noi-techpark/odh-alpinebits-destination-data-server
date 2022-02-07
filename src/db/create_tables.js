const { schemas, views } = require(".");
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
      .then(() => dropAllViews())
      .then(() => dropAllTables())
      .then(() => createAllTables())
      .then(() => createAllViews())
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

function dropViewIfExists(tableName) {
  return connection.raw(`DROP VIEW IF EXISTS ${tableName} CASCADE;`);
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
    table.uuid(events.seriesId).references(eventSeries.id).inTable(eventSeries._name).notNullable().onDelete(SET_NULL);
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

function createDeleteCategoryResourceTrigger() {
  const categoriesTable = categories._name;
  const categoriesId = categories.resourceId;

  const resourcesTable = resources._name;
  const resourcesId = resourcesTable + "." + resources.id;

  return connection.raw(`
    CREATE OR REPLACE FUNCTION delete_category_resource()
      RETURNS TRIGGER AS
    $$
    BEGIN
      DELETE FROM ${resourcesTable} WHERE OLD.${categoriesId} = ${resourcesId};
      RETURN OLD;
    END;
    $$ LANGUAGE PLPGSQL;

    DROP TRIGGER IF EXISTS category_resource_deletion ON ${categoriesTable};

    CREATE TRIGGER category_resource_deletion
      AFTER DELETE
      ON ${categoriesTable}
      FOR EACH ROW
      EXECUTE PROCEDURE delete_category_resource();
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

function createAbstractObjectsView() {
  return connection.raw(`
  CREATE VIEW abstract_objects AS
    SELECT resource_id AS "id",
        COALESCE(
          json_object_agg(DISTINCT lang, content) FILTER (WHERE lang IS NOT NULL)
        )::json AS "abstract"
      FROM abstracts
      GROUP BY resource_id;
  `);
}

function createDescriptionObjectsView() {
  return connection.raw(`
  CREATE VIEW description_objects AS
    SELECT resource_id AS "id",
        COALESCE(
          json_object_agg(DISTINCT lang, content) FILTER (WHERE lang IS NOT NULL)
        )::json AS "description"
      FROM descriptions
      GROUP BY resource_id;
  `);
}

function createNameObjectsView() {
  return connection.raw(`
  CREATE VIEW name_objects AS
    SELECT resource_id AS "id",
        COALESCE(
          json_object_agg(DISTINCT lang, content) FILTER (WHERE lang IS NOT NULL)
        )::json AS "name"
      FROM names
      GROUP BY resource_id;
  `);
}

function createShortNameObjectsView() {
  return connection.raw(`
  CREATE VIEW short_name_objects AS
    SELECT resource_id AS "id",
        COALESCE(
          json_object_agg(DISTINCT lang, content) FILTER (WHERE lang IS NOT NULL)
        )::json AS "short_name"
      FROM short_names
      GROUP BY resource_id;
  `);
}

function createUrlObjectsView() {
  return connection.raw(`
  CREATE VIEW url_objects AS
    SELECT resource_id AS "id",
        COALESCE(
          json_object_agg(DISTINCT lang, content) FILTER (WHERE lang IS NOT NULL)
        )::json AS "url"
      FROM urls
      GROUP BY resource_id;
  `);
}

function createCategoriesArrayView() {
  return connection.raw(`
  CREATE VIEW categories_arrays AS
    SELECT categorized_resource_id AS "id",
        json_agg(
          json_build_object(
            'id',
            category_id,
            'type',
            'categories'
          )
        ) AS "categories"
      FROM resource_categories
      GROUP BY categorized_resource_id;
  `);
}

function createMultimediaDescriptionsArraysView() {
  return connection.raw(`
  CREATE VIEW multimedia_descriptions_arrays AS
    SELECT resource_id AS "id",
        json_agg(
          json_build_object(
            'id',
            media_object_id,
            'type',
            'mediaObjects'
          )
        ) AS "media"
      FROM multimedia_descriptions
      GROUP BY resource_id;
  `);
}

function createCityObjectsView() {
  return connection.raw(`
  CREATE VIEW city_objects AS
    SELECT address_id AS "id",
        COALESCE(
          json_object_agg(DISTINCT lang, content) FILTER (WHERE lang IS NOT NULL)
        )::json AS "city"
      FROM cities
      GROUP BY address_id;
  `);
}

function createComplementObjectsView() {
  return connection.raw(`
  CREATE VIEW complement_objects AS
    SELECT address_id AS "id",
        COALESCE(
          json_object_agg(DISTINCT lang, content) FILTER (WHERE lang IS NOT NULL)
        )::json AS "complement"
      FROM complements
      GROUP BY address_id;
  `);
}

function createRegionObjectsView() {
  return connection.raw(`
  CREATE VIEW region_objects AS
    SELECT address_id AS "id",
        COALESCE(
          json_object_agg(DISTINCT lang, content) FILTER (WHERE lang IS NOT NULL)
        )::json AS "region"
      FROM regions
      GROUP BY address_id;
  `);
}

function createStreetObjectsView() {
  return connection.raw(`
  CREATE VIEW street_objects AS
    SELECT address_id AS "id",
        COALESCE(
          json_object_agg(DISTINCT lang, content) FILTER (WHERE lang IS NOT NULL)
        )::json AS "street"
      FROM streets
      GROUP BY address_id;
  `);
}

function createAddressObjectsView() {
  return connection.raw(`
  CREATE VIEW address_objects AS
    SELECT addresses.id,
        country,
        zipcode,
        addresses.type,
        COALESCE(city_objects.city, 'null') AS "city",
        COALESCE(complement_objects.complement, 'null') AS "complement",
        COALESCE(region_objects.region, 'null') AS "region",
        COALESCE(street_objects.street, 'null') AS "street"
      FROM addresses
      LEFT JOIN city_objects ON city_objects.id = addresses.id
      LEFT JOIN complement_objects ON complement_objects.id = addresses.id
      LEFT JOIN region_objects ON region_objects.id = addresses.id
      LEFT JOIN street_objects ON street_objects.id = addresses.id;
  `);
}

function createResourceObjectsView() {
  return connection.raw(`
  CREATE VIEW resource_objects AS
    SELECT resources.id,
          resources.type,
          data_provider,
          last_update,
          abstract_objects.abstract,
          description_objects.description,
          name_objects.name,
          short_name_objects.short_name,
          COALESCE(to_json(resources.simple_url), url_objects.url) AS "url",
          categories_arrays.categories,
          multimedia_descriptions_arrays.media
        FROM resources
        LEFT JOIN abstract_objects ON abstract_objects.id = resources.id
        LEFT JOIN description_objects ON description_objects.id = resources.id
        LEFT JOIN name_objects ON name_objects.id = resources.id
        LEFT JOIN short_name_objects ON short_name_objects.id = resources.id
        LEFT JOIN url_objects ON url_objects.id = resources.id
        LEFT JOIN categories_arrays ON categories_arrays.id = resources.id
        LEFT JOIN multimedia_descriptions_arrays ON multimedia_descriptions_arrays.id = resources.id;
  `);
}

function createAllViews() {
  return createAbstractObjectsView()
    .then(() => createDescriptionObjectsView())
    .then(() => createNameObjectsView())
    .then(() => createShortNameObjectsView())
    .then(() => createUrlObjectsView())
    .then(() => createCategoriesArrayView())
    .then(() => createMultimediaDescriptionsArraysView())
    .then(() => createCityObjectsView())
    .then(() => createComplementObjectsView())
    .then(() => createRegionObjectsView())
    .then(() => createStreetObjectsView())
    .then(() => createAddressObjectsView())
    .then(() => createResourceObjectsView());
}

function dropAllViews() {
  return Promise.all([
    dropViewIfExists(views.abstractObjects._name),
    dropViewIfExists(views.descriptionObjects._name),
    dropViewIfExists(views.nameObjects._name),
    dropViewIfExists(views.shortNameObjects._name),
    dropViewIfExists(views.urlObjects._name),
    dropViewIfExists(views.categoriesArrays._name),
    dropViewIfExists(views.multimediaDescriptionsArrays._name),
    dropViewIfExists(views.cityObjects._name),
    dropViewIfExists(views.complementObjects._name),
    dropViewIfExists(views.regionObjects._name),
    dropViewIfExists(views.streetObjects._name),
    dropViewIfExists(views.addressObjects._name),
    dropViewIfExists(views.resourceObjects._name),
  ]);
}

function createAllTriggers() {
  return Promise.all([
    createDeleteContactPointAddressTrigger(),
    createDeleteCategoryResourceTrigger(),
    createSyncLastUpdateTrigger(),
  ]);
}

function dropAllTables() {
  return Promise.all([
    dropTableIfExists(resourceTypes._name),
    dropTableIfExists(languageCodes._name),
    dropTableIfExists(resources._name),
    dropTableIfExists(abstracts._name),
    dropTableIfExists(descriptions._name),
    dropTableIfExists(names._name),
    dropTableIfExists(shortNames._name),
    dropTableIfExists(urls._name),
    dropTableIfExists(agents._name),
    dropTableIfExists(addresses._name),
    dropTableIfExists(cities._name),
    dropTableIfExists(complements._name),
    dropTableIfExists(regions._name),
    dropTableIfExists(streets._name),
    dropTableIfExists(contactPoints._name),
    dropTableIfExists(categories._name),
    dropTableIfExists(features._name),
    dropTableIfExists(mediaObjects._name),
    dropTableIfExists(seriesFrequencies._name),
    dropTableIfExists(eventSeries._name),
    dropTableIfExists(eventStatus._name),
    dropTableIfExists(events._name),
    dropTableIfExists(resourceCategories._name),
    dropTableIfExists(categoryCoveredTypes._name),
    dropTableIfExists(categorySpecializations._name),
    dropTableIfExists(featureCoveredTypes._name),
    dropTableIfExists(featureSpecializations._name),
    dropTableIfExists(contributors._name),
    dropTableIfExists(organizers._name),
    dropTableIfExists(sponsors._name),
    dropTableIfExists(multimediaDescriptions._name),
  ]);
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
