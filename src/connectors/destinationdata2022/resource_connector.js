const _ = require("lodash");
const knex = require("../../db/connect");
const dbFn = require("../../db/functions");
const { schemas } = require("../../db");
const db = require("../../db");

class ResourceConnector {
  constructor(request) {
    this.request = request;
    this.connection = knex;
  }

  runTransaction(fn) {
    let returnValue = Promise.resolve();

    return knex
      .transaction((trx) =>
        Promise.resolve((this.connection = trx))
          .then(fn)
          .then((ret) => (returnValue = ret))
          .then(() => console.log("transaction function completed", returnValue))
          .catch((err) => {
            throw err;
          })
      )
      .then(() => console.log("transaction complete"))
      .then(() => this.connection.commit())
      .then(() => returnValue)
      .catch((err) => {
        this.connection.rollback();
        throw err;
      })
      .finally(() => {
        console.log("end of transaction");
        this.connection = knex;
      });
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
