const _ = require("lodash");
const dbFn = require("../db/functions");
const { schemas } = require("../db");
const { ResourceConnector } = require("./resource_connector");
const { SkiSlope } = require("../model/destinationdata2022/ski_slope");
const { DestinationDataError } = require("../errors");

class SkiSlopeConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(skiSlope) {
    return this.runTransaction(() =>
      this.insertSkiSlope(skiSlope).then(() =>
        this.retrieveSkiSlope(skiSlope.id)
      )
    );
  }

  retrieve(id) {
    const skiSlopeId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveSkiSlope(skiSlopeId));
  }

  retrieveResourceSkiSlopeConnections(resource) {
    const skiSlopesIds = resource?.connections?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveSkiSlope(skiSlopesIds));
  }

  retrieveMountainAreaSkiSlopes(mountainArea) {
    const skiSlopesIds = mountainArea?.skiSlopes?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveSkiSlope(skiSlopesIds));
  }

  update(skiSlope) {
    if (!skiSlope.id) throw new Error("missing id");

    return this.runTransaction(() =>
      this.retrieveSkiSlope(skiSlope.id).then((oldSkiSlope) =>
        this.updateSkiSlope(oldSkiSlope, skiSlope)
      )
    );
  }

  delete(id) {
    const skiSlopeId = id ?? this.request?.params?.id;
    return this.runTransaction(() => this.deleteSkiSlope(skiSlopeId));
  }

  deleteSkiSlope(id) {
    return this.deleteResource(id, "skiSlopes");
  }

  retrieveSkiSlope(id) {
    const offset = !_.isString(id) ? this.getOffset() : null;
    const limit = !_.isString(id) ? this.getLimit() : null;
    const orderBy = !_.isString(id) ? this.getOrderBy() : null;

    return dbFn
      .selectSkiSlopeFromId(this.connection, id, offset, limit, orderBy)
      .then((rows) => {
        if (_.isString(id)) {
          if (_.size(rows) === 1) {
            return this.mapRowToSkiSlope(_.first(rows));
          }
          DestinationDataError.throwNotFound(
            `Ski Slope resource(s) not found. ID(s): ${id}`
          );
        } else {
          return rows?.map(this.mapRowToSkiSlope);
        }
      });
  }

  updateSkiSlope(oldSkiSlope, newInput) {
    const newSkiSlope = _.create(oldSkiSlope);

    this.ignoreNonListedFields(newInput, newSkiSlope);

    if (this.shouldUpdate(oldSkiSlope, newSkiSlope)) {
      return Promise.all([this.updateResource(newSkiSlope)])
        .then((promises) => {
          newSkiSlope.lastUpdate = _.first(_.flatten(promises))[
            schemas.resources.lastUpdate
          ];
          return this.updatePlace(newSkiSlope);
        })
        .then(() => newSkiSlope);
    }

    this.throwNoUpdate(oldSkiSlope);
  }

  mapRowToSkiSlope(row) {
    const skiSlope = new SkiSlope();
    _.assign(skiSlope, row);
    return skiSlope;
  }

  insertSkiSlope(skiSlope) {
    return this.insertResource(skiSlope)
      .then(() => {
        const columns = this.mapSkiSlopeToColumns(skiSlope);
        return dbFn.insertSkiSlope(this.connection, columns);
      })
      .then(() => this.insertPlace(skiSlope))
      .then(() => skiSlope.id);
  }

  mapSkiSlopeToColumns(skiSlope) {
    return {
      [schemas.skiSlopes.id]: skiSlope?.id,
      [schemas.skiSlopes.difficultyEu]: skiSlope?.difficulty?.eu,
      [schemas.skiSlopes.difficultyUs]: skiSlope?.difficulty?.us,
    };
  }
}

module.exports = { SkiSlopeConnector };
