const _ = require("lodash");
const { Resource } = require("./resource");

class IndividualResource extends Resource {
  constructor() {
    super();

    this.categories = null;
    this.multimediaDescriptions = null;
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
