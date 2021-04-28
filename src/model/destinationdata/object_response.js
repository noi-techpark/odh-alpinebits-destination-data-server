const { DestinationDataResponse } = require("./response");

class ObjectResponse extends DestinationDataResponse {
  constructor(base) {
    super(base);

    base = base || {};

    this.data = base.data || [];
  }
}

module.exports = {
  ObjectResponse,
};
