const _ = require("lodash");
const dbFn = require("../db/functions");
const { schemas } = require("../db");
const { ResourceConnector } = require("./resource_connector");
const { Lift } = require("../model/destinationdata2022/lift");
const { DestinationDataError } = require("../errors");

class LiftConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(lift) {
    return this.runTransaction(() =>
      this.insertLift(lift).then(() => this.retrieveLift(lift.id))
    );
  }

  retrieve(id) {
    const liftId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveLift(liftId));
  }

  retrieveResourceLiftConnections(resource) {
    const liftsIds = resource?.connections?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveLift(liftsIds));
  }

  retrieveMountainAreaLifts(mountainArea) {
    const liftsIds = mountainArea?.lifts?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveLift(liftsIds));
  }

  update(lift) {
    if (!lift.id) throw new Error("missing id");

    return this.runTransaction(() =>
      this.retrieveLift(lift.id).then((oldLift) =>
        this.updateLift(oldLift, lift)
      )
    );
  }

  delete(id) {
    const liftId = id ?? this.request?.params?.id;
    return this.runTransaction(() => this.deleteLift(liftId));
  }

  deleteLift(id) {
    return this.deleteResource(id, "lifts");
  }

  retrieveLift(id) {
    const offset = !_.isString(id) ? this.getOffset() : null;
    const limit = !_.isString(id) ? this.getLimit() : null;
    const orderBy = !_.isString(id) ? this.getOrderBy() : null;
    const filters = !_.isString(id)
      ? [...this.getFilters(), ...this.getSearch()]
      : null;

    return dbFn
      .selectLiftFromId(this.connection, id, offset, limit, orderBy, filters)
      .then((rows) => {
        if (_.isString(id)) {
          if (_.size(rows) === 1) {
            return this.mapRowToLift(_.first(rows));
          }
          DestinationDataError.throwNotFound(
            `Lift resource(s) not found. ID(s): ${id}`
          );
        } else {
          return rows?.map(this.mapRowToLift);
        }
      });
  }

  updateLift(oldLift, newInput) {
    const newLift = _.create(oldLift);

    this.ignoreNonListedFields(newInput, newLift);

    if (this.shouldUpdate(oldLift, newLift)) {
      const columns = this.mapLiftToColumns(newLift);

      return dbFn
        .updateLift(this.connection, columns)
        .then((ret) => {
          newLift.id = _.first(ret)?.id;
          return Promise.all([this.updateResource(newLift)]);
        })
        .then((promises) => {
          newLift.lastUpdate = _.first(_.flatten(promises))[
            schemas.resources.lastUpdate
          ];
          return this.updatePlace(newLift);
        })
        .then(() => newLift);
    }

    this.throwNoUpdate(oldLift);
  }

  mapRowToLift(row) {
    const lift = new Lift();
    _.assign(lift, row);
    return lift;
  }

  insertLift(lift) {
    return this.insertResource(lift)
      .then(() => {
        const columns = this.mapLiftToColumns(lift);
        return dbFn.insertLift(this.connection, columns);
      })
      .then(() => this.insertPlace(lift))
      .then(() => lift.id);
  }

  mapLiftToColumns(lift) {
    return {
      [schemas.lifts.id]: lift?.id,
      [schemas.lifts.capacity]: lift?.capacity,
      [schemas.lifts.personsPerChair]: lift?.personsPerChair,
    };
  }
}

module.exports = { LiftConnector };
