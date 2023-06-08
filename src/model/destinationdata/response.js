// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const _ = require("lodash");

class DestinationDataResponse {
  constructor(base) {
    base = base || {};

    this.jsonapi = base.jsonapi || { version: "1.0" };

    this.meta = base.meta || {}; // guarantees that meta appears early when present

    this.links = base.links || {
      self: null,
    };

    this.data = base.data || null;

    this.included = base.included || [];

    /** A string of comma-separated relationships to include to the collection */
    this._include = null;
    /** An key-value map of selected fields where the keys are resource types and the values are each an string of comma-separated field names to present in the collection */
    this._fields = {};
  }

  static getIncluded(response) {
    if (typeof response._include !== "string") {
      return [];
    }

    const relationshipNames = response._include.split(",");
    const included = {};
    const include = [];
    const data = Array.isArray(response.data) ? [...response.data] : [response.data];
    let targets = [];

    // extract [ 'relationship name', 'relationship' ] arrays that should be included
    for (const resource of data) {
      const relationships = resource.relationships || {};

      // TODO: improve this loop
      targets.push(
        ...Object.entries(relationships).flatMap(([name, relationship]) => {
          if (relationshipNames.includes(name)) {
            return Array.isArray(relationship) ? relationship : [relationship];
          } else {
            return [null];
          }
        })
      );
    }

    // removes null arrays and duplicates
    targets.forEach((target) => {
      if (target) {
        included[target.type] = included[target.type] || {};

        if (!included[target.type][target.id]) {
          included[target.type][target.id] = target;
          include.push(target);
        }
      }
    });

    return include;
  }

  static exclusiveSelectAttributes(resource, attributes) {
    Object.keys(resource.attributes).forEach((attribute) => {
      if (!attributes.includes(attribute)) {
        delete resource.attributes[attribute];
        resource.attributes[attribute] = undefined;
      }
    });
  }

  static exclusiveSelectRelationships(resource, relationships) {
    Object.keys(resource.relationships).forEach((relationship) => {
      if (!relationships.includes(relationship)) {
        delete resource.relationships[relationship];
        resource.relationships[relationship] = undefined;
      }
    });
  }

  static exclusiveSelectFields(resource, fields) {
    DestinationDataResponse.exclusiveSelectAttributes(resource, fields);
    DestinationDataResponse.exclusiveSelectRelationships(resource, fields);
  }

  static performFieldSelection(response) {
    if (_.isEmpty(response._fields)) {
      return;
    }

    const { _fields } = response;
    const resources = Array.isArray(response.data) ? [...response.data] : [response.data];

    if (Array.isArray(response.included)) {
      resources.push(...response.included);
    }

    resources
      .filter((resource) => !!resource)
      .forEach((resource) => {
        const { type } = resource;

        if (_fields[type]) {
          resource._fields = typeof _fields[type] === "string" ? _fields[type].split(",") : _fields[type];
          // console.log(`pass ${_fields[type]} to `, resource);
          // const fields = typeof _fields[type] === "string" ? _fields[type].split(",") : _fields[type];
          // DestinationDataResponse.exclusiveSelectFields(resource, fields);
        }
      });
  }

  toJSON() {
    const copy = Object.assign({}, this);

    copy.included = DestinationDataResponse.getIncluded(copy);

    // creates copies of the arrays "data" and "included" to avoid altering them in the next steps
    copy.data = Array.isArray(copy.data) ? [...copy.data.map((resource) => resource)] : copy.data;
    if (!_.isEmpty(copy.included)) {
      copy.included = [...copy.included.map((resource) => resource)];
    }

    // field selection must be performed after serializing data and included resources to avoid altering resources elsewhere (e.g., categories)
    DestinationDataResponse.performFieldSelection(copy);

    if (_.isEmpty(copy.meta) || Object.values(copy.meta).every((meta) => !meta)) delete copy.meta;
    if (_.isEmpty(copy.included) && !copy._include) delete copy.included;

    delete copy._include;
    delete copy._fields;

    return copy;
  }
}

module.exports = {
  DestinationDataResponse,
};
