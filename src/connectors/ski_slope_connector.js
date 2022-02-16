const _ = require("lodash");
const dbFn = require("../db/functions");
const { schemas } = require("../db");
const { ResourceConnector } = require("./resource_connector");
const { SkiSlope } = require("../model/destinationdata2022/ski_slope");

class SkiSlopeConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(skiSlope) {
    return this.runTransaction(() => this.insertSkiSlope(skiSlope).then(() => this.retrieveSkiSlope(skiSlope.id)));
  }

  retrieve(id) {
    const skiSlopeId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveSkiSlope(skiSlopeId));
  }

  update(skiSlope) {
    if (!skiSlope.id) throw new Error("missing id");

    return this.runTransaction(() =>
      this.retrieveSkiSlope(skiSlope.id).then((oldSkiSlope) => this.updateSkiSlope(oldSkiSlope, skiSlope))
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
    return dbFn.selectSkiSlopeFromId(this.connection, id).then((rows) => {
      if (_.isString(id)) {
        if (_.size(rows) === 1) {
          return this.mapRowToSkiSlope(_.first(rows));
        }
        throw new Error("Not found");
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
          newSkiSlope.lastUpdate = _.first(_.flatten(promises))[schemas.resources.lastUpdate];
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
