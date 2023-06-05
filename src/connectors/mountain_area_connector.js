// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const _ = require("lodash");
const dbFn = require("../db/functions");
const { schemas } = require("../db");
const { ResourceConnector } = require("./resource_connector");
const { MountainArea } = require("../model/destinationdata2022/mountain_area");
const { DestinationDataError } = require("../errors");

class MountainAreaConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(mountainArea) {
    return this.runTransaction(() =>
      this.insertMountainArea(mountainArea).then(() =>
        this.retrieveMountainArea(mountainArea.id)
      )
    );
  }

  retrieve(id) {
    const mountainAreaId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveMountainArea(mountainAreaId));
  }

  retrieveResourceMountainAreaConnections(resource) {
    const areasIds = resource?.connections?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveMountainArea(areasIds));
  }

  retrieveMountainAreaSubAreas(mountainArea) {
    const subAreasIds = mountainArea?.subAreas?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveMountainArea(subAreasIds));
  }

  update(mountainArea) {
    if (!mountainArea.id) throw new Error("missing id");

    return this.runTransaction(() =>
      this.retrieveMountainArea(mountainArea.id).then((oldMountainArea) =>
        this.updateMountainArea(oldMountainArea, mountainArea)
      )
    );
  }

  delete(id) {
    const mountainAreaId = id ?? this.request?.params?.id;
    return this.runTransaction(() => this.deleteMountainArea(mountainAreaId));
  }

  deleteMountainArea(id) {
    return this.deleteResource(id, "mountainAreas");
  }

  retrieveMountainArea(id) {
    const offset = !_.isString(id) ? this.getOffset() : null;
    const limit = !_.isString(id) ? this.getLimit() : null;
    const orderBy = !_.isString(id) ? this.getOrderBy() : null;
    const filters = !_.isString(id)
      ? [...this.getFilters(), ...this.getSearch()]
      : null;

    return dbFn
      .selectMountainAreaFromId(
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
            return this.mapRowToMountainArea(_.first(rows));
          }
          DestinationDataError.throwNotFound(
            `Mountain Area resource(s) not found. ID(s): ${id}`
          );
        } else {
          return rows?.map(this.mapRowToMountainArea);
        }
      });
  }

  updateMountainArea(oldMountainArea, newInput) {
    const newMountainArea = _.create(oldMountainArea);

    this.ignoreNonListedFields(newInput, newMountainArea);

    // TODO: recover new "lastUpdate" value
    if (this.shouldUpdate(oldMountainArea, newMountainArea)) {
      return Promise.all([this.updateResource(newMountainArea)])
        .then((promises) => {
          newMountainArea.lastUpdate = _.first(_.flatten(promises))[
            schemas.resources.lastUpdate
          ];
          return this.updatePlace(newMountainArea);
        })
        .then(() => newMountainArea);
    }

    this.throwNoUpdate(oldMountainArea);
  }

  mapRowToMountainArea(row) {
    const mountainArea = new MountainArea();
    _.assign(mountainArea, row);
    return mountainArea;
  }

  insertMountainArea(mountainArea) {
    return this.insertResource(mountainArea)
      .then(() => {
        const columns = this.mapMountainAreaToColumns(mountainArea);
        return dbFn.insertMountainArea(this.connection, columns);
      })
      .then(() =>
        Promise.all([
          this.insertPlace(mountainArea),
          this.insertAreaLifts(mountainArea),
          this.insertAreaSkiSlopes(mountainArea),
          this.insertAreaSnowparks(mountainArea),
          this.insertSubAreas(mountainArea),
        ])
      )
      .then(() => mountainArea.id);
  }

  insertAreaLifts(mountainArea) {
    const inserts = mountainArea?.lifts?.map((lift) =>
      dbFn.insertAreaLift(this.connection, mountainArea.id, lift.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateAreaLifts(mountainArea) {
    return dbFn
      .deleteAreaLifts(this.connection, mountainArea.id)
      .then(() => this.insertAreaLifts(mountainArea));
  }

  insertAreaSkiSlopes(mountainArea) {
    const inserts = mountainArea?.skiSlopes?.map((skiSlope) =>
      dbFn.insertAreaSkiSlope(this.connection, mountainArea.id, skiSlope.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateAreaSkiSlopes(mountainArea) {
    return dbFn
      .deleteAreaSkiSlopes(this.connection, mountainArea.id)
      .then(() => this.insertAreaSkiSlopes(mountainArea));
  }

  insertAreaSnowparks(mountainArea) {
    const inserts = mountainArea?.snowparks?.map((snowpark) =>
      dbFn.insertAreaSnowpark(this.connection, mountainArea.id, snowpark.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateAreaSnowparks(mountainArea) {
    return dbFn
      .deleteAreaSnowparks(this.connection, mountainArea.id)
      .then(() => this.insertAreaSnowparks(mountainArea));
  }

  insertSubAreas(mountainArea) {
    const inserts = mountainArea?.subAreas?.map((subArea) =>
      dbFn.insertSubArea(this.connection, mountainArea.id, subArea.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateSubAreas(mountainArea) {
    return dbFn
      .deleteSubAreas(this.connection, mountainArea.id)
      .then(() => this.insertSubAreas(mountainArea));
  }

  mapMountainAreaToColumns(mountainArea) {
    return {
      [schemas.mountainAreas.id]: mountainArea?.id,
      [schemas.mountainAreas.area]: mountainArea?.area,
      [schemas.mountainAreas.areaOwnerId]: mountainArea?.areaOwner?.id,
      [schemas.mountainAreas.totalParkLength]: mountainArea?.totalParkLength,
      [schemas.mountainAreas.totalSlopeLength]: mountainArea?.totalSlopeLength,
    };
  }
}

module.exports = { MountainAreaConnector };
