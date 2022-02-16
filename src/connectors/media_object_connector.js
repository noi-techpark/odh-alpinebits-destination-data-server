const _ = require("lodash");
const dbFn = require("../db/functions");
const { ResourceConnector } = require("./resource_connector");
const { MediaObject } = require("../model/destinationdata2022/media_object");
const { schemas } = require("../db");
const { mediaObjects } = schemas;

class MediaObjectConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(mediaObject) {
    return this.runTransaction(() =>
      this.insertMediaObject(mediaObject).then(() => this.retrieveMediaObject(mediaObject.id))
    );
  }

  retrieve(id) {
    const mediaObjectId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveMediaObject(mediaObjectId));
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
    return dbFn.selectMediaObjectFromId(this.connection, id).then((rows) => {
      if (_.isString(id)) {
        if (_.size(rows) === 1) {
          return this.mapRowToMediaObject(_.first(rows));
        }
        throw new Error("Not found");
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
      return Promise.all([this.updateResource(newMediaObject)]).then((promises) => {
        newMediaObject.lastUpdate = _.first(_.flatten(promises))[schemas.resources.lastUpdate];
        return newMediaObject;
      });
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
      [mediaObjects.contentType]: mediaObject?.contentType,
      [mediaObjects.copyrightOwnerId]: mediaObject?.copyrightOwner?.id,
      [mediaObjects.duration]: mediaObject?.duration,
      [mediaObjects.height]: mediaObject?.height,
      [mediaObjects.license]: mediaObject?.license,
      [mediaObjects.width]: mediaObject?.width,
    };
  }
}

module.exports = { MediaObjectConnector };
