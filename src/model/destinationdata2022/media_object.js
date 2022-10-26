const { Resource } = require("./resource");

class MediaObject extends Resource {
  constructor() {
    super();

    this.author = undefined;
    this.contentType = undefined;
    this.duration = undefined;
    this.height = undefined;
    this.license = undefined;
    this.width = undefined;

    this.categories = undefined;
    this.licenseHolder = undefined;
  }
}

module.exports = {
  MediaObject,
};
