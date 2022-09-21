const { schemas, views } = require(".");
const knex = require("./connect");
let connection;

const {
  abstracts,
  addresses,
  agents,
  areaLifts,
  areaSkiSlopes,
  areaSnowparks,
  categoryCoveredTypes,
  categorySpecializations,
  categories,
  cities,
  complements,
  connections,
  contactPoints,
  contributors,
  descriptions,
  eventStatus,
  events,
  eventSeries,
  eventVenues,
  features,
  featureCoveredTypes,
  featureSpecializations,
  howToArrive,
  languageCodes,
  lifts,
  mediaObjects,
  mountainAreas,
  multimediaDescriptions,
  names,
  organizers,
  places,
  regions,
  resourceCategories,
  resourceFeatures,
  resources,
  resourceTypes,
  seriesFrequencies,
  shortNames,
  skiSlopes,
  snowConditions,
  snowparks,
  sponsors,
  streets,
  subAreas,
  venues,
  urls,
  participationUrls,
  registrationUrls,
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
      ${resources.id} VARCHAR ( 100 ) DEFAULT ${UUID_GENERATE} PRIMARY KEY,
      ${resources.type} VARCHAR ( 50 ) NOT NULL,
      ${resources.odhId} VARCHAR ( 100 ),
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
    table
      .string(agents.id, 100)
      .primary()
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);
  });
}

function createCategoriesTable() {
  return connection.schema.createTable(categories._name, function (table) {
    table
      .string(categories.id, 100)
      .primary()
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table.string(categories.namespace, 100).notNullable();
  });
}

function createCategoryCoveredTypesTable() {
  return connection.schema.createTable(
    categoryCoveredTypes._name,
    function (table) {
      table
        .string(categoryCoveredTypes.categoryId, 100)
        .references(categories.id)
        .inTable(categories._name)
        .onDelete(CASCADE);
      table
        .string(categoryCoveredTypes.type, 100)
        .references(resourceTypes.type)
        .inTable(resourceTypes._name)
        .onDelete(CASCADE);
      table.primary([
        categoryCoveredTypes.categoryId,
        categoryCoveredTypes.type,
      ]);
    }
  );
}

function createCategorySpecializationsTable() {
  return connection.schema.createTable(
    categorySpecializations._name,
    function (table) {
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
      table.primary([
        categorySpecializations.parentId,
        categorySpecializations.childId,
      ]);
    }
  );
}

function createFeaturesTable() {
  // TODO: update the relationship to snowparks
  return connection.schema.createTable(features._name, function (table) {
    table
      .string(features.id, 100)
      .primary()
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table.string(features.namespace, 100).notNullable();
  });
}

// At the moment, this should always be "snowparks"
function createFeatureCoveredTypesTable() {
  return connection.schema.createTable(
    featureCoveredTypes._name,
    function (table) {
      table
        .string(featureCoveredTypes.featureId, 100)
        .references(features.id)
        .inTable(features._name)
        .onDelete(CASCADE);
      table
        .string(featureCoveredTypes.type, 100)
        .references(resourceTypes.type)
        .inTable(resourceTypes._name)
        .onDelete(CASCADE);
      table.primary([featureCoveredTypes.featureId, featureCoveredTypes.type]);
    }
  );
}

function createFeatureSpecializationsTable() {
  return connection.schema.createTable(
    featureSpecializations._name,
    function (table) {
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
      table.primary([
        featureSpecializations.parentId,
        featureSpecializations.childId,
      ]);
    }
  );
}

function createMediaObjectsTable() {
  return connection.schema.createTable(mediaObjects._name, function (table) {
    table
      .string(mediaObjects.id, 100)
      .primary()
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table
      .string(mediaObjects.copyrightOwnerId, 100)
      .references(agents.id)
      .inTable(agents._name)
      .onDelete(SET_NULL);
    table.string(mediaObjects.contentType);
    table.integer(mediaObjects.duration);
    table.integer(mediaObjects.height);
    table.string(mediaObjects.license, 100);
    table.integer(mediaObjects.width);
  });
}

function createSeriesFrequenciesTable() {
  return connection.schema.createTable(
    seriesFrequencies._name,
    function (table) {
      table.string(seriesFrequencies.frequency, 50).primary();
      table.string(seriesFrequencies.title, 50);
    }
  );
}

