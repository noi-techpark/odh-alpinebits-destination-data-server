const _ = require("lodash");
const knex = require("../../db/connect");
const dbFn = require("../../db/functions");
const { schemas } = require("../../db");
const db = require("../../db");
const { Resource } = require("../../model/destinationdata2022/resource");
const { Text } = require("../../model/destinationdata2022/datatypes");

class ResourceConnector {
  constructor(request) {
    this.request = request;
    this.connection = knex;
  }

  runTransaction(fn) {
    return knex
      .transaction((trx) =>
        Promise.resolve((this.connection = trx))
          .then(fn)
          .then((ret) => {
            console.log("transaction function completed");
            return ret;
          })
          .catch((err) => {
            throw err;
          })
      )
      .then((ret) => {
        console.log("transaction complete");
        this.connection.commit();
        return ret;
      })
      .catch((err) => {
        console.log("transaction failure, rollback");
        this.connection.rollback();
        throw err;
      })
      .finally(() => {
        console.log("end of transaction");
        this.connection = knex;
      });
  }

  retrieveResource() {
    const resourceId = this.request?.params?.id;
    console.log(resourceId);

    return Promise.resolve("done");
  }

  insertResource(resource) {
    const columns = this.mapResourceToColumns(resource);

    return dbFn
      .insertResource(this.connection, columns)
      .then((resourceId) => (resource.id = resourceId))
      .then(() => this.insertResourceAbstract(resource))
      .then(() => this.insertResourceDescription(resource))
      .then(() => this.insertResourceName(resource))
      .then(() => this.insertResourceShortName(resource))
      .then(() => this.insertResourceUrl(resource))
      .then(() => this.insertCategories(resource))
      .then(() => resource.id);
  }

  insertResourceAbstract(resource) {
    const inserts = _.keys(resource.abstract)
      .map((lang) => this.mapResourceTextToColumns(resource.id, lang, _.get(resource.abstract, lang)))
      .map((columns) => dbFn.insertAbstract(this.connection, columns));
    return Promise.all(inserts);
  }

  insertResourceDescription(resource) {
    const inserts = _.keys(resource.description)
      .map((lang) => this.mapResourceTextToColumns(resource.id, lang, _.get(resource.description, lang)))
      .map((columns) => dbFn.insertDescription(this.connection, columns));
    return Promise.all(inserts);
  }

  insertResourceName(resource) {
    const inserts = _.keys(resource.name)
      .map((lang) => this.mapResourceTextToColumns(resource.id, lang, _.get(resource.name, lang)))
      .map((columns) => dbFn.insertName(this.connection, columns));
    return Promise.all(inserts);
  }

  insertResourceShortName(resource) {
    const inserts = _.keys(resource.shortName)
      .map((lang) => this.mapResourceTextToColumns(resource.id, lang, _.get(resource.shortName, lang)))
      .map((columns) => dbFn.insertShortName(this.connection, columns));
    return Promise.all(inserts);
  }

  insertResourceUrl(resource) {
    if (!_.isObject(resource.url)) return;

    const inserts = _.keys(resource.url)
      .map((lang) => this.mapResourceTextToColumns(resource.id, lang, _.get(resource.url, lang)))
      .map((columns) => dbFn.insertUrl(this.connection, columns));
    return Promise.all(inserts);
  }

  insertCategories(resource) {
    const inserts = resource?.categories?.map((category) => this.insertCategory(category, resource)) || [];
    return Promise.all(inserts);
  }

  insertCategory(category, resource) {
    const columns = this.mapResourceCategoryToColumns(category.id, resource.id);

    return dbFn.insertResourceCategory(this.connection, columns);
  }

  insertAddress(address) {
    if (!address) return Promise.resolve();

    const columns = this.mapAddressToColumns(address);
    let addressId;

    return dbFn
      .insertAddress(this.connection, columns)
      .then((ret) => (addressId = _.first(ret)))
      .then(() => this.insertAddressCity(address, addressId))
      .then(() => this.insertAddressComplement(address, addressId))
      .then(() => this.insertAddressRegion(address, addressId))
      .then(() => this.insertAddressStreet(address, addressId))
      .then(() => addressId);
  }

