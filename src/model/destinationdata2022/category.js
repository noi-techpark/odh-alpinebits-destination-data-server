// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const { Resource } = require("./resource");

class Category extends Resource {
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
  Category,
};