function createEventSeriesTable() {
  return connection.schema.createTable(eventSeries._name, function (table) {
    table
      .string(eventSeries.id, 100)
      .primary()
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);
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
    table
      .string(events.id, 100)
      .primary()
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table.timestamp(events.endDate, { useTz: true });
    table.timestamp(events.startDate, { useTz: true });
    table
      .string(events.parentId, 100)
      .references(events.id)
      .inTable(events._name)
      .onDelete(SET_NULL);
    table
      .string(events.publisherId, 100)
      .references(agents.id)
      .inTable(agents._name)
      .notNullable()
      .onDelete(CASCADE);
    table
      .string(events.seriesId, 100)
      .references(eventSeries.id)
      .inTable(eventSeries._name)
      .onDelete(SET_NULL);
    table
      .string(events.status, 50)
      .references(eventStatus.status)
      .inTable(eventStatus._name)
      .onDelete(SET_NULL);
    table.integer(events.inPersonCapacity);
    table.integer(events.onlineCapacity);
    table.text(events.simpleParticipationUrl);
    table.text(events.simpleRegistrationUrl);
    table.boolean(events.recorded);
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
    table
      .string(abstracts.lang, 3)
      .references(languageCodes.lang)
      .inTable(languageCodes._name)
      .onDelete(CASCADE);
    table
      .string(abstracts.resourceId, 100)
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table.text(abstracts.content).notNullable();
    table.primary([abstracts.lang, abstracts.resourceId]);
  });
}

function createDescriptionsTable() {
  return connection.schema.createTable(descriptions._name, function (table) {
    table
      .string(descriptions.lang, 3)
      .references(languageCodes.lang)
      .inTable(languageCodes._name)
      .onDelete(CASCADE);
    table
      .string(descriptions.resourceId, 100)
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table.text(descriptions.content).notNullable();
    table.primary([descriptions.lang, descriptions.resourceId]);
  });
}

function createNamesTable() {
  return connection.schema.createTable(names._name, function (table) {
    table
      .string(names.lang, 3)
      .references(languageCodes.lang)
      .inTable(languageCodes._name)
      .onDelete(CASCADE);
    table
      .string(names.resourceId, 100)
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table.text(names.content).notNullable();
    table.primary([names.lang, names.resourceId]);
  });
}

function createShortNamesTable() {
  return connection.schema.createTable(shortNames._name, function (table) {
    table
      .string(shortNames.lang, 3)
      .references(languageCodes.lang)
      .inTable(languageCodes._name)
      .onDelete(CASCADE);
    table
      .string(shortNames.resourceId, 100)
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table.text(shortNames.content).notNullable();
    table.primary([shortNames.lang, shortNames.resourceId]);
  });
}

function createUrlsTable() {
  return connection.schema.createTable(urls._name, function (table) {
    table
      .string(urls.lang, 3)
      .references(languageCodes.lang)
      .inTable(languageCodes._name)
      .onDelete(CASCADE);
    table
      .string(urls.resourceId, 100)
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table.text(urls.content).notNullable();
    table.primary([urls.lang, urls.resourceId]);
  });
}

function createParticipationUrlsTable() {
  return connection.schema.createTable(
    participationUrls._name,
    function (table) {
      table
        .string(participationUrls.lang, 3)
        .references(languageCodes.lang)
        .inTable(languageCodes._name)
        .onDelete(CASCADE);
      table
        .string(participationUrls.eventId, 100)
        .references(events.id)
        .inTable(events._name)
        .onDelete(CASCADE);
      table.text(participationUrls.content).notNullable();
      table.primary([participationUrls.lang, participationUrls.eventId]);
    }
  );
}

