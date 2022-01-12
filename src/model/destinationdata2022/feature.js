const { Resource } = require("./resource");

class Feature extends Resource {
  constructor() {
    super();

    this.namespace = null;
    this.resourceTypes = null;

    this.children = null;
    this.multimediaDescriptions = null;
    this.parents = null;
  }
}

module.exports = {
  Feature,
};
