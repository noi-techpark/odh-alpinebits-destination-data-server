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
  venues,
  places,
  mountainAreas,
  lifts,
  snowConditions,
  snowparks,
  skiSlopes,
  eventVenues,
  areaLifts,
  areaSkiSlopes,
  areaSnowparks,
  subAreas,
  howToArrive,
  connections,
  resourceFeatures,
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
    .then((resourceIds) =>
      connection(resources._name).whereIn(resources.id, resourceIds).del()
    );
}

function checkNotNullable(field, field_name) {
  if (!field && typeof field !== "boolean")
    throw new Error(`Missing not nullable field: ${field_name}`);
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

  if (!address.id) {
    return connection
      .raw(
        `SELECT ${addresses.id} FROM ${addresses._name} ORDER BY ${addresses.id} DESC LIMIT 1;`
      )
      .then((select) => {
        const maxId = select?.rows?.[0]?.id || 1;
        address.id = maxId + 1;
        return insert(connection, addresses._name, address, addresses.id);
      });
  }

  return insert(connection, addresses._name, address, addresses.id);
}

function getReturningColumns(returning) {
  return _.isString(returning) || _.isArray(returning) ? returning : "*";
}

function insert(connection, tableName, columns, returning) {
  const returnColumns = getReturningColumns(returning);

  // console.log("tableName", tableName);
  // console.log("columns", columns);
  // console.log("returning", returning);

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

function insertPlaceText(connection, tableName, placeId, lang, content) {
  const columns = {
    [howToArrive.placeId]: placeId,
    [howToArrive.lang]: lang,
    [howToArrive.content]: content,
  };

  checkNotNullable(placeId, howToArrive.placeId);
  checkNotNullable(lang, howToArrive.lang);
  checkNotNullable(content, howToArrive.content);

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

function insertFeatureCoveredType(connection, type, featureId) {
  const columns = {
    [featureCoveredTypes.type]: type,
    [featureCoveredTypes.featureId]: featureId,
  };

  checkNotNullable(type, featureCoveredTypes.type);
  checkNotNullable(featureId, featureCoveredTypes.featureId);

  return insert(connection, featureCoveredTypes._name, columns);
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

function insertFeatureSpecialization(connection, childId, parentId) {
  const columns = {
    [featureSpecializations.childId]: childId,
    [featureSpecializations.parentId]: parentId,
  };

  checkNotNullable(childId, featureSpecializations.childId);
  checkNotNullable(parentId, featureSpecializations.parentId);

  return insert(connection, featureSpecializations._name, columns);
}

function insertResource(connection, resource) {
  const type = resource[resources.type];
  const dataProvider = resource[resources.dataProvider];

  checkNotNullable(type, resources.type);
  checkNotNullable(dataProvider, resources.dataProvider);

  return insert(connection, resources._name, resource, resources.id).then(
    (array) => _.first(array)
  );
}

function insertAgent(connection, agent) {
  return insert(connection, agents._name, agent, agents.id).then((array) =>
    _.first(array)
  );
}

function insertVenue(connection, venue) {
  return insert(connection, venues._name, venue, venues.id).then((array) =>
    _.first(array)
  );
}

function insertLift(connection, lift) {
  return insert(connection, lifts._name, lift, lifts.id).then((array) =>
    _.first(array)
  );
}

function insertMountainArea(connection, mountainArea) {
  return insert(
    connection,
    mountainAreas._name,
    mountainArea,
    mountainAreas.id
  ).then((array) => _.first(array));
}

function insertSkiSlope(connection, skiSlope) {
  return insert(connection, skiSlopes._name, skiSlope, skiSlopes.id).then(
    (array) => _.first(array)
  );
}

function insertSnowpark(connection, snowpark) {
  return insert(connection, snowparks._name, snowpark, snowparks.id).then(
    (array) => _.first(array)
  );
}

function insertPlace(connection, place) {
  return insert(connection, places._name, place, places.id).then((array) =>
    _.first(array)
  );
}

function insertSnowCondition(connection, snowCondition) {
  return insert(
    connection,
    snowConditions._name,
    snowCondition,
    snowConditions.id
  ).then((array) => _.first(array));
}

function insertCategory(connection, category) {
  const categoryId = category[categories.id];
  const namespace = category[categories.namespace];

  checkNotNullable(categoryId, categories.id);
  checkNotNullable(namespace, categories.namespace);

  return insert(connection, categories._name, category, categories.id).then(
    (array) => _.first(array)
  );
}

function insertFeature(connection, feature) {
  const featureId = feature[features.id];
  const namespace = feature[features.namespace];

  checkNotNullable(featureId, features.id);
  checkNotNullable(namespace, features.namespace);

  return insert(connection, features._name, feature, features.id).then(
    (array) => _.first(array)
  );
}

function insertMediaObject(connection, mediaObject) {
  return insert(
    connection,
    mediaObjects._name,
    mediaObject,
    mediaObjects.id
  ).then((array) => _.first(array));
}

function insertEvent(connection, event) {
  const eventId = event[events.id];
  const publisherId = event[events.publisherId];

  checkNotNullable(eventId, events.id);
  checkNotNullable(publisherId, events.publisherId);

  return insert(connection, events._name, event, events.id).then((array) =>
    _.first(array)
  );
}

function insertEventSeries(connection, eventSeries) {
  const eventSeriesId = eventSeries[eventSeriesSchema.id];

  checkNotNullable(eventSeriesId, eventSeriesSchema.id);

  return insert(
    connection,
    eventSeriesSchema._name,
    eventSeries,
    eventSeriesSchema.id
  ).then((array) => _.first(array));
}

function insertResourceCategory(connection, resourceId, categoryId) {
  const columns = {
    [resourceCategories.categoryId]: categoryId,
    [resourceCategories.resourceId]: resourceId,
  };

  checkNotNullable(categoryId, resourceCategories.categoryId);
  checkNotNullable(resourceId, resourceCategories.resourceId);

  return insert(connection, resourceCategories._name, columns);
}

function insertResourceFeature(connection, resourceId, featureId) {
  const columns = {
    [resourceFeatures.featureId]: featureId,
    [resourceFeatures.resourceId]: resourceId,
  };

  checkNotNullable(featureId, resourceFeatures.featureId);
  checkNotNullable(resourceId, resourceFeatures.resourceId);

  return insert(connection, resourceFeatures._name, columns);
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

function insertPlaceConnection(connection, sourceId, destinationId) {
  const columns = {
    [connections.aId]: sourceId,
    [connections.bId]: destinationId,
  };

  checkNotNullable(sourceId, connections.sourceId);
  checkNotNullable(destinationId, connections.destinationId);

  return insert(connection, connections._name, columns);
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

function insertEventVenue(connection, eventId, venueId) {
  const columns = {
    [eventVenues.venueId]: venueId,
    [eventVenues.eventId]: eventId,
  };

  checkNotNullable(venueId, eventVenues.venueId);
  checkNotNullable(eventId, eventVenues.eventId);

  return insert(connection, eventVenues._name, columns);
}

function insertAreaLift(connection, areaId, liftId) {
  const columns = {
    [areaLifts.liftId]: liftId,
    [areaLifts.areaId]: areaId,
  };

  checkNotNullable(liftId, areaLifts.liftId);
  checkNotNullable(areaId, areaLifts.areaId);

  return insert(connection, areaLifts._name, columns);
}

function insertAreaSkiSlope(connection, areaId, skiSlopeId) {
  const columns = {
    [areaSkiSlopes.skiSlopeId]: skiSlopeId,
    [areaSkiSlopes.areaId]: areaId,
  };

  checkNotNullable(skiSlopeId, areaSkiSlopes.skiSlopeId);
  checkNotNullable(areaId, areaSkiSlopes.areaId);

  return insert(connection, areaSkiSlopes._name, columns);
}

function insertAreaSnowpark(connection, areaId, snowparkId) {
  const columns = {
    [areaSnowparks.snowparkId]: snowparkId,
    [areaSnowparks.areaId]: areaId,
  };

  checkNotNullable(snowparkId, areaSnowparks.snowparkId);
  checkNotNullable(areaId, areaSnowparks.areaId);

  return insert(connection, areaSnowparks._name, columns);
}

function insertSubArea(connection, parentId, childId) {
  const columns = {
    [subAreas.parentId]: parentId,
    [subAreas.childId]: childId,
  };

  checkNotNullable(parentId, subAreas.parentId);
  checkNotNullable(childId, subAreas.childId);

  return insert(connection, subAreas._name, columns);
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

function selectUsingFile(
  connection,
  queryFileName,
  where,
  offset,
  limit,
  orderBy
) {
  const queryPath = path.resolve(__dirname, queryFileName);
  offset = `${offset ? "OFFSET " + offset : ""}`;
  limit = `${limit ? "LIMIT " + limit : ""} `;
  orderBy = `${!_.isEmpty(orderBy) ? "ORDER BY " + orderBy.join(", ") : ""}`;

  return fs.promises
    .readFile(queryPath, "utf-8")
    .then((query) => {
      // console.log(
      //   "run query",
      //   `${query} ${where} ${orderBy} ${offset} ${limit};`
      // );
      return connection.raw(`${query} ${where} ${orderBy} ${offset} ${limit};`);
    })
    .then((result) => result?.rows)
    .catch((queryError) => {
      throw queryError;
    });
}

function selectAgentFromId(connection, ids, offset, limit, orderBy, filters) {
  const selectAgentFile = "select_agent.sql";
  let where = getWhereIdMatchesClause(ids, "agents.id", filters);
  return selectUsingFile(
    connection,
    selectAgentFile,
    where,
    offset,
    limit,
    orderBy
  );
}

function selectVenueFromId(connection, ids, offset, limit, orderBy, filters) {
  const selectVenueFile = "select_venue.sql";
  const where = getWhereIdMatchesClause(ids, "venues.id", filters);
  return selectUsingFile(
    connection,
    selectVenueFile,
    where,
    offset,
    limit,
    orderBy
  );
}

function selectLiftFromId(connection, ids, offset, limit, orderBy, filters) {
  const selectLiftFile = "select_lift.sql";
  const where = getWhereIdMatchesClause(ids, "lifts.id", filters);
  return selectUsingFile(
    connection,
    selectLiftFile,
    where,
    offset,
    limit,
    orderBy
  );
}

function selectMountainAreaFromId(
  connection,
  ids,
  offset,
  limit,
  orderBy,
  filters
) {
  const selectMountainAreaFile = "select_mountain_area.sql";
  const where = getWhereIdMatchesClause(ids, "mountain_areas.id", filters);
  return selectUsingFile(
    connection,
    selectMountainAreaFile,
    where,
    offset,
    limit,
    orderBy
  );
}

function selectSkiSlopeFromId(
  connection,
  ids,
  offset,
  limit,
  orderBy,
  filters
) {
  const selectSkiSlopeFile = "select_ski_slope.sql";
  const where = getWhereIdMatchesClause(ids, "ski_slopes.id", filters);
  return selectUsingFile(
    connection,
    selectSkiSlopeFile,
    where,
    offset,
    limit,
    orderBy
  );
}

function selectSnowparkFromId(
  connection,
  ids,
  offset,
  limit,
  orderBy,
  filters
) {
  const selectSnowparkFile = "select_snowpark.sql";
  const where = getWhereIdMatchesClause(ids, "snowparks.id", filters);
  return selectUsingFile(
    connection,
    selectSnowparkFile,
    where,
    offset,
    limit,
    orderBy
  );
}

function selectCategoryFromId(
  connection,
  ids,
  offset,
  limit,
  orderBy,
  filters
) {
  const selectCategoryFile = "select_category.sql";
  const where = getWhereIdMatchesClause(ids, "categories.id", filters);
  return selectUsingFile(
    connection,
    selectCategoryFile,
    where,
    offset,
    limit,
    orderBy
  );
}

function selectFeatureFromId(connection, ids, offset, limit, orderBy, filters) {
  const selectFeatureFile = "select_feature.sql";
  const where = getWhereIdMatchesClause(ids, "features.id", filters);
  return selectUsingFile(
    connection,
    selectFeatureFile,
    where,
    offset,
    limit,
    orderBy
  );
}

function selectMediaObjectFromId(
  connection,
  ids,
  offset,
  limit,
  orderBy,
  filters
) {
  const selectMediaObjectFile = "select_media_object.sql";
  const where = getWhereIdMatchesClause(ids, "media_objects.id", filters);
  return selectUsingFile(
    connection,
    selectMediaObjectFile,
    where,
    offset,
    limit,
    orderBy
  );
}

function selectEventFromId(connection, ids, offset, limit, orderBy, filters) {
  const selectEventFile = "select_event.sql";
  const where = getWhereIdMatchesClause(ids, "events.id", filters);
  return selectUsingFile(
    connection,
    selectEventFile,
    where,
    offset,
    limit,
    orderBy
  );
}

function selectEventSeriesFromId(
  connection,
  ids,
  offset,
  limit,
  orderBy,
  filters
) {
  const selectEventSeriesFile = "select_event_series.sql";
  const where = getWhereIdMatchesClause(ids, "event_series.id", filters);
  return selectUsingFile(
    connection,
    selectEventSeriesFile,
    where,
    offset,
    limit,
    orderBy
  );
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
  const columns = { [resourceCategories.resourceId]: resourceId };
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

function getWhereIdMatchesClause(ids, fieldName, filters) {
  const clauses = [];

  if (_.isString(ids)) clauses.push(`${fieldName} = '${ids}'`);
  else if (_.isArray(ids)) {
    const idList = ids.map((id) => `'${id}'`).join(", ");
    clauses.push(`${fieldName} in (${_.isEmpty(ids) ? "''" : idList})`);
  }

  if (!_.isEmpty(filters)) clauses.push(...filters);

  const where = _.isEmpty(clauses) ? "" : `WHERE ${clauses.join(" AND ")}`;

  return where;
}

function deleteResource(connection, resourceId, type) {
  const columns = {
    [resources.id]: resourceId,
    [resources.type]: type,
  };
  return connection(resources._name).where(columns).del();
}

function deletePlace(connection, placeId, type) {
  const columns = {
    [places.id]: placeId,
  };
  return connection(places._name).where(columns).del();
}

function deleteCategory(connection, id) {
  const columns = {
    [categories.id]: id,
  };
  return connection(categories._name).where(columns).del();
}

function deleteFeature(connection, id) {
  const columns = {
    [features.id]: id,
  };
  return connection(features._name).where(columns).del();
}

function update(connection, tableName, where, columns, returning) {
  const returnColumns = getReturningColumns(returning);

  // console.log("Update tableName", tableName);
  // console.log("Update where", where);
  // console.log("Update columns", columns);
  // console.log("Update returning", returning);

  return connection(tableName)
    .where(where)
    .update(columns)
    .returning(returnColumns);
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

function updateEvent(connection, event) {
  const eventId = event[events.id];

  checkNotNullable(eventId, events.id);

  const where = { [events.id]: eventId };
  return update(connection, events._name, where, event);
}

function updateEventSeries(connection, eventSeries) {
  const eventSeriesId = eventSeries[eventSeriesSchema.id];

  checkNotNullable(eventSeriesId, eventSeriesSchema.id);

  const where = { [eventSeriesSchema.id]: eventSeriesId };
  return update(connection, eventSeriesSchema._name, where, eventSeries);
}

function updateFeature(connection, feature) {
  const featureId = feature[features.id];

  checkNotNullable(featureId, features.id);

  const where = { [features.id]: featureId };
  return update(connection, features._name, where, feature);
}

function updateLift(connection, lift) {
  const liftId = lift[lifts.id];

  checkNotNullable(liftId, lifts.id);

  const where = { [lifts.id]: liftId };
  return update(connection, lifts._name, where, lift);
}

function updateMediaObject(connection, mediaObject) {
  const mediaObjectId = mediaObject[mediaObjects.id];

  checkNotNullable(mediaObjectId, mediaObjects.id);

  const where = { [mediaObjects.id]: mediaObjectId };
  return update(connection, mediaObjects._name, where, mediaObject);
}

function updateMountainArea(connection, mountainArea) {
  const mountainAreaId = mountainArea[mountainAreas.id];

  checkNotNullable(mountainAreaId, mountainAreas.id);

  const where = { [mountainAreas.id]: mountainAreaId };
  return update(connection, mountainAreas._name, where, mountainArea);
}

function updateSkiSlope(connection, skiSlope) {
  const skiSlopeId = skiSlope[skiSlopes.id];

  checkNotNullable(skiSlopeId, skiSlopes.id);

  const where = { [skiSlopes.id]: skiSlopeId };
  return update(connection, skiSlopes._name, where, skiSlope);
}

function updateSnowpark(connection, snowpark) {
  const snowparkId = snowpark[snowparks.id];

  checkNotNullable(snowparkId, snowparks.id);

  const where = { [snowparks.id]: snowparkId };
  return update(connection, snowparks._name, where, snowpark);
}

function updateVenue(connection, venue) {
  const venueId = venue[venues.id];

  checkNotNullable(venueId, venues.id);

  const where = { [venues.id]: venueId };
  return update(connection, venues._name, where, venue);
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
    [resourceCategories.resourceId]: resourceId,
  };

  checkNotNullable(resourceId, resourceCategories.resourceId);

  return connection(resourceCategories._name).where(columns).del();
}

function deleteResourceFeature(connection, resourceId) {
  const columns = {
    [resourceFeatures.resourceId]: resourceId,
  };

  checkNotNullable(resourceId, resourceFeatures.resourceId);

  return connection(resourceFeatures._name).where(columns).del();
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

function deleteEventVenues(connection, eventId) {
  const columns = {
    [eventVenues.eventId]: eventId,
  };

  checkNotNullable(eventId, eventVenues.eventId);

  return connection(eventVenues._name).where(columns).del();
}

function deleteAreaLifts(connection, areaId) {
  const columns = {
    [areaLifts.areaId]: areaId,
  };

  checkNotNullable(areaId, areaLifts.areaId);

  return connection(areaLifts._name).where(columns).del();
}

function deleteAreaSkiSlopes(connection, areaId) {
  const columns = {
    [areaSkiSlopes.areaId]: areaId,
  };

  checkNotNullable(areaId, areaSkiSlopes.areaId);

  return connection(areaSkiSlopes._name).where(columns).del();
}

function deleteAreaSnowparks(connection, areaId) {
  const columns = {
    [areaSnowparks.areaId]: areaId,
  };

  checkNotNullable(areaId, areaSnowparks.areaId);

  return connection(areaSnowparks._name).where(columns).del();
}

function deleteSubAreas(connection, parentId) {
  const columns = {
    [subAreas.parentId]: parentId,
  };

  checkNotNullable(parentId, subAreas.parentId);

  return connection(subAreas._name).where(columns).del();
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

function deleteFeatureCoveredTypes(connection, featureId) {
  const columns = {
    [featureCoveredTypes.featureId]: featureId,
  };

  checkNotNullable(featureId, featureCoveredTypes.featureId);

  return connection(featureCoveredTypes._name).where(columns).del();
}

function deleteChildrenCategories(connection, parentId) {
  const columns = {
    [categorySpecializations.parentId]: parentId,
  };

  checkNotNullable(parentId, categorySpecializations.parentId);

  return connection(categorySpecializations._name).where(columns).del();
}

function deleteChildrenFeatures(connection, parentId) {
  const columns = {
    [featureSpecializations.parentId]: parentId,
  };

  checkNotNullable(parentId, featureSpecializations.parentId);

  return connection(featureSpecializations._name).where(columns).del();
}

function deleteParentCategories(connection, childId) {
  const columns = {
    [categorySpecializations.childId]: childId,
  };

  checkNotNullable(childId, categorySpecializations.childId);

  return connection(categorySpecializations._name).where(columns).del();
}

function deleteParentFeatures(connection, childId) {
  const columns = {
    [featureSpecializations.childId]: childId,
  };

  checkNotNullable(childId, featureSpecializations.childId);

  return connection(featureSpecializations._name).where(columns).del();
}

module.exports = {
  deleteResourceTypes,
  deleteAllEventsStatus,
  deleteSeriesFrequencies,
  deleteLanguageCodes,
  deleteCategories,
  deleteResource,
  deletePlace,
  deleteCategory,
  deleteFeature,
  deleteAbstracts,
  deleteDescriptions,
  deleteNames,
  deleteShortNames,
  deleteUrls,
  deleteContactPoints,
  deleteResourceText,
  deleteAddressText,
  deleteResourceCategories,
  deleteResourceFeature,
  deleteMultimediaDescriptions,
  deleteOrganizers,
  deleteContributors,
  deleteSponsors,
  deleteSubEvents,
  deleteEditions,
  deleteCategoryCoveredTypes,
  deleteChildrenCategories,
  deleteParentCategories,
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
  insertFeature,
  insertResourceFeature,
  insertFeatureCoveredType,
  insertFeatureSpecialization,
  insertEvent,
  insertEventSeries,
  insertResourceText,
  insertPlaceText,
  insertAddressText,
  insertMultimediaDescriptions,
  insertPlaceConnection,
  insertOrganizer,
  insertContributor,
  insertSponsor,
  insertMediaObject,
  selectAgentFromId,
  selectVenueFromId,
  selectLiftFromId,
  selectMountainAreaFromId,
  selectSkiSlopeFromId,
  selectSnowparkFromId,
  selectCategoryFromId,
  selectFeatureFromId,
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
  updateResource,
  updateCategory,
  updateEvent,
  updateEventSeries,
  updateFeature,
  updateLift,
  updateMediaObject,
  updateMountainArea,
  updateSkiSlope,
  updateSnowpark,
  updateVenue,
  updateSubEvent,
  updateEdition,
  insertVenue,
  insertLift,
  insertMountainArea,
  insertSkiSlope,
  insertSnowpark,
  insertPlace,
  insertSnowCondition,
  insertEventVenue,
  insertAreaLift,
  insertAreaSkiSlope,
  insertAreaSnowpark,
  insertSubArea,
  deleteEventVenues,
  deleteAreaLifts,
  deleteAreaSkiSlopes,
  deleteAreaSnowparks,
  deleteSubAreas,
  deleteFeatureCoveredTypes,
  deleteChildrenFeatures,
  deleteParentFeatures,
};