function createRegistrationUrlsTable() {
  return connection.schema.createTable(
    registrationUrls._name,
    function (table) {
      table
        .string(registrationUrls.lang, 3)
        .references(languageCodes.lang)
        .inTable(languageCodes._name)
        .onDelete(CASCADE);
      table
        .string(registrationUrls.eventId, 100)
        .references(events.id)
        .inTable(events._name)
        .onDelete(CASCADE);
      table.text(registrationUrls.content).notNullable();
      table.primary([registrationUrls.lang, registrationUrls.eventId]);
    }
  );
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
    table
      .string(cities.lang, 3)
      .references(languageCodes.lang)
      .inTable(languageCodes._name)
      .onDelete(CASCADE);
    table
      .integer(cities.addressId)
      .references(addresses.id)
      .inTable(addresses._name)
      .onDelete(CASCADE);
    table.text(cities.content).notNullable();
    table.primary([cities.lang, cities.addressId]);
  });
}

function createComplementsTable() {
  return connection.schema.createTable(complements._name, function (table) {
    table
      .string(complements.lang, 3)
      .references(languageCodes.lang)
      .inTable(languageCodes._name)
      .onDelete(CASCADE);
    table
      .integer(complements.addressId)
      .references(addresses.id)
      .inTable(addresses._name)
      .onDelete(CASCADE);
    table.primary([complements.lang, complements.addressId]);

    table.text(complements.content).notNullable();
  });
}

function createRegionsTable() {
  return connection.schema.createTable(regions._name, function (table) {
    table
      .string(regions.lang, 3)
      .references(languageCodes.lang)
      .inTable(languageCodes._name)
      .onDelete(CASCADE);
    table
      .integer(regions.addressId)
      .references(addresses.id)
      .inTable(addresses._name)
      .onDelete(CASCADE);
    table.primary([regions.lang, regions.addressId]);

    table.text(regions.content).notNullable();
  });
}

function createStreetsTable() {
  return connection.schema.createTable(streets._name, function (table) {
    table
      .string(streets.lang, 3)
      .references(languageCodes.lang)
      .inTable(languageCodes._name)
      .onDelete(CASCADE);
    table
      .integer(streets.addressId)
      .references(addresses.id)
      .inTable(addresses._name)
      .onDelete(CASCADE);
    table.primary([streets.lang, streets.addressId]);

    table.text(streets.content).notNullable();
  });
}

function createContactPointsTable() {
  return connection.schema.createTable(contactPoints._name, function (table) {
    table.increments(contactPoints.id);

    table
      .string(contactPoints.agentId, 100)
      .references(agents.id)
      .inTable(agents._name)
      .notNullable()
      .onDelete(CASCADE);
    table
      .integer(contactPoints.addressId)
      .references(addresses.id)
      .inTable(addresses._name)
      .onDelete(SET_NULL);

    table.jsonb(contactPoints.availableHours);
    table.string(contactPoints.email, 100);
    table.string(contactPoints.telephone, 100);
  });
}

// TODO: review whether all columns in places should be nullable
function createPlacesTable() {
  return connection.schema.createTable(places._name, function (table) {
    table
      .string(places.id, 100)
      .primary()
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);

    table
      .integer(places.addressId)
      .references(addresses.id)
      .inTable(addresses._name)
      .onDelete(SET_NULL);

    table.jsonb(places.geometries);
    table.integer(places.length);
    table.integer(places.maxAltitude);
    table.integer(places.minAltitude);
    table.jsonb(places.openingHours);
  });
}

function createHowToArriveTable() {
  return connection.schema.createTable(howToArrive._name, function (table) {
    table
      .string(howToArrive.lang, 3)
      .references(languageCodes.lang)
      .inTable(languageCodes._name)
      .onDelete(CASCADE);
    table
      .string(howToArrive.placeId, 100)
      .references(places.id)
      .inTable(places._name)
      .onDelete(CASCADE);
    table.primary([howToArrive.lang, howToArrive.placeId]);

    table.text(howToArrive.content).notNullable();
  });
}

function createSnowConditionsTable() {
  return connection.schema.createTable(snowConditions._name, function (table) {
    table
      .string(snowConditions.id, 100)
      .primary()
      .references(places.id)
      .inTable(places._name)
      .notNullable()
      .onDelete(CASCADE);

    table.integer(snowConditions.baseSnow).notNullable();
    table.integer(snowConditions.baseSnowRangeLower);
    table.integer(snowConditions.baseSnowRangeUpper);
    table.boolean(snowConditions.groomed);
    table.integer(snowConditions.latestStorm);
    table.timestamp(snowConditions.obtainedIn);
    table.string(snowConditions.primarySurface, 50).notNullable();
    table.string(snowConditions.secondarySurface, 50);
    table.boolean(snowConditions.snowMaking);
    table.integer(snowConditions.snowOverNight);
  });
}

