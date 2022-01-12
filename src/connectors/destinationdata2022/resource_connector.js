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

  async runTransaction(fn) {
    return knex
      .transaction(async (trx) => {
        Promise.resolve((this.connection = trx))
          .then(fn)
          .catch((err) => {
            console.log("error 19", err);
          });
      })
      .then((asd) => {
        console.log("transaction complete", asd);
        this.connection.commit();
      })
      .catch((err) => {
        console.log("error", err);
        this.connection.rollback();
        throw err;
      })
      .finally(() => {
        console.log("end of transaction");
        this.connection = knex;
      });
  }

  async insertResource(resource) {
    const columns = this.mapResourceToColumns(resource);

    resource.id = await dbFn.insertResource(this.connection, columns);

    this.insertResourceAbstract(resource);
    this.insertResourceDescription(resource);
    this.insertResourceName(resource);
    this.insertResourceShortName(resource);
    this.insertResourceUrl(resource);

    return resource.id;
  }

  async insertResourceAbstract(resource) {
    const inserts = _.keys(resource.abstract)
      .map((lang) => this.mapTextToColumns(resource.id, lang, _.get(resource.abstract, lang)))
      .map((columns) => dbFn.insertAbstract(this.connection, columns));
    return Promise.all(inserts);
  }

  async insertResourceDescription(resource) {
    const inserts = _.keys(resource.description)
      .map((lang) => this.mapTextToColumns(resource.id, lang, _.get(resource.description, lang)))
      .map((columns) => dbFn.insertDescription(this.connection, columns));
    return Promise.all(inserts);
  }

  async insertResourceName(resource) {
    const inserts = _.keys(resource.name)
      .map((lang) => this.mapTextToColumns(resource.id, lang, _.get(resource.name, lang)))
      .map((columns) => dbFn.insertName(this.connection, columns));
    return Promise.all(inserts);
  }

  async insertResourceShortName(resource) {
    const inserts = _.keys(resource.shortName)
      .map((lang) => this.mapTextToColumns(resource.id, lang, _.get(resource.shortName, lang)))
      .map((columns) => dbFn.insertShortName(this.connection, columns));
    return Promise.all(inserts);
  }

  async insertResourceUrl(resource) {
    if (!_.isObject(resource.url)) return;

    const inserts = _.keys(resource.url)
      .map((lang) => this.mapTextToColumns(resource.id, lang, _.get(resource.url, lang)))
      .map((columns) => dbFn.insertUrl(this.connection, columns));
    return Promise.all(inserts);
  }

  async insertAddress(address) {
    const columns = this.mapAddressToColumns(address);
    const addressId = await dbFn.insertAddress(this.connection, columns);
    console.log("returning address id", addressId);

    // this.insertAddressCity(address, addressId);
    // this.insertAddressComplement(address, addressId);
    // this.insertAddressRegion(address, addressId);
    // this.insertAddressStreet(address, addressId);

    return addressId;
  }

  async insertAddressCity(address, addressId) {
    const inserts = _.keys(address.city)
      .map((lang) => this.mapTextToColumns(addressId, lang, _.get(address.city, lang)))
      .map((columns) => dbFn.insertCity(this.connection, columns));
    return Promise.all(inserts);
  }

  async insertAddressComplement(address, addressId) {
    const inserts = _.keys(address.complement)
      .map((lang) => this.mapTextToColumns(addressId, lang, _.get(address.complement, lang)))
      .map((columns) => dbFn.insertComplement(this.connection, columns));
    return Promise.all(inserts);
  }

  async insertAddressRegion(address, addressId) {
    const inserts = _.keys(address.region)
      .map((lang) => this.mapTextToColumns(addressId, lang, _.get(address.region, lang)))
      .map((columns) => dbFn.insertRegion(this.connection, columns));
    return Promise.all(inserts);
  }

  async insertAddressStreet(address, addressId) {
    const inserts = _.keys(address.street)
      .map((lang) => this.mapTextToColumns(addressId, lang, _.get(address.street, lang)))
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

  mapTextToColumns(resourceId, lang, content) {
    return {
      [schemas.names.resourceId]: resourceId,
      [schemas.names.lang]: lang,
      [schemas.names.content]: content,
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
