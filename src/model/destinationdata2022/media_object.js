const { Resource } = require("./resource");

class MediaObject extends Resource {
  constructor() {
    super();

    this.contentType = undefined;
    this.duration = undefined;
    this.height = undefined;
    this.license = undefined;
    this.width = undefined;

    this.categories = undefined;
    this.copyrightOwner = undefined;
  }
}

module.exports = {
  MediaObject,
};
