const { Resource } = require("./resource");

class MediaObject extends Resource {
  constructor() {
    super();

    this.contentType = null;
    this.duration = null;
    this.height = null;
    this.license = null;
    this.width = null;

    this.categories = null;
    this.copyrightOwner = null;
  }
}

module.exports = {
  MediaObject,
};
