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
        // TODO: re-enable commits
        this.connection.commit();
        // this.connection.rollback();
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
      .then(() =>
        Promise.all([
          this.insertResourceAbstract(resource),
          this.insertResourceDescription(resource),
          this.insertResourceName(resource),
          this.insertResourceShortName(resource),
          this.insertResourceUrl(resource),
          this.insertCategories(resource),
        ])
      )
      .then(() => resource.id);
  }

  insertResourceAbstract(resource) {
    const inserts = _.keys(resource.abstract).map((lang) => {
      const columns = this.mapResourceTextToColumns(resource.id, lang, _.get(resource.abstract, lang));
      return dbFn.insertAbstract(this.connection, columns);
    });
    return Promise.all(inserts ?? []);
  }

  insertResourceDescription(resource) {
    const inserts = _.keys(resource.description).map((lang) => {
      const columns = this.mapResourceTextToColumns(resource.id, lang, _.get(resource.description, lang));
      return dbFn.insertDescription(this.connection, columns);
    });
    return Promise.all(inserts ?? []);
  }

  insertResourceName(resource) {
    const inserts = _.keys(resource.name).map((lang) => {
      const columns = this.mapResourceTextToColumns(resource.id, lang, _.get(resource.name, lang));
      return dbFn.insertName(this.connection, columns);
    });
    return Promise.all(inserts ?? []);
  }

  insertResourceShortName(resource) {
    const inserts = _.keys(resource.shortName).map((lang) => {
      const columns = this.mapResourceTextToColumns(resource.id, lang, _.get(resource.shortName, lang));
      return dbFn.insertShortName(this.connection, columns);
    });
    return Promise.all(inserts ?? []);
  }

  insertResourceUrl(resource) {
    if (!_.isObject(resource.url)) return;

    const inserts = _.keys(resource.url).map((lang) => {
      const columns = this.mapResourceTextToColumns(resource.id, lang, _.get(resource.url, lang));
      return dbFn.insertUrl(this.connection, columns);
    });
    return Promise.all(inserts ?? []);
  }

  insertCategories(resource) {
    const inserts = resource?.categories?.map((category) => this.insertCategory(category, resource));
    return Promise.all(inserts ?? []);
  }

  insertCategory(category, resource) {
    const columns = this.mapResourceCategoryToColumns(category.id, resource.id);
    return dbFn.insertResourceCategory(this.connection, columns);
  }

  insertAddress(address) {
    if (!address) return Promise.resolve();

    const columns = this.mapAddressToColumns(address);

    return dbFn.insertAddress(this.connection, columns).then((rows) => {
      const addressId = _.first(rows);
      return Promise.all([
        this.insertAddressCity(address, addressId),
        this.insertAddressComplement(address, addressId),
        this.insertAddressRegion(address, addressId),
        this.insertAddressStreet(address, addressId),
      ]).then(() => addressId);
    });
  }

  insertAddressCity(address, addressId) {
    const inserts = _.keys(address.city)?.map((lang) => {
      const columns = this.mapAddressTextToColumns(addressId, lang, _.get(address.city, lang));
      return dbFn.insertCity(this.connection, columns);
    });
    return Promise.all(inserts ?? []);
  }

  insertAddressComplement(address, addressId) {
    const inserts = _.keys(address.complement)?.map((lang) => {
      const columns = this.mapAddressTextToColumns(addressId, lang, _.get(address.complement, lang));
      return dbFn.insertComplement(this.connection, columns);
    });
    return Promise.all(inserts ?? []);
  }

  insertAddressRegion(address, addressId) {
    const inserts = _.keys(address.region)?.map((lang) => {
      const columns = this.mapAddressTextToColumns(addressId, lang, _.get(address.region, lang));
      return dbFn.insertRegion(this.connection, columns);
    });
    return Promise.all(inserts ?? []);
  }

  insertAddressStreet(address, addressId) {
    const inserts = _.keys(address.street)?.map((lang) => {
      const columns = this.mapAddressTextToColumns(addressId, lang, _.get(address.street, lang));
      return dbFn.insertStreet(this.connection, columns);
    });
    return Promise.all(inserts ?? []);
  }

  updateResource(resource) {
    const columns = this.mapResourceToColumns(resource);
    return Promise.all([
      dbFn.updateResource(this.connection, columns),
      this.updateResourceAbstract(resource),
      this.updateResourceDescription(resource),
      this.updateResourceName(resource),
      this.updateResourceShortName(resource),
      this.updateResourceUrl(resource),
      // this.updateResourceCategories(resource),
    ]).then((promises) => {
      console.log("promises", JSON.stringify(promises, null, 2));
      return promises;
    });
  }

  updateResourceAbstract(resource) {
    const updates = _.keys(resource.abstract)?.map((lang) => {
      const columns = this.mapResourceTextToColumns(resource.id, lang, _.get(resource.abstract, lang));
      return dbFn
        .deleteAbstracts(this.connection, resource.id)
        .then(() => dbFn.insertAbstract(this.connection, columns));
    });
    return Promise.all(updates ?? []);
  }

  updateResourceDescription(resource) {
    const updates = _.keys(resource.description)?.map((lang) => {
      const columns = this.mapResourceTextToColumns(resource.id, lang, _.get(resource.description, lang));
      return dbFn
        .deleteDescriptions(this.connection, resource.id)
        .then(() => dbFn.insertDescription(this.connection, columns));
    });
    return Promise.all(updates ?? []);
  }

  updateResourceName(resource) {
    const updates = _.keys(resource.name)?.map((lang) => {
      const columns = this.mapResourceTextToColumns(resource.id, lang, _.get(resource.name, lang));
      return dbFn.deleteNames(this.connection, resource.id).then(() => dbFn.insertName(this.connection, columns));
    });
    return Promise.all(updates ?? []);
  }

  updateResourceShortName(resource) {
    const updates = _.keys(resource.shortName)?.map((lang) => {
      const columns = this.mapResourceTextToColumns(resource.id, lang, _.get(resource.shortName, lang));
      return dbFn
        .deleteShortNames(this.connection, resource.id)
        .then(() => dbFn.insertShortName(this.connection, columns));
    });
    return Promise.all(updates ?? []);
  }

  updateResourceUrl(resource) {
    const updates = _.keys(resource.url)?.map((lang) => {
      const columns = this.mapResourceTextToColumns(resource.id, lang, _.get(resource.url, lang));
      return dbFn.deleteUrls(this.connection, resource.id).then(() => dbFn.insertUrl(this.connection, columns));
    });
    return Promise.all(updates ?? []);
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

  checkLastUpdate(serversResource, clientsResource) {
    const clientLastUpdate = clientsResource?.lastUpdate?.toISOString();
    const serverLastUpdate = serversResource?.lastUpdate?.toISOString();

    if (clientLastUpdate < serverLastUpdate) {
      throw new Error("Outdated: expected last update at " + serversResource.lastUpdate);
    } else if (clientLastUpdate > serverLastUpdate) {
      throw new Error("Ahead: expected last update at " + serversResource.lastUpdate);
    }
  }

  throwNoUpdate(serversResource) {
    const err = new Error("Not updated: no effective change");
    err.resource = serversResource;
    throw err;
  }
}

module.exports = { ResourceConnector };