  insertAddressCity(address, addressId) {
    const inserts = _.keys(address.city)
      .map((lang) => this.mapAddressTextToColumns(addressId, lang, _.get(address.city, lang)))
      .map((columns) => dbFn.insertCity(this.connection, columns));
    return Promise.all(inserts);
  }

  insertAddressComplement(address, addressId) {
    const inserts = _.keys(address.complement)
      .map((lang) => this.mapAddressTextToColumns(addressId, lang, _.get(address.complement, lang)))
      .map((columns) => dbFn.insertComplement(this.connection, columns));
    return Promise.all(inserts);
  }

  insertAddressRegion(address, addressId) {
    const inserts = _.keys(address.region)
      .map((lang) => this.mapAddressTextToColumns(addressId, lang, _.get(address.region, lang)))
      .map((columns) => dbFn.insertRegion(this.connection, columns));
    return Promise.all(inserts);
  }

  insertAddressStreet(address, addressId) {
    const inserts = _.keys(address.street)
      .map((lang) => this.mapAddressTextToColumns(addressId, lang, _.get(address.street, lang)))
      .map((columns) => dbFn.insertStreet(this.connection, columns));
    return Promise.all(inserts);
  }

  mapResourceToColumns(resource) {
    return {
      [schemas.resources.resourceId]: resource?.id,
      [schemas.resources.type]: resource?.type,
      [schemas.resources.dataProvider]: resource?.dataProvider,
      [schemas.resources.lastUpdate]: resource?.lastUpdate,
      [schemas.resources.simpleUrl]: _.isString(resource?.url) ? resource?.url : undefined,
    };
  }

  mapResourceCategoryToColumns(categoryId, agentId) {
    return {
      [schemas.resourceCategories.categoryId]: categoryId,
      [schemas.resourceCategories.categorizedResourceId]: agentId,
    };
  }

  mapResourceTextToColumns(resourceId, lang, content) {
    return {
      [schemas.names.resourceId]: resourceId,
      [schemas.names.lang]: lang,
      [schemas.names.content]: content,
    };
  }

  mapAddressTextToColumns(addressId, lang, content) {
    return {
      [schemas.cities.addressId]: addressId,
      [schemas.cities.lang]: lang,
      [schemas.cities.content]: content,
    };
  }

  mapAddressToColumns(address) {
    return {
      [schemas.addresses.country]: address?.country,
      [schemas.addresses.type]: address?.type,
      [schemas.addresses.zipcode]: address?.zipcode,
    };
  }

  selectResourceFromId(resourceId, resource) {
    return dbFn
      .selectResourceFromId(this.connection, resourceId)
      .then(_.first)
      .then((row) => this.mapRowToResource(row, resource))
      .then(() => this.selectResourceRelatedDataFromId(resourceId, resource))
      .then(() => resource);
  }

  selectResourceRelatedDataFromId(resourceId, resource) {
    return Promise.all([
      this.selectAbstractsFromId(resourceId, resource),
      this.selectDescriptionsFromId(resourceId, resource),
      this.selectNamesFromId(resourceId, resource),
      this.selectShortNamesFromId(resourceId, resource),
      this.selectUrlsFromId(resourceId, resource),
      this.selectCategoriesFromId(resourceId, resource),
    ]);
  }

  selectAbstractsFromId(resourceId, resource) {
    return dbFn
      .selectAbstractsFromId(this.connection, resourceId)
      .then((rows) => rows.map((row) => this.mapRowToResourceAbstract(row, resource)));
  }

  selectDescriptionsFromId(resourceId, resource) {
    return dbFn
      .selectDescriptionsFromId(this.connection, resourceId)
      .then((rows) => rows.map((row) => this.mapRowToResourceDescription(row, resource)));
  }

  selectNamesFromId(resourceId, resource) {
    return dbFn
      .selectNamesFromId(this.connection, resourceId)
      .then((rows) => rows.map((row) => this.mapRowToResourceName(row, resource)));
  }

  selectShortNamesFromId(resourceId, resource) {
    return dbFn
      .selectShortNamesFromId(this.connection, resourceId)
      .then((rows) => rows.map((row) => this.mapRowToResourceShortName(row, resource)));
  }

  selectUrlsFromId(resourceId, resource) {
    return dbFn
      .selectUrlsFromId(this.connection, resourceId)
      .then((rows) => rows.map((row) => this.mapRowToResourceUrl(row, resource)));
  }