// TODO: add propagation trigger to delete place
function createVenuesTable() {
  return connection.schema.createTable(venues._name, function (table) {
    table
      .string(venues.id, 100)
      .primary()
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);
  });
}

function createEventVenuesTable() {
  return connection.schema.createTable(eventVenues._name, function (table) {
    table
      .string(eventVenues.venueId, 100)
      .references(venues.id)
      .inTable(venues._name)
      .onDelete(CASCADE);
    table
      .string(eventVenues.eventId, 100)
      .references(events.id)
      .inTable(events._name)
      .onDelete(CASCADE);
    table.primary([eventVenues.venueId, eventVenues.eventId]);
  });
}

function createLiftsTable() {
  return connection.schema.createTable(lifts._name, function (table) {
    table
      .string(lifts.id, 100)
      .primary()
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);

    table.integer(lifts.capacity);
    table.integer(lifts.personsPerChair);
  });
}

function createMountainAreasTable() {
  return connection.schema.createTable(mountainAreas._name, function (table) {
    table
      .string(mountainAreas.id, 100)
      .primary()
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);
    table
      .string(mountainAreas.areaOwnerId, 100)
      .references(agents.id)
      .inTable(agents._name);

    table.integer(mountainAreas.area);
    table.integer(mountainAreas.totalParkArea);
    table.integer(mountainAreas.totalSlopeLength);
  });
}

function createSkiSlopesTable() {
  return connection.schema.createTable(skiSlopes._name, function (table) {
    table
      .string(skiSlopes.id, 100)
      .primary()
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);

    table.string(skiSlopes.difficultyEu, 20);
    table.string(skiSlopes.difficultyUs, 20);
  });
}

function createSnowparksTable() {
  return connection.schema.createTable(snowparks._name, function (table) {
    table
      .string(snowparks.id, 100)
      .primary()
      .references(resources.id)
      .inTable(resources._name)
      .onDelete(CASCADE);

    table.string(snowparks.difficulty, 20);
  });
}

function createAreaLiftsTable() {
  return connection.schema.createTable(areaLifts._name, function (table) {
    table
      .string(areaLifts.areaId, 100)
      .references(mountainAreas.id)
      .inTable(mountainAreas._name)
      .onDelete(CASCADE);
    table
      .string(areaLifts.liftId, 100)
      .references(lifts.id)
      .inTable(lifts._name)
      .onDelete(CASCADE);
    table.primary([areaLifts.areaId, areaLifts.liftId]);
  });
}

function createAreaSkiSlopesTable() {
  return connection.schema.createTable(areaSkiSlopes._name, function (table) {
    table
      .string(areaSkiSlopes.areaId, 100)
      .references(mountainAreas.id)
      .inTable(mountainAreas._name)
      .onDelete(CASCADE);
    table
      .string(areaSkiSlopes.skiSlopeId, 100)
      .references(skiSlopes.id)
      .inTable(skiSlopes._name)
      .onDelete(CASCADE);
    table.primary([areaSkiSlopes.areaId, areaSkiSlopes.skiSlopeId]);
  });
}

function createAreaSnowparksTable() {
  return connection.schema.createTable(areaSnowparks._name, function (table) {
    table
      .string(areaSnowparks.areaId, 100)
      .references(mountainAreas.id)
      .inTable(mountainAreas._name)
      .onDelete(CASCADE);
    table
      .string(areaSnowparks.snowparkId, 100)
      .references(snowparks.id)
      .inTable(snowparks._name)
      .onDelete(CASCADE);
    table.primary([areaSnowparks.areaId, areaSnowparks.snowparkId]);
  });
}

function createSubAreasTable() {
  return connection.schema.createTable(subAreas._name, function (table) {
    table
      .string(subAreas.parentId, 100)
      .references(mountainAreas.id)
      .inTable(mountainAreas._name)
      .onDelete(CASCADE);
    table
      .string(subAreas.childId, 100)
      .references(mountainAreas.id)
      .inTable(mountainAreas._name)
      .onDelete(CASCADE);
    table.primary([subAreas.parentId, subAreas.childId]);
  });
}

