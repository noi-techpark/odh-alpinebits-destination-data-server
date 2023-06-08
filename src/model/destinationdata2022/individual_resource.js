// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: MPL-2.0

const _ = require("lodash");
const { Resource } = require("./resource");

class IndividualResource extends Resource {
  constructor() {
    super();

    this.categories = undefined;
    this.multimediaDescriptions = undefined;
  }

  addCategoryReference(categoryId) {
    const reference = {
      type: "categories",
      id: categoryId,
    };

    this.categories = this.categories?.push(reference) ?? [reference];
  }
}

module.exports = {
  IndividualResource,
};
