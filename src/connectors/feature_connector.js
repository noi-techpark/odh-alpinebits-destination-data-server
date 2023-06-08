// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const _ = require("lodash");
const dbFn = require("../db/functions");
const { ResourceConnector } = require("./resource_connector");
const { Feature } = require("../model/destinationdata2022/feature");

const { schemas } = require("../db");
const { DestinationDataError } = require("../errors");
const { abstracts, descriptions, names, shortNames, urls } = schemas;

class FeatureConnector extends ResourceConnector {
  constructor(request) {
    super(request);
  }

  create(feature) {
    return this.runTransaction(() =>
      this.insertFeature(feature).then(() => this.retrieveFeature(feature.id))
    );
  }

  retrieve(id) {
    const featureId = id ?? this?.request?.params?.id;
    return this.runTransaction(() => this.retrieveFeature(featureId));
  }

  retrieveResourceFeatures(resource) {
    const featuresIds = resource?.features?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveFeature(featuresIds));
  }

  retrieveFeatureChildren(resource) {
    const childrenIds = resource?.children?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveFeature(childrenIds));
  }

  retrieveFeatureParents(resource) {
    const parentsIds = resource?.parents?.map((ref) => ref.id) ?? [];
    return this.runTransaction(() => this.retrieveFeature(parentsIds));
  }

  update(feature) {
    return this.runTransaction(() =>
      this.retrieveFeature(feature.id).then((oldFeature) =>
        this.updateFeature(oldFeature, feature)
      )
    );
  }

  delete(id) {
    const featureId = id ?? this.request?.params?.id;
    return this.runTransaction(() => this.deleteFeature(featureId));
  }

  retrieveFeature(id) {
    const offset = !_.isString(id) ? this.getOffset() : null;
    const limit = !_.isString(id) ? this.getLimit() : null;
    const orderBy = !_.isString(id) ? this.getOrderBy() : null;
    const filters = !_.isString(id)
      ? [...this.getFilters(), ...this.getSearch()]
      : null;

    return dbFn
      .selectFeatureFromId(this.connection, id, offset, limit, orderBy, filters)
      .then((rows) => {
        if (_.isString(id)) {
          if (_.size(rows) === 1) {
            return this.mapRowToFeature(_.first(rows));
          }
          DestinationDataError.throwNotFound(
            `Feature resource(s) not found. ID(s): ${id}`
          );
        } else {
          return rows?.map(this.mapRowToFeature);
        }
      });
  }

  updateFeature(oldFeature, newInput) {
    const newFeature = _.create(oldFeature);

    _.entries(newInput).forEach(([k, v]) => {
      if (!_.isUndefined(v)) newFeature[k] = v;
    });

    if (this.shouldUpdate(oldFeature, newFeature)) {
      const columns = this.mapFeatureToColumns(newFeature);

      return dbFn
        .updateFeature(this.connection, columns)
        .then((ret) => {
          newFeature.id = _.first(ret)?.id;
          return Promise.all([
            this.updateResource(newFeature),
            this.updateFeatureCoveredTypes(newFeature),
            this.updateChildrenFeatures(newFeature),
            this.updateParentFeatures(newFeature),
          ]);
        })
        .then(() => newFeature);
    }

    this.throwNoUpdate(oldFeature);
  }

  deleteFeature(id) {
    return dbFn.deleteFeature(this.connection, id);
  }

  insertFeature(feature) {
    return this.insertResource(feature)
      .then((resourceId) => {
        const columns = this.mapFeatureToColumns(feature, resourceId);
        return dbFn.insertFeature(this.connection, columns);
      })
      .then(() =>
        Promise.all([
          this.insertFeatureCoveredTypes(feature),
          this.insertChildrenFeatures(feature),
          this.insertParentFeatures(feature),
        ])
      );
  }

  insertMultimediaDescriptions(feature) {
    const inserts = feature?.multimediaDescriptions?.map((description) =>
      dbFn.insertMultimediaDescriptions(
        this.connection,
        feature.id,
        description.id
      )
    );
    return Promise.all(inserts ?? []);
  }

  updateMultimediaDescriptions(feature) {
    return dbFn
      .deleteMultimediaDescriptions(this.connection, feature.id)
      .then(() => this.insertMultimediaDescriptions(feature));
  }

  insertFeatureCoveredTypes(feature) {
    const inserts = feature?.resourceTypes?.map((type) =>
      dbFn.insertFeatureCoveredType(this.connection, type, feature.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateFeatureCoveredTypes(feature) {
    return dbFn
      .deleteFeatureCoveredTypes(this.connection, feature.id)
      .then(() => this.insertFeatureCoveredTypes(feature));
  }

  insertChildrenFeatures(feature) {
    const inserts = feature?.children?.map((child) =>
      dbFn.insertFeatureSpecialization(this.connection, child.id, feature.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateChildrenFeatures(feature) {
    return dbFn
      .deleteChildrenFeatures(this.connection, feature.id)
      .then(() => this.insertChildrenFeatures(feature));
  }

  insertParentFeatures(feature) {
    const inserts = feature?.parents?.map((parent) =>
      dbFn.insertFeatureSpecialization(this.connection, feature.id, parent.id)
    );
    return Promise.all(inserts ?? []);
  }

  updateParentFeatures(feature) {
    return dbFn
      .deleteParentFeature(this.connection, feature.id)
      .then(() => this.insertParentFeatures(feature));
  }

  mapFeatureToColumns(feature) {
    return {
      [schemas.features.id]: feature.id,
      [schemas.features.namespace]: feature.namespace,
    };
  }

  mapRowToFeature(row) {
    const feature = new Feature();
    _.assign(feature, row);
    return feature;
  }
}

module.exports = { FeatureConnector };
