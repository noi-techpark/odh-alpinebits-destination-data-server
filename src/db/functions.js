const iso6393 = require("iso-639-3");
const { schemas } = require(".");
const _ = require("lodash");
const { default: knex } = require("knex");

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
    .then((resourceIds) => connection(resources._name).whereIn(resources.id, resourceIds).del());
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

  return insert(connection, addresses._name, address, addresses.id);
}

function getReturningColumns(returning) {
  return _.isString(returning) || _.isArray(returning) ? returning : "*";
}

function insert(connection, tableName, columns, returning) {
  const returnColumns = getReturningColumns(returning);
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

function insertCategorySpecialization(connection, childId, parentId) {
  const columns = {
    [categorySpecializations.childId]: childId,
    [categorySpecializations.parentId]: parentId,
  };

  checkNotNullable(childId, categorySpecializations.childId);
  checkNotNullable(parentId, categorySpecializations.parentId);

  return insert(connection, categorySpecializations._name, columns);
}

function insertResource(connection, resource) {
  const type = resource[resources.type];
  const dataProvider = resource[resources.dataProvider];

  checkNotNullable(type, resources.type);
  checkNotNullable(dataProvider, resources.dataProvider);

  return insert(connection, resources._name, resource, resources.id).then((array) => _.first(array));
}

function insertAgent(connection, agent) {
  return insert(connection, agents._name, agent, agents.id).then((array) => _.first(array));
}

function insertCategory(connection, category) {
  const categoryId = category[categories.id];
  const resourceId = category[categories.resourceId];
  const namespace = category[categories.namespace];

  checkNotNullable(categoryId, categories.id);
  checkNotNullable(resourceId, categories.resourceId);
  checkNotNullable(namespace, categories.namespace);

  return insert(connection, categories._name, category, categories.id).then((array) => _.first(array));
}

function insertResourceCategory(connection, resourceId, categoryId) {
  const columns = {
    [resourceCategories.categoryId]: categoryId,
    [resourceCategories.categorizedResourceId]: resourceId,
  };

  checkNotNullable(categoryId, resourceCategories.categoryId);
  checkNotNullable(resourceId, resourceCategories.categorizedResourceId);

  return insert(connection, resourceCategories._name, columns);
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

function select(connection, tableName, where, selection) {
  const returnColumns = getReturningColumns(selection);
  return connection(tableName).select(returnColumns).where(where);
}

function selectAgentFromId(connection, id) {
  return (
    connection
      .raw(
        `
        SELECT
          agents.id AS "id",
          COALESCE(resources.type) AS "type",
          COALESCE(resources.data_provider) AS "dataProvider",
          COALESCE(resources.last_update) AS "lastUpdate",
          COALESCE(agentAbstracts.abstract, 'null') AS  "abstract",
          COALESCE(agentDescriptions.description, 'null') AS  "description",
          COALESCE(agentNames.name, 'null') AS  "name",
          COALESCE(agentShortNames."shortName", 'null') AS  "shortName",
          COALESCE(to_json(resources.simple_url), agentUrls.url, 'null') AS  "url",
          COALESCE(agentContacts."contactPoints", 'null')  AS "contactPoints",
          COALESCE(agentCategories."categories", 'null')  AS "categories"
        FROM agents
        LEFT JOIN resources ON resources.id = agents.id
        LEFT JOIN (
          SELECT categorized_resource_id AS "resource_id",
            json_agg(
              json_build_object(
                'id', category_id,
                'type', 'categories'
              )
            ) AS "categories"
          FROM resource_categories
          GROUP BY resource_id
        ) agentCategories ON agentCategories.resource_id = agents.id
        LEFT JOIN (
          SELECT abstracts.resource_id AS "id", COALESCE(json_object_agg(DISTINCT abstracts.lang, abstracts.content) FILTER (WHERE abstracts.lang IS NOT NULL))::json AS "abstract"
          FROM abstracts
          GROUP BY abstracts.resource_id
        ) AS agentAbstracts ON agentAbstracts.id = agents.id
        LEFT JOIN (
          SELECT descriptions.resource_id AS "id", COALESCE(json_object_agg(DISTINCT descriptions.lang, descriptions.content) FILTER (WHERE descriptions.lang IS NOT NULL))::json AS "description"
          FROM descriptions
          GROUP BY descriptions.resource_id
        ) AS agentDescriptions ON agentDescriptions.id = agents.id
        LEFT JOIN (
          SELECT names.resource_id AS "id", COALESCE(json_object_agg(DISTINCT names.lang, names.content) FILTER (WHERE names.lang IS NOT NULL))::json AS "name"
          FROM names
          GROUP BY names.resource_id
        ) AS agentNames ON agentNames.id = agents.id
        LEFT JOIN (
          SELECT short_names.resource_id AS "id", COALESCE(json_object_agg(DISTINCT short_names.lang, short_names.content) FILTER (WHERE short_names.lang IS NOT NULL))::json AS "shortName"
          FROM short_names
          GROUP BY short_names.resource_id
        ) AS agentShortNames ON agentShortNames.id = agents.id
        LEFT JOIN (
          SELECT urls.resource_id AS "id", COALESCE(json_object_agg(DISTINCT urls.lang, urls.content) FILTER (WHERE urls.lang IS NOT NULL))::json AS "url"
          FROM urls
          GROUP BY urls.resource_id
        ) AS agentUrls ON agentUrls.id = agents.id
        LEFT JOIN (
          SELECT contact_points.agent_id AS "id",
            json_agg(json_build_object(
              'availableHours', contact_points.available_hours,
              'email', contact_points.email,
              'telephone', contact_points.telephone,
              'address', json_build_object(
                'city', contactAddress.city,
                'complement', contactAddress.complement,
                'country', contactAddress.country,
                'region', contactAddress.region,
                'street', contactAddress.street,
                'type', contactAddress.type,
                'zipcode', contactAddress.zipcode
              )
            )) AS "contactPoints"
          FROM contact_points
          LEFT JOIN (
            SELECT
              addresses.id AS "address_id",
              addresses.type AS "type",
              addresses.country AS "country",
              addresses.zipcode AS "zipcode",
              COALESCE(JSON_OBJECT_AGG(DISTINCT CITIES.LANG, CITIES.CONTENT) FILTER (WHERE CITIES.LANG IS NOT NULL))::JSON AS "city",
              COALESCE(JSON_OBJECT_AGG(DISTINCT complements.LANG, complements.CONTENT) FILTER (WHERE complements.LANG IS NOT NULL))::JSON AS "complement",
              COALESCE(JSON_OBJECT_AGG(DISTINCT regions.LANG, regions.CONTENT) FILTER (WHERE regions.LANG IS NOT NULL))::JSON AS "region",
              COALESCE(JSON_OBJECT_AGG(DISTINCT streets.LANG, streets.CONTENT) FILTER (WHERE streets.LANG IS NOT NULL))::JSON AS "street"
            FROM addresses
            LEFT JOIN cities ON cities.address_id = addresses.id
            LEFT JOIN complements ON complements.address_id = addresses.id
            LEFT JOIN regions ON regions.address_id = addresses.id
            LEFT JOIN streets ON streets.address_id = addresses.id
            GROUP BY addresses.id
          ) AS contactAddress ON contactAddress.address_id = contact_points.address_id
          GROUP BY contact_points.agent_id
        ) AS agentContacts ON agentContacts.id = agents.id
        ${_.isString(id) ? `WHERE agents.id = '${id}'` : ""};
      `
      )
      .then((result) => result?.rows)
      // .then((result) => _.first(result?.rows))
      .catch((err) => {
        throw err;
      })
  );
}

function selectCategoryFromId(connection, id) {
  return connection
    .raw(
      `
      SELECT
        categories.id AS "id",
        categories.resource_id AS "resource_id",
        categories.namespace AS "namespace",
        COALESCE(data_provider) AS "dataProvider",
        COALESCE(last_update) AS "lastUpdate",
        COALESCE(type) AS "type",
        COALESCE(categoryAbstracts.abstract, 'null') AS  "abstract",
        COALESCE(categoryDescriptions.description, 'null') AS  "description",
        COALESCE(categoryNames.name, 'null') AS  "name",
        COALESCE(coveredTypes."resourceTypes") AS "resourceTypes",
        COALESCE(categoryShortNames."shortName", 'null') AS  "shortName",
        COALESCE(to_json(resources.simple_url), categoryUrls.url, 'null') AS  "url",
        COALESCE(childrenCategories.children) AS  "children",
        COALESCE(parentCategories.parents) AS  "parents"
      FROM categories
      LEFT JOIN resources ON resources.id = categories.resource_id
      LEFT JOIN (
        SELECT category_id, json_agg(to_json("type")) AS "resourceTypes"
        FROM category_covered_types
        GROUP BY category_id
      ) AS coveredTypes ON coveredTypes.category_id = categories.id
      LEFT JOIN (
        SELECT parent_id AS "parent_id",
          json_agg(
            json_build_object(
              'id', child_id,
              'type', 'categories'
            )
          ) AS "children"
        FROM category_specializations
        GROUP BY parent_id
      ) AS childrenCategories ON childrenCategories.parent_id = categories.id
      LEFT JOIN (
        SELECT child_id AS "child_id",
          json_agg(
            json_build_object(
              'id', parent_id,
              'type', 'categories'
            )
          ) AS "parents"
        FROM category_specializations
        GROUP BY child_id
      ) AS parentCategories ON parentCategories.child_id = categories.id
      LEFT JOIN (
        SELECT abstracts.resource_id AS "id", COALESCE(json_object_agg(DISTINCT abstracts.lang, abstracts.content) FILTER (WHERE abstracts.lang IS NOT NULL))::json AS "abstract"
        FROM abstracts
        GROUP BY abstracts.resource_id
      ) AS categoryAbstracts ON categoryAbstracts.id = categories.resource_id
      LEFT JOIN (
        SELECT descriptions.resource_id AS "id", COALESCE(json_object_agg(DISTINCT descriptions.lang, descriptions.content) FILTER (WHERE descriptions.lang IS NOT NULL))::json AS "description"
        FROM descriptions
        GROUP BY descriptions.resource_id
      ) AS categoryDescriptions ON categoryDescriptions.id = categories.resource_id
      LEFT JOIN (
        SELECT names.resource_id AS "id", COALESCE(json_object_agg(DISTINCT names.lang, names.content) FILTER (WHERE names.lang IS NOT NULL))::json AS "name"
        FROM names
        GROUP BY names.resource_id
      ) AS categoryNames ON categoryNames.id = categories.resource_id
      LEFT JOIN (
        SELECT short_names.resource_id AS "id", COALESCE(json_object_agg(DISTINCT short_names.lang, short_names.content) FILTER (WHERE short_names.lang IS NOT NULL))::json AS "shortName"
        FROM short_names
        GROUP BY short_names.resource_id
      ) AS categoryShortNames ON categoryShortNames.id = categories.resource_id
      LEFT JOIN (
        SELECT urls.resource_id AS "id", COALESCE(json_object_agg(DISTINCT urls.lang, urls.content) FILTER (WHERE urls.lang IS NOT NULL))::json AS "url"
        FROM urls
        GROUP BY urls.resource_id
      ) AS categoryUrls ON categoryUrls.id = categories.resource_id
      ${_.isString(id) ? `WHERE categories.id = '${id}'` : ""};
      `
    )
    .then((result) => result?.rows)
    .catch((err) => {
      throw err;
    });
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
  const columns = { [resourceCategories.categorizedResourceId]: resourceId };
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

function deleteResource(connection, resourceId, type) {
  const columns = {
    [resources.id]: resourceId,
    [resources.type]: type,
  };
  return connection(resources._name).where(columns).del();
}

function deleteCategory(connection, id) {
  const columns = {
    [categories.id]: id,
  };
  return connection(categories._name).where(columns).del();
}

function update(connection, tableName, where, columns, returning) {
  const returnColumns = getReturningColumns(returning);
  return connection(tableName).where(where).update(columns).returning(returnColumns);
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
    [resourceCategories.categorizedResourceId]: resourceId,
  };

  checkNotNullable(resourceId, resourceCategories.categorizedResourceId);

  return connection(resourceCategories._name).where(columns).del();
}

function deleteMultimediaDescriptions(connection, descriptionId) {
  const columns = {
    [multimediaDescriptions.resourceId]: descriptionId,
  };

  checkNotNullable(descriptionId, multimediaDescriptions.resourceId);

  return connection(multimediaDescriptions._name).where(columns).del();
}

function deleteCategoryCoveredTypes(connection, categoryId) {
  const columns = {
    [categoryCoveredTypes.categoryId]: categoryId,
  };

  checkNotNullable(categoryId, categoryCoveredTypes.categoryId);

  return connection(categoryCoveredTypes._name).where(columns).del();
}

function deleteChildrenCategories(connection, parentId) {
  const columns = {
    [categorySpecializations.parentId]: parentId,
  };

  checkNotNullable(parentId, categorySpecializations.parentId);

  return connection(categorySpecializations._name).where(columns).del();
}

function deleteParentCategories(connection, childId) {
  const columns = {
    [categorySpecializations.childId]: childId,
  };

  checkNotNullable(childId, categorySpecializations.childId);

  return connection(categorySpecializations._name).where(columns).del();
}

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
  insertCategoryCoveredType,
  insertCategorySpecialization,
  selectAgentFromId,
  selectCategoryFromId,
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
  deleteCategory,
  updateResource,
  updateCategory,
  deleteAbstracts,
  deleteDescriptions,
  deleteNames,
  deleteShortNames,
  deleteUrls,
  deleteContactPoints,
  deleteResourceText,
  deleteAddressText,
  insertResourceText,
  insertAddressText,
  insertResourceCategory,
  insertMultimediaDescriptions,
  deleteResourceCategories,
  deleteMultimediaDescriptions,
  deleteCategoryCoveredTypes,
  deleteChildrenCategories,
  deleteParentCategories,
};
