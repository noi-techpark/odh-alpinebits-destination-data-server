const _ = require("lodash");
const knex = require("../../db/connect");
const dbFn = require("../../db/functions");
const { schemas } = require("../../db");

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

  create(resource) {
    throw new Error("Unimplemented");
  }

  retrieve(id) {
    throw new Error("Unimplemented");
  }

  update(resource) {
    throw new Error("Unimplemented");
  }

  delete(id) {
    throw new Error("Unimplemented");
  }

  deleteResource(id, type) {
    return dbFn.deleteResource(this.connection, id, type);
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
      [schemas.resources.id]: resource?.id,
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
}

module.exports = { ResourceConnector };
