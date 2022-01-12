const { Resource } = require("./resource");

class IndividualResource extends Resource {
  constructor() {
    super();

    this.categories = null;
    this.multimediaDescriptions = null;
  }
}

module.exports = {
  IndividualResource,
};