  selectCategoriesFromId(resourceId, resource) {
    return dbFn
      .selectCategoriesFromId(this.connection, resourceId)
      .then((rows) => rows.map((row) => this.mapRowToResourceCategory(row, resource)));
  }

  selectAddressTextsFromId(addressId, address) {
    return Promise.all([
      this.selectCitiesFromId(addressId, address),
      this.selectComplementsFromId(addressId, address),
      this.selectRegionsFromId(addressId, address),
      this.selectStreetsFromId(addressId, address),
    ]);
  }

  selectCitiesFromId(addressId, address) {
    return dbFn
      .selectCitiesFromId(this.connection, addressId)
      .then((rows) => rows.map((row) => this.mapRowToAddressCity(row, address)));
  }

  selectComplementsFromId(addressId, address) {
    return dbFn
      .selectComplementsFromId(this.connection, addressId)
      .then((rows) => rows.map((row) => this.mapRowToAddressComplement(row, address)));
  }

  selectRegionsFromId(addressId, address) {
    return dbFn
      .selectRegionsFromId(this.connection, addressId)
      .then((rows) => rows.map((row) => this.mapRowToAddressRegion(row, address)));
  }

  selectStreetsFromId(addressId, address) {
    return dbFn
      .selectStreetsFromId(this.connection, addressId)
      .then((rows) => rows.map((row) => this.mapRowToAddressStreet(row, address)));
  }

  mapRowToResource(row, resource) {
    resource.id = row[schemas.resources.resourceId] ?? null;
    resource.type = row[schemas.resources.type] ?? null;
    resource.dataProvider = row[schemas.resources.dataProvider] ?? null;
    resource.lastUpdate = row[schemas.resources.lastUpdate] ?? null;
    resource.url = row[schemas.resources.simpleUrl] ?? null;

    return resource;
  }

  mapRowToResourceAbstract(row, resource) {
    const lang = row[schemas.abstracts.lang];
    const content = row[schemas.abstracts.content];

    resource.abstract = resource.abstract ?? new Text();
    resource.abstract.addContent(lang, content);

    return resource;
  }

  mapRowToResourceDescription(row, resource) {
    const lang = row[schemas.descriptions.lang];
    const content = row[schemas.descriptions.content];

    resource.descriptions = resource.descriptions ?? new Text();
    resource.descriptions.addContent(lang, content);

    return resource;
  }

  mapRowToResourceName(row, resource) {
    const lang = row[schemas.names.lang];
    const content = row[schemas.names.content];

    resource.name = resource.name ?? new Text();
    resource.name.addContent(lang, content);

    return resource;
  }

  mapRowToResourceShortName(row, resource) {
    const lang = row[schemas.shortNames.lang];
    const content = row[schemas.shortNames.content];

    resource.shortName = resource.shortName ?? new Text();
    resource.shortName.addContent(lang, content);

    return resource;
  }

  mapRowToResourceUrl(row, resource) {
    if (!_.isEmpty(resource.url)) return resource;

    const lang = row[schemas.urls.lang];
    const content = row[schemas.urls.content];

    resource.url = resource.url ?? new Text();
    resource.url.addContent(lang, content);

    return resource;
  }

  mapRowToResourceCategory(row, resource) {
    const categoryId = row[schemas.resourceCategories.categoryId];
    resource.addCategoryReference(categoryId);
    return resource;
  }

  mapRowToAddressCity(row, address) {
    const lang = row[schemas.cities.lang];
    const content = row[schemas.cities.content];

    address.city = address.city ?? new Text();
    address.city.addContent(lang, content);

    return address;
  }

  mapRowToAddressComplement(row, address) {
    const lang = row[schemas.complements.lang];
    const content = row[schemas.complements.content];

    address.complement = address.complement ?? new Text();
    address.complement.addContent(lang, content);

    return address;
  }

  mapRowToAddressRegion(row, address) {
    const lang = row[schemas.regions.lang];
    const content = row[schemas.regions.content];

    address.region = address.region ?? new Text();
    address.region.addContent(lang, content);

    return address;
  }

  mapRowToAddressStreet(row, address) {
    const lang = row[schemas.streets.lang];
    const content = row[schemas.streets.content];

    address.street = address.street ?? new Text();
    address.street.addContent(lang, content);

    return address;
  }
}

module.exports = { ResourceConnector };
