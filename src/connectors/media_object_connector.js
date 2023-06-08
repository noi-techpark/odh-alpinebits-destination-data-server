// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const _ = require("lodash");
const dbFn = require("../db/functions");
const { ResourceConnector } = require("./resource_connector");
const { MediaObject } = require("../model/destinationdata2022/media_object");
const { schemas } = require("../db");
const { DestinationDataError } = require("../errors");
const { mediaObjects } = schemas;

class MediaObjectConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(mediaObject) {
    return this.runTransaction(() =>
      this.insertMediaObject(mediaObject).then(() =>
        this.retrieveMediaObject(mediaObject.id)
      )
    );
  }

  retrieve(id) {
    const mediaObjectId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveMediaObject(mediaObjectId));
  }

  retrieveResourceMultimediaDescriptions(resource) {
    const mediaObjectsIds =
      resource?.multimediaDescriptions?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveMediaObject(mediaObjectsIds));
  }

  update(mediaObject) {
    if (!mediaObject.id) throw new Error("missing id");

    return this.runTransaction(() =>
      this.retrieveMediaObject(mediaObject.id).then((oldMediaObject) =>
        this.updateMediaObject(oldMediaObject, mediaObject)
      )
    );
  }

  delete(id) {
    const mediaObjectId = id ?? this.request?.params?.id;
    return this.runTransaction(() => this.deleteMediaObject(mediaObjectId));
  }

  deleteMediaObject(id) {
    return this.deleteResource(id, "mediaObjects");
  }

  retrieveMediaObject(id) {
    const offset = !_.isString(id) ? this.getOffset() : null;
    const limit = !_.isString(id) ? this.getLimit() : null;
    const orderBy = !_.isString(id) ? this.getOrderBy() : null;
    const filters = !_.isString(id)
      ? [...this.getFilters(), ...this.getSearch()]
      : null;

    return dbFn
      .selectMediaObjectFromId(
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
            return this.mapRowToMediaObject(_.first(rows));
          }
          DestinationDataError.throwNotFound(
            `Media Object resource(s) not found. ID(s): ${id}`
          );
        } else {
          return rows?.map(this.mapRowToMediaObject);
        }
      });
  }

  updateMediaObject(oldMediaObject, newInput) {
    const newMediaObject = _.create(oldMediaObject);

    _.entries(newInput).forEach(([k, v]) => {
      if (!_.isUndefined(v)) newMediaObject[k] = v;
    });

    if (this.shouldUpdate(oldMediaObject, newMediaObject)) {
      return Promise.all([this.updateResource(newMediaObject)]).then(
        (promises) => {
          newMediaObject.lastUpdate = _.first(_.flatten(promises))[
            schemas.resources.lastUpdate
          ];
          return newMediaObject;
        }
      );
    }

    this.throwNoUpdate(oldMediaObject);
  }

  mapRowToMediaObject(row) {
    const mediaObject = new MediaObject();
    _.assign(mediaObject, row);
    return mediaObject;
  }

  insertMediaObject(mediaObject) {
    return this.insertResource(mediaObject)
      .then(() => {
        const columns = this.mapMediaObjectToColumns(mediaObject);
        return dbFn.insertMediaObject(this.connection, columns);
      })
      .then(() => mediaObject.id);
  }

  mapMediaObjectToColumns(mediaObject) {
    return {
      [mediaObjects.id]: mediaObject?.id,
      [mediaObjects.author]: mediaObject?.author,
      [mediaObjects.contentType]: mediaObject?.contentType,
      [mediaObjects.licenseHolderId]: mediaObject?.licenseHolder?.id,
      [mediaObjects.duration]: mediaObject?.duration,
      [mediaObjects.height]: mediaObject?.height,
      [mediaObjects.license]: mediaObject?.license,
      [mediaObjects.width]: mediaObject?.width,
    };
  }
}

module.exports = { MediaObjectConnector };
