const _ = require("lodash");
const dbFn = require("../db/functions");
const { schemas } = require("../db");
const { ResourceConnector } = require("./resource_connector");
const { Snowpark } = require("../model/destinationdata2022/snowpark");
const { DestinationDataError } = require("../errors");

class SnowparkConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(snowpark) {
    return this.runTransaction(() =>
      this.insertSnowpark(snowpark).then(() =>
        this.retrieveSnowpark(snowpark.id)
      )
    );
  }

  retrieve(id) {
    const snowparkId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveSnowpark(snowparkId));
  }

  retrieveResourceSnowparkConnections(resource) {
    const snowparksIds = resource?.connections?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveSnowpark(snowparksIds));
  }

  retrieveMountainAreaSnowparks(mountainArea) {
    const snowparksIds = mountainArea?.snowparks?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveSnowpark(snowparksIds));
  }

  update(snowpark) {
    if (!snowpark.id) throw new Error("missing id");

    return this.runTransaction(() =>
      this.retrieveSnowpark(snowpark.id).then((oldSnowpark) =>
        this.updateSnowpark(oldSnowpark, snowpark)
      )
    );
  }

  delete(id) {
    const snowparkId = id ?? this.request?.params?.id;
    return this.runTransaction(() => this.deleteSnowpark(snowparkId));
  }

  deleteSnowpark(id) {
    return this.deleteResource(id, "snowparks");
  }

  retrieveSnowpark(id) {
    const offset = !_.isString(id) ? this.getOffset() : null;
    const limit = !_.isString(id) ? this.getLimit() : null;
    const orderBy = !_.isString(id) ? this.getOrderBy() : null;
    const filters = !_.isString(id)
      ? [...this.getFilters(), ...this.getSearch()]
      : null;

    return dbFn
      .selectSnowparkFromId(
        this.connection,
        id,
        offset,
        limit,
        orderBy,
        filters
      )
      .then((rows) => {
        if (_.isString(id)) {
          if (_.size(rows) === 1) {
            return this.mapRowToSnowpark(_.first(rows));
          }
          DestinationDataError.throwNotFound(
            `Snowpark resource(s) not found. ID(s): ${id}`
          );
        } else {
          return rows?.map(this.mapRowToSnowpark);
        }
      });
  }

  updateSnowpark(oldSnowpark, newInput) {
    const newSnowpark = _.create(oldSnowpark);

    this.ignoreNonListedFields(newInput, newSnowpark);

    if (this.shouldUpdate(oldSnowpark, newSnowpark)) {
      const columns = this.mapSnowparkToColumns(newSnowpark);

      return dbFn
        .updateSnowpark(this.connection, columns)
        .then((ret) => {
          newSnowpark.id = _.first(ret)?.id;
          return Promise.all([this.updateResource(newSnowpark)]);
        })
        .then((promises) => {
          newSnowpark.lastUpdate = _.first(_.flatten(promises))[
            schemas.resources.lastUpdate
          ];
          return Promise.all([
            this.updatePlace(newSnowpark),
            this.updateSnowparkFeatures(newSnowpark),
          ]);
        })
        .then(() => newSnowpark);
    }

    this.throwNoUpdate(oldSnowpark);
  }

  mapRowToSnowpark(row) {
    const snowpark = new Snowpark();
    _.assign(snowpark, row);
    return snowpark;
  }

  insertSnowpark(snowpark) {
    return this.insertResource(snowpark)
      .then(() => {
        const columns = this.mapSnowparkToColumns(snowpark);
        return dbFn.insertSnowpark(this.connection, columns);
      })
      .then(() =>
        Promise.all([
          this.insertPlace(snowpark),
          this.insertSnowparkFeatures(snowpark),
        ])
      )
      .then(() => snowpark.id);
  }

  insertSnowparkFeatures(snowpark) {
    const inserts = snowpark?.features?.map((feature) =>
      dbFn.insertResourceFeature(this.connection, snowpark.id, feature.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateSnowparkFeatures(resource) {
    return dbFn
      .deleteResourceFeature(this.connection, resource.id)
      .then(() => this.insertSnowparkFeatures(resource));
  }

  mapSnowparkToColumns(snowpark) {
    return {
      [schemas.snowparks.id]: snowpark?.id,
      [schemas.snowparks.difficulty]: snowpark?.difficulty,
    };
  }
}

module.exports = { SnowparkConnector };
