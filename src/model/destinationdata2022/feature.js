// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const { Resource } = require("./resource");

class Feature extends Resource {
  constructor() {
    super();

    this.namespace = undefined;
    this.resourceTypes = undefined;

    this.children = undefined;
    this.multimediaDescriptions = undefined;
    this.parents = undefined;
  }
}

module.exports = {
  Feature,
};
