const _ = require("lodash");
const knex = require("../db/connect");
const dbFn = require("../db/functions");

const { schemas, views } = require("../db");
const {
  abstracts,
  descriptions,
  names,
  shortNames,
  urls,
  cities,
  complements,
  regions,
  streets,
  resources,
  howToArrive,
  connections,
} = schemas;

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
  console.log(
    `${colors.FgGreen}ADD ${key}${colors.FgWhite}`,
    oldValue,
    "=>",
    newValue
  );
}

function logRemoval(key, oldValue, newValue) {
  console.log(
    `${colors.FgRed}REMOVE ${key}${colors.FgWhite}`,
    oldValue,
    "=>",
    newValue
  );
}

function logUpdate(key, oldValue, newValue) {
  console.log(
    `${colors.FgYellow}UPDATE ${key}${colors.FgWhite}`,
    oldValue,
    "=>",
    newValue
  );
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
        this.insertResourceText(
          abstracts._name,
          resource.abstract,
          resource.id
        ),
        this.insertResourceText(
          descriptions._name,
          resource.description,
          resource.id
        ),
        this.insertResourceText(names._name, resource.name, resource.id),
        this.insertResourceText(
          shortNames._name,
          resource.shortName,
          resource.id
        ),
        this.insertResourceText(urls._name, resource.url, resource.id),
        this.insertCategories(resource),
        // TODO: add insertFeatures
        this.insertMultimediaDescriptions(resource),
      ]);
    });
  }

  updateResource(resource) {
    const columns = this.mapResourceToColumns(resource);

    return Promise.all([
      dbFn.updateResource(this.connection, columns),
      this.updateResourceText(abstracts._name, resource.abstract, resource.id),
      this.updateResourceText(
        descriptions._name,
        resource.description,
        resource.id
      ),
      this.updateResourceText(names._name, resource.name, resource.id),
      this.updateResourceText(
        shortNames._name,
        resource.shortName,
        resource.id
      ),
      this.updateResourceText(urls._name, resource.url, resource.id),
      this.updateCategories(resource),
      // TODO: add updateFeatures
      this.updateMultimediaDescriptions(resource),
    ]).then(_.flatten);
  }

  insertResourceText(tableName, text, resourceId) {
    const inserts = !_.isObject(text)
      ? []
      : _.entries(text)?.map(([lang, content]) =>
          dbFn.insertResourceText(
            this.connection,
            tableName,
            resourceId,
            lang,
            content
          )
        );
    return Promise.all(inserts);
  }

  updateResourceText(tableName, text, resourceId) {
    return dbFn
      .deleteResourceText(this.connection, tableName, resourceId)
      .then(() => this.insertResourceText(tableName, text, resourceId));
  }

  insertCategories(resource) {
    const inserts = resource?.categories?.map((category) =>
      dbFn.insertResourceCategory(this.connection, resource.id, category.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateCategories(resource) {
    return dbFn
      .deleteResourceCategories(this.connection, resource.id)
      .then(() => this.insertCategories(resource));
  }

  insertMultimediaDescriptions(resource) {
    const inserts = resource?.multimediaDescriptions?.map((description) =>
      dbFn.insertMultimediaDescriptions(
        this.connection,
        resource.id,
        description.id
      )
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
        this.insertAddressText(
          complements._name,
          address.complement,
          address.id
        ),
        this.insertAddressText(regions._name, address.region, address.id),
        this.insertAddressText(streets._name, address.street, address.id),
      ]).then(() => address.id);
    });
  }

  insertAddressText(tableName, text, addressId) {
    const inserts = !_.isObject(text)
      ? []
      : _.entries(text)?.map(([lang, content]) =>
          dbFn.insertAddressText(
            this.connection,
            tableName,
            addressId,
            lang,
            content
          )
        );
    return Promise.all(inserts);
  }

  // TODO: add trigger to delete address when a place is deleted
  insertPlace(resource) {
    if (!resource) return Promise.resolve();

    return this.insertAddress(resource.address)
      .then((addressId) => {
        resource.addressId = addressId;
        const columns = this.mapPlaceToColumns(resource);
        return dbFn.insertPlace(this.connection, columns);
      })
      .then(() =>
        Promise.all([
          this.insertPlaceText(
            howToArrive._name,
            resource.howToArrive,
            resource.id
          ),
          this.insertSnowCondition(resource),
          this.insertPlaceConnections(resource),
        ])
      );
  }

  insertSnowCondition(resource) {
    if (!resource?.snowCondition) return Promise.resolve();

    const columns = this.mapSnowConditionToColumns(resource);
    return dbFn.insertSnowCondition(this.connection, columns);
  }

  updatePlace(resource) {
    return dbFn
      .deletePlace(this.connection, resource.id)
      .then(() => this.insertPlace(resource));
  }

  insertPlaceText(tableName, text, placeId) {
    const inserts = !_.isObject(text)
      ? []
      : _.entries(text)?.map(([lang, content]) =>
          dbFn.insertPlaceText(
            this.connection,
            tableName,
            placeId,
            lang,
            content
          )
        );
    return Promise.all(inserts);
  }

  insertPlaceConnections(resource) {
    const inserts = resource?.connections?.map((connection) =>
      dbFn.insertPlaceConnection(this.connection, resource.id, connection.id)
    );
    return Promise.all(inserts ?? []);
  }

  mapResourceToColumns(resource) {
    return {
      [resources.id]: resource?.id,
      [resources.type]: resource?.type,
      [resources.dataProvider]: resource?.dataProvider,
      [resources.lastUpdate]: resource?.lastUpdate,
      [resources.simpleUrl]: _.isString(resource?.url) ? resource?.url : null,
    };
  }

  mapAddressToColumns(address) {
    return {
      [schemas.addresses.country]: address?.country,
      [schemas.addresses.type]: address?.type,
      [schemas.addresses.zipcode]: address?.zipcode,
    };
  }

  mapPlaceToColumns(place) {
    return {
      [schemas.places.id]: place?.id,
      [schemas.places.addressId]: place?.addressId,
      [schemas.places.geometries]: place?.geometries
        ? JSON.stringify(place?.geometries)
        : undefined,
      [schemas.places.length]: place?.length,
      [schemas.places.maxAltitude]: place?.maxAltitude,
      [schemas.places.minAltitude]: place?.minAltitude,
      [schemas.places.openingHours]: place?.openingHours
        ? JSON.stringify(place?.openingHours)
        : undefined,
    };
  }

  mapSnowConditionToColumns(place) {
    return {
      [schemas.snowConditions.id]: place?.id,
      [schemas.snowConditions.baseSnow]: place?.snowCondition?.baseSnow,
      [schemas.snowConditions.baseSnowRangeLower]:
        place?.snowCondition?.baseSnowRange?.lower,
      [schemas.snowConditions.baseSnowRangeUpper]:
        place?.snowCondition?.baseSnowRange?.upper,
      [schemas.snowConditions.groomed]: place?.snowCondition?.groomed,
      [schemas.snowConditions.latestStorm]: place?.snowCondition?.latestStorm,
      [schemas.snowConditions.obtainedIn]: place?.snowCondition?.obtainedIn,
      [schemas.snowConditions.primarySurface]:
        place?.snowCondition?.primarySurface,
      [schemas.snowConditions.secondarySurface]:
        place?.snowCondition?.secondarySurface,
      [schemas.snowConditions.snowMaking]: place?.snowCondition?.snowMaking,
      [schemas.snowConditions.snowOverNight]:
        place?.snowCondition?.snowOverNight,
    };
  }

  // Removed by request
  checkLastUpdate(serversResource, clientsResource) {
    const clientLastUpdate = clientsResource?.lastUpdate?.toISOString();
    const serverLastUpdate = serversResource?.lastUpdate?.toISOString();

    if (clientLastUpdate < serverLastUpdate) {
      throw new Error(
        "Outdated: expected last update at " + serversResource.lastUpdate
      );
    } else if (clientLastUpdate > serverLastUpdate) {
      throw new Error(
        "Ahead: expected last update at " + serversResource.lastUpdate
      );
    }
  }

  throwNoUpdate(serversResource) {
    console.log("WARNING: Not updated: no effective change");
    console.log("Exception suppressed");
    // const err = new Error("Not updated: no effective change");
    // err.resource = serversResource;
    // throw err;
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

    return true;
    // TODO: re-enable no changes check if necessary
    // return result;
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

  ignoreNonListedFields(incomingMessage, updatedResource) {
    _.entries(incomingMessage).forEach(([field, value]) => {
      if (!_.isUndefined(value)) updatedResource[field] = value;
    });
  }

  getOffset() {
    if (_.isEmpty(this.request)) return 0;

    const pageSize = this.request?.query?.page?.size || 10;
    const pageNumber = this.request?.query?.page?.number || 1;

    return (pageNumber - 1) * pageSize;
  }

  getLimit() {
    if (_.isEmpty(this.request)) return 100;

    const pageSize = this.request?.query?.page?.size || 10;

    return pageSize;
  }

  mapFieldToColumns(field) {
    switch (field) {
      case "id":
        return schemas.resources.id;
      case "dataProvider":
        return schemas.resources.dataProvider;
      case "lastUpdate":
        return schemas.resources.lastUpdate;
      case "type":
        return schemas.resources.type;
      case "namespace":
        return schemas.categories.namespace;
      case "endDate":
        return schemas.events.endDate;
      case "inPersonCapacity":
        return schemas.events.inPersonCapacity;
      case "onlineCapacity":
        return schemas.events.onlineCapacity;
      case "recorded":
        return schemas.events.recorded;
      case "startDate":
        return schemas.events.startDate;
      case "status":
        return schemas.events.status;
      case "frequency":
        return schemas.eventSeries.frequency;
      case "namespace":
        return schemas.features.namespace;
      case "namespace":
        return schemas.features.namespace;
      case "capacity":
        return schemas.lifts.capacity;
      case "personsPerChair":
        return schemas.lifts.personsPerChair;
      case "contentType":
        return schemas.mediaObjects.contentType;
      case "duration":
        return schemas.mediaObjects.duration;
      case "height":
        return schemas.mediaObjects.height;
      case "license":
        return schemas.mediaObjects.license;
      case "width":
        return schemas.mediaObjects.width;
      case "area":
        return schemas.mountainAreas.area;
      case "totalParkArea":
        return schemas.mountainAreas.totalParkArea;
      case "totalSlopeLength":
        return schemas.mountainAreas.totalSlopeLength;
      case "difficulty":
        return schemas.snowparks.difficulty;
      case "length":
        return schemas.places.length;
      case "maxAltitude":
        return schemas.places.maxAltitude;
      case "minAltitude":
        return schemas.places.minAltitude;
      /* ------------ */
      case "difficulty.eu":
        return schemas.skiSlopes.difficultyEu;
      case "difficulty.us":
        return schemas.skiSlopes.difficultyUs;
      // case "children":
      // TODO: add 'children_array' view
      // case "parents":
      // TODO: add 'parents_array' view
      // case "contributors":
      // TODO: add 'contributors_array' view
      // case "organizers":
      // TODO: add 'organizers_array' view
      // case "sponsors":
      // TODO: add 'sponsors_array' view
      // case "subEvents":
      // TODO: add 'subEvents_array' view
      // case "venues":
      // TODO: add 'venues_array' view
      // case "editions":
      // TODO: add 'editions_array' view
      case "categories":
        return views.categoriesArrays._name;
      case "multimediaDescriptions":
        return views.multimediaDescriptionsArrays._name;
      case "publisher":
        return schemas.events.publisherId;
      case "series":
        return schemas.events.seriesId;
      case "connections":
        return views.connectionsArrays._name;
      case "licenseHolder":
        return schemas.mediaObjects.licenseHolderId;
      case "areaOwner":
        return schemas.mountainAreas.areaOwnerId;
      case "lifts":
        return views.areaLiftsArrays._name;
      case "skiSlopes":
        return views.areaSkiSlopesArrays._name;
      case "snowparks":
        return views.areaSnowparksArrays._name;
      case "subAreas":
        return views.subAreasArrays._name;
    }

    return null;
  }

  getOrderBy() {
    return _.isEmpty(this.request?.query?.sort)
      ? []
      : this.request?.query?.sort?.split(",")?.map((field) => {
          const desc = field?.startsWith("-");
          field = field.replace("-", "");
          const column = this.mapFieldToColumns(field);
          return `${column}${desc ? " DESC" : ""}`;
        });
  }

  getFilters() {
    if (_.isEmpty(this.request?.query?.filter)) return [];

    return Object.entries(this.request?.query?.filter)
      ?.map(([field, filtersAndValues]) => {
        const column = this.mapFieldToColumns(field);

        return this.mapFilterAndValue(filtersAndValues)
          .map((filterAndValue) => [column, filterAndValue].join(" "))
          .flat();
      })
      .flat();
  }

  mapFilterAndValue(filtersAndValues) {
    if (_.isEmpty(filtersAndValues) || !_.isObject(filtersAndValues))
      return null;

    return Object.entries(filtersAndValues)?.map(([operation, value]) => {
      if (operation === "exists")
        return value === "true" ? "IS NOT NULL" : "IS NULL";
      if (operation === "eq") return `= '${value}'`;
      if (operation === "neq") return `!= '${value}'`;
      if (operation === "gt") return `> '${value}'`;
      if (operation === "gte") return `>= '${value}'`;
      if (operation === "lt") return `< '${value}'`;
      if (operation === "lte") return `<= '${value}'`;
    });
  }
}

module.exports = { ResourceConnector };
