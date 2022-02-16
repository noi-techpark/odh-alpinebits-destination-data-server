const _ = require("lodash");
const dbFn = require("../../db/functions");
const { schemas } = require("../../db");
const { ResourceConnector } = require("./resource_connector");
const { Lift } = require("../../model/destinationdata2022/lift");

class LiftConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(lift) {
    return this.runTransaction(() => this.insertLift(lift).then(() => this.retrieveLift(lift.id)));
  }

  retrieve(id) {
    const liftId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveLift(liftId));
  }

  update(lift) {
    if (!lift.id) throw new Error("missing id");

    return this.runTransaction(() => this.retrieveLift(lift.id).then((oldLift) => this.updateLift(oldLift, lift)));
  }

  delete(id) {
    const liftId = id ?? this.request?.params?.id;
    return this.runTransaction(() => this.deleteLift(liftId));
  }

  deleteLift(id) {
    return this.deleteResource(id, "lifts");
  }

  retrieveLift(id) {
    return dbFn.selectLiftFromId(this.connection, id).then((rows) => {
      if (_.isString(id)) {
        if (_.size(rows) === 1) {
          return this.mapRowToLift(_.first(rows));
        }
        throw new Error("Not found");
      } else {
        return rows?.map(this.mapRowToLift);
      }
    });
  }

  updateLift(oldLift, newInput) {
    const newLift = _.create(oldLift);

    this.ignoreNonListedFields(newInput, newLift);

    if (this.shouldUpdate(oldLift, newLift)) {
      return Promise.all([this.updateResource(newLift)])
        .then((promises) => {
          newLift.lastUpdate = _.first(_.flatten(promises))[schemas.resources.lastUpdate];
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