function createConnectionsTable() {
  return connection.schema.createTable(connections._name, function (table) {
    table
      .string(connections.aId, 100)
      .references(places.id)
      .inTable(places._name)
      .onDelete(CASCADE);
    table
      .string(connections.bId, 100)
      .references(places.id)
      .inTable(places._name)
      .onDelete(CASCADE);
    table.primary([connections.aId, connections.bId]);
  });
}

function createResourceCategoriesTable() {
  return connection.schema.createTable(
    resourceCategories._name,
    function (table) {
      table
        .string(resourceCategories.categoryId, 100)
        .references(categories.id)
        .inTable(categories._name)
        .onDelete(CASCADE);
      table
        .string(resourceCategories.resourceId, 100)
        .references(resources.id)
        .inTable(resources._name)
        .onDelete(CASCADE);
      table.primary([
        resourceCategories.resourceId,
        resourceCategories.categoryId,
      ]);
    }
  );
}

function createResourceFeaturesTable() {
  return connection.schema.createTable(
    resourceFeatures._name,
    function (table) {
      table
        .string(resourceFeatures.featureId, 100)
        .references(features.id)
        .inTable(features._name)
        .onDelete(CASCADE);
      table
        .string(resourceFeatures.resourceId, 100)
        .references(resources.id)
        .inTable(resources._name)
        .onDelete(CASCADE);
      table.primary([resourceFeatures.resourceId, resourceFeatures.featureId]);
    }
  );
}

function createContributorsTable() {
  return connection.schema.createTable(contributors._name, function (table) {
    table
      .string(contributors.contributorId, 100)
      .references(agents.id)
      .inTable(agents._name)
      .onDelete(CASCADE);
    table
      .string(contributors.eventId, 100)
      .references(events.id)
      .inTable(events._name)
      .onDelete(CASCADE);
    table.primary([contributors.contributorId, contributors.eventId]);
  });
}

function createOrganizersTable() {
  return connection.schema.createTable(organizers._name, function (table) {
    table
      .string(organizers.organizerId, 100)
      .references(agents.id)
      .inTable(agents._name)
      .onDelete(CASCADE);
    table
      .string(organizers.eventId, 100)
      .references(events.id)
      .inTable(events._name)
      .onDelete(CASCADE);
    table.primary([organizers.organizerId, organizers.eventId]);
  });
}

function createSponsorsTable() {
  return connection.schema.createTable(sponsors._name, function (table) {
    table
      .string(sponsors.sponsorId, 100)
      .references(agents.id)
      .inTable(agents._name)
      .onDelete(CASCADE);
    table
      .string(sponsors.eventId, 100)
      .references(events.id)
      .inTable(events._name)
      .onDelete(CASCADE);
    table.primary([sponsors.sponsorId, sponsors.eventId]);
  });
}

function createSponsorsTable() {
  return connection.schema.createTable(sponsors._name, function (table) {
    table
      .string(sponsors.sponsorId, 100)
      .references(agents.id)
      .inTable(agents._name)
      .onDelete(CASCADE);
    table
      .string(sponsors.eventId, 100)
      .references(events.id)
      .inTable(events._name)
      .onDelete(CASCADE);
    table.primary([sponsors.sponsorId, sponsors.eventId]);
  });
}

