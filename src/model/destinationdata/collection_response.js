const { DestinationDataResponse } = require("./response");

class CollectionResponse extends DestinationDataResponse {
  constructor(base) {
    super(base);

    base = base || {};

    this.meta = base.meta || {
      count: null,
      pages: null,
    };

    this.data = base.data || [];
  }
}

module.exports = {
  CollectionResponse,
};
