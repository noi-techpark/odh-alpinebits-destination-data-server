const _ = require("lodash");
const knex = require("../../db/connect");
const dbFn = require("../../db/functions");
const db = require("../../db");

const { schemas } = require("../../db");
const { abstracts, descriptions, names, shortNames, urls, cities, complements, regions, streets } = schemas;

const colors = {
  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgWhite: "\x1b[37m",
};

function logNoChange(key) {
  console.log("NO CHANGE ON", key);
}

function logAddition(key, oldValue, newValue) {
  console.log(`${colors.FgGreen}ADD ${key}${colors.FgWhite}`, oldValue, "=>", newValue);
}

function logRemoval(key, oldValue, newValue) {
  console.log(`${colors.FgRed}REMOVE ${key}${colors.FgWhite}`, oldValue, "=>", newValue);
}

function logUpdate(key, oldValue, newValue) {
  console.log(`${colors.FgYellow}UPDATE ${key}${colors.FgWhite}`, oldValue, "=>", newValue);
}

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

    return dbFn.insertResource(this.connection, columns).then((resourceId) => {
      resource.id = resourceId;
      return Promise.all([
        this.insertResourceText(abstracts._name, resource.abstract, resource.id),
        this.insertResourceText(descriptions._name, resource.description, resource.id),
        this.insertResourceText(names._name, resource.name, resource.id),
        this.insertResourceText(shortNames._name, resource.shortName, resource.id),
        this.insertResourceText(urls._name, resource.url, resource.id),
        this.insertResourceCategories(resource),
        this.insertMultimediaDescriptions(resource),
      ]);
    });
  }

  updateResource(resource) {
    const columns = this.mapResourceToColumns(resource);

    return Promise.all([
      dbFn.updateResource(this.connection, columns),
      this.updateResourceText(abstracts._name, resource.abstract, resource.id),
      this.updateResourceText(descriptions._name, resource.description, resource.id),
      this.updateResourceText(names._name, resource.name, resource.id),
      this.updateResourceText(shortNames._name, resource.shortName, resource.id),
      this.updateResourceText(urls._name, resource.url, resource.id),
      this.updateResourceCategories(resource),
      this.updateMultimediaDescriptions(resource),
    ]).then(_.flatten);
  }

  insertResourceText(tableName, text, resourceId) {
    const inserts = !_.isObject(text)
      ? []
      : _.entries(text)?.map(([lang, content]) =>
          dbFn.insertResourceText(this.connection, tableName, resourceId, lang, content)
        );
    return Promise.all(inserts);
  }

  updateResourceText(tableName, text, resourceId) {
    return dbFn
      .deleteResourceText(this.connection, tableName, resourceId)
      .then(() => this.insertResourceText(tableName, text, resourceId));
  }

  insertResourceCategories(resource) {
    const inserts = resource?.categories?.map((category) =>
      dbFn.insertResourceCategory(this.connection, resource.id, category.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateResourceCategories(resource) {
    return dbFn
      .deleteResourceCategories(this.connection, resource.id)
      .then(() => this.insertResourceCategories(resource));
  }

  insertMultimediaDescriptions(resource) {
    const inserts = resource?.multimediaDescriptions?.map((description) =>
      dbFn.insertMultimediaDescriptions(this.connection, resource.id, description.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateMultimediaDescriptions(resource) {
    return dbFn
      .deleteMultimediaDescriptions(this.connection, resource.id)
      .then(() => this.insertMultimediaDescriptions(resource));
  }

  insertAddress(address) {
    if (!address) return Promise.resolve();

    const columns = this.mapAddressToColumns(address);

    return dbFn.insertAddress(this.connection, columns).then((rows) => {
      address.id = _.first(rows);
      return Promise.all([
        this.insertAddressText(cities._name, address.city, address.id),
        this.insertAddressText(complements._name, address.complement, address.id),
        this.insertAddressText(regions._name, address.region, address.id),
        this.insertAddressText(streets._name, address.street, address.id),
      ]).then(() => address.id);
    });
  }

  insertAddressText(tableName, text, addressId) {
    const inserts = !_.isObject(text)
      ? []
      : _.entries(text)?.map(([lang, content]) =>
          dbFn.insertAddressText(this.connection, tableName, addressId, lang, content)
        );
    return Promise.all(inserts);
  }

  mapResourceToColumns(resource) {
    return {
      [schemas.resources.id]: resource?.id,
      [schemas.resources.type]: resource?.type,
      [schemas.resources.dataProvider]: resource?.dataProvider,
      [schemas.resources.lastUpdate]: resource?.lastUpdate,
      [schemas.resources.simpleUrl]: _.isString(resource?.url) ? resource?.url : null,
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

  shouldUpdate(_old, _new) {
    let result = false;

    for (const key of _.keys(_old)) {
      if (["lastUpdate"].includes(key)) continue;

      const oldValue = _.get(_old, key);
      const newValue = _.get(_new, key);

      if (this.isAddition(oldValue, newValue)) {
        logAddition(key, oldValue, newValue);
        result = true;
      } else if (this.isRemoval(oldValue, newValue)) {
        logRemoval(key, oldValue, newValue);
        result = true;
      } else if (this.isUpdate(oldValue, newValue)) {
        logUpdate(key, oldValue, newValue);
        result = true;
      } else {
        logNoChange(key);
      }
    }

    return result;
  }

  isAddition(oldValue, newValue) {
    return !_.isNil(newValue) && _.isNull(oldValue);
  }

  isRemoval(oldValue, newValue) {
    return _.isNull(newValue) && !_.isNil(oldValue);
  }

  isUpdate(oldValue, newValue) {
    return !_.isNil(newValue) && !_.isEqual(oldValue, newValue);
  }
}

module.exports = { ResourceConnector };