function createMultimediaDescriptionsTable() {
  return connection.schema.createTable(
    multimediaDescriptions._name,
    function (table) {
      table
        .string(multimediaDescriptions.resourceId, 100)
        .references(resources.id)
        .inTable(resources._name)
        .onDelete(CASCADE);
      table
        .string(multimediaDescriptions.mediaObjectId, 100)
        .references(mediaObjects.id)
        .inTable(mediaObjects._name)
        .onDelete(CASCADE);
      table.primary([
        multimediaDescriptions.resourceId,
        multimediaDescriptions.mediaObjectId,
      ]);
    }
  );
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

function createDeletePlaceAddressTrigger() {
  return connection.raw(`
    CREATE OR REPLACE FUNCTION delete_place_address()
      RETURNS TRIGGER AS
    $$
    BEGIN
      DELETE FROM ${addresses._name} WHERE OLD.${places.addressId} = ${addresses._name}.${addresses.id};
      RETURN OLD;
    END;
    $$ LANGUAGE PLPGSQL;

    DROP TRIGGER IF EXISTS place_address_deletion ON ${places._name};

    CREATE TRIGGER place_address_deletion
      AFTER DELETE
      ON ${places._name}
      FOR EACH ROW
      EXECUTE PROCEDURE delete_place_address();
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

function createParticipationUrlObjectsView() {
  return connection.raw(`
  CREATE VIEW participation_url_objects AS
    SELECT event_id AS "id",
        COALESCE(
          json_object_agg(DISTINCT lang, content) FILTER (WHERE lang IS NOT NULL)
        )::json AS "url"
      FROM participation_urls
      GROUP BY event_id;
  `);
}

function createRegistrationUrlObjectsView() {
  return connection.raw(`
  CREATE VIEW registration_url_objects AS
    SELECT event_id AS "id",
        COALESCE(
          json_object_agg(DISTINCT lang, content) FILTER (WHERE lang IS NOT NULL)
        )::json AS "url"
      FROM registration_urls
      GROUP BY event_id;
  `);
}

function createCategoriesArraysView() {
  return connection.raw(`
  CREATE VIEW categories_arrays AS
    SELECT resource_id AS "id",
        json_agg(
          json_build_object(
            'id',
            category_id,
            'type',
            'categories'
          )
        ) AS "categories"
      FROM resource_categories
      GROUP BY resource_id;
  `);
}

function createFeaturesArraysView() {
  return connection.raw(`
  CREATE VIEW features_arrays AS
    SELECT resource_id AS "id",
        json_agg(
          json_build_object(
            'id', feature_id,
            'type', 'features'
          )
        ) AS "features"
      FROM resource_features
      GROUP BY resource_id;
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
        json_build_object(
          'country', country,
          'zipcode', zipcode,
          'type', addresses.type,
          'city', COALESCE(city_objects.city),
          'complement', COALESCE(complement_objects.complement),
          'region', COALESCE(region_objects.region),
          'street', COALESCE(street_objects.street)
        ) AS "address"
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
          features_arrays.features,
          multimedia_descriptions_arrays.media
        FROM resources
        LEFT JOIN abstract_objects ON abstract_objects.id = resources.id
        LEFT JOIN description_objects ON description_objects.id = resources.id
        LEFT JOIN name_objects ON name_objects.id = resources.id
        LEFT JOIN short_name_objects ON short_name_objects.id = resources.id
        LEFT JOIN url_objects ON url_objects.id = resources.id
        LEFT JOIN categories_arrays ON categories_arrays.id = resources.id
        LEFT JOIN features_arrays ON features_arrays.id = resources.id
        LEFT JOIN multimedia_descriptions_arrays ON multimedia_descriptions_arrays.id = resources.id;
  `);
}

function createHowToArriveObjectsView() {
  return connection.raw(`
  CREATE VIEW how_to_arrive_objects AS
    SELECT place_id AS "id",
        COALESCE(
          json_object_agg(DISTINCT lang, content) FILTER (WHERE lang IS NOT NULL)
        )::json AS "how_to_arrive"
      FROM how_to_arrive
      GROUP BY place_id;
  `);
}

function createAreaLiftsArraysView() {
  return connection.raw(`
  CREATE VIEW area_lifts_arrays AS
    SELECT area_id AS "id",
        json_agg(json_build_object(
          'id', lift_id,
          'type', 'lifts'
        )) AS "lifts"
      FROM area_lifts
      GROUP BY area_id;
  `);
}

function createAreaSkiSlopesArraysView() {
  return connection.raw(`
  CREATE VIEW area_ski_slopes_arrays AS
    SELECT area_id AS "id",
        json_agg(json_build_object(
          'id', ski_slope_id,
          'type', 'skiSlopes'
        )) AS "ski_slopes"
      FROM area_ski_slopes
      GROUP BY area_id;
  `);
}

function createAreaSnowparksArraysView() {
  return connection.raw(`
  CREATE VIEW area_snowparks_arrays AS
    SELECT area_id AS "id",
        json_agg(json_build_object(
          'id', snowpark_id,
          'type', 'snowparks'
        )) AS "snowparks"
      FROM area_snowparks
      GROUP BY area_id;
  `);
}

function createSubAreasArraysView() {
  return connection.raw(`
  CREATE VIEW sub_areas_arrays AS
    SELECT parent_id AS "id",
        json_agg(json_build_object(
          'id', child_id,
          'type', 'mountainAreas'
        )) AS "sub_areas"
      FROM sub_areas
      GROUP BY parent_id;
  `);
}

// TODO: review whether connections must be bi-directional
function createConnectionsArraysView() {
  return connection.raw(`
  CREATE VIEW connections_arrays AS
    SELECT a_id AS "id",
        json_agg(json_build_object(
          'id', b_id,
          'type', resources.type
        )) AS "connections"
      FROM connections
      LEFT JOIN resources ON resources.id = connections.b_id
      GROUP BY a_id;
  `);
}

// TODO: add filter to make 'baseSnow' null when there are no ranges
function createSnowConditionObjectsView() {
  return connection.raw(`
  CREATE VIEW snow_condition_objects AS
    SELECT snow_conditions.id,
        json_build_object(
          'baseSnow', base_snow,
          'baseSnowRange', json_build_object(
            'lower', base_snow_range_lower,
            'upper', base_snow_range_upper
          ),
          'groomed', groomed,
          'latestStorm', latest_storm,
          'obtainedIn', obtained_in,
          'primarySurface', primary_surface,
          'secondarySurface', secondary_surface,
          'snowMaking', snow_making,
          'snowOverNight', snow_over_night
        ) AS "snow_condition"
      FROM snow_conditions;
  `);
}

function createPlaceObjectsView() {
  return connection.raw(`
  CREATE VIEW place_objects AS
    SELECT places.id, geometries, length, max_altitude, min_altitude, opening_hours,
        address_objects.address AS "address",
        how_to_arrive_objects.how_to_arrive AS "how_to_arrive",
		    snow_condition_objects.snow_condition AS "snow_condition"
      FROM places
      LEFT JOIN snow_condition_objects ON snow_condition_objects.id = places.id
      LEFT JOIN address_objects ON address_objects.id = places.address_id
      LEFT JOIN how_to_arrive_objects ON how_to_arrive_objects.id = places.id;
  `);
}

function createAllViews() {
  return createAbstractObjectsView()
    .then(() => createDescriptionObjectsView())
    .then(() => createNameObjectsView())
    .then(() => createShortNameObjectsView())
    .then(() => createUrlObjectsView())
    .then(() => createParticipationUrlObjectsView())
    .then(() => createRegistrationUrlObjectsView())
    .then(() => createCategoriesArraysView())
    .then(() => createFeaturesArraysView())
    .then(() => createMultimediaDescriptionsArraysView())
    .then(() => createCityObjectsView())
    .then(() => createComplementObjectsView())
    .then(() => createRegionObjectsView())
    .then(() => createStreetObjectsView())
    .then(() => createAddressObjectsView())
    .then(() => createResourceObjectsView())
    .then(() => createHowToArriveObjectsView())
    .then(() => createAreaLiftsArraysView())
    .then(() => createAreaSkiSlopesArraysView())
    .then(() => createAreaSnowparksArraysView())
    .then(() => createSubAreasArraysView())
    .then(() => createConnectionsArraysView())
    .then(() => createSnowConditionObjectsView())
    .then(() => createPlaceObjectsView());
}

function dropAllViews() {
  return Promise.all([
    dropViewIfExists(views.abstractObjects._name),
    dropViewIfExists(views.descriptionObjects._name),
    dropViewIfExists(views.nameObjects._name),
    dropViewIfExists(views.shortNameObjects._name),
    dropViewIfExists(views.urlObjects._name),
    dropViewIfExists(views.participationUrlObjects._name),
    dropViewIfExists(views.registrationUrlObjects._name),
    dropViewIfExists(views.categoriesArrays._name),
    dropViewIfExists(views.featuresArrays._name),
    dropViewIfExists(views.multimediaDescriptionsArrays._name),
    dropViewIfExists(views.cityObjects._name),
    dropViewIfExists(views.complementObjects._name),
    dropViewIfExists(views.regionObjects._name),
    dropViewIfExists(views.streetObjects._name),
    dropViewIfExists(views.addressObjects._name),
    dropViewIfExists(views.resourceObjects._name),
    dropViewIfExists(views.howToArriveObjects._name),
    dropViewIfExists(views.areaLiftsArrays._name),
    dropViewIfExists(views.areaSkiSlopesArrays._name),
    dropViewIfExists(views.areaSnowparksArrays._name),
    dropViewIfExists(views.subAreasArrays._name),
    dropViewIfExists(views.connectionsArrays._name),
    dropViewIfExists(views.snowConditionObjects._name),
    dropViewIfExists(views.placeObjects._name),
  ]);
}

function createAllTriggers() {
  return Promise.all([
    createDeleteContactPointAddressTrigger(),
    createDeletePlaceAddressTrigger(),
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
    dropTableIfExists(participationUrls._name),
    dropTableIfExists(registrationUrls._name),
    dropTableIfExists(agents._name),
    dropTableIfExists(addresses._name),
    dropTableIfExists(cities._name),
    dropTableIfExists(complements._name),
    dropTableIfExists(regions._name),
    dropTableIfExists(streets._name),
    dropTableIfExists(contactPoints._name),
    dropTableIfExists(places._name),
    dropTableIfExists(howToArrive._name),
    dropTableIfExists(snowConditions._name),
    dropTableIfExists(venues._name),
    dropTableIfExists(eventVenues._name),
    dropTableIfExists(categories._name),
    dropTableIfExists(features._name),
    dropTableIfExists(mediaObjects._name),
    dropTableIfExists(seriesFrequencies._name),
    dropTableIfExists(eventSeries._name),
    dropTableIfExists(eventStatus._name),
    dropTableIfExists(events._name),
    dropTableIfExists(resourceCategories._name),
    dropTableIfExists(resourceFeatures._name),
    dropTableIfExists(categoryCoveredTypes._name),
    dropTableIfExists(categorySpecializations._name),
    dropTableIfExists(featureCoveredTypes._name),
    dropTableIfExists(featureSpecializations._name),
    dropTableIfExists(contributors._name),
    dropTableIfExists(organizers._name),
    dropTableIfExists(sponsors._name),
    dropTableIfExists(multimediaDescriptions._name),
    dropTableIfExists(areaLifts._name),
    dropTableIfExists(areaSkiSlopes._name),
    dropTableIfExists(areaSnowparks._name),
    dropTableIfExists(lifts._name),
    dropTableIfExists(mountainAreas._name),
    dropTableIfExists(skiSlopes._name),
    dropTableIfExists(snowparks._name),
    dropTableIfExists(subAreas._name),
    dropTableIfExists(connections._name),
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
    .then(() => createParticipationUrlsTable())
    .then(() => createRegistrationUrlsTable())
    .then(() => createAddressesTable())
    .then(() => createCitiesTable())
    .then(() => createComplementsTable())
    .then(() => createRegionsTable())
    .then(() => createStreetsTable())
    .then(() => createContactPointsTable())
    .then(() => createPlacesTable())
    .then(() => createHowToArriveTable())
    .then(() => createSnowConditionsTable())
    .then(() => createVenuesTable())
    .then(() => createEventVenuesTable())
    .then(() => createLiftsTable())
    .then(() => createMountainAreasTable())
    .then(() => createSkiSlopesTable())
    .then(() => createSnowparksTable())
    .then(() => createAreaLiftsTable())
    .then(() => createAreaSkiSlopesTable())
    .then(() => createAreaSnowparksTable())
    .then(() => createSubAreasTable())
    .then(() => createConnectionsTable())
    .then(() => createResourceCategoriesTable())
    .then(() => createResourceFeaturesTable())
    .then(() => createCategoryCoveredTypesTable())
    .then(() => createCategorySpecializationsTable())
    .then(() => createFeatureCoveredTypesTable())
    .then(() => createFeatureSpecializationsTable())
    .then(() => createContributorsTable())
    .then(() => createOrganizersTable())
    .then(() => createSponsorsTable())
    .then(() => createMultimediaDescriptionsTable());
}
